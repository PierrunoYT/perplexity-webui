interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ResearchResponse {
  summary: string;
  analysis: string;
  methodology: string;
  findings: Array<{
    point: string;
    evidence: string;
    citations: string[];
  }>;
  limitations: string;
  sources: string[];
  nextSteps: string;
  citations?: string[];
}

export interface JsonSchemaFormat {
  type: 'json_schema';
  json_schema: {
    schema: object;
  };
}

export interface RegexFormat {
  type: 'regex';
  regex: {
    regex: string;
  };
}

export type ResponseFormat = JsonSchemaFormat | RegexFormat;

export interface ApiSettings {
  model: 'sonar' | 'sonar-pro' | 'sonar-reasoning' | 'sonar-reasoning-pro' | 'sonar-medium';
  temperature: number;
  top_p: number;
  top_k: number;
  presence_penalty: number;
  frequency_penalty: number;
  max_tokens?: number;
  return_images?: boolean;
  return_related_questions?: boolean;
  search_domain_filter?: string[];
  search_recency_filter?: 'month' | 'week' | 'day' | 'hour';
  response_format?: ResponseFormat;
  stream?: boolean;
}

// Environment variable helpers
export const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];
  if (!value && !defaultValue) {
    console.warn(`Environment variable ${key} is not set`);
  }
  return value || defaultValue || '';
};

export const DEFAULT_SETTINGS: ApiSettings = {
  model: (getEnvVar('VITE_DEFAULT_MODEL', 'sonar-medium') as ApiSettings['model']),
  temperature: parseFloat(getEnvVar('VITE_DEFAULT_TEMPERATURE', '0.7')),
  top_p: parseFloat(getEnvVar('VITE_DEFAULT_TOP_P', '0.9')),
  top_k: 0,
  presence_penalty: 0,
  frequency_penalty: 1,
  return_images: false,
  return_related_questions: false,
  stream: false
};

export interface ChatCompletionResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  citations: string[];
  choices: {
    index: number;
    finish_reason: string;
    message: Message;
    delta: {
      role: string;
      content: string;
    };
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  related_questions?: string[];
}

// Custom error types
export class PerplexityAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'PerplexityAPIError';
  }
}

export async function getChatCompletion(
  messages: Message[],
  apiKey: string,
  settings: ApiSettings
): Promise<ChatCompletionResponse> {
  if (!apiKey.trim()) {
    throw new PerplexityAPIError('API key is required');
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...settings,
        messages,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new PerplexityAPIError(
        `API request failed: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof PerplexityAPIError) {
      throw error;
    }
    throw new PerplexityAPIError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export const ARTICLE_SCHEMA = {
  type: 'object',
  required: ['title', 'sections', 'citations'],
  properties: {
    title: { type: 'string' },
    sections: {
      type: 'array',
      items: {
        type: 'object',
        required: ['heading', 'content'],
        properties: {
          heading: { type: 'string' },
          content: { type: 'string' },
          subsections: {
            type: 'array',
            items: {
              type: 'object',
              required: ['heading', 'content'],
              properties: {
                heading: { type: 'string' },
                content: { type: 'string' }
              }
            }
          }
        }
      }
    },
    summary_table: {
      type: 'string',
      description: 'A markdown-formatted table with summary data'
    },
    citations: {
      type: 'array',
      items: {
        type: 'object',
        required: ['number', 'url'],
        properties: {
          number: { type: 'number' },
          url: { type: 'string' }
        }
      }
    }
  }
};

export interface ArticleResponse {
  title: string;
  sections: Array<{
    heading: string;
    content: string;
    subsections?: Array<{
      heading: string;
      content: string;
    }>;
  }>;
  summary_table?: string;
  citations: Array<{
    number: number;
    url: string;
  }>;
}

export const ARTICLE_PROMPT = `You are a knowledgeable assistant. Format responses as structured articles with:
- A clear, concise title
- Well-organized sections with headings
- Subsections where appropriate for detailed breakdowns
- A summary table in markdown format if numerical/comparative data is present (use | for columns)
- Numbered citations linking to reliable sources
- Clean, consistent formatting throughout

For tables, use markdown format like this:
| Header 1 | Header 2 |
|----------|----------|
| Data 1   | Data 2   |

Guidelines:
1. Search globally in multiple languages for comprehensive coverage
2. Include sources from academic papers, research institutions, and expert analysis
3. Use numbered citations [1], [2], etc. throughout the content
4. Consider multiple perspectives and competing theories
5. Prioritize peer-reviewed research and primary sources
6. Maintain academic rigor while being accessible`;

export async function getStructuredCompletion(
  query: string,
  apiKey: string,
  settings: ApiSettings
): Promise<ChatCompletionResponse> {
  const messages: Message[] = [
    {
      role: 'system',
      content: ARTICLE_PROMPT
    },
    {
      role: 'user',
      content: query
    }
  ];

  const structuredSettings: ApiSettings = {
    ...settings,
    response_format: {
      type: 'json_schema',
      json_schema: {
        schema: ARTICLE_SCHEMA
      }
    }
  };

  return getChatCompletion(messages, apiKey, structuredSettings);
}