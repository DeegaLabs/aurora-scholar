import { Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/error-handler';

// TODO: Import OpenAI or Anthropic client
// import OpenAI from 'openai';

// TODO: Use this prompt when implementing AI integration
// const ETHICAL_SYSTEM_PROMPT = `You are an ethical AI academic assistant for Aurora Scholar.
//
// IMPORTANT RULES:
// 1. NEVER write complete text for the user
// 2. ONLY provide guidance, explanations, and suggestions
// 3. If you detect text that seems AI-generated or pasted, alert the user
// 4. Base suggestions ONLY on sources provided by the user
// 5. Help with structure, grammar, methodology, and references
// 6. Maintain academic standards and integrity
//
// Your role is to GUIDE, not to WRITE.`;

export const analyzeText = asyncHandler(async (req: Request, res: Response) => {
  const { text, sources: _sources, cursorPosition: _cursorPosition, agentConfig: _agentConfig } = req.body;

  if (!text) {
    throw createError('Text is required', 400);
  }

  // TODO: Implement with OpenAI/Anthropic
  // 1. Process sources (extract text from PDFs, etc.)
  // 2. Build context with ethical prompt
  // 3. Send to LLM
  // 4. Validate response (ensure it didn't write complete text)
  // 5. Detect authenticity issues

  // Placeholder response
  res.json({
    success: true,
    data: {
      suggestions: [
        {
          id: '1',
          type: 'structure',
          text: 'Consider adding an abstract section at the beginning of your article.',
          priority: 'medium',
        },
      ],
      corrections: [],
      references: [],
      warnings: [],
      authenticityAlerts: [],
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

  // TODO: Implement with OpenAI/Anthropic
  // 1. Build context with document and sources
  // 2. Include chat history for continuity
  // 3. Send to LLM with ethical prompt
  // 4. Validate response

  // Placeholder response
  res.json({
    success: true,
    data: {
      answer:
        'Based on your document and the sources provided, I suggest focusing on clarifying your methodology section. Consider explaining the research design in more detail.',
      suggestions: [
        'Add a clear research question',
        'Explain your data collection methods',
      ],
      references: [],
      timestamp: Date.now(),
    },
  });
});
