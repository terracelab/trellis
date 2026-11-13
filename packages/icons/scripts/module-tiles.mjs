// 모듈 타일 일러스트 파이프라인(D-36).
// src/module-tiles/*.svg 는 정규화된 상태로 커밋한다. build 는 정규화되지 않은 소스를 거절한다.
//   node scripts/module-tiles.mjs normalize   소스를 제자리에서 정규화
//   node scripts/module-tiles.mjs build       dist/module-tiles/*, dist/module-tiles.{js,d.ts}
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { optimize } from 'svgo';
import modules from '@terracelab/trellis-tokens/modules' with { type: 'json' };

export const PKG = fileURLToPath(new URL('..', import.meta.url));
export const SRC = join(PKG, 'src', 'module-tiles');
export const DIST = join(PKG, 'dist');
export const ID_PREFIX = 'tl-tile-';
export const SIZE = 1024;
export const VIEWBOX = `0 0 ${SIZE} ${SIZE}`;
/** 1024 기준 220 ≈ 21.5%. components.md §7 의 radius 22% */
export const RADIUS = 220;

const FORBIDDEN = [
  '<script',
  '<style',
  '<image',
  '<foreignObject',
  '<text',
  'xlink:',
  'http://',
  'https://',
];

const escapeXml = (s) =>
  s.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]);
const titleId = (id) => `${ID_PREFIX}${id}-title`;

export function readManifest(dir = SRC) {
  return JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));
}

export function listTiles(dir = SRC) {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.svg'))
    .map((f) => f.slice(0, -4))
    .sort();
}

/** manifest 항목 → { id, module, group, label }. 모듈에 묶인 타일의 라벨은 modules.json 에서 온다. */
export function resolveTile(id, manifest) {
  const entry = manifest.tiles[id];
  if (!entry) throw new Error(`manifest.json에 없는 타일: ${id}`);
  if (entry.module) {
    const m = modules.modules.find((x) => x.id === entry.module);
    if (!m) throw new Error(`modules.json에 없는 모듈 "${entry.module}" (타일 ${id})`);
    if (entry.label) throw new Error(`모듈에 묶인 타일은 라벨을 modules.json에서 받는다: ${id}`);
    return { id, module: m.id, group: m.group, label: m.label };
  }
  if (!entry.label) throw new Error(`미배정 타일은 label이 필요하다: ${id}`);
  return { id, module: null, group: null, label: entry.label };
}

/** 원본 SVG → 규격 SVG. 멱등: normalize(normalize(x)) === normalize(x). 경로 데이터는 바꾸지 않는다. */
export function normalize(svg, id, label) {
  const prefix = `${ID_PREFIX}${id}-`;
  const bg = svg.match(/id="([A-Za-z0-9_-]+?)-tile"/);
  if (!bg) throw new Error(`${id}: 배경 그라데이션 id "*-tile"이 없다`);
  let out = svg;
  if (bg[1] !== `${ID_PREFIX}${id}`) {
    out = out.replaceAll(`id="${bg[1]}-`, `id="${prefix}`).replaceAll(`#${bg[1]}-`, `#${prefix}`);
  }
  out = out.replace(/\s*<title\b[^>]*>[\s\S]*?<\/title>/g, '');
  const root = out.match(/^\s*<svg\b[^>]*>/);
  if (!root) throw new Error(`${id}: <svg> 루트가 없다`);
  out =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" width="${SIZE}" height="${SIZE}" role="img" aria-labelledby="${titleId(id)}">` +
    `<title id="${titleId(id)}">${escapeXml(label)}</title>` +
    out.slice(root[0].length);
  const { data } = optimize(out, {
    multipass: true,
    js2svg: { pretty: true, indent: 2, finalNewline: true },
    plugins: [
      'removeDoctype',
      'removeXMLProcInst',
      'removeComments',
      'removeMetadata',
      'removeEditorsNSData',
      { name: 'cleanupIds', params: { minify: false, remove: true, preserve: [titleId(id)] } },
      'removeUselessDefs',
      'removeEmptyContainers',
      'removeEmptyAttrs',
      'removeUnusedNS',
    ],
  });
  return data;
}

