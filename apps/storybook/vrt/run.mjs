// VRT 실행기. 스냅샷은 고정 이미지(IMAGE) 안에서만 만들고 비교한다 — 기기 · OS가 달라도 같은 그림.
//   node vrt/run.mjs                비교(storybook-static이 있어야 한다: pnpm storybook:build)
//   node vrt/run.mjs --update       다르거나 없는 스냅샷을 다시 쓰고, 대상이 아닌 스냅샷은 지운다
//   node vrt/run.mjs -- --grep " Button "   뒤의 인자는 playwright test에 그대로
// 호스트에서는 docker run으로 같은 명령을 컨테이너 안에서 다시 부른다. VRT_IN_DOCKER=1이면(컨테이너 안,
// 또는 CI 잡 자체가 이 이미지에서 돌 때) playwright를 바로 실행한다.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative } from 'node:path';
import { APP, SNAPSHOT_DIR, STATIC_DIR, expectedSnapshots } from './targets.mjs';

/** 이미지 태그는 @playwright/test 버전과 같아야 한다(브라우저 빌드가 버전에 묶여 있다) */
export const PLAYWRIGHT_VERSION = '1.64.1';
export const IMAGE = `mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble`;
/** CI(ubuntu-latest)와 같은 아키텍처. Apple Silicon에서는 에뮬레이션으로 돈다(느리지만 같은 그림) */
export const PLATFORM = 'linux/amd64';

const require = createRequire(import.meta.url);
const ROOT = join(APP, '../..');
const args = process.argv.slice(2);
const update = args.includes('--update');
// `--` 뒤(pnpm run), 없으면 --update 외 전부(turbo run vrt -- …는 `--`를 떼고 넘긴다)
const sep = args.indexOf('--');
const passthrough = sep >= 0 ? args.slice(sep + 1) : args.filter((a) => a !== '--update');

function fail(message) {
  console.error(message);
  process.exit(1);
}

const installed = JSON.parse(
  readFileSync(require.resolve('@playwright/test/package.json'), 'utf8'),
).version;
if (installed !== PLAYWRIGHT_VERSION)
  fail(`@playwright/test ${installed} ≠ 이미지 ${PLAYWRIGHT_VERSION}. 둘을 같이 올린다.`);
if (!existsSync(join(STATIC_DIR, 'index.json')))
  fail('storybook-static 없음. 먼저 pnpm storybook:build (루트 pnpm vrt는 알아서 만든다)');

function pngs(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? pngs(p) : f.endsWith('.png') ? [p] : [];
  });
}

/** 스토리가 바뀌거나 사라져 대상이 아닌 스냅샷(전체를 돌린 갱신에서만) */
function pruneStale() {
  const want = new Set(expectedSnapshots());
  const stale = pngs(SNAPSHOT_DIR).filter(
    (p) => !want.has(relative(SNAPSHOT_DIR, p).split('\\').join('/')),
  );
  for (const p of stale) rmSync(p);
  for (const d of existsSync(SNAPSHOT_DIR) ? readdirSync(SNAPSHOT_DIR) : []) {
    const p = join(SNAPSHOT_DIR, d);
    if (statSync(p).isDirectory() && readdirSync(p).length === 0) rmSync(p, { recursive: true });
  }
  if (stale.length) console.log(`오래된 스냅샷 ${stale.length}개 삭제`);
}

if (process.env['VRT_IN_DOCKER'] === '1') {
  const cli = require.resolve('@playwright/test/cli');
  const res = spawnSync(
    process.execPath,
    [
      cli,
      'test',
      '-c',
      'vrt/playwright.config.ts',
      `--update-snapshots=${update ? 'changed' : 'none'}`,
      ...passthrough,
    ],
    { cwd: APP, stdio: 'inherit', env: { ...process.env, VRT_UPDATE: update ? '1' : '0' } },
  );
  if (update && res.status === 0 && passthrough.length === 0) pruneStale();
  const total = pngs(SNAPSHOT_DIR).length;
  console.log(`스냅샷 ${total}개 (${relative(ROOT, SNAPSHOT_DIR)})`);
  process.exit(res.status ?? 1);
}

const docker = spawnSync('docker', ['version', '--format', '{{.Server.Version}}'], {
  encoding: 'utf8',
});
if (docker.status !== 0)
  fail('Docker가 필요하다(스냅샷은 고정 이미지 안에서만 만든다). Docker를 켜고 다시 실행한다.');

const linuxUser =
  process.platform === 'linux' && process.getuid
    ? ['--user', `${process.getuid()}:${process.getgid?.() ?? 0}`, '-e', 'HOME=/tmp']
    : [];
const res = spawnSync(
  'docker',
  [
    'run',
    '--rm',
    '--init',
    '--ipc=host',
    '--platform',
    PLATFORM,
    ...linuxUser,
    '-v',
    `${ROOT}:/work`,
    '-w',
    `/work/${relative(ROOT, APP).split('\\').join('/')}`,
    '-e',
    'VRT_IN_DOCKER=1',
    '-e',
    'CI',
    '-e',
    'VRT_WORKERS',
    IMAGE,
    'node',
    'vrt/run.mjs',
    ...args,
  ],
  { stdio: 'inherit' },
);
process.exit(res.status ?? 1);
