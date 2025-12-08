
import { useState } from 'react';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddStorageModalProps {
  onClose: () => void;
  onAdd: (storage: any) => void;
}

export function AddStorageModal({ onClose, onAdd }: AddStorageModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Vector DB' as 'Vector DB' | 'Blob Storage' | 'Document Store',
    provider: 'Pinecone',
    apiKey: '',
    url: '',
    indexName: '',
    embeddingModel: '',
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const providersByType: Record<string, string[]> = {
    'Vector DB': ['Pinecone', 'Qdrant', 'Weaviate', 'ChromaDB (Local)', 'Milvus'],
    'Blob Storage': ['AWS S3', 'Azure Blob', 'Google Cloud Storage', 'MinIO', 'Local Filesystem'],
    'Document Store': ['MongoDB', 'PostgreSQL', 'Elasticsearch', 'Firestore'],
  };

  const handleTest = async () => {
    setTesting(true);
    // Simulate connection test
    setTimeout(() => {
      setTesting(false);
      setTestStatus('success');
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate mock size based on type
    const size = formData.type === 'Vector DB'
      ? `${Math.floor(Math.random() * 1000)}K vectors`
      : formData.type === 'Blob Storage'
        ? `${(Math.random() * 100).toFixed(1)} GB`
        : `${Math.floor(Math.random() * 10000)} docs`;

    onAdd({
      name: formData.name,
      type: formData.type,
      provider: formData.provider,
      size,
      status: 'healthy',
      lastUpdate: 'Just now',
      usedInWorkflows: 0,
      indexName: formData.indexName || undefined,
      embeddingModel: formData.embeddingModel || undefined,
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Storage</DialogTitle>
          <DialogDescription>
            Configure a new storage provider for your agents.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Storage Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Storage Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Customer Documents"
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Storage Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: any) => setFormData({
                ...formData,
                type: value,
                provider: providersByType[value][0],
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Vector DB">Vector Database</SelectItem>
                <SelectItem value="Blob Storage">Blob Storage</SelectItem>
                <SelectItem value="Document Store">Document Store</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Provider */}
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select
              value={formData.provider}
              onValueChange={(value) => setFormData({ ...formData, provider: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {providersByType[formData.type].map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* URL / Endpoint */}
          <div className="space-y-2">
            <Label htmlFor="url">
              {formData.provider.includes('Local') ? 'Local Path' : 'URL / Endpoint'}
            </Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder={
                formData.provider.includes('Local')
                  ? '/data/storage'
                  : 'https://api.provider.com'
              }
              required
            />
          </div>

          {/* API Key (if not local) */}
          {!formData.provider.includes('Local') && (
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? 'text' : 'password'}
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="Enter your API key"
                  className="pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Vector DB Specific Fields */}
          {formData.type === 'Vector DB' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="indexName">Index Name</Label>
                <Input
                  id="indexName"
                  value={formData.indexName}
                  onChange={(e) => setFormData({ ...formData, indexName: e.target.value })}
                  placeholder="e.g., customer-docs"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="embeddingModel">Embedding Model</Label>
                <Input
                  id="embeddingModel"
                  value={formData.embeddingModel}
                  onChange={(e) => setFormData({ ...formData, embeddingModel: e.target.value })}
                  placeholder="e.g., text-embedding-3-large"
                />
                <p className="text-sm text-muted-foreground">
                  The embedding model used to generate vectors
                </p>
              </div>
            </>
          )}

          {/* Test Connection */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleTest}
              disabled={testing || !formData.url}
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>

            {testStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Connection successful</span>
              </div>
            )}
            {testStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Connection failed</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Storage
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
