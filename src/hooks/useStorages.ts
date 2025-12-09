
import { useState, useEffect, useCallback } from 'react';
import { storageService, type NewStorage } from '../services/storageService';
import { useAuth } from '../auth/AuthContext';

export interface Storage {
    id: string;
    domain: string;
    name: string;
    type: string; // 'Vector DB' | 'Blob Storage' | 'Document Store'
    provider: string;
    size: string;
    status: 'healthy' | 'error';
    lastUpdate: string;
    usedInWorkflows: number;
    indexName?: string;
    embeddingModel?: string;
    enabled: boolean;
    properties?: Record<string, any>;
}

export const useStorages = () => {
    const { token, isAuthenticated } = useAuth();
    const [storages, setStorages] = useState<Storage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const mapStorageType = (type: string): string => {
        switch (type) {
            case 'FILE_STORAGE':
                return 'Blob Storage';
            case 'VECTOR_STORAGE':
                return 'Vector DB';
            case 'DOCUMENT_STORE':
                return 'Document Store';
            default:
                return type;
        }
    };

    const fetchStorages = useCallback(async () => {
        if (!isAuthenticated || !token) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const apiStorages = await storageService.fetchStorages(token);
            const mappedStorages: Storage[] = apiStorages.map((apiStorage) => ({
                id: apiStorage.id,
                domain: apiStorage.domain,
                name: apiStorage.name || apiStorage.domain,
                type: mapStorageType(apiStorage.storageType),
                provider: apiStorage.provider,
                size: 'Unknown', // Not provided by backend yet
                status: 'healthy', // Default for now
                lastUpdate: 'N/A',
                usedInWorkflows: 0,
                indexName: apiStorage.properties?.bucket || apiStorage.properties?.indexName, // Map bucket to indexName for display if needed? Or just check properties.
                embeddingModel: apiStorage.properties?.embeddingModel,
                enabled: apiStorage.enabled,
                properties: apiStorage.properties,
            }));
            setStorages(mappedStorages);
        } catch (err) {
            console.error('Error fetching storages:', err);
            setError('Failed to fetch storages');
        } finally {
            setLoading(false);
        }
    }, [token, isAuthenticated]);

    useEffect(() => {
        fetchStorages();
    }, [fetchStorages]);

    const addStorage = async (newStorage: NewStorage) => {
        if (!token) return;
        try {
            await storageService.createStorage(token, newStorage);
            await fetchStorages(); // Refresh list after add
        } catch (err) {
            console.error('Error adding storage:', err);
            throw err;
        }
    };

    const updateStorage = async (domain: string, updatedStorage: NewStorage) => {
        if (!token) return;
        try {
            await storageService.updateStorage(token, domain, updatedStorage);
            await fetchStorages(); // Refresh list after update
        } catch (err) {
            console.error('Error updating storage:', err);
            throw err;
        }
    };

    const deleteStorage = async (domain: string) => {
        if (!token) return;
        try {
            await storageService.deleteStorage(token, domain);
            setStorages(prev => prev.filter(s => s.domain !== domain));
        } catch (err) {
            console.error('Error deleting storage:', err);
            throw err;
        }
    };

    return {
        storages,
        loading,
        error,
        addStorage,
        updateStorage,
        deleteStorage,
        refresh: fetchStorages
    };
};
