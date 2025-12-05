import { useState } from 'react';
import { ChevronLeft, Play, Download, FileText } from 'lucide-react';
import { WorkflowDiagram } from './WorkflowDiagram';
import { NodeDetailPanel } from './NodeDetailPanel';
import { Button } from '@/components/ui/button';
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
  onBack: () => void;
}

export function WorkflowDetail({ workflowId, onBack }: WorkflowDetailProps) {
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);

  // Mock workflow data
  const workflowName = 'Loan Processing';
  const runId = '#2081';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-background border-b border-border px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2 text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </Button>

            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={onBack} className="cursor-pointer">Workflows</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{workflowName}</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-primary">Run {runId}</BreadcrumbPage>
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
        {/* Left Panel: Diagram (65%) */}
        <div className="flex-[65] bg-muted/30 overflow-hidden">
          <WorkflowDiagram onNodeSelect={setSelectedNode} selectedNodeId={selectedNode?.id} />
        </div>

        {/* Right Panel: Node Details (35%) */}
        <div className="flex-[35] bg-background border-l border-border overflow-auto">
          <NodeDetailPanel node={selectedNode} />
        </div>
      </div>
    </div>
  );
}
