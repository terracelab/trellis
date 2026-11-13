#!/usr/bin/env node
// variables.json(코드) ↔ Figma 변수 스냅샷을 비교한다(.claude/skills/ds/figma-sync). 코드가 원본이고 Figma는 생성물이다.
//   node scripts/figma-diff.mjs <snapshot.txt|snapshot.json>   차이를 출력, 다르면 exit 1
//   node scripts/figma-diff.mjs --emit upsert                   use_figma에 붙일 변수 upsert 스크립트(데이터 포함)
//   node scripts/figma-diff.mjs --emit readback                 use_figma에 붙일 스냅샷 읽기 스크립트
// 스냅샷 형식(줄 단위): `#<컬렉션>|<모드1>|<모드2>…` 머리줄 뒤에 `<변수 이름>|<C|F|S>|<값1>|<값2>…`.
// 값: 색 `#RRGGBB(AA)` · 수 · 문자열, 별칭은 `@<컬렉션>/<변수 이름>`. 줄여 쓰기: `^x` = `@Primitives/color/x`,
// `^^x` = `@Primitives/x`, `~` = `@Company/<엔진 모드>/<같은 이름>`(Semantic 회사 색). readback이 이 형식으로 돌려준다.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DEFAULT_VARIABLES = `${ROOT}packages/tokens/dist/figma/variables.json`;
const ENGINE = { Light: 'light', Dark: 'dark', 'HC Light': 'hcLight', 'HC Dark': 'hcDark' };
const TYPE = { COLOR: 'C', FLOAT: 'F', STRING: 'S' };

const HELP = `figma-diff — variables.json과 Figma 변수 스냅샷 비교

사용:
  node scripts/figma-diff.mjs <snapshot> [--variables <path>] [--json]
  node scripts/figma-diff.mjs --emit upsert [--variables <path>] [--no-prune]
  node scripts/figma-diff.mjs --emit readback
  node scripts/figma-diff.mjs --hash
  node scripts/figma-diff.mjs --help

<snapshot>  readback 스크립트가 돌려준 글(줄 형식) 또는 variables.json 모양의 JSON 파일
--variables 비교 기준(기본 packages/tokens/dist/figma/variables.json, 없으면
            pnpm --filter @terracelab/trellis-tokens build)
--json      차이를 JSON으로 출력
--emit upsert    컬렉션 · 모드 · 변수 · 별칭 · 스코프 · WEB 코드 구문을 맞추는 use_figma 스크립트를 출력.
                 이름으로 찾아 고치고(멱등), 기준에 없는 변수 · 모드는 지운다(--no-prune이면 남긴다)
--emit readback  Figma 변수를 줄 형식 스냅샷 글로 돌려주는 use_figma 스크립트를 출력
                 (돌려주는 값: audit · hash · length · snapshot. 스크립트의 FULL = false면 snapshot을 뺀다)
--hash      기준을 줄 형식(컬렉션 안 변수는 이름순)으로 바꾼 글의 FNV-1a 해시와 길이. readback의 hash · length와 같으면 차이 없음

출력: 추가(코드에만 있음) · 삭제(Figma에만 있음) · 값 변경 · 모드 불일치 · 별칭 불일치.
종료 코드: 같으면 0, 다르면 1, 사용법 오류 2.`;

/** 줄 형식 글 → { [컬렉션]: { modes, vars: Map(name → { type, values: { mode: string } }) } } */
export function parseLines(text) {
  const model = {};
  let cur = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('#')) {
      const [name, ...modes] = line.slice(1).split('|');
      cur = { modes, vars: new Map() };
      model[name] = cur;
      continue;
    }
    if (!cur) throw new Error(`컬렉션 머리줄 없이 변수 줄이 나왔다: ${line}`);
    const [name, type, ...vals] = line.split('|');
    const values = {};
    cur.modes.forEach((mode, i) => {
      values[mode] = expand(vals[i] ?? '', type, mode, name);
    });
    cur.vars.set(name, { type, values });
  }
  return model;
}

