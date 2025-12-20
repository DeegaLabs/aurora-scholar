'use client';

import { ReactNode } from 'react';

interface ExpandableSideCardProps {
  title: string;
  icon: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  position: 'left' | 'right';
}

export function ExpandableSideCard({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
  position,
}: ExpandableSideCardProps) {
  if (!isExpanded) {
    return (
      <div className={`flex items-center ${position === 'left' ? 'justify-start' : 'justify-end'}`}>
        <button
          onClick={onToggle}
          className="w-12 h-12 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 flex items-center justify-center transition"
          aria-label={`Expand ${title}`}
        >
          {icon}
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <div className="text-gray-600">{icon}</div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>
        <button
          onClick={onToggle}
          className="p-1 rounded hover:bg-gray-100 transition"
          aria-label={`Collapse ${title}`}
        >
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={position === 'left' ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

