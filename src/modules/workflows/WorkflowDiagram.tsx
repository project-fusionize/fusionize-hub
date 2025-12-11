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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CustomNode } from './CustomNode';
import { useTheme } from '@/components/ui/theme-provider';

const nodeTypes = {
  custom: CustomNode,
};

interface WorkflowDiagramProps {
  onNodeSelect: (node: any) => void;
  selectedNodeId?: string;
}

export function WorkflowDiagram({ onNodeSelect, selectedNodeId }: WorkflowDiagramProps) {
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

  useEffect(() => {
    // Mock workflow data - represents a loan processing workflow
    const initialNodes: Node[] = [
      {
        id: '1',
        type: 'custom',
        position: { x: 250, y: 50 },
        data: {
          label: 'Start Application',
          nodeKey: 'startApplication',
          nodeType: 'start',
          status: 'success',
          description: 'Start of the workflow',
        },
      },
      {
        id: '2',
        type: 'custom',
        position: { x: 250, y: 150 },
        data: {
          label: 'Verify Identity',
          nodeKey: 'verifyIdentity',
          nodeType: 'ai',
          status: 'success',
          description: 'AI-powered identity verification',
        },
      },
      {
        id: '3',
        type: 'custom',
        position: { x: 250, y: 250 },
        data: {
          label: 'Document Extraction',
          nodeKey: 'documentExtraction',
          nodeType: 'tool',
          status: 'success',
          description: 'Extract data from uploaded documents',
        },
      },
      {
        id: '4',
        type: 'custom',
        position: { x: 250, y: 350 },
        data: {
          label: 'Credit Score API',
          nodeKey: 'creditScoreApi',
          nodeType: 'api',
          status: 'success',
          description: 'Fetch credit score from bureau',
        },
      },
      {
        id: '5',
        type: 'custom',
        position: { x: 250, y: 450 },
        data: {
          label: 'Risk Assessment',
          nodeKey: 'riskAssessment',
          nodeType: 'decision',
          status: 'running',
          description: 'Evaluate loan risk',
        },
      },
      {
        id: '6',
        type: 'custom',
        position: { x: 100, y: 570 },
        data: {
          label: 'Approve Loan',
          nodeKey: 'approveLoan',
          nodeType: 'tool',
          status: 'pending',
          description: 'Auto-approve eligible loans',
        },
      },
      {
        id: '7',
        type: 'custom',
        position: { x: 400, y: 570 },
        data: {
          label: 'Manual Review',
          nodeKey: 'manualReview',
          nodeType: 'tool',
          status: 'pending',
          description: 'Route to human review',
        },
      },
      {
        id: '8',
        type: 'custom',
        position: { x: 250, y: 690 },
        data: {
          label: 'Send Notification',
          nodeKey: 'sendNotification',
          nodeType: 'api',
          status: 'pending',
          description: 'Notify customer of decision',
        },
      },
    ];

    const initialEdges: Edge[] = [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#10b981', strokeWidth: 2 },
      },
      {
        id: 'e2-3',
        source: '2',
        target: '3',
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#10b981', strokeWidth: 2 },
      },
      {
        id: 'e3-4',
        source: '3',
        target: '4',
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#10b981', strokeWidth: 2 },
      },
      {
        id: 'e4-5',
        source: '4',
        target: '5',
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#10b981', strokeWidth: 2 },
      },
      {
        id: 'e5-6',
        source: '5',
        target: '6',
        type: 'smoothstep',
        label: 'Low Risk',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#eab308', strokeWidth: 2 },
      },
      {
        id: 'e5-7',
        source: '5',
        target: '7',
        type: 'smoothstep',
        label: 'High Risk',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#eab308', strokeWidth: 2 },
      },
      {
        id: 'e6-8',
        source: '6',
        target: '8',
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#9ca3af', strokeWidth: 2 },
      },
      {
        id: 'e7-8',
        source: '7',
        target: '8',
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#9ca3af', strokeWidth: 2 },
      },
    ];

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [setNodes, setEdges]);

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
