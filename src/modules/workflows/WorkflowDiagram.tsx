import { useCallback, useEffect, useState } from 'react';
import {
  type Node,
  Controls,
  Background,
  ReactFlow,
} from '@xyflow/react';
import type { Workflow } from '../../store/slices/workflowsSlice';
import type { Execution } from '../../store/slices/executionsSlice';
import { useWorkflowGraph } from '../../hooks/useWorkflowGraph';
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
  const { nodes, edges, setNodes, onNodesChange, onEdgesChange } = useWorkflowGraph(workflow, execution, executionId);
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

  const onNodeClick = useCallback(
    (_: any, node: Node) => {
      onNodeSelect({
        id: node.id,
        label: node.data.label,
        type: node.data.nodeType,
        status: node.data.status,
        component: node.data.component,
        stageContext: node.data.stageContext,
        inputContext: node.data.inputContext,
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
