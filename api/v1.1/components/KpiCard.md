# KpiCard

> `@terracelab/trellis-react` · CSS `.tl-kpi-card` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { KpiCard } from '@terracelab/trellis-react';
```

## 용도

지표 숫자 하나와 비교 증감을 카드로 보여 줄 때 쓴다(당일 시재 · 당월 매출 · 결재 대기). 추이 선이 필요하면 ChartCard + Sparkline, 목록은 Card.

## 해부(Anatomy)

root(`bg.surface`, `border.divider`, `radius.lg`, 안쪽 `density.card-padding`, sm은 `space.8` × `space.12`) · head(icon `fg.tertiary` 16 · label `type.label` `fg.secondary`, sm은 `type.caption` · chevron) · value(`type.amount-lg`, sm은 `type.amount`, lg는 `type.display`, tabular) · unit(`type.label` `fg.tertiary`) · delta(Delta size sm: 비교 대상 `fg.tertiary` + 증감 값 + 방향 아이콘) · error(circle-alert `status.danger.default` + "불러오지 못함" `fg.secondary` + 다시 시도 ghost sm 단추) · masked(가림 글자 `fg.tertiary` + lock 아이콘과 이유 한 줄 `type.caption` `fg.tertiary`) · caption(`type.caption` `fg.tertiary`).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `label` | `string` |  | 필수 | 지표 이름 |
| `value` | `number \| string` |  | 필수 | 값 |
| `unit` | `string` |  |  | 단위(amount · compactWon 기본 원) |
| `format` | `'number' \| 'amount' \| 'percent' \| 'currency' \| 'compactWon'` | `"number"` |  | 숫자 서식(contracts format 함수) |
| `currency` | `'KRW' \| 'USD' \| 'EUR' \| 'JPY' \| 'CNY'` | `"KRW"` |  | format = currency의 통화 |
| `delta` | `{ value: number; label: string; format?: 'percent' \| 'point' \| 'amount' \| 'number'; polarity?: 'finance' \| 'up-good' \| 'up-bad' }` |  |  | 비교 증감(Delta, 기본 percent · finance) |
| `caption` | `string` |  |  | 기준 · 기간 |
| `icon` | `IconName` |  |  | 라벨 앞 아이콘 |
| `size` | `'sm' \| 'md' \| 'lg'` | `"md"` |  | 값 글자 크기(amount · amount-lg · display) |
| `loading` | `boolean` | `false` |  | 불러오는 중(스켈레톤) |
| `error` | `boolean \| string` | `false` |  | 불러오지 못함(글자면 그 문구) |
| `onRetry` | `() => void` |  |  | 다시 시도(error일 때) |
| `masked` | `boolean \| string` | `false` |  | 가린 값 + 이유 한 줄(글자면 그 이유) |
| `onPress` | `() => void` |  |  | 눌렀을 때(카드 전체가 버튼) |

## Variants

size sm · md · lg × format 5(number · amount · percent · currency · compactWon) × delta polarity 3. sm은 서랍 머리 · 상세 위에 작은 지표 몇 개를 나란히 둘 때 쓴다. onPress가 있으면 버튼.

## States

지원 상태: `default` · `hover` · `active` · `focus` · `loading` · `error`

default · hover(`border.strong`, `bg.canvas`) · active(`bg.sunken`) · focus(링) · loading(값 · 증감 자리에 Skeleton, `aria-busy`) · error(값 자리에 "불러오지 못함" + 다시 시도, `data-state="error"`). hover · active · focus는 onPress가 있을 때만. masked는 상태가 아니라 값을 보이는 방식이다(가림 글자 + 이유).

## 동작

증감 줄은 Delta 컴포넌트(size sm)다. 숫자는 contracts 서식 함수로만 만든다(number · amount = `formatAmount`, percent = `formatPercent`, currency = `formatCurrency`, compactWon = `formatCompactWon`). 단위는 숫자 뒤에 작게 붙인다(amount · compactWon 기본 원). 증감은 비교 대상을 앞에 두고 부호를 항상 붙인다("전월 대비 +12.4%"). 비율끼리의 차이(불량률 · 점유율 · 이익률)는 delta.format point로 %p를 쓴다("전일 대비 +0.3%p"). 비율 값에 %를 붙이면 상대 변화로 읽힌다. 색은 방향만 말한다. finance(기본)는 증가 `finance.income`(빨강) · 감소 `finance.expense`(파랑), up-good · up-bad는 상태 아이콘(trending-up · trending-down, success · danger)만 색이고 글자는 중립이다. 0은 중립 minus 아이콘. error면 값 · 증감 대신 "불러오지 못함"(error가 글자면 그 문구)을 보이고, onRetry가 있으면 "다시 시도" 단추를 둔다. 이때 카드는 onPress가 있어도 버튼이 아니다(단추 안에 단추를 두지 않는다). masked면 값 · 단위 · 증감 대신 가림 글자와 이유 한 줄(masked가 글자면 그 이유, 아니면 "볼 권한이 없습니다")을 보인다. 증감도 값을 짐작하게 하므로 숨긴다.

## 접근성

onPress가 있으면 카드 전체가 `<button>`이고 접근성 이름은 라벨 · 값 · 증감 글자 순서다. 없으면 `role="group"` + `aria-labelledby`(라벨). 방향은 색만이 아니라 부호(+ · −)와 아이콘으로도 보인다. 다시 시도 단추 이름은 "{라벨} 다시 시도"(영어 "Try again to load {라벨}")라 카드가 여럿이어도 구별된다. 이름 안에 단추에 보이는 글자("다시 시도" · "Try again")가 그대로 들어 있다(WCAG 2.5.3). 가림 글자는 꾸밈이고 숨은 글자 "가린 값"이 읽힌다. 포커스 링은 항상 보인다.

## 밀도

안쪽 여백 `density.card-padding`(12 · 16). 값 글자 크기는 밀도와 무관하다. 휴대폰(`breakpoint.sm` 미만)은 세로로 쌓지 않고 두 열이다: 왼쪽 이름 · 설명, 오른쪽 값 · 증감, 화살표는 오른쪽 가운데. lg 크기도 `type.amount-lg`로 내린다(D-61).

## 플랫폼 차이

네이티브는 Pressable, hover 없음.

## 금지 사항

카드 안에 스파크라인 · 차트 넣기(ChartCard) · 증감에 서양식 색(증가 초록 · 감소 빨강) · 문자열 템플릿으로 쉼표 찍기 → 리뷰.

## 예시

### 홈 첫 줄

금액은 원 단위를 작게 · 증감은 비교 대상 먼저

```tsx
import { KpiCard } from '@terracelab/trellis-react';

