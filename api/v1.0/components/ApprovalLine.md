# ApprovalLine

> `@terracelab/trellis-react` · CSS `.tl-approval-line` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { ApprovalLine } from '@terracelab/trellis-react';
```

## 용도

전자결재 문서의 결재선(기안 · 검토 · 합의 · 승인 · 참조)과 사람마다 결재 상태를 보여 준다. 결재함 표 칸 · 목록 행에는 compact(결재 5색 점 + "2/3 합의", R-T24). 결재선을 고치는 것은 ApprovalLineEditor, 결재가 아닌 처리 단계는 Stepper.

## 해부(Anatomy)

root(`tl-approval-line`, `<ol>`) · step(칸, `bg.surface`, `border.default`, `radius.md`) · role(머리 띠, `bg.canvas`, `type.caption` `fg.secondary`) · name(`type.label` 600) · title(직함 `type.caption` `fg.tertiary`) · badge(Badge approval, 대기는 neutral) · time(`type.caption` `fg.tertiary`, tabular) · comment(`type.caption` `fg.secondary`, 한 줄) · line(칸 사이 `border.default`). compact: dots(점 8, 사이 `space.4`. 결재 5색 `approval.*.default`로 채운 원, 대기는 `border.strong` 빈 원) · summary("2/3 합의", tabular, `density.body-font-size`).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `approvers` | `ApprovalLineApprover[]` |  | 필수 | 결재자(이름 · 직함 · 역할 · 상태 · 시각 · 의견) |
| `orientation` | `'horizontal' \| 'vertical'` | `"horizontal"` |  | 방향(본문 위는 가로, 좁은 패널은 세로) |
| `variant` | `'default' \| 'compact'` | `"default"` |  | 사람마다 칸 · 점 + 단계 한 줄(표 칸) |

## Variants

variant default(사람마다 칸, 기본) · compact(점 + 단계 한 줄). default는 orientation horizontal(문서 본문 위, 기본) · vertical(좁은 패널 · 모바일). 진행(pending) 칸은 테두리가 `approval.pending.default`로 강조된다. compact는 orientation을 쓰지 않는다.

## States

지원 상태: `default`

default(데이터 상태). 결재 상태는 Badge의 결재 5색과 대기(neutral)로 그린다. hover · active · focus · disabled · loading · error는 해당 없음.

## 동작

표시 전용. role을 생략하면 첫 칸 기안 · 마지막 칸 승인 · 사이 검토. compact의 단계 글자는 지금 단계(진행 칸 → 반려 · 회수 칸 → 마지막으로 처리한 칸, contracts `approvalLineSummary`)의 "번호/전체 역할"이고, 마우스를 올리면 칸마다 "역할 이름 상태"가 `title`로 보인다. comment는 한 줄로 자르고 전체 글은 `title` 속성으로 보인다. 반려 사유를 길게 보여 줄 때는 화면이 Dialog로 연다.

좁은 폭(R-T14): 루트는 `min-width: 0` · `max-width: 100%`라 flex · grid 부모 안에서 줄어든다. 의견 칸은 `contain: inline-size`로 글자 폭을 빼고 재므로 긴 의견이 결재선과 부모(결재 문서 머리 · 카드)의 최소 폭을 넓히지 않는다. 344 폭에서도 본문이 가로로 넘치지 않는다. 의견 폭은 칸이 정한다(가로 칸 폭 · 세로 줄 전체).

## 접근성

`<ol aria-label="결재선">`, 진행 칸에 `aria-current="step"`. 칸마다 역할 · 이름 · 직함 · 상태 글자가 순서대로 읽힌다. 상태는 색 + 점 + 글자. compact는 점을 감추고 "3/4 검토" 뒤에 숨은 글자(지금 상태 + 칸마다 역할 · 이름 · 상태)를 읽는다.

## 밀도

칸 폭 최소 `space.64` × 2, 안쪽 여백 `space.8`. 밀도와 관계없다. compact는 글자 `density.body-font-size`, 줄을 넘기지 않는다.

## 플랫폼 차이

네이티브는 세로가 기본이고 가로는 넘치면 가로 스크롤. props는 같다.

## 금지 사항

결재 상태를 Badge approval · 결재 5색 밖의 색으로 그리기 · 결재 어휘 바꾸기(상신 · 완료 · 거부) · 결재선을 Stepper로 · 결재 단계 점을 블록이 CSS로 직접(R-T24 → compact) — 리뷰(components.md §10 ApprovalFlow).

## 예시

### 구매 품의

기안부터 승인까지 가로 칸. 지금 결재할 칸이 강조된다

```tsx
import { ApprovalLine } from '@terracelab/trellis-react';

