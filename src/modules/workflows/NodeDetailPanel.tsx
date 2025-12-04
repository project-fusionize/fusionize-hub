import { useState } from 'react';
import { Bot, Database, Zap, GitBranch, Clock, CheckCircle, Search } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'input' | 'output' | 'metadata'>('output');
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
    ai: { icon: Bot, label: 'AI Agent', color: 'text-purple-600 bg-purple-500/10' },
    tool: { icon: Zap, label: 'Custom Tool', color: 'text-blue-600 bg-blue-500/10' },
    api: { icon: Database, label: 'API Call', color: 'text-green-600 bg-green-500/10' },
    decision: { icon: GitBranch, label: 'Decision Gateway', color: 'text-orange-600 bg-orange-500/10' },
    start: { icon: CheckCircle, label: 'Start', color: 'text-muted-foreground bg-muted' },
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
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${typeConfig.color} mb-4`}>
          <TypeIcon className="w-4 h-4" />
          <span className="text-sm">{typeConfig.label}</span>
        </div>

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
      <div className="border-b border-border">
        <div className="flex">
          {(['input', 'output', 'metadata'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 capitalize transition-colors ${activeTab === tab
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'input' && (
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
            {JSON.stringify(mockInput, null, 2)}
          </pre>
        )}
        {activeTab === 'output' && (
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
            {JSON.stringify(mockOutput, null, 2)}
          </pre>
        )}
        {activeTab === 'metadata' && (
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
        )}
      </div>

      {/* Log Stream */}
      <div className="border-t border-border bg-card text-card-foreground">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search logs..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="flex-1 bg-muted border border-border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
