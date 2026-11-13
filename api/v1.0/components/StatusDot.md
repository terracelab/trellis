# StatusDot

> `@terracelab/trellis-react` · CSS `.tl-status-dot` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { StatusDot } from '@terracelab/trellis-react';
```

## 용도

표 칸 · 목록 행에서 상태 하나를 점과 라벨로 보여 줄 때 쓴다. 배지 바탕이 무거운 촘촘한 표(설비 상태 · 배치 실행)에 쓰고, 카드 머리의 강조 상태는 Badge.

## 해부(Anatomy)

root(inline-flex) · dot(원, 톤의 `status.*.default`, neutral은 `fg.tertiary`) · pulse(dot 뒤 번지는 고리, 같은 색) · label(`fg.primary`, md는 `density.body-font-size`, sm은 `type.caption`).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `tone` | `'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `"neutral"` |  | 상태 톤(점 색) |
| `size` | `'sm' \| 'md'` | `"md"` |  | 크기 |
| `pulse` | `boolean` | `false` |  | 진행 중 상태의 맥박 표시 |
| `children` | `ReactNode` |  |  | 상태 라벨 |

## Variants

tone 5 × size 2. pulse는 tone과 무관하게 켤 수 있다.

## States

지원 상태: `default`

default(데이터 상태이지 상호작용 상태가 아니다).

## 동작

pulse는 지금 진행 중인 상태(실행 중 · 가동 · 통관 중)에만 켠다. 끝난 상태에 켜지 않는다. 한 표에 맥박이 여럿이면 시선이 흩어지므로 진행 중인 행에만 둔다.

## 접근성

상태는 색 + 점 + 글자. 글자는 중립 색(상태 색 글자는 4.5:1을 못 넘는다). 점은 `aria-hidden`. `prefers-reduced-motion`이면 맥박이 멈춘다.

## 밀도

md 점 8 · sm 점 6. 글자는 `density.body-font-size`를 따른다.

## 플랫폼 차이

네이티브 맥박은 Animated, 접근성 설정의 동작 줄이기를 따른다.

## 금지 사항

라벨 없이 점만 쓰기 · 결재 상태에 쓰기(Badge approval) · 끝난 상태에 맥박 → 리뷰.

## 예시

### 배치 작업

어휘의 tone을 넘기고 실행 중에만 맥박

```tsx
import { JOB_STATES } from '@terracelab/trellis-contracts';
import { StatusDot } from '@terracelab/trellis-react';

function JobStates() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-16)', flexWrap: 'wrap' }}>
      {Object.entries(JOB_STATES).map(([key, s]) => (
        <StatusDot key={key} tone={s.tone} pulse={key === 'running'}>
          {s.label}
        </StatusDot>
      ))}
    </div>
  );
}
```

### 설비 현황

표 칸에는 sm

```tsx
import { MACHINE_STATES } from '@terracelab/trellis-contracts';
import { StatusDot } from '@terracelab/trellis-react';

function Machines() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-4)' }}>
      <StatusDot size="sm" tone={MACHINE_STATES.running.tone} pulse>
        포장 2라인 {MACHINE_STATES.running.label}
      </StatusDot>
      <StatusDot size="sm" tone={MACHINE_STATES.down.tone}>
        냉동 창고 컴프레서 {MACHINE_STATES.down.label}
      </StatusDot>
      <StatusDot size="sm" tone={MACHINE_STATES.maintenance.tone}>
        지게차 3호 {MACHINE_STATES.maintenance.label}
      </StatusDot>
    </div>
  );
}
```