const PURCHASE_LINE = [
  { id: 'u1', name: '김지훈', title: '대리', state: 'draft', time: '11-03 09:12' },
  {
    id: 'u2',
    name: '이수민',
    title: '과장',
    state: 'approved',
    time: '11-03 13:40',
    comment: '단가 비교표 확인했습니다',
  },
  { id: 'u3', name: '박서연', title: '팀장', state: 'pending' },
  { id: 'u4', name: '정우성', title: '이사', state: 'waiting' },
] as const;

function Purchase() {
  return <ApprovalLine approvers={PURCHASE_LINE} />;
}
```

### 반려(세로)

좁은 패널에서는 세로로. 사유는 한 줄로 자르고 전체는 마우스를 올리면 보인다

```tsx
import { ApprovalLine } from '@terracelab/trellis-react';

const REJECTED_LINE = [
  { id: 'u1', name: '최하늘', title: '사원', state: 'draft', time: '11-05 10:02' },
  {
    id: 'u2',
    name: '한도윤',
    title: '팀장',
    role: '합의',
    state: 'rejected',
    time: '11-05 16:18',
    comment: '수입 통관 비용이 견적에서 빠졌습니다. 관세 · 부가세 포함으로 다시 올려 주세요',
  },
  { id: 'u3', name: '정우성', title: '이사', state: 'waiting' },
] as const;

function RejectedVertical() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 5)' }}>
      <ApprovalLine approvers={REJECTED_LINE} orientation="vertical" />
    </div>
  );
}
```

### 좁은 카드(344)

긴 반려 의견도 한 줄로 자르고 카드 폭을 넓히지 않는다

```tsx
import { ApprovalLine } from '@terracelab/trellis-react';

const REJECTED_LINE = [
  { id: 'u1', name: '최하늘', title: '사원', state: 'draft', time: '11-05 10:02' },
  {
    id: 'u2',
    name: '한도윤',
    title: '팀장',
    role: '합의',
    state: 'rejected',
    time: '11-05 16:18',
    comment: '수입 통관 비용이 견적에서 빠졌습니다. 관세 · 부가세 포함으로 다시 올려 주세요',
  },
  { id: 'u3', name: '정우성', title: '이사', state: 'waiting' },
] as const;

function Narrow() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-12)',
        width: 'calc(var(--tl-space-64) * 5 + var(--tl-space-24))',
        padding: 'var(--tl-space-16)',
        border: 'var(--tl-border-width-1) solid var(--tl-color-border-divider)',
        borderRadius: 'var(--tl-radius-lg)',
      }}
    >
      <strong>수입 통관 비용 품의</strong>
      <ApprovalLine approvers={REJECTED_LINE} orientation="vertical" />
    </div>
  );
}
```

### 점 모양(compact)

표 칸 · 목록 행에서 결재 5색 점과 "3/4 검토" 한 줄. 대기는 빈 원, 마우스를 올리면 칸마다 상태

```tsx
import { ApprovalLine } from '@terracelab/trellis-react';

const PURCHASE_LINE = [
  { id: 'u1', name: '김지훈', title: '대리', state: 'draft', time: '11-03 09:12' },
  {
    id: 'u2',
    name: '이수민',
    title: '과장',
    state: 'approved',
    time: '11-03 13:40',
    comment: '단가 비교표 확인했습니다',
  },
  { id: 'u3', name: '박서연', title: '팀장', state: 'pending' },
  { id: 'u4', name: '정우성', title: '이사', state: 'waiting' },
] as const;

const REJECTED_LINE = [
  { id: 'u1', name: '최하늘', title: '사원', state: 'draft', time: '11-05 10:02' },
  {
    id: 'u2',
    name: '한도윤',
    title: '팀장',
    role: '합의',
    state: 'rejected',
    time: '11-05 16:18',
    comment: '수입 통관 비용이 견적에서 빠졌습니다. 관세 · 부가세 포함으로 다시 올려 주세요',
  },
  { id: 'u3', name: '정우성', title: '이사', state: 'waiting' },
] as const;

const DONE_LINE = [
  { id: 'u1', name: '오세훈', title: '책임', state: 'draft' },
  { id: 'u2', name: '박서연', title: '팀장', state: 'approved' },
] as const;

function Compact() {
  return (
    <dl
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 'var(--tl-space-8) var(--tl-space-24)',
        margin: 0,
      }}
    >
      <dt>구매 품의</dt>
      <dd style={{ margin: 0 }}>
        <ApprovalLine variant="compact" approvers={PURCHASE_LINE} />
      </dd>
      <dt>수입 통관 비용</dt>
      <dd style={{ margin: 0 }}>
        <ApprovalLine variant="compact" approvers={REJECTED_LINE} />
      </dd>
      <dt>출장비 정산</dt>
      <dd style={{ margin: 0 }}>
        <ApprovalLine variant="compact" approvers={DONE_LINE} />
      </dd>
    </dl>
  );
}
```
