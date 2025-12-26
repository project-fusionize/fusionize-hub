import { Bot, Zap, GitBranch, Database, CheckCircle, Loader2, XCircle, Circle, Clock, CircleDot } from 'lucide-react';

export const typeIcons: Record<string, { icon: any, label: string, variant: "default" | "secondary" | "destructive" | "outline", description: string, color: string, border: string }> = {
    start: { icon: CheckCircle, label: 'Start', variant: 'outline', description: 'The starting point of the workflow execution.', color: 'bg-muted-foreground', border: 'border-muted-foreground' },
    end: { icon: CheckCircle, label: 'End', variant: 'outline', description: 'The final node in the workflow path.', color: 'bg-slate-600', border: 'border-slate-600' },

    'ai-task': { icon: Bot, label: 'AI Task', variant: 'default', description: 'A task performed by an AI model.', color: 'bg-purple-500', border: 'border-purple-500' },
    'human-task': { icon: CheckCircle, label: 'Human Task', variant: 'secondary', description: 'A task requiring human intervention or approval.', color: 'bg-blue-500', border: 'border-blue-500' },
    'sys-task': { icon: Zap, label: 'System Task', variant: 'secondary', description: 'An automated system operation or computation.', color: 'bg-cyan-500', border: 'border-cyan-500' },
    task: { icon: Zap, label: 'Task', variant: 'secondary', description: 'A generic task or operation.', color: 'bg-blue-500', border: 'border-blue-500' },

    'ai-decision': { icon: GitBranch, label: 'AI Decision', variant: 'default', description: 'A decision point determined by AI analysis.', color: 'bg-purple-600', border: 'border-purple-600' },
    'human-decision': { icon: GitBranch, label: 'Human Decision', variant: 'secondary', description: 'A decision point requiring human input.', color: 'bg-blue-600', border: 'border-blue-600' },
    'sys-decision': { icon: GitBranch, label: 'System Decision', variant: 'destructive', description: 'A rule-based or programmatic decision point.', color: 'bg-orange-500', border: 'border-orange-500' },
    decision: { icon: GitBranch, label: 'Decision', variant: 'destructive', description: 'A branching point in the workflow.', color: 'bg-orange-500', border: 'border-orange-500' },

    'ai-wait': { icon: Clock, label: 'AI Wait', variant: 'default', description: 'Waiting for an AI process to complete.', color: 'bg-purple-400', border: 'border-purple-400' },
    'human-wait': { icon: Clock, label: 'Human Wait', variant: 'secondary', description: 'Waiting for human action.', color: 'bg-blue-400', border: 'border-blue-400' },
    'sys-wait': { icon: Clock, label: 'System Wait', variant: 'outline', description: 'Waiting for a system event or timer.', color: 'bg-gray-400', border: 'border-gray-400' },
    wait: { icon: Clock, label: 'Wait', variant: 'outline', description: 'Pausing execution for a duration or event.', color: 'bg-gray-400', border: 'border-gray-400' },

    // Legacy mapping
    ai: { icon: Bot, label: 'AI Agent', variant: 'default', description: 'An AI-powered agent node.', color: 'bg-purple-500', border: 'border-purple-500' },
    tool: { icon: Zap, label: 'Custom Tool', variant: 'secondary', description: 'A custom tool execution.', color: 'bg-blue-500', border: 'border-blue-500' },
    api: { icon: Database, label: 'API Call', variant: 'outline', description: 'An external API request.', color: 'bg-green-500', border: 'border-green-500' },
};

export const statusConfig = {
    done: {
        icon: CheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
        badgeVariant: 'outline' as const,
        description: 'Execution completed successfully.',
        cardBg: 'bg-green-50 dark:bg-green-900/30'
    },
    working: {
        icon: Loader2,
        color: 'text-yellow-600',
        bg: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20',
        badgeVariant: 'secondary' as const,
        description: 'Currently executing or processing.',
        cardBg: 'bg-yellow-50 dark:bg-yellow-900/30'
    },
    waiting: {
        icon: Clock,
        color: 'text-blue-600',
        bg: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        badgeVariant: 'secondary' as const,
        description: 'Paused, waiting for an external event or input.',
        cardBg: 'bg-blue-50 dark:bg-blue-900/30'
    },
    failed: {
        icon: XCircle,
        color: 'text-red-600',
        bg: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        badgeVariant: 'destructive' as const,
        description: 'Execution failed due to an error.',
        cardBg: 'bg-red-50 dark:bg-red-900/30'
    },
    pending: {
        icon: Circle,
        color: 'text-muted-foreground',
        bg: 'bg-muted',
        borderColor: 'border-border/50',
        badgeVariant: 'outline' as const,
        description: 'Scheduled for execution but not yet started.',
        cardBg: 'bg-muted/40 dark:bg-card'
    },
    idle: {
        icon: CircleDot,
        color: 'text-cyan-600',
        bg: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/20',
        badgeVariant: 'outline' as const,
        description: 'Listening for activation',
        cardBg: 'bg-cyan-50 dark:bg-cyan-900/30'
    },

    // Legacy
    success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-500/10', borderColor: 'border-green-500/20', badgeVariant: 'outline' as const, description: 'Success.', cardBg: 'bg-green-50 dark:bg-green-900/30' },
    running: { icon: Loader2, color: 'text-yellow-600', bg: 'bg-yellow-500/10', borderColor: 'border-yellow-500/50', badgeVariant: 'secondary' as const, description: 'Running.', cardBg: 'bg-yellow-50 dark:bg-yellow-900/30' },
};
