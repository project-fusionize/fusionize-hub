export interface ApiWorkflowNode {
    childrenIds: string[];
    type: string;
    workflowNodeId: string;
    workflowNodeKey: string;
    component: string;
    componentConfig: any;
    children: ApiWorkflowNode[];
}

export interface ApiWorkflow {
    userActivities: any[];
    name: string;
    domain: string;
    cover: string | null;
    key: string;
    id: string;
    workflowId: string;
    description: string;
    version: number;
    active: boolean;
    nodeMap: Record<string, ApiWorkflowNode>;
    rootNodeIds: string[];
    nodes: ApiWorkflowNode[];
}

export interface WorkflowApiResponse {
    response: {
        time: string;
        status: number;
        message: ApiWorkflow[];
    };
}

export interface ApiWorkflowExecutionNode {
    id: string; // The unique execution ID for this node instance
    workflowNodeId: string;
    state: string;
    stageContext: any;
    createdDate: string;
    updatedDate: string;
    children: ApiWorkflowExecutionNode[];
}

export interface ApiWorkflowExecution {
    id: string;
    workflowExecutionId: string;
    workflowId: string;
    nodes: ApiWorkflowExecutionNode[];
    status: 'IDLE' | 'IN_PROGRESS' | 'SUCCESS' | 'ERROR' | 'TERMINATED';
    createdDate: string;
    updatedDate: string;
}

export interface WorkflowExecutionsApiResponse {
    response: {
        time: string;
        status: number;
        message: ApiWorkflowExecution[];
    };
}

export interface ApiWorkflowExecutionLog {
    id: string;
    workflowId: string;
    workflowExecutionId: string;
    workflowNodeId: string;
    workflowDomain: string;
    nodeKey: string;
    component: string;
    timestamp: string;
    level: string;
    message: string;
    context: any;
}

export interface WorkflowExecutionLogsApiResponse {
    response: {
        time: string;
        status: number;
        message: ApiWorkflowExecutionLog[];
    };
}

export interface ApiWorkflowInteraction {
    id: string;
    workflowId: string;
    workflowExecutionId: string;
    workflowNodeId: string;
    workflowDomain: string;
    nodeKey: string;
    component: string;
    timestamp: string;
    actor: 'human' | 'ai' | 'system';
    type: 'MESSAGE' | 'THOUGHT' | 'OBSERVATION';
    visibility: string;
    content: string;
    context: any;
}

export interface WorkflowInteractionsApiResponse {
    response: {
        time: string;
        status: number;
        message: ApiWorkflowInteraction[];
    };
}

const API_BASE_URL = 'http://localhost:8081/api/1.0/workflow';

export const workflowService = {
    async fetchWorkflows(token: string): Promise<ApiWorkflow[]> {
        const response = await fetch(API_BASE_URL, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch workflows');
        }

        const data: WorkflowApiResponse = await response.json();
        return data.response.message;
    },

    async fetchWorkflowExecutions(token: string, workflowId: string): Promise<ApiWorkflowExecution[]> {
        const response = await fetch(`${API_BASE_URL}/${workflowId}/executions`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch workflow executions');
        }

        const data: WorkflowExecutionsApiResponse = await response.json();
        return data.response.message;
    },

    async fetchWorkflowExecutionLogs(token: string, workflowId: string, executionId: string): Promise<ApiWorkflowExecutionLog[]> {
        const response = await fetch(`${API_BASE_URL}/${workflowId}/executions/${executionId}/logs`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch workflow execution logs');
        }

        const data: WorkflowExecutionLogsApiResponse = await response.json();
        return data.response.message;
    },

    async fetchWorkflowInteractions(token: string, workflowId: string, executionId: string): Promise<ApiWorkflowInteraction[]> {
        const response = await fetch(`${API_BASE_URL}/${workflowId}/executions/${executionId}/interaction`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch workflow interactions');
        }

        const data: WorkflowInteractionsApiResponse = await response.json();
        return data.response.message;
    },
};
