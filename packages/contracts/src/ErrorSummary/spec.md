# ErrorSummary
## 용도
제출했는데 고칠 칸이 있을 때 폼 맨 위에 오류를 모아 보인다. 항목을 누르면 그 칸으로 간다. 칸이 많거나 접힌 묶음 · 아래쪽 칸에 오류가 있어 화면에서 안 보일 때 쓴다. 칸 하나의 오류 문장은 Field, 저장 실패 같은 폼 전체 결과는 Banner · Toast.
## 해부(Anatomy)
root(`radius.md`, `bg.surface`, `status.danger.default` 1px 테두리. 톤 바탕 · 왼쪽 띠는 쓰지 않는다) · head(circle-alert 아이콘 `status.danger.default` 16 + 제목 `type.label` 600 `fg.primary`) · list(항목 사이 `space.4`) · item(링크 `fg.link` 밑줄, "칸 이름 · 문장").
## Props
contract 표.
## Variants
없음.
## States
default · focus(요약 전체에 포커스 링).
## 동작
errors가 비면 아무것도 그리지 않는다. focusKey가 바뀌고(제출할 때마다) 오류가 있으면 요약으로 포커스를 옮기고 화면을 요약까지 올린다. 항목은 `href="#<칸 id>"` 링크이고, 누르면 그 칸으로 포커스를 옮기고 가운데로 스크롤한다(onSelect가 있으면 그것을 부른다). 항목 순서는 화면의 칸 순서. 칸을 고치면 그 항목은 사라지고, 모두 고치면 요약도 사라진다. useTrellisForm(`@terracelab/trellis-react/form`)의 `form.summary`를 그대로 넘기면 된다.
## 접근성
`role="alert"` + `tabIndex=-1`(포커스를 받으면 제목과 목록을 읽는다), 제목은 `aria-labelledby`로 잇는다. 항목은 링크라 Tab · Enter로 간다. 오류는 색만이 아니라 아이콘 · 글자로 보인다.
## 밀도
안쪽 여백 `space.12` × `density.card-padding`, 글자 `density.body-font-size`.
## 플랫폼 차이
네이티브는 같은 목록을 ScrollView 맨 위에 두고 항목을 누르면 그 칸으로 스크롤 · 포커스(Phase 3).
## 금지 사항
제출 전부터 보이기(칸을 처음 건드렸을 때 오류를 쏟아내지 않는다) · 항목을 링크가 아닌 글자로만 두기 · "오류가 발생했습니다" 같은 원인 없는 문장 · 느낌표.
## 스토리
Default · WithForm(useTrellisForm).
## 참고
content.md §5 오류 문구, docs/guides/forms.md.
