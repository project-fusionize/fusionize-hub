import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { workflowService } from '../../services/workflowService';
import type { ApiWorkflowExecutionLog } from '../../services/workflowService';

export interface ExecutionLog extends ApiWorkflowExecutionLog {
    // We can add frontend specific fields here if needed
}

interface ExecutionLogsState {
    byExecutionId: Record<string, ExecutionLog[]>;
    loadingStatus: Record<string, 'idle' | 'loading' | 'succeeded' | 'failed'>;
    errors: Record<string, string | null>;
}

const initialState: ExecutionLogsState = {
    byExecutionId: {},
    loadingStatus: {},
    errors: {},
};

export const fetchExecutionLogs = createAsyncThunk(
    'executionLogs/fetchExecutionLogs',
    async ({ token, workflowId, executionId }: { token: string; workflowId: string; executionId: string }) => {
        const logs = await workflowService.fetchWorkflowExecutionLogs(token, workflowId, executionId);
        return { executionId, logs };
    }
);

const executionLogsSlice = createSlice({
    name: 'executionLogs',
    initialState,
    reducers: {
        clearLogs: (state, action: PayloadAction<string>) => {
            const executionId = action.payload;
            delete state.byExecutionId[executionId];
            delete state.loadingStatus[executionId];
            delete state.errors[executionId];
        },
        addLog: (state, action: PayloadAction<{ executionId: string; log: ExecutionLog }>) => {
            const { executionId, log } = action.payload;
            if (!state.byExecutionId[executionId]) {
                state.byExecutionId[executionId] = [];
            }
            // Check if log already exists to avoid duplicates (optional but good practice)
            const exists = state.byExecutionId[executionId].some(l => l.id === log.id);
            if (!exists) {
                state.byExecutionId[executionId].push(log);
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchExecutionLogs.pending, (state, action) => {
                const { executionId } = action.meta.arg;
                state.loadingStatus[executionId] = 'loading';
                state.errors[executionId] = null;
            })
            .addCase(fetchExecutionLogs.fulfilled, (state, action) => {
                const { executionId, logs } = action.payload;
                state.loadingStatus[executionId] = 'succeeded';
                state.byExecutionId[executionId] = logs;
            })
            .addCase(fetchExecutionLogs.rejected, (state, action) => {
                const { executionId } = action.meta.arg;
                state.loadingStatus[executionId] = 'failed';
                state.errors[executionId] = action.error.message || 'Failed to fetch execution logs';
            });
    },
});

export const { clearLogs, addLog } = executionLogsSlice.actions;
export default executionLogsSlice.reducer;
