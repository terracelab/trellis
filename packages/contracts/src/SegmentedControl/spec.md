# SegmentedControl
## 용도
같은 목록의 보기 · 범위를 2~5개 중 하나로 바꾼다(전체 · 진행 · 승인, 일 · 주 · 월). 화면 내용이 통째로 바뀌면 Tabs, 폼 값이면 RadioGroup.
## 해부(Anatomy)
root(`bg.sunken`, `radius.md`, 안쪽 여백 2) · segment(`radius.sm`, `type.label`, `fg.secondary`) · icon(16) · count(`font.numeric`, `fg.tertiary`).
선택된 segment는 `bg.surface` + `shadow.sm` + `fg.primary` 600.
## Props
contract 표.
## Variants
size sm · md(`density.control-height-sm/md`), fullWidth(칸 같은 폭), icon · count 유무.
## States
default · hover(segment `fg.primary`) · focus(segment 링) · disabled(전체 `fg.disabled`). active · loading · error는 해당 없음.
## 동작
누르면 바로 바뀐다. Tab으로 들어오면 선택된 칸에 포커스, 화살표 키로 옮기면서 고른다. 하나는 항상 선택되어 있다(defaultValue가 없으면 첫 칸). count는 99를 넘으면 99+.
## 접근성
Base UI RadioGroup으로 `role="radiogroup"` + 각 칸 `role="radio"`. 칸 이름은 라벨 + 건수(진행 12건, "건"은 화면에 숨긴 글자). Field 안이면 Field 라벨이, 밖이면 label prop이 그룹 이름. 포커스 링은 칸에 항상 보인다.
## 밀도
높이 `density.control-height-sm/md`, 칸 좌우 여백 `space.12`(sm `space.8`).
## 플랫폼 차이
네이티브는 같은 모양의 Pressable 줄, 화살표 키 없음.
## 금지 사항
5개 넘는 칸(Select · Tabs) · 칸마다 다른 동작 실행(버튼 묶음) · 라벨 없이 아이콘만 → 리뷰.
## 스토리
Default · Count · Icon · FullWidth · Sizes · Disabled.
## 참고
Base UI Radio Group. 상태 필터의 건수 문법은 D-35 카운트 배지와 같다.
