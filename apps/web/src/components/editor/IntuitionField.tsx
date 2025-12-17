'use client';

import { useState } from 'react';

interface IntuitionFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function IntuitionField({ value, onChange, placeholder }: IntuitionFieldProps) {
  const [isExpanded, setIsExpanded] = useState(!!value);

  return (
    <div className="border border-gray-200 rounded-lg bg-white p-6">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Declared Intuition (Layer 1)
          </h3>
          <p className="text-xs text-gray-500">
            State your initial idea or research hypothesis. This will be registered on-chain.
          </p>
        </div>
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Show
          </button>
        )}
      </div>

      {isExpanded && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'What is your initial idea or research hypothesis?'}
          className="w-full min-h-[120px] px-4 py-3 text-sm rounded-md focus:outline-none resize-none"
          maxLength={500}
        />
      )}

      {isExpanded && value && (
        <div className="mt-2 text-xs text-gray-500">
          {value.length} / 500 characters
        </div>
      )}
    </div>
  );
}

