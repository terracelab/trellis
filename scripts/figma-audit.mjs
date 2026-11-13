#!/usr/bin/env node
// Figma 파일 감사(.claude/skills/ds/figma-sync, 트랙 G PG-01). 코드가 원본이고 Figma는 생성물이다.
//   node scripts/figma-audit.mjs --emit keys|links|sets|screens   use_figma에 붙일 읽기 전용 스크립트
//   node scripts/figma-audit.mjs --check <result.json>…            expect와 measured를 비교, 다르면 exit 1
//   node scripts/figma-audit.mjs --keys <keys.json>                key 목록이 variables.json을 다 덮는지
// 결과 파일 모양: { "task": "PG-02", "file": "Components", "expect": { "<점 경로>": 값 | {min,max} }, "measured": { … } }
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DEFAULT_VARIABLES = `${ROOT}packages/tokens/dist/figma/variables.json`;

const HELP = `figma-audit — Figma 파일 감사 스크립트와 결과 검사

사용:
  node scripts/figma-audit.mjs --emit keys      변수 · 스타일 · 세트 · 낱개 컴포넌트의 이름 → key
  node scripts/figma-audit.mjs --emit links     지역 컬렉션 · 스타일 · 컴포넌트 수, 바인딩(지역 · 라이브러리), 묶이지 않은 칠 · 글자
  node scripts/figma-audit.mjs --emit sets      세트마다 페이지 · 변형 수 · 축 값의 곱 · 설명 · 값 하나짜리 state 축
  node scripts/figma-audit.mjs --emit screens   맨 위 프레임마다 모드 명시 · 인스턴스(지역 본체) · 표 영역의 인스턴스 밖 글자 · 넘친 자식
  node scripts/figma-audit.mjs --check <result.json>…
  node scripts/figma-audit.mjs --keys <keys.json> [--variables <path>]
  node scripts/figma-audit.mjs --help

--emit  출력한 스크립트를 use_figma code로 보낸다. 맨 위 ONLY에 페이지 이름 배열을 넣으면 그 페이지만 본다.
--check 결과 파일의 expect 항목마다 measured의 같은 점 경로 값을 비교한다.
        값이 수 · 글 · 불리언이면 같아야 하고, {"min":n} · {"max":n}이면 범위 안이어야 한다.
--keys  keys.json의 variables가 variables.json의 변수 이름을 모두 가진다.

종료 코드: 통과 0, 다름 1, 사용법 오류 2.`;

const HEAD = String.raw`// Trellis — Figma 감사(scripts/figma-audit.mjs --emit KIND). 읽기 전용
const ONLY = null; // 예: ['Button', 'Badge']. null이면 모든 페이지
const pages = figma.root.children.filter((p) => !ONLY || ONLY.includes(p.name));
for (const p of pages) await p.loadAsync();
`;

