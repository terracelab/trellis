# Timeline

> `@terracelab/trellis-react` · CSS `.tl-timeline` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { Timeline } from '@terracelab/trellis-react';
```

## 용도

한 건에 일어난 일의 순서(입고 처리 이력 · 결재 이력 · 배치 실행 로그)를 세로 줄로 보여 줄 때 쓴다. 결재선 단계 진행은 Stepper, 여러 건의 목록은 표.

## 해부(Anatomy)

list(`<ol>`) · item · rail(marker + line) · marker(점 8 톤의 `status.*.default`, icon이 있으면 원 24 `status.*.subtle` 바탕에 아이콘 16 톤 색) · line(`border.divider` 2) · title(`type.label` 600 `fg.primary`) · meta(time · actor, `type.caption` `fg.tertiary`, tabular) · description(`type.caption` `fg.secondary`).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `items` | `{ id; title; description?; time; actor?; tone?: StatusTone; icon?: IconName }[]` |  | 필수 | 이력 항목 |
| `dense` | `boolean` | `false` |  | 촘촘한 간격 |
| `ariaLabel` | `string` |  |  | 목록 이름 |

## Variants

marker 2(점 · 아이콘) × tone 5 × dense 유무.

## States

지원 상태: `default`

default.

## 동작

items 순서대로 위에서 아래로 그린다. 최신을 위에 둘지는 화면이 정한다. 마지막 항목은 아래 선을 그리지 않는다. time은 화면이 서식을 맞춘 글자다(2026-11-07 14:20). 실패 · 반려 같은 항목은 tone으로 색을 주고 제목 글자로도 말한다.

## 접근성

`<ol>`(순서 있는 목록), `aria-label`로 목록 이름(결재 이력)을 준다. marker는 장식이고 상태는 제목 글자가 말한다.

## 밀도

항목 아래 여백 `space.16`, dense는 `space.8`.

## 플랫폼 차이

없음.

## 금지 사항

결재선 진행(가로 Stepper)에 쓰기 · 색만으로 실패 표시 · 시각 서식을 항목마다 다르게 → 리뷰.

## 예시

### 입고 처리 이력

어휘의 tone과 라벨을 그대로 쓴다

```tsx
import { RECEIVING_STATES } from '@terracelab/trellis-contracts';
import { Timeline } from '@terracelab/trellis-react';

const RECEIVING = [
  {
    id: 'r4',
    title: RECEIVING_STATES.received.label,
    description: '냉동 새우 2kg 240EA · A구역 3번 로케이션',
    time: '2026-11-07 14:20',
    actor: '정물류',
    tone: RECEIVING_STATES.received.tone,
    icon: 'package-check' as const,
  },
  {
    id: 'r3',
    title: RECEIVING_STATES.inspecting.label,
    description: '유통기한 2027-05-30 확인 · 파손 2EA 반품 대기',
    time: '2026-11-07 13:05',
    actor: '이검수',
    tone: RECEIVING_STATES.inspecting.tone,
  },
  {
    id: 'r2',
    title: RECEIVING_STATES.arrived.label,
    time: '2026-11-07 11:40',
    actor: '(주)한빛식자재',
    tone: RECEIVING_STATES.arrived.tone,
    icon: 'truck' as const,
  },
  {
    id: 'r1',
    title: RECEIVING_STATES.scheduled.label,
    description: '발주번호 PO-2611-0142',
    time: '2026-11-05 09:00',
    actor: '이구매',
    tone: RECEIVING_STATES.scheduled.tone,
  },
];

function Receiving() {
  return <Timeline ariaLabel="입고 처리 이력" items={RECEIVING} />;
}
```

### 결재 이력

반려는 색과 제목 글자로 함께 말한다

```tsx
import { Timeline } from '@terracelab/trellis-react';

const APPROVAL = [
  {
    id: 'a3',
    title: '반려',
    description: '반려 사유 · 견적서 2부 첨부 누락',
    time: '11월 6일(금) 16:10',
    actor: '최회계 부장',
    tone: 'danger' as const,
  },
  {
    id: 'a2',
    title: '승인',
    time: '11월 6일(금) 10:32',
    actor: '박영업 팀장',
    tone: 'success' as const,
  },
  {
    id: 'a1',
    title: '결재 요청',
    time: '11월 5일(목) 17:45',
    actor: '김테라 대리',
    tone: 'info' as const,
  },
];

function Approval() {
  return <Timeline ariaLabel="결재 이력" items={APPROVAL} dense />;
}
```
