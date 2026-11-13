# Stepper

> `@terracelab/trellis-react` · CSS `.tl-stepper` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { Stepper } from '@terracelab/trellis-react';
```

## 용도

정해진 순서의 처리 단계(주문 단계 · 신고 진행 · 입고 처리)에서 지금 어디인지 보여 준다. 전자결재의 결재선은 ApprovalLine, 탭처럼 오가는 화면 전환은 Tabs.

## 해부(Anatomy)

root(`tl-stepper`, `<ol>`) · step · marker(원, md `space.24` · sm `space.20`, 번호 `type.caption` 600) · label(`type.label`) · description(`type.caption` `fg.tertiary`) · line(`border.default`, 완료 구간 `brand.default`).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `steps` | `StepperStep[]` |  | 필수 | 단계(이름 · 설명 · 상태) |
| `orientation` | `'horizontal' \| 'vertical'` | `"horizontal"` |  | 방향 |
| `size` | `'sm' \| 'md'` | `"md"` |  | 크기 |
| `label` | `string` | `"진행 단계"` |  | 목록 이름(aria-label) |

## Variants

orientation horizontal · vertical × size sm · md. 단계 상태 4: done(`brand.default` 바탕 + check, `brand.onBrand`) · current(`brand.default` 2px 테두리 + 번호 `fg.link`, 이름 600) · todo(`border.default` 테두리 + 번호 `fg.tertiary`, 이름 `fg.secondary`) · error(`status.danger.default` 바탕 + x, `status.danger.on`).

## States

지원 상태: `default`

default(데이터 상태를 보여 주고 상호작용하지 않는다). 단계의 error는 위 단계 상태로 그린다. hover · active · focus · disabled · loading은 해당 없음.

## 동작

표시 전용. 단계를 눌러 이동하지 않는다. 가로는 폭을 단계 수로 나누고 단계 사이를 선으로 잇는다. 세로는 단계마다 한 줄이고 설명이 길면 줄바꿈한다.

## 접근성

`<ol aria-label>`(기본 "진행 단계"), 지금 단계에 `aria-current="step"`. 상태는 색 + 아이콘 + 숨김 글자(완료 · 현재 · 오류)로 읽힌다.

## 밀도

마커 크기는 size로 정하고 밀도와 관계없다. 세로 간격 `space.12`.

## 플랫폼 차이

네이티브는 가로일 때 이름을 마커 아래에 둔다(좁은 폭). props는 같다.

## 금지 사항

단계 7개 넘김 · 결재 5상태 색 쓰기(결재선은 ApprovalLine) · 단계 이름에 문장 — 리뷰.

## 예시

### 주문 단계

지금 단계는 링, 끝난 단계는 체크와 진한 선

```tsx
import { Stepper } from '@terracelab/trellis-react';

const ORDER_STEPS = [
  { id: 'received', label: '주문 접수', description: '11-03 09:12', state: 'done' },
  { id: 'paid', label: '결제 확인', description: '11-03 09:40', state: 'done' },
  { id: 'picking', label: '피킹 · 검수', description: '이천 1센터', state: 'current' },
  { id: 'shipping', label: '출고', state: 'todo' },
  { id: 'delivered', label: '배송 완료', state: 'todo' },
] as const;

function OrderStages() {
  return <Stepper steps={ORDER_STEPS} label="주문 단계" />;
}
```

### 입고 처리(세로)

좁은 패널에서는 세로로, 멈춘 단계는 위험 색

```tsx
import { Stepper } from '@terracelab/trellis-react';

const RECEIVING_STEPS = [
  { id: 'arrived', label: '도착', description: '11-06 14:20 · 부산 신항 보세창고', state: 'done' },
  {
    id: 'inspecting',
    label: '검수',
    description: '수량 차이 12EA · 거래처 확인 요청',
    state: 'error',
  },
  { id: 'putaway', label: '적치', state: 'todo' },
  { id: 'received', label: '입고 완료', state: 'todo' },
] as const;

function ReceivingVertical() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 4)' }}>
      <Stepper steps={RECEIVING_STEPS} orientation="vertical" size="sm" label="입고 처리" />
    </div>
  );
}
```
