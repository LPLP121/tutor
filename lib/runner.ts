import { readFileSync } from 'fs';
import path from 'path';
import { ask } from './model';
import { ResultRow, type ToolSpec } from './toolspec';

const RUN_ITEM = readFileSync(path.join(process.cwd(), 'prompts/run-item.md'), 'utf8');

export async function processItem(
  tool: ToolSpec,
  item: string
): Promise<ResultRow['outputs']> {
  const context = [
    'WHAT THE TOOL SHOULD PRODUCE:',
    tool.spec,
    '',
    'FIELDS:',
    ...tool.fields.map((f) => `- ${f.name} [${f.mode ?? 'extract'}]: ${f.description}`),
    '',
    'ITEM:',
    item,
  ].join('\n');

  let lastError = 'no attempt made';

  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await ask(RUN_ITEM, [{ role: 'user', content: context }], 1024);
    const cleaned = raw.replace(/```json|```/g, '').trim();
    try {
      const parsed = ResultRow.shape.outputs.safeParse(JSON.parse(cleaned));
      if (!parsed.success) {
        lastError = 'output did not match the field shape';
        continue;
      }
      const expected = tool.fields.map((f) => f.name).sort().join(',');
      const got = Object.keys(parsed.data).sort().join(',');
      if (expected !== got) {
        lastError = `wrong fields: expected ${expected}, got ${got}`;
        continue;
      }
      return parsed.data;
    } catch {
      lastError = 'output was not valid JSON';
    }
  }

  throw new Error(lastError);
}