// npm 방식: 설치 위치 찾기 · 토큰 후보 · CLI(install · doctor · docs · add). 임시 폴더에 node_modules 배치를 흉내 낸다.
// 진짜 묶음으로 설치해 보는 검사는 scripts/e2e.mjs(pnpm --filter @terracelab/trellis-skill test:e2e)
import { spawnSync } from 'node:child_process';
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
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
// @ts-expect-error — mjs 모듈(타입 없음)
import { cssImports, usesTrellis, usesTrellisTokens } from '../src/checks.mjs';
// @ts-expect-error — mjs 모듈(타입 없음)
import {
  defaultApp,
  findPackage,
  isCheckout,
  locateTrellis,
  packageManager,
} from '../src/locate.mjs';
// @ts-expect-error — mjs 모듈(타입 없음)
import { normalizeHex, suggestTokens, tokenIndex } from '../src/suggest.mjs';

const SKILL = fileURLToPath(new URL('..', import.meta.url));
const REPO = join(SKILL, '..', '..');
const BIN = join(SKILL, 'bin', 'trellis-skill.mjs');
const TOKENS_CSS = join(REPO, 'packages', 'tokens', 'dist', 'css', 'tokens.css');
const REACT_DOCS = join(REPO, 'packages', 'react', 'dist', 'docs');
/** 스킬 자신의 버전. 가짜 설치본도 이 버전으로 두어야 스킬 · Trellis 버전 검사가 통과한다 */
const V: string = JSON.parse(readFileSync(join(SKILL, 'package.json'), 'utf8')).version;
/** 다음 minor. 스킬을 설치한 뒤 Trellis를 올린 경우 */
const NEXT = V.replace(
  /^(\d+)\.(\d+)\..*$/,
  (_, a: string, b: string) => `${a}.${Number(b) + 1}.0`,
);

let root: string;
const put = (file: string, text: string) => {
  mkdirSync(dirname(join(root, file)), { recursive: true });
  writeFileSync(join(root, file), text);
};
const cli = (...argv: string[]) => {
  const r = spawnSync('node', [BIN, ...argv], { cwd: root, encoding: 'utf8' });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
};
/** 레지스트리에서 설치한 것처럼 node_modules에 패키지를 둔다 */
function fakeInstall(version = V, tokensVersion = version) {
  const pkg = (name: string, v: string) =>
    put(`node_modules/${name}/package.json`, JSON.stringify({ name, version: v }));
  pkg('@terracelab/trellis-react', version);
  pkg('@terracelab/trellis-contracts', version);
  pkg('@terracelab/trellis-icons', version);
  pkg('@terracelab/trellis-tokens', tokensVersion);
  pkg('react', '19.3.1');
  put(
    'node_modules/@terracelab/trellis-tokens/dist/css/tokens.css',
    readFileSync(TOKENS_CSS, 'utf8'),
  );
  put('node_modules/@terracelab/trellis-react/dist/docs/llms.txt', '# Trellis 1.0.0\n');
  put('node_modules/@terracelab/trellis-react/dist/docs/tokens.md', '# 토큰\n');
  put('node_modules/@terracelab/trellis-react/dist/docs/components/Button.md', '# Button\n');
  put(
    'node_modules/@terracelab/trellis-react/dist/docs/guides/dashboards.md',
    '# 대시보드 만들기\n',
  );
}
const MAIN = [
  "import '@terracelab/trellis-tokens/fonts.css';",
  "import '@terracelab/trellis-tokens/tokens.css';",
  "import '@terracelab/trellis-react/styles.css';",
  "import './app.css';",
  "import { App } from './App';",
  '',
].join('\n');
const APP_CSS = 'body {\n  font-family: var(--tl-font-family-sans);\n}\n';
const SCREEN =
  "import { Button } from '@terracelab/trellis-react';\nimport './screen.css';\nexport const App = () => <Button>저장</Button>;\n";

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'trellis-skill-test-'));
  put('package.json', JSON.stringify({ name: 'service', private: true }));
});
afterAll(() => rmSync(root, { recursive: true, force: true }));

