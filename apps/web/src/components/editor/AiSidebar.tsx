'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface AiSidebarProps {
  content: string;
  declaredIntuition: string;
}

interface AiSuggestion {
  type: 'suggestion' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}

export function AiSidebar({ content, declaredIntuition }: AiSidebarProps) {
  const t = useTranslations('editor');
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate AI suggestions (will be replaced with real API call)
  useEffect(() => {
    if (!content.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      // Mock suggestions
      const mockSuggestions: AiSuggestion[] = [];
      
      if (content.length < 100) {
        mockSuggestions.push({
          type: 'info',
          message: 'Consider expanding your content with more details.',
          timestamp: new Date(),
        });
      }

      if (declaredIntuition && !content.includes(declaredIntuition.split(' ')[0])) {
        mockSuggestions.push({
          type: 'warning',
          message: 'Ensure your content aligns with your declared intuition.',
          timestamp: new Date(),
        });
      }

      setSuggestions(mockSuggestions);
      setIsLoading(false);
      setIsConnected(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, declaredIntuition]);

  const handleAskAi = () => {
    // TODO: Open chat modal
    alert('AI chat feature coming soon');
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white h-fit sticky top-24">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">AI Guidance</h3>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
            <span className="text-xs text-gray-500">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Ask AI Button */}
        <button
          onClick={handleAskAi}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
        >
          Ask AI Guidance
        </button>

        {/* Suggestions */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Suggestions
          </h4>

          {isLoading ? (
            <div className="text-sm text-gray-500">Analyzing...</div>
          ) : suggestions.length === 0 ? (
            <div className="text-sm text-gray-500">
              {content.trim()
                ? 'No suggestions at the moment. Keep writing!'
                : 'Start writing to receive AI guidance.'}
            </div>
          ) : (
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md text-sm ${
                    suggestion.type === 'warning'
                      ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                      : suggestion.type === 'info'
                      ? 'bg-blue-50 border border-blue-200 text-blue-800'
                      : 'bg-gray-50 border border-gray-200 text-gray-800'
                  }`}
                >
                  {suggestion.message}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coherence Monitoring (Layer 3) */}
        {declaredIntuition && content && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Coherence Monitoring
            </h4>
            <div className="text-xs text-gray-600">
              Monitoring alignment between your declared intuition and content...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

