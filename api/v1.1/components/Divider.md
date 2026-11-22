# Divider

> `@terracelab/trellis-react` · CSS `.tl-divider` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { Divider } from '@terracelab/trellis-react';
```

## 용도

내용 묶음 사이(가로줄)나 메타 글자 · 도구 사이(세로줄)를 선 하나로 나눌 때 쓴다. 가운데 글자(이전 기록 · 또는)를 둘 수 있다. 카드 · 표 · 패널의 테두리는 그 컴포넌트가 그리므로 Divider를 겹쳐 넣지 않는다. 큰 묶음 제목은 FormSection · Card 머리, 날짜 줄은 MessageThread가 그린다.

## 해부(Anatomy)

root(`div`, `tl-divider`, role=separator) · 선(`border.width.1`, 색 `border.divider` · strong `border.strong`) · label(가로줄 가운데, `type.caption` `fg.secondary`, 양쪽 선은 가상 요소).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `orientation` | `'horizontal' \| 'vertical'` | `"horizontal"` |  | 방향(가로줄 · 세로줄) |
| `variant` | `'subtle' \| 'strong'` | `"subtle"` |  | 선 색(subtle border.divider · strong border.strong) |
| `spacing` | `'none' \| 'sm' \| 'md' \| 'lg'` | `"none"` |  | 바깥 여백(none 0 · sm 8 · md 16 · lg 24) |
| `label` | `string` |  |  | 가운데 글자(가로줄만) |
| `decorative` | `boolean` | `false` |  | 화면 읽기에서 뺀다(모양만인 선) |

## Variants

orientation 2 × variant 2 × spacing 4.

| variant | 선 색 | 쓰는 곳 |
|---|---|---|
| subtle(기본) | `border.divider` | 묶음 사이 · 메타 글자 사이 |
| strong | `border.strong` | 합계 위 · 큰 묶음 사이 |

spacing은 선 바깥 여백이다(가로줄 위아래 · 세로줄 좌우): none 0 · sm `space.8` · md `space.16` · lg `space.24`. 세로줄은 flex 줄 높이를 채우고 글줄 안에서는 caption 줄 높이다.

## States

지원 상태: `default`

default만. 누르는 부품이 아니다. hover · active · focus · disabled · loading · error는 해당 없음.

## 동작

움직임 · 키보드 조작이 없다. 가운데 글자는 가로줄에서만 그린다(세로줄은 label을 무시한다).

## 접근성

기본은 `role="separator"` + `aria-orientation`. 가운데 글자가 있으면 `aria-label`이 되고 보이는 글자는 aria-hidden이다(separator의 자식은 읽히지 않는다). 모양만인 선(카드 머리 밑줄 같은 장식)은 `decorative`로 화면 읽기에서 뺀다(`aria-hidden`). 선은 글자가 아니므로 대비 예외지만 `border.divider`는 면 위에서 보인다. 가운데 글자 `fg.secondary` 4.5:1 이상.

## 밀도

선 굵기 · 여백이 밀도와 관계없다. 여백을 밀도에 맞추려면 부르는 쪽이 `density.gutter`로 감싼다.

## 플랫폼 차이

네이티브는 View(hairline 대신 `border.width.1`), separator는 `accessibilityRole` 없음 + label이면 Text. props는 같다.

## 금지 사항

카드 · 표 테두리 위에 Divider를 겹치기 · 2px 이상 굵은 선으로 강조 · 상태 색 선(왼쪽 강조 띠 포함, D-57) · 빈 칸을 만드는 용도로 spacing만 쓰기 → 리뷰.

## 예시

### 가로줄

묶음 사이. 여백은 spacing으로 한 번에 정한다

```tsx
import { Divider } from '@terracelab/trellis-react';

const SECTION = { margin: 0, fontSize: 'var(--tl-type-label-font-size)' } as const;

function Basic() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <p style={SECTION}>기본 정보 · 거래처 한결물산 · 담당 정민호</p>
      <Divider spacing="md" />
      <p style={SECTION}>결제 조건 · 월말 마감 다음 달 25일 · 계좌 이체</p>
    </div>
  );
}
```

### 세로줄

메타 글자 · 도구 줄 사이. 줄 높이를 따른다

```tsx
import { Divider } from '@terracelab/trellis-react';

function Vertical() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        color: 'var(--tl-color-fg-secondary)',
        fontSize: 'var(--tl-type-caption-font-size)',
      }}
    >
      <span>작성 2026-11-06</span>
      <Divider orientation="vertical" spacing="sm" />
      <span>수정 2026-11-09</span>
      <Divider orientation="vertical" spacing="sm" />
      <span>조회 42</span>
    </div>
  );
}
```

### 가운데 글자 · 강조 선

글자는 separator 이름이 된다. strong은 합계 위 · 큰 묶음 사이

```tsx
import { Divider } from '@terracelab/trellis-react';

function Labelled() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 6)',
      }}
    >
      <Divider label="이전 기록" />
      <Divider variant="strong" />
      <Divider decorative />
    </div>
  );
}
```
