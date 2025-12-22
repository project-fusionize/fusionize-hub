import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { workflowService } from '../../services/workflowService';
import type { ApiWorkflowInteraction } from '../../services/workflowService';

export interface WorkflowInteraction extends ApiWorkflowInteraction {
    // We can add frontend specific fields here if needed
}

interface WorkflowInteractionsState {
    byExecutionId: Record<string, WorkflowInteraction[]>;
    loadingStatus: Record<string, 'idle' | 'loading' | 'succeeded' | 'failed'>;
    errors: Record<string, string | null>;
}

const initialState: WorkflowInteractionsState = {
    byExecutionId: {},
    loadingStatus: {},
    errors: {},
};

export const fetchWorkflowInteractions = createAsyncThunk(
    'workflowInteractions/fetchWorkflowInteractions',
    async ({ token, workflowId, executionId }: { token: string; workflowId: string; executionId: string }) => {
        const interactions = await workflowService.fetchWorkflowInteractions(token, workflowId, executionId);
        return { executionId, interactions };
    }
);

const workflowInteractionsSlice = createSlice({
    name: 'workflowInteractions',
    initialState,
    reducers: {
        clearInteractions: (state, action: PayloadAction<string>) => {
            const executionId = action.payload;
            delete state.byExecutionId[executionId];
            delete state.loadingStatus[executionId];
            delete state.errors[executionId];
        },
        addInteraction: (state, action: PayloadAction<{ executionId: string; interaction: WorkflowInteraction }>) => {
            const { executionId, interaction } = action.payload;
            if (!state.byExecutionId[executionId]) {
                state.byExecutionId[executionId] = [];
            }
            // Check if interaction already exists to avoid duplicates
            const exists = state.byExecutionId[executionId].some(i => i.id === interaction.id);
            if (!exists) {
                state.byExecutionId[executionId].push(interaction);
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWorkflowInteractions.pending, (state, action) => {
                const { executionId } = action.meta.arg;
                state.loadingStatus[executionId] = 'loading';
                state.errors[executionId] = null;
            })
            .addCase(fetchWorkflowInteractions.fulfilled, (state, action) => {
                const { executionId, interactions } = action.payload;
                state.loadingStatus[executionId] = 'succeeded';
                state.byExecutionId[executionId] = interactions;
            })
            .addCase(fetchWorkflowInteractions.rejected, (state, action) => {
                const { executionId } = action.meta.arg;
                state.loadingStatus[executionId] = 'failed';
                state.errors[executionId] = action.error.message || 'Failed to fetch workflow interactions';
            });
    },
});

export const { clearInteractions, addInteraction } = workflowInteractionsSlice.actions;
export default workflowInteractionsSlice.reducer;
