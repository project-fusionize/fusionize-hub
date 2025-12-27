import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from '@/components/ui/button';
import { Play, Download, PanelLeft } from 'lucide-react';

import { ProcessDiagram } from './ProcessDiagram';
import { mockProcesses, mockExecutions } from './mockData';
import { NodeDetailPanel } from '../workflows/NodeDetailPanel';
import { cn } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from '@/components/ui/badge';

export function ProcessDetail() {
    const { id, executionId } = useParams();
    const navigate = useNavigate();
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isExecutionsListOpen, setIsExecutionsListOpen] = useState(true);

    const process = mockProcesses.find(p => p.id === id);
    const executions = mockExecutions.filter(e => e.processId === id);

    const selectedExecution = useMemo(() =>
        executions.find(e => e.id === executionId),
        [executions, executionId]
    );

    // Mock node data for the DetailPanel based on selected BPMN element and Execution
    const selectedNode = useMemo(() => {
        if (!selectedNodeId) return null;

        // Create a mock node object compatible with NodeData
        return {
            id: selectedNodeId,
            label: selectedNodeId,
            nodeType: 'tool',
            status: selectedExecution ? 'success' : 'pending',
            component: 'bpmn-task',
        } as any;
    }, [selectedNodeId, selectedExecution]);


    if (!process) {
        return <div>Process not found</div>;
    }

    return (
        <div className="absolute inset-0 flex flex-col">
            {/* Header */}
            <div className="bg-background border-b border-border px-8 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink onClick={() => navigate('/processes')} className="cursor-pointer">Processes</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{process.name}</BreadcrumbPage>
                                </BreadcrumbItem>
                                {selectedExecution && (
                                    <>
                                        <BreadcrumbSeparator />
                                        <BreadcrumbItem>
                                            <BreadcrumbPage className="text-primary">{selectedExecution.name}</BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </>
                                )}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2">
                            <Download className="w-4 h-4" />
                            Export XML
                        </Button>
                        <Button className="gap-2">
                            <Play className="w-4 h-4" />
                            Start Instance
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel: Executions List */}
                <div
                    className={cn(
                        "bg-background border-r border-border transition-all duration-300 ease-in-out overflow-hidden flex flex-col",
                        isExecutionsListOpen ? 'w-64' : 'w-0'
                    )}
                >
                    <div className="p-4 border-b border-border">
                        <h3 className="font-semibold text-sm">Executions</h3>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-2">
                            {executions.map(exec => (
                                <div
                                    key={exec.id}
                                    className={cn(
                                        "p-3 rounded-md border text-sm cursor-pointer hover:bg-muted/50 transition-colors",
                                        executionId === exec.id ? "bg-muted border-primary/50" : "border-transparent"
                                    )}
                                    onClick={() => navigate(`/processes/${id}/${exec.id}`)}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium truncate">{exec.name}</span>
                                        <Badge variant={exec.status === 'completed' ? 'secondary' : 'outline'} className="text-[10px] h-4 px-1">
                                            {exec.status}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {new Date(exec.startTime).toLocaleTimeString()}
                                    </div>
                                </div>
                            ))}
                            {executions.length === 0 && (
                                <div className="text-center text-xs text-muted-foreground p-4">
                                    No executions found.
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Center Panel: Diagram */}
                <div className="flex-1 bg-muted/30 overflow-hidden relative">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsExecutionsListOpen(!isExecutionsListOpen)}
                        className="absolute left-4 top-4 z-10 bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background h-8 w-8"
                    >
                        <PanelLeft className="h-4 w-4" />
                    </Button>

                    <ProcessDiagram
                        xml={process.bpmnXml}
                        onNodeSelect={(id) => setSelectedNodeId(id)}
                        selectedNodeId={selectedNodeId || undefined}
                        readOnly={true}
                        nodeStatuses={{
                            'Activity_1w1vj9r': 'completed',
                            'Gateway_0009299': 'completed',
                            'Activity_0y58888': 'running'
                        }}
                    />
                </div>

                {/* Right Panel: Node Details */}
                <div className="w-[450px] bg-background border-l border-border transition-all duration-300">
                    <NodeDetailPanel
                        node={selectedNode}
                        workflowId={process.id}
                        executionId={executionId}
                    />
                </div>

            </div>
        </div>
    );
}

