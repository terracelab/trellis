#!/usr/bin/env node
// npm 방식 끝에서 끝까지(PD-02 완료 조건). Trellis 저장소 밖 임시 폴더에 빈 Vite 앱을 만들고,
// 지금 빌드를 pnpm pack으로 묶어 레지스트리에서 받은 것처럼 설치한 뒤 CLI를 돌린다.
//   pnpm --filter @terracelab/trellis-skill test:e2e [--keep] [--bare]
//   --keep  임시 폴더를 지우지 않고 경로를 알려 준다(화면을 띄워 보거나 에이전트 시험에 쓴다)
//   --bare  빈 앱 + 묶음 + 스킬 설치까지만 하고 멈춘다(--keep 포함). 에이전트가 나머지를 하는 시험용
// 먼저 pnpm build가 되어 있어야 한다(tokens · icons · contracts · react의 dist).
// CLI는 묶음을 앱 밖에 풀어 실행한다. npx가 캐시 폴더에서 실행하는 것과 같은 조건이다.
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const args = process.argv.slice(2);
const bare = args.includes('--bare');
const keep = bare || args.includes('--keep');
const PACKAGES = ['tokens', 'icons', 'contracts', 'react', 'skill'];

const stage = mkdtempSync(join(tmpdir(), 'trellis-skill-e2e-'));
const tarballs = join(stage, 'tarballs');
const app = join(stage, 'app');
const cliDir = join(stage, 'cli');
for (const d of [tarballs, app, cliDir, join(app, 'src')]) mkdirSync(d, { recursive: true });

