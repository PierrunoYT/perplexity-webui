interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
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
    name: string;
    schema: object;
  };
}

export type ResponseFormat = JsonSchemaFormat;

type SearchRecencyFilter = 'year' | 'month' | 'week' | 'day' | 'hour';
type SearchContextSize = 'high' | 'medium' | 'low';

export interface WebSearchOptions {
  return_images?: boolean;
  return_related_questions?: boolean;
  search_domain_filter?: string[];
  search_recency_filter?: SearchRecencyFilter;
  search_context_size?: SearchContextSize;
  search_after_date_filter?: string;
  search_before_date_filter?: string;
  search_type?: 'fast' | 'pro' | 'auto';
}

export interface ApiSettings {
  model: 'sonar' | 'sonar-pro' | 'sonar-reasoning-pro' | 'sonar-deep-research';
  temperature: number;
  top_p: number;
  top_k: number;
  presence_penalty: number;
  frequency_penalty: number;
  max_tokens?: number;
  return_images?: boolean;
  return_related_questions?: boolean;
  web_search_options?: WebSearchOptions;
  search_domain_filter?: string[];
  search_recency_filter?: SearchRecencyFilter;
  search_context_size?: SearchContextSize;
  date_range_filter?: {
    start_date?: string; // ISO 8601 format
    end_date?: string;   // ISO 8601 format
  };
  response_format?: ResponseFormat;
  stream?: boolean;
  search_type?: 'fast' | 'pro' | 'auto';
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
  model: (getEnvVar('VITE_DEFAULT_MODEL', 'sonar') as ApiSettings['model']),
  temperature: parseFloat(getEnvVar('VITE_DEFAULT_TEMPERATURE', '0.7')),
  top_p: parseFloat(getEnvVar('VITE_DEFAULT_TOP_P', '0.9')),
  top_k: 0,
  presence_penalty: 0,
  frequency_penalty: 1,
  return_images: false,
  return_related_questions: false,
  search_context_size: 'low',
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

interface ResponseAnnotation {
  type: string;
  url?: string;
}

interface ResponseContentItem {
  type: string;
  text?: string;
  annotations?: ResponseAnnotation[];
}

interface ResponseOutputItem {
  type: string;
  role?: 'assistant' | 'system' | 'user';
  content?: ResponseContentItem[];
}

interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created_at: number;
  status: string;
  output?: ResponseOutputItem[];
  usage?: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
  citations?: string[];
  related_questions?: string[];
}

function mapResponseToChatCompletion(response: PerplexityResponse): ChatCompletionResponse {
  const contentChunks: string[] = [];
  const citations: string[] = [];

  for (const item of response.output || []) {
    if (item.type !== 'message' || item.role !== 'assistant' || !item.content) {
      continue;
    }

    for (const contentItem of item.content) {
      if (contentItem.text) {
        contentChunks.push(contentItem.text);
      }
      if (contentItem.annotations) {
        for (const annotation of contentItem.annotations) {
          if (annotation.type === 'citation' && annotation.url) {
            citations.push(annotation.url);
          }
        }
      }
    }
  }

  const assistantText = contentChunks.join('\n');
  const hasResponseCitations = response.citations && response.citations.length > 0;
  if (!assistantText && !hasResponseCitations) {
    throw new PerplexityAPIError('Empty response from Perplexity API');
  }

  return {
    id: response.id,
    model: response.model,
    object: response.object || 'response',
    created: response.created_at,
    citations: response.citations || citations,
    choices: [
      {
        index: 0,
        finish_reason: response.status || 'stop',
        message: {
          role: 'assistant',
          content: assistantText
        },
        delta: {
          role: 'assistant',
          content: assistantText
        }
      }
    ],
    usage: {
      prompt_tokens: response.usage?.input_tokens || 0,
      completion_tokens: response.usage?.output_tokens || 0,
      total_tokens: response.usage?.total_tokens || 0
    },
    related_questions: response.related_questions
  };
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
    const webSearchOptions: WebSearchOptions = {
      ...settings.web_search_options,
      return_images: settings.return_images,
      return_related_questions: settings.return_related_questions,
      search_domain_filter: settings.search_domain_filter,
      search_recency_filter: settings.search_recency_filter,
      search_context_size: settings.search_context_size || settings.web_search_options?.search_context_size,
      search_type: settings.search_type || settings.web_search_options?.search_type
    };

    if (settings.date_range_filter?.start_date) {
      webSearchOptions.search_after_date_filter = settings.date_range_filter.start_date;
    }
    if (settings.date_range_filter?.end_date) {
      webSearchOptions.search_before_date_filter = settings.date_range_filter.end_date;
    }

    const sanitizedWebSearchOptions = Object.fromEntries(
      Object.entries(webSearchOptions).filter(([, value]) => value !== undefined)
    ) as WebSearchOptions;

    const requestBody: Record<string, unknown> = {
      model: settings.model,
      input: messages,
      temperature: settings.temperature,
      top_p: settings.top_p,
      max_output_tokens: settings.max_tokens,
      stream: settings.stream ?? false,
      web_search_options: Object.keys(sanitizedWebSearchOptions).length
        ? sanitizedWebSearchOptions
        : undefined,
      response_format: settings.response_format
    };

    if (!requestBody.max_output_tokens) {
      delete requestBody.max_output_tokens;
    }

    const response = await fetch('https://api.perplexity.ai/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new PerplexityAPIError(
        `API request failed: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();
    return mapResponseToChatCompletion(data);
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
        name: 'article_schema',
        schema: ARTICLE_SCHEMA
      }
    }
  };

  return getChatCompletion(messages, apiKey, structuredSettings);
}