describe('locate', () => {
  it('Trellis 저장소 안의 앱은 하위 모듈 방식이다', () => {
    expect(isCheckout(REPO)).toBe(true);
    const app = join(REPO, 'starters', 'service', 'app');
    const T = locateTrellis({ cwd: REPO, appDir: app, skillPkg: SKILL });
    expect(T.mode).toBe('submodule');
    expect(T.docs).toBe(REACT_DOCS);
    expect(T.blocksSrc).toBe(join(REPO, 'blocks', 'src'));
  });

  it('패키지가 없고 이 도구도 저장소 밖(npx 캐시)이면 npm 방식 · 설치 전', () => {
    const T = locateTrellis({ cwd: root, appDir: root, skillPkg: join(root, 'cache', 'skill') });
    expect(T.mode).toBe('npm');
    expect(T.react).toBeNull();
    expect(T.version).toBeNull();
    expect(T.docs).toBeNull();
  });

  it('node_modules에 설치돼 있으면 npm 방식이고 버전은 react 패키지 버전이다', () => {
    fakeInstall('1.2.3');
    // 이 도구가 Trellis 저장소 안에 있어도, 앱이 쓰는 react가 저장소 것이 아니면 npm 방식이다
    const T = locateTrellis({ cwd: root, appDir: root, skillPkg: SKILL });
    expect(T.mode).toBe('npm');
    expect(T.version).toBe('1.2.3');
    expect(T.docs).toBe(join(T.react.dir, 'dist', 'docs'));
    expect(T.contracts.version).toBe('1.2.3');
    expect(T.reactRuntime.version).toBe('19.3.1');
    expect(isCheckout(join(T.react.dir, '..', '..'))).toBe(false);
  });

  it('패키지는 앱 폴더에서 위로 올라가며 찾는다(모노레포)', () => {
    mkdirSync(join(root, 'apps', 'admin', 'src'), { recursive: true });
    expect(findPackage('@terracelab/trellis-react', join(root, 'apps', 'admin'))?.version).toBe(
      '1.2.3',
    );
    expect(findPackage('@terracelab/none', root)).toBeNull();
  });

  it('잠금 파일로 패키지 관리자를 고른다', () => {
    expect(packageManager(REPO).name).toBe('pnpm');
    const dir = mkdtempSync(join(tmpdir(), 'trellis-skill-pm-'));
    writeFileSync(join(dir, 'yarn.lock'), '');
    expect(packageManager(dir)).toEqual({ name: 'yarn', add: 'yarn add' });
    rmSync(dir, { recursive: true, force: true });
  });

  it('앱 폴더 기본값: apps/web이 있으면 그것, 없으면 실행 폴더', () => {
    expect(defaultApp(root)).toBe('.');
    put('apps/web/package.json', '{}');
    expect(defaultApp(root)).toBe(join('apps', 'web'));
    rmSync(join(root, 'apps'), { recursive: true, force: true });
  });
});

describe('suggest', () => {
  const index = tokenIndex(readFileSync(TOKENS_CSS, 'utf8'));

  it('hex 표기를 6 · 8자리 대문자로 맞춘다', () => {
    expect(normalizeHex('#fff')).toBe('#FFFFFF');
    expect(normalizeHex('#0008')).toBe('#00000088');
    expect(normalizeHex('#fe5c2b')).toBe('#FE5C2B');
  });

  it('흰색은 면 → 글자 순서로 semantic 토큰을 낸다. primitive는 내지 않는다', () => {
    const out = suggestTokens({ kind: 'hex 색', text: '#fff' }, index);
    expect(out[0]).toBe('--tl-color-bg-surface');
    expect(out.length).toBeLessThanOrEqual(3);
    expect(out).not.toContain('--tl-color-base-white');
  });

  it('px는 간격 → 반경 → 테두리 굵기 토큰을 낸다', () => {
    expect(suggestTokens({ kind: 'px 값', text: '12px' }, index)[0]).toBe('--tl-space-12');
    expect(suggestTokens({ kind: 'px 값', text: '1px' }, index)).toEqual(['--tl-border-width-1']);
  });

  it('맞는 토큰이 없거나 다른 종류면 빈 배열', () => {
    expect(suggestTokens({ kind: 'px 값', text: '13px' }, index)).toEqual([]);
    expect(suggestTokens({ kind: 'font-family', text: 'font-family: Arial' }, index)).toEqual([]);
    expect(suggestTokens({ kind: 'hex 색', text: '#fff' }, null)).toEqual([]);
  });
});

