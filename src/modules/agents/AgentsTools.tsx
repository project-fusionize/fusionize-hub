import { Search, Zap, Database, Globe, Code, FileText } from 'lucide-react';
import { useState } from 'react';

interface Tool {
  id: string;
  name: string;
  providedBy: string;
  description: string;
  capabilities: string[];
  usedInWorkflows: number;
  category: 'API' | 'Utility' | 'Data' | 'ML' | 'Custom';
  icon: any;
}

const mockTools: Tool[] = [
  {
    id: '1',
    name: 'DocumentExtractor',
    providedBy: 'fusionize-core',
    description: 'Extract structured data from PDFs, images, and documents using OCR and AI',
    capabilities: ['OCR', 'PDF parsing', 'Table extraction', 'Multi-language'],
    usedInWorkflows: 12,
    category: 'Data',
    icon: FileText,
  },
  {
    id: '2',
    name: 'CreditBureauAPI',
    providedBy: 'mcp-finance',
    description: 'Retrieve credit scores and financial data from credit bureaus',
    capabilities: ['Credit score', 'Credit history', 'Risk assessment'],
    usedInWorkflows: 8,
    category: 'API',
    icon: Database,
  },
  {
    id: '3',
    name: 'WebScraper',
    providedBy: 'mcp-web',
    description: 'Scrape and parse web pages, handle JavaScript rendering',
    capabilities: ['HTTP requests', 'CSS selectors', 'JavaScript rendering', 'Rate limiting'],
    usedInWorkflows: 15,
    category: 'Utility',
    icon: Globe,
  },
  {
    id: '4',
    name: 'SentimentAnalyzer',
    providedBy: 'fusionize-ml',
    description: 'Analyze sentiment and emotions in text using ML models',
    capabilities: ['Sentiment scoring', 'Emotion detection', 'Multi-language support'],
    usedInWorkflows: 6,
    category: 'ML',
    icon: Code,
  },
  {
    id: '5',
    name: 'EmailSender',
    providedBy: 'mcp-communication',
    description: 'Send emails with templates, attachments, and tracking',
    capabilities: ['SMTP', 'Templates', 'Attachments', 'Delivery tracking'],
    usedInWorkflows: 20,
    category: 'API',
    icon: Zap,
  },
  {
    id: '6',
    name: 'DataValidator',
    providedBy: 'fusionize-core',
    description: 'Validate data against schemas, rules, and business logic',
    capabilities: ['JSON Schema', 'Custom rules', 'Type checking', 'Error reporting'],
    usedInWorkflows: 18,
    category: 'Utility',
    icon: Code,
  },
  {
    id: '7',
    name: 'ImageClassifier',
    providedBy: 'fusionize-ml',
    description: 'Classify images using pre-trained or custom models',
    capabilities: ['Object detection', 'Classification', 'Custom models', 'Batch processing'],
    usedInWorkflows: 5,
    category: 'ML',
    icon: FileText,
  },
  {
    id: '8',
    name: 'DatabaseConnector',
    providedBy: 'mcp-data',
    description: 'Connect to SQL and NoSQL databases for queries and updates',
    capabilities: ['PostgreSQL', 'MongoDB', 'MySQL', 'Transactions'],
    usedInWorkflows: 14,
    category: 'Data',
    icon: Database,
  },
];

export function AgentsTools() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'API', 'Utility', 'Data', 'ML', 'Custom'];

  const filteredTools = mockTools.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryColors: Record<string, string> = {
    API: 'bg-blue-500/10 text-blue-600',
    Utility: 'bg-green-500/10 text-green-600',
    Data: 'bg-purple-500/10 text-purple-600',
    ML: 'bg-orange-500/10 text-orange-600',
    Custom: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl mb-2">Tools</h1>
            <p className="text-muted-foreground">
              MCP tools and utilities available to workflows (read-only)
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-500/10 px-4 py-2 rounded-lg">
            <Zap className="w-4 h-4 text-blue-600" />
            <span>{mockTools.length} tools registered</span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            />
          </div>

          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition-colors ${selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:bg-muted'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;

          return (
            <div
              key={tool.id}
              className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl ${categoryColors[tool.category]} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="truncate">{tool.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${categoryColors[tool.category]}`}>
                      {tool.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{tool.providedBy}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-foreground mb-4">{tool.description}</p>

              {/* Capabilities */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">Capabilities</div>
                <div className="flex flex-wrap gap-2">
                  {tool.capabilities.map((capability, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-muted text-muted-foreground rounded text-sm"
                    >
                      {capability}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Used in <span className="text-blue-600">{tool.usedInWorkflows} workflows</span>
                </span>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  View Schema →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg mb-2">No tools found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter</p>
        </div>
      )}
    </div>
  );
}
