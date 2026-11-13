// CHANGELOG.md에 적는 줄의 모양(changesets의 changelog 옵션).
// 기본 생성기는 줄 앞에 그 changeset을 넣은 커밋 해시를 붙인다. 이 저장소의 커밋은 공개 저장소에 없으므로(D-66)
// 해시를 빼고 글만 적는다. 함께 올라간 패키지는 한 묶음으로 적는다.
const getReleaseLine = async (changeset) => {
  const [first, ...rest] = changeset.summary.split('\n').map((line) => line.trimEnd());
  return [`- ${first}`, ...rest.map((line) => (line ? `  ${line}` : ''))].join('\n');
};

const getDependencyReleaseLine = async (_changesets, dependenciesUpdated) => {
  if (dependenciesUpdated.length === 0) return '';
  return [
    '- 함께 올라간 패키지',
    ...dependenciesUpdated.map((d) => `  - ${d.name}@${d.newVersion}`),
  ].join('\n');
};

module.exports = { default: { getReleaseLine, getDependencyReleaseLine } };