const EMIT = {
  keys: String.raw`const out = { file: figma.root.name, collections: {}, variables: {}, textStyles: {}, effectStyles: {}, sets: {}, components: {} };
for (const c of await figma.variables.getLocalVariableCollectionsAsync()) {
  out.collections[c.name] = c.key;
  for (const id of c.variableIds) { const v = await figma.variables.getVariableByIdAsync(id); out.variables[c.name + '/' + v.name] = v.key; }
}
for (const s of await figma.getLocalTextStylesAsync()) out.textStyles[s.name] = s.key;
for (const s of await figma.getLocalEffectStylesAsync()) out.effectStyles[s.name] = s.key;
for (const p of pages) {
  for (const n of p.findAllWithCriteria({ types: ['COMPONENT_SET'] })) out.sets[n.name] = n.key;
  for (const n of p.findAllWithCriteria({ types: ['COMPONENT'] })) if (n.parent.type !== 'COMPONENT_SET') out.components[n.name] = n.key;
}
out.counts = Object.fromEntries(['variables', 'textStyles', 'effectStyles', 'sets', 'components'].map((k) => [k, Object.keys(out[k]).length]));
return out;`,

  links: String.raw`const cols = await figma.variables.getLocalVariableCollectionsAsync();
const out = { file: figma.root.name, pages: pages.length, localCollections: cols.length, localVariables: cols.reduce((a, c) => a + c.variableIds.length, 0),
  localTextStyles: (await figma.getLocalTextStylesAsync()).length, localEffectStyles: (await figma.getLocalEffectStylesAsync()).length,
  localSets: 0, localComponents: 0, unpublishedComponents: 0, nodes: 0, bindings: 0, remoteBindings: 0, localBindings: 0, rawSolid: 0, unboundText: 0,
  instances: 0, localMainInstances: 0, missingMain: 0 };
const cache = new Map();
const isRemote = async (id) => { if (!cache.has(id)) { const v = await figma.variables.getVariableByIdAsync(id); cache.set(id, v ? v.remote : null); } return cache.get(id); };
const count = async (alias) => { if (!alias || !alias.id) return; out.bindings++; const r = await isRemote(alias.id); if (r) out.remoteBindings++; else out.localBindings++; };
for (const p of pages) {
  for (const n of p.findAll(() => true)) {
    out.nodes++;
    if (n.type === 'COMPONENT_SET') out.localSets++;
    if (n.type === 'COMPONENT' && n.parent.type !== 'COMPONENT_SET') { out.localComponents++; if (/^[_.]/.test(n.name)) out.unpublishedComponents++; }
    const bv = n.boundVariables || {};
    for (const k of Object.keys(bv)) { if (k === 'fills' || k === 'strokes' || k === 'componentProperties') continue; const v = bv[k]; if (Array.isArray(v)) for (const a of v) await count(a); else await count(v); }
    for (const k of ['fills', 'strokes']) { const a = n[k]; if (!Array.isArray(a)) continue; for (const paint of a) { if (paint.type !== 'SOLID' || paint.visible === false) continue; const b = paint.boundVariables && paint.boundVariables.color; if (b) await count(b); else out.rawSolid++; } }
    if (n.type === 'TEXT' && !n.textStyleId && !(bv.fontSize)) out.unboundText++;
    if (n.type === 'INSTANCE') { out.instances++; const m = await n.getMainComponentAsync(); if (!m) out.missingMain++; else if (!m.remote) out.localMainInstances++; }
  }
}
return out;`,

  sets: String.raw`const NON_VISUAL = ['headingLevel', 'initialFocus'];
const out = { file: figma.root.name, count: 0, bad: [], singleStateAxis: [], nonVisualAxis: [], sets: {} };
for (const p of pages) {
  for (const s of p.findAllWithCriteria({ types: ['COMPONENT_SET'] })) {
    const defs = Object.entries(s.componentPropertyDefinitions);
    const axes = defs.filter(([, d]) => d.type === 'VARIANT').map(([k, d]) => [k, d.variantOptions.length]);
    const product = axes.reduce((a, [, n]) => a * n, 1);
    out.count++;
    out.sets[s.name] = { page: p.name, variants: s.children.length, product, axes: axes.map(([k, n]) => k + ' ' + n).join(' × '), props: defs.length - axes.length };
    if (s.children.length !== product || !s.description) out.bad.push(s.name);
    if (axes.some(([k, n]) => k === 'state' && n === 1)) out.singleStateAxis.push(s.name);
    if (axes.some(([k]) => NON_VISUAL.includes(k))) out.nonVisualAxis.push(s.name);
  }
}
return out;`,

  screens: String.raw`const isTable = (n) => n.type === 'FRAME' && /^(table|표)/i.test(n.name);
const out = { file: figma.root.name, frames: 0, noMode: [], tableRawText: 0, overflow: 0, rawSolid: 0, instances: 0, localMainInstances: 0, byFrame: {} };
for (const p of pages) {
  for (const f of p.children) {
    if (f.type !== 'FRAME') continue;
    out.frames++;
    const r = { page: p.name, w: Math.round(f.width), h: Math.round(f.height), modes: Object.keys(f.explicitVariableModes || {}).length, instances: 0, local: 0, tableRawText: 0, overflow: 0, rawSolid: 0 };
    if (r.modes < 2) out.noMode.push(f.name);
    const box = f.absoluteBoundingBox;
    const walk = async (n, inTable) => {
      for (const c of n.children || []) {
        if (c.type === 'INSTANCE') { r.instances++; const m = await c.getMainComponentAsync(); if (m && !m.remote) r.local++; continue; }
        if (c.type === 'TEXT' && inTable) r.tableRawText++;
        for (const k of ['fills', 'strokes']) { const a = c[k]; if (Array.isArray(a)) for (const paint of a) if (paint.type === 'SOLID' && paint.visible !== false && !(paint.boundVariables && paint.boundVariables.color)) r.rawSolid++; }
        const b = c.absoluteBoundingBox;
        if (b && box && c.visible !== false && (b.x + b.width > box.x + box.width + 1 || b.y + b.height > box.y + box.height + 1)) r.overflow++;
        if ('children' in c) await walk(c, inTable || isTable(c));
      }
    };
    await walk(f, false);
    out.instances += r.instances; out.localMainInstances += r.local; out.tableRawText += r.tableRawText; out.overflow += r.overflow; out.rawSolid += r.rawSolid;
    out.byFrame[f.name] = r;
  }
}
return out;`,
};