const write = (file, text) => writeFileSync(join(app, file), text);
const read = (file) => readFileSync(join(app, file), 'utf8');
const sh = (cmd, argv, cwd = app) =>
  execFileSync(cmd, argv, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
/** CLI 실행. { code, out } */
function cli(...argv) {
  const r = spawnSync('node', [join(cliDir, 'package', 'bin', 'trellis-skill.mjs'), ...argv], {
    cwd: app,
    encoding: 'utf8',
  });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
}
let step = 0;
const done = (label) => console.log(`✓ ${(step += 1)}. ${label}`);

try {
  // 묶음: workspace:* 를 실제 버전으로 바꿔 싣는다(release:npm과 같은 방법)
  for (const p of PACKAGES) {
    const dist = p === 'skill' ? 'bin' : 'dist';
    assert.ok(
      existsSync(join(ROOT, 'packages', p, dist)),
      `packages/${p}/${dist} 없음. pnpm build 먼저`,
    );
    sh('pnpm', ['pack', '--pack-destination', tarballs], join(ROOT, 'packages', p));
  }
  const tgz = Object.fromEntries(
    PACKAGES.map((p) => [
      p,
      join(
        tarballs,
        readdirSync(tarballs).find((f) => f.includes(`trellis-${p}-`)),
      ),
    ]),
  );
  sh('tar', ['-xzf', tgz.skill, '-C', cliDir]);
  done(`묶음 ${PACKAGES.length}개(${tarballs})`);

  // 레지스트리 대신 방금 묶은 파일을 쓰게 하는 덮어쓰기. 앱이 보는 설치 결과(node_modules 배치)는 레지스트리 설치와 같다.
  // pnpm 9 · 10은 package.json의 pnpm.overrides를, 그 뒤 버전은 pnpm-workspace.yaml의 overrides를 읽어서 둘 다 적는다
  const overrides = Object.fromEntries(
    PACKAGES.map((p) => [`@terracelab/trellis-${p}`, `file:${tgz[p]}`]),
  );

  // 빈 Vite 앱. Trellis는 아직 없다
  write(
    'package.json',
    `${JSON.stringify(
      {
        name: 'trellis-skill-e2e',
        private: true,
        type: 'module',
        scripts: { dev: 'vite', build: 'vite build', typecheck: 'tsc --noEmit' },
        dependencies: { react: '19.3.1', 'react-dom': '19.3.1' },
        devDependencies: {
          '@types/react': '19.3.0',
          '@types/react-dom': '19.3.0',
          typescript: '~6.0.3',
          vite: '8.3.6',
        },
        pnpm: { overrides },
      },
      null,
      2,
    )}\n`,
  );
  write(
    'pnpm-workspace.yaml',
    `packages:\n  - .\noverrides:\n${Object.entries(overrides)
      .map(([name, spec]) => `  '${name}': '${spec}'`)
      .join('\n')}\nallowBuilds:\n  esbuild: false\n`,
  );
  // 덮어쓰기 설정 때문에 이 폴더가 워크스페이스 루트가 된다. 보통 앱처럼 pnpm add가 되게 한다
  write('.npmrc', 'ignore-workspace-root-check=true\n');
  write(
    'tsconfig.json',
    `${JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          lib: ['ES2023', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          moduleResolution: 'bundler',
          jsx: 'react-jsx',
          types: ['vite/client'],
          strict: true,
          noUncheckedIndexedAccess: true,
          verbatimModuleSyntax: true,
          isolatedModules: true,
          skipLibCheck: true,
          noEmit: true,
        },
        include: ['src'],
      },
      null,
      2,
    )}\n`,
  );
  write(
    'index.html',
    '<!doctype html>\n<html lang="ko">\n  <head>\n    <meta charset="utf-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <title>서비스</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>\n',
  );
  write(
    'src/main.tsx',
    "import { StrictMode } from 'react';\nimport { createRoot } from 'react-dom/client';\nimport { App } from './App';\n\ncreateRoot(document.getElementById('root')!).render(\n  <StrictMode>\n    <App />\n  </StrictMode>,\n);\n",
  );
  write('src/App.tsx', 'export function App() {\n  return <main>서비스</main>;\n}\n');
  sh('pnpm', ['install', '--prefer-offline']);
  done(`빈 Vite 앱(${app})`);

  // 설치 전: doctor가 무엇을 설치할지 알려 준다
  let r = cli('doctor');
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /설치되지 않음: @terracelab\/trellis-react · @terracelab\/trellis-tokens/);
  assert.match(
    r.out,
    /pnpm add @terracelab\/trellis-react @terracelab\/trellis-tokens @terracelab\/trellis-contracts/,
  );
  done('설치 전 doctor: 종료 1 + 설치 명령');

  // 스킬 설치(npm 방식 글이 들어온다)
  r = cli('install');
  assert.equal(r.code, 0, r.out);
  for (const f of [
    'SKILL.md',
    'references/dashboard.md',
    'references/setup.md',
    'references/do-dont.md',
  ])
    assert.ok(existsSync(join(app, '.claude/skills/trellis', f)), `스킬 파일 ${f}`);
  assert.ok(
    !existsSync(join(app, '.claude/skills/trellis/references/blocks.md')),
    '블록 문서는 npm 방식에 없다',
  );
  assert.match(read('.claude/skills/trellis/SKILL.md'), /npx @terracelab\/trellis-skill doctor/);
  assert.equal(JSON.parse(read('.trellis/skill.lock')).mode, 'npm');
  done('install: .claude/skills/trellis/ · .trellis/skill.lock');

  if (bare) {
    // 에이전트 시험용: 이 도구를 devDependency로 넣어 npx가 레지스트리 없이 찾게 한다
    sh('pnpm', ['add', '-D', '--prefer-offline', '@terracelab/trellis-skill']);
    console.log(`\n멈춤(--bare). 앱: ${app}`);
    process.exit(0);
  }

  // doctor가 알려 준 명령으로 설치
  sh('pnpm', [
    'add',
    '--prefer-offline',
    '@terracelab/trellis-react',
    '@terracelab/trellis-tokens',
    '@terracelab/trellis-contracts',
  ]);
  r = cli('install');
  const lock = JSON.parse(read('.trellis/skill.lock'));
  const version = JSON.parse(
    readFileSync(join(ROOT, 'packages/react/package.json'), 'utf8'),
  ).version;
  assert.equal(lock.trellis, version, 'lock의 Trellis 버전 = 설치된 react 버전');
  done(`패키지 설치 뒤 다시 install: Trellis ${version}`);

  // CSS import · 글꼴이 없으면 실패하고 넣을 줄을 알려 준다
  r = cli('doctor');
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /CSS import가 없다/);
  assert.match(r.out, /import '@terracelab\/trellis-tokens\/fonts\.css';/);
  assert.match(r.out, /글꼴이 걸려 있지 않다/);
  done('doctor: CSS import · 글꼴 없음을 알린다');

  write(
    'src/main.tsx',
    "import '@terracelab/trellis-tokens/fonts.css';\nimport '@terracelab/trellis-tokens/tokens.css';\nimport '@terracelab/trellis-react/styles.css';\nimport './app.css';\n" +
      read('src/main.tsx'),
  );
  write(
    'src/app.css',
    'html,\nbody,\n#root {\n  height: 100%;\n  margin: 0;\n}\n\nbody {\n  background: var(--tl-color-bg-canvas);\n  color: var(--tl-color-fg-primary);\n  font-family: var(--tl-font-family-sans);\n}\n',
  );

  // 시작 화면 복사 → 화면에 넣기
  r = cli('add', 'dashboard');
  assert.equal(r.code, 0, r.out);
  for (const f of ['Dashboard.tsx', 'data.ts', 'dashboard.css'])
    assert.ok(existsSync(join(app, 'src/dashboard', f)), `시작 화면 ${f}`);
  assert.ok(!existsSync(join(app, 'src/dashboard/template.json')));
  assert.equal(cli('add', 'dashboard').code, 1, '같은 파일이 있으면 덮어쓰지 않는다');
  write(
    'src/App.tsx',
    "import { Dashboard } from './dashboard/Dashboard';\n\nexport function App() {\n  return <Dashboard />;\n}\n",
  );
  r = cli('doctor');
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /토큰 밖 값 0건/);
  done('add dashboard → doctor 종료 0');

  sh('pnpm', ['typecheck']);
  sh('pnpm', ['build']);
  done('앱 tsc --noEmit · vite build');

  // 토큰 밖 값: 종료 1 + 대신 쓸 semantic 토큰 후보
  const css = read('src/dashboard/dashboard.css');
  write(
    'src/dashboard/dashboard.css',
    `${css}\n.dashboard-note {\n  background: #fff;\n  padding: 12px;\n}\n`,
  );
  r = cli('doctor');
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /hex 색 #fff → 후보 --tl-color-bg-surface/);
  assert.match(r.out, /px 값 12px → 후보 --tl-space-12/);
  write('src/dashboard/dashboard.css', css);
  done('#fff · 12px 삽입: 종료 1 + 후보 토큰');

  // Trellis를 쓰지 않는 파일의 값은 경고로만 센다(--strict면 실패)
  write('src/legacy.css', '.legacy {\n  color: #123456;\n}\n');
  r = cli('doctor');
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /Trellis를 쓰지 않는 파일의 토큰 밖 값 1건/);
  assert.equal(cli('doctor', '--strict').code, 1);
  rmSync(join(app, 'src/legacy.css'));
  done('옛 CSS는 경고, --strict는 실패');

  // 문서: 설치된 패키지의 파일과 같다
  const button = readFileSync(
    join(app, 'node_modules/@terracelab/trellis-react/dist/docs/components/Button.md'),
    'utf8',
  );
  assert.equal(cli('docs', 'component', 'Button').out, button);
  assert.equal(cli('docs', 'button').out, button);
  assert.match(cli('docs', 'llms').out, /^# Trellis /);
  assert.match(cli('docs', 'guide', 'dashboards').out, /^# 대시보드 만들기/);
  done('docs component Button = dist/docs/components/Button.md');

  // devDependency로 넣으면 npx가 레지스트리 없이 그 버전을 쓴다
  sh('pnpm', ['add', '-D', '--prefer-offline', '@terracelab/trellis-skill']);
  const viaNpx = spawnSync('npx', ['--no-install', '@terracelab/trellis-skill', 'docs', 'path'], {
    cwd: app,
    encoding: 'utf8',
  });
  assert.equal(viaNpx.status, 0, `${viaNpx.stdout}${viaNpx.stderr}`);
  assert.match(viaNpx.stdout, /trellis-react\/dist\/docs/);
  done('devDependency + npx @terracelab/trellis-skill');

  console.log(`\n통과 ${step}단계`);
  if (keep) console.log(`앱: ${app}`);
} finally {
  if (!keep) rmSync(stage, { recursive: true, force: true });
}
