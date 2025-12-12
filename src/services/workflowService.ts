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

export interface ApiWorkflowExecution {
    id: string;
    workflowExecutionId: string;
    workflowId: string;
    nodes: any[]; // We can define this more strictly if needed, but for now 'any' or the structure from JSON is fine
    status: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'PAUSED'; // Adjust status based on API
}

export interface WorkflowExecutionsApiResponse {
    response: {
        time: string;
        status: number;
        message: ApiWorkflowExecution[];
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
};
