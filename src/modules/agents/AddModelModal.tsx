
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
import { Checkbox } from "@/components/ui/checkbox";

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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Model</DialogTitle>
          <DialogDescription>
            Configure a new language model provider and its capabilities.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Model Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Model Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., GPT-4o, Claude 3.5"
              required
            />
          </div>

          {/* Provider */}
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select
              value={formData.provider}
              onValueChange={(value: any) => setFormData({ ...formData, provider: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OpenAI">OpenAI</SelectItem>
                <SelectItem value="Anthropic">Anthropic</SelectItem>
                <SelectItem value="Azure">Azure OpenAI</SelectItem>
                <SelectItem value="Google">Google (Gemini)</SelectItem>
                <SelectItem value="Local">Local (Ollama/LM Studio)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="sk-..."
                className="pr-10"
                required={formData.provider !== 'Local'}
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

            {/* Validation */}
            {formData.apiKey && (
              <div className="flex items-center gap-3 pt-1">
                <Button
                  type="button"
                  variant="link"
                  onClick={handleValidate}
                  disabled={validating}
                  className="p-0 h-auto text-sm"
                >
                  {validating ? 'Validating...' : 'Test Connection'}
                </Button>
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
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxTokens">Max Tokens</Label>
              <Input
                id="maxTokens"
                type="number"
                value={formData.maxTokens}
                onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
              />
            </div>
          </div>

          {/* Capabilities */}
          <div className="space-y-3">
            <Label>Capabilities</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vision"
                  checked={formData.hasVision}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasVision: checked as boolean })}
                />
                <Label htmlFor="vision" className="font-normal cursor-pointer">Vision Support</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="embedding"
                  checked={formData.hasEmbedding}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasEmbedding: checked as boolean })}
                />
                <Label htmlFor="embedding" className="font-normal cursor-pointer">Embedding Model</Label>
              </div>
            </div>
          </div>

          {/* Embedding Model (if enabled) */}
          {formData.hasEmbedding && (
            <div className="space-y-2">
              <Label htmlFor="embeddingModel">Embedding Model Name</Label>
              <Input
                id="embeddingModel"
                type="text"
                value={formData.embeddingModel}
                onChange={(e) => setFormData({ ...formData, embeddingModel: e.target.value })}
                placeholder="e.g., text-embedding-3-large"
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Model
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
