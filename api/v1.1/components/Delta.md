# Delta

> `@terracelab/trellis-react` · CSS `.tl-delta` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { Delta } from '@terracelab/trellis-react';
```

## 용도

비교 대상과 견준 증감 하나를 부호 · 화살표 · 색으로 보여 줄 때 쓴다(전월 대비 +12.4% · 전일 대비 +4건). KpiCard의 증감 줄이 이것이고, 표 칸(DataGrid render) · Card · 서랍 머리에도 그대로 넣는다. 추이는 Sparkline, 목표 대비는 BulletBar · RadialMeter.

## 해부(Anatomy)

root(`span`, 글줄 안에 놓인다) · label(비교 대상, `fg.tertiary`) · value(방향 아이콘 + 증감 글자, `font.weight.600`, tabular) · icon(trending-up · trending-down · minus 16) · 숨은 글자(up-good · up-bad의 개선 · 악화).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `value` | `number` |  | 필수 | 증감 값(+ 증가 · − 감소) |
| `format` | `'percent' \| 'point' \| 'amount' \| 'number'` | `"percent"` |  | 서식(percent 12.4% · point 0.3%p · amount 원 · number 단위) |
| `polarity` | `'finance' \| 'up-good' \| 'up-bad'` | `"finance"` |  | 색의 뜻(finance = 증가 빨강 · 감소 파랑) |
| `label` | `string` |  |  | 비교 대상(전월 대비) |
| `unit` | `string` |  |  | number 서식의 단위(건 · EA) |
| `digits` | `number` |  |  | 소수 자릿수(percent · point 1, 그 밖 0) |
| `size` | `'sm' \| 'md'` | `"md"` |  | 글자 크기(sm caption · md 본문) |

## Variants

polarity 3 × 방향 3 × size 2. 색은 방향만 말한다.

| polarity | 증가 | 감소 | 0 |
|---|---|---|---|
| finance(기본) | 글자 · 아이콘 `finance.income`(빨강) | 글자 · 아이콘 `finance.expense`(파랑) | `finance.neutral` |
| up-good | 아이콘 `status.success.default`, 글자 `fg.secondary` | 아이콘 `status.danger.default`, 글자 `fg.secondary` | 아이콘 `fg.tertiary` |
| up-bad | 아이콘 `status.danger.default`, 글자 `fg.secondary` | 아이콘 `status.success.default`, 글자 `fg.secondary` | 아이콘 `fg.tertiary` |

size sm = `type.caption`(카드 · 표 칸 보조), md = `density.body-font-size`.

## States

지원 상태: `default`

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

## 예시

### 한국 관습

증가는 빨강, 감소는 파랑. 부호와 화살표가 늘 함께 보인다

```tsx
import { Delta } from '@terracelab/trellis-react';

function Finance() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-8)', justifyItems: 'start' }}>
      <Delta value={12.4} label="전월 대비" />
      <Delta value={-3.1} label="전월 대비" />
      <Delta value={12400000} format="amount" label="전일 대비" />
      <Delta value={0.3} format="point" label="전년 동기 대비" />
    </div>
  );
}
```

### 좋고 나쁨

아이콘만 상태 색이고 숨은 글자가 개선 · 악화를 읽는다

```tsx
import { Delta } from '@terracelab/trellis-react';

function Polarity() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-8)', justifyItems: 'start' }}>
      <Delta value={1.3} polarity="up-good" label="전주 대비" />
      <Delta value={-0.6} format="point" polarity="up-bad" label="불량률 전일 대비" />
      <Delta value={4} format="number" unit="건" polarity="up-bad" label="결재 대기 전일 대비" />
    </div>
  );
}
```

### 표 칸

sm은 행 높이를 바꾸지 않고, 비교 대상은 열 머리에 둔다

```tsx
import { DataGrid, Delta } from '@terracelab/trellis-react';

const BRANCHES = [
  { id: 'B01', name: '본사', sales: 1284000000, change: 12.4, margin: 0.3 },
  { id: 'B02', name: '부산지사', sales: 642300000, change: -3.1, margin: -0.8 },
  { id: 'B03', name: '대전지사', sales: 318900000, change: 0.02, margin: 0 },
];

function InTable() {
  return (
    <DataGrid
      caption="지사별 매출"
      rowKey="id"
      rows={BRANCHES}
      columns={[
        { key: 'name', header: '지사', width: 'md' },
        { key: 'sales', header: '당월 매출', width: 'md', format: 'amount' },
        {
          key: 'change',
          header: '전월 대비',
          width: 'sm',
          align: 'right',
          render: (row: (typeof BRANCHES)[number]) => <Delta value={row.change} size="sm" />,
        },
        {
          key: 'margin',
          header: '이익률 차이',
          width: 'sm',
          align: 'right',
          render: (row: (typeof BRANCHES)[number]) => (
            <Delta value={row.margin} format="point" size="sm" />
          ),
        },
      ]}
    />
  );
}
```

### 방향과 서식

서식마다 증가 · 감소 · 0. 보이는 자릿수에서 0이면 부호가 없다

```tsx
import { Delta } from '@terracelab/trellis-react';

function States() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, max-content)',
        gap: 'var(--tl-space-8) var(--tl-space-16)',
      }}
    >
      <Delta value={8.2} />
      <Delta value={-8.2} />
      <Delta value={0.04} />
      <Delta value={1.5} format="point" />
      <Delta value={-1.5} format="point" />
      <Delta value={0} format="point" />
      <Delta value={250000} format="amount" />
      <Delta value={-250000} format="amount" />
      <Delta value={0} format="amount" />
      <Delta value={3} format="number" unit="EA" size="sm" />
      <Delta value={-3} format="number" unit="EA" size="sm" />
      <Delta value={0} format="number" unit="EA" size="sm" />
    </div>
  );
}
```
