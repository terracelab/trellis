# ActionBar
## 용도
폼 · 상세 화면 아래의 저장 · 취소 같은 마무리 동작을 한 줄로 묶는다. 표 위의 일괄 동작은 FilterBar의 actions나 DataGrid 툴바.
## 해부(Anatomy)
root(`tl-action-bar`) · summary(왼쪽, `type.label` `fg.secondary`) · actions(오른쪽, 버튼 사이 `space.8`). sticky이면 위 `border.divider` + `bg.surface`, 그림자 없음.
## Props
contract 표.
## Variants
align end · between × sticky 유무. align을 생략하면 summary가 있을 때 between, 없을 때 end.
## States
default. 상태는 안의 버튼이 가진다. 나머지는 해당 없음.
## 동작
순서 규칙은 저장 우하단 · 취소 그 왼쪽이다. 주 동작(primary)은 하나이고 맨 오른쪽에 둔다. primary 버튼이 맨 끝이 아니면 개발 모드에서 경고한다. sticky는 스크롤 영역의 아래에 붙어 내용이 길어도 보인다. sticky면 화면 아래에 붙어 있는 동안 토스트가 이 줄 위에 뜬다(Toast 동작 참고). sticky는 아래 여백에 `env(safe-area-inset-bottom)`을 더해 홈 표시줄이 있는 휴대폰에서 버튼이 가려지지 않는다.
## 접근성
`role="group"`. 버튼 라벨이 결과를 말한다(저장 · 결재 요청 · 반려). Tab 순서는 화면 순서와 같다.
## 밀도
위아래 여백 `space.12`, 좌우(sticky) `density.card-padding`. sticky 아래 여백은 `space.12` + 안전 영역.
## 플랫폼 차이
네이티브는 화면 아래 고정이 기본이고 버튼이 폭을 나눈다(주 동작 오른쪽). props는 같다.
## 금지 사항
primary 두 개 · 취소를 저장 오른쪽에 · 위로 그림자 · 버튼 네 개 넘김(Menu로) — 리뷰(components.md §10 FormRegister).
## 스토리
Default · WithSummary · Sticky.
## 참고
components.md §10 FormRegister.
