import { useState } from 'react';
import { X, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

interface AddModelModalProps {
  onClose: () => void;
  onAdd: (model: any) => void;
}

export function AddModelModal({ onClose, onAdd }: AddModelModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    provider: 'OpenAI' as 'OpenAI' | 'Anthropic' | 'Azure' | 'Google' | 'Local',
    apiKey: '',
    temperature: 0.7,
    maxTokens: 4096,
    embeddingModel: '',
    hasVision: false,
    hasEmbedding: false,
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleValidate = async () => {
    setValidating(true);
    // Simulate API validation
    setTimeout(() => {
      setValidating(false);
      setValidationStatus('success');
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const modes: ('Chat' | 'Vision' | 'Embedding')[] = ['Chat'];
    if (formData.hasVision) modes.push('Vision');
    if (formData.hasEmbedding) modes.push('Embedding');

    onAdd({
      name: formData.name,
      provider: formData.provider,
      mode: modes,
      status: 'healthy',
      lastUsed: 'Never',
      temperature: formData.temperature,
      maxTokens: formData.maxTokens,
      enabled: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl">Add New Model</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Model Name */}
          <div>
            <label className="block mb-2">Model Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., GPT-4o, Claude 3.5"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              required
            />
          </div>

          {/* Provider */}
          <div>
            <label className="block mb-2">Provider</label>
            <select
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value as any })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            >
              <option value="OpenAI">OpenAI</option>
              <option value="Anthropic">Anthropic</option>
              <option value="Azure">Azure OpenAI</option>
              <option value="Google">Google (Gemini)</option>
              <option value="Local">Local (Ollama/LM Studio)</option>
            </select>
          </div>

          {/* API Key */}
          <div>
            <label className="block mb-2">API Key</label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full px-4 py-2 pr-20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                required={formData.provider !== 'Local'}
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

            {/* Validation */}
            {formData.apiKey && (
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleValidate}
                  disabled={validating}
                  className="text-sm text-primary hover:text-primary/90 disabled:text-muted-foreground"
                >
                  {validating ? 'Validating...' : 'Test Connection'}
                </button>
                {validationStatus === 'success' && (
                  <div className="flex items-center gap-1.5 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Valid</span>
                  </div>
                )}
                {validationStatus === 'error' && (
                  <div className="flex items-center gap-1.5 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>Invalid</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Temperature</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              />
            </div>
            <div>
              <label className="block mb-2">Max Tokens</label>
              <input
                type="number"
                value={formData.maxTokens}
                onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              />
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <label className="block mb-3">Capabilities</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasVision}
                  onChange={(e) => setFormData({ ...formData, hasVision: e.target.checked })}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <span>Vision Support</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasEmbedding}
                  onChange={(e) => setFormData({ ...formData, hasEmbedding: e.target.checked })}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <span>Embedding Model</span>
              </label>
            </div>
          </div>

          {/* Embedding Model (if enabled) */}
          {formData.hasEmbedding && (
            <div>
              <label className="block mb-2">Embedding Model Name</label>
              <input
                type="text"
                value={formData.embeddingModel}
                onChange={(e) => setFormData({ ...formData, embeddingModel: e.target.value })}
                placeholder="e.g., text-embedding-3-large"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              />
            </div>
          )}

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
              Add Model
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
