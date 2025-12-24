import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, Bot, Brain, Wrench, Settings2, Loader2, AlertCircle, Plus, Edit, Trash2 } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
import { useAgents } from '../../hooks/useAgents';
import { useChatModels } from '../../hooks/useChatModels';
import type { AgentRole, AgentConfig } from './types';

import { providerLogos } from './constants';

export function Agents() {
    const navigate = useNavigate();
    const { agents, loading, error, deleteAgent } = useAgents();
    const { models } = useChatModels();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<string>('All');

    const [agentToDelete, setAgentToDelete] = useState<string | null>(null);

    const roles = ['All', 'ANALYZER', 'DECIDER', 'GENERATOR', 'VALIDATOR', 'ROUTER'];

    const filteredAgents = agents.filter((agent) => {
        const matchesSearch =
            (agent.name && agent.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (agent.domain && agent.domain.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (agent.id && agent.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (agent.description && agent.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            agent.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesRole = selectedRole === 'All' || agent.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    const roleColors: Record<AgentRole, string> = {
        ANALYZER: 'bg-purple-500/10 text-purple-600 border-purple-200',
        DECIDER: 'bg-orange-500/10 text-orange-600 border-orange-200',
        GENERATOR: 'bg-blue-500/10 text-blue-600 border-blue-200',
        VALIDATOR: 'bg-green-500/10 text-green-600 border-green-200',
        ROUTER: 'bg-pink-500/10 text-pink-600 border-pink-200',
    };

    const toggleExpanded = (domain: string) => {
        setExpandedId(expandedId === domain ? null : domain);
    };

    const handleAddNew = () => {
        navigate('/ai/agents/new');
    };

    const handleEdit = (agent: AgentConfig) => {
        navigate(`/ai/agents/${agent.domain}`);
    };

    const handleDelete = (domain: string) => {
        setAgentToDelete(domain);
    };

    const confirmDelete = async () => {
        if (!agentToDelete) return;
        try {
            await deleteAgent(agentToDelete);
        } catch (err) {
            // error handled in hook/service
        } finally {
            setAgentToDelete(null);
        }
    };


    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4 text-destructive">
                <AlertCircle className="h-8 w-8" />
                <p className="text-lg font-medium">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
                        <p className="text-muted-foreground">
                            Configure autonomous agents with specific roles, models, and tools
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 text-sm font-normal bg-primary/5 text-primary border-primary/20">
                            <Bot className="w-4 h-4" />
                            <span>{agents.length} agents configured</span>
                        </Badge>
                        <Button onClick={handleAddNew} className="gap-2">
                            <Plus className="w-4 h-4" />
                            New Agent
                        </Button>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex gap-4 flex-wrap">
                    <div className="flex-1 relative min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search agents by name, domain, or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        {roles.map((role) => (
                            <Button
                                key={role}
                                variant={selectedRole === role ? "default" : "outline"}
                                onClick={() => setSelectedRole(role)}
                                className="transition-colors"
                                size="sm"
                            >
                                {role}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Agents List */}
            <div className="space-y-4">
                {filteredAgents.map((agent) => {
                    const isExpanded = expandedId === agent.domain;
                    // Use domain as stable ID for UI keys if unique
                    const key = agent.domain || agent.id!;

                    return (
                        <Card key={key} className="overflow-hidden transition-all hover:border-primary/50 group">
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <CardTitle className="text-xl font-bold">{agent.name}</CardTitle>
                                            <Badge variant="outline" className={`${roleColors[agent.role]} font-medium`}>
                                                {agent.role}
                                            </Badge>
                                        </div>
                                        <div className="text-sm font-mono text-muted-foreground">
                                            {agent.domain} <span className="text-border mx-1">|</span> {agent.id}
                                        </div>
                                        <CardDescription className="text-base pt-1">
                                            {agent.description}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleEdit(agent)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(agent.domain)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleExpanded(agent.domain)}
                                        >
                                            {isExpanded ? (
                                                <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6 pt-0 pb-4">
                                {/* Meta Info Row */}
                                <div className="flex flex-wrap items-center gap-6 mb-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2" title="Model Domain">
                                        {(() => {
                                            const modelConfig = models.find(m => m.domain === agent.modelConfigDomain);
                                            const logoUrl = modelConfig?.provider ? providerLogos[modelConfig.provider] : null;

                                            return (
                                                <>
                                                    {logoUrl ? (
                                                        <img src={logoUrl} alt={modelConfig?.provider} className="w-4 h-4 object-contain rounded-sm" />
                                                    ) : (
                                                        <Brain className="w-4 h-4 text-primary/70" />
                                                    )}
                                                    <span className="font-medium text-foreground">
                                                        {modelConfig?.provider}-{modelConfig?.modelName} <small className='text-muted-foreground'>({agent.modelConfigDomain})</small>
                                                    </span>
                                                </>
                                            );
                                        })()}
                                    </div>
                                    <div className="h-4 w-px bg-border" />
                                    <div className="flex items-center gap-2">
                                        <Wrench className="w-4 h-4 text-primary/70" />
                                        <span>{agent.allowedMcpTools.length} Tools</span>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex items-center gap-2 ml-auto">
                                        {agent.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Instruction - Preview */}
                                <div className="bg-muted/50 rounded-lg p-3 font-mono text-sm text-foreground/80 border border-border/50 line-clamp-2">
                                    {agent.instructionPrompt}
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="mt-6 space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                                <Bot className="w-4 h-4" />
                                                Full Instruction Prompt
                                            </div>
                                            <div className="bg-muted rounded-lg p-4 text-sm overflow-x-auto whitespace-pre-wrap font-mono border border-border">
                                                {agent.instructionPrompt}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                                    <Wrench className="w-4 h-4" />
                                                    Allowed MCP Tools
                                                </div>
                                                <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border border-border/50">
                                                    {agent.allowedMcpTools.length > 0 ? (
                                                        agent.allowedMcpTools.map(tool => (
                                                            <Badge key={tool} variant="outline" className="bg-background">
                                                                {tool}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground italic">No tools assigned</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                                    <Settings2 className="w-4 h-4" />
                                                    Properties
                                                </div>
                                                <div className="p-3 bg-muted/30 rounded-lg border border-border/50 font-mono text-xs">
                                                    <pre>{JSON.stringify(agent.properties, null, 2)}</pre>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>

                        </Card>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredAgents.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No agents found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filter</p>
                    <Button variant="outline" onClick={handleAddNew} className="mt-4">
                        Create Agent
                    </Button>
                </div>
            )}

            <AlertDialog open={!!agentToDelete} onOpenChange={(open) => !open && setAgentToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the agent configuration.
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
