// 영어판(PR-12) 공통 — spec.en.md 읽기 · 번역 상태 · 금칙어. sync-content.mjs와 i18n-status.mjs가 같이 쓴다.
// 형식은 docs/spec/distribution.md §3.2.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const APP = fileURLToPath(new URL('..', import.meta.url));
export const ROOT = join(APP, '../..');
export const CONTRACTS = join(ROOT, 'packages/contracts/src');
export const GUIDES_EN = join(ROOT, 'docs/guides/en');
export const I18N_DATA = join(APP, 'src/i18n');

/** spec.md 절(한국어) → spec.en.md 절(영어). 순서도 이대로 */
export const SECTIONS = [
  ['용도', 'Purpose'],
  ['해부(Anatomy)', 'Anatomy'],
  ['Props', 'Props'],
  ['Variants', 'Variants'],
  ['States', 'States'],
  ['동작', 'Behavior'],
  ['접근성', 'Accessibility'],
  ['밀도', 'Density'],
  ['플랫폼 차이', 'Platform differences'],
  ['금지 사항', 'Avoid'],
  ['스토리', 'Stories'],
  ['참고', 'References'],
];
export const SECTIONS_EN = SECTIONS.map(([, en]) => en);
/** 소비 앱용 문서에서 빼는 절(DS 내부용) — build-docs의 INTERNAL_SECTIONS와 같다 */
export const INTERNAL_EN = new Set(['Stories', 'References']);

export const specEnPath = (name) => join(CONTRACTS, name, 'spec.en.md');

/**
 * front matter의 한 단계 맵만 읽는다(외부 YAML 파서 없이).
 *   props:
 *     variant: Role. `primary` is the main action
 *     label: "Text with a leading quote or # sign"
 * 값은 한 줄. 큰따옴표로 감싸면 JSON 문자열로 읽는다.
 */
export function parseFrontMatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!m) return { data: {}, body: text, errors: [] };
  const data = {};
  const errors = [];
  let current = null;
  for (const [i, line] of m[1].split('\n').entries()) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const top = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line);
    if (top) {
      current = top[1];
      data[current] = top[2] ? unquote(top[2]) : {};
      continue;
    }
    const sub = /^ {2}([A-Za-z_$][\w$]*):\s+(.+)$/.exec(line);
    if (sub && current && typeof data[current] === 'object') {
      data[current][sub[1]] = unquote(sub[2].trim());
      continue;
    }
    errors.push(`front matter ${i + 2}행을 읽지 못했다: ${line}`);
  }
  return { data, body: text.slice(m[0].length), errors };
}

function unquote(v) {
  if (v.startsWith('"') && v.endsWith('"')) {
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  }
  return v;
}

/** spec 본문 → [[절 이름, 본문]] (H1 제외, 순서 유지). build-docs parseSpec과 같은 규칙 */
export function parseSections(md) {
  const sections = [];
  for (const part of md.split(/\n(?=## )/)) {
    const m = /^## (.+)\n([\s\S]*)$/.exec(part.trim());
    if (m) sections.push([m[1].trim(), m[2].trim()]);
  }
  return sections;
}

/** 용도 절 첫 문장 = 요약(목록 카드 · 메타 설명). build-docs의 summary와 같은 규칙 */
export function summaryOf(purpose) {
  return (/^[^\n]*?\.(?=\s|$)/.exec(purpose)?.[0] ?? purpose.split('\n')[0])
    .replace(/\.$/, '')
    .trim();
}

/** spec.en.md → { props, examples, sections, summary, errors } | null(파일 없음) */
export function readSpecEn(name) {
  const file = specEnPath(name);
  if (!existsSync(file)) return null;
  const { data, body, errors } = parseFrontMatter(readFileSync(file, 'utf8'));
  const sections = parseSections(body);
  const purpose = sections.find(([t]) => t === 'Purpose')?.[1] ?? '';
  const h1 = /^# (.+)$/m.exec(body)?.[1]?.trim();
  if (h1 !== name) errors.push(`첫 제목이 "# ${name}"이 아니다(${h1 ?? '없음'})`);
  return {
    props: typeof data.props === 'object' ? data.props : {},
    examples: typeof data.examples === 'object' ? data.examples : {},
    sections,
    summary: summaryOf(purpose),
    errors,
  };
}

/** examples 맵 값 "Title — description" → { title, description } */
export function splitExample(value) {
  const [title, ...rest] = String(value).split(' — ');
  return { title: title.trim(), description: rest.join(' — ').trim() };
}

/** 내보낸 함수 이름 → 영어 제목(번역이 없을 때): WithIcon → With icon */
export const titleFromName = (name) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/ ([A-Z])(?=[a-z])/g, (_m, c) => ` ${c.toLowerCase()}`);

export const readJson = (file, fallback = {}) =>
  existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : fallback;
export const tokensEn = () => readJson(join(I18N_DATA, 'tokens.en.json'));
export const modulesEn = () =>
  readJson(join(I18N_DATA, 'modules.en.json'), { groups: {}, modules: {} });

/* ── 번역 상태 ─────────────────────────────────────────────── */

/** 코드 서체(`…`)와 코드 블록 밖에 한글이 있나. 화면 문구 · 단위(`원`)를 그대로 보일 때는 코드 서체로 쓴다 */
export const hasHangul = (text) =>
  /[가-힣]/.test(text.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, ''));

