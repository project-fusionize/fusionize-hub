import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { fetchExecutionLogs, clearLogs } from '../store/slices/executionLogsSlice';

import { useAuth } from '../auth/AuthContext';
import type { AppDispatch } from '../store';

export const useWorkflowExecutionLogs = (workflowId: string, executionId?: string) => {
    const { token, isAuthenticated } = useAuth();
    const dispatch = useDispatch<AppDispatch>();

    const logs = useSelector((state: RootState) =>
        executionId ? (state.executionLogs.byExecutionId[executionId] || []) : []
    );
    const requestStatus = useSelector((state: RootState) =>
        executionId ? (state.executionLogs.loadingStatus[executionId] || 'idle') : 'idle'
    );
    const error = useSelector((state: RootState) =>
        executionId ? (state.executionLogs.errors[executionId] || null) : null
    );

    const refresh = useCallback(() => {
        if (isAuthenticated && token && workflowId && executionId) {
            dispatch(fetchExecutionLogs({ token, workflowId, executionId }));
        }
    }, [dispatch, isAuthenticated, token, workflowId, executionId]);

    const clear = useCallback(() => {
        if (executionId) {
            dispatch(clearLogs(executionId));
        }
    }, [dispatch, executionId]);

    useEffect(() => {
        if (executionId && requestStatus === 'idle' && isAuthenticated && token) {
            refresh();
        }
    }, [executionId, requestStatus, isAuthenticated, token, refresh]);

    return {
        logs,
        loading: requestStatus === 'loading',
        error,
        refresh,
        clear
    };
};
