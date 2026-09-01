import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export const MODEL = 'claude-sonnet-5';

export type Msg = { role: 'user' | 'assistant'; content: string };

export async function ask(system: string, messages: Msg[], maxTokens = 1024) {
  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages,
  });
  return resp.content
    .filter((b) => b.type === 'text')
    .map((b: any) => b.text)
    .join('');
}