import { CopilotOrchestratorService } from './copilot-orchestrator.service';
import { ToolRegistryService } from './tool-registry.service';
export declare class CopilotController {
    private readonly orchestrator;
    private readonly toolRegistry;
    constructor(orchestrator: CopilotOrchestratorService, toolRegistry: ToolRegistryService);
    chat(dto: {
        message: string;
        sessionId?: string;
    }, user: any): Promise<import("./copilot-orchestrator.service").CopilotResponse>;
    listTools(): Promise<{
        name: string;
        description: string;
    }[]>;
    clearSession(sessionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
