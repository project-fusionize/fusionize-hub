import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { fetchWorkflowInteractions, clearInteractions } from '../store/slices/workflowInteractionsSlice';

import { useAuth } from '../auth/AuthContext';
import type { AppDispatch } from '../store';

export const useWorkflowInteractions = (workflowId: string, executionId?: string) => {
    const { token, isAuthenticated } = useAuth();
    const dispatch = useDispatch<AppDispatch>();

    const interactions = useSelector((state: RootState) =>
        executionId ? (state.workflowInteractions.byExecutionId[executionId] || []) : []
    );
    const requestStatus = useSelector((state: RootState) =>
        executionId ? (state.workflowInteractions.loadingStatus[executionId] || 'idle') : 'idle'
    );
    const error = useSelector((state: RootState) =>
        executionId ? (state.workflowInteractions.errors[executionId] || null) : null
    );

    const refresh = useCallback(() => {
        if (isAuthenticated && token && workflowId && executionId) {
            dispatch(fetchWorkflowInteractions({ token, workflowId, executionId }));
        }
    }, [dispatch, isAuthenticated, token, workflowId, executionId]);

    const clear = useCallback(() => {
        if (executionId) {
            dispatch(clearInteractions(executionId));
        }
    }, [dispatch, executionId]);

    useEffect(() => {
        if (executionId && requestStatus === 'idle' && isAuthenticated && token) {
            refresh();
        }
    }, [executionId, requestStatus, isAuthenticated, token, refresh]);

    return {
        interactions,
        loading: requestStatus === 'loading',
        error,
        refresh,
        clear
    };
};
