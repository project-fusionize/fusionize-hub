import { Handle, Position } from '@xyflow/react';
import { Bot, Zap, GitBranch, Database, Play, CheckCircle, Loader2, XCircle, Circle } from 'lucide-react';
import { ShimmeringText } from '@/components/animate-ui/primitives/texts/shimmering';

interface CustomNodeData {
  label: string;
  nodeKey: string;
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
    success: {
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-500/10',
      borderColor: 'border-green-500/50',
      cardBg: 'bg-green-50/50 dark:bg-green-900/20'
    },
    running: {
      icon: Loader2,
      color: 'text-yellow-600',
      bg: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/50',
      cardBg: 'bg-yellow-50/50 dark:bg-yellow-900/20'
    },
    failed: {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-500/10',
      borderColor: 'border-red-500/50',
      cardBg: 'bg-red-50/50 dark:bg-red-900/20'
    },
    pending: {
      icon: Circle,
      color: 'text-muted-foreground',
      bg: 'bg-muted',
      borderColor: 'border-border/50',
      cardBg: 'bg-card'
    },
  };

  const nodeConfig = nodeTypeConfig[data.nodeType] || nodeTypeConfig['tool'];
  const statusInfo = statusConfig[data.status] || statusConfig['pending'];
  const NodeIcon = nodeConfig.icon;
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`relative bg-card rounded-xl ${data.selected ? 'ring-1 ring-ring ring-offset-1 ring-offset-background' : ''}`}>
      <Handle type="target" position={Position.Top} />

      <div className={`rounded-xl hover:shadow-md min-w-[200px] border-2 transition-all duration-200 ${statusInfo.cardBg} ${data.selected ? 'border-primary' : statusInfo.borderColor}`}>
        {/* Node Header */}
        <div className="flex items-center gap-3 p-3 border-b border-border">
          <div className={`w-8 h-8 ${nodeConfig.color} rounded-lg flex items-center justify-center`}>
            <NodeIcon className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate font-medium">
              {data.status === 'running' ? (
                <ShimmeringText
                  text={data.label}
                  className="inline-flex"
                  shimmeringColor="var(--border)"
                  color="var(--foreground)"
                />
              ) : (
                data.label
              )}
            </div>
            <div className="truncate text-[10px] text-muted-foreground font-mono mt-0.5">{data.nodeKey}</div>
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
