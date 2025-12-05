import { Server, Cpu, Activity, Zap, AlertTriangle } from 'lucide-react';
import { SystemCard } from './SystemCard';
import { WorkerTable } from './WorkerTable';
import { ToolsConnectors } from './ToolsConnectors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function HealthStatus() {
  const systemStats = [
    {
      title: 'Workers Online',
      value: '8',
      status: 'healthy' as const,
      icon: Server,
      subtitle: '2 idle, 6 active',
    },
    {
      title: 'Registered Tools',
      value: '24',
      status: 'healthy' as const,
      icon: Zap,
      subtitle: 'All operational',
    },
    {
      title: 'AI Agents',
      value: '12',
      status: 'healthy' as const,
      icon: Activity,
      subtitle: '4 models connected',
    },
    {
      title: 'Queue Latency',
      value: '23ms',
      status: 'warning' as const,
      icon: Cpu,
      subtitle: 'Avg response time',
    },
  ];

  const recentErrors = [
    { time: '11:23:10', message: 'Worker-2 timeout on step "CalculateRiskScore"', severity: 'warning' },
    { time: '10:45:02', message: 'Claude endpoint unreachable', severity: 'error' },
    { time: '09:12:34', message: 'Retry limit exceeded for DocumentExtractor', severity: 'warning' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2 font-bold tracking-tight">Health & System Status</h1>
        <p className="text-muted-foreground">
          Monitor Fusionize components and worker nodes
        </p>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {systemStats.map((stat) => (
          <SystemCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Model Backends */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Connected Model Backends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { name: 'GPT-4o', status: 'healthy', provider: 'OpenAI' },
              { name: 'Claude 3.5', status: 'healthy', provider: 'Anthropic' },
              { name: 'Gemini Pro', status: 'healthy', provider: 'Google' },
              { name: 'Llama 3.1', status: 'degraded', provider: 'Meta' },
            ].map((model) => (
              <div key={model.name} className="border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{model.name}</span>
                  <div className={`w-2 h-2 rounded-full ${model.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                </div>
                <div className="text-xs text-muted-foreground">{model.provider}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Worker Nodes */}
      <div className="mb-8">
        <WorkerTable />
      </div>

      {/* Tools & Connectors */}
      <div className="mb-8">
        <ToolsConnectors />
      </div>

      {/* Recent Errors / Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <CardTitle>Recent Errors / Alerts</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentErrors.map((error, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg ${error.severity === 'error' ? 'bg-red-500/10' : 'bg-yellow-500/10'
                  }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 ${error.severity === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={error.severity === 'error' ? 'destructive' : 'secondary'} className="font-mono text-xs">
                      {error.time}
                    </Badge>
                  </div>
                  <p className="text-sm text-card-foreground">{error.message}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
