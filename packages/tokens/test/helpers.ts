// 토큰 테스트 공용 도우미. src/**/*.json(DTCG)을 읽어 리프 목록과 경로 맵을 만든다.
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PKG = fileURLToPath(new URL('..', import.meta.url));
export const SRC = join(PKG, 'src');

export const TYPES = [
  'color',
  'dimension',
  'fontFamily',
  'fontWeight',
  'number',
  'duration',
  'cubicBezier',
  'shadow',
  'string',
] as const;
export type TokenType = (typeof TYPES)[number];

export const ALIAS = /^\{([A-Za-z0-9_.-]+)\}$/;

export interface Leaf {
  path: string;
  file: string;
  $value: unknown;
  $type: string;
  $description?: string;
  raw: Record<string, unknown>;
}

/** DTCG가 아닌 파일(모듈 레지스트리와 그 스키마)은 토큰 목록에서 뺀다. */
const NOT_TOKENS = new Set(['modules.json', 'modules.schema.json']);

function listJson(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return listJson(full);
    return entry.name.endsWith('.json') ? [full] : [];
  });
}

/** src 기준 상대 경로(슬래시 구분), 정렬됨 */
export function tokenFiles(): string[] {
  return listJson(SRC)
    .map((f) => relative(SRC, f).split(sep).join('/'))
    .filter((f) => !NOT_TOKENS.has(f))
    .sort();
}

export function readJson<T = Record<string, unknown>>(rel: string): T {
  return JSON.parse(readFileSync(join(SRC, rel), 'utf8')) as T;
}

export function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** 그룹을 내려가며 `$value`가 있는 객체를 리프로 모은다. `$`로 시작하는 그룹 키는 메타데이터라 건너뛴다. */
export function leaves(node: unknown, file: string, prefix: string[] = []): Leaf[] {
  if (!isObject(node)) return [];
  if ('$value' in node) {
    return [
      {
        path: prefix.join('.'),
        file,
        $value: node['$value'],
        $type: String(node['$type']),
        ...(typeof node['$description'] === 'string' ? { $description: node['$description'] } : {}),
        raw: node,
      },
    ];
  }
  return Object.entries(node)
    .filter(([key]) => !key.startsWith('$'))
    .flatMap(([key, child]) => leaves(child, file, [...prefix, key]));
}

export function fileLeaves(file: string): Leaf[] {
  return leaves(readJson(file), file);
}

/** 여러 파일을 합친 경로 → 리프 맵. 같은 경로가 두 번 나오면 throw */
export function tokenMap(files: string[]): Map<string, Leaf> {
  const map = new Map<string, Leaf>();
  for (const file of files) {
    for (const leaf of fileLeaves(file)) {
      const prev = map.get(leaf.path);
      if (prev) throw new Error(`${leaf.path} 가 ${prev.file}와 ${file}에 중복 정의됨`);
      map.set(leaf.path, leaf);
    }
  }
  return map;
}

export const PRIMITIVE_FILES = tokenFiles().filter((f) => f.startsWith('primitive/'));

/** 모드별로 함께 빌드되는 소스 집합 */
export const MODE_SETS = {
  'light·compact': [
    ...PRIMITIVE_FILES,
    'typography.json',
    'density/compact.json',
    'semantic/color.light.json',
    'paper.json',
  ],
  'dark·comfortable': [
    ...PRIMITIVE_FILES,
    'typography.json',
    'density/comfortable.json',
    'semantic/color.dark.json',
    'paper.json',
  ],
} as const;

/** 덮어쓰기 세트(고대비 · 색각 친화, D-97): 기본 모드 위에 바뀌는 semantic만 얹는다 */
export const OVERRIDE_SETS = {
  hcLight: { base: 'light·compact', file: 'semantic/color.hc-light.json' },
  hcDark: { base: 'dark·comfortable', file: 'semantic/color.hc-dark.json' },
  cvdLight: { base: 'light·compact', file: 'semantic/chart.cvd-light.json' },
  cvdDark: { base: 'dark·comfortable', file: 'semantic/chart.cvd-dark.json' },
} as const;

/** alias를 끝까지 따라가 원시 값을 돌려주는 함수. overrides 파일의 리프는 같은 경로를 덮는다 */
export function resolver(
  files: readonly string[],
  overrides: readonly string[] = [],
): (path: string) => string {
  const map = tokenMap([...files]);
  for (const file of overrides) for (const leaf of fileLeaves(file)) map.set(leaf.path, leaf);
  return (path) => {
    let leaf = map.get(path);
    for (
      let hops = 0;
      leaf && typeof leaf.$value === 'string' && ALIAS.test(leaf.$value);
      hops += 1
    ) {
      if (hops > 10) throw new Error(`${path}: alias 순환`);
      leaf = map.get(ALIAS.exec(leaf.$value)![1]!);
    }
    if (!leaf) throw new Error(`${path}: 토큰 없음`);
    return String(leaf.$value);
  };
}

/** #RRGGBBAA를 바탕 위에 합성한 불투명 hex */
export function composite(fg: string, bg: string): string {
  if (fg.length !== 9) return fg;
  const a = parseInt(fg.slice(7), 16) / 255;
  const ch = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  const mix = [0, 1, 2].map((i) => Math.round(ch(fg, i) * a + ch(bg, i) * (1 - a)));
  return `#${mix.map((n) => n.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

/** 모든 토큰 경로(라이트·다크·두 density의 합집합), 정렬 */
export function allTokenNames(): string[] {
  const names = new Set<string>();
  for (const file of tokenFiles()) for (const leaf of fileLeaves(file)) names.add(leaf.path);
  return [...names].sort();
}
