import { useState, useEffect, useRef } from 'react';
import { Clock, Search, ArrowRightLeft, GitBranch, MessageSquareDashed } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { JsonViewer } from '@/components/ui/json-viewer';
import { JsonDiffViewer } from '@/components/ui/json-diff-viewer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


import type { NodeData } from '../../hooks/useWorkflowGraph';

import { NodeLegendModal } from './NodeLegendModal';
import { typeIcons, statusConfig } from './node-visuals';

import { useWorkflowExecutionLogs } from '../../hooks/useWorkflowExecutionLogs';
import { useWorkflowInteractions } from '../../hooks/useWorkflowInteractions';
import { useWorkflowInteractionsSubscription } from '../../hooks/useWorkflowInteractionsSubscription';
import { ChatConversation, type ChatMessage } from '@/components/chat-conversation';

interface NodeDetailPanelProps {
  node: (NodeData & { id: string }) | null;
  workflowId: string;
  executionId?: string;
}

export function NodeDetailPanel({ node, workflowId, executionId }: NodeDetailPanelProps) {
  const [logSearch, setLogSearch] = useState('');
  const [showDiff, setShowDiff] = useState(false);
  const { logs: allLogs } = useWorkflowExecutionLogs(workflowId, executionId);
  const { interactions: allInteractions } = useWorkflowInteractions(workflowId, executionId);

  // Ideally this subscription should be at the page level, but putting it here ensures it works when viewing details
  useWorkflowInteractionsSubscription(workflowId);

  const firstNodeLogRef = useRef<HTMLDivElement>(null);

  const firstMatchId = allLogs.find(l => l.workflowNodeId === node?.id)?.id;

  useEffect(() => {
    if (firstNodeLogRef.current) {
      firstNodeLogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [node?.id, firstMatchId]);

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

  const typeConfig = typeIcons[node.nodeType as keyof typeof typeIcons] || typeIcons.tool;
  const statusInfo = statusConfig[node.status as keyof typeof statusConfig] || statusConfig.pending;

  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusInfo.icon;

  const executionTimeline = [
    { time: '12:01:33', event: `Started: ${node.label}` },
    { time: '12:01:34', event: node.nodeType.includes('ai') ? 'AI Model: gpt-4o' : 'Initializing...' },
    { time: '12:01:35', event: node.nodeType === 'sys-task' ? 'System Op: creditBureau.getScore' : 'Processing data...' },
    { time: '12:01:36', event: 'Completed in 2.1s' },
  ];

  const nodeInteractions = allInteractions.filter(i => i.workflowNodeId === node?.id);
  const chatMessages: ChatMessage[] = nodeInteractions.map(interaction => ({
    id: interaction.id,
    type: 'text',
    content: interaction.content,
    author: interaction.actor === 'human' ? 'You' : (interaction.actor === 'system' ? 'System' : 'Assistant'),
    avatar: interaction.actor === 'human' ? 'U' : (interaction.actor === 'system' ? 'Sys' : 'AI'),
    time: new Date(interaction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isOwn: interaction.actor === 'human',
    interactionType: interaction.type,
  }));


  const formatLogTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch (e) {
      return timestamp;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-sm">
      {/* Node Summary */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant={typeConfig.variant} className="gap-1 h-5 px-1.5 text-[10px] uppercase tracking-wider font-semibold hover:cursor-help">
                    <TypeIcon className="w-3 h-3" />
                    {typeConfig.label}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{typeConfig.description}</p>
                </TooltipContent>
              </Tooltip>

              {node.status && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-5 px-1.5 text-[10px] capitalize gap-1 hover:cursor-help",
                        statusInfo.bg,
                        statusInfo.color,
                        statusInfo.borderColor
                      )}
                    >
                      <StatusIcon className={cn("w-3 h-3", node.status === 'working' ? "animate-spin" : node.status === 'idle' ? "animate-ping" : "")} />
                      {node.status}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{statusInfo.description}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>

            <div className="ml-1 flex items-center">
              <NodeLegendModal />
            </div>
          </div>
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
            <TabsTrigger value="interaction" className="flex-1 text-xs">Interaction</TabsTrigger>
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
              {allLogs.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground">No logs found.</div>
              ) : (
                allLogs
                  .filter((log) => log.message.toLowerCase().includes(logSearch.toLowerCase()))
                  .map((log) => {
                    const isCurrentNode = log.workflowNodeId === node.id;
                    return (
                      <div
                        key={log.id}
                        ref={log.id === firstMatchId ? firstNodeLogRef : null}
                        className={cn(
                          "flex gap-2 p-1 rounded-sm transition-opacity duration-200",
                          isCurrentNode ? "bg-primary/5 opacity-100 font-medium" : "opacity-40 hover:opacity-100"
                        )}
                      >
                        <span className="text-muted-foreground shrink-0 opacity-70 w-28" title={log.timestamp}>
                          [{formatLogTime(log.timestamp)}] {log.level}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-muted-foreground/60 mr-2 border border-border px-1 rounded">
                            {log.nodeKey}
                          </span>
                          <span className={`break-all ${log.level === 'INFO' ? 'text-blue-500 dark:text-blue-400' : log.level === 'WARN' ? 'text-yellow-500 dark:text-yellow-400' : log.level === 'DEBUG' ? 'text-muted-foreground' : log.level === 'ERROR' ? 'text-red-500' : 'text-foreground'}`}>
                            {log.message}
                          </span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </TabsContent>

          {/* Interaction Tab */}
          <TabsContent value="interaction" className="m-0 h-full p-4">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 space-y-2">
                <MessageSquareDashed className="w-12 h-12 stroke-[1.5]" />
                <p className="text-sm">No interactions recorded</p>
              </div>
            ) : (
              <ChatConversation messages={chatMessages} />
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

