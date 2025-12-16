
import type { NodeData } from "../../hooks/useWorkflowGraph";

export interface ProcessNode extends NodeData {
    elementName?: string;
    elementId?: string;
    attributes?: Record<string, any>;
}

export interface ProcessExecution {
    id: string;
    name: string;
    status: 'running' | 'completed' | 'failed';
    startTime: string;
    endTime?: string;
    processId: string;
}

export interface Process {
    id: string;
    name: string;
    description: string;
    bpmnXml: string;
    updatedAt: string;
}
