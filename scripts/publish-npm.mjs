#!/usr/bin/env node
// npm에 올린다(PF-04 · D-155). private이 아닌 packages/*를 의존 순서대로 올린다.
//   pnpm release:npm [--dry-run] [--skip-build] [--no-git-checks] [--otp 123456]
//   --dry-run        올리지 않고 묶음만 만들어 본다
//   --skip-build     빌드를 다시 하지 않는다(방금 pnpm build를 돌렸을 때)
//   --no-git-checks  커밋하지 않은 변경 · 브랜치 확인을 건너뛴다
//   그 밖의 옵션(--otp 등)은 npm publish에 그대로 넘긴다
// 묶기는 pnpm pack이 한다(workspace:*를 실제 버전으로 바꿔 싣는다). 올리기는 npm publish <tgz>가 한다.
// npm CLI가 2단계 인증 확인(브라우저 창 또는 OTP 입력)을 직접 받기 때문이다.
// 이미 그 버전이 npm에 있는 패키지는 건너뛴다. 중간에 멈춘 뒤 다시 돌려도 된다.
// npm 계정에 2단계 인증이 켜져 있어야 한다(없으면 npm이 403으로 거절한다). 한 번 올린 버전은 덮어쓸 수 없다.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OWN = new Set(['--skip-build', '--no-git-checks']);
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const passthrough = args.filter((a) => !OWN.has(a));

/** 올릴 패키지: private이 아닌 packages/* */
const all = readdirSync(join(ROOT, 'packages'))
  .map((dir) => ({ dir, file: join(ROOT, 'packages', dir, 'package.json') }))
  .filter((p) => existsSync(p.file))
  .map((p) => ({ ...p, json: JSON.parse(readFileSync(p.file, 'utf8')) }))
  .filter((p) => !p.json.private);
const names = new Set(all.map((p) => p.json.name));

/** 의존하는 패키지가 먼저 오게 줄 세운다 */
const ordered = [];
const visit = (p) => {
  if (ordered.includes(p)) return;
  for (const dep of Object.keys(p.json.dependencies ?? {}))
    if (names.has(dep)) visit(all.find((x) => x.json.name === dep));
  ordered.push(p);
};
all.forEach(visit);

const out = (cmd, argv, cwd = ROOT) =>
  execFileSync(cmd, argv, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

/** 그 버전이 이미 npm에 있는가 */
function published({ name, version }) {
  try {
    return out('npm', ['view', `${name}@${version}`, 'version']) === version;
  } catch {
    return false;
  }
}

const stage = mkdtempSync(join(tmpdir(), 'trellis-npm-'));
function stop(message) {
  rmSync(stage, { recursive: true, force: true });
  console.error(`\n중단: ${message}`);
  process.exit(1);
}
function run(label, cmd, argv, cwd) {
  console.log(`\n▸ ${label}`);
  const r = spawnSync(cmd, argv, { cwd, stdio: 'inherit' });
  if (r.status !== 0)
    stop(`${label} 실패. 이미 올라간 패키지는 그대로이고, 다시 돌리면 남은 것부터 올린다`);
}

// 올리는 내용 = 커밋한 내용이어야 공개 저장소의 같은 버전과 맞는다
if (!dryRun && !args.includes('--no-git-checks')) {
  if (out('git', ['status', '--porcelain']))
    stop('커밋하지 않은 변경이 있다. 커밋한 뒤 다시 돌린다(건너뛰려면 --no-git-checks)');
  const branch = out('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  if (branch !== 'main') stop(`main 브랜치가 아니다(${branch})`);
}

console.log(`올릴 패키지: ${ordered.map((p) => `${p.json.name}@${p.json.version}`).join(' · ')}`);
if (!args.includes('--skip-build'))
  run(
    '빌드',
    'pnpm',
    ['turbo', 'run', 'build', ...ordered.map((p) => `--filter=${p.json.name}`)],
    ROOT,
  );

let done = 0;
for (const p of ordered) {
  const id = `${p.json.name}@${p.json.version}`;
  if (!dryRun && published(p.json)) {
    console.log(`\n· ${id}은 이미 npm에 있다. 건너뛴다`);
    continue;
  }
  const before = new Set(readdirSync(stage));
  run(`${id} 묶기`, 'pnpm', ['pack', '--pack-destination', stage], join(ROOT, 'packages', p.dir));
  const tgz = readdirSync(stage).find((f) => f.endsWith('.tgz') && !before.has(f));
  if (!tgz) stop(`${id}: 묶음 파일을 찾지 못했다`);
  // 묶음 안 package.json에 workspace: 가 남아 있으면 설치가 깨진다
  const manifest = execFileSync('tar', ['-xzOf', join(stage, tgz), 'package/package.json'], {
    encoding: 'utf8',
  });
  if (manifest.includes('workspace:')) stop(`${id}: 묶음에 workspace: 의존이 남아 있다`);
  // 저장소의 .npmrc(pnpm 전용 값)를 읽지 않게 묶음 폴더에서 돌린다
  run(`${id} 올리기`, 'npm', ['publish', tgz, '--access', 'public', ...passthrough], stage);
  done += 1;
}
rmSync(stage, { recursive: true, force: true });
console.log(
  dryRun
    ? `\n--dry-run: 올리지 않았다(${done}개 확인)`
    : `\n올렸다: ${done}개. 확인: npm view ${ordered.at(-1).json.name} version`,
);
