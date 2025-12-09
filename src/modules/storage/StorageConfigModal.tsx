
import { useState, useEffect } from 'react';
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
import { KeyValueTable } from "@/components/key-value-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StorageConfigModalProps {
  onClose: () => void;
  onSave: (storage: any) => void;
  initialData?: any;
}

export function StorageConfigModal({ onClose, onSave, initialData }: StorageConfigModalProps) {
  const isEditing = !!initialData;
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'Vector DB',
    provider: initialData?.provider || 'Pinecone',
  });

  // Map backend provider enum back to UI value if editing
  useEffect(() => {
    if (initialData?.provider) {
      const providerMapReverse: Record<string, string> = {
        'PINECONE': 'Pinecone',
        'MONGO_DB': 'MongoDB',
        'CHROMA_DB': 'ChromaDB (Local)',
        'AWS_S3': 'AWS S3',
        'AZURE_BLOB': 'Azure Blob'
      };
      const uiProvider = providerMapReverse[initialData.provider] || initialData.provider;

      let uiType = 'Vector DB';
      if (initialData.type === 'Blob Storage' || initialData.type === 'Vector DB') {
        uiType = initialData.type;
      } else if (initialData.storageType === 'VECTOR_STORAGE') {
        uiType = 'Vector DB';
      } else if (initialData.storageType === 'FILE_STORAGE') {
        uiType = 'Blob Storage';
      }

      setFormData(prev => ({
        ...prev,
        provider: uiProvider,
        type: uiType as any
      }));
    }
  }, [initialData]);

  const [customProperties, setCustomProperties] = useState<Record<string, string>>(() => {
    if (initialData?.properties) {
      // In the new model, almost everything is a custom property except name, type, provider.
      // So we just load all properties.
      const props: Record<string, string> = {};
      Object.entries(initialData.properties).forEach(([key, value]) => {
        props[key] = String(value);
      });
      return props;
    }
    return {};
  });

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

    const size = initialData?.size || (formData.type === 'Vector DB'
      ? `${Math.floor(Math.random() * 1000)}K vectors`
      : formData.type === 'Blob Storage'
        ? `${(Math.random() * 100).toFixed(1)} GB`
        : `${Math.floor(Math.random() * 10000)} docs`);

    onSave({
      name: formData.name,
      type: formData.type,
      provider: formData.provider,
      size,
      status: 'healthy',
      lastUpdate: 'Just now',
      usedInWorkflows: initialData?.usedInWorkflows || 0,
      customProperties: customProperties,
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Storage' : 'Add New Storage'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update storage configuration.' : 'Configure a new storage provider for your agents.'}
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
              disabled={isEditing}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Storage Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({
                  ...formData,
                  type: value,
                  provider: providersByType[value]?.[0] || '',
                })}
                disabled={isEditing}
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
                  {providersByType[formData.type]?.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-2">
            <KeyValueTable
              initialData={customProperties}
              onChange={setCustomProperties}
              title="Properties"
              description="Add any additional configuration properties."
              mandatoryKeys={
                (formData.type === 'Vector DB' && formData.provider === 'Pinecone') ? ['indexName', 'embeddingModel', 'apiKey'] :
                  (formData.type === 'Blob Storage' && formData.provider === 'AWS S3') ? ['bucket', 'region', 'accessKey', 'secretKey'] : []
              }
            />
          </div>

          {/* Test Connection */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleTest}
              disabled={testing}
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
              {isEditing ? 'Save Changes' : 'Add Storage'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
