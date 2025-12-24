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
    componentConfig?: any;
    stageContext?: any;
    inputContext?: any;
    selected?: boolean;
}

// --- Helper Functions ---

const resolveNodeStatus = (rawStatus: string | undefined): NodeData['status'] => {
    if (!rawStatus) return 'pending';
    switch (rawStatus.toLowerCase()) {
        case 'success':
        case 'done':
            return 'done';
        case 'working':
            return 'working';
        case 'waiting':
        case 'wait':
            return 'waiting';
        case 'failed':
            return 'failed';
        case 'idle':
            return 'idle';
        default:
            return 'pending';
    }
};

const determineUiNodeType = (apiType: string, component: string | undefined): NodeData['nodeType'] => {
    let uiNodeType: string = 'task';
    const type = apiType.toUpperCase();

    // Helper to determine subtype
    const getSubtype = (base: string, comp: string | undefined): string => {
        if (!comp) return base.toLowerCase();
        const lowerComp = comp.toLowerCase();
        if (lowerComp.startsWith('ai:') || lowerComp.startsWith('ai_')) return `ai-${base.toLowerCase()}`;
        if (lowerComp.startsWith('system:') || lowerComp.startsWith('sys:') || lowerComp.startsWith('system_')) return `sys-${base.toLowerCase()}`;
        if (lowerComp.startsWith('human:') || lowerComp.startsWith('human_')) return `human-${base.toLowerCase()}`;
        return base.toLowerCase();
    };

    if (type === 'START') uiNodeType = 'start';
    else if (type === 'END') uiNodeType = 'end';
    else if (type === 'TASK') uiNodeType = getSubtype('task', component);
    else if (type === 'DECISION') uiNodeType = getSubtype('decision', component);
    else if (type === 'WAIT') uiNodeType = getSubtype('wait', component);
    else if (component && component.toLowerCase().includes('ai')) uiNodeType = 'ai-task';

    // Validation
    const validTypes = [
        'start', 'end', 'ai-task', 'human-task', 'sys-task', 'task',
        'human-decision', 'sys-decision', 'ai-decision', 'decision',
        'human-wait', 'sys-wait', 'ai-wait', 'wait'
    ];

    return validTypes.includes(uiNodeType) ? (uiNodeType as NodeData['nodeType']) : 'task';
};

const getEdgeStyle = (sourceStatus: string, targetStatus: string) => {
    let color = '#9ca3af'; // pending/muted (gray-400)
    let strokeWidth = 1;

    // Resolve normalize statuses first to ensure we compare correctly
    const sStatus = resolveNodeStatus(sourceStatus);
    const tStatus = resolveNodeStatus(targetStatus);

    if (sStatus === 'done') {
        if (tStatus === 'done') {
            color = '#16a34a'; // green-600
            strokeWidth = 2;
        } else if (tStatus === 'working') {
            color = '#ca8a04'; // yellow-600
            strokeWidth = 2;
        } else if (tStatus === 'waiting') {
            color = '#2563eb'; // blue-600
            strokeWidth = 2;
        } else if (tStatus === 'failed') {
            color = '#dc2626'; // red-600
            strokeWidth = 2;
        }
    }

    return { color, strokeWidth };
};

const processExecutionData = (execution: Execution | undefined) => {
    const statusMap = new Map<string, string>();
    const contextMap = new Map<string, any>();

    if (execution && execution.nodes) {
        const latestNodeExecutions = new Map<string, any>();

        const traverse = (nodes: any[]) => {
            nodes.forEach(node => {
                if (node.workflowNodeId) {
                    const existing = latestNodeExecutions.get(node.workflowNodeId);
                    if (!existing || (node.updatedDate && existing.updatedDate && new Date(node.updatedDate) > new Date(existing.updatedDate))) {
                        latestNodeExecutions.set(node.workflowNodeId, node);
                    }
                }
                if (node.children) traverse(node.children);
            });
        };
        traverse(execution.nodes);

        latestNodeExecutions.forEach((node, nodeId) => {
            statusMap.set(nodeId, node.state?.toLowerCase() || 'pending');
            if (node.stageContext) contextMap.set(nodeId, node.stageContext);
        });
    }
    return { statusMap, contextMap };
};


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
        const nodeWidth = 250;
        const nodeHeight = 120;
        dagreGraph.setGraph({ rankdir: 'TB' });

        nodes.forEach((node) => dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight }));
        edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));

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

        const { statusMap, contextMap } = processExecutionData(execution);

        const newNodes: Node<NodeData>[] = [];
        const newEdges: Edge[] = [];
        const parentMap = new Map<string, string>();

        // Build parent map
        Object.values(workflow.nodeMap).forEach((node) => {
            if (node.childrenIds) {
                node.childrenIds.forEach(childId => parentMap.set(childId, node.workflowNodeId));
            }
        });

        const defaultRootContext = { data: {}, resources: {}, decisions: [], graphNodes: [], runtimeData: null };

        // Build nodes and edges
        Object.values(workflow.nodeMap).forEach((node) => {
            let status: NodeData['status'] = 'pending';
            let stageContext = undefined;
            let inputContext = undefined;

            if (executionId && execution) {
                const rawStatus = statusMap.get(node.workflowNodeId);
                status = resolveNodeStatus(rawStatus);
                stageContext = contextMap.get(node.workflowNodeId);

                const parentId = parentMap.get(node.workflowNodeId);
                inputContext = parentId ? contextMap.get(parentId) : defaultRootContext;
            }

            const uiNodeType = determineUiNodeType(node.type, node.component);

            newNodes.push({
                id: node.workflowNodeId,
                type: 'custom',
                position: { x: 0, y: 0 },
                data: {
                    label: node.workflowNodeKey,
                    nodeKey: node.workflowNodeKey,
                    nodeType: uiNodeType,
                    status: status,
                    component: node.component,
                    componentConfig: node.componentConfig,
                    stageContext: stageContext,
                    inputContext: inputContext,
                }
            });

            if (node.childrenIds) {
                node.childrenIds.forEach(childId => {
                    let edgeStyle = { color: '#9ca3af', strokeWidth: 1 };

                    if (executionId && execution) {
                        const targetStatus = statusMap.get(childId) || 'pending';
                        const sourceStatus = statusMap.get(node.workflowNodeId) || 'pending';
                        edgeStyle = getEdgeStyle(sourceStatus, targetStatus);
                    }

                    newEdges.push({
                        id: `e-${node.workflowNodeId}-${childId}`,
                        source: node.workflowNodeId,
                        target: childId,
                        type: 'smoothstep',
                        markerEnd: { type: MarkerType.ArrowClosed, color: edgeStyle.color },
                        style: { stroke: edgeStyle.color, strokeWidth: edgeStyle.strokeWidth },
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
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange
    };
};