function HomeRow() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(min(100%, calc(var(--tl-space-64) * 3)), 1fr))',
        gap: 'var(--tl-space-12)',
      }}
    >
      <KpiCard
        label="당일 시재"
        icon="wallet"
        value={874479500}
        format="amount"
        delta={{ value: 12400000, label: '전일 대비', format: 'amount' }}
        caption="오늘 09:00 기준"
        size="lg"
      />
      <KpiCard
        label="당월 매출"
        icon="chart-bar"
        value={1284000000}
        format="compactWon"
        delta={{ value: 12.4, label: '전월 대비' }}
        caption="11월 1일~8일 누계"
        size="lg"
      />
      <KpiCard
        label="당월 매입"
        icon="shopping-cart"
        value={642300000}
        format="compactWon"
        delta={{ value: -3.1, label: '전월 대비' }}
        caption="11월 1일~8일 누계"
        size="lg"
      />
    </div>
  );
}
```

### 극성

좋고 나쁨이 분명한 지표는 상태 아이콘, 글자는 중립

```tsx
import { KpiCard } from '@terracelab/trellis-react';

function Polarity() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(min(100%, calc(var(--tl-space-64) * 3)), 1fr))',
        gap: 'var(--tl-space-12)',
      }}
    >
      <KpiCard
        label="결재 대기"
        value={12}
        unit="건"
        delta={{ value: 4, label: '전일 대비', format: 'number', polarity: 'up-bad' }}
        caption="3일 넘은 결재 4건"
        onPress={() => {}}
      />
      <KpiCard
        label="출고 정시율"
        value={97.2}
        format="percent"
        delta={{ value: 1.3, label: '전주 대비', polarity: 'up-good' }}
        onPress={() => {}}
      />
      <KpiCard
        label="수출 미수금"
        value={184250}
        format="currency"
        currency="USD"
        caption="선적 기준 3건"
      />
    </div>
  );
}
```

### 불러오는 중

값 자리만 스켈레톤, 라벨은 그대로

```tsx
import { KpiCard } from '@terracelab/trellis-react';

function Loading() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 4)' }}>
      <KpiCard
        label="미수금"
        value={0}
        format="amount"
        delta={{ value: 0, label: '전월 대비' }}
        loading
      />
    </div>
  );
}
```

### 오류와 가린 값

불러오지 못한 지표는 값 자리에서 다시 시도한다. 볼 권한이 없는 지표는 가림 글자와 이유 한 줄

```tsx
import { KpiCard } from '@terracelab/trellis-react';

function ErrorAndMasked() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(min(100%, calc(var(--tl-space-64) * 3)), 1fr))',
        gap: 'var(--tl-space-12)',
      }}
    >
      <KpiCard
        label="당월 매출"
        icon="chart-bar"
        value={0}
        format="compactWon"
        delta={{ value: 12.4, label: '전월 대비' }}
        caption="11월 1일~8일 누계"
        error
        onRetry={() => {}}
      />
      <KpiCard
        label="당월 급여 총액"
        icon="banknote"
        value={0}
        format="amount"
        caption="11월 25일 지급 예정"
        masked="급여 정보는 인사팀만 봅니다"
      />
    </div>
  );
}
```

### 작은 지표

sm은 서랍 머리나 상세 위에 몇 개를 나란히 둔다

```tsx
import { KpiCard } from '@terracelab/trellis-react';

function Small() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(min(100%, calc(var(--tl-space-64) * 2)), 1fr))',
        gap: 'var(--tl-space-8)',
      }}
    >
      <KpiCard size="sm" label="미수금" value={18420000} format="amount" />
      <KpiCard
        size="sm"
        label="당월 거래"
        value={42}
        unit="건"
        delta={{ value: 6, label: '전월 대비', format: 'number' }}
      />
      <KpiCard
        size="sm"
        label="평균 결제일"
        value={34}
        unit="일"
        delta={{ value: -2, label: '전월 대비', format: 'number', polarity: 'up-bad' }}
      />
    </div>
  );
}
```
