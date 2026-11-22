// doctor: 서비스가 Trellis를 바르게 쓰고 있는지 본다. 실패(✗)가 있으면 종료 코드 1
//   설치(npm) 또는 빌드(하위 모듈) → CSS import 순서 → 토큰 밖 값 → 테마 범위 → 스킬 버전
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  cssImports,
  cssOrderProblems,
  scanOffToken,
  themeStaleness,
  themeViolations,
  usesTrellis,
  usesTrellisTokens,
} from './checks.mjs';
import { PKG, packageManager, readLock } from './locate.mjs';
import { suggestTokens, tokenIndex } from './suggest.mjs';

const CLI = 'npx @terracelab/trellis-skill';
const CSS_IMPORTS = [
  ['fonts', '@terracelab/trellis-tokens/fonts.css'],
  ['tokens', '@terracelab/trellis-tokens/tokens.css'],
  ['styles', '@terracelab/trellis-react/styles.css'],
];
/** npm 방식에서 CSS를 불러올 만한 진입 파일(Vite · Next.js · React Router) */
const ENTRY_CANDIDATES = [
  ...['main', 'index'].flatMap((n) => ['tsx', 'ts', 'jsx', 'js'].map((e) => `src/${n}.${e}`)),
  ...[
    'app/layout',
    'src/app/layout',
    'pages/_app',
    'src/pages/_app',
    'app/root',
    'src/root',
  ].flatMap((n) => ['tsx', 'jsx'].map((e) => `${n}.${e}`)),
];
const SOURCE_ROOTS = ['src', 'app', 'pages', 'components', 'lib', 'styles'];
/** 컴포넌트는 글꼴 · 글자색을 물려받는다. 앱 CSS가 걸어야 하는 줄 */
const BASE_CSS = [
  'html, body, #root { height: 100%; margin: 0; }',
  'body {',
  '  background: var(--tl-color-bg-canvas);',
  '  color: var(--tl-color-fg-primary);',
  '  font-family: var(--tl-font-family-sans);',
  '}',
];
const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', 'out', 'coverage']);

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name) || e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?|css)$/.test(e.name) && !e.name.endsWith('.d.ts')) out.push(p);
  }
  return out;
}

const sameMinor = (a, b) =>
  String(a).split('.').slice(0, 2).join('.') === String(b).split('.').slice(0, 2).join('.');

/**
 * @param {object} at
 * @param {string} at.cwd  실행 폴더(서비스 저장소 루트)
 * @param {string} at.app  앱 폴더(cwd 기준)
 * @param {ReturnType<import('./locate.mjs').locateTrellis>} at.trellis
 * @param {string} at.skillVersion  이 패키지 버전
 * @param {string} [at.entry]  CSS를 불러오는 파일을 직접 줄 때(cwd 기준)
 * @param {boolean} [at.strict]  Trellis를 쓰지 않는 파일의 토큰 밖 값도 실패로 센다
 * @returns {Promise<number>} 실패 건수
 */