/** 줄여 쓴 값을 풀어 비교용 정규 문자열로 */
function expand(v, type, mode, name) {
  if (v === '~') return `@Company/${ENGINE[mode] ?? mode}/${name}`;
  if (v.startsWith('^^')) return `@Primitives/${v.slice(2)}`;
  if (v.startsWith('^')) return `@Primitives/color/${v.slice(1)}`;
  if (v.startsWith('@')) return v;
  if (type === 'C') {
    const hex = v.replace('#', '').toUpperCase();
    return `#${hex.length === 8 && hex.endsWith('FF') ? hex.slice(0, 6) : hex}`;
  }
  const n = Number(v);
  if (type === 'F' && v !== '' && Number.isFinite(n)) return String(Math.round(n * 1e4) / 1e4);
  return v;
}

/** variables.json 모양 JSON → 같은 모델 */
export function fromVariablesJson(doc) {
  const model = {};
  for (const c of doc.collections) {
    const vars = new Map();
    for (const v of c.variables) {
      const values = {};
      for (const mode of c.modes) {
        const x = v.values[mode];
        values[mode] =
          x && typeof x === 'object'
            ? `@${x.alias}`
            : expand(String(x), TYPE[v.type], mode, v.name);
      }
      vars.set(v.name, { type: TYPE[v.type] ?? v.type, values });
    }
    model[c.name] = { modes: [...c.modes], vars };
  }
  return model;
}

/** 모델 → 줄 형식 글(줄여 쓰기 적용). upsert 데이터와 readback 출력이 같은 형식이다 */
export function toLines(model) {
  const out = [];
  for (const [name, c] of Object.entries(model)) {
    out.push(`#${name}|${c.modes.join('|')}`);
    for (const [vn, v] of c.vars) {
      const vals = c.modes.map((mode) => {
        const x = v.values[mode];
        if (x === `@Company/${ENGINE[mode]}/${vn}`) return '~';
        if (x.startsWith('@Primitives/color/')) return `^${x.slice(18)}`;
        if (x.startsWith('@Primitives/')) return `^^${x.slice(12)}`;
        return x;
      });
      out.push(`${vn}|${v.type}|${vals.join('|')}`);
    }
  }
  return out.join('\n');
}

/** 해시용 정규형: 컬렉션 안의 변수 줄을 이름순으로 놓는다. Figma는 새 변수를 컬렉션 끝에 붙이고 순서를 바꾸는 API가 없다 */
export function canonical(text) {
  const out = [];
  let block = [];
  const flush = () => {
    out.push(...block.sort());
    block = [];
  };
  for (const line of text.split('\n')) {
    if (line.startsWith('#')) {
      flush();
      out.push(line);
    } else block.push(line);
  }
  flush();
  return out.join('\n');
}

/** FNV-1a 32비트(UTF-16 코드 단위). readback 스크립트와 같은 계산 */
export function fnv1a(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16);
}

export function diff(expected, actual) {
  const d = { added: [], removed: [], changed: [], modes: [], aliases: [], types: [] };
  for (const [cn, ec] of Object.entries(expected)) {
    const ac = actual[cn];
    if (!ac) {
      d.modes.push({ collection: cn, expected: ec.modes, actual: null });
      for (const vn of ec.vars.keys()) d.added.push(`${cn}/${vn}`);
      continue;
    }
    if (ec.modes.join('|') !== ac.modes.join('|'))
      d.modes.push({ collection: cn, expected: ec.modes, actual: ac.modes });
    for (const [vn, ev] of ec.vars) {
      const av = ac.vars.get(vn);
      if (!av) {
        d.added.push(`${cn}/${vn}`);
        continue;
      }
      if (ev.type !== av.type)
        d.types.push({ variable: `${cn}/${vn}`, expected: ev.type, actual: av.type });
      for (const mode of ec.modes) {
        if (!ac.modes.includes(mode)) continue; // 모드 불일치로 이미 보고했다
        const e = ev.values[mode];
        const a = av.values[mode];
        if (e === a) continue;
        const entry = { variable: `${cn}/${vn}`, mode, expected: e, actual: a ?? null };
        if (e?.startsWith('@') || a?.startsWith('@')) d.aliases.push(entry);
        else d.changed.push(entry);
      }
    }
    for (const vn of ac.vars.keys()) if (!ec.vars.has(vn)) d.removed.push(`${cn}/${vn}`);
  }
  for (const cn of Object.keys(actual))
    if (!expected[cn]) {
      d.modes.push({ collection: cn, expected: null, actual: actual[cn].modes });
      for (const vn of actual[cn].vars.keys()) d.removed.push(`${cn}/${vn}`);
    }
  return d;
}

