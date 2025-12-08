import { Clock, GitBranch, CheckCircle, XCircle, Loader2, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import type { Workflow } from '../../hooks/useWorkflows';

interface WorkflowCardProps {
  workflow: Workflow;
  onSelect: () => void;
}

export function WorkflowCard({ workflow, onSelect }: WorkflowCardProps) {
  const statusConfig = {
    success: { icon: CheckCircle, variant: 'default' as const, label: 'Success', className: 'bg-green-500 hover:bg-green-600' },
    running: { icon: Loader2, variant: 'secondary' as const, label: 'Running', className: 'text-yellow-600 bg-yellow-500/10 hover:bg-yellow-500/20' },
    failed: { icon: XCircle, variant: 'destructive' as const, label: 'Failed', className: '' },
    pending: { icon: Circle, variant: 'outline' as const, label: 'Pending', className: '' },
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
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant={status.variant} className={`gap-1 ${status.className}`}>
            <StatusIcon className={`w-3 h-3 ${workflow.lastRunStatus === 'running' ? 'animate-spin' : ''}`} />
            {status.label}
          </Badge>
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <GitBranch className="w-3 h-3" />
            <span>{workflow.totalSteps} steps</span>
          </div>
        </div>
        <CardTitle className="text-base">
          <div className="text-xs font-normal text-muted-foreground mt-1">
            {workflow.domain}
          </div>
          {workflow.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-muted-foreground text-xs line-clamp-2">
          {workflow.description}
        </p>
      </CardContent>
      <CardFooter className="border-t text-xs text-muted-foreground flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          <span>{formatDate(workflow.updatedAt)}</span>
        </div>
        <Button
          variant="link"
          size="sm"
          className="p-0 h-auto font-normal"
          onClick={onSelect}
        >
          Open →
        </Button>
      </CardFooter>
    </Card>
  );
}
