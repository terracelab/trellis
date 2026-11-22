// 서비스가 쓰는 Trellis가 어디에 있는지 찾는다. 설치 방식은 둘이다.
//   submodule  서비스 저장소 안에 Trellis 저장소가 하위 모듈로 있고 같은 워크스페이스로 묶여 있다
//   npm        @terracelab/trellis-* 를 레지스트리에서 설치했다(node_modules)
// npx는 이 패키지를 캐시 폴더에서 실행하므로, 패키지는 늘 서비스 폴더에서 위로 올라가며 찾는다
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const PKG = {
  react: '@terracelab/trellis-react',
  tokens: '@terracelab/trellis-tokens',
  contracts: '@terracelab/trellis-contracts',
  icons: '@terracelab/trellis-icons',
};

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));

/** fromDir에서 위로 올라가며 node_modules/<name>을 찾는다(Node가 찾는 순서와 같다). 없으면 null */
export function findPackage(name, fromDir) {
  let dir = fromDir;
  for (;;) {
    const file = join(dir, 'node_modules', name, 'package.json');
    if (existsSync(file)) {
      const real = realpathSync(dirname(file));
      return { name, dir: real, version: readJson(join(real, 'package.json')).version };
    }
    const up = dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

/** Trellis 저장소인가. 토큰 원본 JSON 폴더와 워크스페이스 파일은 저장소에만 있다 */
export function isCheckout(root) {
  return (
    existsSync(join(root, 'pnpm-workspace.yaml')) &&
    existsSync(join(root, 'packages', 'tokens', 'src', 'semantic'))
  );
}

function gitCommit(root) {
  try {
    return execFileSync('git', ['-C', root, 'rev-parse', '--short', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return 'unknown';
  }
}

/**
 * @param {{ cwd: string, appDir: string, skillPkg: string }} at  실행 폴더 · 앱 폴더 · 이 패키지 폴더
 * mode가 submodule이면 root(Trellis 저장소)가 있고 version은 그 커밋이다.
 * mode가 npm이면 version은 설치된 react 패키지 버전이고, 설치 전이면 react가 null이다
 */
export function locateTrellis({ cwd, appDir, skillPkg }) {
  const find = (name) => findPackage(name, appDir) ?? findPackage(name, cwd);
  const react = find(PKG.react);
  const ownRoot = join(skillPkg, '..', '..');
  const reactRoot = react ? join(react.dir, '..', '..') : null;
  const root =
    reactRoot && isCheckout(reactRoot) ? reactRoot : !react && isCheckout(ownRoot) ? ownRoot : null;

  if (root) {
    const tokensDir = join(root, 'packages', 'tokens');
    return {
      mode: 'submodule',
      root,
      version: gitCommit(root),
      react,
      docs: join(root, 'packages', 'react', 'dist', 'docs'),
      tokensDir,
      tokensCss: join(tokensDir, 'dist', 'css', 'tokens.css'),
      themeEngine: join(tokensDir, 'theme', 'index.mjs'),
      blocksSrc: join(root, 'blocks', 'src'),
    };
  }

  const near = (name) => find(name) ?? (react ? findPackage(name, react.dir) : null);
  const tokens = near(PKG.tokens);
  return {
    mode: 'npm',
    root: null,
    version: react?.version ?? null,
    react,
    tokens,
    contracts: near(PKG.contracts),
    icons: near(PKG.icons),
    reactRuntime: find('react'),
    docs: react ? join(react.dir, 'dist', 'docs') : null,
    tokensDir: tokens?.dir ?? null,
    tokensCss: tokens ? join(tokens.dir, 'dist', 'css', 'tokens.css') : null,
    themeEngine: tokens ? join(tokens.dir, 'theme', 'index.mjs') : null,
    blocksSrc: null,
  };
}

/** 서비스가 쓰는 패키지 관리자와 그 설치 명령. 잠금 파일을 위로 올라가며 찾는다 */
export function packageManager(fromDir) {
  const LOCKS = [
    ['pnpm-lock.yaml', 'pnpm', 'pnpm add'],
    ['yarn.lock', 'yarn', 'yarn add'],
    ['bun.lock', 'bun', 'bun add'],
    ['bun.lockb', 'bun', 'bun add'],
    ['package-lock.json', 'npm', 'npm install'],
  ];
  let dir = fromDir;
  for (;;) {
    for (const [file, name, add] of LOCKS) if (existsSync(join(dir, file))) return { name, add };
    const up = dirname(dir);
    if (up === dir) return { name: 'npm', add: 'npm install' };
    dir = up;
  }
}

/** 앱 폴더 기본값: 시작 템플릿 배치(apps/web)가 있으면 그것, 없으면 실행 폴더 */
export function defaultApp(cwd) {
  return existsSync(join(cwd, 'apps', 'web', 'package.json')) ? join('apps', 'web') : '.';
}

/** .trellis/skill.lock. 없거나 깨졌으면 null */
export function readLock(cwd) {
  const file = join(cwd, '.trellis', 'skill.lock');
  if (!existsSync(file)) return null;
  try {
    return readJson(file);
  } catch {
    return null;
  }
}
