#!/usr/bin/env node
// Trellis를 git 하위 모듈로 쓰는 서비스 저장소를 만든다(D-58).
//   node scripts/create-service.mjs <폴더> [--title "서비스 이름"] [--name 패키지이름]
//                                    [--submodule <git 주소 또는 경로>] [--no-install]
// starters/service/root → 서비스 루트, starters/service/app → apps/web
import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const TRELLIS = fileURLToPath(new URL('..', import.meta.url));
const STARTER = join(TRELLIS, 'starters', 'service');
const args = process.argv.slice(2);
const opt = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const valued = new Set(['--title', '--name', '--submodule']);
const target = args.find((a, i) => !a.startsWith('--') && !valued.has(args[i - 1]));
if (!target) {
  console.error(
    '사용법: node scripts/create-service.mjs <폴더> [--title "서비스 이름"] [--name 패키지이름] [--submodule <주소>] [--no-install]',
  );
  process.exit(1);
}
const dir = resolve(target);
if (existsSync(dir) && readdirSync(dir).length) {
  console.error(`비어 있지 않은 폴더: ${dir}`);
  process.exit(1);
}
const name = opt(
  '--name',
  basename(dir)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-'),
);
const title = opt('--title', basename(dir));
const run = (cmd, argv, extra = {}) =>
  execFileSync(cmd, argv, { cwd: dir, stdio: 'inherit', ...extra });
const git = (...argv) => run('git', argv);

let submodule = opt('--submodule', null);
if (!submodule) {
  try {
    submodule = execFileSync('git', ['-C', TRELLIS, 'remote', 'get-url', 'origin'], {
      encoding: 'utf8',
    }).trim();
  } catch {
    submodule = TRELLIS;
  }
}

// 1. 파일
mkdirSync(dir, { recursive: true });
cpSync(join(STARTER, 'root'), dir, { recursive: true });
for (const dot of ['gitignore', 'npmrc', 'node-version'])
  renameSync(join(dir, dot), join(dir, `.${dot}`));
// 템플릿 안에서는 다른 이름이다: Trellis 저장소의 eslint가 이 설정을 자기 설정으로 집지 않게
renameSync(join(dir, 'eslint-config.js'), join(dir, 'eslint.config.js'));
const appDir = join(dir, 'apps', 'web');
cpSync(join(STARTER, 'app'), appDir, {
  recursive: true,
  filter: (src) => !/[\\/](node_modules|dist|\.turbo)([\\/]|$)/.test(src),
});
const fill = (file, pairs) => {
  let s = readFileSync(file, 'utf8');
  for (const [from, to] of pairs) s = s.split(from).join(to);
  writeFileSync(file, s);
};
for (const f of ['package.json', 'README.md', 'CLAUDE.md'])
  fill(join(dir, f), [
    ['__NAME__', name],
    ['__TITLE__', title],
  ]);
const appPkg = JSON.parse(readFileSync(join(appDir, 'package.json'), 'utf8'));
appPkg.name = `${name}-web`;
appPkg.description = `${title} 웹 앱`;
writeFileSync(join(appDir, 'package.json'), `${JSON.stringify(appPkg, null, 2)}\n`);
fill(join(appDir, 'src', 'service.ts'), [
  ["title: '새 서비스'", `title: ${JSON.stringify(title).replace(/"/g, "'")}`],
]);
fill(join(appDir, 'index.html'), [['<title>새 서비스</title>', `<title>${title}</title>`]]);

// 2. git + 하위 모듈
git('init', '-q', '-b', 'main');
const local = existsSync(submodule);
run('git', [
  ...(local ? ['-c', 'protocol.file.allow=always'] : []),
  'submodule',
  'add',
  '-q',
  submodule,
  'trellis',
]);

// 3. 설치 · Trellis 빌드 · 스킬 · 점검
if (!args.includes('--no-install')) {
  run('pnpm', ['install']);
  run('pnpm', ['ds:build']);
  run('node', ['trellis/packages/skill/bin/trellis-skill.mjs', 'install']);
  run('pnpm', ['ds:doctor']);
}

git('add', '-A');
git('commit', '-q', '-m', 'chore: start from the Trellis service starter');
console.log(`\n만듦: ${dir}\n  cd ${target}\n  pnpm dev`);
