#!/usr/bin/env node
// Trellis를 쓰는 서비스 저장소용 도구(D-58). 서비스 저장소 루트에서 실행한다.
// Trellis를 npm으로 설치한 서비스와 git 하위 모듈로 넣은 서비스 둘 다에서 돈다(src/locate.mjs가 가린다).
//   install [--to .claude/skills/trellis] [--app <폴더>]   에이전트 스킬 복사 + .trellis/skill.lock
//   doctor  [--app <폴더>] [--entry <파일>] [--strict]     설치(빌드) · CSS 순서 · 토큰 밖 값 · 테마 범위 · 스킬 버전
//   docs    [list | llms | tokens | path | <컴포넌트> | guide <이름>]   설치된 Trellis 문서 출력
//   add     [<시작 화면> [--to <폴더>] [--force]]          시작 화면을 서비스 소스로 복사(이름 없이 부르면 목록)
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { add } from '../src/add.mjs';
import { docs } from '../src/docs.mjs';
import { doctor } from '../src/doctor.mjs';
import { install } from '../src/install.mjs';
import { defaultApp, locateTrellis, readLock } from '../src/locate.mjs';

const HELP = `trellis-skill <명령>

  install [--to .claude/skills/trellis] [--app <폴더>]
      에이전트 스킬을 복사하고 .trellis/skill.lock에 기록한다
  doctor [--app <폴더>] [--entry <파일>] [--strict]
      설치 · CSS import 순서 · 토큰 밖 값 · 테마 범위 · 스킬 버전을 본다. 실패가 있으면 종료 코드 1
  docs [list | llms | tokens | path | <컴포넌트> | guide <이름>]
      설치된 Trellis 버전의 문서를 출력한다
  add [<시작 화면>] [--to <폴더>] [--force]
      시작 화면(dashboard)을 서비스 소스로 복사한다. 이름 없이 부르면 목록

  --app은 앱 폴더다(모노레포에서 앱이 루트가 아닐 때). install에 한 번 주면 다음 명령이 그대로 쓴다`;

const VALUE_OPTIONS = new Set(['--app', '--to', '--entry']);

/** 인자를 명령 · 위치 인자 · 옵션으로 나눈다 */
function parse(argv) {
  const [cmd = 'help', ...rest] = argv;
  const options = {};
  const args = [];
  for (let i = 0; i < rest.length; i += 1) {
    const a = rest[i];
    if (VALUE_OPTIONS.has(a)) options[a.slice(2)] = rest[(i += 1)];
    else if (a.startsWith('--')) options[a.slice(2)] = true;
    else args.push(a);
  }
  return { cmd, args, options };
}

async function main() {
  const skillPkg = fileURLToPath(new URL('..', import.meta.url));
  const skillVersion = JSON.parse(readFileSync(join(skillPkg, 'package.json'), 'utf8')).version;
  const { cmd, args, options } = parse(process.argv.slice(2));
  const cwd = process.cwd();
  const app = options.app ?? readLock(cwd)?.app ?? defaultApp(cwd);
  const trellis = () => locateTrellis({ cwd, appDir: join(cwd, app), skillPkg });

  if (cmd === 'install')
    return install({
      cwd,
      to: options.to ?? '.claude/skills/trellis',
      app,
      appGiven: Boolean(options.app),
      skillPkg,
      skillVersion,
      trellis: trellis(),
    });
  if (cmd === 'doctor')
    return (await doctor({
      cwd,
      app,
      trellis: trellis(),
      skillVersion,
      entry: options.entry,
      strict: Boolean(options.strict),
    }))
      ? 1
      : 0;
  if (cmd === 'docs') {
    const T = trellis();
    return docs({ docs: T.docs, args, mode: T.mode });
  }
  if (cmd === 'add')
    return add({ cwd, app, skillPkg, id: args[0], to: options.to, force: Boolean(options.force) });

  console.log(HELP);
  return cmd === 'help' || cmd === '--help' || cmd === '-h' ? 0 : 1;
}

process.exit(await main());