/** 규격 검사. 문제가 없으면 []. */
export function validate(svg, id, label) {
  const problems = [];
  const prefix = `${ID_PREFIX}${id}-`;
  const root = svg.match(/^\s*<svg\b([^>]*)>/);
  if (!root) return ['<svg> 루트가 없다'];
  for (const want of [
    `viewBox="${VIEWBOX}"`,
    `width="${SIZE}"`,
    `height="${SIZE}"`,
    'role="img"',
    `aria-labelledby="${titleId(id)}"`,
  ])
    if (!root[1].includes(want)) problems.push(`루트에 ${want} 없음`);
  if (!svg.includes(`<title id="${titleId(id)}">${escapeXml(label)}</title>`))
    problems.push(`<title>가 "${label}"이 아니다`);
  const firstRect = svg.match(/<rect\b[^>]*>/);
  if (
    !firstRect ||
    !firstRect[0].includes(`rx="${RADIUS}"`) ||
    !firstRect[0].includes(`width="${SIZE}"`) ||
    !firstRect[0].includes(`height="${SIZE}"`)
  )
    problems.push(`첫 rect가 ${SIZE}×${SIZE} rx ${RADIUS} 배경이 아니다`);
  const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
  if (dup.length) problems.push(`중복 id: ${dup.join(', ')}`);
  for (const x of ids) if (!x.startsWith(prefix)) problems.push(`id 접두 위반: ${x}`);
  const refs = [...svg.matchAll(/url\(#([^)]+)\)|href="#([^"]+)"|aria-labelledby="([^"]+)"/g)].map(
    (m) => m[1] ?? m[2] ?? m[3],
  );
  for (const r of new Set(refs)) if (!ids.includes(r)) problems.push(`깨진 참조: #${r}`);
  for (const x of ids) if (!refs.includes(x)) problems.push(`쓰이지 않는 id: ${x}`);
  const body = svg.slice(root[0].length);
  for (const f of FORBIDDEN) if (body.includes(f)) problems.push(`금지 요소·참조: ${f}`);
  return problems;
}

/** 배경 그라데이션(`*-tile`)의 stop 색. 매니페스트·Figma용 기록이다. */
export function tileGradient(svg, id) {
  const block = svg.match(
    new RegExp(`<linearGradient[^>]*id="${ID_PREFIX}${id}-tile"[\\s\\S]*?</linearGradient>`),
  );
  if (!block) return null;
  return [...block[0].matchAll(/stop-color="(#[0-9A-Fa-f]{6})"/g)].map((m) => m[1].toUpperCase());
}

/** 단독 SVG → 스프라이트용 <symbol>. title 은 뺀다(스프라이트 사용처는 aria-hidden). */
export function toSymbol(svg, id) {
  const root = svg.match(/^\s*<svg\b[^>]*>/);
  const inner = svg
    .slice(root[0].length)
    .replace(/<\/svg>\s*$/, '')
    .replace(/\s*<title\b[^>]*>[\s\S]*?<\/title>/, '')
    .trim();
  return `<symbol id="${ID_PREFIX}${id}" viewBox="${VIEWBOX}">\n${inner}\n</symbol>`;
}

function jsModule(svgs, sprite, manifest) {
  const byModule = Object.fromEntries(
    manifest.tiles.filter((t) => t.module).map((t) => [t.module, t.id]),
  );
  return `// 생성물 — scripts/module-tiles.mjs. 수정 금지
export const moduleTileManifest = ${JSON.stringify(manifest, null, 2)};

export const moduleTileIds = Object.freeze(${JSON.stringify(Object.keys(svgs))});

/** 모듈 id → 타일 id. 타일이 없는 모듈은 undefined */
export const moduleTileByModule = Object.freeze(${JSON.stringify(byModule, null, 2)});

/** 타일 id → 단독 SVG 문서(role=img, <title> 포함) */
export const moduleTiles = Object.freeze(${JSON.stringify(svgs, null, 2)});

/** 문서에 한 번 넣는 심볼 스프라이트. 사용: <svg aria-hidden="true"><use href="#tl-tile-<id>"/></svg> */
export const moduleTileSprite = ${JSON.stringify(sprite)};
`;
}

function dts(manifest) {
  const union = manifest.tiles.map((t) => JSON.stringify(t.id)).join(' | ');
  return `// 생성물 — scripts/module-tiles.mjs. 수정 금지
export type ModuleTileId = ${union};

export interface ModuleTile {
  id: ModuleTileId;
  /** modules.json 의 모듈 id. 미배정 타일은 null */
  module: string | null;
  group: string | null;
  label: string;
  /** dist 기준 경로 */
  file: string;
  /** 스프라이트 심볼 id */
  symbol: string;
  /** 배경 그라데이션 stop 색(위 → 아래) */
  gradient: string[] | null;
}

export interface ModuleTileManifest {
  tiles: ModuleTile[];
  modulesWithoutTile: string[];
  viewBox: string;
  size: number;
  radius: number;
  idPrefix: string;
}

export declare const moduleTileManifest: ModuleTileManifest;
export declare const moduleTileIds: readonly ModuleTileId[];
export declare const moduleTileByModule: Readonly<Partial<Record<string, ModuleTileId>>>;
export declare const moduleTiles: Readonly<Record<ModuleTileId, string>>;
export declare const moduleTileSprite: string;
`;
}

/** 소스를 읽어 검증하고 dist 를 쓴다. 정규화되지 않은 소스가 있으면 실패한다. */
export function build({ outDir = DIST } = {}) {
  const manifest = readManifest();
  const ids = listTiles();
  const listed = Object.keys(manifest.tiles).sort();
  if (JSON.stringify(ids) !== JSON.stringify(listed))
    throw new Error(`manifest.json과 svg 파일이 다르다.\n  파일: ${ids}\n  매니페스트: ${listed}`);
  const svgs = {};
  const tiles = [];
  for (const id of ids) {
    const info = resolveTile(id, manifest);
    const src = readFileSync(join(SRC, `${id}.svg`), 'utf8');
    if (normalize(src, id, info.label) !== src)
      throw new Error(
        `${id}.svg 가 정규화되지 않았다. 먼저: pnpm --filter @terracelab/trellis-icons tiles:normalize`,
      );
    const problems = validate(src, id, info.label);
    if (problems.length) throw new Error(`${id}.svg\n  - ${problems.join('\n  - ')}`);
    svgs[id] = src;
    tiles.push({
      ...info,
      file: `module-tiles/${id}.svg`,
      symbol: `${ID_PREFIX}${id}`,
      gradient: tileGradient(src, id),
    });
  }
  const bound = new Set(tiles.map((t) => t.module).filter(Boolean));
  const out = {
    tiles,
    modulesWithoutTile: modules.modules.filter((m) => !bound.has(m.id)).map((m) => m.id),
    viewBox: VIEWBOX,
    size: SIZE,
    radius: RADIUS,
    idPrefix: ID_PREFIX,
  };
  const sprite =
    `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden">\n` +
    tiles.map((t) => toSymbol(svgs[t.id], t.id)).join('\n') +
    `\n</svg>\n`;

  const dir = join(outDir, 'module-tiles');
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const id of ids) writeFileSync(join(dir, `${id}.svg`), svgs[id]);
  writeFileSync(join(dir, 'sprite.svg'), sprite);
  writeFileSync(join(dir, 'manifest.json'), `${JSON.stringify(out, null, 2)}\n`);
  writeFileSync(join(outDir, 'module-tiles.js'), jsModule(svgs, sprite, out));
  writeFileSync(join(outDir, 'module-tiles.d.ts'), dts(out));
  return out;
}

/** 소스를 제자리에서 정규화한다. 바뀐 파일 수를 돌려준다. */
export function normalizeSources() {
  const manifest = readManifest();
  let changed = 0;
  const problems = [];
  for (const id of listTiles()) {
    const info = resolveTile(id, manifest);
    const path = join(SRC, `${id}.svg`);
    const src = readFileSync(path, 'utf8');
    const out = normalize(src, id, info.label);
    if (out !== src) {
      writeFileSync(path, out);
      changed++;
    }
    for (const p of validate(out, id, info.label)) problems.push(`${id}.svg: ${p}`);
  }
  if (problems.length) throw new Error(problems.join('\n'));
  return changed;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const cmd = process.argv[2];
  if (cmd === 'normalize') {
    const n = normalizeSources();
    console.log(`module-tiles: ${listTiles().length}개 정규화, ${n}개 바뀜`);
  } else if (cmd === 'build') {
    const out = build();
    const bound = out.tiles.filter((t) => t.module).length;
    console.log(
      `module-tiles: 타일 ${out.tiles.length}개(모듈 배정 ${bound}, 미배정 ${out.tiles.length - bound}), 타일 없는 모듈 ${out.modulesWithoutTile.length}개 → dist/module-tiles`,
    );
  } else {
    console.error('사용: node scripts/module-tiles.mjs normalize | build');
    process.exit(2);
  }
}
