# DescriptionList
## 용도
상세 화면 · 서랍에서 한 건의 속성(거래처 · 사업자등록번호 · 결제 조건)을 라벨과 값의 쌍으로 보여 줄 때 쓴다. 입력은 FormSection + Field, 여러 건 비교는 표.
## 해부(Anatomy)
list(`<dl>`, 격자 columns열) · item(`<div>`) · label(`<dt>`, `type.label` `fg.tertiary`) · value(`<dd>`, `density.body-font-size` `fg.primary`) · copy(IconButton sm, copy → check).
## Props
contract 표.
## Variants
columns 1 · 2 · 3 × layout horizontal(라벨 열 120, compact · 140, comfortable) · vertical(라벨 위). 항목마다 span 1 · 2 · 3.
## States
default · hover · focus(복사 버튼).
## 동작
span은 columns를 넘지 않게 줄인다. copyable 항목의 복사 버튼을 누르면 copyText(없으면 글자 · 숫자 값)를 클립보드에 쓰고, 아이콘이 2초 동안 check로 바뀐다. 값이 없으면 "–"를 보인다. 좁은 화면(640 미만)에서는 1열이 된다.
## 접근성
`<dl>` · `<dt>` · `<dd>` 짝. 복사 버튼 이름은 "<라벨> 복사"이고, 복사하면 숨긴 상태 글자 "복사했습니다"를 읽는다. 키보드 Tab으로 복사 버튼에 닿고 Enter · Space로 누른다.
## 밀도
행 간격 `space.12`, 가로 배치 라벨 열 120(compact) · 140(comfortable).
## 플랫폼 차이
네이티브는 항상 1열 vertical에 가깝게 그리고 복사는 Clipboard API.
## 금지 사항
입력 칸을 값 자리에 넣기(FormSection) · 라벨에 콜론 · 금액을 왼쪽 정렬 문자열로 → 리뷰.
## 스토리
Horizontal · Vertical · Copyable · ThreeColumns.
## 참고
content.md §4 사업자등록번호 · 금액, Field(라벨 열 120).
