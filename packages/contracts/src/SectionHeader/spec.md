# SectionHeader
## 용도
카드 묶음 · 표 위에 구역 제목을 둘 때 쓴다(이번 달 기한 · 구성원 · 참고 자료). 화면 이름은 PageHeader, 카드 한 장의 제목은 Card title이다. 카드 밖 구역 제목은 이것 하나로 한다(앱마다 작은 라벨 · 중간 제목을 따로 짜지 않는다).
## 해부(Anatomy)
root(grid, 간격 `space.12`) · head(flex, 아래 맞춤) · title(`type.h2` `fg.strong`) · count(제목 뒤 `space.8`, `fg.tertiary` 500, tabular. 알약 · 배지가 아니라 글자) · description(`type.label` `fg.secondary`) · action(오른쪽, 단추 하나) · body(children이 있을 때).
## Props
contract 표.
## Variants
children 유무(묶음을 감쌀 때 · 제목만). count(숫자 → "12건") · countLabel(단위가 건이 아닐 때 "8명").
## States
default.
## 동작
children을 주면 그 묶음을 감싸고 안 카드의 제목 단계를 한 단계 내린다(SectionHeader h2 → 안 Card h3). 제목 단계는 headingLevel(2 · 3 · 4), 없으면 문맥(화면 바로 아래 h2). 크기는 단계와 관계없이 `type.h2`다(화면 h1 28 > 구역 제목 > 카드 제목 `type.h3`).
## 접근성
제목은 제목 요소(h2 기본). 건수는 제목 안 글자라 "이번 달 기한 12건"으로 함께 읽는다. 랜드마크를 만들지 않는다(같은 이름 구역이 겹치지 않게).
## 밀도
밀도와 관계없이 같다. 머리와 내용 사이 `space.12`.
## 플랫폼 차이
없음.
## 금지 사항
구역 제목을 Card 안 큰 제목 · 카드 밖 작은 라벨 · 색 글자로 섞어 쓰기 · 건수를 알약 · 색 배지로 · 동작 둘 이상(→ 더 보기는 화면으로) · 제목 앞 색 막대.
## 스토리
Default(VRT) · Plain.
## 참고
서비스 점검 R-43 7번(구역 제목 세 방식 혼용), PR-38. 내용이 적은 화면 지침은 platform.md §7.3.