const READBACK = String.raw`// Trellis — Figma 변수 스냅샷(scripts/figma-diff.mjs --emit readback). 읽기 전용
const ENGINE = { Light: 'light', Dark: 'dark', 'HC Light': 'hcLight', 'HC Dark': 'hcDark' };
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const h2 = (x) => Math.round(x * 255).toString(16).padStart(2, '0').toUpperCase();
const colls = await figma.variables.getLocalVariableCollectionsAsync();
const vars = await figma.variables.getLocalVariablesAsync();
const byId = new Map(vars.map((v) => [v.id, v]));
const collById = new Map(colls.map((c) => [c.id, c]));
const out = [];
const audit = { allScopes: 0, codeSyntaxMismatch: [], variables: 0 };
for (const c of colls) {
  out.push('#' + c.name + '|' + c.modes.map((m) => m.name).join('|'));
  const block = [];
  for (const id of c.variableIds) {
    const v = byId.get(id);
    audit.variables++;
    if (v.scopes.includes('ALL_SCOPES')) audit.allScopes++;
    const path = c.name === 'Company' ? v.name.split('/').slice(1) : v.name.split('/');
    const web = 'var(--tl-' + path.map(kebab).join('-') + ')';
    if ((v.codeSyntax || {}).WEB !== web) audit.codeSyntaxMismatch.push(c.name + '/' + v.name);
    const vals = c.modes.map((m) => {
      const x = v.valuesByMode[m.modeId];
      if (x && x.type === 'VARIABLE_ALIAS') {
        const t = byId.get(x.id);
        if (!t) return '@?' + x.id;
        const tc = collById.get(t.variableCollectionId).name;
        if (tc === 'Company' && t.name === ENGINE[m.name] + '/' + v.name) return '~';
        if (tc === 'Primitives') return t.name.startsWith('color/') ? '^' + t.name.slice(6) : '^^' + t.name;
        return '@' + tc + '/' + t.name;
      }
      if (v.resolvedType === 'COLOR') return '#' + h2(x.r) + h2(x.g) + h2(x.b) + (x.a < 1 ? h2(x.a) : '');
      if (v.resolvedType === 'FLOAT') return String(Math.round(x * 1e4) / 1e4);
      return String(x);
    });
    block.push(v.name + '|' + v.resolvedType[0] + '|' + vals.join('|'));
  }
  // 변수 줄은 이름순(해시가 Figma 안의 순서에 매이지 않게). --hash도 같은 정규형을 쓴다
  out.push(...block.sort());
}
const snapshot = out.join('\n');
let hash = 0x811c9dc5;
for (let i = 0; i < snapshot.length; i++) { hash ^= snapshot.charCodeAt(i); hash = Math.imul(hash, 0x01000193) >>> 0; }
// FULL = false면 해시만 돌려준다. node scripts/figma-diff.mjs --hash 값과 같으면 차이 없음
const FULL = true;
return { audit, hash: hash.toString(16), length: snapshot.length, snapshot: FULL ? snapshot : undefined };`;

