// molecule.json = modules.json(묶음 7 · 모듈 35). 격자에 맞지 않는 간선은 던진다.
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import modules from '@terracelab/trellis-tokens/modules' with { type: 'json' };
import { MOLECULE_LAYOUT, layoutMolecule } from '../src/molecule.ts';
import { writeMoleculeJson } from './export-showcase.mjs';

test('묶음 · 모듈 수가 modules.json과 같다', () => {
  const file = join(mkdtempSync(join(tmpdir(), 'molecule-')), 'molecule.json');
  writeMoleculeJson(file);
  const json = JSON.parse(readFileSync(file, 'utf8'));
  const groupIds = Object.keys(modules.groups);
  assert.equal(json.groups.length, groupIds.length);
  assert.equal(json.groups.length, 7);
  assert.equal(json.counts.modules, modules.modules.length);
  assert.equal(json.counts.modules, 35);
  assert.deepEqual(
    json.groups.map((g) => g.id),
    groupIds,
  );
  for (const g of json.groups) {
    const expected = modules.modules.filter((m) => m.group === g.id).map((m) => m.id);
    assert.deepEqual(
      g.modules.map((m) => m.id),
      expected,
      `${g.id} 모듈`,
    );
    assert.equal(g.color.figma, `color/module/${g.id}/default`);
    assert.equal(g.ring.vertices.length, 6);
  }
});

test('격자에 맞지 않는 간선은 던진다', () => {
  // N 꼭짓점은 위형(U · DR · DL)이라 UR 간선이 없다
  const broken = MOLECULE_LAYOUT.map((r) =>
    r.group === 'erp' ? { ...r, branches: ['N UR', ...r.branches.slice(1)] } : r,
  );
  assert.throws(() => layoutMolecule(modules, broken), /격자에 없다/);
});

test('가지 수가 모듈 수와 다르면 던진다', () => {
  const broken = MOLECULE_LAYOUT.map((r) =>
    r.group === 'crm' ? { ...r, branches: r.branches.slice(1) } : r,
  );
  assert.throws(() => layoutMolecule(modules, broken), /가지 3개/);
});

test('다른 묶음과 꼭짓점이 겹치면 던진다', () => {
  // 유통·물류 가지를 제조 줄기(4,7)로 돌린다
  const broken = MOLECULE_LAYOUT.map((r) =>
    r.group === 'scm' ? { ...r, branches: ['S D DR UR', ...r.branches.slice(1)] } : r,
  );
  assert.throws(() => layoutMolecule(modules, broken), /같이 쓴다|고리 중심|라벨/);
});
