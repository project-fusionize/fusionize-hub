import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { fetchExecutions } from '../store/slices/executionsSlice';
import { useAuth } from '../auth/AuthContext';

export interface Execution {
    id: string;
    status: 'idle' | 'inprogress' | 'done' | 'error';
    lastUpdate: string;
    duration?: string;
    workflowExecutionId: string;
}

export const useWorkflowExecutions = (workflowId: string) => {
    const { token, isAuthenticated } = useAuth();
    const dispatch = useDispatch();

    const executionList = useSelector((state: RootState) => state.executions.byWorkflowId[workflowId] || []);
    const requestStatus = useSelector((state: RootState) => state.executions.loadingStatus[workflowId] || 'idle');
    const error = useSelector((state: RootState) => state.executions.errors[workflowId] || null);

    const refresh = useCallback(() => {
        if (isAuthenticated && token && workflowId) {
            // @ts-ignore
            dispatch(fetchExecutions({ token, workflowId }));
        }
    }, [dispatch, isAuthenticated, token, workflowId]);

    useEffect(() => {
        // Fetch if we simply don't have data or status is idle
        // We might want more complex logic (e.g. only fetch if idle)
        // For now, let's fetch on mount if idle
        if (requestStatus === 'idle' && isAuthenticated && token && workflowId) {
            refresh();
        }
    }, [requestStatus, isAuthenticated, token, workflowId, refresh]);

    return {
        executions: executionList,
        loading: requestStatus === 'loading',
        error,
        refresh: refresh
    };
};