function upsertScript(lines, prune) {
  return `// Trellis — 변수 upsert(scripts/figma-diff.mjs --emit upsert). 원본: packages/tokens/dist/figma/variables.json
const DATA = ${JSON.stringify(lines)};
const PRUNE = ${prune};
const ENGINE = { Light: 'light', Dark: 'dark', 'HC Light': 'hcLight', 'HC Dark': 'hcDark' };
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const rgba = (h) => { h = h.replace('#', ''); const n = parseInt(h.slice(0, 6), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255, a: h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1 }; };
const F = ['FRAME_FILL', 'SHAPE_FILL'], T = ['TEXT_FILL'], S = ['STROKE_COLOR'], FG = ['TEXT_FILL', 'SHAPE_FILL', 'STROKE_COLOR'];
function scopesFor(coll, n, type) {
  const last = n.split('/').pop();
  if (coll === 'Primitives') {
    if (type === 'COLOR') return [];
    if (n.startsWith('border/width')) return ['STROKE_FLOAT'];
    if (n.startsWith('font/family')) return ['FONT_FAMILY'];
    if (n.startsWith('font/weight')) return ['FONT_WEIGHT'];
    if (n.startsWith('radius')) return ['CORNER_RADIUS'];
    if (n.startsWith('size')) return ['WIDTH_HEIGHT'];
    if (n.startsWith('layout/gutter')) return ['GAP'];
    if (n.startsWith('layout')) return ['WIDTH_HEIGHT'];
    if (n.startsWith('space')) return ['GAP'];
    return [];
  }
  if (coll === 'Company') return [];
  if (coll === 'Semantic') {
    const g = n.split('/')[1];
    if (g === 'bg') return F;
    if (g === 'fg' || g === 'finance') return FG;
    if (g === 'border') return last === 'divider' ? [...F, ...S] : S;
    if (g === 'nav') return /^fg/.test(last) ? FG : last === 'border' || last === 'focus' ? S : F;
    if (g === 'avatar') return last === 'bg' ? F : ['TEXT_FILL', 'SHAPE_FILL'];
    if (g === 'brand') return last === 'subtle' || last === 'tint' ? F : last === 'onBrand' ? FG : [...F, ...T, ...S];
    if (g === 'status' || g === 'approval') return last === 'subtle' ? F : last === 'default' ? [...F, ...T, ...S] : FG;
    if (g === 'module') return last === 'onTile' ? FG : F;
    if (g === 'chart') return last === 'heatInk' ? T : [...F, ...S];
    return [...F, ...T, ...S];
  }
  if (/fontSize$/.test(n)) return ['FONT_SIZE'];
  if (/lineHeight$/.test(n)) return ['LINE_HEIGHT'];
  if (coll === 'Typography') return ['FONT_WEIGHT'];
  if (coll === 'Density') return /padding$|gutter$/.test(n) ? ['GAP'] : ['WIDTH_HEIGHT'];
  if (coll === 'Paper') {
    if (type === 'COLOR') return /fg|muted/.test(last) ? T : /line/.test(last) ? S : F;
    return /margin/.test(n) ? ['GAP'] : ['WIDTH_HEIGHT'];
  }
  return [];
}
const cols = []; let cur = null;
for (const line of DATA.split('\\n')) {
  if (line[0] === '#') { const [name, ...modes] = line.slice(1).split('|'); cur = { name, modes, vars: [] }; cols.push(cur); continue; }
  const [name, t, ...vals] = line.split('|');
  cur.vars.push({ name, type: { C: 'COLOR', F: 'FLOAT', S: 'STRING' }[t], vals });
}
const existing = await figma.variables.getLocalVariableCollectionsAsync();
const byKey = new Map();
for (const v of await figma.variables.getLocalVariablesAsync()) {
  const c = existing.find((x) => x.id === v.variableCollectionId);
  byKey.set(c.name + '/' + v.name, v);
}
const stats = { created: 0, updated: 0, removed: 0, collections: {} };
for (const c of cols) {
  let coll = existing.find((x) => x.name === c.name);
  if (!coll) coll = figma.variables.createVariableCollection(c.name);
  if (!coll.modes.some((m) => m.name === c.modes[0])) coll.renameMode(coll.modes[0].modeId, c.modes[0]);
  for (const m of c.modes) if (!coll.modes.some((x) => x.name === m)) coll.addMode(m);
  if (PRUNE) for (const m of coll.modes) if (!c.modes.includes(m.name)) coll.removeMode(m.modeId);
  const modeId = Object.fromEntries(coll.modes.map((m) => [m.name, m.modeId]));
  for (const v of c.vars) {
    const key = c.name + '/' + v.name;
    let variable = byKey.get(key);
    if (variable && variable.resolvedType !== v.type) { variable.remove(); variable = null; }
    if (!variable) { variable = figma.variables.createVariable(v.name, coll, v.type); byKey.set(key, variable); stats.created++; }
    else stats.updated++;
    c.modes.forEach((m, i) => {
      const raw = v.vals[i];
      let value;
      const alias = (k) => { const t = byKey.get(k); if (!t) throw new Error('alias target missing: ' + k + ' for ' + key); return { type: 'VARIABLE_ALIAS', id: t.id }; };
      if (raw === '~') value = alias('Company/' + ENGINE[m] + '/' + v.name);
      else if (raw.startsWith('^^')) value = alias('Primitives/' + raw.slice(2));
      else if (raw.startsWith('^')) value = alias('Primitives/color/' + raw.slice(1));
      else if (raw.startsWith('@')) value = alias(raw.slice(1));
      else if (v.type === 'COLOR') value = rgba(raw);
      else if (v.type === 'FLOAT') value = Number(raw);
      else value = raw;
      variable.setValueForMode(modeId[m], value);
    });
    variable.scopes = scopesFor(c.name, v.name, v.type);
    const path = c.name === 'Company' ? v.name.split('/').slice(1) : v.name.split('/');
    variable.setVariableCodeSyntax('WEB', 'var(--tl-' + path.map(kebab).join('-') + ')');
  }
  if (PRUNE) {
    const keep = new Set(c.vars.map((v) => v.name));
    for (const id of [...coll.variableIds]) {
      const v = await figma.variables.getVariableByIdAsync(id);
      if (!keep.has(v.name)) { v.remove(); stats.removed++; }
    }
  }
  stats.collections[c.name] = { id: coll.id, modes: coll.modes.map((m) => m.name + '=' + m.modeId), variables: coll.variableIds.length };
}
return stats;`;
}

