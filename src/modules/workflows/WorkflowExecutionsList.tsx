import { useEffect, useRef } from 'react';
import { Play, CheckCircle, XCircle, AlertCircle, Clock, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDispatch, useSelector } from 'react-redux';
import { useWorkflowExecutions } from '../../hooks/useWorkflowExecutions';
import type { Execution } from '../../hooks/useWorkflowExecutions';
import { clearNewlyAddedExecutionId } from '../../store/slices/executionsSlice';
import type { RootState } from '../../store';

interface WorkflowExecutionsListProps {
    workflowId: string;
    onSelect?: (execution: Execution) => void;
    selectedId?: string;
}

export function WorkflowExecutionsList({
    workflowId,
    onSelect,
    selectedId
}: WorkflowExecutionsListProps) {
    const { executions, loading, error, refresh } = useWorkflowExecutions(workflowId);

    // Auto-select newly added execution
    const newlyAddedId = useSelector((state: RootState) => state.executions.newlyAddedExecutionId);
    const dispatch = useDispatch();
    const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        if (newlyAddedId) {
            const execution = executions.find(e => e.id === newlyAddedId);
            if (execution && onSelect) {
                onSelect(execution);

                // Scroll to the item
                const element = itemRefs.current[newlyAddedId];
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }

                dispatch(clearNewlyAddedExecutionId());
            }
        }
    }, [newlyAddedId, executions, onSelect, dispatch]);

    if (loading && executions.length === 0) {
        return (
            <div className="flex flex-col h-full bg-background border-r border-border items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const idleExecution = executions.find(e => e.status === 'idle');
    const pastExecutions = executions
        .filter(e => e.status !== 'idle')
        .sort((a, b) => new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime());

    return (
        <div className="flex flex-col h-full bg-background border-r border-border">
            <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-sm">Executions</h3>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={refresh}>
                        <RefreshCw className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Play className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            {/* Frozen/pinned Idle Execution */}
            {idleExecution && (
                <div className="p-2 border-b border-border">
                    <div
                        key={idleExecution.id}
                        ref={(el) => { itemRefs.current[idleExecution.id] = el; }}
                        onClick={() => onSelect?.(idleExecution)}
                        className={cn(
                            "group flex flex-col gap-1 p-3 rounded-lg border text-sm transition-all hover:bg-muted/50 cursor-pointer",
                            selectedId === idleExecution.id ? "bg-muted border-primary/50" : "border-transparent bg-card/10"
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-muted-foreground" title={idleExecution.workflowExecutionId}>
                                #{idleExecution.workflowExecutionId.slice(-8)}
                            </span>
                            <StatusBadge status={idleExecution.status} />
                        </div>


                    </div>
                </div>
            )}

            {error ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-xs text-destructive mb-2">{error}</p>
                    <Button variant="outline" size="sm" onClick={refresh}>Retry</Button>
                </div>
            ) : (
                <div className="flex-1 overflow-auto p-2 space-y-1">
                    {pastExecutions.length === 0 && !idleExecution ? (
                        <div className="text-center p-4 text-xs text-muted-foreground">
                            No executions found.
                        </div>
                    ) : pastExecutions.map((exec) => (
                        <div
                            key={exec.id}
                            ref={(el) => { itemRefs.current[exec.id] = el; }}
                            onClick={() => onSelect?.(exec)}
                            className={cn(
                                "group flex flex-col gap-1 p-3 rounded-lg border text-sm transition-all hover:bg-muted/50 cursor-pointer",
                                selectedId === exec.id ? "bg-muted border-primary/50" : "border-transparent bg-card/10"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xs text-muted-foreground" title={exec.workflowExecutionId}>
                                    #{exec.workflowExecutionId.slice(-8)}
                                </span>
                                <StatusBadge status={exec.status} />
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                                <span>{exec.lastUpdate}</span>
                                {exec.duration && <span>{exec.duration}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: Execution['status'] }) {
    switch (status) {
        case 'done':
            return (
                <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-700">
                    <CheckCircle className="w-3 h-3" />
                    Success
                </Badge>
            );
        case 'error':
            return (
                <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-700">
                    <XCircle className="w-3 h-3" />
                    Failed
                </Badge>
            );
        case 'inprogress':
            return (
                <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 hover:text-blue-700">
                    <AlertCircle className="w-3 h-3 animate-pulse" />
                    Running
                </Badge>
            );
        case 'idle':
        default:
            return (
                <Badge variant="outline" className="text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Idle
                </Badge>
            );
    }
}
