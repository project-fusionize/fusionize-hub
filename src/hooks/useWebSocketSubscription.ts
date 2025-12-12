import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addExecution, updateExecution } from '../store/slices/executionsSlice';
import { updateWorkflow } from '../store/slices/workflowsSlice';

// Placeholder for WebSocket URL - in a real app this would come from env or config
const WS_URL = 'ws://localhost:8081/ws';

export const useWebSocketSubscription = () => {
    const dispatch = useDispatch();
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Simple reconnect logic could be added here
        ws.current = new WebSocket(WS_URL);

        ws.current.onopen = () => {
            console.log('WebSocket connected');
        };

        ws.current.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                const { type, payload } = message;

                switch (type) {
                    case 'EXECUTION_STARTED':
                        // Payload should be the new execution object
                        dispatch(addExecution({
                            workflowId: payload.workflowId,
                            execution: payload
                        }));
                        // Also update workflow status if needed
                        dispatch(updateWorkflow({
                            id: payload.workflowId,
                            lastRunStatus: 'running'
                        }));
                        break;

                    case 'EXECUTION_UPDATED':
                        // Payload should look like { workflowId, executionId, updates: { ... } }
                        dispatch(updateExecution({
                            workflowId: payload.workflowId,
                            executionId: payload.executionId,
                            updates: payload.updates
                        }));
                        if (payload.updates.status) {
                            // E.g. Update workflow last status if execution finished
                            // This simplistic logic assumes the updated execution is the latest one
                            let wfStatus: any = 'pending';
                            if (payload.updates.status === 'done') wfStatus = 'success';
                            else if (payload.updates.status === 'error') wfStatus = 'failed';
                            else if (payload.updates.status === 'inprogress') wfStatus = 'running';

                            dispatch(updateWorkflow({
                                id: payload.workflowId,
                                lastRunStatus: wfStatus
                            }));
                        }
                        break;

                    // Add other cases like LOG_EMITTED here

                    default:
                        // console.log('Unhandled WS message type:', type);
                        break;
                }
            } catch (err) {
                console.error('Error parsing WS message:', err);
            }
        };

        ws.current.onclose = () => {
            console.log('WebSocket disconnected');
        };

        return () => {
            ws.current?.close();
        };
    }, [dispatch]);
};
