// add: 이 패키지에 든 시작 화면을 서비스 소스로 복사한다. 복사한 뒤에는 서비스 코드다.
// 시작 화면은 npm에 있는 패키지(@terracelab/trellis-react · contracts)만 쓴다. Trellis 저장소의 화면 블록(ds:add)과는 다른 것이다
import { cpSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

/** 시작 화면 목록: templates/<id>/template.json의 title · to(앱 폴더 기준 기본 위치) · next(복사한 뒤 안내) */
export function templates(skillPkg) {
  const dir = join(skillPkg, 'templates');
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(dir, e.name, 'template.json')))
    .map((e) => ({
      id: e.name,
      dir: join(dir, e.name),
      ...JSON.parse(readFileSync(join(dir, e.name, 'template.json'), 'utf8')),
    }));
}

/**
 * @param {object} at
 * @param {string} at.cwd
 * @param {string} at.app  앱 폴더(cwd 기준)
 * @param {string} at.skillPkg
 * @param {string} [at.id]  시작 화면 id. 없으면 목록을 보인다
 * @param {string} [at.to]  복사할 폴더(cwd 기준). 없으면 template.json의 to
 * @param {boolean} [at.force]  같은 이름 파일을 덮어쓴다
 * @returns {number} 종료 코드
 */
export function add({ cwd, app, skillPkg, id, to, force = false }) {
  const all = templates(skillPkg);
  if (!id) {
    for (const t of all) console.log(`${t.id}  ${t.title}`);
    return 0;
  }
  const t = all.find((x) => x.id === id);
  if (!t) {
    console.error(`없는 시작 화면: ${id}. 있는 것: ${all.map((x) => x.id).join(' · ')}`);
    return 1;
  }
  const dest = to ? join(cwd, to) : join(cwd, app, t.to);
  const files = readdirSync(t.dir).filter((f) => f !== 'template.json');
  const clash = files.filter((f) => existsSync(join(dest, f)));
  if (clash.length && !force) {
    console.error(
      `이미 있다: ${clash.map((f) => relative(cwd, join(dest, f))).join(' · ')}. 덮어쓰려면 --force, 다른 곳에 두려면 --to <폴더>`,
    );
    return 1;
  }
  for (const f of files) cpSync(join(t.dir, f), join(dest, f), { recursive: true });
  console.log(`복사: ${relative(cwd, dest)}/ (${files.join(' · ')})`);
  for (const line of t.next ?? []) console.log(line);
  return 0;
}
