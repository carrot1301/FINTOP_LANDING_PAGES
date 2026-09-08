import sqlite3
import os
from datetime import datetime
from config import SQLITE_DB_PATH

def init_db():
    # Ensure directory exists
    os.makedirs(os.path.dirname(SQLITE_DB_PATH), exist_ok=True)
    
    conn = sqlite3.connect(SQLITE_DB_PATH)
    cursor = conn.cursor()
    
    # Task table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL,
            completed_at TEXT
        )
    ''')
    
    # Steps table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS task_steps (
            id TEXT PRIMARY KEY,
            task_id TEXT NOT NULL,
            name TEXT NOT NULL,
            status TEXT NOT NULL,
            message TEXT,
            error TEXT,
            completed_at TEXT,
            FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
        )
    ''')
    
    # Reports table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reports (
            id TEXT PRIMARY KEY,
            task_id TEXT NOT NULL,
            title TEXT NOT NULL,
            markdown_report TEXT NOT NULL,
            risk_score TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
        )
    ''')
    
    conn.commit()
    conn.close()

def execute_query(query, params=(), fetchall=False, fetchone=False, commit=False):
    conn = sqlite3.connect(SQLITE_DB_PATH)
    # Enable dict factory for JSON-like rows
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        cursor.execute(query, params)
        if commit:
            conn.commit()
            
        if fetchall:
            return [dict(row) for row in cursor.fetchall()]
        if fetchone:
            row = cursor.fetchone()
            return dict(row) if row else None
            
        return cursor.lastrowid
    finally:
        conn.close()

# Helper DB actions
def create_task(task_id: str):
    execute_query(
        "INSERT INTO tasks (id, status, created_at) VALUES (?, ?, ?)",
        (task_id, "RUNNING", datetime.utcnow().isoformat()),
        commit=True
    )

def update_task_status(task_id: str, status: str):
    now = datetime.utcnow().isoformat() if status in ["SUCCEEDED", "FAILED"] else None
    if now:
        execute_query(
            "UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?",
            (status, now, task_id),
            commit=True
        )
    else:
        execute_query(
            "UPDATE tasks SET status = ? WHERE id = ?",
            (status, task_id),
            commit=True
        )

def add_task_step(step_id: str, task_id: str, name: str, status: str, message: str = None, error: str = None):
    execute_query(
        """
        INSERT OR REPLACE INTO task_steps (id, task_id, name, status, message, error, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (step_id, task_id, name, status, message, error, datetime.utcnow().isoformat()),
        commit=True
    )

def save_report(report_id: str, task_id: str, title: str, markdown: str, risk: str):
    execute_query(
        """
        INSERT INTO reports (id, task_id, title, markdown_report, risk_score, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (report_id, task_id, title, markdown, risk, datetime.utcnow().isoformat()),
        commit=True
    )
