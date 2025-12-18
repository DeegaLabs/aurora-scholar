import { Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/error-handler';
import { z } from 'zod';
import { geminiGenerateText } from '../services/gemini.service';

const ETHICAL_SYSTEM_PROMPT = `You are Aurora Scholar's ethical academic assistant.

NON-NEGOTIABLE RULES:
- NEVER write full paragraphs/sections for the user.
- NEVER produce "final text" that could be pasted as-is.
- You may ONLY provide: critiques, checklists, structure suggestions, questions, and small examples (<= 2 sentences) clearly marked as examples.
- If the user asks you to write content, refuse and instead guide them with steps/questions.
- Keep advice grounded in the user's provided text; do not invent facts or citations.

OUTPUT FORMAT:
- For analysis endpoints: return STRICT JSON only (no markdown, no prose outside JSON).`;

const AnalyzeResponseSchema = z.object({
  suggestions: z
    .array(
      z.object({
        id: z.string().min(1),
        type: z.enum(['structure', 'clarity', 'coherence', 'style', 'references', 'methodology', 'ethics']).default('clarity'),
        text: z.string().min(1),
        priority: z.enum(['low', 'medium', 'high']).default('medium'),
      })
    )
    .default([]),
  corrections: z.array(z.any()).default([]),
  references: z.array(z.any()).default([]),
  warnings: z.array(z.string()).default([]),
  authenticityAlerts: z.array(z.string()).default([]),
});

type ChatHistoryItem = { role?: string; content?: string };

function truncate(s: string, max: number) {
  if (!s) return '';
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

function stripHtmlToText(html: string) {
  // Very lightweight HTML→text conversion (MVP).
  // Intentionally avoids heavy deps; good enough for grounding hints.
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/(p|div|h\d|li|br|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

async function fetchUrlText(url: string) {
  const u = String(url || '').trim();
  if (!/^https?:\/\//i.test(u)) return null;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(u, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        // Basic UA helps some sites return content; still no paid sites support.
        'User-Agent': 'AuroraScholarBot/0.1 (grounding; no-crawl)',
        Accept: 'text/html,application/xhtml+xml,application/json,text/plain,*/*',
      },
    });
    if (!res.ok) return null;

    const ct = res.headers.get('content-type') || '';
    // Only attempt on text-ish content.
    if (!/(text\/html|text\/plain|application\/json)/i.test(ct)) return null;

    // Limit payload size (MVP): 200 KB.
    const buf = await res.arrayBuffer();
    if (buf.byteLength > 200_000) return null;

    const raw = new TextDecoder().decode(new Uint8Array(buf));
    if (/application\/json/i.test(ct)) {
      try {
        const j = JSON.parse(raw);
        return typeof j === 'string' ? j : JSON.stringify(j);
      } catch {
        return raw;
      }
    }
    return /text\/html/i.test(ct) ? stripHtmlToText(raw) : raw.trim();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function normalizeSources(raw: unknown): Array<{ type?: string; name?: string; url?: string; text?: string }> {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s) => {
      if (!s || typeof s !== 'object') return null;
      const o = s as any;
      return {
        type: typeof o.type === 'string' ? o.type : undefined,
        name: typeof o.name === 'string' ? o.name : undefined,
        url: typeof o.url === 'string' ? o.url : undefined,
        text: typeof o.text === 'string' ? o.text : undefined,
      };
    })
    .filter(Boolean) as any;
}

async function buildSourcesContext(sources: unknown) {
  const list = normalizeSources(sources).slice(0, 12);
  if (list.length === 0) return '';

  const hydrated = await Promise.all(
    list.map(async (s) => {
      // If user pasted text, prefer it; otherwise try to fetch visible text for URLs (MVP).
      if (s.text && s.text.trim()) return s;
      if (s.url && /^(link|video)$/i.test(String(s.type || ''))) {
        const fetched = await fetchUrlText(s.url);
        if (fetched) return { ...s, text: fetched };
      }
      return s;
    })
  );

  const lines = hydrated.map((s, idx) => {
    const head = `[${idx + 1}] ${s.type || 'source'}: ${s.name || s.url || '(unnamed)'}`;
    const url = s.url ? `URL: ${s.url}` : '';
    const text = s.text ? `EXCERPT: ${truncate(s.text.trim(), 1200)}` : '';
    const note =
      s.type === 'pdf'
        ? 'NOTE: PDF content not parsed yet (MVP). Para grounding, use "Paste Text" ou cole trechos relevantes.'
        : !text && s.url
          ? 'NOTE: Não consegui importar o texto desta URL (paywall/anti-bot/limit).'
          : '';
    return [head, url, text, note].filter(Boolean).join('\n');
  });

  return `\n\nSOURCES PROVIDED BY USER (use ONLY these; do not invent citations):\n${lines.join('\n\n')}\n`;
}

function buildChatHistoryContext(chatHistory: unknown) {
  if (!Array.isArray(chatHistory)) return '';
  const items = (chatHistory as ChatHistoryItem[])
    .filter((m) => m && typeof m.content === 'string' && typeof m.role === 'string')
    .slice(-8);
  if (items.length === 0) return '';
  const rendered = items
    .map((m) => {
      const role = m.role === 'assistant' ? 'assistant' : 'user';
      return `${role}: ${truncate(String(m.content).trim(), 500)}`;
    })
    .join('\n');
  return `\n\nCHAT HISTORY (most recent last):\n${rendered}\n`;
}

function looksLikeFinalText(answer: string) {
  const a = answer.trim();
  if (!a) return false;
  const paragraphs = a.split(/\n\s*\n/).filter(Boolean);
  const longParagraph = paragraphs.some((p) => p.length > 450);
  const hasManySentences = (a.match(/[.!?]\s/g) || []).length >= 6;
  const explicitlyWrites = /aqui (está|está um)|here( is|’s) (a|the) (paragraph|introduction|section)|segue (uma|o) (introdução|parágrafo)/i.test(
    a
  );
  return explicitlyWrites || longParagraph || hasManySentences;
}

type GhostwritingGate = {
  blocked: boolean;
  level: 'none' | 'warn' | 'block';
  reasons: string[];
  safeAnswer: string;
};

function detectGhostwriting(answer: string): GhostwritingGate {
  const a = String(answer || '').trim();
  if (!a) return { blocked: false, level: 'none', reasons: [], safeAnswer: '' };

  const reasons: string[] = [];

  // Signals of "final deliverable" writing.
  if (looksLikeFinalText(a)) reasons.push('parece texto final (parágrafos longos / muitas frases)');
  if (/^(\s*)(introdução|conclus(ão|ao)|resumo|abstract|metodologia|refer(ê|e)ncias)\b/i.test(a)) {
    reasons.push('estrutura típica de seção final (introdução/conclusão/etc)');
  }
  if (/^\s*(#|##|\d+\.)\s+\w+/m.test(a) && a.length > 900) {
    reasons.push('formatação de documento + tamanho alto');
  }
  if ((a.match(/\n/g) || []).length >= 12 && a.length > 1200) {
    reasons.push('muitas linhas + tamanho alto');
  }
  if (/```[\s\S]*?```/.test(a) && a.length > 700) {
    reasons.push('bloco de texto/código longo');
  }

  // Explicit "I wrote it" phrasing.
  if (/(aqui está|segue( abaixo)?|vou escrever|eu escrevi|here is|i wrote)/i.test(a)) {
    reasons.push('frase sugere entrega de texto pronto');
  }

  // Hard caps.
  if (a.length > 1600) reasons.push('resposta muito longa');

  const shouldBlock = reasons.length > 0;
  if (!shouldBlock) return { blocked: false, level: 'none', reasons: [], safeAnswer: a };

  const safe = [
    'Eu não posso escrever o texto final por você.',
    '',
    'Posso, porém, te ajudar sem ghostwriting:',
    '- Checklist de estrutura (em tópicos)',
    '- Perguntas-guia para você escrever com suas palavras',
    '- Sugestões de clareza/coerência e pontos a citar com base nas fontes',
    '',
    'Para eu te orientar melhor, me diga:',
    '1) Qual é a tese em 1 frase?',
    '2) Qual seção você está escrevendo (introdução/metodologia/etc)?',
    '3) Cole um parágrafo SEU (mesmo rascunho) e eu aponto melhorias sem reescrever.',
  ].join('\n');

  return { blocked: true, level: 'block', reasons, safeAnswer: safe };
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    // Try to extract a JSON object if the model wrapped it with extra text.
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(text.slice(start, end + 1));
    }
    throw new Error('Invalid JSON');
  }
}

