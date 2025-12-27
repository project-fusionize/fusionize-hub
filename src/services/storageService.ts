
export interface ApiStorage {
    id: string;
    domain: string;
    name: string | null;
    provider: 'PINECONE' | 'MONGO_DB' | 'CHROMA_DB' | 'AWS_S3' | 'AZURE_BLOB';
    storageType: 'VECTOR_STORAGE' | 'FILE_STORAGE';
    enabled: boolean;
    properties: Record<string, any>;
    secrets: Record<string, any>;
    userActivities: any[];
    cover: string | null;
    key: string | null;
}

export interface ApiResponse {
    response: {
        message: ApiStorage[];
        status: number;
        time: string;
    };
}

export interface NewStorage {
    domain: string;
    provider: 'PINECONE' | 'MONGO_DB' | 'CHROMA_DB' | 'AWS_S3' | 'AZURE_BLOB';
    storageType: 'VECTOR_STORAGE' | 'FILE_STORAGE';
    enabled: boolean;
    properties: Record<string, any>;
    secrets: Record<string, any>;
}

import { CONFIG } from '../config';

const API_BASE_URL = `${CONFIG.API_BASE_URL}/api/1.0/storage-config`;

export const storageService = {
    async fetchStorages(token: string): Promise<ApiStorage[]> {
        const response = await fetch(API_BASE_URL, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch storages');
        }

        const data: ApiResponse = await response.json();
        return data.response.message;
    },

    async createStorage(token: string, storage: NewStorage): Promise<void> {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(storage),
        });

        if (!response.ok) {
            throw new Error('Failed to add storage');
        }
    },

    async updateStorage(token: string, domain: string, storage: NewStorage): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/${domain}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(storage),
        });

        if (!response.ok) {
            throw new Error('Failed to update storage');
        }
    },

    async deleteStorage(token: string, domain: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/${domain}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete storage');
        }
    },
};
