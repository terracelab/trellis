# Badge

> `@terracelab/trellis-react` · CSS `.tl-badge` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { Badge } from '@terracelab/trellis-react';
```

## 용도

행 · 카드의 상태 하나를 짧은 글자로. 결재 5상태와 업종 어휘(입고 · 발행 · 설비 …)가 모두 이 문법을 쓴다.

## 해부(Anatomy)

root(반경 full, `type.caption` 600) · dot(톤의 default 색) · label(`fg.primary`). 상태 색 글자는 대비 4.5:1을 못 넘어 글자는 중립, 상태는 점 + 바탕으로 보인다. DataGrid 셀 안에서는 점이 있는 subtle 배지가 바탕 없이 점 + 글자로 줄어든다(줄마다 알약이 서면 열 전체가 색 띠가 된다).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `tone` | `'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `"neutral"` |  | 상태 톤 |
| `approval` | `ApprovalState` |  |  | 결재 상태(전자결재 전용) |
| `variant` | `'subtle' \| 'solid' \| 'outline'` | `"subtle"` |  | 모양 |
| `dot` | `boolean` |  |  | 앞 점(subtle · outline 기본 표시, neutral은 기본 없음) |
| `size` | `'sm' \| 'md'` | `"md"` |  | 크기 |
| `children` | `ReactNode` |  |  | 라벨 |

## Variants

tone 5 · approval 5 × variant 3 × size 2.

## States

지원 상태: `default`

default(데이터 상태이지 상호작용 상태가 아니다).

## 동작

approval이 있으면 라벨이 없을 때 결재 라벨(기안 · 진행 · 승인 · 반려 · 회수)을 쓴다. 점은 상태를 말할 때만 보인다(PR-38): subtle · outline은 기본으로 점이 있고, tone이 neutral이면 기본 점이 없다(회색 점은 정보가 없다. 역할 · 기한 D-10 같은 글자는 글자만). 결재 상태(approval)는 늘 점이 있다. dot을 주면 그 값이 이긴다. 점은 두 가지 뜻에만 쓴다: 상태(StatusDot · Badge 점)와 범주 식별(범주 태그, PR-33). 모듈 · 역할을 점으로 보이지 않는다. solid는 `status.*.default` 바탕 + `status.*.on` 글자.

## 접근성

상태는 색 + 점 + 글자. 색만으로 구분하지 않는다.

## 밀도

md 20 · sm 16 높이.

## 플랫폼 차이

없음.

## 금지 사항

결재 색을 주문 · 신고 단계에 쓰기(어휘의 tone을 쓴다) · 문장을 배지에 넣기.

## 예시

### 업종 어휘

어휘의 tone을 그대로 넘긴다(세금계산서 상태)

```tsx
import { INVOICE_STATES } from '@terracelab/trellis-contracts';
import { Badge } from '@terracelab/trellis-react';

function Vocabulary() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-8)', flexWrap: 'wrap' }}>
      {Object.entries(INVOICE_STATES).map(([key, s]) => (
        <Badge key={key} tone={s.tone}>
          {s.label}
        </Badge>
      ))}
    </div>
  );
}
```

### 결재

전자결재에만 쓰는 5상태

```tsx
import { Badge } from '@terracelab/trellis-react';

function Approval() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-8)', flexWrap: 'wrap' }}>
      <Badge approval="draft" />
      <Badge approval="pending" />
      <Badge approval="approved" />
      <Badge approval="rejected" />
      <Badge approval="withdrawn" />
    </div>
  );
}
```

### 강조

지연 · 오류는 solid 위험 색

```tsx
import { Badge } from '@terracelab/trellis-react';

function Solid() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-8)' }}>
      <Badge variant="solid" tone="danger">
        3일 경과
      </Badge>
      <Badge variant="solid" tone="warning">
        D-2
      </Badge>
      <Badge variant="outline">수입</Badge>
    </div>
  );
}
```
