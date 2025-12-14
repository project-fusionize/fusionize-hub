import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { workflowService } from '../../services/workflowService';

export interface Execution {
    id: string;
    status: 'idle' | 'inprogress' | 'done' | 'error';
    lastUpdate: string;
    duration?: string;
    workflowExecutionId: string;
    nodes: any[];
}

interface ExecutionsState {
    byWorkflowId: Record<string, Execution[]>;
    loadingStatus: Record<string, 'idle' | 'loading' | 'succeeded' | 'failed'>;
    errors: Record<string, string | null>;
}

const initialState: ExecutionsState = {
    byWorkflowId: {},
    loadingStatus: {},
    errors: {},
};

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
                lastUpdate: 'Recently',
                duration: '-',
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
            }
        },
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

export const { addExecution, updateExecution, upsertExecution } = executionsSlice.actions;
export default executionsSlice.reducer;
