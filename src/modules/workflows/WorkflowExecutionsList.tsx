import { Play, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface Execution {
    id: string;
    status: 'idle' | 'inprogress' | 'done' | 'error';
    lastUpdate: string;
    duration?: string;
}

interface WorkflowExecutionsListProps {
    executions?: Execution[];
    onSelect?: (execution: Execution) => void;
    selectedId?: string;
}

export function WorkflowExecutionsList({
    executions = mockExecutions,
    onSelect,
    selectedId
}: WorkflowExecutionsListProps) {

    return (
        <div className="flex flex-col h-full bg-background border-r border-border">
            <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-sm">Executions</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Play className="h-3 w-3" />
                </Button>
            </div>

            <div className="flex-1 overflow-auto p-2 space-y-1">
                {executions.map((exec) => (
                    <div
                        key={exec.id}
                        onClick={() => onSelect?.(exec)}
                        className={cn(
                            "group flex flex-col gap-1 p-3 rounded-lg border text-sm transition-all hover:bg-muted/50 cursor-pointer",
                            selectedId === exec.id ? "bg-muted border-primary/50" : "border-transparent bg-card/50"
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-muted-foreground">#{exec.id}</span>
                            <StatusIcon status={exec.status} />
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                            <span>{exec.lastUpdate}</span>
                            {exec.duration && <span>{exec.duration}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StatusIcon({ status }: { status: Execution['status'] }) {
    switch (status) {
        case 'done':
            return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
        case 'error':
            return <XCircle className="w-3.5 h-3.5 text-red-500" />;
        case 'inprogress':
            return <AlertCircle className="w-3.5 h-3.5 text-blue-500 animate-pulse" />; // Or a spinner
        case 'idle':
        default:
            return <Clock className="w-3.5 h-3.5 text-muted-foreground" />;
    }
}

const mockExecutions: Execution[] = [
    { id: '20241211000189', status: 'inprogress', lastUpdate: 'Just now', duration: 'Running...' },
    { id: '20241210234512', status: 'done', lastUpdate: '2 mins ago', duration: '45s' },
    { id: '20241210221055', status: 'error', lastUpdate: '1 hour ago', duration: '12s' },
    { id: '20241210183000', status: 'done', lastUpdate: '5 hours ago', duration: '52s' },
    { id: '20241210152011', status: 'done', lastUpdate: '8 hours ago', duration: '38s' },
    { id: '20241210120533', status: 'idle', lastUpdate: '1 day ago' },
    { id: '20241209091522', status: 'done', lastUpdate: '2 days ago', duration: '41s' },
    { id: '20241208164044', status: 'error', lastUpdate: '3 days ago', duration: '5s' },
];
