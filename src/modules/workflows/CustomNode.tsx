import { Handle, Position } from '@xyflow/react';
import { ShimmeringText } from '@/components/animate-ui/primitives/texts/shimmering';
import type { NodeData } from '../../hooks/useWorkflowGraph';
import { typeIcons, statusConfig } from './node-visuals';
import { MoreHorizontal, RotateCcw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useAuth } from '@/auth/AuthContext';
import { workflowOrchestrationService } from '@/services/workflowOrchestrationService';

export function CustomNode({ data }: { data: NodeData }) {
  const { token } = useAuth();
  const nodeConfig = typeIcons[data.nodeType] || typeIcons['tool'];
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
            <div className={`truncate font-medium ${data.status === 'waiting' ? 'animate-pulse' : ''}`}>
              {data.status === 'working' ? (
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
            <StatusIcon className={`w-3.5 h-3.5 ${statusInfo.color} ${data.status === 'working' ? 'animate-spin' : data.status === 'idle' ? 'animate-ping' : data.status === 'waiting' ? 'animate-pulse' : ''}`} />
          </div>
        </div>

        {data.component && (
          <div className="px-3 py-2 text-sm text-muted-foreground flex items-center justify-between gap-2">
            <div className="truncate text-[10px] text-muted-foreground font-mono mt-0.5 flex-1">{data.component}</div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-6 w-6 p-0 hover:bg-muted rounded-md flex items-center justify-center transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  disabled={data.status !== 'failed'}
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (data.workflowId && data.workflowExecutionId && data.workflowNodeExecutionId && token) {
                      try {
                        await workflowOrchestrationService.replayWorkflowNodeExecution(
                          token,
                          data.workflowId,
                          data.workflowExecutionId,
                          data.workflowNodeExecutionId
                        );
                        console.log('Replay triggered successfully');
                      } catch (error) {
                        console.error('Failed to trigger replay', error);
                      }
                    } else {
                      console.warn('Missing required data for replay', {
                        workflowId: data.workflowId,
                        workflowExecutionId: data.workflowExecutionId,
                        workflowNodeExecutionId: data.workflowNodeExecutionId,
                        tokenPresent: !!token
                      });
                    }
                  }}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Replay
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
