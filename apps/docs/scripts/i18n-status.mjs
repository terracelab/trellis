// 영어판 번역 상태 — 빠진 spec.en.md · props 설명 · 예시 제목 · 가이드 · 토큰 설명 · 모듈 이름을 나열한다.
//   node scripts/i18n-status.mjs                 전체 목록(빠진 것이 있어도 종료 0)
//   node scripts/i18n-status.mjs --strict        빠진 것이 있으면 종료 1
//   node scripts/i18n-status.mjs Button KpiCard  컴포넌트 몇 개만 자세히(번역할 때). 문제가 있으면 종료 1
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { GUIDES_EN, forbiddenHits, readSpecEn, specEnPath, translationStatus } from './i18n.mjs';

const require = createRequire(import.meta.url);
let manifest;
try {
  manifest = JSON.parse(
    readFileSync(require.resolve('@terracelab/trellis-react/docs/manifest.json'), 'utf8'),
  );
} catch {
  console.error(
    '동봉 문서가 없다. 먼저 pnpm build(또는 pnpm --filter @terracelab/trellis-react build)',
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const only = args.filter((a) => !a.startsWith('--'));
const unknown = only.filter((n) => !manifest.components.some((c) => c.name === n));
if (unknown.length) {
  console.error(`manifest에 없는 컴포넌트: ${unknown.join(', ')}`);
  process.exit(1);
}

const status = translationStatus(manifest, only.length ? { only } : {});
// 금칙어: 번역 파일 자체를 본다(영어 수식어 + 저장소 밖 목록)
const forbidden = [];
for (const c of manifest.components) {
  if (only.length && !only.includes(c.name)) continue;
  if (!readSpecEn(c.name)) continue;
  const hits = forbiddenHits(readFileSync(specEnPath(c.name), 'utf8'));
  if (hits.length) forbidden.push(`${c.name}/spec.en.md: ${hits.join(', ')}`);
}
if (!only.length)
  for (const g of manifest.guides) {
    try {
      const text = readFileSync(join(GUIDES_EN, `${g.slug}.md`), 'utf8');
      const hits = forbiddenHits(text, { adjectives: g.slug !== 'content' });
      if (hits.length) forbidden.push(`guides/en/${g.slug}.md: ${hits.join(', ')}`);
    } catch {
      /* 없는 가이드는 위 목록에 이미 있다 */
    }
  }

const comps = Object.entries(status.components);
const total = manifest.components.filter((c) => !only.length || only.includes(c.name)).length;
const missingFiles = comps.filter(([, issues]) => issues[0]?.startsWith('spec.en.md 없음'));
console.log(
  `컴포넌트 ${total - comps.length}/${total} 번역 완료 · spec.en.md 없음 ${missingFiles.length} · 손볼 것 ${comps.length - missingFiles.length}`,
);
for (const [name, issues] of comps) {
  console.log(`  ${name}`);
  for (const i of issues) console.log(`    - ${i}`);
}
if (!only.length) {
  console.log(`가이드 ${manifest.guides.length - status.guides.length}/${manifest.guides.length}`);
  for (const g of status.guides) console.log(`  - ${g}`);
  const tokenCount = [
    ...manifest.tokens.semantic,
    ...manifest.tokens.density,
    ...manifest.tokens.scale,
  ].filter((t) => t.description).length;
  console.log(
    `토큰 설명 ${tokenCount - status.tokens.length}/${tokenCount} (src/i18n/tokens.en.json)`,
  );
  for (const t of status.tokens.slice(0, 20)) console.log(`  - ${t}`);
  if (status.tokens.length > 20) console.log(`  … 외 ${status.tokens.length - 20}`);
  console.log(`모듈 이름 빠짐 ${status.modules.length} (src/i18n/modules.en.json)`);
  for (const m of status.modules) console.log(`  - ${m}`);
}
if (forbidden.length) {
  console.log('금칙어');
  for (const f of forbidden) console.log(`  - ${f}`);
}

const incomplete =
  comps.length + status.guides.length + status.tokens.length + status.modules.length > 0;
if (forbidden.length || ((strict || only.length) && incomplete)) process.exit(1);
