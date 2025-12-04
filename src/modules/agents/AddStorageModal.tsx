import { useState } from 'react';
import { X, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl">Add New Storage</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Storage Name */}
          <div>
            <label className="block mb-2">Storage Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Customer Documents"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block mb-2">Storage Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({
                ...formData,
                type: e.target.value as any,
                provider: providersByType[e.target.value][0],
              })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            >
              <option value="Vector DB">Vector Database</option>
              <option value="Blob Storage">Blob Storage</option>
              <option value="Document Store">Document Store</option>
            </select>
          </div>

          {/* Provider */}
          <div>
            <label className="block mb-2">Provider</label>
            <select
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            >
              {providersByType[formData.type].map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
          </div>

          {/* URL / Endpoint */}
          <div>
            <label className="block mb-2">
              {formData.provider.includes('Local') ? 'Local Path' : 'URL / Endpoint'}
            </label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder={
                formData.provider.includes('Local')
                  ? '/data/storage'
                  : 'https://api.provider.com'
              }
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              required
            />
          </div>

          {/* API Key (if not local) */}
          {!formData.provider.includes('Local') && (
            <div>
              <label className="block mb-2">API Key</label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="Enter your API key"
                  className="w-full px-4 py-2 pr-20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  {showApiKey ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Vector DB Specific Fields */}
          {formData.type === 'Vector DB' && (
            <>
              <div>
                <label className="block mb-2">Index Name</label>
                <input
                  type="text"
                  value={formData.indexName}
                  onChange={(e) => setFormData({ ...formData, indexName: e.target.value })}
                  placeholder="e.g., customer-docs"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">Embedding Model</label>
                <input
                  type="text"
                  value={formData.embeddingModel}
                  onChange={(e) => setFormData({ ...formData, embeddingModel: e.target.value })}
                  placeholder="e.g., text-embedding-3-large"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  The embedding model used to generate vectors
                </p>
              </div>
            </>
          )}

          {/* Test Connection */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleTest}
                disabled={testing || !formData.url}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </button>

              {testStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>Connection successful</span>
                </div>
              )}
              {testStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span>Connection failed</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Add Storage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