/** manifest 기준으로 빠진 번역을 모은다. { components, guides, tokens, modules } — 항목마다 문자열 배열 */
export function translationStatus(manifest, { only } = {}) {
  const components = {};
  for (const c of manifest.components) {
    if (only && !only.includes(c.name)) continue;
    const issues = [];
    const spec = readSpecEn(c.name);
    if (!spec) {
      components[c.name] = ['spec.en.md 없음(영어 페이지는 Props 표만 있는 최소판)'];
      continue;
    }
    issues.push(...spec.errors);
    const titles = spec.sections.map(([t]) => t);
    const missing = SECTIONS_EN.filter((t) => !titles.includes(t));
    const unknown = titles.filter((t) => !SECTIONS_EN.includes(t));
    if (missing.length) issues.push(`절 없음: ${missing.join(' · ')}`);
    if (unknown.length) issues.push(`모르는 절: ${unknown.join(' · ')}`);
    const order = titles.filter((t) => SECTIONS_EN.includes(t));
    if (order.join('|') !== SECTIONS_EN.filter((t) => order.includes(t)).join('|'))
      issues.push('절 순서가 spec.md와 다르다');
    for (const [t, body] of spec.sections)
      if (!body.trim() && t !== 'Props') issues.push(`빈 절: ${t}`);
    for (const [t, body] of spec.sections)
      if (hasHangul(body)) issues.push(`${t} 절에 한글이 남아 있다(코드 서체 밖)`);
    const names = c.props.map((p) => p.name);
    const noDesc = names.filter((n) => !spec.props[n]);
    const stale = Object.keys(spec.props).filter((n) => !names.includes(n));
    if (noDesc.length) issues.push(`props 설명 없음: ${noDesc.join(', ')}`);
    if (stale.length) issues.push(`contract에 없는 props: ${stale.join(', ')}`);
    for (const [n, d] of Object.entries(spec.props))
      if (hasHangul(d)) issues.push(`props.${n}에 한글이 남아 있다(코드 서체 밖)`);
    for (const [n, d] of Object.entries(spec.examples))
      if (hasHangul(d)) issues.push(`examples.${n}에 한글이 남아 있다(코드 서체 밖)`);
    const exNames = c.examples.map((e) => e.name);
    const exMissing = exNames.filter((n) => !spec.examples[n]);
    const exStale = Object.keys(spec.examples).filter((n) => !exNames.includes(n));
    if (exMissing.length) issues.push(`examples 제목 없음: ${exMissing.join(', ')}`);
    if (exStale.length) issues.push(`예시 파일에 없는 examples: ${exStale.join(', ')}`);
    if (issues.length) components[c.name] = issues;
  }
  if (only) return { components, guides: [], tokens: [], modules: [] };

  const guides = [];
  const enFiles = existsSync(GUIDES_EN)
    ? readdirSync(GUIDES_EN).filter((f) => f.endsWith('.md'))
    : [];
  for (const g of manifest.guides)
    if (!enFiles.includes(`${g.slug}.md`)) guides.push(`docs/guides/en/${g.slug}.md 없음`);
  for (const f of enFiles)
    if (!manifest.guides.some((g) => `${g.slug}.md` === f))
      guides.push(`docs/guides/en/${f}: 한국어 원문(docs/guides/${f})이 없다`);

  const tEn = tokensEn();
  const all = [...manifest.tokens.semantic, ...manifest.tokens.density, ...manifest.tokens.scale];
  const tokens = all.filter((t) => t.description && !tEn[t.css]).map((t) => t.css);

  const mEn = modulesEn();
  const modules = [
    ...Object.keys(manifest.modules.groups)
      .filter((g) => !mEn.groups[g])
      .map((g) => `group ${g}`),
    ...manifest.modules.modules.filter((m) => !mEn.modules[m.id]).map((m) => m.id),
  ];
  return { components, guides, tokens, modules };
}

/* ── 금칙어 ────────────────────────────────────────────────── */

/** 영어 문구 규격(docs/guides/en/content.md)의 수식어. 한국어 목록은 build-docs ADJECTIVES */
export const ADJECTIVES_EN = [
  'seamless',
  'effortless',
  'powerful',
  'intuitive',
  'innovative',
  'cutting-edge',
  'best-in-class',
  'world-class',
  'stunning',
  'delightful',
  'game-changing',
  'supercharge',
];

/** 저장소에 적지 않는 목록(타사 제품명 등): 루트 `.forbidden-words` 또는 TRELLIS_FORBIDDEN_WORDS */
export function privateForbidden() {
  const fromEnv = (process.env['TRELLIS_FORBIDDEN_WORDS'] ?? '').split(',');
  const file = join(ROOT, '.forbidden-words');
  const fromFile = existsSync(file) ? readFileSync(file, 'utf8').split('\n') : [];
  return [...fromEnv, ...fromFile].map((w) => w.trim()).filter((w) => w && !w.startsWith('#'));
}

/** 텍스트에서 걸린 금칙어. adjectives=false면 저장소 밖 목록만 본다(문구 가이드는 수식어를 이름 붙여 금지하는 문서) */
export function forbiddenHits(text, { adjectives = true } = {}) {
  const hits = privateForbidden().filter((w) => text.includes(w));
  if (adjectives)
    for (const w of ADJECTIVES_EN) if (new RegExp(`\\b${w}`, 'i').test(text)) hits.push(w);
  return hits;
}
