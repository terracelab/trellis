# AmountBreakdown

> `@terracelab/trellis-react` · CSS `.tl-amount-breakdown` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { AmountBreakdown } from '@terracelab/trellis-react';
```

## 용도

"항목 + 항목 − 항목 = 합계"처럼 금액이 어떻게 나왔는지 줄 단위로 보여 줄 때 쓴다(실지급액 · 공급가액 · 세액 · 합계 · 정산 금액). 입력 폼 옆에서 고치는 값이 결과에 어떻게 들어가는지 보일 때도 쓴다. 금액 표 여러 줄은 DataGrid, 단계별 막대 그림은 WaterfallChart, 숫자 하나는 KpiCard.

## 해부(Anatomy)

root(`bg.surface`) · head(제목 `type.label` 600 `fg.primary` · 단위 "단위 원" `type.caption` `fg.tertiary` · 상태) · row(기호 칸 · 라벨 · 근거 · 금액, 줄 사이 `space.4`) · op(+ · − · =, `fg.tertiary`, 고정폭 칸) · label(`density.body-font-size` `fg.primary`) · hint(`type.caption` `fg.tertiary`) · amount(오른쪽 정렬, tabular, `fg.strong`) · total(위 선 `border.default` 1px, 라벨 600 · 금액 `type.amount-lg`) · status(계산 중 Spinner · "14:32 기준" · 오류 아이콘 `status.danger.default` + 다시 계산).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `rows` | `{ key: string; label: string; value: number; op?: '+' \| '−' \| '='; hint?: string }[]` |  | 필수 | 줄 목록(위에서 아래로 계산 순서) |
| `title` | `string` |  |  | 제목 |
| `unit` | `string` |  |  | 금액 단위(머리에 한 번) |
| `activeKey` | `string` |  |  | 바탕을 올릴 줄 key |
| `loading` | `boolean` | `false` |  | 금액 자리 Skeleton |
| `status` | `'idle' \| 'calculating' \| 'updated' \| 'error'` | `"idle"` |  | 계산 상태 |
| `updatedAt` | `string` |  |  | updated 기준 시각 글자 |
| `onRecalculate` | `() => void` |  |  | 다시 계산(status = error) |

## Variants

title · unit · status의 유무로 머리가 바뀐다. 셋 다 없으면 머리를 그리지 않는다. op '='인 줄이 합계 줄이다. activeKey 줄은 바탕이 `brand.tint`로 한 단계 올라간다(왼쪽 띠는 쓰지 않는다, D-57).

## States

지원 상태: `default` · `loading` · `error`

default · loading(금액 자리마다 Skeleton, 라벨은 그대로, `aria-busy`) · error(status error: 머리에 "계산하지 못했습니다" + 다시 계산 단추, `data-state="error"`). calculating은 머리의 Spinner + "계산 중"이고 금액은 지난 값을 그대로 둔다. hover · active · focus · disabled는 해당 없음(다시 계산 단추는 Button 상태를 따른다).

## 동작

금액은 `formatAmount`로만 쓴다(천 단위, 음수 U+2212). 빼는 줄은 value를 크기(양수)로 넘기고 op '−'로 뺀다. 첫 줄은 기호를 비운다. 단위는 칸마다 붙이지 않고 머리에 한 번 "단위 원"으로 쓴다(원칙 3). 합계 줄의 값과 앞 줄을 더하고 뺀 값이 다르면 개발 모드에서 경고한다. status updated는 updatedAt을 "{시각} 기준"으로 보인다. 다시 계산 단추는 onRecalculate가 있을 때만 생긴다.

## 접근성

root는 `role="group"`, 이름은 title(없으면 "금액 계산"). 줄은 `dl`(라벨 = `dt`, 금액 = `dd`). 기호 글자는 꾸밈(aria-hidden)이고 숨은 글자 "더하기 · 빼기 · 계산 결과"가 대신 읽힌다. 상태 글자는 `aria-live="polite"`라 계산 중 · 기준 시각 · 오류가 바뀌면 읽힌다. 금액 대비는 `fg.strong` · `fg.primary`로 4.5:1 이상.

## 밀도

줄 높이는 글줄 높이 + `space.4` 위아래. 글자는 `density.body-font-size`를 따른다. 합계 금액은 `type.amount-lg`로 밀도와 관계없다. 휴대폰에서도 한 줄(라벨 왼쪽 · 금액 오른쪽)이고 근거는 라벨 아래로 내려간다.

## 플랫폼 차이

네이티브는 같은 줄 구성을 View 행으로 그리고 기호 숨은 글자는 accessibilityLabel로 붙인다.

## 금지 사항

금액 칸마다 "원" 붙이기 · 빼기를 음수 값과 '−' 기호로 두 번 빼기 · 합계 줄을 색 바탕 띠로 강조 · 활성 줄에 왼쪽 띠(D-57) · 문자열 템플릿으로 쉼표 찍기 → 리뷰.

## 예시

### 실지급액

지급 합계에서 공제 합계를 빼면 실지급액. 단위는 머리에 한 번

```tsx
import { AmountBreakdown } from '@terracelab/trellis-react';

function Payroll() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <AmountBreakdown
        title="11월 실지급액"
        unit="원"
        status="updated"
        updatedAt="14:32"
        rows={[
          { key: 'base', label: '기본급', value: 3200000 },
          { key: 'overtime', label: '연장근로수당', value: 184600, op: '+', hint: '8시간 × 1.5배' },
          { key: 'meal', label: '식대', value: 200000, op: '+', hint: '비과세' },
          { key: 'deduction', label: '공제 합계', value: 412380, op: '−' },
          { key: 'net', label: '실지급액', value: 3172220, op: '=' },
        ]}
      />
    </div>
  );
}
```

### 세금계산서와 활성 줄

고치는 칸과 이어진 줄은 바탕이 한 단계 올라간다

```tsx
import { AmountBreakdown } from '@terracelab/trellis-react';

function TaxInvoice() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <AmountBreakdown
        title="세금계산서 금액"
        unit="원"
        activeKey="supply"
        rows={[
          { key: 'supply', label: '공급가액', value: 12480000 },
          { key: 'tax', label: '세액', value: 1248000, op: '+', hint: '공급가액의 10%' },
          { key: 'total', label: '합계', value: 13728000, op: '=' },
        ]}
      />
    </div>
  );
}
```

### 상태

불러오는 중은 금액 자리 Skeleton, 계산 중은 지난 값을 둔다. 오류면 다시 계산

```tsx
import { AmountBreakdown } from '@terracelab/trellis-react';

function States() {
  const rows = [
    { key: 'sales', label: '매출', value: 48200000 },
    { key: 'fee', label: '판매 수수료', value: 5302000, op: '−' as const, hint: '11%' },
    { key: 'settle', label: '정산 예정 금액', value: 42898000, op: '=' as const },
  ];
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(min(100%, calc(var(--tl-space-64) * 4)), 1fr))',
        gap: 'var(--tl-space-24)',
      }}
    >
      <AmountBreakdown title="불러오는 중" unit="원" rows={rows} loading />
      <AmountBreakdown title="계산 중" unit="원" rows={rows} status="calculating" />
      <AmountBreakdown title="오류" unit="원" rows={rows} status="error" onRecalculate={() => {}} />
    </div>
  );
}
```
