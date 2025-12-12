import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Client } from '@stomp/stompjs';
import { addExecution, updateExecution } from '../store/slices/executionsSlice';
import { updateWorkflow } from '../store/slices/workflowsSlice';
import { useAuth } from '../auth/AuthContext';

// Placeholder for WebSocket URL - in a real app this would come from env or config
const WS_URL = 'ws://localhost:8081/ws/1.0';
// Assumed STOMP destination
const DESTINATION = '/topic/executions';

export const useWebSocketSubscription = () => {
    const dispatch = useDispatch();
    const clientRef = useRef<Client | null>(null);
    const { token } = useAuth();

    useEffect(() => {
        if (!token) return;

        const client = new Client({
            brokerURL: WS_URL,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('STOMP: Connected');
                client.subscribe(DESTINATION, (message) => {
                    try {
                        const payload = JSON.parse(message.body);
                        // Assuming the payload structure corresponds to what we expect. 
                        // The previous code had a 'type' field enveloping the payload. 
                        // With STOMP, normally the message body IS the payload, 
                        // or we might look at headers for 'type'.
                        // BUT, let's assume the backend sends the same JSON structure as before:
                        // { type: 'EXECUTION_STARTED', payload: { ... } }

                        const { type, payload: msgPayload } = payload;

                        switch (type) {
                            case 'EXECUTION_STARTED':
                                dispatch(addExecution({
                                    workflowId: msgPayload.workflowId,
                                    execution: msgPayload
                                }));
                                dispatch(updateWorkflow({
                                    id: msgPayload.workflowId,
                                    lastRunStatus: 'running'
                                }));
                                break;

                            case 'EXECUTION_UPDATED':
                                dispatch(updateExecution({
                                    workflowId: msgPayload.workflowId,
                                    executionId: msgPayload.executionId,
                                    updates: msgPayload.updates
                                }));

                                if (msgPayload.updates.status) {
                                    let wfStatus: any = 'pending';
                                    if (msgPayload.updates.status === 'done') wfStatus = 'success';
                                    else if (msgPayload.updates.status === 'error') wfStatus = 'failed';
                                    else if (msgPayload.updates.status === 'inprogress') wfStatus = 'running';

                                    dispatch(updateWorkflow({
                                        id: msgPayload.workflowId,
                                        lastRunStatus: wfStatus
                                    }));
                                }
                                break;

                            default:
                                break;
                        }
                    } catch (err) {
                        console.error('Error parsing STOMP message:', err);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
            onWebSocketClose: () => {
                console.log('STOMP: WebSocket Closed');
            }
        });

        client.activate();
        clientRef.current = client;

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        };
    }, [dispatch, token]);
};
