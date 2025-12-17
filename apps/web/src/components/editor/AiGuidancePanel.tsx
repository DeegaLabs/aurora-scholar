'use client';

import { useState } from 'react';

interface ExpandableCardProps {
  title: string;
  icon?: React.ReactNode;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

function ExpandableCard({ title, icon, defaultExpanded = false, children }: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon && <div className="text-gray-600">{icon}</div>}
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 px-4 py-3">
          {children}
        </div>
      )}
    </div>
  );
}

interface AiGuidancePanelProps {
  content: string;
  declaredIntuition: string;
  onDeclaredIntuitionChange?: (value: string) => void;
  onOpenChat?: () => void;
}

export function AiGuidancePanel({ content, declaredIntuition, onDeclaredIntuitionChange, onOpenChat }: AiGuidancePanelProps) {
  const [isConnected] = useState(false); // TODO: Connect to AI service

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3 bg-white">
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

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Chat Card */}
        <ExpandableCard
          title="Chat"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
          defaultExpanded={false}
        >
          <button
            onClick={onOpenChat}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
          >
            Open Chat
          </button>
        </ExpandableCard>

        {/* Suggestions Card */}
        <ExpandableCard
          title="Suggestions"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          }
          defaultExpanded={true}
        >
          {content.trim() ? (
            <div className="text-sm text-gray-600">
              <p>Consider expanding your content with more details.</p>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Start writing to receive AI guidance.
            </div>
          )}
        </ExpandableCard>

        {/* Coherence Monitoring Card */}
        {declaredIntuition && (
          <ExpandableCard
            title="Coherence Monitoring"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            defaultExpanded={false}
          >
            <div className="text-xs text-gray-600">
              Monitoring alignment between your declared intuition and content...
            </div>
          </ExpandableCard>
        )}

        {/* Layers Card */}
        <ExpandableCard
          title="Ethical Layers"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
          defaultExpanded={true}
        >
          <div className="space-y-4">
            {/* Layer 1: Declared Intuition */}
            <div>
              <div className="mb-2">
                <p className="text-xs font-semibold text-gray-900 mb-1">Layer 1: Declared Intuition</p>
                <p className="text-xs text-gray-500">State your initial idea or research hypothesis. This will be registered on-chain.</p>
              </div>
              <textarea
                value={declaredIntuition}
                onChange={(e) => onDeclaredIntuitionChange?.(e.target.value)}
                placeholder="What is your initial idea or research hypothesis?"
                className="w-full min-h-[100px] px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                maxLength={500}
              />
              {declaredIntuition && (
                <div className="mt-1 text-xs text-gray-400">
                  {declaredIntuition.length} / 500 characters
                </div>
              )}
            </div>

            {/* Layer 2 & 3 Info */}
            <div className="space-y-2 pt-3 border-t border-gray-200">
              <div>
                <p className="text-xs font-medium text-gray-900 mb-1">Layer 2: Linguistic Mediation</p>
                <p className="text-xs text-gray-600">AI guidance without content generation</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900 mb-1">Layer 3: Coherence Monitoring</p>
                <p className="text-xs text-gray-600">Alignment verification between intuition and content</p>
              </div>
            </div>
          </div>
        </ExpandableCard>
      </div>
    </div>
  );
}

