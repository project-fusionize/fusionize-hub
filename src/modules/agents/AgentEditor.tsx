import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAgents } from '../../hooks/useAgents';
import { useChatModels } from '../../hooks/useChatModels';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { KeyValueTable } from "@/components/key-value-table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, ArrowLeft, Loader2, Newspaper, Server } from 'lucide-react';
import type { AgentRole, AgentConfig } from './types';
import { Separator } from '@/components/ui/separator';
import { providerLogos } from './constants';

export function AgentEditor() {
    const { domain } = useParams();
    const navigate = useNavigate();
    const { agents, addAgent, updateAgent, loading: agentsLoading } = useAgents();
    const { models } = useChatModels();

    const isEditing = !!domain;
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<Partial<AgentConfig>>({
        domain: '',
        name: '',
        description: '',
        role: 'ANALYZER',
        modelConfigDomain: '',
        instructionPrompt: '',
        tags: [],
        allowedMcpTools: [],
        properties: {},
    });

    const [currentTag, setCurrentTag] = useState('');
    const [currentTool, setCurrentTool] = useState('');

    const [properties, setProperties] = useState<Record<string, string>>({});

    // Load data if editing
    useEffect(() => {
        if (isEditing && agents.length > 0) {
            const agent = agents.find(a => a.domain === domain);
            if (agent) {
                setFormData({
                    id: agent.id,
                    domain: agent.domain,
                    name: agent.name,
                    description: agent.description,
                    role: agent.role,
                    modelConfigDomain: agent.modelConfigDomain,
                    instructionPrompt: agent.instructionPrompt,
                    tags: agent.tags,
                    allowedMcpTools: agent.allowedMcpTools,
                    properties: agent.properties,
                });

                // Flatten properties for KeyValueTable
                const props: Record<string, string> = {};
                if (agent.properties) {
                    Object.entries(agent.properties).forEach(([key, value]) => {
                        props[key] = String(value);
                    });
                }
                setProperties(props);
            } else if (!agentsLoading) {
                // Agent not found and not loading, maybe redirect?
                // For now, let's just leave it empty or show error
            }
        }
    }, [domain, agents, isEditing, agentsLoading]);


    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && currentTag.trim()) {
            e.preventDefault();
            if (!formData.tags?.includes(currentTag.trim())) {
                setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), currentTag.trim()] }));
            }
            setCurrentTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({ ...prev, tags: prev.tags?.filter(tag => tag !== tagToRemove) || [] }));
    };

    const handleAddTool = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && currentTool.trim()) {
            e.preventDefault();
            if (!formData.allowedMcpTools?.includes(currentTool.trim())) {
                setFormData(prev => ({ ...prev, allowedMcpTools: [...(prev.allowedMcpTools || []), currentTool.trim()] }));
            }
            setCurrentTool('');
        }
    };

    const removeTool = (toolToRemove: string) => {
        setFormData(prev => ({ ...prev, allowedMcpTools: prev.allowedMcpTools?.filter(tool => tool !== toolToRemove) || [] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Construct final object
        const finalAgent: AgentConfig = {
            id: formData.id,
            domain: formData.domain || '',
            name: formData.name || '',
            description: formData.description || '',
            role: formData.role as AgentRole,
            modelConfigDomain: formData.modelConfigDomain || '',
            instructionPrompt: formData.instructionPrompt || '',
            tags: formData.tags || [],
            allowedMcpTools: formData.allowedMcpTools || [],
            properties: properties,
        };

        try {
            if (isEditing) {
                await updateAgent(finalAgent.domain, finalAgent);
            } else {
                await addAgent(finalAgent);
            }
            navigate('/ai/agents');
        } catch (error) {
            console.error("Failed to save agent", error);
            // Handle error (maybe show toast)
        } finally {
            setLoading(false);
        }
    };

    if (agentsLoading && isEditing && !formData.domain) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-row h-[calc(100vh-16px)] w-full overflow-hidden">
            {/* Left Panel: Configuration Form */}
            <div className="w-[60%] min-w-[550px] flex flex-col bg-background h-full border-l">
                {/* Header & Controls */}
                <div className="flex items-center justify-between border-b px-8 py-4 bg-muted/20">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" type="button" onClick={() => navigate('/ai/agents')}>
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">{isEditing ? 'Edit Agent' : 'Create New Agent'}</h1>
                            <p className="text-sm text-muted-foreground">{isEditing ? formData.domain : 'New Configuration'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" onClick={() => navigate('/ai/agents')}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? 'Save Changes' : 'Create Agent'}
                        </Button>
                    </div>
                </div>

                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Domain */}
                        <div className="space-y-2">
                            <Label htmlFor="domain">Domain <span className="text-destructive">*</span></Label>
                            <Input
                                id="domain"
                                value={formData.domain}
                                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                placeholder="e.g., com.example.classifier"
                                required
                                disabled={isEditing}
                            />
                            <p className="text-xs text-muted-foreground">Unique identifier for this agent.</p>
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Agent Name <span className="text-destructive">*</span></Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Document Classifier"
                                required
                            />
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value: AgentRole) => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ANALYZER">ANALYZER</SelectItem>
                                    <SelectItem value="DECIDER">DECIDER</SelectItem>
                                    <SelectItem value="GENERATOR">GENERATOR</SelectItem>
                                    <SelectItem value="VALIDATOR">VALIDATOR</SelectItem>
                                    <SelectItem value="ROUTER">ROUTER</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Model */}
                        <div className="space-y-2">
                            <Label htmlFor="model">Model Domain</Label>
                            <Select
                                value={formData.modelConfigDomain}
                                onValueChange={(value) => setFormData({ ...formData, modelConfigDomain: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a model" />
                                </SelectTrigger>
                                <SelectContent>
                                    {models.map(model => (
                                        <SelectItem key={model.id} value={model.domain}>
                                            <div className="flex items-center gap-2">
                                                {model.provider && providerLogos[model.provider] ? (
                                                    <img
                                                        src={providerLogos[model.provider]}
                                                        alt={model.provider}
                                                        className="w-4 h-4 object-contain rounded-sm"
                                                    />
                                                ) : (
                                                    <Server className="w-4 h-4 text-muted-foreground" />
                                                )}
                                                <span>{model.name}</span>
                                                <span className="text-muted-foreground text-xs ml-1">({model.modelName || model.domain})</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of what this agent does..."
                            className="resize-none h-20"
                        />
                    </div>

                    {/* Allowed MCP Tools */}
                    <div className="space-y-2">
                        <Label>Allowed MCP Tools</Label>
                        <div className="flex flex-wrap gap-2 mb-2 p-3 border rounded-md min-h-[42px] bg-background">
                            {formData.allowedMcpTools?.map((tool) => (
                                <Badge key={tool} variant="secondary" className="gap-1 pr-1">
                                    {tool}
                                    <button type="button" onClick={() => removeTool(tool)} className="hover:text-destructive">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                            <input
                                type="text"
                                value={currentTool}
                                onChange={(e) => setCurrentTool(e.target.value)}
                                onKeyDown={handleAddTool}
                                placeholder="Type tool name & Enter..."
                                className="flex-1 bg-transparent outline-none text-sm min-w-[120px]"
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-2 mb-2 p-3 border rounded-md min-h-[42px] bg-background">
                            {formData.tags?.map((tag) => (
                                <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                            <input
                                type="text"
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyDown={handleAddTag}
                                placeholder="Type tag & Enter..."
                                className="flex-1 bg-transparent outline-none text-sm min-w-[120px]"
                            />
                        </div>
                    </div>

                    <div className="pt-2 pb-10">
                        <KeyValueTable
                            initialData={properties}
                            onChange={setProperties}
                            title="Properties"
                            description="Additional configuration properties (JSON serializable)."
                        />
                    </div>
                </div>
            </div>
            <Separator orientation='vertical' />

            {/* Right Panel: Instruction Prompt (IDE Style) */}
            <div className="flex-1 flex flex-col border-r border-border bg-slate-50 dark:bg-[#1e1e1e] min-w-[400px]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-slate-100 dark:bg-[#252526]">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground dark:text-gray-300">
                        <Newspaper className="h-4 w-4" /> Agent's Instructions (System Prompt)
                    </div>
                </div>
                <Textarea
                    id="instructionPrompt"
                    value={formData.instructionPrompt}
                    onChange={(e) => setFormData({ ...formData, instructionPrompt: e.target.value })}
                    placeholder="// Enter system prompt and instructions for the agent here..."
                    className="flex-1 w-full resize-none rounded-none border-0 bg-transparent p-4 font-mono text-sm text-foreground dark:text-gray-300 focus-visible:ring-0 placeholder:text-muted-foreground dark:placeholder:text-gray-600 leading-relaxed"
                    required
                />
            </div>


        </form>
    );
}
