# RadialMeter
## 용도
목표·한도 대비 하나의 비율(달성률·재구매율)을 링으로 크게. 여러 줄이면 BulletBar 목록.
## 해부(Anatomy)
svg(`role="meter"`) · track(`chart.track`, 두께 지름의 9%) · arc(tone 색, round cap) · value(`type.amountLg` fg.primary + unit `type.caption`) · label(`type.caption` fg.secondary) · caption(`fg.tertiary`).
## Props
| 이름 | 타입 | 기본값 | 필수 | 설명 |
|---|---|---|---|---|
| value | number | — | ✓ | 현재 값 |
| max | number | 100 | | 최댓값 |
| label | string | — | ✓ | 지표 이름 |
| caption | string | — | | 보조 글자 |
| unit | string | '%' | | 단위 |
| size | 'sm' \| 'md' \| 'lg' | 'md' | | 지름 80·120·160 |
| tone | 'accent' \| 'success' \| 'warning' \| 'danger' | 'accent' | | 링 색 |
| digits | number | 0 | | 소수 |
## Variants
size 3 × tone 4. size는 컨트롤 높이가 아니라 지름이라 컨트롤 크기 `Size`(xs~xl)와 따로 `RadialMeterSize`(sm · md · lg) 타입을 쓴다.
## States
default.
## 동작
value > max면 가득 채우고 값은 그대로 표시.
## 접근성
`role="meter" aria-valuenow/min/max aria-label=label`.
## 밀도
없음(고정 지름).
## 플랫폼 차이
없음.
## 금지 사항
한 카드에 링 둘 이상 → 리뷰.
## 스토리
Default · Sizes · Tones.
## 참고
—
