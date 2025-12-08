
import { useState } from 'react';
import { Plus, Database, Edit2, Trash2, CheckCircle, XCircle, Zap } from 'lucide-react';
import { AddStorageModal } from './AddStorageModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    'Vector DB': 'bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20',
    'Blob Storage': 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20',
    'Document Store': 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20',
  };

  const providerLogos: Record<string, string> = {
    'Pinecone': 'https://logo.clearbit.com/pinecone.io',
    'Qdrant': 'https://logo.clearbit.com/qdrant.tech',
    'AWS S3': 'https://logo.clearbit.com/aws.amazon.com',
    'MongoDB': 'https://logo.clearbit.com/mongodb.com',
    'ChromaDB (Local)': 'https://logo.clearbit.com/trychroma.com',
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
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Storages</h1>
          <p className="text-muted-foreground">
            Manage vector databases and document storage configurations
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Storage
        </Button>
      </div>

      {/* Storages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Configurations</CardTitle>
          <CardDescription>
            A list of connected storage providers and their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Config</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {storages.map((storage) => (
                <TableRow key={storage.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{storage.name}</div>
                      {storage.usedInWorkflows > 0 && (
                        <div className="text-xs text-blue-600 mt-1">
                          Used in {storage.usedInWorkflows} workflows
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={typeColors[storage.type]}
                    >
                      {storage.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img
                        src={providerLogos[storage.provider]}
                        alt={storage.provider}
                        className="w-5 h-5 object-contain rounded-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://logo.clearbit.com/database.com';
                          (e.target as HTMLImageElement).onerror = null;
                        }}
                      />
                      <span>{storage.provider}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{storage.size}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {storage.status === 'healthy' ? (
                        <div className="flex items-center gap-1.5 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Healthy</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-600">
                          <XCircle className="w-4 h-4" />
                          <span className="text-sm">Error</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{storage.lastUpdate}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleTest(storage.id)}
                        disabled={testingId === storage.id}
                        title="Test connection"
                      >
                        <Zap className={`w-4 h-4 ${testingId === storage.id ? 'text-yellow-600 animate-pulse' : 'text-blue-600'}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(storage.id)}
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

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-5 h-5 text-purple-600" />
              <h3 className="font-medium">Vector Databases</h3>
            </div>
            <p className="text-2xl font-bold mb-1">
              {storages.filter(s => s.type === 'Vector DB').length}
            </p>
            <p className="text-sm text-muted-foreground">Active vector stores</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-medium">Healthy</h3>
            </div>
            <p className="text-2xl font-bold mb-1">
              {storages.filter(s => s.status === 'healthy').length}
            </p>
            <p className="text-sm text-muted-foreground">Operational storages</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium">Total Size</h3>
            </div>
            <p className="text-2xl font-bold mb-1">3.3M+</p>
            <p className="text-sm text-muted-foreground">Vectors & documents</p>
          </CardContent>
        </Card>
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
