import { configureStore } from '@reduxjs/toolkit';
import workflowsReducer from './slices/workflowsSlice';
import executionsReducer from './slices/executionsSlice';

export const store = configureStore({
    reducer: {
        workflows: workflowsReducer,
        executions: executionsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
