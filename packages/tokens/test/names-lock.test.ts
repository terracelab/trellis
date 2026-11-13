// G1 이후 토큰 이름 변경 감시. 이름이 사라지거나 바뀌면 major changeset이 있어야 한다.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LOCK_PATH, tokenNames } from '../scripts/lock-names.mjs';
import { PKG, allTokenNames } from './helpers';

/** G1 승인 2026-11-10(Patrick, P0-08). 이름 변경 · 삭제는 major changeset + codemod */
const G1_FROZEN = true;

const locked = () => readFileSync(LOCK_PATH, 'utf8').trim().split('\n');

function hasMajorChangeset(): boolean {
  const dir = join(PKG, '../../.changeset');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md') && f !== 'README.md')
    .some((f) => {
      const front = /^---\n([\s\S]*?)\n---/.exec(readFileSync(join(dir, f), 'utf8'))?.[1] ?? '';
      return /['"]?@terracelab\/trellis-[a-z-]+['"]?\s*:\s*major/.test(front);
    });
}

describe('names-lock', () => {
  it('lock-names.mjs와 테스트가 같은 이름 목록을 본다', () => {
    expect(tokenNames()).toEqual(allTokenNames());
  });

  it('NAMES.lock은 정렬되어 있고 중복이 없다', () => {
    const names = locked();
    expect(names).toEqual([...new Set(names)].sort());
  });

  describe.skipIf(!G1_FROZEN)('G1 동결 후', () => {
    it('lock에 있던 이름이 사라졌으면 major changeset이 있다', () => {
      const current = new Set(tokenNames());
      const removed = locked().filter((n) => !current.has(n));
      if (removed.length > 0)
        expect(hasMajorChangeset(), `사라진 이름: ${removed.join(', ')}`).toBe(true);
    });

    it('새 이름이 생겼으면 NAMES.lock을 다시 만든다', () => {
      const lock = new Set(locked());
      expect(tokenNames().filter((n) => !lock.has(n))).toEqual([]);
    });
  });
});
