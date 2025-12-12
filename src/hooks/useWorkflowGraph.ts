import { useCallback, useEffect } from 'react';
import {
    type Node,
    type Edge,
    useNodesState,
    useEdgesState,
    MarkerType,
    Position,
} from '@xyflow/react';
import dagre from 'dagre';
import type { Workflow } from '../store/slices/workflowsSlice';
import type { Execution } from '../store/slices/executionsSlice';

export interface NodeData extends Record<string, unknown> {
    label: string;
    nodeKey: string;
    nodeType: 'start' | 'end' | 'ai-task' | 'human-task' | 'sys-task' | 'task'
    | 'human-decision' | 'sys-decision' | 'ai-decision' | 'decision'
    | 'human-wait' | 'sys-wait' | 'ai-wait' | 'wait';
    status: 'done' | 'working' | 'waiting' | 'failed' | 'pending' | 'idle';
    component?: string;
    stageContext?: any;
    inputContext?: any;
    selected?: boolean;
}

export const useWorkflowGraph = (
    workflow: Workflow | undefined,
    execution: Execution | undefined,
    executionId: string | undefined
) => {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    const getLayoutedElements = useCallback((nodes: Node<NodeData>[], edges: Edge[]) => {
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));

        // Adjusted node dimensions for better layout
        const nodeWidth = 250;
        const nodeHeight = 120;

        dagreGraph.setGraph({ rankdir: 'TB' });

        nodes.forEach((node) => {
            dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
        });

        edges.forEach((edge) => {
            dagreGraph.setEdge(edge.source, edge.target);
        });

        dagre.layout(dagreGraph);

        const layoutedNodes = nodes.map((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            return {
                ...node,
                targetPosition: Position.Top,
                sourcePosition: Position.Bottom,
                position: {
                    x: nodeWithPosition.x - nodeWidth / 2,
                    y: nodeWithPosition.y - nodeHeight / 2,
                },
            };
        });

        return { nodes: layoutedNodes, edges };
    }, []);

    useEffect(() => {
        if (!workflow || !workflow.nodeMap) {
            setNodes([]);
            setEdges([]);
            return;
        }

        const statusMap = new Map<string, string>();
        const contextMap = new Map<string, any>();

        if (execution && execution.nodes) {
            const traverse = (nodes: any[]) => {
                nodes.forEach(node => {
                    if (node.workflowNodeId) {
                        statusMap.set(node.workflowNodeId, node.state?.toLowerCase() || 'pending');
                        if (node.stageContext) {
                            contextMap.set(node.workflowNodeId, node.stageContext);
                        }
                    }
                    if (node.children) {
                        traverse(node.children);
                    }
                });
            };
            traverse(execution.nodes);
        }

        const newNodes: Node<NodeData>[] = [];
        const newEdges: Edge[] = [];
        const parentMap = new Map<string, string>();

        // Build parent map first
        if (workflow?.nodeMap) {
            Object.values(workflow.nodeMap).forEach((node) => {
                if (node.childrenIds) {
                    node.childrenIds.forEach(childId => {
                        parentMap.set(childId, node.workflowNodeId);
                    });
                }
            });
        }

        const defaultRootContext = {
            data: {},
            resources: {},
            decisions: [],
            graphNodes: [],
            runtimeData: null
        };

        // Build nodes from workflow definition
        Object.values(workflow.nodeMap).forEach((node) => {
            let nodeType = 'custom';

            let status: NodeData['status'] = 'pending';
            let stageContext = undefined;
            let inputContext = undefined;

            if (executionId && execution) {
                const rawStatus = statusMap.get(node.workflowNodeId) || 'pending';
                stageContext = contextMap.get(node.workflowNodeId);

                // Determine input context
                const parentId = parentMap.get(node.workflowNodeId);
                if (!parentId) {
                    // Root node
                    inputContext = defaultRootContext;
                } else {
                    // Child node - use parent's context
                    inputContext = contextMap.get(parentId);
                }

                if (rawStatus === 'success' || rawStatus === 'done') status = 'done';
                else if (rawStatus === 'idle') status = 'idle';
                else if (rawStatus === 'running') status = 'working';
                else if (rawStatus === 'failed') status = 'failed';
                else if (rawStatus === 'waiting' || rawStatus === 'wait') status = 'waiting';
                else status = 'pending';
            }

            let uiNodeType: NodeData['nodeType'] = 'task';
            const apiType = node.type.toUpperCase();

            // Helper to determine subtype based on component prefix
            const getSubtype = (base: string, component: string | undefined): any => {
                if (!component) return base.toLowerCase();
                const lowerComp = component.toLowerCase();
                if (lowerComp.startsWith('ai:') || lowerComp.startsWith('ai_')) return `ai-${base.toLowerCase()}`;
                if (lowerComp.startsWith('system:') || lowerComp.startsWith('sys:') || lowerComp.startsWith('system_')) return `sys-${base.toLowerCase()}`;
                if (lowerComp.startsWith('human:') || lowerComp.startsWith('human_')) return `human-${base.toLowerCase()}`;
                return base.toLowerCase();
            };

            if (apiType === 'START') uiNodeType = 'start';
            else if (apiType === 'END') uiNodeType = 'end';
            else if (apiType === 'TASK') uiNodeType = getSubtype('task', node.component);
            else if (apiType === 'DECISION') uiNodeType = getSubtype('decision', node.component);
            else if (apiType === 'WAIT') uiNodeType = getSubtype('wait', node.component);
            else if (node.component && node.component.toLowerCase().includes('ai')) uiNodeType = 'ai-task'; // Fallback for old logic if needed, or remove

            // Ensure uiNodeType is valid, fallback to 'task' if unsure (though logic above should cover it)
            // The type definition is strict, so we should ensure we match one of them.
            // Simplified fallback:
            if (!['start', 'end', 'ai-task', 'human-task', 'sys-task', 'task',
                'human-decision', 'sys-decision', 'ai-decision', 'decision',
                'human-wait', 'sys-wait', 'ai-wait', 'wait'].includes(uiNodeType)) {
                uiNodeType = 'task';
            }

            newNodes.push({
                id: node.workflowNodeId,
                type: nodeType,
                position: { x: 0, y: 0 },
                data: {
                    label: node.workflowNodeKey,
                    nodeKey: node.workflowNodeKey,
                    nodeType: uiNodeType,
                    status: status,
                    component: node.component,
                    stageContext: stageContext,
                    inputContext: inputContext,
                }
            });

            if (node.childrenIds) {
                node.childrenIds.forEach(childId => {
                    newEdges.push({
                        id: `e-${node.workflowNodeId}-${childId}`,
                        source: node.workflowNodeId,
                        target: childId,
                        type: 'smoothstep',
                        markerEnd: { type: MarkerType.ArrowClosed },
                        style: { stroke: '#9ca3af', strokeWidth: 2 },
                    });
                });
            }
        });

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

    }, [workflow, execution, executionId, getLayoutedElements, setNodes, setEdges]);

    return {
        nodes,
        edges,
        setNodes, // Exporting setNodes to allow external updates (e.g. selection)
        setEdges,
        onNodesChange,
        onEdgesChange
    };
};
