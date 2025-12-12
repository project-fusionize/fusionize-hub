import { useState } from 'react';
import { ChevronLeft, Play, Download, FileText, PanelLeft } from 'lucide-react';
import { WorkflowDiagram } from './WorkflowDiagram';
import { NodeDetailPanel } from './NodeDetailPanel';
import { WorkflowExecutionsList } from './WorkflowExecutionsList';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useWorkflows } from '../../hooks/useWorkflows';
import { useWorkflowExecutions } from '../../hooks/useWorkflowExecutions';
import type { Execution } from '../../hooks/useWorkflowExecutions';
import { useMemo } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  status: 'success' | 'running' | 'failed' | 'pending';
}

interface WorkflowDetailProps {
  workflowId: string;
  executionId?: string;
  onBack: () => void;
}

export function WorkflowDetail({ workflowId: _workflowId, executionId, onBack }: WorkflowDetailProps) {
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isExecutionsListOpen, setIsExecutionsListOpen] = useState(true);
  const { workflows } = useWorkflows();
  const navigate = useNavigate();
  const { executions } = useWorkflowExecutions(_workflowId);
  const selectedExecution = useMemo(() =>
    executions.find((e: Execution) => e.id === executionId),
    [executions, executionId]
  );

  const handleExecutionSelect = (execution: Execution) => {
    navigate(`/workflows/${_workflowId}/${execution.id}`);
  };

  const workflow = workflows.find(w => w.id === _workflowId);
  const runId = executionId ? `#${executionId.slice(-8)}` : '';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-background border-b border-border px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={onBack} className="cursor-pointer">Workflows</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{workflow?.domain || _workflowId}</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-primary">{runId}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Logs
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              YAML
            </Button>
            <Button className="gap-2">
              <Play className="w-4 h-4" />
              Re-run
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content: Diagram + Details */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Executions List */}
        <div
          className={`bg-background border-r border-border transition-all duration-300 ease-in-out overflow-hidden ${isExecutionsListOpen ? 'w-64' : 'w-0'
            }`}
        >
          <div className="w-64 h-full">
            <WorkflowExecutionsList
              workflowId={_workflowId}
              selectedId={executionId}
              onSelect={handleExecutionSelect}
            />
          </div>
        </div>

        {/* Center Panel: Diagram */}
        <div className="flex-1 bg-muted/30 overflow-hidden relative">
          {/* Toggle Button for Executions List */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsExecutionsListOpen(!isExecutionsListOpen)}
            className="absolute left-4 top-4 z-10 bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background h-8 w-8"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>

          <WorkflowDiagram
            workflow={workflow}
            execution={selectedExecution}
            onNodeSelect={setSelectedNode}
            selectedNodeId={selectedNode?.id}
            executionId={executionId}
          />
        </div>

        {/* Right Panel: Node Details (Fixed Width) */}
        <div className="w-[450px] bg-background border-l border-border transition-all duration-300">
          <NodeDetailPanel node={selectedNode} />
        </div>
      </div>
    </div>
  );
}
