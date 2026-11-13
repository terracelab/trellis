// 공개 저장소(소스 · 사이트 묶음)에 남는 커밋의 작성자(D-153).
// 공개 커밋을 만드는 스크립트는 이 PC의 git 설정을 쓰지 않고 전부 이 값을 쓴다. 개인 주소가 공개 기록에 남지 않게 하려는 것이다.
// 바꾸려면 환경 변수 TRELLIS_PUBLIC_AUTHOR="이름 <주소>".
const DEFAULT = 'terrace-lab <no-reply@terracelab.co.kr>';

/**
 * @param {string} [text] "이름 <주소>"
 * @returns {{ name: string, email: string, label: string }}
 */
export function publicAuthor(text = process.env.TRELLIS_PUBLIC_AUTHOR ?? DEFAULT) {
  const m = /^\s*([^<>]+?)\s*<([^<>\s@]+@[^<>\s@]+)>\s*$/.exec(text);
  if (!m) throw new Error(`작성자는 "이름 <주소>" 꼴로 적는다: ${text}`);
  return { name: m[1], email: m[2], label: `${m[1]} <${m[2]}>` };
}

/**
 * git에 넘길 환경 변수. 작성자와 커밋한 사람을 둘 다 바꾼다(하나만 바꾸면 다른 쪽에 이 PC의 주소가 남는다).
 * @param {{ name: string, email: string }} [author]
 */
export function identityEnv(author = publicAuthor()) {
  return {
    ...process.env,
    GIT_AUTHOR_NAME: author.name,
    GIT_AUTHOR_EMAIL: author.email,
    GIT_COMMITTER_NAME: author.name,
    GIT_COMMITTER_EMAIL: author.email,
  };
}

/**
 * 방금 만든 커밋의 작성자 · 커밋한 사람이 공개용 계정인지 확인한다. 아니면 던진다. 푸시 전에 부른다.
 * @param {(...args: string[]) => string} git 그 저장소에서 git을 돌려 출력을 돌려주는 함수
 * @param {{ label: string }} [author]
 */
export function assertIdentity(git, author = publicAuthor()) {
  const who = git('log', '-1', '--format=%an <%ae>|%cn <%ce>').trim();
  if (who !== `${author.label}|${author.label}`)
    throw new Error(`커밋의 작성자가 공개용 계정(${author.label})이 아니다. 푸시하지 않는다`);
}
