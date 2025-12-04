import { useState } from 'react';
import { ChevronLeft, Play, Download, FileText } from 'lucide-react';
import { WorkflowDiagram } from './WorkflowDiagram';
import { NodeDetailPanel } from './NodeDetailPanel';

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
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Workflows</span>
              <span>/</span>
              <span className="text-foreground">{workflowName}</span>
              <span>/</span>
              <span className="text-primary">Run {runId}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
              <Download className="w-4 h-4" />
              Export Logs
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
              <FileText className="w-4 h-4" />
              YAML
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <Play className="w-4 h-4" />
              Re-run
            </button>
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
