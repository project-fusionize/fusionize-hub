import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { workflowService } from '../../services/workflowService';

export interface Execution {
    id: string;
    status: 'idle' | 'inprogress' | 'done' | 'error';
    lastUpdate: string;
    updatedDate: string;
    duration?: string;
    workflowExecutionId: string;
    nodes: any[];
}

interface ExecutionsState {
    byWorkflowId: Record<string, Execution[]>;
    loadingStatus: Record<string, 'idle' | 'loading' | 'succeeded' | 'failed'>;
    errors: Record<string, string | null>;
    newlyAddedExecutionId: string | null;
}

const initialState: ExecutionsState = {
    byWorkflowId: {},
    loadingStatus: {},
    errors: {},
    newlyAddedExecutionId: null,
};

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function calculateDuration(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMs = endDate.getTime() - startDate.getTime();

    if (durationMs < 1000) return `${durationMs}ms`;
    const seconds = Math.floor(durationMs / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

export const fetchExecutions = createAsyncThunk(
    'executions/fetchExecutions',
    async ({ token, workflowId }: { token: string; workflowId: string }) => {
        const apiExecutions = await workflowService.fetchWorkflowExecutions(token, workflowId);

        const mappedExecutions: Execution[] = apiExecutions.map(exec => {
            let status: Execution['status'] = 'idle';
            if (exec.status === 'SUCCESS') status = 'done';
            else if (exec.status === 'ERROR') status = 'error';
            else if (exec.status === 'IN_PROGRESS') status = 'inprogress';

            return {
                id: exec.workflowExecutionId,
                workflowExecutionId: exec.workflowExecutionId,
                status: status,
                lastUpdate: formatTimeAgo(exec.updatedDate),
                updatedDate: exec.updatedDate,
                duration: exec.status === 'IN_PROGRESS' || exec.status === 'IDLE'
                    ? '-'
                    : calculateDuration(exec.createdDate, exec.updatedDate),
                nodes: exec.nodes
            };
        });

        return { workflowId, executions: mappedExecutions };
    }
);

const executionsSlice = createSlice({
    name: 'executions',
    initialState,
    reducers: {
        addExecution: (state, action: PayloadAction<{ workflowId: string; execution: Execution }>) => {
            const { workflowId, execution } = action.payload;
            if (!state.byWorkflowId[workflowId]) {
                state.byWorkflowId[workflowId] = [];
            }
            // Add to start of list
            state.byWorkflowId[workflowId].unshift(execution);
            state.newlyAddedExecutionId = execution.id;
        },
        updateExecution: (state, action: PayloadAction<{ workflowId: string; executionId: string; updates: Partial<Execution> }>) => {
            const { workflowId, executionId, updates } = action.payload;
            const list = state.byWorkflowId[workflowId];
            if (list) {
                const execution = list.find(e => e.id === executionId || e.workflowExecutionId === executionId);
                if (execution) {
                    Object.assign(execution, updates);
                }
            }
        },
        upsertExecution: (state, action: PayloadAction<{ workflowId: string; execution: Execution }>) => {
            const { workflowId, execution } = action.payload;
            if (!state.byWorkflowId[workflowId]) {
                state.byWorkflowId[workflowId] = [];
            }
            const list = state.byWorkflowId[workflowId];
            const existingIndex = list.findIndex(e => e.id === execution.id || e.workflowExecutionId === execution.workflowExecutionId);

            if (existingIndex !== -1) {
                // Update existing
                list[existingIndex] = { ...list[existingIndex], ...execution };
            } else {
                // Add new to start
                list.unshift(execution);
                state.newlyAddedExecutionId = execution.id;
            }
        },
        clearNewlyAddedExecutionId: (state) => {
            state.newlyAddedExecutionId = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchExecutions.pending, (state, action) => {
                const { workflowId } = action.meta.arg;
                state.loadingStatus[workflowId] = 'loading';
                state.errors[workflowId] = null;
            })
            .addCase(fetchExecutions.fulfilled, (state, action) => {
                const { workflowId, executions } = action.payload;
                state.loadingStatus[workflowId] = 'succeeded';
                state.byWorkflowId[workflowId] = executions;
            })
            .addCase(fetchExecutions.rejected, (state, action) => {
                const { workflowId } = action.meta.arg;
                state.loadingStatus[workflowId] = 'failed';
                state.errors[workflowId] = action.error.message || 'Failed to fetch executions';
            });
    },
});

export const { addExecution, updateExecution, upsertExecution, clearNewlyAddedExecutionId } = executionsSlice.actions;
export default executionsSlice.reducer;
