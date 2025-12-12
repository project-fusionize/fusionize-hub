import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { fetchWorkflows } from '../store/slices/workflowsSlice';
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
    const dispatch = useDispatch();
    const { items, status, error } = useSelector((state: RootState) => state.workflows);

    const refresh = useCallback(() => {
        if (isAuthenticated && token) {
            // @ts-ignore - Dispatching async thunk
            dispatch(fetchWorkflows(token));
        }
    }, [dispatch, isAuthenticated, token]);

    useEffect(() => {
        if (status === 'idle' && isAuthenticated && token) {
            refresh();
        }
    }, [status, isAuthenticated, token, refresh]);

    return {
        workflows: items,
        loading: status === 'loading', // Only true loading state, or maybe 'loading' | 'idle'
        error,
        refresh
    };
};