export async function doctor({ cwd, app, trellis: T, skillVersion, entry, strict = false }) {
  const appDir = join(cwd, app);
  const npm = T.mode === 'npm';
  const rel = (f) => relative(cwd, f) || '.';
  const read = (f) => readFileSync(f, 'utf8');
  let errors = 0;
  const ok = (m) => console.log(`✓ ${m}`);
  const bad = (m) => {
    errors += 1;
    console.log(`✗ ${m}`);
  };
  const warn = (m) => console.log(`! ${m}`);
  const list = (rows, max) => {
    rows.slice(0, max).forEach((r) => console.log(`    ${r}`));
    if (rows.length > max) console.log(`    … ${rows.length - max}건 더`);
  };
  const finish = () => {
    console.log(errors ? `\n점검 실패 ${errors}건` : '\n점검 통과');
    return errors;
  };

  // 1. 설치(npm) · 빌드(하위 모듈)
  if (npm) {
    const add = packageManager(appDir).add;
    if (!T.react || !T.tokens) {
      const missing = [!T.react && PKG.react, !T.tokens && PKG.tokens].filter(Boolean);
      bad(`설치되지 않음: ${missing.join(' · ')}`);
      console.log(`    ${add} ${PKG.react} ${PKG.tokens} ${PKG.contracts}`);
      console.log(`    설치한 뒤 ${CLI} doctor를 다시 돌린다`);
      console.log(`    본 앱 폴더: ${rel(appDir)}. 앱이 다른 폴더에 있으면 --app <앱 폴더>`);
      return finish();
    }
    const found = [T.react, T.tokens, T.contracts, T.icons].filter(Boolean);
    const versions = [...new Set(found.map((p) => p.version))];
    if (versions.length > 1)
      bad(
        `패키지 버전이 서로 다르다: ${found.map((p) => `${p.name.replace('@terracelab/trellis-', '')} ${p.version}`).join(' · ')}. 전부 같은 버전으로 맞춘다`,
      );
    else ok(`Trellis ${T.version} 설치됨(${found.length}개 패키지 같은 버전)`);
    const reactMajor = Number(T.reactRuntime?.version.split('.')[0]);
    if (!T.reactRuntime) bad(`react가 설치되지 않았다. ${add} react react-dom`);
    else if (reactMajor < 19)
      bad(
        `React ${T.reactRuntime.version}. Trellis는 React 19가 필요하다(${add} react@19 react-dom@19)`,
      );
    if (!existsSync(join(T.docs, 'llms.txt')))
      bad(`동봉 문서가 없다: ${rel(T.docs)}. 패키지를 다시 설치한다`);
  } else {
    const built = [
      'packages/tokens/dist/css/tokens.css',
      'packages/icons/src/generated/ui-icons.ts',
      'packages/react/dist/styles.css',
      'packages/react/dist/docs/llms.txt',
    ].filter((f) => !existsSync(join(T.root, f)));
    if (built.length) bad(`Trellis 빌드가 없다(${built.join(', ')}). pnpm ds:build`);
    else ok('Trellis 빌드 있음');
  }

  // 훑을 파일: 하위 모듈은 앱의 src, npm은 앱에 있는 소스 폴더 전부
  const roots = (npm ? SOURCE_ROOTS : ['src']).map((d) => join(appDir, d)).filter(existsSync);
  const files = roots.flatMap((d) => walk(d));
  const texts = new Map(files.map((f) => [f, read(f)]));

  // 2. CSS 순서
  if (!npm) {
    const entryFile = entry
      ? join(cwd, entry)
      : ['src/main.tsx', 'src/main.ts'].map((f) => join(appDir, f)).find(existsSync);
    if (!entryFile || !existsSync(entryFile)) bad(`진입 파일 없음: ${rel(appDir)}/src/main.tsx`);
    else {
      const problems = cssOrderProblems(read(entryFile));
      if (problems.length) problems.forEach((p) => bad(`CSS 순서: ${p}`));
      else ok('CSS import 순서(fonts → tokens → theme → styles → blocks)');
    }
  } else {
    const candidates = ENTRY_CANDIDATES.map((f) => join(appDir, f)).filter(existsSync);
    const pool = entry
      ? [[join(cwd, entry), existsSync(join(cwd, entry)) ? read(join(cwd, entry)) : '']]
      : [...new Map([...candidates.map((f) => [f, texts.get(f) ?? read(f)]), ...texts])];
    const where = Object.fromEntries(
      CSS_IMPORTS.map(([key, spec]) => [
        key,
        pool.filter(([, t]) => t.includes(spec)).map(([f]) => f),
      ]),
    );
    const missing = CSS_IMPORTS.filter(([key]) => where[key].length === 0);
    const holder = where.tokens[0];
    if (missing.length) {
      const target = holder ?? candidates[0];
      bad(
        `CSS import가 없다: ${missing.map(([, spec]) => spec).join(' · ')}. ${target ? rel(target) : '앱 진입 파일'} 맨 위에 이 순서로 둔다`,
      );
      CSS_IMPORTS.forEach(([, spec]) => console.log(`    import '${spec}';`));
    } else if (CSS_IMPORTS.every(([key]) => where[key].includes(holder))) {
      const problems = cssOrderProblems(pool.find(([f]) => f === holder)[1]);
      if (problems.length) problems.forEach((p) => bad(`CSS 순서(${rel(holder)}): ${p}`));
      else ok(`CSS import 순서(fonts → tokens → styles, ${rel(holder)})`);
    } else
      warn(
        `CSS import가 여러 파일에 나뉘어 있어 순서를 확인하지 못했다(${CSS_IMPORTS.map(([key]) => rel(where[key][0])).join(' · ')}). 한 파일에 fonts → tokens → styles 순서로 모은다`,
      );
  }

  // 글꼴(npm): 컴포넌트 CSS는 font-family를 정하지 않는다. 앱이 걸지 않으면 브라우저 기본 글꼴로 보인다
  if (npm) {
    if ([...texts.values()].some((t) => t.includes('--tl-font-family-sans')))
      ok('글꼴(--tl-font-family-sans)이 걸려 있다');
    else {
      bad('글꼴이 걸려 있지 않다. 컴포넌트는 글꼴을 물려받는다. 앱 CSS에 아래를 둔다');
      BASE_CSS.forEach((l) => console.log(`    ${l}`));
    }
  }

  // 3. 토큰 밖 값(hex · px · 글꼴 · primitive 색 · 색 함수 · 안쪽 부품 덮기 · Trellis 컴포넌트 onClick)
  // 복사한 블록(src/blocks/<id>/)에서 Trellis 원본과 같은 줄은 블록에서 온 것이라 경고로 따로 센다.
  // npm 방식은 Trellis를 쓰는 파일(패키지에서 이름을 가져오는 파일 · 그 파일이 불러오는 CSS · --tl-* 를 쓰는 CSS)만
  // 실패로 세고, 나머지 파일의 값은 경고로 건수만 알린다. 원래 있던 앱에 화면 하나를 더할 때 옛 코드로 막히지 않게 한다
  const index = T.tokensCss && existsSync(T.tokensCss) ? tokenIndex(read(T.tokensCss)) : null;
  const trellisFiles = new Set();
  for (const [f, t] of texts) {
    if (f.endsWith('.css')) {
      if (usesTrellisTokens(t)) trellisFiles.add(f);
      continue;
    }
    if (!usesTrellis(t)) continue;
    trellisFiles.add(f);
    for (const css of cssImports(t)) trellisFiles.add(resolve(dirname(f), css));
  }
  const strictAll = strict || !npm;
  const hits = [];
  const inherited = [];
  const others = new Map();
  const blocksDir = join(appDir, 'src', 'blocks');
  for (const [f, text] of texts) {
    if (/theme\.css$|\.generated\./.test(f)) continue;
    const lines = text.split('\n');
    const inBlocks = relative(blocksDir, f);
    const original = T.blocksSrc && !inBlocks.startsWith('..') ? join(T.blocksSrc, inBlocks) : null;
    const originalLines =
      original && existsSync(original)
        ? new Set(
            read(original)
              .split('\n')
              .map((l) => l.trim()),
          )
        : null;
    for (const h of scanOffToken(text, { file: f })) {
      const candidates = suggestTokens(h, index);
      const row = `${rel(f)}:${h.line} ${h.kind} ${h.text}${candidates.length ? ` → 후보 ${candidates.join(' · ')}` : ''}`;
      if (originalLines?.has((lines[h.line - 1] ?? '').trim())) inherited.push(row);
      else if (strictAll || trellisFiles.has(f)) hits.push(row);
      else others.set(f, (others.get(f) ?? 0) + 1);
    }
  }
  const scanned = strictAll ? texts.size : trellisFiles.size;
  if (hits.length) {
    bad(`토큰 밖 값 ${hits.length}건`);
    list(hits, 30);
  } else if (npm && !strictAll && trellisFiles.size === 0)
    warn('Trellis 컴포넌트를 쓰는 파일이 아직 없다');
  else ok(`토큰 밖 값 0건(${scanned}개 파일)`);
  if (inherited.length) {
    warn(
      `블록 원본에서 그대로 온 줄 ${inherited.length}건. 서비스에서 고치거나 .trellis/requests.md에 남긴다`,
    );
    list(inherited, 10);
  }
  if (others.size) {
    const total = [...others.values()].reduce((a, b) => a + b, 0);
    warn(
      `Trellis를 쓰지 않는 파일의 토큰 밖 값 ${total}건(파일 ${others.size}개). Trellis 화면과 함께 보이는 전역 CSS라면 지우거나 토큰으로 바꾼다. 전부 실패로 세려면 --strict`,
    );
    list(
      [...others].map(([f, n]) => `${rel(f)} ${n}건`),
      5,
    );
  }

  // 4. 테마 범위 · 생성기와 같은지
  const themeFile = join(appDir, 'src', 'theme.css');
  if (existsSync(themeFile)) {
    const css = read(themeFile);
    const v = themeViolations(css);
    if (v.length) bad(`theme.css가 바꿀 수 없는 변수를 덮는다: ${[...new Set(v)].join(', ')}`);
    else ok('theme.css 범위(브랜드 · 회색 톤만)');
    let engine = null;
    if (T.themeEngine && existsSync(T.themeEngine)) {
      try {
        engine = await import(pathToFileURL(T.themeEngine).href);
      } catch {
        /* 엔진을 못 읽으면 비교하지 않는다 */
      }
    }
    const stale = engine ? themeStaleness(css, engine) : null;
    if (stale && !stale.same) {
      const why = [
        stale.missing.length ? `없는 블록: ${stale.missing.join(' · ')}` : '',
        stale.changed ? `다른 줄 ${stale.changed}개` : '',
      ]
        .filter(Boolean)
        .join(', ');
      warn(
        `theme.css가 지금 생성기 결과와 다르다(${why || '순서 · 선택자'})${npm ? '' : '. pnpm ds:theme --refresh'}`,
      );
    } else if (stale) ok('theme.css가 지금 생성기 결과와 같다');
  }

  // 5. 스킬 버전
  const lock = readLock(cwd);
  const reinstall = npm ? `${CLI}@${T.version} install` : 'pnpm ds:skill';
  if (!lock) warn(`스킬 설치 기록 없음. ${npm ? `${CLI} install` : 'pnpm ds:skill'}`);
  else if (lock.trellis != null && lock.trellis !== T.version)
    warn(
      npm
        ? `스킬은 Trellis ${lock.trellis} 기준, 지금은 ${T.version}. ${reinstall}로 다시 설치`
        : `스킬은 trellis ${lock.trellis} 기준, 지금은 ${T.version}. ${reinstall}로 다시 설치`,
    );
  else if (npm && !sameMinor(lock.skill ?? skillVersion, T.version))
    warn(`스킬 ${lock.skill ?? skillVersion}은 Trellis ${T.version}과 버전이 다르다. ${reinstall}`);
  else ok(npm ? `스킬 버전(Trellis ${T.version})` : `스킬 버전(trellis ${T.version})`);

  return finish();
}
