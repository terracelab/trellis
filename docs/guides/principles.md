# 원칙과 규칙

## 디자인 원칙

둘이 충돌하면 위에 있는 원칙을 따릅니다.

1. **밀도 우선.** compact가 기본이고 comfortable은 옵션입니다.
2. **상태가 먼저 보인다.** 카운트 배지 · 상태색 · 결재 단계는 모든 모듈에서 같은 모양입니다.
3. **한국 업무 관습.** 수입 빨강 · 지출 파랑, 결재 어휘 5개, 금액은 원 단위 · 천 단위 구분 · 우측 정렬입니다.
4. **토큰 밖의 값은 없다.**
5. **플랫폼 간 API는 같고 구현만 다르다.**
6. **접근성은 기본값.** 텍스트 대비 4.5:1 이상, 키보드로 모든 조작, 포커스 링 항상 표시, reduced-motion 준수입니다.

## 앱 코드에서 지키는 규칙

| 규칙 | 이렇게 | 이렇게 하지 않는다 |
| --- | --- | --- |
| 값은 토큰에서 | `var(--tl-color-bg-surface)` · `tokens.space[16]` | `#FFFFFF` · `16px` · `font-family: 'Pretendard'` |
| semantic만 | `--tl-color-brand-default` | `--tl-color-brand-500`(primitive) |
| 없는 부품은 요청 | Trellis 이슈로 컴포넌트 요청 | 비슷한 컴포넌트를 앱에서 새로 만듦 |
| props는 문서 그대로 | `onPress` · `onChange` · `onOpenChange` | 내부 클래스를 `className`으로 덮어씀 |
| 차트 색은 슬롯 | `color="series-2"` | `color="#1F9D55"` |

## 고정 어휘

**상태 7**

`default` · `hover` · `active` · `focus` · `disabled` · `loading` · `error`

**결재 5**

| 키 | 라벨 | 색 토큰 |
| --- | --- | --- |
| `draft` | 기안 | `--tl-color-approval-draft-default` |
| `pending` | 진행 | `--tl-color-approval-pending-default` |
| `approved` | 승인 | `--tl-color-approval-approved-default` |
| `rejected` | 반려 | `--tl-color-approval-rejected-default` |
| `withdrawn` | 회수 | `--tl-color-approval-withdrawn-default` |

**금융 색**

수입 `--tl-color-finance-income`(빨강) · 지출 `--tl-color-finance-expense`(파랑) · 변동 없음 `--tl-color-finance-neutral`. 서양식(증가 초록 · 감소 빨강)으로 뒤집지 않습니다.

## 이름 규칙

| 대상 | 규칙 | 예 |
| --- | --- | --- |
| 토큰 | 점 경로 → CSS `--tl-` + 케밥 | `color.bg.surface` → `--tl-color-bg-surface` |
| 패키지 | `@terracelab/trellis-<pkg>` | `@terracelab/trellis-react` |
| CSS 클래스 | `tl-` + 컴포넌트 케밥, 변형은 `data-*` | `<div class="tl-chart-card" data-state="loading">` |

## 숫자

```ts
import { formatAmount, formatCompactWon, formatPercent } from '@terracelab/trellis-contracts';
formatAmount(-1234); // "−1,234"(U+2212)
formatCompactWon(874_479_500); // "8.7억"
formatPercent(12.34); // "12.3%"
```

금액 칸은 우측 정렬 · `font-variant-numeric: var(--tl-font-numeric)`(tabular).