describe('Trellis를 쓰는 파일 가리기', () => {
  it('패키지에서 이름을 가져오면 쓰는 파일이다. CSS만 불러오는 줄은 세지 않는다', () => {
    expect(usesTrellis("import { Button } from '@terracelab/trellis-react';")).toBe(true);
    expect(usesTrellis("import { TrendChart } from '@terracelab/trellis-react/charts';")).toBe(
      true,
    );
    expect(usesTrellis("import { formatAmount } from '@terracelab/trellis-contracts';")).toBe(true);
    expect(usesTrellis("import '@terracelab/trellis-tokens/tokens.css';")).toBe(false);
    expect(usesTrellis("import { x } from './local';")).toBe(false);
  });

  it('--tl-* 변수를 쓰는 CSS와 상대 경로 CSS import를 찾는다', () => {
    expect(usesTrellisTokens('.a { color: var(--tl-color-fg-primary); }')).toBe(true);
    expect(usesTrellisTokens('.a { color: #333; }')).toBe(false);
    expect(
      cssImports("import './a.css';\nimport s from '../b.module.css';\nimport 'pkg/c.css';"),
    ).toEqual(['./a.css', '../b.module.css']);
  });
});

describe('CLI(npm 방식)', () => {
  it('install: npm 방식 글과 두 방식 공통 글을 복사하고 lock에 적는다', () => {
    fakeInstall(V);
    const r = cli('install');
    expect(r.code).toBe(0);
    const dest = join(root, '.claude', 'skills', 'trellis');
    expect(readFileSync(join(dest, 'SKILL.md'), 'utf8')).toMatch(/^---\nname: trellis\n/);
    expect(readdirSync(join(dest, 'references')).sort()).toEqual([
      'dashboard.md',
      'do-dont.md',
      'request.md',
      'setup.md',
    ]);
    const lock = JSON.parse(readFileSync(join(root, '.trellis', 'skill.lock'), 'utf8'));
    expect(lock).toMatchObject({ trellis: V, mode: 'npm', to: '.claude/skills/trellis' });
    expect(lock.files).toContain('references/dashboard.md');
  });

  it('install: 지난 설치가 둔 파일 가운데 이번에 없는 것은 지운다', () => {
    const lockFile = join(root, '.trellis', 'skill.lock');
    const lock = JSON.parse(readFileSync(lockFile, 'utf8'));
    put('.claude/skills/trellis/references/blocks.md', '# 옛 문서\n');
    put('.claude/skills/trellis/references/notes.md', '# 서비스가 더한 글\n');
    writeFileSync(
      lockFile,
      JSON.stringify({ ...lock, files: [...lock.files, 'references/blocks.md'] }),
    );
    expect(cli('install').code).toBe(0);
    expect(existsSync(join(root, '.claude/skills/trellis/references/blocks.md'))).toBe(false);
    expect(existsSync(join(root, '.claude/skills/trellis/references/notes.md'))).toBe(true);
  });

  it('doctor: CSS import와 글꼴이 없으면 실패하고 넣을 줄을 알려 준다', () => {
    put('src/main.tsx', "import { App } from './App';\n");
    put('src/App.tsx', 'export const App = () => <main />;\n');
    const r = cli('doctor');
    expect(r.code).toBe(1);
    expect(r.out).toContain(`✓ Trellis ${V} 설치됨(4개 패키지 같은 버전)`);
    expect(r.out).toContain('CSS import가 없다');
    expect(r.out).toContain("import '@terracelab/trellis-react/styles.css';");
    expect(r.out).toContain('글꼴이 걸려 있지 않다');
  });

  it('doctor: 갖춰지면 통과한다', () => {
    put('src/main.tsx', MAIN);
    put('src/app.css', APP_CSS);
    put('src/App.tsx', SCREEN);
    put('src/screen.css', '.screen {\n  padding: var(--tl-space-12);\n}\n');
    const r = cli('doctor');
    expect(r.out).toContain('✓ CSS import 순서(fonts → tokens → styles, src/main.tsx)');
    expect(r.out).toContain(`✓ 스킬 버전(Trellis ${V})`);
    expect(r.out).toContain('점검 통과');
    expect(r.code).toBe(0);
  });

  it('doctor: Trellis 화면의 토큰 밖 값은 실패 + 후보, 그 밖 파일은 경고(--strict면 실패)', () => {
    put('src/screen.css', '.screen {\n  background: #fff;\n}\n');
    put('src/legacy.css', '.old {\n  color: #123456;\n  margin: 7px;\n}\n');
    const r = cli('doctor');
    expect(r.code).toBe(1);
    expect(r.out).toContain('✗ 토큰 밖 값 1건');
    expect(r.out).toContain('src/screen.css:2 hex 색 #fff → 후보 --tl-color-bg-surface');
    expect(r.out).toContain('Trellis를 쓰지 않는 파일의 토큰 밖 값 2건(파일 1개)');
    expect(cli('doctor', '--strict').out).toContain('✗ 토큰 밖 값 3건');
    put('src/screen.css', '.screen {\n  padding: var(--tl-space-12);\n}\n');
    rmSync(join(root, 'src', 'legacy.css'));
  });

  it('doctor: CSS 순서가 틀리면 실패한다. CSS 파일의 @import도 본다', () => {
    put('src/main.tsx', "import './app.css';\nimport { App } from './App';\n");
    put(
      'src/app.css',
      `@import '@terracelab/trellis-react/styles.css';\n@import '@terracelab/trellis-tokens/fonts.css';\n@import '@terracelab/trellis-tokens/tokens.css';\n${APP_CSS}`,
    );
    const r = cli('doctor');
    expect(r.code).toBe(1);
    expect(r.out).toContain('CSS 순서(src/app.css): tokens.css가 styles.css보다 먼저여야 한다');
    put('src/main.tsx', MAIN);
    put('src/app.css', APP_CSS);
  });

  it('doctor: 패키지 버전이 다르거나 React가 18이면 실패한다', () => {
    fakeInstall(V, '0.9.0');
    put('node_modules/react/package.json', JSON.stringify({ name: 'react', version: '18.3.1' }));
    const r = cli('doctor');
    expect(r.code).toBe(1);
    expect(r.out).toContain('패키지 버전이 서로 다르다');
    expect(r.out).toContain('tokens 0.9.0');
    expect(r.out).toContain('React 18.3.1. Trellis는 React 19가 필요하다');
    fakeInstall(V);
  });

  it('doctor: 설치한 Trellis가 스킬을 설치한 때와 다르면 다시 설치하라고 알린다', () => {
    fakeInstall(NEXT);
    const r = cli('doctor');
    expect(r.code).toBe(0);
    expect(r.out).toContain(`스킬은 Trellis ${V} 기준, 지금은 ${NEXT}`);
    expect(r.out).toContain(`npx @terracelab/trellis-skill@${NEXT} install`);
    fakeInstall(V);
  });

  it('doctor: 패키지를 넣기 전에 스킬을 설치해 lock에 버전이 없으면 경고하지 않는다', () => {
    const lockFile = join(root, '.trellis', 'skill.lock');
    const lock = JSON.parse(readFileSync(lockFile, 'utf8'));
    writeFileSync(lockFile, JSON.stringify({ ...lock, trellis: null }));
    const r = cli('doctor');
    expect(r.out).toContain(`✓ 스킬 버전(Trellis ${V})`);
    expect(r.out).not.toContain('기준');
    writeFileSync(lockFile, JSON.stringify(lock));
  });

  it('docs: 설치된 패키지의 문서를 그대로 낸다', () => {
    expect(cli('docs').out).toBe('# Trellis 1.0.0\n');
    expect(cli('docs', 'component', 'Button').out).toBe('# Button\n');
    expect(cli('docs', 'button').out).toBe('# Button\n');
    expect(cli('docs', 'guide', 'dashboards').out).toBe('# 대시보드 만들기\n');
    expect(cli('docs', 'list').out).toContain('컴포넌트: Button');
    expect(cli('docs', 'path').out.trim()).toMatch(/trellis-react\/dist\/docs$/);
    expect(cli('docs', 'Nope').code).toBe(1);
  });

  it('add: 시작 화면을 복사하고, 있는 파일은 --force 없이 덮어쓰지 않는다', () => {
    expect(cli('add').out).toMatch(/^dashboard {2}/);
    const r = cli('add', 'dashboard');
    expect(r.code).toBe(0);
    expect(readdirSync(join(root, 'src', 'dashboard')).sort()).toEqual([
      'Dashboard.tsx',
      'dashboard.css',
      'data.ts',
    ]);
    expect(cli('add', 'dashboard').code).toBe(1);
    expect(cli('add', 'dashboard', '--force').code).toBe(0);
    expect(cli('add', 'dashboard', '--to', 'src/sales').code).toBe(0);
    expect(existsSync(join(root, 'src', 'sales', 'Dashboard.tsx'))).toBe(true);
    expect(cli('add', 'nope').code).toBe(1);
  });

  it('복사한 시작 화면은 doctor를 통과한다', () => {
    const r = cli('doctor');
    expect(r.out).toContain('✓ 토큰 밖 값 0건');
    expect(r.code).toBe(0);
  });

  it('--app: 모노레포의 앱 폴더. install에 한 번 주면 다음 명령이 그대로 쓴다', () => {
    put('apps/admin/package.json', '{}');
    put('apps/admin/src/main.tsx', "import { App } from './App';\n");
    expect(cli('install', '--app', 'apps/admin').code).toBe(0);
    expect(JSON.parse(readFileSync(join(root, '.trellis', 'skill.lock'), 'utf8')).app).toBe(
      'apps/admin',
    );
    const r = cli('doctor');
    expect(r.out).toContain('apps/admin/src/main.tsx 맨 위에 이 순서로 둔다');
    expect(cli('doctor', '--app', '.').code).toBe(0);
  });
});

