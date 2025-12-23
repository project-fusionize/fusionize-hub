
import { useState, useEffect, useCallback } from 'react';
import { agentService, type ApiAgentConfig } from '../services/agentService';
import { useAuth } from '../auth/AuthContext';

export const useAgents = () => {
    const { token, isAuthenticated } = useAuth();
    const [agents, setAgents] = useState<ApiAgentConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAgents = useCallback(async () => {
        if (!isAuthenticated || !token) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await agentService.fetchAgents(token);
            setAgents(data);
        } catch (err) {
            console.error('Error fetching agents:', err);
            setError('Failed to fetch agents');
        } finally {
            setLoading(false);
        }
    }, [token, isAuthenticated]);

    useEffect(() => {
        fetchAgents();
    }, [fetchAgents]);

    const addAgent = async (newAgent: ApiAgentConfig) => {
        if (!token) return;
        try {
            await agentService.createAgent(token, newAgent);
            setAgents(prev => [...prev, newAgent]); // Optimistic or simpler update
            await fetchAgents(); // Refresh to be sure
        } catch (err) {
            console.error('Error adding agent:', err);
            throw err;
        }
    };

    const updateAgent = async (domain: string, updatedAgent: ApiAgentConfig) => {
        if (!token) return;
        try {
            await agentService.updateAgent(token, domain, updatedAgent);
            setAgents(prev => prev.map(a => a.domain === domain ? updatedAgent : a));
        } catch (err) {
            console.error('Error updating agent:', err);
            throw err;
        }
    };

    const deleteAgent = async (domain: string) => {
        if (!token) return;
        try {
            await agentService.deleteAgent(token, domain);
            setAgents(prev => prev.filter(a => a.domain !== domain));
        } catch (err) {
            console.error('Error deleting agent:', err);
            throw err;
        }
    };

    return {
        agents,
        loading,
        error,
        addAgent,
        updateAgent,
        deleteAgent,
        refresh: fetchAgents
    };
};
