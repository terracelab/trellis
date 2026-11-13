# HeatCell

> `@terracelab/trellis-react/charts` · CSS `.tl-heat-cell` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { HeatCell } from '@terracelab/trellis-react/charts';
```

## 용도

행 × 열 표에서 어디가 진한지(에이징 · 요일 × 지사). 조건부 색 칸.

## 해부(Anatomy)

cell(배경 `chart.heat-1~5`, 0·null은 `chart.track`/빈 글자) · value(단계 1~3 fg.primary, 4~5 fg.inverse, tabular).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `value` | `number \| null` |  | 필수 | 값. null이면 빈 칸 |
| `max` | `number` |  | 필수 | 표 전체 최댓값 |
| `format` | `(v: number) => string` |  |  | 값 서식 |
| `unit` | `string` |  |  | 단위 |
| `align` | `'left' \| 'right' \| 'center'` | `"right"` |  | 글자 정렬 |
| `empty` | `string` | `"–"` |  | 빈 칸 글자 |

## Variants

단계 0~5.

## States

지원 상태: `default`

default.

## 동작

단계 = ceil(value / max × 5), 0은 빈 칸.

## 접근성

`title`에 값·단위. 글자 대비는 단계 규칙으로 ≥ 4.5:1.

## 밀도

패딩 `space.4`/`space.8`.

## 플랫폼 차이

없음.

## 금지 사항

서로 다른 표의 max 섞기 → 리뷰. 상태 색으로 크기 → 리뷰.

## 예시

### 에이징 표

표 전체 최댓값을 한 척도로

```tsx
import { HeatCell } from '@terracelab/trellis-react/charts';

function Aging() {
  const rows = [
    { name: '누리식품', aging: [3100, 1240, 480, 0] },
    { name: '한결물산', aging: [950, 1120, 1060, 560] },
    { name: '서진유통', aging: [210, 340, 425, 900] },
  ];
  const max = Math.max(...rows.flatMap((r) => r.aging));
  const heads = ['~30일', '31~60', '61~90', '90일+'];
  return (
    <table style={{ borderCollapse: 'collapse', fontVariantNumeric: 'var(--tl-font-numeric)' }}>
      <thead>
        <tr>
          <th scope="col" style={{ textAlign: 'left' }}>
            거래처
          </th>
          {heads.map((h) => (
            <th key={h} scope="col" style={{ textAlign: 'right', padding: '0 var(--tl-space-12)' }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name}>
            <th scope="row" style={{ textAlign: 'left', paddingRight: 'var(--tl-space-16)' }}>
              {r.name}
            </th>
            {r.aging.map((v, i) => (
              <td key={i} style={{ padding: 0 }}>
                <HeatCell value={v || null} max={max} unit="만" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```
