# WorkHoursMeter

> `@terracelab/trellis-react` · CSS `.tl-work-hours-meter` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { WorkHoursMeter } from '@terracelab/trellis-react';
```

## 용도

한 주 근무 시간을 주 40시간(소정) · 52시간(최대) 기준과 비교할 때 쓴다(내 근태 · 팀원 근무 현황). 오늘 기록은 TimeClock.

## 해부(Anatomy)

Card(제목 · 기간 부제) · 합계(`type.display`) + "/ 52시간"(`fg.tertiary`) · 막대 하나(정규 `chart.series.1` → 연장 `status.warning` → 한도 초과 `status.danger`, 바탕 `chart.track`) · 40 · 52 눈금(`border.strong` 선 + caption) · 상태 한 줄(경고 아이콘 + 글자) · 범례 · 요일 막대(선택, 시:분 글자 · 휴가 · 휴일) · 기준 한 줄(요일 막대가 있을 때, `type.caption` `fg.tertiary`).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `totalMinutes` | `number` |  |  | 이번 주 근무한 분(days가 있으면 합) |
| `days` | `WorkDay[]` |  |  | 요일별 근무(정규 · 연장 · 휴가 · 휴일) |
| `regularLimit` | `number` | `2400` |  | 주 소정 근로 분(40시간) |
| `overtimeBasis` | `'week' \| 'day'` | `"week"` |  | 연장 기준(week = 주 누계가 소정을 넘은 시간, day = 날마다 기록한 연장의 합) |
| `limit` | `number` | `3120` |  | 주 최대 근로 분(52시간) |
| `warnAt` | `number` |  |  | 경고 시작 분(기본 최대 − 4시간) |
| `period` | `{ from: string; to: string }` |  |  | 기간 |
| `today` | `string` |  |  | 오늘 'YYYY-MM-DD'(요일 막대 강조) |
| `title` | `string` |  |  | 카드 제목 |
| `loading` | `boolean` | `false` |  | 불러오는 중(스켈레톤) |

## Variants

days 있음(요일 막대) · 없음(totalMinutes만). 상태 3(여유 · 경고 · 초과). 연장 기준 overtimeBasis week(기본) · day.

## States

지원 상태: `default` · `loading`

default · loading(스켈레톤).

## 동작

막대 끝은 52시간(합계가 더 크면 합계). 막대는 정규 → 연장 → 한도 초과 순으로 칠하고, 52시간을 넘은 몫이 한도 초과 색이다. warnAt(기본 48시간)부터 경고 아이콘, 52시간 이상은 위험 아이콘과 "52시간을 n시간 넘었습니다". 요일 막대는 정규 아래 · 연장 위로 쌓고, 휴가 날은 휴가 이름, 휴일은 빈 칸이다.

연장 기준(R-T33): 요약 막대 · 범례 "연장" · 요일 막대는 `overtimeBasis` 하나로 센다. 그래서 셋이 서로 어긋나지 않는다.

| overtimeBasis | 연장 | 요일 막대 |
| --- | --- | --- |
| `week`(기본) | 주 합계가 regularLimit(40시간)을 넘은 시간 | 날짜 순으로 쌓아 주 누계가 40시간을 넘은 날부터 연장 색. 기록의 overtimeMinutes는 그날 합계에만 더한다 |
| `day` | `days[].overtimeMinutes`의 합(하루 소정을 넘은 시간, 근태 기록 그대로) | 기록대로 정규 · 연장. 주 합계가 40시간 아래여도 연장이 생긴다 |

요일 막대 아래에 기준 한 줄을 보인다("연장은 주 40시간을 넘은 시간입니다" · "연장은 날마다 소정 근로를 넘은 시간의 합입니다"). days가 없으면 하루 기준을 셀 수 없어 week로 센다. 법정 한도(주 52시간)는 두 기준 모두 주 합계로 본다.

## 접근성

막대는 `role="meter"`(값 = 분, 값 글자 = "이번 주 근무 38시간, 최대 52시간"). 요일 막대는 날마다 숨은 글자로 정규 · 연장을 읽는다. 경고는 아이콘 + 글자.

## 밀도

안쪽 여백 `density.card-padding`.

## 플랫폼 차이

없음.

## 금지 사항

막대를 여러 개로 나누기(정규 · 연장 따로), 한도를 넘은 카드 전체를 빨갛게 칠하기 → 리뷰.

## 예시

### 이번 주(주 기준)

주 누계 40시간까지 정규, 넘은 날부터 연장 색. 요약 · 범례 · 요일 막대가 같은 기준이다

```tsx
import { WorkHoursMeter } from '@terracelab/trellis-react';

const WEEK = [
  { date: '2026-11-02', regularMinutes: 480, overtimeMinutes: 60 },
  { date: '2026-11-03', regularMinutes: 480, overtimeMinutes: 90 },
  { date: '2026-11-04', regularMinutes: 480 },
  { date: '2026-11-05', regularMinutes: 480, overtimeMinutes: 120 },
  { date: '2026-11-06', regularMinutes: 480, overtimeMinutes: 30 },
  { date: '2026-11-07', regularMinutes: 0, holiday: true },
  { date: '2026-11-08', regularMinutes: 0, holiday: true },
] as const;

function Week() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 7)' }}>
      <WorkHoursMeter
        days={WEEK}
        today="2026-11-06"
        period={{ from: '2026-11-02', to: '2026-11-08' }}
      />
    </div>
  );
}
```

### 하루 기준

날마다 8시간을 넘은 기록이 연장이다. 주 합계가 40시간 아래여도 연장이 생긴다

```tsx
import { WorkHoursMeter } from '@terracelab/trellis-react';

const WEEK_WITH_LEAVE = [
  { date: '2026-11-02', regularMinutes: 480, overtimeMinutes: 60 },
  { date: '2026-11-03', regularMinutes: 480 },
  { date: '2026-11-04', regularMinutes: 0, leave: 'annual' },
  { date: '2026-11-05', regularMinutes: 480, overtimeMinutes: 120 },
  { date: '2026-11-06', regularMinutes: 330 },
  { date: '2026-11-07', regularMinutes: 0, holiday: true },
  { date: '2026-11-08', regularMinutes: 0, holiday: true },
] as const;

function DailyBasis() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 7)' }}>
      <WorkHoursMeter
        overtimeBasis="day"
        days={WEEK_WITH_LEAVE}
        today="2026-11-06"
        period={{ from: '2026-11-02', to: '2026-11-08' }}
      />
    </div>
  );
}
```

### 한도

48시간부터 경고 아이콘, 52시간을 넘으면 넘은 시간을 말한다

```tsx
import { WorkHoursMeter } from '@terracelab/trellis-react';

function Limits() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(min(100%, calc(var(--tl-space-64) * 4.5)), 1fr))',
        gap: 'var(--tl-space-16)',
      }}
    >
      <WorkHoursMeter title="김지훈 · 이번 주" totalMinutes={38 * 60} />
      <WorkHoursMeter title="이수민 · 이번 주" totalMinutes={49 * 60 + 20} />
      <WorkHoursMeter title="박서연 · 이번 주" totalMinutes={53 * 60 + 30} />
    </div>
  );
}
```
