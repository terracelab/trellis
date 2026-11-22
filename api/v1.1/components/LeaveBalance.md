# LeaveBalance

> `@terracelab/trellis-react` · CSS `.tl-leave-balance` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { LeaveBalance } from '@terracelab/trellis-react';
```

## 용도

연차 발생 · 사용 · 남은 일수와 종류별 휴가를 보여 줄 때 쓴다(홈 · 내 연차 · 구성원 상세). 팀의 휴가 날짜는 TeamSchedule.

## 해부(Anatomy)

Card(제목 · 기간 · 부여 기준 부제 · 오른쪽 동작) · "남은 연차" + 일수(`type.display`) · 막대(사용 `brand.default` · 예정 연한 brand · 남은 몫 `chart.track`) · 발생 · 사용 · 예정 글자 · 소멸일 한 줄 · 종류별 줄(이름 · "15일 중 2.5일 사용" · 남은 일수) · 사용 촉진 한 줄(아이콘 + 글자, 위 `border.divider`).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `granted` | `number` |  | 필수 | 발생 일수 |
| `used` | `number` |  | 필수 | 사용 일수 |
| `planned` | `number` | `0` |  | 사용 예정 일수(남은 연차에서 뺀다) |
| `basis` | `'fiscal' \| 'hire'` |  |  | 부여 기준(회계연도 · 입사일) |
| `period` | `{ from: string; to: string }` |  |  | 사용 기간 |
| `expiresOn` | `string` |  |  | 소멸일 |
| `types` | `LeaveTypeBalance[]` |  |  | 종류별 줄 |
| `promotion` | `{ stage: 1 \| 2; dueOn: string }` |  |  | 연차 사용 촉진 안내 |
| `action` | `ReactNode` |  |  | 아래 동작(휴가 신청) |
| `title` | `string` |  |  | 카드 제목 |
| `loading` | `boolean` | `false` |  | 불러오는 중(스켈레톤) |

## Variants

basis 2(회계연도 · 입사일) × types 있음 · 없음 × promotion 1차 · 2차.

## States

지원 상태: `default` · `loading`

default · loading(스켈레톤).

## 동작

남은 연차 = 발생 − 사용 − 예정(결재가 끝난 앞으로의 휴가). 음수면 U+2212와 "앞당겨 쓴 연차". 일수는 반차 0.5 · 반반차 0.25까지 보인다. 발생이 없는 종류(경조 휴가 · 병가)는 사용만 보인다. 사용 촉진 1차는 사용 시기를 정해 알려 달라는 요청, 2차는 회사가 정한 사용일 확인이다.

## 접근성

제목은 Card 제목. 막대는 `role="img"`이고 이름이 발생 · 사용 · 예정 · 남음 글자다. 촉진 · 소멸은 아이콘 + 글자.

## 밀도

안쪽 여백 `density.card-padding`.

## 플랫폼 차이

없음.

## 금지 사항

촉진 안내를 노란 배경 배너로 칠하기, 종류마다 색 알약, 남은 일수를 퍼센트로만 보이기 → 리뷰.

## 예시

### 회계연도 기준

남은 연차가 크게, 결재가 끝난 예정 휴가는 미리 뺀다. 사용 촉진은 틴트 없이 한 줄

```tsx
import { Button, LeaveBalance } from '@terracelab/trellis-react';

const TYPES = [
  { kind: 'annual', granted: 15, used: 2.5 },
  { kind: 'compensatory', granted: 2, used: 0.5 },
  { kind: 'family', used: 3 },
  { kind: 'other', label: '리프레시 휴가', granted: 5, used: 0 },
] as const;

function Annual() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <LeaveBalance
        granted={15}
        used={2.5}
        planned={1}
        basis="fiscal"
        period={{ from: '2026-01-01', to: '2026-12-31' }}
        expiresOn="2026-12-31"
        types={TYPES}
        promotion={{ stage: 2, dueOn: '2026-11-13' }}
        action={
          <Button size="sm" icon="calendar-plus">
            휴가 신청
          </Button>
        }
      />
    </div>
  );
}
```

### 입사 1년 미만

매월 1일씩 생기고, 생긴 것보다 많이 쓰면 앞당겨 쓴 연차로 표시

```tsx
import { LeaveBalance } from '@terracelab/trellis-react';

function FirstYear() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <LeaveBalance
        title="연차 현황 · 입사 4개월"
        granted={4}
        used={5}
        basis="hire"
        period={{ from: '2026-07-01', to: '2027-06-30' }}
      />
    </div>
  );
}
```
