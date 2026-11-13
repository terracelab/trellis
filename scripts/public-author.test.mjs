// node --test scripts/
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, test } from 'node:test';
import { assertIdentity, identityEnv, publicAuthor } from './public-author.mjs';

afterEach(() => {
  delete process.env.TRELLIS_PUBLIC_AUTHOR;
});

test('작성자는 "이름 <주소>" 꼴만 받는다', () => {
  assert.deepEqual(publicAuthor('Some Bot <bot@example.test>'), {
    name: 'Some Bot',
    email: 'bot@example.test',
    label: 'Some Bot <bot@example.test>',
  });
  assert.throws(() => publicAuthor('bot@example.test'));
  assert.throws(() => publicAuthor('Some Bot <not an address>'));
  process.env.TRELLIS_PUBLIC_AUTHOR = 'Other <other@example.test>';
  assert.equal(publicAuthor().email, 'other@example.test');
});

test('커밋의 작성자와 커밋한 사람이 둘 다 공개용 계정이 된다', () => {
  const dir = mkdtempSync(join(tmpdir(), 'trellis-public-author-'));
  try {
    const author = publicAuthor('Some Bot <bot@example.test>');
    const run = (env, ...args) =>
      execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: 'pipe', env });
    // 이 저장소의 설정에는 다른 사람을 적어 둔다(PC의 git 설정 노릇)
    const local = { ...process.env };
    for (const k of Object.keys(local)) if (/^GIT_(AUTHOR|COMMITTER)_/.test(k)) delete local[k];
    run(local, 'init', '-q', '-b', 'main');
    run(local, 'config', 'user.name', 'Local Person');
    run(local, 'config', 'user.email', 'person@example.test');
    writeFileSync(join(dir, 'a.txt'), 'a\n');
    run(local, 'add', '-A');

    const env = identityEnv(author);
    run(env, '-c', 'commit.gpgsign=false', 'commit', '-q', '-m', 'one');
    assert.equal(
      run(env, 'log', '-1', '--format=%an <%ae>|%cn <%ce>').trim(),
      'Some Bot <bot@example.test>|Some Bot <bot@example.test>',
    );
    assert.doesNotThrow(() => assertIdentity((...a) => run(env, ...a), author));

    // 환경 변수 없이 커밋하면 저장소 설정의 사람이 남고, 검사가 그것을 잡는다
    writeFileSync(join(dir, 'b.txt'), 'b\n');
    run(local, 'add', '-A');
    run(local, '-c', 'commit.gpgsign=false', 'commit', '-q', '-m', 'two');
    assert.throws(() => assertIdentity((...a) => run(local, ...a), author), /공개용 계정/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
