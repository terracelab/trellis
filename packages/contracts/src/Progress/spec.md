# Progress
## 용도
끝을 아는 작업의 진행(엑셀 업로드 · 월 마감 체크리스트 · 배치 처리)을 막대로 보여 줄 때 쓴다. 목표 · 한도 대비 값은 BulletBar, 1초 안에 끝나는 동작은 Spinner.
## 해부(Anatomy)
root(격자 2열) · label(`type.label` `fg.secondary`) · value(`type.label` 600 `fg.primary`, tabular) · track(`chart.track`, radius full, md `space.8` · sm `space.4`) · indicator(기본 `brand.default`, tone이 있으면 `status.*.default`, neutral은 `fg.tertiary`).
## Props
contract 표.
## Variants
size md · sm × tone(없음 = brand, 5톤).
## States
default. value가 null이면 끝을 모르는 진행으로 막대가 오간다.
## 동작
값 글자는 unit이 없으면 `formatPercent(값 / 최댓값 × 100, 0)`(62%), 있으면 `formatAmount(값) / formatAmount(최댓값) + 단위`(124 / 200건)다. 값은 0과 max 사이로 자른다. 막대 폭 변화는 `duration.300`으로 움직인다.
## 접근성
Base UI Progress(`role="progressbar"`, `aria-valuenow/min/max`), 이름은 label, `aria-valuetext`는 보이는 값 글자와 같다. `prefers-reduced-motion`이면 폭 전환과 오가는 막대를 멈춘다.
## 밀도
막대 굵기는 밀도와 무관하다.
## 플랫폼 차이
네이티브는 View 폭 애니메이션, 접근성 값은 accessibilityValue.
## 금지 사항
목표 대비 달성률에 쓰기(BulletBar) · 상태 색을 장식으로 쓰기 · 진행이 멈춘 작업을 계속 오가게 두기 → 리뷰.
## 스토리
Default · Units · Tones · Indeterminate.
## 참고
Base UI Progress, BulletBar.
