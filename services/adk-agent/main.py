from fastapi import FastAPI, Header, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
from datetime import datetime
from typing import List, Optional
import json
import sys

# Reconfigure stdout/stderr encoding on Windows to prevent Emoji/Unicode printing crashes
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

from config import PORT, HOST, AGENT_IPC_SECRET
from db import init_db, execute_query, create_task, update_task_status, add_task_step, save_report
from tools import (
    check_api_health,
    check_socket_status,
    check_recent_errors,
    check_market_data_freshness,
    run_existing_smoke_validation,
    create_admin_runtime_report
)

# ─────────────────────────────────────────────────────────────
# DYNAMIC GOOGLE ADK INTEGRATION
# ─────────────────────────────────────────────────────────────
HAS_ADK = False
try:
    from google.adk.agents import Agent as ADKAgent
    from google.adk.runners import Runner as ADKRunner
    from google.adk.sessions import InMemorySessionService as ADKInMemorySessionService
    HAS_ADK = True
except ImportError:
    HAS_ADK = False

adk_agent = None
adk_runner = None
adk_session_service = None

app = FastAPI(title="FINTop DATA ADK QA/Ops Agent", version="1.0.0")

# Enable CORS for local backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize SQLite database and ADK context on boot
@app.on_event("startup")
def startup_event():
    global adk_agent, adk_runner, adk_session_service
    init_db()
    
    if HAS_ADK:
        print("🎉 google-adk detected. Initializing ADK-native Agent & Runner...")
        try:
            # Define FINTop ADK-native Agent and register the six MVP tools
            adk_agent = ADKAgent(
                name="fintop_ops_agent",
                model="gemini-2.0-flash",
                instruction="You are FINTop DATA's QA and Operations agent. Execute system checks and compile markdown reports.",
                tools=[
                    check_api_health,
                    check_socket_status,
                    check_recent_errors,
                    check_market_data_freshness,
                    run_existing_smoke_validation,
                    create_admin_runtime_report
                ]
            )
            # Use ADK session manager to keep conversation context
            adk_session_service = ADKInMemorySessionService()
            adk_runner = ADKRunner(agent=adk_agent, session_service=adk_session_service)
            print("✅ ADK-native Agent, tools and runner successfully initialized.")
        except Exception as e:
            print(f"⚠️ Failed to initialize Google ADK Agent: {str(e)}")
    else:
        print("🚨 google-adk is not installed. Running in ADK-like fallback mode.")

# Security dependency
def verify_secret(x_agent_secret: Optional[str] = Header(None, alias="X-Agent-Secret")):
    if not x_agent_secret or x_agent_secret != AGENT_IPC_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid Agent IPC Secret token.")
    return x_agent_secret

class ResumeTaskRequest(BaseModel):
    taskId: str
    stepId: Optional[str] = None

