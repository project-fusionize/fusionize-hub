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
};
