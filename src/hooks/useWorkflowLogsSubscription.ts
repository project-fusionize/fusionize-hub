import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addLog } from '../store/slices/executionLogsSlice';
import type { ApiWorkflowExecutionLog } from '../services/workflowService';
import { useAuth } from '../auth/AuthContext';
import { useStomp } from '../services/StompSessionProvider';

export const useWorkflowLogsSubscription = (workflowId: string | undefined) => {
    const dispatch = useDispatch();
    const { token } = useAuth();
    const { client, connected } = useStomp();

    useEffect(() => {
        if (!token || !workflowId || !connected || !client) return;

        console.log(`STOMP: Subscribing to logs for workflow ${workflowId}`);
        const subscription = client.subscribe(`/topic/1.0.workflow-executions.${workflowId}.logs`, (message) => {
            try {
                const payload: ApiWorkflowExecutionLog = JSON.parse(message.body);
                dispatch(addLog({
                    executionId: payload.workflowExecutionId,
                    log: payload
                }));
            } catch (err) {
                console.error('Error parsing STOMP message:', err);
            }
        });

        return () => {
            subscription.unsubscribe();
            console.log(`STOMP: Unsubscribed from logs for workflow ${workflowId}`);
        };
    }, [dispatch, token, workflowId, client, connected]);
};
