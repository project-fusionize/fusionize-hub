import { useState, useCallback, useEffect } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Controls, Background } from '@xyflow/react';
import { useTheme } from './components/ui/theme-provider';

const initialNodes = [
  { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
  { id: 'n2', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
];
const initialEdges = [{ id: 'n1-n2', source: 'n1', target: 'n2' }];

export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
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

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: any) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: any) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        colorMode={colorMode}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}

        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}