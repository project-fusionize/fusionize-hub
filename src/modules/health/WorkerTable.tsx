import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface Worker {
  id: string;
  status: 'healthy' | 'degraded' | 'offline';
  load: number;
  runningTasks: number;
  lastHeartbeat: string;
  version: string;
}

const mockWorkers: Worker[] = [
  { id: 'worker-01', status: 'healthy', load: 45, runningTasks: 3, lastHeartbeat: '2s ago', version: 'v1.2.4' },
  { id: 'worker-02', status: 'healthy', load: 62, runningTasks: 4, lastHeartbeat: '1s ago', version: 'v1.2.4' },
  { id: 'worker-03', status: 'degraded', load: 89, runningTasks: 6, lastHeartbeat: '5s ago', version: 'v1.2.4' },
  { id: 'worker-04', status: 'healthy', load: 34, runningTasks: 2, lastHeartbeat: '3s ago', version: 'v1.2.4' },
  { id: 'worker-05', status: 'healthy', load: 28, runningTasks: 1, lastHeartbeat: '2s ago', version: 'v1.2.3' },
  { id: 'worker-06', status: 'offline', load: 0, runningTasks: 0, lastHeartbeat: '5m ago', version: 'v1.2.3' },
];

export function WorkerTable() {
  const statusConfig = {
    healthy: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    degraded: { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    offline: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold">Worker Nodes</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Worker ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Load</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Running Tasks</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Last Heartbeat</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Version</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockWorkers.map((worker) => {
              const status = statusConfig[worker.status];
              const StatusIcon = status.icon;

              return (
                <tr key={worker.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-medium">{worker.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${status.bg}`}>
                      <StatusIcon className={`w-4 h-4 ${status.color}`} />
                      <span className={`text-sm capitalize font-medium ${status.color}`}>
                        {worker.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-secondary rounded-full h-2 max-w-[100px]">
                        <div
                          className={`h-2 rounded-full ${worker.load > 80 ? 'bg-red-500' : worker.load > 60 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                          style={{ width: `${worker.load}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground min-w-[45px]">{worker.load}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-card-foreground">{worker.runningTasks}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">{worker.lastHeartbeat}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-muted-foreground">{worker.version}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
