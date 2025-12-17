import { useState } from 'react';
import { Plus, Edit2, Trash2, Power, Server } from 'lucide-react';
import { ModelConfigModal } from './ModelConfigModal';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from '../../auth/AuthContext';
import { useChatModels, type Model } from '../../hooks/useChatModels';

export function AgentsModels() {
  const { isAuthenticated, login } = useAuth();
  const { models, loading, addModel, updateModel, deleteModel, toggleModelEnabled } = useChatModels();
  const [showModal, setShowModal] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);

  const providerLogos: Record<string, string> = {
    'OpenAI': 'https://logos-api.apistemic.com/domain:openai.com',
    'Anthropic': 'https://logos-api.apistemic.com/domain:anthropic.com',
    'Azure': 'https://logos-api.apistemic.com/domain:microsoft.com',
    'Google': 'https://logos-api.apistemic.com/domain:google.com',
  };

  const modeColors = {
    Chat: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20',
    Vision: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20',
    Embedding: 'bg-green-500/10 text-green-600 hover:bg-green-500/20',
  };

  const handleDeleteClick = (domain: string) => {
    setModelToDelete(domain);
  };

  const handleEditClick = (model: Model) => {
    setEditingModel(model);
    setShowModal(true);
  };

  const handleAddClick = () => {
    setEditingModel(null);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!modelToDelete) return;
    try {
      await deleteModel(modelToDelete);
    } catch (error) {
      alert('Failed to delete model');
    } finally {
      setModelToDelete(null);
    }
  };

  const handleSaveModel = async (modelData: any) => {
    try {
      if (editingModel) {
        await updateModel(editingModel.domain, modelData);
      } else {
        await addModel(modelData);
      }
      setShowModal(false);
      setEditingModel(null);
    } catch (error) {
      alert(`Failed to ${editingModel ? 'update' : 'add'} model`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">Authentication Required</h2>
        <p className="text-muted-foreground">Please login to manage models.</p>
        <Button onClick={login}>Login</Button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Models</h1>
          <p className="text-muted-foreground">
            Manage LLM model configurations and API connections
          </p>
        </div>
        <Button onClick={handleAddClick}>
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
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Model Name</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Config</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No models found. Add a new model to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  models.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell>
                        <div className="flex flex-col">
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
                          <span className="text-xs text-muted-foreground">{model.domain}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {model.provider === 'Local' ? (
                            <Server className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <img
                              src={providerLogos[model.provider] || 'https://logos-api.apistemic.com/domain:openai.com'}
                              alt={model.provider}
                              className="w-5 h-5 object-contain rounded-sm"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://logos-api.apistemic.com/domain:openai.com';
                                (e.target as HTMLImageElement).onerror = null;
                              }}
                            />
                          )}
                          <span>{model.provider}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{model.modelName || '-'}</span>
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
                          <Button variant="ghost" size="icon" title="Edit" onClick={() => handleEditClick(model)}>
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleModelEnabled(model.id)}
                            title={model.enabled ? 'Disable' : 'Enable'}
                          >
                            <Power className={`w-4 h-4 ${model.enabled ? 'text-green-600' : 'text-muted-foreground'}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(model.domain)}
                            className="hover:text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Model Config Modal */}
      {showModal && (
        <ModelConfigModal
          onClose={() => {
            setShowModal(false);
            setEditingModel(null);
          }}
          onSave={handleSaveModel}
          initialData={editingModel}
        />
      )}

      <AlertDialog open={!!modelToDelete} onOpenChange={(open) => !open && setModelToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the model configuration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
