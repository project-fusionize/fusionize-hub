import { Plus, Upload } from 'lucide-react';
import { WorkflowCard } from './WorkflowCard';

interface Workflow {
  id: string;
  name: string;
  description: string;
  totalSteps: number;
  lastRunStatus: 'success' | 'running' | 'failed' | 'pending';
  updatedAt: string;
}

const mockWorkflows: Workflow[] = [
  {
    id: '1',
    name: 'Loan Processing',
    description: 'Complete loan application workflow with credit check and risk assessment',
    totalSteps: 8,
    lastRunStatus: 'success',
    updatedAt: '2025-12-04T10:30:00Z',
  },
  {
    id: '2',
    name: 'Customer Onboarding',
    description: 'AI-powered customer verification and document processing',
    totalSteps: 5,
    lastRunStatus: 'running',
    updatedAt: '2025-12-04T09:15:00Z',
  },
  {
    id: '3',
    name: 'Invoice Automation',
    description: 'Extract, validate and process invoices using AI agents',
    totalSteps: 6,
    lastRunStatus: 'success',
    updatedAt: '2025-12-03T16:45:00Z',
  },
  {
    id: '4',
    name: 'Risk Assessment Pipeline',
    description: 'Multi-stage risk evaluation with AI and external APIs',
    totalSteps: 10,
    lastRunStatus: 'failed',
    updatedAt: '2025-12-03T14:20:00Z',
  },
  {
    id: '5',
    name: 'Document Classification',
    description: 'Classify and route documents using ML models',
    totalSteps: 4,
    lastRunStatus: 'success',
    updatedAt: '2025-12-02T11:00:00Z',
  },
  {
    id: '6',
    name: 'Fraud Detection',
    description: 'Real-time fraud detection with multiple AI models',
    totalSteps: 7,
    lastRunStatus: 'pending',
    updatedAt: '2025-12-01T08:30:00Z',
  },
];

interface WorkflowsListProps {
  onWorkflowSelect: (id: string) => void;
}

export function WorkflowsList({ onWorkflowSelect }: WorkflowsListProps) {
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
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            Run Workflow
          </button>
        </div>
      </div>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockWorkflows.map((workflow) => (
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
