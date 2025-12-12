import { useState } from 'react';
import { Bot, Database, Zap, GitBranch, Clock, CheckCircle, Search, Loader2, XCircle, Circle, ArrowRightLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { JsonViewer } from '@/components/ui/json-viewer';
import { JsonDiffViewer } from '@/components/ui/json-diff-viewer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';


interface NodeDetailPanelProps {
  node: {
    id: string;
    label: string;
    type: string;
    status: string;
    component?: string;
    stageContext?: any;
    inputContext?: any;
  } | null;
}

export function NodeDetailPanel({ node }: NodeDetailPanelProps) {
  const [logSearch, setLogSearch] = useState('');
  const [showDiff, setShowDiff] = useState(false);

  if (!node) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-center">
        <div>
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <GitBranch className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg mb-2">Select a Node</h3>
          <p className="text-muted-foreground text-sm">
            Click on any node in the workflow diagram to view its details and execution logs
          </p>
        </div>
      </div>
    );
  }

  const typeIcons = {
    ai: { icon: Bot, label: 'AI Agent', variant: 'default' as const },
    tool: { icon: Zap, label: 'Custom Tool', variant: 'secondary' as const },
    api: { icon: Database, label: 'API Call', variant: 'outline' as const },
    decision: { icon: GitBranch, label: 'Decision Gateway', variant: 'destructive' as const },
    start: { icon: CheckCircle, label: 'Start', variant: 'outline' as const },
  };

  const statusConfig = {
    success: {
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      badgeVariant: 'outline' as const // We'll stick to outline logic but customize styles
    },
    running: {
      icon: Loader2,
      color: 'text-yellow-600',
      bg: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      badgeVariant: 'secondary' as const
    },
    failed: {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      badgeVariant: 'destructive' as const
    },
    pending: {
      icon: Circle,
      color: 'text-muted-foreground',
      bg: 'bg-muted',
      borderColor: 'border-border/50',
      badgeVariant: 'outline' as const
    },
  };

  const typeConfig = typeIcons[node.type as keyof typeof typeIcons] || typeIcons.tool;
  const statusInfo = statusConfig[node.status as keyof typeof statusConfig] || statusConfig.pending;

  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusInfo.icon;

  // Mock execution data
  const executionTimeline = [
    { time: '12:01:33', event: `Started: ${node.label}` },
    { time: '12:01:34', event: node.type === 'ai' ? 'AI Model: gpt-4o' : 'Initializing...' },
    { time: '12:01:35', event: node.type === 'api' ? 'API: creditBureau.getScore → 720' : 'Processing data...' },
    { time: '12:01:36', event: 'Completed in 2.1s' },
  ];

  const mockMetadata = {
    duration: '2.1s',
    cost: node.type === 'ai' ? '$0.0042' : 'N/A',
    tokens: node.type === 'ai' ? { input: 234, output: 89 } : undefined,
    retries: 0,
  };

  const mockLogs = [
    '[12:01:33] INFO: Node execution started',
    '[12:01:34] DEBUG: Loading configuration',
    `[12:01:34] INFO: ${node.type === 'ai' ? 'Connecting to AI model endpoint' : 'Initializing process'}`,
    '[12:01:35] DEBUG: Request sent successfully',
    '[12:01:35] INFO: Response received',
    '[12:01:36] INFO: Validation passed',
    '[12:01:36] INFO: Node execution completed',
  ];

  return (
    <div className="flex flex-col h-full bg-background text-sm">
      {/* Node Summary */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <Badge variant={typeConfig.variant} className="gap-1 h-5 px-1.5 text-[10px] uppercase tracking-wider font-semibold">
            <TypeIcon className="w-3 h-3" />
            {typeConfig.label}
          </Badge>
          {node.status && (
            <Badge
              variant="outline"
              className={cn(
                "h-5 px-1.5 text-[10px] capitalize gap-1",
                statusInfo.bg,
                statusInfo.color,
                statusInfo.borderColor
              )}
            >
              <StatusIcon className={cn("w-3 h-3", node.status === 'running' && "animate-spin")} />
              {node.status}
            </Badge>
          )}
        </div>

        <h2 className="text-lg font-semibold truncate leading-tight mb-1" title={node.label}>{node.label}</h2>
        {node.component && (
          <div className="text-xs text-muted-foreground font-mono truncate" title={node.component}>
            {node.component}
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 border-b border-border py-2">
          <TabsList className="w-full justify-start h-9">
            <TabsTrigger value="overview" className="flex-1 text-xs">Overview</TabsTrigger>
            <TabsTrigger value="context" className="flex-1 text-xs">Context</TabsTrigger>
            <TabsTrigger value="logs" className="flex-1 text-xs">Logs</TabsTrigger>
            <TabsTrigger value="metadata" className="flex-1 text-xs">Metadata</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto">
          {/* Overview Tab */}
          <TabsContent value="overview" className="m-0 h-full p-4 space-y-4">
            {/* Execution Timeline */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                Execution Timeline
              </div>
              <div className="space-y-3 border-l border-muted pl-3 ml-1.5">
                {executionTimeline.map((entry, index) => (
                  <div key={index} className="relative">
                    <div className="absolute -left-[16.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-primary/20 border border-primary" />
                    <div className="text-[10px] text-muted-foreground font-mono leading-none mb-0.5">{entry.time}</div>
                    <div className="text-xs">{entry.event}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-md bg-muted/30 border border-border">
                <div className="text-[10px] text-muted-foreground mb-0.5">Duration</div>
                <div className="text-sm font-medium">{mockMetadata.duration}</div>
              </div>
              <div className="p-3 rounded-md bg-muted/30 border border-border">
                <div className="text-[10px] text-muted-foreground mb-0.5">Retries</div>
                <div className="text-sm font-medium">{mockMetadata.retries}</div>
              </div>
            </div>
          </TabsContent>

          {/* Context Tab */}
          <TabsContent value="context" className="m-0 h-full flex flex-col">
            <div className="px-4 py-2 border-b border-border flex justify-between items-center bg-muted/10">
              <span className="text-xs font-medium text-muted-foreground">
                {showDiff ? 'Comparing Input vs Output' : 'Input & Output Context'}
              </span>
              <Button
                variant={showDiff ? "secondary" : "ghost"}
                size="sm"
                className="h-6 text-xs gap-1"
                onClick={() => setShowDiff(!showDiff)}
              >
                <ArrowRightLeft className="w-3 h-3" />
                {showDiff ? 'Split View' : 'Diff View'}
              </Button>
            </div>

            {showDiff ? (
              <div className="flex-1 overflow-auto p-4">
                <JsonDiffViewer
                  oldData={node.inputContext || {}}
                  newData={node.stageContext || {}}
                  label="Context Diff"
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
                <div className="h-1/2 flex flex-col">
                  <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Input</h3>
                  <div className="flex-1 overflow-auto bg-muted/20 rounded-md p-2 border border-border/50">
                    {node.inputContext ? (
                      <JsonViewer data={node.inputContext} initialExpanded={true} />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                        <p className="text-xs">No input context</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-1/2 flex flex-col">
                  <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Output</h3>
                  <div className="flex-1 overflow-auto bg-muted/20 rounded-md p-2 border border-border/50">
                    {node.stageContext ? (
                      <JsonViewer data={node.stageContext} initialExpanded={true} />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                        <p className="text-xs">No output context</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="m-0 h-full flex flex-col">
            <div className="flex items-center gap-2 p-2 border-b border-border bg-muted/5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search logs..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="h-7 pl-8 w-full text-xs"
                />
              </div>
            </div>
            <div className="flex-1 overflow-auto p-2 font-mono text-[10px] space-y-0.5">
              {mockLogs
                .filter((log) => log.toLowerCase().includes(logSearch.toLowerCase()))
                .map((log, index) => (
                  <div key={index} className="flex gap-2 hover:bg-muted/50 p-1 rounded-sm">
                    <span className="text-muted-foreground shrink-0 opacity-70 w-14">{log.split(']')[0]}]</span>
                    <span className={`break-all ${log.includes('INFO') ? 'text-blue-500' : log.includes('DEBUG') ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {log.split(']').slice(1).join(']')}
                    </span>
                  </div>
                ))}
            </div>
          </TabsContent>

          {/* Metadata Tab */}
          <TabsContent value="metadata" className="m-0 h-full p-4">
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(mockMetadata).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground capitalize">{key}</span>
                  <div className="p-2 bg-muted/30 rounded border border-border font-mono text-xs break-all">
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

