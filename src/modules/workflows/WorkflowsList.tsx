import { Plus, Upload, Loader2, RefreshCw } from 'lucide-react';
import { WorkflowCard } from './WorkflowCard';
import { Button } from '@/components/ui/button';
import { useWorkflows } from '../../hooks/useWorkflows';

interface WorkflowsListProps {
  onWorkflowSelect: (id: string) => void;
}

export function WorkflowsList({ onWorkflowSelect }: WorkflowsListProps) {
  const { workflows, loading, error, refresh } = useWorkflows();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={refresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2">Workflows</h1>
          <p className="text-muted-foreground">
            Orchestrate AI agents, APIs, and tools in visual workflows
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Import
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Run Workflow
          </Button>
        </div>
      </div>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((workflow) => (
          <WorkflowCard
            key={workflow.id}
            workflow={workflow}
            onSelect={() => onWorkflowSelect(workflow.id)}
          />
        ))}
      </div>
    </div>
  );
}
