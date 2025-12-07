import { useState, useEffect, useCallback } from 'react';
import { chatModelService, type NewModel } from '../services/chatModelService';
import { useAuth } from '../auth/AuthContext';

export interface Model {
    id: string;
    domain: string;
    name: string;
    provider: string;
    modelName: string | null;
    mode: ('Chat' | 'Vision' | 'Embedding')[];
    status: 'healthy' | 'error';
    lastUsed: string;
    temperature: number;
    maxTokens: number;
    enabled: boolean;
}

export const useChatModels = () => {
    const { token, isAuthenticated } = useAuth();
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchModels = useCallback(async () => {
        if (!isAuthenticated || !token) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const apiModels = await chatModelService.fetchModels(token);
            const mappedModels: Model[] = apiModels.map((apiModel) => ({
                id: apiModel.id,
                domain: apiModel.domain,
                name: apiModel.name,
                provider: apiModel.provider || 'Unknown',
                modelName: apiModel.modelName,
                mode: apiModel.capabilities.map((c: string) => c.charAt(0).toUpperCase() + c.slice(1)) as any,
                status: 'healthy',
                lastUsed: 'Never',
                temperature: apiModel.temperature || 0.7,
                maxTokens: 0,
                enabled: true,
            }));
            setModels(mappedModels);
        } catch (err) {
            console.error('Error fetching models:', err);
            setError('Failed to fetch models');
        } finally {
            setLoading(false);
        }
    }, [token, isAuthenticated]);

    useEffect(() => {
        fetchModels();
    }, [fetchModels]);

    const addModel = async (newModel: NewModel) => {
        if (!token) return;
        try {
            await chatModelService.createModel(token, newModel);
            // Optimistic update or re-fetch
            // For simplicity and consistency, let's re-fetch or construct the model locally
            // Constructing locally to match previous behavior
            const mappedModel: Model = {
                id: Date.now().toString(),
                domain: newModel.domain,
                name: newModel.name,
                provider: newModel.provider,
                modelName: newModel.modelName, // Map modelName
                mode: newModel.capabilities.map((c: string) => c.charAt(0).toUpperCase() + c.slice(1)) as any,
                status: 'healthy',
                lastUsed: 'Never',
                temperature: newModel.properties.temperature,
                maxTokens: newModel.properties.maxTokens,
                enabled: true
            };
            setModels(prev => [...prev, mappedModel]);
        } catch (err) {
            console.error('Error adding model:', err);
            throw err;
        }
    };

    const updateModel = async (domain: string, updatedModel: NewModel) => {
        if (!token) return;
        try {
            await chatModelService.updateModel(token, domain, updatedModel);
            setModels(prev => prev.map(m => m.domain === domain ? {
                ...m,
                name: updatedModel.name,
                provider: updatedModel.provider,
                modelName: updatedModel.modelName,
                mode: updatedModel.capabilities.map((c: string) => c.charAt(0).toUpperCase() + c.slice(1)) as any,
                temperature: updatedModel.properties.temperature,
                maxTokens: updatedModel.properties.maxTokens,
            } : m));
        } catch (err) {
            console.error('Error updating model:', err);
            throw err;
        }
    };

    const deleteModel = async (domain: string) => {
        if (!token) return;
        try {
            await chatModelService.deleteModel(token, domain);
            setModels(prev => prev.filter(m => m.domain !== domain));
        } catch (err) {
            console.error('Error deleting model:', err);
            throw err;
        }
    };

    const toggleModelEnabled = (id: string) => {
        setModels(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
    };

    return {
        models,
        loading,
        error,
        addModel,
        updateModel,
        deleteModel,
        toggleModelEnabled,
        refresh: fetchModels
    };
};
