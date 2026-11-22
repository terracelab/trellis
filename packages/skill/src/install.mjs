// install: 에이전트 스킬(SKILL.md · references)을 서비스 저장소에 복사하고 .trellis/skill.lock에 기록한다.
// 설치 방식에 맞는 글을 고른다(skills/trellis = 하위 모듈, skills/trellis-npm = npm). 두 방식이 같이 쓰는 글은 skills/shared
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { PKG, packageManager, readLock } from './locate.mjs';

function filesUnder(dir, base = dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) filesUnder(p, base, out);
    else out.push(relative(base, p));
  }
  return out;
}

/**
 * @param {object} at
 * @param {string} at.cwd  서비스 저장소 루트
 * @param {string} at.to  스킬을 둘 폴더(cwd 기준)
 * @param {string} at.app  앱 폴더(cwd 기준). 기본값이 아니면 lock에 적어 다음 명령이 그대로 쓴다
 * @param {boolean} at.appGiven  --app을 직접 줬는가
 * @param {string} at.skillPkg  이 패키지 폴더
 * @param {string} at.skillVersion
 * @param {ReturnType<import('./locate.mjs').locateTrellis>} at.trellis
 */
export function install({ cwd, to, app, appGiven, skillPkg, skillVersion, trellis: T }) {
  const dest = join(cwd, to);
  const variant = T.mode === 'submodule' ? 'trellis' : 'trellis-npm';
  const sources = [join(skillPkg, 'skills', variant), join(skillPkg, 'skills', 'shared')];
  const files = [...new Set(sources.flatMap((dir) => filesUnder(dir)))].sort();

  // 지난 설치가 둔 파일 가운데 이번에 없는 것은 지운다(설치 방식이 바뀌면 참고 문서가 달라진다)
  const before = readLock(cwd);
  for (const old of before?.files ?? [])
    if (!files.includes(old)) rmSync(join(cwd, before.to ?? to, old), { force: true });

  mkdirSync(dest, { recursive: true });
  for (const dir of sources) cpSync(dir, dest, { recursive: true });

  const lockFile = join(cwd, '.trellis', 'skill.lock');
  mkdirSync(dirname(lockFile), { recursive: true });
  const lock = {
    skill: skillVersion,
    trellis: T.version ?? null,
    mode: T.mode,
    ...(appGiven ? { app } : before?.app ? { app: before.app } : {}),
    to,
    files,
  };
  writeFileSync(lockFile, `${JSON.stringify(lock, null, 2)}\n`);

  console.log(`스킬 설치: ${relative(cwd, dest)}(${files.length}개 파일)`);
  if (T.mode === 'submodule') console.log(`Trellis: 하위 모듈 ${T.version}`);
  else if (T.react) console.log(`Trellis: npm ${T.version}`);
  else {
    const add = packageManager(join(cwd, app)).add;
    console.log('Trellis 패키지가 아직 없다. 설치한 뒤 점검한다');
    console.log(`  ${add} ${PKG.react} ${PKG.tokens} ${PKG.contracts}`);
  }
  console.log(
    T.mode === 'submodule' ? '다음: pnpm ds:doctor' : '다음: npx @terracelab/trellis-skill doctor',
  );
  return existsSync(join(dest, 'SKILL.md')) ? 0 : 1;
}
