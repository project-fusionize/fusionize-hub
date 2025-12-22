import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addInteraction } from '../store/slices/workflowInteractionsSlice';
import type { ApiWorkflowInteraction } from '../services/workflowService';
import { useAuth } from '../auth/AuthContext';
import { useStomp } from '../services/StompSessionProvider';

export const useWorkflowInteractionsSubscription = (workflowId: string | undefined) => {
    const dispatch = useDispatch();
    const { token } = useAuth();
    const { client, connected } = useStomp();

    useEffect(() => {
        if (!token || !workflowId || !connected || !client) return;

        console.log(`STOMP: Subscribing to interactions for workflow ${workflowId}`);
        const subscription = client.subscribe(`/topic/1.0.workflow-executions.${workflowId}.interaction`, (message) => {
            try {
                const payload: ApiWorkflowInteraction = JSON.parse(message.body);
                dispatch(addInteraction({
                    executionId: payload.workflowExecutionId,
                    interaction: payload
                }));
            } catch (err) {
                console.error('Error parsing STOMP message:', err);
            }
        });

        return () => {
            subscription.unsubscribe();
            console.log(`STOMP: Unsubscribed from interactions for workflow ${workflowId}`);
        };
    }, [dispatch, token, workflowId, client, connected]);
};
