import { createXai } from '@ai-sdk/xai';

export const xai = createXai({
    apiKey: process.env.XAI_API_KEY || process.env.VERCEL_AI_API_KEY,
});

export const grokModel = xai('grok-beta'); // Using a fast reasoning model if available or standard grok-beta
