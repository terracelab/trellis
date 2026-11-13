# Badge
## 용도
행 · 카드의 상태 하나를 짧은 글자로. 결재 5상태와 업종 어휘(입고 · 발행 · 설비 …)가 모두 이 문법을 쓴다.
## 해부(Anatomy)
root(반경 full, `type.caption` 600) · dot(톤의 default 색) · label(`fg.primary`). 상태 색 글자는 대비 4.5:1을 못 넘어 글자는 중립, 상태는 점 + 바탕으로 보인다. DataGrid 셀 안에서는 점이 있는 subtle 배지가 바탕 없이 점 + 글자로 줄어든다(줄마다 알약이 서면 열 전체가 색 띠가 된다).
## Props
contract 표.
## Variants
tone 5 · approval 5 × variant 3 × size 2.
## States
default(데이터 상태이지 상호작용 상태가 아니다).
## 동작
approval이 있으면 라벨이 없을 때 결재 라벨(기안 · 진행 · 승인 · 반려 · 회수)을 쓴다. 점은 상태를 말할 때만 보인다(PR-38): subtle · outline은 기본으로 점이 있고, tone이 neutral이면 기본 점이 없다(회색 점은 정보가 없다. 역할 · 기한 D-10 같은 글자는 글자만). 결재 상태(approval)는 늘 점이 있다. dot을 주면 그 값이 이긴다. 점은 두 가지 뜻에만 쓴다: 상태(StatusDot · Badge 점)와 범주 식별(범주 태그, PR-33). 모듈 · 역할을 점으로 보이지 않는다. solid는 `status.*.default` 바탕 + `status.*.on` 글자.
## 접근성
상태는 색 + 점 + 글자. 색만으로 구분하지 않는다.
## 밀도
md 20 · sm 16 높이.
## 플랫폼 차이
없음.
## 금지 사항
결재 색을 주문 · 신고 단계에 쓰기(어휘의 tone을 쓴다) · 문장을 배지에 넣기.
## 스토리
Tones · Approval · Solid.
## 참고
D-48 업종 어휘, content.md §6.
