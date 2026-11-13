# Citation
## 용도
답변이 근거로 삼은 문서를 번호 · 문서 이름 · 쪽으로 보여 주고 열 때 쓴다. 답변 아래 출처 목록(list)과 글 안 번호 표시(inline) 두 모양이다. 첨부 파일 받기는 Attachment, 문서 사이 이동 링크는 글 안 링크(RichText).
## 해부(Anatomy)
list: root(`tl-citation`, `data-layout="list"`) · label(목록 이름 "출처", `type.caption` 500 `fg.secondary`) · list(`ol`, 감싸는 줄, 사이 `space.6` × `space.8`) · chip(`bg.surface` · `border.default` 1px 전체 · `radius.md`, 높이 `density.control-height-sm`, `type.caption`) · index(번호 상자 `bg.sunken` · `fg.secondary` 600 tabular · `radius.xs`) · title(문서 이름, 넘치면 말줄임) · location(쪽 · 절, `fg.secondary`) · external(새 창 아이콘 `fg.tertiary`, href만 있을 때).
inline: root(`span`, `data-layout="inline"`, 글줄 위쪽 맞춤) · marker(번호 상자 16, `type.micro` 600 · `bg.sunken` · `fg.secondary` · `radius.xs`) + Tooltip(문서 이름 · 쪽).
## Props
contract 표.
## Variants
layout list · inline. 색은 중립이다(출처는 상태가 아니다).

| layout | 모양 | 놓는 곳 |
|---|---|---|
| list | 번호 · 문서 이름 · 쪽 칩을 감싸는 줄로 | 답변 아래 · ProposalCard 근거 자리 |
| inline | 문장 끝 작은 번호 상자 | 답변 글 안(RichText가 `[1]`을 바꾼다) |
## States
default · hover(칩 `border.strong` + `bg.sunken`, 번호 `brand.subtle` + `fg.primary`) · focus(포커스 링). 여는 방법(href · onOpen)이 없는 출처는 글자일 뿐 상태가 없다. active · disabled · loading · error는 해당 없음.
## 동작
- 번호: `index`가 있으면 그 번호, 없으면 목록 순서(1부터, contracts `citationIndex`). 본문의 `[n]`과 목록 번호가 같아야 하므로 걸러 낸 목록에는 index를 준다.
- 열기: `onOpen`이 있으면 앱이 연다(href가 있으면 링크로 남겨 가운데 단추 · 새 탭은 그대로). onOpen 없이 href만 있으면 새 창 링크(`rel="noopener noreferrer"`), 둘 다 없으면 누를 수 없는 글자다.
- inline: 마우스를 올리거나 포커스하면 Tooltip이 문서 이름 · 쪽을 보인다.

| 키 | 동작 |
| --- | --- |
| Tab | 칩 · 번호 표시를 차례로 |
| Enter | 열기(링크 · 단추) |
| Space | 열기(onOpen만 있는 단추) |
## 접근성
list는 `ol` + 목록 이름(label, `aria-labelledby`)이라 "출처, 목록 3개"로 읽힌다. 칩 글자(번호 · 문서 이름 · 쪽)가 링크 · 단추 이름이다. inline 번호는 글자가 숫자 하나라 접근성 이름을 "출처 1 · 2026 취업규칙 · 제32조"로 준다(누를 수 없으면 숨은 글자). 새 창 아이콘은 꾸밈이다. 글자 대비는 `bg.sunken` · `bg.surface` 위 `fg.secondary` · `fg.primary`로 4.5:1 이상, 포커스 링은 항상 보인다.
## 밀도
칩 높이 `density.control-height-sm`(touch 44). 글자 크기 · 번호 상자는 밀도와 관계없다.
## 플랫폼 차이
네이티브는 칩을 Pressable 줄로 그리고 링크는 OS 브라우저로 연다. inline 번호의 Tooltip 대신 누르면 문서 이름 시트를 연다. props는 같다.
## 금지 사항
출처를 상태 색으로 칠하기 · 칩 왼쪽 색 띠(D-57) · 번호 없이 문서 이름만 · 본문 번호와 목록 번호가 다른 목록. 리뷰로 막는다.
## 스토리
List · Inline · OpenInApp.
## 참고
patterns/ConversationalWork, RichText(`citations`), MessageThread(answer), ProposalCard.
