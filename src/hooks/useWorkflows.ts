import { useState, useEffect, useCallback } from 'react';
import { workflowService } from '../services/workflowService';
import { useAuth } from '../auth/AuthContext';

export interface Workflow {
    id: string;
    name: string;
    domain: string;
    description: string;
    totalSteps: number;
    lastRunStatus: 'success' | 'running' | 'failed' | 'pending';
    updatedAt: string;
    active: boolean;
}

export const useWorkflows = () => {
    const { token, isAuthenticated } = useAuth();
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWorkflows = useCallback(async () => {
        // If not authenticated, we can't fetch, wait for auth or skip
        if (!isAuthenticated || !token) {
            // Note: If authentication is still loading, this might return early.
            // Usually useAuth should have an isLoading flag too, but assuming isAuthenticated handles it for now or standard pattern
            // The referenced useChatModels sets loading(false) if !isAuthenticated || !token.
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const apiWorkflows = await workflowService.fetchWorkflows(token);
            const mappedWorkflows: Workflow[] = apiWorkflows.map((wf) => ({
                id: wf.id,
                name: wf.name,
                domain: wf.domain,
                description: wf.description || '',
                totalSteps: wf.nodeMap ? Object.keys(wf.nodeMap).length : 0,
                lastRunStatus: 'pending', // Not available in API currently
                updatedAt: new Date().toISOString(), // Not available in item API currently
                active: wf.active
            }));
            setWorkflows(mappedWorkflows);
        } catch (err) {
            console.error('Error fetching workflows:', err);
            setError('Failed to fetch workflows');
        } finally {
            setLoading(false);
        }
    }, [token, isAuthenticated]);

    useEffect(() => {
        fetchWorkflows();
    }, [fetchWorkflows]);

    return {
        workflows,
        loading,
        error,
        refresh: fetchWorkflows
    };
};
