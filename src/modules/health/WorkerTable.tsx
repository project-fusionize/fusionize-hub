import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
    healthy: { variant: 'default' as const, icon: CheckCircle },
    degraded: { variant: 'secondary' as const, icon: AlertCircle },
    offline: { variant: 'destructive' as const, icon: XCircle },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Worker Nodes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Worker ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Load</TableHead>
              <TableHead>Running Tasks</TableHead>
              <TableHead>Last Heartbeat</TableHead>
              <TableHead>Version</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockWorkers.map((worker) => {
              const status = statusConfig[worker.status];
              const StatusIcon = status.icon;

              return (
                <TableRow key={worker.id}>
                  <TableCell className="font-mono font-medium">{worker.id}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant} className="gap-1">
                      <StatusIcon className="w-3 h-3" />
                      {worker.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-secondary rounded-full h-2 w-[100px]">
                        <div
                          className={`h-2 rounded-full ${worker.load > 80 ? 'bg-red-500' : worker.load > 60 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                          style={{ width: `${worker.load}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground">{worker.load}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{worker.runningTasks}</TableCell>
                  <TableCell className="text-muted-foreground">{worker.lastHeartbeat}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{worker.version}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
