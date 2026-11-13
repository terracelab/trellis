#!/usr/bin/env node
// 공개 저장소용 기록을 만든다(D-66 · D-153). 비공개 저장소의 기록은 건드리지 않는다.
//   node scripts/make-public-snapshot.mjs [대상 폴더] [--ref HEAD] [--message "..."] [--onto <공개 저장소 주소>] [--fresh]
// 하는 일:
//   1. git archive로 추적 파일만 꺼낸다(.forbidden-words 같은 gitignore 파일은 따라가지 않는다)
//   2. 모든 파일에서 금칙어(.forbidden-words 또는 TRELLIS_FORBIDDEN_WORDS, 줄마다 하나)를 찾는다. 하나라도 있으면 멈춘다
//   3. .publicignore(줄마다 경로 앞부분, # 주석)에 적은 경로는 빼고 커밋한다
//   4. 커밋 하나를 만든다. 푸시는 하지 않는다(사람이 확인한 뒤 한다)
//      --onto가 없으면 대상 폴더에 git init + 첫 커밋(원격 없음). 빌드 · 테스트를 돌려 보는 용도다
//      --onto <주소>면 공개 저장소를 받아 그 위에 커밋 하나를 얹는다. 공개 저장소의 파일은 이 기록의 파일로 통째로 바뀐다.
//      LICENSE는 비공개 쪽에 없으면 공개 저장소 것을 그대로 두고, 어느 쪽에도 없으면 멈춘다
//      --fresh(--onto와 함께)면 공개 저장소의 기록을 잇지 않는다. LICENSE만 받아 두고 부모 없는 커밋 하나를 새로 만든다.
//      올릴 때는 강제 푸시가 필요하고 공개 저장소의 옛 커밋은 전부 사라진다(pnpm public:push --fresh)
// 작성자 · 커밋한 사람은 이 PC의 git 설정이 아니라 공개용 계정으로 적는다(scripts/public-author.mjs).
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertIdentity, identityEnv, publicAuthor } from './public-author.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const opt = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
/** 값을 받지 않는 옵션. 뒤에 오는 글자를 값으로 읽지 않는다 */
const FLAGS = new Set(['--fresh']);
const positional = args.filter(
  (a, i) => !a.startsWith('--') && (!args[i - 1]?.startsWith('--') || FLAGS.has(args[i - 1])),
);
const target = resolve(positional[0] ?? join(ROOT, '..', 'trellis-public'));
const ref = opt('--ref', 'HEAD');
const message = opt('--message', 'Initial public release');
const onto = opt('--onto', null);
const fresh = args.includes('--fresh');
const author = publicAuthor();
if (fresh && !onto) {
  console.error('--fresh는 --onto <공개 저장소 주소>와 함께 쓴다(LICENSE를 거기서 받는다)');
  process.exit(1);
}

function forbiddenWords() {
  const raw =
    process.env.TRELLIS_FORBIDDEN_WORDS ??
    (existsSync(join(ROOT, '.forbidden-words'))
      ? readFileSync(join(ROOT, '.forbidden-words'), 'utf8')
      : '');
  const words = raw
    .split(/\r?\n|,/)
    .map((w) => w.trim())
    .filter((w) => w && !w.startsWith('#'));
  if (words.length === 0) {
    console.error(
      '금칙어 목록이 없다(.forbidden-words 또는 TRELLIS_FORBIDDEN_WORDS). 검사 없이 공개할 수 없다',
    );
    process.exit(1);
  }
  return words;
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === '.git') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const BINARY = /\.(png|jpe?g|gif|webp|woff2?|ttf|otf|ico|pdf|zip)$/i;

const words = forbiddenWords();
if (existsSync(target)) {
  if (existsSync(join(target, '.git')) || readdirSync(target).length > 0) {
    console.error(
      `대상 폴더가 비어 있지 않다: ${target}. 지우고 다시 실행하거나 다른 폴더를 주세요`,
    );
    process.exit(1);
  }
} else mkdirSync(target, { recursive: true });

const git = (...a) =>
  execFileSync('git', ['-C', target, ...a], {
    stdio: 'pipe',
    encoding: 'utf8',
    env: identityEnv(author),
  }).trim();
/** 만들던 폴더를 지우고 멈춘다 */
const stop = (...lines) => {
  rmSync(target, { recursive: true, force: true });
  for (const line of lines) console.error(line);
  process.exit(1);
};

