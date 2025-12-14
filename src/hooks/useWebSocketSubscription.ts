import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Client } from '@stomp/stompjs';
import { upsertExecution, type Execution } from '../store/slices/executionsSlice';
import { updateWorkflow } from '../store/slices/workflowsSlice';
import { useAuth } from '../auth/AuthContext';
import type { ApiWorkflowExecution } from '../services/workflowService';

const WS_URL = 'ws://localhost:8081/ws/1.0';

export const useWebSocketSubscription = (workflowId: string | undefined) => {
    const dispatch = useDispatch();
    const clientRef = useRef<Client | null>(null);
    const { token } = useAuth();

    useEffect(() => {
        if (!token || !workflowId) return;

        const client = new Client({
            brokerURL: WS_URL,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log(`STOMP: Connected to workflow ${workflowId}`);
                client.subscribe(`/topic/1.0.workflow-executions.${workflowId}`, (message) => {
                    try {
                        const payload: ApiWorkflowExecution = JSON.parse(message.body);

                        // Map ApiWorkflowExecution to Execution
                        let status: Execution['status'] = 'idle';
                        if (payload.status === 'SUCCESS') status = 'done';
                        else if (payload.status === 'ERROR') status = 'error';
                        else if (payload.status === 'IN_PROGRESS') status = 'inprogress';

                        const execution: Execution = {
                            id: payload.workflowExecutionId,
                            workflowExecutionId: payload.workflowExecutionId,
                            status: status,
                            lastUpdate: 'Recently', // You might want to get this from payload if available
                            duration: '-', // Calculate if timestamps are available
                            nodes: payload.nodes
                        };

                        dispatch(upsertExecution({
                            workflowId: payload.workflowId,
                            execution: execution
                        }));

                        // Update workflow last run status
                        let wfStatus: 'success' | 'failed' | 'running' | 'pending' = 'pending';
                        if (status === 'done') wfStatus = 'success';
                        else if (status === 'error') wfStatus = 'failed';
                        else if (status === 'inprogress') wfStatus = 'running';

                        dispatch(updateWorkflow({
                            id: payload.workflowId,
                            lastRunStatus: wfStatus
                        }));

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
                console.log(`STOMP: Disconnected from workflow ${workflowId}`);
            }
        };
    }, [dispatch, token, workflowId]);
};
