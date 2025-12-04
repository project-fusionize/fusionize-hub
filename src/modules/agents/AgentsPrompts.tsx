import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, FileText, Tag } from 'lucide-react';

interface Prompt {
  id: string;
  name: string;
  type: 'System' | 'Template' | 'Instruction';
  description: string;
  tags: string[];
  snippet: string;
  fullBody: string;
  providedBy: string;
  usedInWorkflows: number;
}

const mockPrompts: Prompt[] = [
  {
    id: '1',
    name: 'Document Classification',
    type: 'System',
    description: 'Classify documents into predefined categories with confidence scores',
    tags: ['classification', 'documents', 'multi-class'],
    snippet: 'You are an expert document classifier. Analyze the following document...',
    fullBody: `You are an expert document classifier. Analyze the following document and classify it into one of these categories: Invoice, Receipt, Contract, Letter, Report, or Other.

Provide your response in JSON format with:
- category: the classified category
- confidence: a score from 0-1
- reasoning: brief explanation

Document content:
{{document_text}}`,
    providedBy: 'fusionize-core',
    usedInWorkflows: 8,
  },
  {
    id: '2',
    name: 'Entity Extraction',
    type: 'Template',
    description: 'Extract named entities (people, organizations, locations) from text',
    tags: ['NER', 'extraction', 'entities'],
    snippet: 'Extract all named entities from the following text, including...',
    fullBody: `Extract all named entities from the following text, including:
- PERSON: People's names
- ORG: Organizations, companies, institutions
- LOC: Locations, cities, countries
- DATE: Dates and times
- MONEY: Monetary values

Text:
{{input_text}}

Return as JSON array with fields: text, type, start_pos, end_pos`,
    providedBy: 'mcp-nlp',
    usedInWorkflows: 12,
  },
  {
    id: '3',
    name: 'Sentiment Analysis',
    type: 'Instruction',
    description: 'Analyze sentiment and emotions in customer feedback',
    tags: ['sentiment', 'emotions', 'customer-feedback'],
    snippet: 'Analyze the sentiment of the following customer feedback...',
    fullBody: `Analyze the sentiment of the following customer feedback. Consider:
1. Overall sentiment (positive, negative, neutral)
2. Sentiment score (-1 to 1)
3. Key emotions detected (joy, anger, sadness, etc.)
4. Specific pain points or praise

Customer feedback:
{{feedback_text}}

Respond in structured JSON format.`,
    providedBy: 'fusionize-ml',
    usedInWorkflows: 6,
  },
  {
    id: '4',
    name: 'Code Review',
    type: 'System',
    description: 'Review code for bugs, security issues, and best practices',
    tags: ['code', 'review', 'security'],
    snippet: 'You are a senior software engineer reviewing code. Analyze...',
    fullBody: `You are a senior software engineer reviewing code. Analyze the following code for:

1. Potential bugs and errors
2. Security vulnerabilities
3. Performance issues
4. Code style and best practices
5. Suggestions for improvement

Code:
\`\`\`{{language}}
{{code}}
\`\`\`

Provide detailed feedback with line numbers and severity levels (critical, high, medium, low).`,
    providedBy: 'mcp-dev-tools',
    usedInWorkflows: 4,
  },
  {
    id: '5',
    name: 'Translation',
    type: 'Template',
    description: 'Translate text between languages while preserving context',
    tags: ['translation', 'i18n', 'localization'],
    snippet: 'Translate the following text from {{source_lang}} to {{target_lang}}...',
    fullBody: `Translate the following text from {{source_lang}} to {{target_lang}}.

Important guidelines:
- Maintain the original tone and style
- Preserve formatting and special characters
- Keep technical terms accurate
- Adapt idioms appropriately for target culture

Source text:
{{text}}`,
    providedBy: 'mcp-translation',
    usedInWorkflows: 10,
  },
  {
    id: '6',
    name: 'RAG Query',
    type: 'System',
    description: 'Answer questions using retrieved context from knowledge base',
    tags: ['RAG', 'QA', 'knowledge-base'],
    snippet: 'You are a helpful assistant. Use the provided context to answer...',
    fullBody: `You are a helpful assistant. Use the provided context from the knowledge base to answer the user's question.

Guidelines:
- Only use information from the provided context
- If the context doesn't contain relevant information, say so
- Cite specific parts of the context when possible
- Provide concise, accurate answers

Context:
{{retrieved_context}}

Question:
{{user_question}}

Answer:`,
    providedBy: 'fusionize-rag',
    usedInWorkflows: 15,
  },
];

export function AgentsPrompts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('All');

  const types = ['All', 'System', 'Template', 'Instruction'];

  const filteredPrompts = mockPrompts.filter((prompt) => {
    const matchesSearch =
      prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'All' || prompt.type === selectedType;
    return matchesSearch && matchesType;
  });

  const typeColors: Record<string, string> = {
    System: 'bg-purple-500/10 text-purple-600',
    Template: 'bg-blue-500/10 text-blue-600',
    Instruction: 'bg-green-500/10 text-green-600',
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl mb-2">Prompts</h1>
            <p className="text-muted-foreground">
              Reusable prompt templates registered via MCP and plugins (read-only)
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-500/10 px-4 py-2 rounded-lg">
            <FileText className="w-4 h-4 text-green-600" />
            <span>{mockPrompts.length} prompts available</span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search prompts or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            />
          </div>

          <div className="flex gap-2">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg transition-colors ${selectedType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:bg-muted'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prompts List */}
      <div className="space-y-4">
        {filteredPrompts.map((prompt) => {
          const isExpanded = expandedId === prompt.id;

          return (
            <div
              key={prompt.id}
              className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all"
            >
              {/* Header - Always Visible */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3>{prompt.name}</h3>
                      <span className={`px-2 py-1 rounded text-sm ${typeColors[prompt.type]}`}>
                        {prompt.type}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{prompt.description}</p>
                  </div>
                  <button
                    onClick={() => toggleExpanded(prompt.id)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors ml-4"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  {prompt.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-muted text-muted-foreground rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Snippet - Always Visible */}
                <div className="bg-muted/30 rounded-lg p-3 font-mono text-sm text-foreground">
                  {prompt.snippet}...
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                  <span>Provided by: {prompt.providedBy}</span>
                  <span>Used in <span className="text-blue-600">{prompt.usedInWorkflows} workflows</span></span>
                </div>
              </div>

              {/* Expanded Content */}
              {
                isExpanded && (
                  <div className="border-t border-border p-6 bg-muted/30">
                    <div className="mb-2 text-sm text-muted-foreground">Full Prompt Body</div>
                    <pre className="bg-card border border-border rounded-lg p-4 text-sm overflow-x-auto whitespace-pre-wrap text-foreground">
                      {prompt.fullBody}
                    </pre>
                  </div>
                )
              }
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {
        filteredPrompts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg mb-2">No prompts found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter</p>
          </div>
        )
      }
    </div >
  );
}
