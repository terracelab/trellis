# Delta
## 용도
비교 대상과 견준 증감 하나를 부호 · 화살표 · 색으로 보여 줄 때 쓴다(전월 대비 +12.4% · 전일 대비 +4건). KpiCard의 증감 줄이 이것이고, 표 칸(DataGrid render) · Card · 서랍 머리에도 그대로 넣는다. 추이는 Sparkline, 목표 대비는 BulletBar · RadialMeter.
## 해부(Anatomy)
root(`span`, 글줄 안에 놓인다) · label(비교 대상, `fg.tertiary`) · value(방향 아이콘 + 증감 글자, `font.weight.600`, tabular) · icon(trending-up · trending-down · minus 16) · 숨은 글자(up-good · up-bad의 개선 · 악화).
## Props
contract 표.
## Variants
polarity 3 × 방향 3 × size 2. 색은 방향만 말한다.

| polarity | 증가 | 감소 | 0 |
|---|---|---|---|
| finance(기본) | 글자 · 아이콘 `finance.income`(빨강) | 글자 · 아이콘 `finance.expense`(파랑) | `finance.neutral` |
| up-good | 아이콘 `status.success.default`, 글자 `fg.secondary` | 아이콘 `status.danger.default`, 글자 `fg.secondary` | 아이콘 `fg.tertiary` |
| up-bad | 아이콘 `status.danger.default`, 글자 `fg.secondary` | 아이콘 `status.success.default`, 글자 `fg.secondary` | 아이콘 `fg.tertiary` |

size sm = `type.caption`(카드 · 표 칸 보조), md = `density.body-font-size`.
## States
default만. 누르는 부품이 아니다. hover · active · focus · disabled · loading · error는 해당 없음(불러오는 중은 부모가 Skeleton을 그린다).
## 동작
글자는 contracts `formatDelta(value, format, { unit, digits })`로만 만든다. 부호는 항상 붙인다(+ · U+2212 −). percent는 상대 변화(+12.4%), point는 비율끼리의 차이(+0.3%p: 불량률 · 점유율 · 이익률), amount는 원(+12,400,000원), number는 unit을 붙인다(+4건). 방향은 보이는 자릿수로 반올림한 값으로 정한다(`deltaDirection`). 0.04%는 0.0%이고 부호 · 화살표 없이 minus 아이콘이다. 비교 대상은 값 앞에 둔다(content.md §4 "전월 대비 +12.4%").
## 접근성
방향은 색만이 아니라 부호와 화살표 모양으로도 보인다. 아이콘은 꾸밈(aria-hidden)이고, 부호가 읽힌다. up-good · up-bad는 좋고 나쁨을 색으로 말하므로 숨은 글자 "개선 · 악화"를 덧붙인다. finance는 방향만 말하므로 덧붙이지 않는다. 글자 대비는 `finance.*` · `fg.secondary`가 4.5:1을 넘는다.
## 밀도
치수가 밀도와 관계없다. size md는 `density.body-font-size`를 따르고 sm은 caption 고정이다.
## 플랫폼 차이
네이티브는 같은 서식 함수와 같은 색 토큰으로 Text 둘과 아이콘 하나를 그린다.
## 금지 사항
증가 초록 · 감소 빨강(서양식) · 부호 없이 색만 · 문자열 템플릿으로 +와 쉼표 찍기 · 비율 차이에 %(→ point) → 리뷰.
## 스토리
Finance · Polarity · InTable · States.
## 참고
content.md §4(증감 · 색은 방향만), 원칙 3(수입 빨강 · 지출 파랑), KpiCard, components.md §11 숫자.
