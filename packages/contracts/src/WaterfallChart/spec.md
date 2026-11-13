# WaterfallChart
## 용도
시작값에서 더하고 빼서 끝값에 이르는 과정(예산 → 집행 → 잔액, 기본가 → 할인 → 견적가). 단순 비교는 BarList.
## 해부(Anatomy)
root · axis · bars(start/total `series-1`, delta는 polarity: updown이면 증가 `income`(빨강) · 감소 `expense`(파랑), neutral이면 모두 `series-1` 옅게) · connectors(`border.strong` 점선) · captions(`fg.tertiary`) · reference line(`chart.axis` 점선 + 라벨) · tooltip.
## Props
| 이름 | 타입 | 기본값 | 필수 | 설명 |
|---|---|---|---|---|
| steps | WaterfallStep[] | — | ✓ | 단계 |
| unit | string | — | | 단위 |
| height | number | 220 | | 높이 |
| format | (v: number) => string | formatAmount | | 서식 |
| polarity | 'updown' \| 'neutral' | 'updown' | | 증감 색 |
| reference | { value; label } | — | | 기준선 |
| ariaLabel | string | — | ✓ | 한 문장 설명 |
## Variants
polarity 2 × reference 유무.
## States
default · hover(툴팁: 단계 · 값 · 누계).
## 동작
누계는 컴포넌트가 계산한다(start → delta 누적 → total은 누계로 그림). total 값이 누계와 다르면 개발 모드 경고.
## 접근성
`charts/README.md`. 색만으로 증감을 알리지 않도록 툴팁·표에 부호(+/−).
## 밀도
단계 라벨 2~4자, 6단계를 넘으면 가로 스크롤 대신 묶기 권장.
## 플랫폼 차이
없음.
## 금지 사항
서양식 반전(증가 초록·감소 빨강) → 리뷰(금융 색 고정).
## 스토리
Default(updown) · Neutral(가격 구성) · WithReference · Density.
## 참고
—
