import { useState } from 'react';
import { PaperAirplaneIcon, Cog6ToothIcon } from '@heroicons/react/24/solid';
import { DEFAULT_SETTINGS, type ApiSettings, type ResearchResponse, type ArticleResponse, getStructuredCompletion } from '../services/perplexityApi';
import SettingsPanel from './SettingsPanel';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  isResearchResponse?: boolean;
  citations?: string[];
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('perplexity_api_key') || '');
  const [settings, setSettings] = useState<ApiSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !apiKey) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setRelatedQuestions([]);

    try {
      const response = await getStructuredCompletion(input.trim(), apiKey, settings);
      
      const assistantMessage = {
        role: 'assistant' as const,
        content: response.choices[0].message.content,
        citations: response.citations,
        isResearchResponse: true
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      if (response.related_questions) {
        setRelatedQuestions(response.related_questions);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    localStorage.setItem('perplexity_api_key', newKey);
  };

  const renderMessage = (message: Message) => {
    if (message.role === 'user') {
      return message.content;
    }

    if (message.isResearchResponse) {
      try {
        const research: ResearchResponse | ArticleResponse = JSON.parse(message.content);
        
        // Check if it's an article response
        if ('sections' in research) {
          return (
            <div className="space-y-6">
              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {research.title}
              </h1>
              
              {/* Sections */}
              <div className="space-y-8">
                {research.sections.map((section, index) => (
                  <div key={index} className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {section.heading}
                    </h2>
                    <div className="prose dark:prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => {
                            const content = children?.toString() || '';
                            const parts = content.split(/(\[\d+\])/g);
                            return (
                              <p className="text-gray-700 dark:text-gray-300">
                                {parts.map((part, i) => {
                                  const citationMatch = part.match(/\[(\d+)\]/);
                                  if (citationMatch) {
                                    const citationNumber = parseInt(citationMatch[1]);
                                    const citation = research.citations.find(c => c.number === citationNumber);
                                    if (citation) {
                                      return (
                                        <a
                                          key={i}
                                          href={citation.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                          {part}
                                        </a>
                                      );
                                    }
                                  }
                                  return part;
                                })}
                              </p>
                            );
                          }
                        }}
                      >
                        {section.content}
                      </ReactMarkdown>
                    </div>
                    
                    {section.subsections && section.subsections.length > 0 && (
                      <div className="pl-4 space-y-4 mt-4 border-l-2 border-gray-200 dark:border-gray-700">
                        {section.subsections.map((subsection, subIndex) => (
                          <div key={subIndex}>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {subsection.heading}
                            </h3>
                            <div className="prose dark:prose-invert max-w-none mt-2">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => {
                                    const content = children?.toString() || '';
                                    const parts = content.split(/(\[\d+\])/g);
                                    return (
                                      <p className="text-gray-700 dark:text-gray-300">
                                        {parts.map((part, i) => {
                                          const citationMatch = part.match(/\[(\d+)\]/);
                                          if (citationMatch) {
                                            const citationNumber = parseInt(citationMatch[1]);
                                            const citation = research.citations.find(c => c.number === citationNumber);
                                            if (citation) {
                                              return (
                                                <a
                                                  key={i}
                                                  href={citation.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-blue-600 dark:text-blue-400 hover:underline"
                                                >
                                                  {part}
                                                </a>
                                              );
                                            }
                                          }
                                          return part;
                                        })}
                                      </p>
                                    );
                                  }
                                }}
                              >
                                {subsection.content}
                              </ReactMarkdown>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Summary Table */}
              {research.summary_table && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Zusammenfassung
                  </h3>
                  <div className="prose dark:prose-invert max-w-none overflow-x-auto">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ children }) => (
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            {children}
                          </table>
                        ),
                        thead: ({ children }) => (
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            {children}
                          </thead>
                        ),
                        th: ({ children }) => (
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
                            {children}
                          </td>
                        )
                      }}
                    >
                      {research.summary_table}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
              
              {/* Citations */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Citations
                </h3>
                <ul className="space-y-2">
                  {research.citations.map((citation, index) => (
                    <li key={index} className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">[{citation.number}]</span>{' '}
                      <a
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {citation.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        }
        
        // If not an article, render as research response
        return (
          <div className="space-y-6">
            {/* Summary Section */}
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Summary
              </h3>
              <p className="text-blue-800 dark:text-blue-200">{research.summary}</p>
            </div>
            
            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Analysis
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {research.analysis}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Key Findings
                  </h3>
                  <ul className="space-y-4">
                    {research.findings.map((finding, index) => (
                      <li key={index} className="pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <p className="font-medium text-gray-900 dark:text-white mb-1">
                          {index + 1}. {finding.point}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {finding.evidence}
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-400 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                          Citations: {finding.citations.join(', ')}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Methodology
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {research.methodology}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Limitations
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {research.limitations}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Next Steps
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {research.nextSteps}
                  </p>
                </div>
              </div>
            </div>

            {/* Citations and Sources */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {research.citations && research.citations.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Citations
                  </h3>
                  <ul className="list-decimal list-inside space-y-2 text-sm">
                    {research.citations.map((citation, index) => (
                      <li key={index} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                        <a href={citation} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">
                          {citation}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Sources
                </h3>
                <ul className="list-decimal list-inside space-y-2 text-sm">
                  {research.sources.map((source, index) => (
                    <li key={index} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                      <a href={source} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">
                        {source}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      } catch (error) {
        // If JSON parsing fails, render as markdown
        return (
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        );
      }
    }

    // For regular messages, render with markdown and clickable citations
    return (
      <div className="space-y-4">
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              p: ({ children }) => {
                const content = children?.toString() || '';
                const parts = content.split(/(\[\d+\])/g);
                return (
                  <p className="text-gray-700 dark:text-gray-300">
                    {parts.map((part, i) => {
                      const citationMatch = part.match(/\[(\d+)\]/);
                      if (citationMatch && message.citations) {
                        const citationIndex = parseInt(citationMatch[1]) - 1;
                        const citation = message.citations[citationIndex];
                        if (citation) {
                          return (
                            <a
                              key={i}
                              href={citation}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {part}
                            </a>
                          );
                        }
                      }
                      return part;
                    })}
                  </p>
                );
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        {message.citations && message.citations.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg mt-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Citations
            </h3>
            <ul className="list-decimal list-inside space-y-1 text-sm">
              {message.citations.map((citation, index) => (
                <li key={index} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                  <a href={citation} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">
                    {citation}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 max-w-4xl mx-auto h-[calc(100vh-10rem)]">
      <div className="flex flex-col h-full">
        {/* API Key Input */}
        <div className="p-4 border-b border-gray-200/80 dark:border-gray-700/80 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <input
                type="password"
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder="Enter your Perplexity API key"
                className="w-full p-2.5 pl-10 rounded-lg border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Open settings"
            >
              <Cog6ToothIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm dark:text-white shadow-md'
                }`}
              >
                {renderMessage(message)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-center">
              <div className="animate-pulse flex space-x-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          )}
          
          {/* Related Questions */}
          {relatedQuestions.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Related Questions
              </h3>
              <div className="flex flex-wrap gap-2">
                {relatedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(question);
                      // Optional: Automatically submit the question
                      // handleSubmit(new Event('submit') as React.FormEvent);
                    }}
                    className="text-sm px-3 py-1.5 rounded-lg bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 border border-gray-200/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 transition-colors duration-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200/80 dark:border-gray-700/80">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 dark:text-white"
              disabled={isLoading || !apiKey}
            />
            <button
              type="submit"
              disabled={isLoading || !apiKey || !input.trim()}
              className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </form>

        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSettingsChange={setSettings}
        />
      </div>
    </div>
  );
} 