function main(argv) {
  const args = [...argv];
  const flag = (name) => {
    const i = args.indexOf(name);
    if (i === -1) return undefined;
    const [, value] = args.splice(i, 2);
    return value;
  };
  const has = (name) => {
    const i = args.indexOf(name);
    if (i === -1) return false;
    args.splice(i, 1);
    return true;
  };
  if (has('--help') || has('-h')) {
    console.log(HELP);
    return 0;
  }
  const variablesPath = flag('--variables') ?? DEFAULT_VARIABLES;
  const emit = flag('--emit');
  const asJson = has('--json');
  const noPrune = has('--no-prune');
  const load = () => fromVariablesJson(JSON.parse(readFileSync(variablesPath, 'utf8')));

  if (has('--hash')) {
    const text = canonical(toLines(load()));
    console.log(`${fnv1a(text)} ${text.length}`);
    return 0;
  }
  if (emit === 'readback') {
    console.log(READBACK);
    return 0;
  }
  if (emit === 'upsert') {
    console.log(upsertScript(toLines(load()), !noPrune));
    return 0;
  }
  if (emit !== undefined || args.length !== 1) {
    console.error(HELP);
    return 2;
  }

  const text = readFileSync(args[0], 'utf8').trim();
  let actual;
  if (text.startsWith('{')) {
    const doc = JSON.parse(text);
    actual = doc.snapshot
      ? parseLines(doc.snapshot)
      : doc.collections
        ? fromVariablesJson(doc)
        : null;
    if (!actual) throw new Error('JSON 스냅샷에는 snapshot(글) 또는 collections가 있어야 한다');
  } else {
    actual = parseLines(text);
  }
  const d = diff(load(), actual);
  const total = Object.values(d).reduce((n, list) => n + list.length, 0);
  if (asJson) {
    console.log(JSON.stringify({ total, ...d }, null, 2));
    return total ? 1 : 0;
  }
  const count = (model) => Object.values(model).reduce((n, c) => n + c.vars.size, 0);
  console.log(
    `기준 ${variablesPath.replace(ROOT, '')}: 변수 ${count(load())} · 스냅샷 ${count(actual)}`,
  );
  const section = (title, list, fmt) => {
    if (!list.length) return;
    console.log(`\n${title} ${list.length}`);
    for (const x of list.slice(0, 200)) console.log(`  ${fmt(x)}`);
    if (list.length > 200) console.log(`  … ${list.length - 200}개 더`);
  };
  section('추가(코드에만 있음)', d.added, (x) => x);
  section('삭제(Figma에만 있음)', d.removed, (x) => x);
  section(
    '모드 불일치',
    d.modes,
    (x) => `${x.collection}: 코드 [${x.expected}] · Figma [${x.actual}]`,
  );
  section('타입 불일치', d.types, (x) => `${x.variable}: 코드 ${x.expected} · Figma ${x.actual}`);
  section(
    '값 변경',
    d.changed,
    (x) => `${x.variable} [${x.mode}]: 코드 ${x.expected} · Figma ${x.actual}`,
  );
  section(
    '별칭 불일치',
    d.aliases,
    (x) => `${x.variable} [${x.mode}]: 코드 ${x.expected} · Figma ${x.actual}`,
  );
  console.log(total ? `\n차이 ${total}` : '\n차이 없음');
  return total ? 1 : 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}
