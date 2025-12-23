
import type { AgentRole, AgentConfig as ApiAgentConfig } from '../modules/agents/types';

export type { ApiAgentConfig };

export interface ApiResponse {
    response: {
        message: ApiAgentConfig[];
        status: number;
        time: string;
    };
}

const API_BASE_URL = 'http://localhost:8081/api/1.0/agent-config';

export const agentService = {
    async fetchAgents(token: string): Promise<ApiAgentConfig[]> {
        const response = await fetch(API_BASE_URL, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch agents');
        }

        const data: ApiResponse = await response.json();
        return data.response.message;
    },

    async createAgent(token: string, agent: ApiAgentConfig): Promise<void> {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(agent),
        });

        if (!response.ok) {
            throw new Error('Failed to create agent');
        }
    },

    async updateAgent(token: string, id: string, agent: ApiAgentConfig): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(agent),
        });

        if (!response.ok) {
            throw new Error('Failed to update agent');
        }
    },

    async deleteAgent(token: string, id: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete agent');
        }
    },
};
