// 쇼케이스 문단의 숫자를 저장소에서 세어 src/generated/facts.ts로 쓴다(content.md §2-9: 숫자가 있으면 숫자).
// 컴포넌트 = packages/contracts/src/<Name>/<Name>.contract.ts 수(spec 없는 컴포넌트는 없다).
// 화면 블록 = blocks/src/<묶음>/<모듈>/<화면>/block.json 수, 모듈별 수는 block.json의 module로 센다.
// 블록 id 목록은 모듈로 셀 수 없는 영역(에이전트 대화)이 블록 id로 센다.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const dirs = (p) =>
  readdirSync(p).filter((d) => !d.startsWith('_') && statSync(join(p, d)).isDirectory());

const CONTRACTS = join(ROOT, 'packages/contracts/src');
const names = dirs(CONTRACTS).filter((d) => existsSync(join(CONTRACTS, d, `${d}.contract.ts`)));
const components = names.length;
// 차트 = react charts 진입점이 내보내는 컴포넌트(동봉 문서 manifest의 category chart와 같은 규칙)
const chartsIndex = readFileSync(join(ROOT, 'packages/react/src/charts/index.ts'), 'utf8');
const charts = names.filter((n) => chartsIndex.includes(`../${n}/`)).length;

const BLOCKS = join(ROOT, 'blocks/src');
const blocksByModule = {};
const blockIds = [];
let blocks = 0;
for (const g of dirs(BLOCKS))
  for (const m of dirs(join(BLOCKS, g)))
    for (const s of dirs(join(BLOCKS, g, m))) {
      const file = join(BLOCKS, g, m, s, 'block.json');
      if (!existsSync(file)) continue;
      const meta = JSON.parse(readFileSync(file, 'utf8'));
      blocks += 1;
      blockIds.push(meta.id);
      blocksByModule[meta.module] = (blocksByModule[meta.module] ?? 0) + 1;
    }

if (!components || !charts || !blocks)
  throw new Error(`gen-facts: 컴포넌트 ${components} · 차트 ${charts} · 블록 ${blocks}`);

const out = fileURLToPath(new URL('../src/generated/facts.ts', import.meta.url));
mkdirSync(fileURLToPath(new URL('../src/generated/', import.meta.url)), { recursive: true });
writeFileSync(
  out,
  `// scripts/gen-facts.mjs가 만든다. 고치지 않는다\nexport const FACTS: {\n  components: number;\n  charts: number;\n  blocks: number;\n  blocksByModule: Record<string, number>;\n  blockIds: string[];\n} = ${JSON.stringify({ components, charts, blocks, blocksByModule, blockIds: blockIds.sort() }, null, 2)};\n`,
);
console.log(`gen-facts: 컴포넌트 ${components}종(차트 ${charts}) · 화면 블록 ${blocks}개`);
