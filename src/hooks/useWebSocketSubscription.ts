import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { upsertExecution, type Execution } from '../store/slices/executionsSlice';
import { updateWorkflow } from '../store/slices/workflowsSlice';
import { useAuth } from '../auth/AuthContext';
import type { ApiWorkflowExecution } from '../services/workflowService';
import { useStomp } from '../services/StompSessionProvider';

export const useWebSocketSubscription = (workflowId: string | undefined) => {
    const dispatch = useDispatch();
    const { token } = useAuth();
    const { client, connected } = useStomp();

    useEffect(() => {
        if (!token || !workflowId || !connected || !client) return;

        console.log(`STOMP: Subscribing to workflow ${workflowId}`);
        const subscription = client.subscribe(`/topic/1.0.workflow-executions.${workflowId}`, (message) => {
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
                    lastUpdate: 'Recently',
                    updatedDate: payload.updatedDate || new Date().toISOString(),
                    duration: '-',
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

        return () => {
            subscription.unsubscribe();
            console.log(`STOMP: Unsubscribed from workflow ${workflowId}`);
        };
    }, [dispatch, token, workflowId, client, connected]);
};
