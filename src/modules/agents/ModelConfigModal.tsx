import { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { chatModelService } from '../../services/chatModelService';
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
import { Checkbox } from "@/components/ui/checkbox";

interface ModelConfigModalProps {
  onClose: () => void;
  onSave: (model: any) => void;
  initialData?: any;
}

export function ModelConfigModal({ onClose, onSave, initialData }: ModelConfigModalProps) {
  const [formData, setFormData] = useState({
    domain: initialData?.domain || '',
    name: initialData?.name || '',
    provider: initialData?.provider || 'OpenAI',
    modelName: initialData?.modelName || '',
    apiKey: initialData?.apiKey || '',
    hasVision: initialData?.mode?.includes('Vision') || false,
    hasEmbedding: initialData?.mode?.includes('Embedding') || false,
  });

  const { token } = useAuth();
  const isEditing = !!initialData;

  const [customProperties, setCustomProperties] = useState<Record<string, string>>(() => {
    const props: Record<string, string> = {
      temperature: String(initialData?.temperature ?? initialData?.properties?.temperature ?? 0.7),
      maxTokens: String(initialData?.maxTokens ?? initialData?.properties?.maxTokens ?? 4096)
    };

    if (initialData?.properties) {
      Object.entries(initialData.properties).forEach(([key, value]) => {
        // defined keys above, don't overwrite if we want to ensure defaults, 
        // but actually initialData.properties should win if present.
        props[key] = String(value);
      });
    }
    return props;
  });


  const [showApiKey, setShowApiKey] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleValidate = async () => {
    if (!token) return;

    setValidating(true);
    setValidationStatus('idle');

    try {
      const payload = {
        domain: formData.domain,
        name: formData.name,
        modelName: formData.modelName,
        provider: formData.provider,
        apiKey: formData.apiKey
      };

      const isSuccess = await chatModelService.testConnection(token, payload);
      setValidationStatus(isSuccess ? 'success' : 'error');
    } catch (error) {
      console.error('Validation failed:', error);
      setValidationStatus('error');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const capabilities: string[] = ['chat'];
    if (formData.hasVision) capabilities.push('vision');
    if (formData.hasEmbedding) capabilities.push('embedding');

    onSave({
      domain: formData.domain,
      name: formData.name,
      provider: formData.provider,
      modelName: formData.modelName,
      apiKey: formData.apiKey,
      capabilities: capabilities,
      properties: customProperties,
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Model' : 'Add New Model'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the configuration for this language model.' : 'Configure a new language model provider and its capabilities.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Domain */}
          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              placeholder="e.g., my.company.llm"
              required
              disabled={isEditing}
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., My GPT-4o"
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

          {/* Model Name (Provider Specific) */}
          <div className="space-y-2">
            <Label htmlFor="modelName">Model Name (Provider ID)</Label>
            <Input
              id="modelName"
              value={formData.modelName}
              onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
              placeholder="e.g., gpt-4o, claude-3-5-sonnet-20240620"
              required
            />
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
                <Label htmlFor="embedding" className="font-normal cursor-pointer">Embedding Support</Label>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <KeyValueTable
              initialData={customProperties}
              onChange={setCustomProperties}
              title="Properties"
              description="Configure model parameters and additional settings."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Save Changes' : 'Add Model'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
