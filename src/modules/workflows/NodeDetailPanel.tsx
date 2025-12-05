import { useState } from 'react';
import { Bot, Database, Zap, GitBranch, Clock, CheckCircle, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NodeDetailPanelProps {
  node: {
    id: string;
    label: string;
    type: string;
    status: string;
    description?: string;
  } | null;
}

export function NodeDetailPanel({ node }: NodeDetailPanelProps) {
  const [logSearch, setLogSearch] = useState('');

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

  const typeConfig = typeIcons[node.type as keyof typeof typeIcons] || typeIcons.tool;
  const TypeIcon = typeConfig.icon;

  // Mock execution data
  const executionTimeline = [
    { time: '12:01:33', event: `Started: ${node.label}` },
    { time: '12:01:34', event: node.type === 'ai' ? 'AI Model: gpt-4o' : 'Initializing...' },
    { time: '12:01:35', event: node.type === 'api' ? 'API: creditBureau.getScore → 720' : 'Processing data...' },
    { time: '12:01:36', event: 'Completed in 2.1s' },
  ];

  const mockInput = {
    prompt: node.type === 'ai' ? 'Verify the identity of the applicant using the provided documents' : undefined,
    parameters: {
      applicantId: 'APP-2024-001',
      documentType: 'passport',
      threshold: 0.85,
    },
  };

  const mockOutput = {
    result: node.type === 'ai' ? 'Identity verified successfully' : 'Processing completed',
    confidence: node.type === 'ai' ? 0.94 : undefined,
    data: node.type === 'api' ? { creditScore: 720, status: 'APPROVED' } : { processed: true },
  };

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
    <div className="flex flex-col h-full">
      {/* Node Summary */}
      <div className="p-6 border-b border-border">
        <Badge variant={typeConfig.variant} className="mb-4 gap-1">
          <TypeIcon className="w-3 h-3" />
          {typeConfig.label}
        </Badge>

        <h2 className="text-xl mb-2">{node.label}</h2>
        {node.description && (
          <p className="text-muted-foreground text-sm">{node.description}</p>
        )}
      </div>

      {/* Execution Timeline */}
      <div className="p-6 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm text-foreground">Execution Timeline</h3>
        </div>
        <div className="space-y-2">
          {executionTimeline.map((entry, index) => (
            <div key={index} className="flex gap-3 text-sm font-mono">
              <span className="text-muted-foreground">[{entry.time}]</span>
              <span className="text-foreground">{entry.event}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="output" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 pt-4 border-b border-border">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="input" className="flex-1">Input</TabsTrigger>
            <TabsTrigger value="output" className="flex-1">Output</TabsTrigger>
            <TabsTrigger value="metadata" className="flex-1">Metadata</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <TabsContent value="input" className="mt-0 h-full">
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto h-full">
              {JSON.stringify(mockInput, null, 2)}
            </pre>
          </TabsContent>
          <TabsContent value="output" className="mt-0 h-full">
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto h-full">
              {JSON.stringify(mockOutput, null, 2)}
            </pre>
          </TabsContent>
          <TabsContent value="metadata" className="mt-0 h-full">
            <div className="space-y-4">
              {Object.entries(mockMetadata).map(([key, value]) => (
                <div key={key}>
                  <div className="text-sm text-muted-foreground mb-1 capitalize">{key}</div>
                  <div className="bg-muted p-3 rounded-lg">
                    <pre className="text-sm">{typeof value === 'object' ? JSON.stringify(value, null, 2) : value}</pre>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Log Stream */}
      <div className="border-t border-border bg-card text-card-foreground">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search logs..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="h-8"
            />
          </div>
        </div>
        <div className="p-4 space-y-1 font-mono text-xs max-h-48 overflow-auto">
          {mockLogs
            .filter((log) => log.toLowerCase().includes(logSearch.toLowerCase()))
            .map((log, index) => (
              <div key={index} className="text-muted-foreground">
                {log}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
