// docs: 설치된 Trellis의 동봉 문서를 표준 출력으로 낸다(네트워크 없음). 문서는 react 패키지의 dist/docs에 있다
//   docs · docs llms       시작점(규칙 · 문서 목록)
//   docs list              컴포넌트 · 가이드 이름
//   docs <Name>            컴포넌트 문서(docs component <Name>도 같다). 대소문자는 가리지 않는다
//   docs guide <이름>      가이드
//   docs tokens            토큰 표
//   docs path              문서 폴더 경로(파일을 직접 읽거나 찾을 때)
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const names = (dir) =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith('.md'))
        .map((f) => f.replace(/\.md$/, ''))
    : [];

/**
 * @param {object} at
 * @param {string | null} at.docs  문서 폴더
 * @param {string[]} at.args  docs 뒤의 인자
 * @param {'npm' | 'submodule'} at.mode
 * @returns {number} 종료 코드
 */
export function docs({ docs: dir, args, mode }) {
  if (!dir || !existsSync(dir)) {
    console.error(
      mode === 'submodule'
        ? '문서 없음. pnpm ds:build'
        : '문서 없음. @terracelab/trellis-react를 먼저 설치한다(npx @terracelab/trellis-skill doctor가 명령을 알려 준다)',
    );
    return 1;
  }
  const components = names(join(dir, 'components'));
  const guides = names(join(dir, 'guides'));
  const print = (p) => {
    if (!existsSync(p)) {
      console.error(`없음: ${relative(dir, p)}. docs list로 이름을 본다`);
      return 1;
    }
    process.stdout.write(readFileSync(p, 'utf8'));
    return 0;
  };
  const pick = (list, name) =>
    list.find((n) => n === name) ??
    list.find((n) => n.toLowerCase() === String(name).toLowerCase());

  const [what = 'llms', name] = args;
  if (what === 'path') {
    console.log(dir);
    return 0;
  }
  if (what === 'list') {
    console.log('컴포넌트:', components.join(' '));
    console.log('가이드:', guides.join(' '));
    return 0;
  }
  if (what === 'llms') return print(join(dir, 'llms.txt'));
  if (what === 'tokens') return print(join(dir, 'tokens.md'));
  if (what === 'guide') return print(join(dir, 'guides', `${pick(guides, name) ?? name}.md`));
  const component = what === 'component' ? name : what;
  return print(join(dir, 'components', `${pick(components, component) ?? component}.md`));
}
