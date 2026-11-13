# ChartCard

> `@terracelab/trellis-react/charts` · CSS `.tl-chart-card` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { ChartCard } from '@terracelab/trellis-react/charts';
```

## 용도

차트 한 개를 담는 카드: 제목 · 부제(단위·기간·점선의 뜻) · 범례 · 우상단 액션 · 고정 높이의 차트 영역 · "표로 보기". 차트가 없는 숫자 블록에는 쓰지 않는다(StatCard). 여러 조각이 섞이는 복합 블록은 Card.

## 해부(Anatomy)

root(`bg.surface` · `border.default` · `radius.lg`) · head(title `type.h3` fg.primary, subtitle `type.caption` fg.secondary) · action · legend(Legend) · body(height 고정, 차트 또는 skeleton/error/empty/table) · toggle(표로 보기, ghost Button sm, `aria-pressed`).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `title` | `ReactNode` |  | 필수 | 블록 제목 |
| `subtitle` | `ReactNode` |  |  | 단위·기간·점선의 뜻 |
| `legend` | `LegendItem[]` |  |  | 범례. 계열이 2개 이상이면 항상 넘긴다 |
| `action` | `ReactNode` |  |  | 우상단 액션 |
| `height` | `number` | `240` |  | 차트 영역 높이(고정) |
| `loading` | `boolean` | `false` |  | 스켈레톤 |
| `refreshing` | `boolean` | `false` |  | 다시 불러오는 중(흐리게) |
| `error` | `string \| null` |  |  | 오류 메시지 |
| `empty` | `string \| null` |  |  | 빈 상태 메시지 |
| `onRetry` | `() => void` |  |  | 오류에서 다시 시도 |
| `table` | `ChartTable` |  |  | 표 대체 데이터 |
| `children` | `ReactNode` |  |  | 차트 1개 |

## Variants

variant 없음. 높이만 호출자가 정한다.

## States

지원 상태: `default` · `loading` · `error`

default · loading(skeleton `bg.sunken`, 높이 유지) · error(`status.danger.default` 아이콘 + 메시지 + 다시 시도). hover·active·focus는 toggle 버튼에만(Button 규칙). disabled 해당 없음.

## 동작

`table`이 있으면 toggle이 생기고 누르면 차트 자리에 `<table>`이 들어온다(같은 높이, 세로 스크롤). `refreshing`이면 차트 opacity `opacity.disabled`(0.5)로 두고 상호작용은 유지. `error`가 있으면 loading보다 우선.

## 접근성

root `<figure aria-labelledby=title>`(figure 기본 역할. role="group"은 figure에 허용되지 않는다). 표는 `<caption>`에 title, 숫자 열 `<th scope="col">`. toggle `aria-pressed`. 오류 메시지는 `role="status"`.

## 밀도

head 패딩 `density.card-padding`, toggle 높이 `density.control-height-sm`.

## 플랫폼 차이

네이티브는 toggle 대신 길게 누르면 표 시트. 나머지 동일.

## 금지 사항

차트만 넘기고 `table`을 비움(리뷰 — 숫자 확인 경로가 없어진다). 높이 미지정으로 로딩 때 레이아웃 점프 → 기본 240 강제.

## 예시

### 기본

제목 · 부제 · 범례 · 표로 보기

```tsx
import { formatCompactWon } from '@terracelab/trellis-contracts';
import { TrendChart, ChartCard } from '@terracelab/trellis-react/charts';

function Basic() {
  const data = [
    { month: '05월', sales: 1450, prev: 1301 },
    { month: '06월', sales: 1396, prev: 1288 },
    { month: '07월', sales: 1468, prev: 1320 },
    { month: '08월', sales: 1392, prev: 1298 },
    { month: '09월', sales: 1524, prev: 1362 },
    { month: '10월', sales: 1588, prev: 1410 },
  ].map((d) => ({ ...d, sales: d.sales * 1_000_000, prev: d.prev * 1_000_000 }));
  return (
    <ChartCard
      title="월별 매출"
      subtitle="원 · 최근 6개월 · 점선은 전년 같은 달"
      legend={[
        { label: '매출', color: 'series-1' },
        { label: '전년', color: 'compare', shape: 'dashed' },
      ]}
      height={220}
      table={{
        columns: ['월', '매출(원)', '전년(원)'],
        rows: data.map((d) => [d.month, d.sales, d.prev]),
      }}
    >
      <TrendChart
        data={data}
        x="month"
        series={[
          { key: 'sales', label: '매출', type: 'area' },
          { key: 'prev', label: '전년', dashed: true },
        ]}
        unit="원"
        height={220}
        yFormat={formatCompactWon}
        ariaLabel="최근 6개월 매출. 10월 15.9억, 전년 대비 12.6% 증가"
      />
    </ChartCard>
  );
}
```

### 상태

불러오는 중 · 오류 · 빈 상태. 높이를 지켜 레이아웃이 뛰지 않는다

```tsx
import { ChartCard } from '@terracelab/trellis-react/charts';

function States() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-16)' }}>
      <ChartCard title="불러오는 중" subtitle="스켈레톤" height={120} loading />
      <ChartCard
        title="오류"
        subtitle="메시지 + 다시 시도"
        height={120}
        error="매출 집계를 불러오지 못했습니다"
        onRetry={() => undefined}
      />
      <ChartCard
        title="빈 상태"
        subtitle="다음 행동 한 줄"
        height={120}
        empty="기간에 판매가 없습니다. 기간을 넓혀 보세요"
      />
    </div>
  );
}
```
