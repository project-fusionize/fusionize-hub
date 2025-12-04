import { Clock, GitBranch, CheckCircle, XCircle, Loader2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Workflow {
  id: string;
  name: string;
  description: string;
  totalSteps: number;
  lastRunStatus: 'success' | 'running' | 'failed' | 'pending';
  updatedAt: string;
}

interface WorkflowCardProps {
  workflow: Workflow;
  onSelect: () => void;
}

export function WorkflowCard({ workflow, onSelect }: WorkflowCardProps) {
  const statusConfig = {
    success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-500/10', label: 'Success' },
    running: { icon: Loader2, color: 'text-yellow-600', bg: 'bg-yellow-500/10', label: 'Running' },
    failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-500/10', label: 'Failed' },
    pending: { icon: Circle, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Pending' },
  };

  const status = statusConfig[workflow.lastRunStatus];
  const StatusIcon = status.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 5px 15px -5px rgba(0, 0, 0, 0.1)' }}
      transition={{ duration: 0.2 }}
      onClick={onSelect}
      className="bg-card border border-border rounded-2xl p-6 cursor-pointer transition-all"
    >
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${status.bg}`}>
          <StatusIcon className={`w-4 h-4 ${status.color} ${workflow.lastRunStatus === 'running' ? 'animate-spin' : ''}`} />
          <span className={`text-sm ${status.color}`}>{status.label}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
          <GitBranch className="w-4 h-4" />
          <span>{workflow.totalSteps} steps</span>
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg mb-2">{workflow.name}</h3>
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
        {workflow.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
          <Clock className="w-4 h-4" />
          <span>{formatDate(workflow.updatedAt)}</span>
        </div>
        <button className="text-primary text-sm hover:text-primary/80">
          Open →
        </button>
      </div>
    </motion.div>
  );
}
