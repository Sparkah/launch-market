import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const runDir = join(root, 'runs', 'gf-lm-demo');

const candidate = {
  id: 'gf-lm-demo',
  title: 'Orbit Bakery Launch',
  prompt: 'Build a dessert physics merge game and allocate launch credits only if evidence is visible.',
  scores: { fairness: 92, launch: 76, business: 71 },
  promotion_status: 'manual_only',
  integrations: {
    codeplain: 'ready',
    sui: 'mocked',
    walrus: 'mocked',
    deepbook: 'mocked',
    bilt: 'brief_ready'
  }
};

await mkdir(join(runDir, 'reports'), { recursive: true });
await writeFile(join(runDir, 'candidate.json'), JSON.stringify(candidate, null, 2) + '\n');
await writeFile(
  join(runDir, 'reports', 'validation.json'),
  JSON.stringify(
    {
      ok: true,
      checked: candidate.id,
      issues: [
        { code: 'walrus_mocked', severity: 'WARN', message: 'Walrus upload is mocked for the first build.' },
        { code: 'sui_mocked', severity: 'WARN', message: 'Sui object creation is mocked for the first build.' }
      ]
    },
    null,
    2
  ) + '\n'
);

console.log(`Seeded ${runDir}`);