describe('스킬 글', () => {
  const read = (...p: string[]) => readFileSync(join(SKILL, 'skills', ...p), 'utf8');

  it('대시보드 표의 부품은 전부 설치된 문서에 있는 컴포넌트다', () => {
    const table = read('trellis-npm', 'references', 'dashboard.md')
      .split('## 2. 요청을 부품으로 옮긴다')[1]!
      .split('## 3.')[0]!;
    const names = new Set<string>();
    for (const row of table
      .split('\n')
      .filter((l) => l.startsWith('| ') && !l.startsWith('| 요청')))
      for (const m of (row.split('|')[2] ?? '').matchAll(/`([A-Z][A-Za-z]+)`/g)) names.add(m[1]!);
    expect(names.size).toBeGreaterThan(20);
    for (const name of names)
      expect(existsSync(join(REACT_DOCS, 'components', `${name}.md`)), name).toBe(true);
  });

  it('npm 방식 글은 하위 모듈 명령을 시키지 않고, 명령은 패키지 전체 이름으로 부른다', () => {
    for (const file of [
      'SKILL.md',
      'references/dashboard.md',
      'references/setup.md',
      'references/request.md',
    ]) {
      const text = read('trellis-npm', ...file.split('/'));
      // "pnpm ds:*는 이 서비스에 없다"는 안내 한 줄만 빼고 본다
      const body = text.replace(/^.*이 서비스에는 없다.*$/m, '');
      expect(body, file).not.toMatch(/pnpm ds:/);
      // npx trellis-skill은 레지스트리의 다른 패키지를 받는다
      expect(text, file).not.toMatch(/npx trellis-skill/);
    }
  });

  it('두 방식 모두 SKILL.md가 references에 있는 파일만 가리킨다', () => {
    for (const variant of ['trellis', 'trellis-npm']) {
      const have = new Set([
        ...readdirSync(join(SKILL, 'skills', variant, 'references')),
        ...readdirSync(join(SKILL, 'skills', 'shared', 'references')),
      ]);
      for (const m of read(variant, 'SKILL.md').matchAll(/references\/([\w-]+\.md)/g))
        expect(have.has(m[1]!), `${variant}: ${m[1]}`).toBe(true);
    }
  });
});
