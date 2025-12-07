
export interface ApiModel {
    id: string;
    name: string;
    domain: string;
    provider: string;
    apiKey: string;
    modelName: string | null;
    temperature: number | null;
    capabilities: string[];
}

export interface ApiResponse {
    response: {
        message: ApiModel[];
        status: number;
        time: string;
    };
}

export interface NewModel {
    domain: string;
    name: string;
    provider: string;
    modelName: string;
    apiKey: string;
    capabilities: string[];
    properties: {
        temperature: number;
        maxTokens: number;
    };
}

const API_BASE_URL = 'http://localhost:8081/api/1.0/chat-model-config';

export const chatModelService = {
    async fetchModels(token: string): Promise<ApiModel[]> {
        const response = await fetch(API_BASE_URL, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch models');
        }

        const data: ApiResponse = await response.json();
        return data.response.message;
    },

    async createModel(token: string, model: NewModel): Promise<void> {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(model),
        });

        if (!response.ok) {
            throw new Error('Failed to add model');
        }
    },

    async updateModel(token: string, domain: string, model: NewModel): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/${domain}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(model),
        });

        if (!response.ok) {
            throw new Error('Failed to update model');
        }
    },

    async deleteModel(token: string, domain: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/${domain}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete model');
        }
    },
};
