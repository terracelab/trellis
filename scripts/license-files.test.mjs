// node --test scripts/
// npm에 올리는 패키지는 저장소의 LICENSE · NOTICE 사본을 자기 폴더에 가진다(npm은 패키지 폴더 밖의 파일을 싣지 않는다).
// 사본이 원본과 달라지지 않았는지, package.json의 license 값이 같은지 본다(PF-03).
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (...p) => readFileSync(join(ROOT, ...p), 'utf8');
const packages = readdirSync(join(ROOT, 'packages'))
  .filter((d) => existsSync(join(ROOT, 'packages', d, 'package.json')))
  .map((d) => ({ dir: d, json: JSON.parse(read('packages', d, 'package.json')) }));
const published = packages.filter((p) => !p.json.private);

test('npm에 올리는 패키지는 LICENSE · NOTICE 사본과 공개 설정을 가진다', () => {
  assert.ok(published.length > 0);
  for (const { dir, json } of published) {
    assert.equal(read('packages', dir, 'LICENSE'), read('LICENSE'), `${dir}/LICENSE`);
    assert.equal(read('packages', dir, 'NOTICE'), read('NOTICE'), `${dir}/NOTICE`);
    assert.ok(json.files.includes('NOTICE'), `${dir} files에 NOTICE`);
    assert.equal(json.publishConfig?.access, 'public', `${dir} publishConfig.access`);
    assert.equal(json.repository?.directory, `packages/${dir}`, `${dir} repository.directory`);
    assert.ok(existsSync(join(ROOT, 'packages', dir, 'README.md')), `${dir}/README.md`);
  }
});

test('모든 패키지의 license 값이 저장소와 같다', () => {
  const root = JSON.parse(read('package.json')).license;
  assert.equal(root, 'Apache-2.0');
  for (const { dir, json } of packages) assert.equal(json.license, root, dir);
});

test('아이콘 패키지는 Lucide 라이선스 글을 싣는다', () => {
  const icons = packages.find((p) => p.dir === 'icons').json;
  assert.ok(icons.files.includes('LICENSE-LUCIDE.txt'));
  assert.match(read('packages', 'icons', 'LICENSE-LUCIDE.txt'), /ISC License/);
});