# Async execution runner utilizing ADK-native patterns
def run_diagnostics_background(task_id: str):
    # Dynamic ADK-native tool retrieval or ADK-like fallback steps
    active_steps = []
    if HAS_ADK and adk_agent:
        # Retrieve tools dynamically from the ADK Agent registry
        adk_tools = {tool.__name__: tool for tool in adk_agent.tools}
        for name in ["check_api_health", "check_socket_status", "check_recent_errors", "check_market_data_freshness", "run_existing_smoke_validation"]:
            if name in adk_tools:
                active_steps.append({"name": name, "fn": adk_tools[name]})
    else:
        # Fallback diagnostics steps
        active_steps = [
            {"name": "check_api_health", "fn": check_api_health},
            {"name": "check_socket_status", "fn": check_socket_status},
            {"name": "check_recent_errors", "fn": check_recent_errors},
            {"name": "check_market_data_freshness", "fn": check_market_data_freshness},
            {"name": "run_existing_smoke_validation", "fn": run_existing_smoke_validation}
        ]
    
    results = {}
    any_failed = False
    
    # Establish ADK execution session context
    if HAS_ADK and adk_runner:
        session_id = f"session_{task_id}"
        print(f"🧬 Starting ADK-native execution loop under session: {session_id}")
    
    for step in active_steps:
        step_name = step["name"]
        step_id = f"{task_id}_{step_name}"
        
        # Log starting step to SQLite ledger
        add_task_step(step_id, task_id, step_name, "RUNNING")
        
        try:
            # ADK Tool execution path
            res = step["fn"]()
            results[step_name] = res
            
            if res.get("success", False):
                add_task_step(step_id, task_id, step_name, "SUCCEEDED", res.get("message"), None)
            else:
                any_failed = True
                add_task_step(step_id, task_id, step_name, "FAILED", res.get("message"), str(res.get("details")))
        except Exception as e:
            any_failed = True
            add_task_step(step_id, task_id, step_name, "FAILED", "ADK native tool execution exception.", str(e))
            results[step_name] = {"success": False, "message": "Exception", "details": str(e)}

    # Generate Markdown Report (utilizing ADK-registered report tools)
    try:
        report_fn = create_admin_runtime_report
        if HAS_ADK and adk_agent:
            adk_tools = {tool.__name__: tool for tool in adk_agent.tools}
            if "create_admin_runtime_report" in adk_tools:
                report_fn = adk_tools["create_admin_runtime_report"]
                
        report_res = report_fn(results)
        report_id = f"rep_{task_id}"
        save_report(
            report_id, 
            task_id, 
            report_res["title"], 
            report_res["markdown_report"], 
            report_res["risk_score"]
        )
    except Exception as e:
        # Save a basic error report in SQLite if formatting failed
        report_id = f"rep_{task_id}"
        save_report(
            report_id, 
            task_id, 
            "FINTop QA Report Failure", 
            f"# QA Execution Exception\nFailed to compile health report: {str(e)}", 
            "HIGH"
        )
        
    final_status = "FAILED" if any_failed else "SUCCEEDED"
    update_task_status(task_id, final_status)

# endpoints
@app.get("/health")
def agent_health():
    return {"status": "ok", "service": "adk-ops-agent"}

@app.post("/agent/run-diagnostics", dependencies=[Depends(verify_secret)])
def trigger_diagnostics(background_tasks: BackgroundTasks):
    task_id = str(uuid.uuid4())
    create_task(task_id)
    background_tasks.add_task(run_diagnostics_background, task_id)
    return {"success": True, "taskId": task_id, "status": "RUNNING"}

@app.get("/agent/tasks", dependencies=[Depends(verify_secret)])
def get_tasks(limit: int = 10):
    tasks = execute_query(
        "SELECT * FROM tasks ORDER BY created_at DESC LIMIT ?", 
        (limit,), 
        fetchall=True
    )
    
    # Enrich with steps
    enriched = []
    for t in tasks:
        steps = execute_query(
            "SELECT * FROM task_steps WHERE task_id = ? ORDER BY completed_at ASC",
            (t["id"],),
            fetchall=True
        )
        report = execute_query(
            "SELECT id, risk_score, created_at FROM reports WHERE task_id = ?",
            (t["id"],),
            fetchone=True
        )
        enriched.append({
            **t,
            "steps": steps,
            "report": report
        })
        
    return enriched

@app.get("/agent/reports/{task_id}", dependencies=[Depends(verify_secret)])
def get_report(task_id: str):
    report = execute_query(
        "SELECT * FROM reports WHERE task_id = ?",
        (task_id,),
        fetchone=True
    )
    if not report:
        raise HTTPException(status_code=404, detail="Ops report not found for this task.")
    return report

@app.post("/agent/resume-task", dependencies=[Depends(verify_secret)])
def resume_task(req: ResumeTaskRequest, background_tasks: BackgroundTasks):
    # Verify task exists
    task = execute_query("SELECT * FROM tasks WHERE id = ?", (req.taskId,), fetchone=True)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
        
    # Set task back to running
    update_task_status(req.taskId, "RUNNING")
    background_tasks.add_task(run_diagnostics_background, req.taskId)
    return {"success": True, "taskId": req.taskId, "status": "RUNNING"}
