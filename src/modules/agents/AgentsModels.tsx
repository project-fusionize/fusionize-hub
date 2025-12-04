
import { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Power } from 'lucide-react';
import { AddModelModal } from './AddModelModal';
import { Button } from '@/components/ui/button';

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


  const providerColors = {
    OpenAI: 'bg-green-500/10 text-green-600 border-green-500/20',
    Anthropic: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    Azure: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    Google: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    Local: 'bg-muted text-muted-foreground border-border',
  };

  const modeColors = {
    Chat: 'bg-blue-500/10 text-blue-600',
    Vision: 'bg-purple-500/10 text-purple-600',
    Embedding: 'bg-green-500/10 text-green-600',
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
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2">Models</h1>
          <p className="text-muted-foreground">
            Manage LLM model configurations and API connections
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Model
        </Button>
      </div>

      {/* Models Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm text-muted-foreground">Name</th>
                <th className="px-6 py-3 text-left text-sm text-muted-foreground">Provider</th>
                <th className="px-6 py-3 text-left text-sm text-muted-foreground">Mode</th>
                <th className="px-6 py-3 text-left text-sm text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm text-muted-foreground">Config</th>
                <th className="px-6 py-3 text-left text-sm text-muted-foreground">Last Used</th>
                <th className="px-6 py-3 text-left text-sm text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {models.map((model) => (
                <tr key={model.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={model.enabled ? '' : 'text-muted-foreground'}>{model.name}</span>
                      {!model.enabled && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                          Disabled
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-sm border ${providerColors[model.provider]}`}>
                      {model.provider}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {model.mode.map((mode) => (
                        <span
                          key={mode}
                          className={`px-2 py-1 rounded text-xs ${modeColors[mode]}`}
                        >
                          {mode}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {model.status === 'healthy' ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600">Reachable</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-600">Unreachable</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-muted-foreground">
                      <div>Temp: {model.temperature}</div>
                      {model.maxTokens > 0 && <div>Max: {model.maxTokens}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">{model.lastUsed}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleToggleEnabled(model.id)}
                        className={`p-2 hover:bg-muted rounded-lg transition-colors ${model.enabled ? 'text-green-600' : 'text-muted-foreground'
                          }`}
                        title={model.enabled ? 'Disable' : 'Enable'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(model.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