/** 중첩 객체 → { 'a.b.c': 값 }. 배열은 길이와 원소를 함께 편다 */
export function flatten(value, prefix = '', out = {}) {
  if (value === null || typeof value !== 'object') {
    out[prefix] = value;
    return out;
  }
  if (Array.isArray(value)) out[`${prefix}.length`] = value.length;
  for (const [k, v] of Object.entries(value)) flatten(v, prefix ? `${prefix}.${k}` : k, out);
  return out;
}

/** expect 한 항목과 측정값 비교. 통과하면 null, 아니면 이유 */
export function compare(want, got) {
  if (got === undefined) return '측정값 없음';
  if (want !== null && typeof want === 'object') {
    if (typeof got !== 'number') return `수가 아니다: ${JSON.stringify(got)}`;
    if (want.min !== undefined && got < want.min) return `${got} < 최소 ${want.min}`;
    if (want.max !== undefined && got > want.max) return `${got} > 최대 ${want.max}`;
    return null;
  }
  return want === got ? null : `${JSON.stringify(got)} ≠ 기대 ${JSON.stringify(want)}`;
}

/** 결과 문서 검사 → { task, rows: [{ key, want, got, problem }], failed } */
export function check(doc) {
  if (!doc || typeof doc.expect !== 'object' || typeof doc.measured !== 'object')
    throw new Error('결과 파일에 expect와 measured가 있어야 한다');
  const measured = flatten(doc.measured);
  const rows = Object.entries(doc.expect).map(([key, want]) => {
    const got = measured[key];
    return { key, want, got, problem: compare(want, got) };
  });
  if (rows.length === 0) throw new Error('expect가 비어 있다');
  return { task: doc.task ?? '', rows, failed: rows.filter((r) => r.problem).length };
}

/** keys.json이 variables.json의 변수 이름을 모두 갖는지 → 빠진 이름 목록 */
export function missingKeys(keys, variables) {
  const have = new Set(Object.keys(keys.variables ?? {}));
  const missing = [];
  for (const c of variables.collections)
    for (const v of c.variables)
      if (!have.has(`${c.name}/${v.name}`)) missing.push(`${c.name}/${v.name}`);
  return missing;
}

function main(argv) {
  const args = [...argv];
  const take = (name) => {
    const i = args.indexOf(name);
    if (i === -1) return undefined;
    const [, value] = args.splice(i, 2);
    return value ?? '';
  };
  if (args.includes('--help') || args.length === 0) {
    console.log(HELP);
    return args.length === 0 ? 2 : 0;
  }
  const emit = take('--emit');
  if (emit !== undefined) {
    if (!EMIT[emit]) {
      console.error(`--emit ${emit}: keys · links · sets · screens 중 하나여야 한다`);
      return 2;
    }
    console.log(HEAD.replace('KIND', emit) + EMIT[emit]);
    return 0;
  }
  const keysPath = take('--keys');
  if (keysPath !== undefined) {
    const variables = JSON.parse(readFileSync(take('--variables') ?? DEFAULT_VARIABLES, 'utf8'));
    const keys = JSON.parse(readFileSync(keysPath, 'utf8'));
    // 파일별로 나눠 적은 keys.json({ Foundations: {...}, Components: {...} })이면 Foundations를 본다
    const missing = missingKeys(keys.variables ? keys : (keys.Foundations ?? {}), variables);
    const total = variables.collections.reduce((a, c) => a + c.variables.length, 0);
    if (missing.length) {
      console.error(
        `key 없는 변수 ${missing.length}개 / ${total}: ${missing.slice(0, 10).join(', ')}`,
      );
      return 1;
    }
    console.log(`key 목록 통과: 변수 ${total}개 전부 key가 있다`);
    return 0;
  }
  const files = args.filter((a) => !a.startsWith('--'));
  if (!args.includes('--check') || files.length === 0) {
    console.error(HELP);
    return 2;
  }
  let failed = 0;
  for (const file of files) {
    const result = check(JSON.parse(readFileSync(file, 'utf8')));
    for (const r of result.rows)
      console.log(
        `${r.problem ? '✗' : '✓'} ${result.task} ${r.key} = ${JSON.stringify(r.got)}${r.problem ? ` — ${r.problem}` : ''}`,
      );
    failed += result.failed;
  }
  console.log(failed ? `감사 실패: ${failed}개 항목` : `감사 통과: 파일 ${files.length}개`);
  return failed ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  process.exit(main(process.argv.slice(2)));
