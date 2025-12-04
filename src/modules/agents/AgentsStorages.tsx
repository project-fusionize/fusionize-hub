import { useState } from 'react';
import { Plus, Database, Edit2, Trash2, CheckCircle, XCircle, Zap } from 'lucide-react';
import { AddStorageModal } from './AddStorageModal';

interface Storage {
  id: string;
  name: string;
  type: 'Vector DB' | 'Blob Storage' | 'Document Store';
  provider: string;
  size: string;
  status: 'healthy' | 'error';
  lastUpdate: string;
  usedInWorkflows: number;
  indexName?: string;
  embeddingModel?: string;
}

const mockStorages: Storage[] = [
  {
    id: '1',
    name: 'Customer Documents',
    type: 'Vector DB',
    provider: 'Pinecone',
    size: '2.4M vectors',
    status: 'healthy',
    lastUpdate: '5m ago',
    usedInWorkflows: 8,
    indexName: 'customer-docs',
    embeddingModel: 'text-embedding-3-large',
  },
  {
    id: '2',
    name: 'Product Knowledge Base',
    type: 'Vector DB',
    provider: 'Qdrant',
    size: '850K vectors',
    status: 'healthy',
    lastUpdate: '12m ago',
    usedInWorkflows: 12,
    indexName: 'products',
    embeddingModel: 'text-embedding-3-small',
  },
  {
    id: '3',
    name: 'Invoice Archive',
    type: 'Blob Storage',
    provider: 'AWS S3',
    size: '45.2 GB',
    status: 'healthy',
    lastUpdate: '1h ago',
    usedInWorkflows: 5,
  },
  {
    id: '4',
    name: 'Legal Documents',
    type: 'Document Store',
    provider: 'MongoDB',
    size: '15.8K docs',
    status: 'error',
    lastUpdate: '2h ago',
    usedInWorkflows: 3,
  },
  {
    id: '5',
    name: 'Local Vector Store',
    type: 'Vector DB',
    provider: 'ChromaDB (Local)',
    size: '125K vectors',
    status: 'healthy',
    lastUpdate: '30m ago',
    usedInWorkflows: 4,
    indexName: 'local-embeddings',
    embeddingModel: 'all-MiniLM-L6-v2',
  },
];

export function AgentsStorages() {
  const [storages, setStorages] = useState<Storage[]>(mockStorages);
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  const typeColors: Record<string, string> = {
    'Vector DB': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    'Blob Storage': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    'Document Store': 'bg-green-500/10 text-green-600 border-green-500/20',
  };

  const providerIcons: Record<string, string> = {
    'Pinecone': '🌲',
    'Qdrant': '🔷',
    'AWS S3': '☁️',
    'MongoDB': '🍃',
    'ChromaDB (Local)': '💾',
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    // Simulate test
    setTimeout(() => {
      setTestingId(null);
    }, 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this storage configuration?')) {
      setStorages(storages.filter(s => s.id !== id));
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2">Storages</h1>
          <p className="text-muted-foreground">
            Manage vector databases and document storage configurations
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Storage
        </button>
      </div>

      {/* Storages Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm text-muted-foreground">Name</th>
                <th className="px-6 py-3 text-left text-sm text-muted-foreground">Type</th>
                <th className="px-6 py-3 text-left text-sm text-muted-foreground">Provider</th>
                <th className="px-6 py-3 text-left text-sm text-muted-foreground">Size</th>
                <th className="px-6 py-3 text-left text-sm text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm text-muted-foreground">Config</th>
                <th className="px-6 py-3 text-left text-sm text-muted-foreground">Last Update</th>
                <th className="px-6 py-3 text-left text-sm text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {storages.map((storage) => (
                <tr key={storage.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div>{storage.name}</div>
                      {storage.usedInWorkflows > 0 && (
                        <div className="text-xs text-blue-600 mt-1">
                          Used in {storage.usedInWorkflows} workflows
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-sm border ${typeColors[storage.type]}`}>
                      {storage.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{providerIcons[storage.provider] || '💾'}</span>
                      <span>{storage.provider}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-foreground">{storage.size}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {storage.status === 'healthy' ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600">Healthy</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-600">Error</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-muted-foreground">
                      {storage.indexName && (
                        <div>Index: {storage.indexName}</div>
                      )}
                      {storage.embeddingModel && (
                        <div className="text-xs text-muted-foreground/80 mt-1">
                          {storage.embeddingModel}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">{storage.lastUpdate}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTest(storage.id)}
                        disabled={testingId === storage.id}
                        className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Test connection"
                      >
                        <Zap className={`w-4 h-4 ${testingId === storage.id ? 'text-yellow-600 animate-pulse' : 'text-blue-600'}`} />
                      </button>
                      <button
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(storage.id)}
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

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-5 h-5 text-purple-600" />
            <h3>Vector Databases</h3>
          </div>
          <p className="text-2xl mb-1">
            {storages.filter(s => s.type === 'Vector DB').length}
          </p>
          <p className="text-sm text-muted-foreground">Active vector stores</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3>Healthy</h3>
          </div>
          <p className="text-2xl mb-1">
            {storages.filter(s => s.status === 'healthy').length}
          </p>
          <p className="text-sm text-muted-foreground">Operational storages</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <h3>Total Size</h3>
          </div>
          <p className="text-2xl mb-1">3.3M+</p>
          <p className="text-sm text-muted-foreground">Vectors & documents</p>
        </div>
      </div>

      {/* Add Storage Modal */}
      {showAddModal && (
        <AddStorageModal
          onClose={() => setShowAddModal(false)}
          onAdd={(newStorage) => {
            setStorages([...storages, { ...newStorage, id: Date.now().toString() }]);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}
