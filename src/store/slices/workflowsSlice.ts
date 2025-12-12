import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { workflowService } from '../../services/workflowService';

// Define Workflow type based on what we need in the UI
// This matches the mapping in useWorkflows.ts
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

interface WorkflowsState {
    items: Workflow[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: WorkflowsState = {
    items: [],
    status: 'idle',
    error: null,
};

export const fetchWorkflows = createAsyncThunk(
    'workflows/fetchWorkflows',
    async (token: string) => {
        const apiWorkflows = await workflowService.fetchWorkflows(token);
        // Map API response to our UI model
        return apiWorkflows.map((wf) => ({
            id: wf.workflowId,
            name: wf.name,
            domain: wf.domain,
            description: wf.description || '',
            totalSteps: wf.nodeMap ? Object.keys(wf.nodeMap).length : 0,
            lastRunStatus: 'pending', // Placeholder as per original hook
            updatedAt: new Date().toISOString(), // Placeholder
            active: wf.active
        })) as Workflow[];
    }
);

const workflowsSlice = createSlice({
    name: 'workflows',
    initialState,
    reducers: {
        updateWorkflow: (state, action: PayloadAction<Partial<Workflow> & { id: string }>) => {
            const { id, ...changes } = action.payload;
            const existingWorkflow = state.items.find(w => w.id === id);
            if (existingWorkflow) {
                Object.assign(existingWorkflow, changes);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWorkflows.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchWorkflows.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchWorkflows.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch workflows';
            });
    },
});

export const { updateWorkflow } = workflowsSlice.actions;
export default workflowsSlice.reducer;
