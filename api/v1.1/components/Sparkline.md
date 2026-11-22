# Sparkline

> `@terracelab/trellis-react/charts` · CSS `.tl-sparkline` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { Sparkline } from '@terracelab/trellis-react/charts';
```

## 용도

숫자 타일 안의 작은 추이선. 축·값·범례 없음 — 모양만. 값을 읽어야 하면 TrendChart.

## 해부(Anatomy)

svg(`role="img"`) · area(옅은 영역, 선 색 opacity 0.12) · line(1.5px `color`) · end dot(r 2.5).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `data` | `number[]` |  | 필수 | 값만. 축·라벨 없음 — 모양만 보여 준다 |
| `width` | `number` | `112` |  | 너비 |
| `height` | `number` | `32` |  | 높이 |
| `area` | `boolean` | `true` |  | 선 아래 옅은 영역 |
| `color` | `ChartColor` | `"series-1"` |  | 선 색 |
| `ariaLabel` | `string` |  | 필수 | 차트를 한 문장으로(무엇을, 어느 기간, 어디서 어디로). role="img"의 이름 |

## Variants

area 유무.

## States

지원 상태: `default`

default. 나머지 해당 없음(툴팁 없음).

## 동작

값이 2개 미만이면 평평한 선. 자체 SVG(Recharts 없음).

## 접근성

`ariaLabel`에 시작→끝 값을 넣는다.

## 밀도

타일 footer에서 width 140 · height 24 권장.

## 플랫폼 차이

없음.

## 금지 사항

스탯 타일 장식용 남발(값 없는 추이) → 리뷰.

## 예시

### 숫자 카드 안

축·값 없이 모양만

```tsx
import { Sparkline } from '@terracelab/trellis-react/charts';

function InStat() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--tl-space-16)',
        color: 'var(--tl-color-fg-primary)',
      }}
    >
      <strong style={{ fontSize: 'var(--tl-type-amount-lg-font-size)' }}>14.4%</strong>
      <Sparkline
        data={[12.4, 13.1, 11.2, 10.9, 12.8, 13.0, 13.6, 14.4]}
        width={140}
        height={28}
        ariaLabel="영업이익률 최근 8개월 12.4%에서 14.4%로"
      />
    </div>
  );
}
```