export const analyzeText = asyncHandler(async (req: Request, res: Response) => {
  const { text, sources } = req.body;

  if (!text) {
    throw createError('Text is required', 400);
  }

  const sourcesContext = await buildSourcesContext(sources);
  const userPrompt = `Analyze the following academic draft and provide ethical guidance ONLY.

Return STRICT JSON with this shape:
{
  "suggestions": [{"id":"1","type":"structure|clarity|coherence|style|references|methodology|ethics","text":"...","priority":"low|medium|high"}],
  "corrections": [],
  "references": [{"sourceIndex":1,"quote":"...","note":"..."}],
  "warnings": ["..."],
  "authenticityAlerts": ["..."]
}

Draft:
"""${text}"""${sourcesContext}`;

  const raw = await geminiGenerateText({
    system: ETHICAL_SYSTEM_PROMPT,
    user: userPrompt,
    temperature: 0.2,
    maxOutputTokens: 2048,
    responseMimeType: 'application/json',
  });

  const parsed = safeJsonParse(raw);
  const data = AnalyzeResponseSchema.parse(parsed);
  // Hardening: prevent extremely long suggestion texts.
  const safeData = {
    ...data,
    suggestions: (data.suggestions || []).map((s) => ({
      ...s,
      text: truncate(String(s.text), 500),
    })),
  };

  // Extra hardening: ensure analysis output never contains paste-ready chunks.
  const combinedText = JSON.stringify(safeData);
  const gate = detectGhostwriting(combinedText);
  const hardened = gate.blocked
    ? {
        ...safeData,
        authenticityAlerts: Array.from(new Set([...(safeData.authenticityAlerts || []), 'Resposta do modelo parecia texto final; foi bloqueada automaticamente.'])),
        suggestions: [],
        warnings: Array.from(new Set([...(safeData.warnings || []), `Anti-ghostwriting: ${gate.reasons.join('; ')}`])),
      }
    : safeData;

  res.json({
    success: true,
    data: {
      ...hardened,
      antiGhostwriting: {
        blocked: gate.blocked,
        level: gate.level,
        reasons: gate.reasons,
      },
      timestamp: Date.now(),
    },
  });
});

