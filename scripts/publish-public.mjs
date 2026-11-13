#!/usr/bin/env node
// 공개 저장소에 올린다(D-66 · D-153). 명령 하나로 기록 만들기 → 확인 → 푸시 → 정리까지 한다.
//   pnpm public:push [--dry-run] [--skip-checks] [--fresh] [--message "..."]
//   --dry-run      푸시하지 않고 만든 폴더를 남긴다
//   --skip-checks  만든 기록에서 install · build · test를 돌리지 않는다
//   --fresh        공개 저장소의 기록을 잇지 않고 커밋 하나로 다시 시작한다. 옛 커밋은 전부 사라진다(강제 푸시).
//                  받아 둔 옛 머리에서 바뀌지 않았을 때만 덮어쓴다(--force-with-lease)
// 올리는 것은 비공개 저장소에서 커밋한 것(HEAD)뿐이다. 기록은 make-public-snapshot.mjs가 만든다
// (금칙어 검사 · .publicignore 제외 · LICENSE 확인 · 작성자는 공개용 계정).
// 주소는 TRELLIS_PUBLIC_REPO로 바꾼다. 기본값의 github-terrace는 ~/.ssh/config의 별칭이다.
import { execFileSync, spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertIdentity, publicAuthor } from './public-author.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const REPO = process.env.TRELLIS_PUBLIC_REPO ?? 'git@github-terrace:terracelab/trellis.git';
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const skipChecks = args.includes('--skip-checks');
const fresh = args.includes('--fresh');
const at = args.indexOf('--message');
// 날짜는 이 PC의 시간대로 적는다(sv-SE 형식이 YYYY-MM-DD다)
const message = at >= 0 ? args[at + 1] : `Release ${new Date().toLocaleDateString('sv-SE')}`;
const stage = join(tmpdir(), 'trellis');

const out = (cwd, ...argv) =>
  execFileSync('git', ['-C', cwd, ...argv], { encoding: 'utf8', stdio: 'pipe' }).trim();
/** 출력을 그대로 보이며 돌린다. 실패하면 만든 폴더를 남기고 멈춘다 */
function run(label, cmd, argv, cwd) {
  console.log(`\n▸ ${label}`);
  const r = spawnSync(cmd, argv, { cwd, stdio: 'inherit' });
  if (r.status !== 0) {
    console.error(`\n중단: ${label} 실패. 올리지 않았다. 만든 폴더: ${stage}`);
    process.exit(1);
  }
}

const dirty = out(ROOT, 'status', '--porcelain');
if (dirty)
  console.warn(
    `주의: 커밋하지 않은 변경 ${dirty.split('\n').length}개는 올라가지 않는다(HEAD만 나간다)`,
  );

rmSync(stage, { recursive: true, force: true });
run(
  '공개 기록 만들기',
  'node',
  [
    join(ROOT, 'scripts/make-public-snapshot.mjs'),
    stage,
    '--onto',
    REPO,
    '--message',
    message,
    ...(fresh ? ['--fresh'] : []),
  ],
  ROOT,
);

// 공개 저장소와 같으면 기록 스크립트가 커밋을 만들지 않는다(--fresh는 늘 새 커밋을 만든다)
if (!fresh && out(stage, 'status', '-sb').split('\n')[0].includes('ahead') === false) {
  console.log('\n올릴 것이 없다');
  rmSync(stage, { recursive: true, force: true });
  process.exit(0);
}

if (!skipChecks) {
  run('install', 'pnpm', ['install', '--frozen-lockfile'], stage);
  run('build', 'pnpm', ['build'], stage);
  run('test', 'pnpm', ['test'], stage);
  // 확인하다 생긴 파일이 커밋에 섞이지 않았는지 본다(추적 파일이 바뀌면 멈춘다)
  if (out(stage, 'status', '--porcelain', '--untracked-files=no')) {
    console.error(`\n중단: 확인 중에 추적 파일이 바뀌었다. 올리지 않았다. 만든 폴더: ${stage}`);
    process.exit(1);
  }
}

try {
  assertIdentity((...argv) => out(stage, ...argv), publicAuthor());
} catch (e) {
  console.error(`\n중단: ${e.message}`);
  process.exit(1);
}
const head = out(stage, 'log', '-1', '--format=%h %an <%ae> "%s"');
const branch = out(stage, 'rev-parse', '--abbrev-ref', 'HEAD');
// --fresh의 커밋은 부모가 없다. 파일 수로 적는다
const stat = fresh
  ? `파일 ${out(stage, 'ls-files').split('\n').length}개 · 커밋 ${out(stage, 'rev-list', '--count', 'HEAD')}개`
  : out(stage, 'diff', '--shortstat', 'HEAD~1', 'HEAD');
// 덮어쓸 공개 저장소의 지금 머리. 기록을 만든 뒤 누가 올렸으면 강제 푸시가 거절된다
const remoteHead = fresh
  ? out(stage, 'ls-remote', 'origin', `refs/heads/${branch}`).split(/\s/)[0]
  : '';

if (dryRun) {
  console.log(
    `\n--dry-run: 푸시하지 않았다\n  ${head}\n  ${stat}${
      fresh
        ? `\n  올리면 사라지는 기록: ${REPO} ${branch} ${remoteHead.slice(0, 7) || '(없음)'}까지`
        : ''
    }\n  폴더: ${stage}`,
  );
  process.exit(0);
}
run(
  fresh ? '푸시(기록을 새 커밋 하나로 바꾼다)' : '푸시',
  'git',
  fresh
    ? [
        '-C',
        stage,
        'push',
        ...(remoteHead ? [`--force-with-lease=refs/heads/${branch}:${remoteHead}`] : []),
        'origin',
        `HEAD:refs/heads/${branch}`,
      ]
    : ['-C', stage, 'push', 'origin', 'HEAD'],
  ROOT,
);
rmSync(stage, { recursive: true, force: true });
console.log(
  `\n올렸다: ${REPO}\n  ${head}\n  ${stat}${
    fresh && remoteHead ? `\n  바꾼 옛 머리: ${remoteHead.slice(0, 7)}` : ''
  }`,
);
