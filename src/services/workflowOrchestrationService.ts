interface ServiceResponse<T> {
    status: number;
    message: T;
}

interface ServicePayload<T> {
    response: ServiceResponse<T>;
}

import { CONFIG } from '../config';

const API_BASE_URL = `${CONFIG.API_BASE_URL}/api/1.0/workflow-orchestration`;

export const workflowOrchestrationService = {
    async replayWorkflowNodeExecution(
        token: string,
        workflowId: string,
        workflowExecutionId: string,
        workflowNodeExecutionId: string
    ): Promise<string> {
        const response = await fetch(`${API_BASE_URL}/replay/${workflowId}/${workflowExecutionId}/${workflowNodeExecutionId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to replay workflow node execution');
        }

        const data: ServicePayload<string> = await response.json();
        return data.response.message;
    }
};
