'use client';

import { useMemo } from 'react';

export interface JournalFilters {
  query: string;
  author: string;
  sort: 'newest' | 'oldest';
}

interface SearchFilterProps {
  value: JournalFilters;
  onChange: (value: JournalFilters) => void;
  authors?: string[];
}

function uniq(xs: string[]) {
  return Array.from(new Set(xs.filter(Boolean)));
}

export function SearchFilter({ value, onChange, authors = [] }: SearchFilterProps) {
  const authorOptions = useMemo(() => uniq(authors).sort(), [authors]);

  return (
    <div className="border border-gray-200 rounded-lg bg-white p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Buscar</label>
          <input
            value={value.query}
            onChange={(e) => onChange({ ...value, query: e.target.value })}
            placeholder="Título ou autor…"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Ordenação</label>
          <select
            value={value.sort}
            onChange={(e) => onChange({ ...value, sort: e.target.value as JournalFilters['sort'] })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
          >
            <option value="newest">Mais recentes</option>
            <option value="oldest">Mais antigos</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">Autor</label>
          <select
            value={value.author}
            onChange={(e) => onChange({ ...value, author: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
          >
            <option value="">Todos</option>
            {authorOptions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}




