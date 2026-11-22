# DataBar

> `@terracelab/trellis-react/charts` · CSS `.tl-data-bar` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { DataBar } from '@terracelab/trellis-react/charts';
```

## 용도

표 칸 안에서 같은 열의 값 크기 비교(재고·수량). 차트를 따로 그리지 않아도 읽히게.

## 해부(Anatomy)

cell(`role="img"`) · track(`chart.track`) · fill(`color`, warnBelow 아래면 `status.danger`) · marker(기준선 `fg.primary` 1px) · value(`tabular` fg.primary, 오른쪽) · warn icon(`status.danger`).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `value` | `number` |  | 필수 | 값 |
| `max` | `number` |  | 필수 | 열 최댓값 |
| `width` | `number` | `64` |  | 막대 너비 |
| `marker` | `number` |  |  | 기준선 |
| `warnBelow` | `number` |  |  | 경고 경계 |
| `format` | `(v: number) => string` |  |  | 값 서식 |
| `unit` | `string` |  |  | 단위 |
| `color` | `ChartColor` | `"series-1"` |  | 막대 색 |
| `label` | `string` |  |  | 접근성 이름 |

## Variants

marker 유무 × 경고 유무.

## States

지원 상태: `default` · `error`

default · error(warnBelow 아래: danger 색 + 아이콘).

## 동작

없음.

## 접근성

`aria-label="{label} {value}{unit}, 최대 {max}"`.

## 밀도

막대 높이 8(compact)·10(comfortable) — `density.row-height`의 1/4.

## 플랫폼 차이

없음.

## 금지 사항

다른 열의 max와 섞기 → 리뷰.

## 예시

### 표 안

같은 열의 최댓값 기준, 기준선(marker) · 부족 경고

```tsx
import { DataBar } from '@terracelab/trellis-react/charts';

function InTable() {
  const rows = [
    { name: '쌀 20kg', stock: 184 },
    { name: '식용유 18L', stock: 96 },
    { name: '설탕 15kg', stock: 7 },
  ];
  const max = Math.max(...rows.map((r) => r.stock));
  return (
    <table style={{ borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th scope="col" style={{ textAlign: 'left', paddingRight: 'var(--tl-space-24)' }}>
            품목
          </th>
          <th scope="col" style={{ textAlign: 'left' }}>
            재고
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name}>
            <th scope="row" style={{ textAlign: 'left', fontWeight: 'var(--tl-font-weight-500)' }}>
              {r.name}
            </th>
            <td>
              <DataBar
                value={r.stock}
                max={max}
                marker={40}
                warnBelow={20}
                unit="개"
                label="재고"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```
