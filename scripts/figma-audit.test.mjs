// node --test scripts/
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { check, compare, flatten, missingKeys } from './figma-audit.mjs';

const SCRIPT = fileURLToPath(new URL('./figma-audit.mjs', import.meta.url));

test('flatten: 점 경로와 배열 길이', () => {
  assert.deepEqual(flatten({ a: { b: 1 }, list: ['x'], n: null }), {
    'a.b': 1,
    'list.length': 1,
    'list.0': 'x',
    n: null,
  });
});

test('compare: 같음 · 범위 · 없음', () => {
  assert.equal(compare(0, 0), null);
  assert.equal(compare('Button', 'Button'), null);
  assert.match(compare(0, 3), /≠/);
  assert.equal(compare({ min: 25 }, 30), null);
  assert.match(compare({ min: 25 }, 3), /최소/);
  assert.match(compare({ max: 0 }, 2), /최대/);
  assert.match(compare(1, undefined), /측정값 없음/);
  assert.match(compare({ min: 1 }, 'x'), /수가 아니다/);
});

test('check: expect 항목마다 measured를 비교한다', () => {
  const ok = check({
    task: 'PG-02',
    expect: { localCollections: 0, 'bad.length': 0, bindings: { min: 1 } },
    measured: { localCollections: 0, bad: [], bindings: 120 },
  });
  assert.equal(ok.failed, 0);
  const bad = check({
    task: 'PG-02',
    expect: { localCollections: 0, rawSolid: 0 },
    measured: { localCollections: 6, rawSolid: 0 },
  });
  assert.equal(bad.failed, 1);
  assert.equal(bad.rows[0].key, 'localCollections');
  assert.throws(() => check({ expect: {}, measured: {} }), /비어/);
  assert.throws(() => check({ measured: {} }), /expect/);
});

test('missingKeys: variables.json에 있고 key 목록에 없는 변수', () => {
  const variables = {
    collections: [
      { name: 'Semantic', variables: [{ name: 'color/bg/canvas' }, { name: 'color/fg/primary' }] },
    ],
  };
  assert.deepEqual(missingKeys({ variables: { 'Semantic/color/bg/canvas': 'k1' } }, variables), [
    'Semantic/color/fg/primary',
  ]);
  assert.deepEqual(
    missingKeys(
      { variables: { 'Semantic/color/bg/canvas': 'k1', 'Semantic/color/fg/primary': 'k2' } },
      variables,
    ),
    [],
  );
});

test('CLI: --emit는 읽기 전용 스크립트를 내고 --check는 종료 코드로 알린다', () => {
  for (const kind of ['keys', 'links', 'sets', 'screens']) {
    const out = execFileSync('node', [SCRIPT, '--emit', kind], { encoding: 'utf8' });
    assert.match(out, /읽기 전용/);
    assert.match(out, /return out;/);
    // 쓰는 API가 없어야 한다
    assert.doesNotMatch(out, /\.remove\(|createFrame|createComponent|setBoundVariable|appendChild/);
  }
  assert.equal(spawnSync('node', [SCRIPT, '--emit', 'nope']).status, 2);
  const dir = mkdtempSync(join(tmpdir(), 'figma-audit-'));
  const pass = join(dir, 'pass.json');
  const fail = join(dir, 'fail.json');
  writeFileSync(pass, JSON.stringify({ task: 'T', expect: { n: 1 }, measured: { n: 1 } }));
  writeFileSync(fail, JSON.stringify({ task: 'T', expect: { n: 1 }, measured: { n: 2 } }));
  assert.equal(spawnSync('node', [SCRIPT, '--check', pass]).status, 0);
  assert.equal(spawnSync('node', [SCRIPT, '--check', pass, fail]).status, 1);
  assert.equal(spawnSync('node', [SCRIPT, '--check']).status, 2);
});
