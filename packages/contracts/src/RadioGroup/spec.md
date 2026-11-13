# RadioGroup
## 용도
2~5개 선택지 중 하나를 고른다(과세 구분 · 결제 조건). 선택지가 많으면 Select, 보기 전환은 SegmentedControl. 예외: LineItemsEditor · DataGrid 칸처럼 줄 안의 칸에서는 선택지가 2~5개라도 Select를 쓴다(줄 높이 안에 라디오 묶음이 들어가지 않는다).
## 해부(Anatomy)
root(radiogroup) · option · radio(16 원, `fg.tertiary` 테두리, `bg.surface`) · dot(선택 시 radio가 `brand.default` 바탕 + `fg.inverse` 점) · label(`density.body-font-size`) · description(`type.caption`, `fg.tertiary`).
## Props
contract 표.
## Variants
orientation vertical(설명이 있을 때) · horizontal(짧은 라벨 3개 이하).
## States
default · hover(radio `border.focus`) · focus(radio 링) · disabled(전체 또는 선택지 하나, `fg.disabled`) · error(Field 오류면 radio 테두리 `status.danger.default`). active · loading은 해당 없음.
## 동작
Base UI RadioGroup. Tab으로 그룹에 들어오면 선택된 항목(없으면 첫 항목)에 포커스, 화살표 키로 옮기면서 바로 고른다. 라벨을 눌러도 고른다. value를 주면 제어, defaultValue면 비제어.
## 접근성
`role="radiogroup"` + 각 `role="radio"`. Field 안이면 Field 라벨이 `aria-labelledby`로 그룹 이름이 되고, 밖이면 label prop이 `aria-label`이 된다. 선택지 설명은 radio의 `aria-describedby`. radio 테두리 `fg.tertiary`는 바탕 대비 3:1 이상. 포커스 링은 radio에 항상 보인다.
## 밀도
radio 16 고정. vertical 항목 사이 `space.8`, horizontal 항목 사이 `space.16`.
## 플랫폼 차이
네이티브는 Pressable 목록, 화살표 키 대신 각 항목을 누른다.
## 금지 사항
선택지 하나짜리 RadioGroup(Checkbox) · 6개 넘는 선택지(Select) · 그룹 이름 없음 → 리뷰.
## 스토리
Vertical · Horizontal · Description · Error · Disabled.
## 참고
Base UI Radio Group.
