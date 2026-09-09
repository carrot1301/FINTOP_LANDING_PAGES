import { AgentService } from './agent.service';
export declare class AgentController {
    private readonly agentService;
    constructor(agentService: AgentService);
    runRuntimeCheck(admin: any): Promise<any>;
    resumeTask(taskId: string, admin: any): Promise<any>;
    getTasks(): Promise<any>;
    getReport(taskId: string): Promise<any>;
}
