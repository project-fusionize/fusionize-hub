import { Handle, Position } from '@xyflow/react';
import { Bot, Zap, GitBranch, Database, Play, CheckCircle, Loader2, XCircle, Circle } from 'lucide-react';

interface CustomNodeData {
  label: string;
  nodeType: 'start' | 'ai' | 'tool' | 'api' | 'decision';
  status: 'success' | 'running' | 'failed' | 'pending';
  description?: string;
  selected?: boolean;
}

export function CustomNode({ data }: { data: CustomNodeData }) {
  const nodeTypeConfig = {
    start: { icon: Play, color: 'bg-muted-foreground', border: 'border-muted-foreground' },
    ai: { icon: Bot, color: 'bg-purple-500', border: 'border-purple-500' },
    tool: { icon: Zap, color: 'bg-blue-500', border: 'border-blue-500' },
    api: { icon: Database, color: 'bg-green-500', border: 'border-green-500' },
    decision: { icon: GitBranch, color: 'bg-orange-500', border: 'border-orange-500' },
  };

  const statusConfig = {
    success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-500/10' },
    running: { icon: Loader2, color: 'text-yellow-600', bg: 'bg-yellow-500/10' },
    failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-500/10' },
    pending: { icon: Circle, color: 'text-muted-foreground', bg: 'bg-muted' },
  };

  const nodeConfig = nodeTypeConfig[data.nodeType];
  const statusInfo = statusConfig[data.status];
  const NodeIcon = nodeConfig.icon;
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`relative ${data.selected ? 'ring-2 ring-blue-500 ring-offset-2 rounded-xl' : ''}`}>
      <Handle type="target" position={Position.Top} />

      <div className={`bg-card rounded-xl shadow-lg hover:shadow-xl transition-shadow min-w-[200px] border-2 ${data.selected ? 'border-primary' : 'border-border/50'}`}>
        {/* Node Header */}
        <div className="flex items-center gap-3 p-3 border-b border-border">
          <div className={`w-8 h-8 ${nodeConfig.color} rounded-lg flex items-center justify-center`}>
            <NodeIcon className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate">{data.label}</div>
          </div>
          <div className={`w-6 h-6 ${statusInfo.bg} rounded-full flex items-center justify-center`}>
            <StatusIcon className={`w-3.5 h-3.5 ${statusInfo.color} ${data.status === 'running' ? 'animate-spin' : ''}`} />
          </div>
        </div>

        {/* Node Description (if present) */}
        {data.description && (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            {data.description}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
