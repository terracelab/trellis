# WorkTimeline

> `@terracelab/trellis-react` · CSS `.tl-work-timeline` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { WorkTimeline } from '@terracelab/trellis-react';
```

## 용도

한 주의 출퇴근 시각을 요일마다 막대로 보여 줄 때 쓴다(내 근태 · 팀원 근태 상세, R-T23). 막대는 출근 ~ 퇴근이고 소정 근무를 넘은 만큼이 연장이다. 오늘 하루 출퇴근 단추는 TimeClock, 주 52시간 합계는 WorkHoursMeter, 여러 사람의 휴가 · 일정은 TeamSchedule.

## 해부(Anatomy)

root(`tl-work-timeline`, 칸 폭 기준 `container-type`) · table(role=table, 숨은 이름 = label) · head(요일 · 눈금 · 출근 · 퇴근 · 근무 · 상태, `type.caption` 600 `fg.secondary`) · ruler(눈금: 범위 양 끝 + 3시간마다, tabular) · row(최소 높이 `density.row-height` + `space.4`, 줄 사이 `border.divider`, 오늘 `bg.sunken`) · day(요일 600 + 날짜 `type.caption` `fg.secondary`) · bar(트랙 `chart.track`, 높이 `space.16`, `radius.sm`) · regular(소정 근무 점선 틀 `chart.axis`) · segment(정규 `chart.series.1` · 연장 `status.warning.default` · 근무 중 `chart.compare`, `radius.xs`) · off(막대 대신 글자 `type.caption` `fg.secondary`) · in-out · worked(tabular, 오른쪽 정렬) · status(StatusDot 점 + 글자) · legend(Legend).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `days` | `WorkTimelineDay[]` |  | 필수 | 줄마다 하루(date · clockIn · clockOut · minutes · off · status) |
| `schedule` | `WorkSchedule` |  | 필수 | 소정 근무 시각(start · end · breakMinutes). end를 넘으면 연장 |
| `range` | `{ start: string; end: string }` |  |  | 눈금 범위(기본 07:00~23:00) |
| `today` | `string` |  |  | 오늘(ISO). 그 줄은 바탕 한 단계 |
| `now` | `string` |  |  | 지금 시각(HH:MM). 근무 중 막대의 끝 |
| `label` | `string` |  | 필수 | 표 이름(접근성) |
| `legend` | `boolean` | `true` |  | 범례(정규 · 연장 · 근무 중) |

## Variants

상태 칸은 days 가운데 status가 있거나 근무 중인 날이 있을 때만 생긴다. legend는 기본으로 보이고 끌 수 있다. 눈금 범위는 range(기본 07:00~23:00).

## States

지원 상태: `default`

default(데이터 상태). 오늘 줄은 바탕 한 단계(`bg.sunken`), 퇴근 전 오늘 줄은 근무 중 막대(지금 시각까지)와 상태 "근무 중". hover · active · focus · disabled · loading · error는 해당 없음(불러오는 중은 부르는 쪽이 Skeleton).

## 동작

표시 전용. 조각은 contracts `workSegments`가 정한다. 출근 ~ 소정 끝(schedule.end)은 정규(근무 중이면 live), 소정 끝을 넘은 만큼은 연장이다. 출근이 소정 끝보다 늦으면 전부 연장이다. 근무 분은 minutes가 있으면 그것, 없으면 출근 ~ 퇴근(근무 중이면 now)에서 4시간이 넘을 때 schedule.breakMinutes를 뺀다(`workMinutes`). 출근이 없는 날은 막대 대신 off 글자(연차 · 휴일, 없으면 "기록 없음"). 폭이 640보다 좁은 칸에서는 출근 · 퇴근 · 상태 칸을 화면에서만 접고(화면 읽기에는 남는다) 눈금을 절반으로 줄인다.

## 접근성

`role="table"` + `row` · `columnheader` · `rowheader`(요일) · `cell`, 이름은 label. 막대 칸은 막대를 감추고 숨은 글자로 조각을 읽는다("정규 08:52~18:00, 연장 18:00~18:40"). 눈금 머리는 숨은 이름 "출퇴근 막대"를 가진다. 색은 조각 종류만 말하고 뜻은 범례 · 숨은 글자 · 출근 · 퇴근 칸이 말한다. 상태는 점 + 글자.

## 밀도

줄 최소 높이 `density.row-height` + `space.4`(compact 40 · comfortable 44), 글자 `density.body-font-size`. 막대 높이 `space.16`, 조각은 위아래 `space.4` 안쪽.

## 플랫폼 차이

네이티브는 같은 props로 요일 줄마다 막대(react-native-svg)와 근무 시간을 그린다. 좁은 칸 규칙은 같다.

## 금지 사항

블록이 role=table + 인라인 style로 막대를 직접(R-T23) → WorkTimeline · 연장을 빨강 · 지출 색으로(연장은 status.warning, 금융 색 아님) · 오늘 줄을 왼쪽 색 띠로(D-57) → 리뷰.

## 예시

### 이번 주

소정 09~18시 점선 틀 위에 출근 ~ 퇴근 막대. 18시를 넘은 만큼은 연장, 오늘은 지금까지 근무 중

```tsx
import type { WorkTimelineDay } from '@terracelab/trellis-contracts';
import { WorkTimeline } from '@terracelab/trellis-react';

const SCHEDULE = { start: '09:00', end: '18:00', breakMinutes: 60 };

const WEEK: WorkTimelineDay[] = [
  {
    date: '2026-11-02',
    clockIn: '08:52',
    clockOut: '18:40',
    status: { tone: 'success', label: '정상' },
  },
  {
    date: '2026-11-03',
    clockIn: '09:14',
    clockOut: '18:05',
    status: { tone: 'warning', label: '지각' },
  },
  { date: '2026-11-04', off: '연차', status: { tone: 'neutral', label: '연차' } },
  {
    date: '2026-11-05',
    clockIn: '08:41',
    clockOut: '21:20',
    status: { tone: 'success', label: '정상' },
  },
  { date: '2026-11-06', clockIn: '08:55' },
];

function ThisWeek() {
  return (
    <WorkTimeline
      label="이번 주 출퇴근"
      days={WEEK}
      schedule={SCHEDULE}
      today="2026-11-06"
      now="15:20"
    />
  );
}
```

### 주말 · 범위

토 · 일은 막대 대신 휴일 글자. 상태가 없으면 상태 칸이 없고, 눈금은 06~24시로 넓혔다

```tsx
import { WorkTimeline } from '@terracelab/trellis-react';

function Weekend() {
  return (
    <WorkTimeline
      label="교대 근무 주간"
      schedule={{ start: '08:00', end: '17:00', breakMinutes: 60 }}
      range={{ start: '06:00', end: '24:00' }}
      legend={false}
      days={[
        { date: '2026-11-02', clockIn: '07:48', clockOut: '17:02' },
        { date: '2026-11-03', clockIn: '07:55', clockOut: '19:30' },
        { date: '2026-11-04', clockIn: '07:50', clockOut: '17:10' },
        { date: '2026-11-05', clockIn: '07:58', clockOut: '22:45' },
        { date: '2026-11-06', clockIn: '07:46', clockOut: '17:00' },
        { date: '2026-11-07', off: '휴일' },
        { date: '2026-11-08', off: '휴일' },
      ]}
    />
  );
}
```
