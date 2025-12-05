import { FileText, Database, Bot, Zap, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Tool {
  name: string;
  type: string;
  status: 'operational' | 'error';
  lastCheck: string;
  icon: any;
}

const mockTools: Tool[] = [
  { name: 'DocumentExtractor', type: 'Tool', status: 'operational', lastCheck: '30s ago', icon: FileText },
  { name: 'CRM API Connector', type: 'API', status: 'operational', lastCheck: '45s ago', icon: Database },
  { name: 'Credit Bureau API', type: 'API', status: 'operational', lastCheck: '1m ago', icon: Database },
  { name: 'GPT-4o Agent', type: 'AI Agent', status: 'operational', lastCheck: '15s ago', icon: Bot },
  { name: 'Claude Agent', type: 'AI Agent', status: 'error', lastCheck: '10m ago', icon: Bot },
  { name: 'Custom Validator', type: 'Tool', status: 'operational', lastCheck: '2m ago', icon: Zap },
];

export function ToolsConnectors() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tools & Connectors</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockTools.map((tool) => {
            const Icon = tool.icon;
            const isOperational = tool.status === 'operational';

            return (
              <div
                key={tool.name}
                className="border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${isOperational ? 'bg-blue-500/10' : 'bg-red-500/10'
                    } flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${isOperational ? 'text-blue-500' : 'text-red-500'
                      }`} />
                  </div>
                  {isOperational ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>

                <h3 className="mb-1 font-medium">{tool.name}</h3>
                <Badge variant="outline" className="mb-3">
                  {tool.type}
                </Badge>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Last check: {tool.lastCheck}</span>
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-blue-500 hover:text-blue-600 font-medium hover:bg-transparent">
                    Test
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
