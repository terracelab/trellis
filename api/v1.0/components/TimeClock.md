# TimeClock

> `@terracelab/trellis-react` · CSS `.tl-time-clock` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { TimeClock } from '@terracelab/trellis-react';
```

## 용도

오늘 출근 · 퇴근을 기록하고 지금 근무 상태를 보여 줄 때 쓴다(홈 · 내 근태). 한 주 합계는 WorkHoursMeter, 팀 일정은 TeamSchedule.

## 해부(Anatomy)

Card(제목 · 날짜 부제 · 오른쪽 상태 StatusDot) · 지금 시각(`type.display`, tabular) · 근무지 · 근무 유형 · 소정 근무 한 줄(`fg.tertiary`) · 출근 · 퇴근 · 근무 세 칸(`border.divider` 위아래 선) · 진행 줄(`chart.track` 위 `brand.default`, 휴게 중 `status.warning`, 퇴근 뒤 `fg.tertiary`) · 주 동작 단추.

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `status` | `'before' \| 'working' \| 'break' \| 'done'` |  | 필수 | 출퇴근 상태 |
| `now` | `string` |  |  | 지금 시각 'YYYY-MM-DDTHH:mm'(없으면 기기 시각) |
| `clockIn` | `string` |  |  | 출근 시각 'HH:mm' |
| `clockOut` | `string` |  |  | 퇴근 시각 'HH:mm' |
| `schedule` | `WorkSchedule` | `"{ start: '09:00', end: '18:00', breakMinutes: 60 }"` |  | 소정 근무 시각 · 휴게 |
| `place` | `'office' \| 'remote' \| 'field'` |  |  | 근무지 |
| `workType` | `string` |  |  | 근무 유형 이름 |
| `workedMinutes` | `number` |  |  | 오늘 근무한 분(없으면 계산) |
| `title` | `string` |  |  | 카드 제목 |
| `loading` | `boolean` | `false` |  | 기록 요청 중 |
| `onClockIn` | `() => void` |  |  | 출근하기 |
| `onClockOut` | `() => void` |  |  | 퇴근하기 |
| `onBreakStart` | `() => void` |  |  | 휴게 시작(있을 때만 단추) |
| `onBreakEnd` | `() => void` |  |  | 휴게 끝(있을 때만 단추) |

## Variants

status 4(before · working · break · done) × 단추(핸들러가 있는 것만).

## States

지원 상태: `default` · `loading`

default · loading(주 동작 단추가 처리 중, `aria-busy`).

## 동작

근무 전 = 출근하기, 근무 중 = 퇴근하기(+ onBreakStart가 있으면 휴게 시작), 휴게 중 = 휴게 끝, 퇴근 = 단추 없음. 출근이 소정 시작보다 늦으면 출근 칸에 지각, 소정 끝보다 일찍 퇴근하면 조퇴를 점 + 글자로 붙인다. 근무 시간은 workedMinutes가 없으면 출근 → 퇴근(없으면 지금)에서 4시간을 넘은 만큼(휴게 분까지) 휴게로 뺀다. 소정 근무를 넘으면 진행 줄은 가득 차고 "연장 n분"을 보인다. now가 없으면 기기 시각을 30초마다 다시 읽는다.

## 접근성

제목은 Card 제목(h2). 지금 시각은 `<time>`, 진행 줄은 `role="progressbar"`(값 글자 = "소정 근무 8시간 중 5시간 30분"). 상태 · 지각은 색만이 아니라 글자로 보인다.

## 밀도

안쪽 여백 `density.card-padding`. 시각 글자 크기는 밀도와 무관하다.

## 플랫폼 차이

네이티브는 Pressable 단추, 시각 갱신은 앱이 now로 넘긴다.

## 금지 사항

출퇴근 위치 · 사진을 카드 안에 크게 보이기, 지각을 빨간 배경으로 칠하기, 단추 문구에 시각 넣기(출근 09:02) → 리뷰.

## 예시

### 근무 중

지금 시각이 크게, 출근이 늦으면 지각 표시, 소정 근무까지 남은 시간

```tsx
import { TimeClock } from '@terracelab/trellis-react';

function Working() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <TimeClock
        status="working"
        now="2026-11-06T14:32"
        clockIn="09:04"
        place="office"
        workType="고정 근무"
        onClockOut={() => {}}
        onBreakStart={() => {}}
      />
    </div>
  );
}
```

### 상태

근무 전에는 출근하기, 휴게 중에는 휴게 끝, 퇴근 뒤에는 단추 없이 연장 시간

```tsx
import { TimeClock } from '@terracelab/trellis-react';

const GRID = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, calc(var(--tl-space-64) * 4.5)), 1fr))',
  gap: 'var(--tl-space-16)',
};

function States() {
  return (
    <div style={GRID}>
      <TimeClock status="before" now="2026-11-06T08:47" place="office" onClockIn={() => {}} />
      <TimeClock
        status="break"
        now="2026-11-06T12:20"
        clockIn="08:55"
        place="field"
        onBreakEnd={() => {}}
      />
      <TimeClock
        status="done"
        now="2026-11-06T19:12"
        clockIn="08:52"
        clockOut="19:05"
        place="remote"
        workType="시차 출퇴근"
        schedule={{ start: '08:30', end: '17:30', breakMinutes: 60 }}
      />
    </div>
  );
}
```
