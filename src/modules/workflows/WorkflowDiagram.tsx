import { useCallback, useEffect, useState } from 'react';
import {
  type Node,
  type Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  ReactFlow,
  Position,
} from '@xyflow/react';
import dagre from 'dagre';
import type { Workflow } from '../../store/slices/workflowsSlice';
import type { Execution } from '../../store/slices/executionsSlice';
import '@xyflow/react/dist/style.css';
import { CustomNode } from './CustomNode';
import { useTheme } from '@/components/ui/theme-provider';

const nodeTypes = {
  custom: CustomNode,
};

interface WorkflowDiagramProps {
  onNodeSelect: (node: any) => void;
  selectedNodeId?: string;
  executionId?: string;
  workflow?: Workflow;
  execution?: Execution;
}

export function WorkflowDiagram({ onNodeSelect, selectedNodeId, executionId, workflow, execution }: WorkflowDiagramProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { theme } = useTheme();
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('dark');

  // Sync ReactFlow colorMode with shadcn theme
  useEffect(() => {
    if (theme === 'system') {
      // Check system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setColorMode(isDark ? 'dark' : 'light');
    } else {
      setColorMode(theme as 'light' | 'dark');
    }
  }, [theme]);

  const getLayoutedElements = useCallback((nodes: Node[], edges: Edge[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

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

    // Helper to find status recursively (if needed) or from flat list if we flattened it
    // But execution data is nested.
    // Let's create a map of statuses for easier lookup
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
      let nodeType = 'custom'; // Default to custom node
      // You might map component types to specific node types if needed

      let status = 'pending';
      if (executionId && execution) {
        status = statusMap.get(node.workflowNodeId) || 'pending';
        if (status === 'success') status = 'success'; // Verify mapping match
        // Map 'DONE' to 'success', etc.
        if (status === 'done') status = 'success';
        if (status === 'running') status = 'running';
        if (status === 'failed') status = 'failed';
      }

      let uiNodeType = 'tool';
      const apiType = node.type.toUpperCase();
      if (apiType === 'START') uiNodeType = 'start';
      else if (apiType === 'END') uiNodeType = 'decision'; // Or add 'end' type to CustomNode
      else if (apiType === 'TASK') uiNodeType = 'tool';
      else if (node.component.includes('AI')) uiNodeType = 'ai';

      newNodes.push({
        id: node.workflowNodeId,
        type: nodeType,
        position: { x: 0, y: 0 }, // Initial position, will be layouted
        data: {
          label: node.workflowNodeKey, // Or fetch label from config if available
          nodeKey: node.workflowNodeKey,
          nodeType: uiNodeType,
          status: status,
          description: node.component, // Or description from somewhere
        }
      });

      // Build edges
      if (node.childrenIds) {
        node.childrenIds.forEach(childId => {
          newEdges.push({
            id: `e-${node.workflowNodeId}-${childId}`,
            source: node.workflowNodeId,
            target: childId,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: '#9ca3af', strokeWidth: 2 }, // Default style
          });
        });
      }
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

  }, [workflow, execution, executionId, getLayoutedElements, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: any, node: Node) => {
      onNodeSelect({
        id: node.id,
        label: node.data.label,
        type: node.data.nodeType,
        status: node.data.status,
        description: node.data.description,
      });
    },
    [onNodeSelect]
  );

  // Update node styles based on selection
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          selected: node.id === selectedNodeId,
        },
      }))
    );
  }, [selectedNodeId, setNodes]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        colorMode={colorMode}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background color="var(--border-color)" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
