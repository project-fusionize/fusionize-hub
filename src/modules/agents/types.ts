export type AgentRole = 'ANALYZER' | 'DECIDER' | 'GENERATOR' | 'VALIDATOR' | 'ROUTER';

export interface AgentConfig {
    id?: string;
    domain: string;
    name: string;
    description: string;
    tags: string[];
    modelConfigDomain: string;
    instructionPrompt: string;
    allowedMcpTools: string[];
    role: AgentRole;
    properties: Record<string, any>;
}
