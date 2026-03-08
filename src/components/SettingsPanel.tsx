import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ApiSettings, ResponseFormat } from '../services/perplexityApi';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ApiSettings;
  onSettingsChange: (settings: ApiSettings) => void;
}

export default function SettingsPanel({ isOpen, onClose, settings, onSettingsChange }: SettingsPanelProps) {
  const [jsonSchema, setJsonSchema] = useState('');
  const [outputType, setOutputType] = useState<'none' | 'json'>('none');

  const handleChange = (key: keyof ApiSettings, value: ApiSettings[keyof ApiSettings]) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const handleStructuredOutputChange = (type: 'none' | 'json', value?: string) => {
    setOutputType(type);

    let responseFormat: ResponseFormat | undefined;

    if (type === 'json' && value) {
      try {
        const schema = JSON.parse(value);
        responseFormat = {
          type: 'json_schema',
          json_schema: {
            name: 'custom_schema',
            schema
          }
        };
      } catch (error) {
        console.error('Invalid JSON schema:', error);
        return;
      }
    }

    onSettingsChange({
      ...settings,
      response_format: responseFormat
    });
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-gray-800 shadow-xl">
                    <div className="px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                          API Settings
                        </Dialog.Title>
                        <button
                          type="button"
                          className="relative rounded-md text-gray-400 hover:text-gray-500"
                          onClick={onClose}
                        >
                          <XMarkIcon className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                    <div className="relative flex-1 px-4 sm:px-6">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Model
                          </label>
                          <select
                            value={settings.model}
                            onChange={(e) => handleChange('model', e.target.value as ApiSettings['model'])}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="sonar">sonar (Fast, cost-effective)</option>
                            <option value="sonar-pro">sonar-pro (Advanced search)</option>
                            <option value="sonar-reasoning-pro">sonar-reasoning-pro (Premier reasoning)</option>
                            <option value="sonar-deep-research">sonar-deep-research (Exhaustive research)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Temperature ({settings.temperature})
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={settings.temperature}
                            onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                            className="mt-1 w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Top P ({settings.top_p})
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={settings.top_p}
                            onChange={(e) => handleChange('top_p', parseFloat(e.target.value))}
                            className="mt-1 w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Max Tokens</label>
                          <input
                            type="number"
                            value={settings.max_tokens || ''}
                            onChange={(e) => handleChange('max_tokens', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="Optional"
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Presence Penalty ({settings.presence_penalty})
                          </label>
                          <input
                            type="range"
                            min="-2"
                            max="2"
                            step="0.1"
                            value={settings.presence_penalty}
                            onChange={(e) => handleChange('presence_penalty', parseFloat(e.target.value))}
                            className="mt-1 w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Frequency Penalty ({settings.frequency_penalty})
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={settings.frequency_penalty}
                            onChange={(e) => handleChange('frequency_penalty', parseFloat(e.target.value))}
                            className="mt-1 w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Return Images
                          </label>
                          <input
                            type="checkbox"
                            checked={settings.return_images || false}
                            onChange={(e) => handleChange('return_images', e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Return Related Questions
                          </label>
                          <input
                            type="checkbox"
                            checked={settings.return_related_questions || false}
                            onChange={(e) => handleChange('return_related_questions', e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Search Recency Filter
                          </label>
                          <select
                            value={settings.search_recency_filter || ''}
                            onChange={(e) => handleChange('search_recency_filter', (e.target.value || undefined) as ApiSettings['search_recency_filter'])}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="">None</option>
                            <option value="month">Month</option>
                            <option value="week">Week</option>
                            <option value="day">Day</option>
                            <option value="hour">Hour</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Search Context Size
                          </label>
                          <select
                            value={settings.search_context_size || 'low'}
                            onChange={(e) => handleChange('search_context_size', (e.target.value || undefined) as ApiSettings['search_context_size'])}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="low">Low (Cost-efficient)</option>
                            <option value="medium">Medium (Balanced)</option>
                            <option value="high">High (Maximum depth)</option>
                          </select>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Controls search depth and cost. Higher = more thorough but more expensive.
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Search Domain Filter (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={settings.search_domain_filter?.join(',') || ''}
                            onChange={(e) => handleChange('search_domain_filter', e.target.value ? e.target.value.split(',') : undefined)}
                            placeholder="e.g. example.com,-excludedomain.com"
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Add - prefix to exclude domains. Max 3 domains.
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Search Type
                          </label>
                          <select
                            value={settings.search_type || 'auto'}
                            onChange={(e) => handleChange('search_type', (e.target.value || undefined) as ApiSettings['search_type'])}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="auto">Auto</option>
                            <option value="fast">Fast</option>
                            <option value="pro">Pro</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Date Range Filter
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="date"
                              value={settings.date_range_filter?.start_date || ''}
                              onChange={(e) => handleChange('date_range_filter', {
                                ...settings.date_range_filter,
                                start_date: e.target.value || undefined
                              })}
                              placeholder="Start date"
                              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            <input
                              type="date"
                              value={settings.date_range_filter?.end_date || ''}
                              onChange={(e) => handleChange('date_range_filter', {
                                ...settings.date_range_filter,
                                end_date: e.target.value || undefined
                              })}
                              placeholder="End date"
                              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Filter search results by date range (ISO 8601 format).
                          </p>
                        </div>

                        {/* Structured Output Section */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Structured Output (Available to All Users)
                          </h4>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Output Type
                              </label>
                              <select
                                value={outputType}
                                onChange={(e) => handleStructuredOutputChange(e.target.value as 'none' | 'json')}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              >
                                <option value="none">None</option>
                                <option value="json">JSON Schema (All models)</option>
                              </select>
                            </div>

                            {outputType === 'json' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                  JSON Schema
                                </label>
                                <div className="mt-1">
                                  <textarea
                                    value={jsonSchema}
                                    onChange={(e) => {
                                      setJsonSchema(e.target.value);
                                      handleStructuredOutputChange('json', e.target.value);
                                    }}
                                    rows={6}
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Enter valid JSON schema..."
                                  />
                                </div>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                  Must be a valid JSON schema object. Recursive schemas are not supported.
                                </p>
                              </div>
                            )}

                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
