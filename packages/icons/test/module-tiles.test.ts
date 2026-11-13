import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import modules from '@terracelab/trellis-tokens/modules';
import { afterAll, describe, expect, it } from 'vitest';
import {
  ID_PREFIX,
  RADIUS,
  SRC,
  build,
  listTiles,
  normalize,
  readManifest,
  resolveTile,
  validate,
} from '../scripts/module-tiles.mjs';

const manifest = readManifest();
const ids = listTiles();
const read = (id: string) => readFileSync(join(SRC, `${id}.svg`), 'utf8');

describe('module-tiles 소스', () => {
  it('manifest.json과 svg 파일이 1:1이다', () => {
    expect(ids).toEqual(Object.keys(manifest.tiles).sort());
    expect(ids.length).toBeGreaterThan(0);
  });

  it('모듈에 묶인 타일은 modules.json의 모듈·라벨을 쓰고, 미배정 타일만 라벨을 직접 쓴다', () => {
    const moduleIds = new Set(modules.modules.map((m) => m.id));
    for (const id of ids) {
      const info = resolveTile(id, manifest);
      if (info.module) {
        expect(moduleIds.has(info.module), id).toBe(true);
        expect(info.label).toBe(modules.modules.find((m) => m.id === info.module)!.label);
      } else {
        expect(info.label.length, id).toBeGreaterThan(0);
      }
    }
    const bound = ids.map((id) => resolveTile(id, manifest).module).filter(Boolean);
    expect(new Set(bound).size, '한 모듈에 타일 둘').toBe(bound.length);
  });

  it.each(ids)('%s.svg 는 정규화된 상태이고 규격을 지킨다', (id) => {
    const { label } = resolveTile(id, manifest);
    const svg = read(id);
    expect(validate(svg, id, label)).toEqual([]);
    expect(normalize(svg, id, label)).toBe(svg);
  });

  it('id 접두가 타일마다 달라 한 문서에 모두 인라인해도 충돌하지 않는다', () => {
    const all = ids.flatMap((id) => [...read(id).matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]!));
    expect(new Set(all).size).toBe(all.length);
    for (const x of all) expect(x.startsWith(ID_PREFIX)).toBe(true);
  });

  it('원본 접두(crm-tile 같은)를 가진 입력도 같은 결과로 정규화한다(멱등)', () => {
    const svg = read(ids[0]!);
    const { label } = resolveTile(ids[0]!, manifest);
    const raw = svg
      .replaceAll(`${ID_PREFIX}${ids[0]}-`, 'foo-')
      .replace(/<title[^>]*>.*<\/title>/, '');
    expect(normalize(raw, ids[0]!, label)).toBe(svg);
  });
});

describe('module-tiles 빌드', () => {
  const out = mkdtempSync(join(tmpdir(), 'trellis-tiles-'));
  afterAll(() => rmSync(out, { recursive: true, force: true }));
  const result = build({ outDir: out });

  it('타일 svg · sprite · manifest · js · d.ts 를 쓴다', () => {
    const files = readdirSync(join(out, 'module-tiles')).sort();
    expect(files).toEqual([...ids.map((id) => `${id}.svg`), 'manifest.json', 'sprite.svg'].sort());
    expect(existsSync(join(out, 'module-tiles.js'))).toBe(true);
    expect(existsSync(join(out, 'module-tiles.d.ts'))).toBe(true);
  });

  it('manifest 는 타일마다 그라데이션 3색을 갖고, 타일 없는 모듈 수가 맞는다', () => {
    for (const t of result.tiles) {
      expect(t.gradient, t.id).toHaveLength(3);
      for (const c of t.gradient!) expect(c).toMatch(/^#[0-9A-F]{6}$/);
    }
    const bound = result.tiles.filter((t) => t.module).length;
    expect(result.modulesWithoutTile.length).toBe(modules.modules.length - bound);
    expect(result.radius).toBe(RADIUS);
  });

  it('sprite 는 타일마다 <symbol id="tl-tile-<id>"> 하나씩이고 title 이 없다', () => {
    const sprite = readFileSync(join(out, 'module-tiles', 'sprite.svg'), 'utf8');
    for (const id of ids)
      expect(sprite).toContain(`<symbol id="${ID_PREFIX}${id}" viewBox="0 0 1024 1024">`);
    expect(sprite.match(/<symbol /g)).toHaveLength(ids.length);
    expect(sprite).not.toContain('<title');
    expect(sprite).toContain('aria-hidden="true"');
  });

  it('module-tiles.js 가 import 되고 내용이 소스와 같다', async () => {
    const mod = await import(join(out, 'module-tiles.js'));
    expect([...mod.moduleTileIds]).toEqual(ids);
    for (const id of ids) expect(mod.moduleTiles[id]).toBe(read(id));
    expect(mod.moduleTileByModule['accounting']).toBe('accounting');
    expect(mod.moduleTileSprite.startsWith('<svg ')).toBe(true);
  });
});