export const chat = asyncHandler(async (req: Request, res: Response) => {
  const { question, text, sources, chatHistory } = req.body;

  if (!question) {
    throw createError('Question is required', 400);
  }

  // Allow empty text for early-stage guidance (e.g. user hasn't written yet).
  const safeText = typeof text === 'string' ? text : '';
  const sourcesContext = await buildSourcesContext(sources);
  const historyContext = buildChatHistoryContext(chatHistory);

  const userPrompt = `User question:
${question}

Context (draft excerpt):
"""${safeText}"""
${sourcesContext}${historyContext}

Respond ethically per rules. Provide guidance, not final writing.
When making factual claims, cite sources inline using [1], [2], etc (only if supported by provided sources).
Return your answer as plain text.`;

  const answer = await geminiGenerateText({
    system: ETHICAL_SYSTEM_PROMPT,
    user: userPrompt,
    temperature: 0.3,
    maxOutputTokens: 1024,
  });

  const gate = detectGhostwriting(answer);

  res.json({
    success: true,
    data: {
      answer: gate.safeAnswer,
      antiGhostwriting: {
        blocked: gate.blocked,
        level: gate.level,
        reasons: gate.reasons,
      },
      suggestions: [],
      references: [],
      timestamp: Date.now(),
    },
  });
});
