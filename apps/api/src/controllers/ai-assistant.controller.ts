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
  const { text, sources: _sources, cursorPosition: _cursorPosition, agentConfig: _agentConfig } = req.body;

  if (!text) {
    throw createError('Text is required', 400);
  }

  const userPrompt = `Analyze the following academic draft and provide ethical guidance ONLY.

Return STRICT JSON with this shape:
{
  "suggestions": [{"id":"1","type":"structure|clarity|coherence|style|references|methodology|ethics","text":"...","priority":"low|medium|high"}],
  "corrections": [],
  "references": [],
  "warnings": ["..."],
  "authenticityAlerts": ["..."]
}

Draft:
"""${text}"""`;

  const raw = await geminiGenerateText({
    system: ETHICAL_SYSTEM_PROMPT,
    user: userPrompt,
    temperature: 0.2,
    maxOutputTokens: 1200,
  });

  const parsed = safeJsonParse(raw);
  const data = AnalyzeResponseSchema.parse(parsed);

  res.json({
    success: true,
    data: {
      ...data,
      timestamp: Date.now(),
    },
  });
});

export const chat = asyncHandler(async (req: Request, res: Response) => {
  const { question, text, cursorPosition: _cursorPosition, sources: _sources, chatHistory: _chatHistory, agentConfig: _agentConfig } =
    req.body;

  if (!question || !text) {
    throw createError('Question and text are required', 400);
  }

  const userPrompt = `User question:
${question}

Context (draft excerpt):
"""${text}"""

Respond ethically per rules. Provide guidance, not final writing.
Return your answer as plain text.`;

  const answer = await geminiGenerateText({
    system: ETHICAL_SYSTEM_PROMPT,
    user: userPrompt,
    temperature: 0.4,
    maxOutputTokens: 700,
  });

  res.json({
    success: true,
    data: {
      answer,
      suggestions: [],
      references: [],
      timestamp: Date.now(),
    },
  });
});
