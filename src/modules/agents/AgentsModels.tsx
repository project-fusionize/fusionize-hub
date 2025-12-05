
import { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Power, Server } from 'lucide-react';
import { AddModelModal } from './AddModelModal';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Model {
  id: string;
  name: string;
  provider: 'OpenAI' | 'Anthropic' | 'Azure' | 'Google' | 'Local';
  mode: ('Chat' | 'Vision' | 'Embedding')[];
  status: 'healthy' | 'error';
  lastUsed: string;
  temperature: number;
  maxTokens: number;
  enabled: boolean;
}

const mockModels: Model[] = [
  {
    id: '1',
    name: 'GPT-4o',
    provider: 'OpenAI',
    mode: ['Chat', 'Vision'],
    status: 'healthy',
    lastUsed: '2m ago',
    temperature: 0.7,
    maxTokens: 4096,
    enabled: true,
  },
  {
    id: '2',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    mode: ['Chat', 'Vision'],
    status: 'healthy',
    lastUsed: '5m ago',
    temperature: 0.5,
    maxTokens: 8192,
    enabled: true,
  },
  {
    id: '3',
    name: 'Gemini Pro',
    provider: 'Google',
    mode: ['Chat'],
    status: 'error',
    lastUsed: '1h ago',
    temperature: 0.8,
    maxTokens: 2048,
    enabled: false,
  },
  {
    id: '4',
    name: 'text-embedding-3-large',
    provider: 'OpenAI',
    mode: ['Embedding'],
    status: 'healthy',
    lastUsed: '10m ago',
    temperature: 0,
    maxTokens: 0,
    enabled: true,
  },
  {
    id: '5',
    name: 'Llama 3.1 70B',
    provider: 'Local',
    mode: ['Chat'],
    status: 'healthy',
    lastUsed: '30m ago',
    temperature: 0.6,
    maxTokens: 4096,
    enabled: true,
  },
];

export function AgentsModels() {
  const [models, setModels] = useState<Model[]>(mockModels);
  const [showAddModal, setShowAddModal] = useState(false);


  const providerLogos: Record<string, string> = {
    'OpenAI': 'https://logo.clearbit.com/openai.com',
    'Anthropic': 'https://logo.clearbit.com/anthropic.com',
    'Azure': 'https://logo.clearbit.com/azure.microsoft.com',
    'Google': 'https://logo.clearbit.com/google.com',
  };

  const modeColors = {
    Chat: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20',
    Vision: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20',
    Embedding: 'bg-green-500/10 text-green-600 hover:bg-green-500/20',
  };

  const handleToggleEnabled = (id: string) => {
    setModels(models.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this model?')) {
      setModels(models.filter(m => m.id !== id));
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Models</h1>
          <p className="text-muted-foreground">
            Manage LLM model configurations and API connections
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Model
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configured Models</CardTitle>
          <CardDescription>
            A list of all configured language models and their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Config</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={model.enabled ? 'font-medium' : 'text-muted-foreground'}>
                        {model.name}
                      </span>
                      {!model.enabled && (
                        <Badge variant="secondary" className="text-xs">
                          Disabled
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {model.provider === 'Local' ? (
                        <Server className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <img
                          src={providerLogos[model.provider]}
                          alt={model.provider}
                          className="w-5 h-5 object-contain rounded-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://logo.clearbit.com/openai.com';
                            (e.target as HTMLImageElement).onerror = null;
                          }}
                        />
                      )}
                      <span>{model.provider}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1.5 flex-wrap">
                      {model.mode.map((mode) => (
                        <Badge
                          key={mode}
                          variant="secondary"
                          className={`${modeColors[mode]} border-0`}
                        >
                          {mode}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {model.status === 'healthy' ? (
                        <div className="flex items-center gap-1.5 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Reachable</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-600">
                          <XCircle className="w-4 h-4" />
                          <span className="text-sm">Unreachable</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      <div>Temp: {model.temperature}</div>
                      {model.maxTokens > 0 && <div>Max: {model.maxTokens}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{model.lastUsed}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" title="Edit">
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleEnabled(model.id)}
                        title={model.enabled ? 'Disable' : 'Enable'}
                      >
                        <Power className={`w-4 h-4 ${model.enabled ? 'text-green-600' : 'text-muted-foreground'}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(model.id)}
                        className="hover:text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Model Modal */}
      {showAddModal && (
        <AddModelModal
          onClose={() => setShowAddModal(false)}
          onAdd={(newModel) => {
            setModels([...models, { ...newModel, id: Date.now().toString() }]);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}