// --onto: 공개 저장소의 지금 기록을 받아 그 위에 얹는다
let base = null;
let publicLicense = null;
if (onto) {
  try {
    execFileSync('git', ['clone', '-q', '--depth', '1', onto, target], { stdio: 'pipe' });
  } catch (e) {
    stop(`공개 저장소를 받지 못했다(${onto}): ${String(e.stderr ?? e.message).trim()}`);
  }
  try {
    base = git('rev-parse', '--short', 'HEAD');
  } catch {
    base = null; // 커밋이 아직 없는 빈 저장소
  }
  if (existsSync(join(target, 'LICENSE'))) publicLicense = readFileSync(join(target, 'LICENSE'));
  for (const name of readdirSync(target))
    if (name !== '.git') rmSync(join(target, name), { recursive: true, force: true });
  if (fresh) {
    // 받은 기록을 버리고 같은 브랜치 이름으로 새로 시작한다. 올릴 곳(origin)은 그대로 둔다
    const branch = base ? git('rev-parse', '--abbrev-ref', 'HEAD') : 'main';
    rmSync(join(target, '.git'), { recursive: true, force: true });
    git('init', '-q', '-b', branch);
    git('remote', 'add', 'origin', onto);
  }
}

const commit = execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', ref], {
  encoding: 'utf8',
}).trim();
const tar = execFileSync('git', ['-C', ROOT, 'archive', '--format=tar', ref], {
  maxBuffer: 1 << 30,
});
execFileSync('tar', ['-x', '-C', target], { input: tar });

// .publicignore: 공개하지 않을 경로(내부 기획 메모 등). 무엇을 넣을지는 PF-02에서 사람이 정한다
const ignored = existsSync(join(ROOT, '.publicignore'))
  ? readFileSync(join(ROOT, '.publicignore'), 'utf8')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'))
  : [];
for (const prefix of ignored) rmSync(join(target, prefix), { recursive: true, force: true });

// LICENSE: 비공개 쪽 것이 있으면 그것, 없으면 공개 저장소에 있던 것
const license = join(target, 'LICENSE');
const licenseFrom = existsSync(license)
  ? '비공개 저장소 것'
  : publicLicense
    ? '공개 저장소 것 유지'
    : null;
if (!existsSync(license) && publicLicense) writeFileSync(license, publicLicense);
if (onto && !licenseFrom)
  stop(
    'LICENSE가 없다. 라이선스 없는 기록은 공개 저장소에 얹지 않는다. 비공개 저장소에 LICENSE를 먼저 넣는다(PF-03)',
  );

const files = walk(target);
const hits = [];
for (const f of files) {
  const rel = relative(target, f);
  for (const w of words)
    if (rel.toLowerCase().includes(w.toLowerCase())) hits.push(`${rel}: 경로에 금칙어`);
  if (BINARY.test(f)) continue;
  const text = readFileSync(f, 'utf8').toLowerCase();
  for (const w of words) {
    const at = text.indexOf(w.toLowerCase());
    if (at >= 0) hits.push(`${rel}: ${text.slice(0, at).split('\n').length}행`);
  }
}
if (hits.length)
  stop(
    `금칙어 ${hits.length}곳 — 공개 기록을 만들지 않았다(단어는 출력하지 않는다):`,
    ...hits.slice(0, 40).map((h) => `  ${h}`),
  );

if (!onto) git('init', '-q', '-b', 'main');
// 이 폴더에서 손으로 커밋해도 개인 주소가 남지 않게 저장소 설정에도 적는다
git('config', 'user.name', author.name);
git('config', 'user.email', author.email);
git('add', '-A');
if (base && !fresh && git('status', '--porcelain') === '') {
  console.log(`공개 저장소(${base})와 같다. 커밋을 만들지 않았다: ${target}`);
  process.exit(0);
}
git(
  '-c',
  'commit.gpgsign=false',
  'commit',
  '-q',
  '-m',
  `${message}\n\nSnapshot of the private repository at ${commit}.`,
);
try {
  assertIdentity(git, author);
} catch (e) {
  stop(e.message);
}

console.log(`공개 기록: ${target}`);
console.log(
  `  원본 ${commit} · 파일 ${files.length}개 · 뺀 경로 ${ignored.length}개 · 금칙어 0 · 커밋 1개(${
    fresh
      ? `새 기록. 공개 저장소 ${base ?? '(빈 저장소)'}의 기록을 잇지 않는다`
      : base
        ? `공개 저장소 ${base} 위`
        : '원격 없음'
  })`,
);
console.log(`  작성자 ${author.label} · LICENSE ${licenseFrom ?? '없음'}`);
console.log(
  fresh
    ? `  다음: 이 폴더에서 pnpm install && pnpm build && pnpm test. 올리면 공개 저장소의 옛 커밋이 사라진다(강제 푸시). pnpm public:push --fresh가 확인하고 올린다`
    : onto
      ? `  다음: 이 폴더에서 pnpm install && pnpm build && pnpm test. 푸시는 사람이 확인한 뒤 git -C ${target} push origin HEAD`
      : '  다음: 이 폴더에서 pnpm install && pnpm build && pnpm test. 공개 저장소에 얹으려면 --onto <주소>로 다시 만든다',
);
