import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Ajv2020 } from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  ALIAS,
  MODE_SETS,
  SRC,
  TYPES,
  fileLeaves,
  isObject,
  readJson,
  tokenFiles,
  tokenMap,
  type TokenType,
} from './helpers';

const hex = z.string().regex(/^#([0-9A-F]{6}|[0-9A-F]{8})$/, '대문자 hex #RRGGBB 또는 #RRGGBBAA');
const dimension = z
  .string()
  .regex(/^-?\d+(\.\d+)?(px|em|rem|mm|pt)$/, '숫자+단위(px·em·rem · 종이만 mm · pt) 문자열');
const alias = z.string().regex(ALIAS);
const shadowLayer = z.strictObject({
  color: z.union([hex, alias]),
  offsetX: dimension,
  offsetY: dimension,
  blur: dimension,
  spread: dimension,
  inset: z.boolean().optional(),
});

const VALUE: Record<TokenType, z.ZodType> = {
  color: hex,
  dimension,
  fontFamily: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
  fontWeight: z.number().int().min(1).max(1000),
  number: z.number(),
  duration: z.string().regex(/^\d+(\.\d+)?ms$/, '밀리초 문자열(150ms)'),
  cubicBezier: z.tuple([
    z.number().min(0).max(1),
    z.number(),
    z.number().min(0).max(1),
    z.number(),
  ]),
  shadow: z.union([shadowLayer, z.array(shadowLayer).min(1)]),
  string: z.string(),
};

const leafShape = z.strictObject({
  $value: z.unknown(),
  $type: z.enum(TYPES),
  $description: z.string().min(1).optional(),
  $extensions: z.record(z.string(), z.unknown()).optional(),
});

/** 그룹 안에 리프도 그룹도 아닌 값이 있으면 오류 */
function strayValues(node: unknown, path: string[] = []): string[] {
  if (!isObject(node) || '$value' in node) return [];
  return Object.entries(node).flatMap(([key, child]) => {
    if (key.startsWith('$'))
      return key === '$description' && typeof child === 'string'
        ? []
        : [`${[...path, key].join('.')}: 알 수 없는 그룹 메타데이터`];
    if (!isObject(child)) return [`${[...path, key].join('.')}: 리프에 $value가 없다`];
    return strayValues(child, [...path, key]);
  });
}

describe('schema: DTCG 리프', () => {
  const files = tokenFiles();

  it('§1의 소스 파일이 모두 있다', () => {
    expect(files).toEqual(
      expect.arrayContaining([
        'primitive/color.json',
        'primitive/space.json',
        'primitive/radius.json',
        'primitive/border.json',
        'primitive/shadow.json',
        'primitive/motion.json',
        'primitive/z.json',
        'primitive/breakpoint.json',
        'primitive/layout.json',
        'primitive/size.json',
        'primitive/font.json',
        'semantic/color.light.json',
        'semantic/color.dark.json',
        'density/compact.json',
        'density/comfortable.json',
        'density/touch.json',
        'typography.json',
        'paper.json',
      ]),
    );
  });

  it('mm는 종이(paper.*) 크기 · 여백에만 쓴다(D-77)', () => {
    const mm = files
      .flatMap((file) => fileLeaves(file))
      .filter((l) => typeof l.$value === 'string' && l.$value.endsWith('mm'))
      .map((l) => l.path);
    expect(mm.length).toBeGreaterThan(0);
    expect(mm.filter((p) => !/^paper\.(size|margin)\./.test(p))).toEqual([]);
  });

  it('pt는 종이 글자(paper.type.*)에만 쓴다(앱 글자 크기 모드가 닿지 않는 인쇄 단위)', () => {
    const pt = files
      .flatMap((file) => fileLeaves(file))
      .filter((l) => typeof l.$value === 'string' && l.$value.endsWith('pt'))
      .map((l) => l.path);
    expect(pt.length).toBeGreaterThan(0);
    expect(pt.filter((p) => !/^paper\.type\./.test(p))).toEqual([]);
  });

  it.each(files)('%s: $value·$type 필수, 허용 타입, 값 형식', (file) => {
    const errors = strayValues(readJson(file));
    for (const leaf of fileLeaves(file)) {
      const shape = leafShape.safeParse(leaf.raw);
      if (!shape.success) {
        errors.push(
          `${leaf.path}: ${shape.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join(', ')}`,
        );
        continue;
      }
      if (alias.safeParse(leaf.$value).success) continue;
      const value = VALUE[shape.data.$type].safeParse(leaf.$value);
      if (!value.success)
        errors.push(`${leaf.path} (${shape.data.$type}): ${value.error.issues[0]?.message}`);
    }
    expect(errors).toEqual([]);
  });

  it.each(Object.entries(MODE_SETS))(
    '%s: 경로 중복 없음, alias는 존재하는 같은 타입 토큰을 가리킨다',
    (_, set) => {
      const map = tokenMap([...set]);
      const errors: string[] = [];
      for (const leaf of map.values()) {
        // 그림자는 레이어 색이 색 alias이거나, 값 전체가 다른 그림자 alias(paper.shadow → shadow.md)
        const whole = typeof leaf.$value === 'string';
        const values =
          leaf.$type === 'shadow' && !whole
            ? [leaf.$value].flat().map((l) => (l as { color: unknown }).color)
            : [leaf.$value];
        for (const value of values) {
          const m = typeof value === 'string' ? ALIAS.exec(value) : null;
          if (!m) continue;
          const target = map.get(m[1]!);
          const expected = leaf.$type === 'shadow' && !whole ? 'color' : leaf.$type;
          if (!target) errors.push(`${leaf.path} → {${m[1]}} 없음`);
          else if (target.$type !== expected)
            errors.push(`${leaf.path}(${expected}) → ${m[1]}(${target.$type}) 타입 불일치`);
        }
      }
      expect(errors).toEqual([]);
    },
  );
});

describe('schema: modules.json', () => {
  const modules = readJson<{
    groups: Record<string, { label: string; color: string }>;
    modules: { id: string; group: string; icon: string; badge: string }[];
  }>('modules.json');

  it('modules.schema.json을 통과한다', () => {
    const schema = JSON.parse(readFileSync(join(SRC, 'modules.schema.json'), 'utf8')) as object;
    const validate = new Ajv2020({ allErrors: true }).compile(schema);
    const ok = validate(modules);
    expect(validate.errors ?? []).toEqual([]);
    expect(ok).toBe(true);
  });

  it('35모듈 · 7그룹, id 중복 없음, group은 정의된 그룹', () => {
    // 기본 4그룹 20종 + 업종 확장(D-53: 세무 · 유통·물류 · 이커머스 · 제조) 15종
    expect(modules.modules).toHaveLength(35);
    expect(Object.keys(modules.groups)).toEqual([
      'erp',
      'groupware',
      'ecm',
      'crm',
      'scm',
      'commerce',
      'mes',
    ]);
    const ids = modules.modules.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const m of modules.modules) expect(Object.keys(modules.groups), m.id).toContain(m.group);
  });

  it('그룹 color가 가리키는 semantic 토큰 4종이 라이트·다크에 모두 있다', () => {
    for (const set of Object.values(MODE_SETS)) {
      const map = tokenMap([...set]);
      for (const group of Object.values(modules.groups)) {
        for (const key of ['default', 'subtle', 'gradientFrom', 'gradientTo']) {
          expect(map.has(`${group.color}.${key}`), `${group.color}.${key}`).toBe(true);
        }
      }
    }
  });
});
