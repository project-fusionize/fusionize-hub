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

export const useWorkflowGraph = (
    workflow: Workflow | undefined,
    execution: Execution | undefined,
    executionId: string | undefined
) => {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    const getLayoutedElements = useCallback((nodes: Node[], edges: Edge[]) => {
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

        if (execution && execution.nodes) {
            const traverse = (nodes: any[]) => {
                nodes.forEach(node => {
                    if (node.workflowNodeId) {
                        statusMap.set(node.workflowNodeId, node.state?.toLowerCase() || 'pending');
                    }
                    if (node.children) {
                        traverse(node.children);
                    }
                });
            };
            traverse(execution.nodes);
        }

        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        // Build nodes from workflow definition
        Object.values(workflow.nodeMap).forEach((node) => {
            let nodeType = 'custom';

            let status = 'pending';
            if (executionId && execution) {
                status = statusMap.get(node.workflowNodeId) || 'pending';
                if (status === 'success') status = 'success';
                if (status === 'done') status = 'success';
                if (status === 'running') status = 'running';
                if (status === 'failed') status = 'failed';
            }

            let uiNodeType = 'tool';
            const apiType = node.type.toUpperCase();
            if (apiType === 'START') uiNodeType = 'start';
            else if (apiType === 'END') uiNodeType = 'decision';
            else if (apiType === 'TASK') uiNodeType = 'tool';
            else if (node.component.includes('AI')) uiNodeType = 'ai';

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
