// 스토리 · VRT 빠짐 검사(pnpm test). 컴포넌트 수 = 스토리 파일 수, 컴포넌트마다 VRT 4조합 스냅샷.
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DENSITIES, SNAPSHOT_DIR, THEMES } from '../vrt/targets.mjs';
import { OUT, componentFolders, drift, planStories, problems } from './gen-stories.mjs';

const plans = await planStories();

describe('스토리', () => {
  it('contracts 폴더마다 스토리 파일 하나(컴포넌트 수 = 스토리 파일 수)', () => {
    expect(componentFolders().length).toBeGreaterThan(0);
    expect(plans.map((p) => p.name)).toEqual(componentFolders());
  });

  it('모든 컴포넌트에 예시 스토리와 VRT 대상이 있다', () => {
    expect(problems(plans)).toEqual([]);
  });

  it.runIf(existsSync(OUT))('generated/가 생성기 결과와 같다', () => {
    expect(drift(plans)).toEqual([]);
  });
});

describe('VRT 스냅샷', () => {
  it('컴포넌트마다 vrt/__snapshots__/<Name>/에 라이트 · 다크 × compact · comfortable', () => {
    const missing = [];
    for (const { name } of plans) {
      const dir = join(SNAPSHOT_DIR, name);
      const files = existsSync(dir) ? readdirSync(dir) : [];
      for (const t of THEMES)
        for (const d of DENSITIES)
          if (!files.some((f) => f.endsWith(`-${t}-${d}.png`))) missing.push(`${name} ${t}-${d}`);
    }
    expect(missing, 'pnpm vrt:update로 만든다(Docker)').toEqual([]);
  });
});
