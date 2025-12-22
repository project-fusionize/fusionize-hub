import { configureStore } from '@reduxjs/toolkit';
import workflowsReducer from './slices/workflowsSlice';
import executionsReducer from './slices/executionsSlice';
import executionLogsReducer from './slices/executionLogsSlice';
import workflowInteractionsReducer from './slices/workflowInteractionsSlice';

export const store = configureStore({
    reducer: {
        workflows: workflowsReducer,
        executions: executionsReducer,
        executionLogs: executionLogsReducer,
        workflowInteractions: workflowInteractionsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
