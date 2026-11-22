# Tag

> `@terracelab/trellis-react` · CSS `.tl-tag` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { Tag } from '@terracelab/trellis-react';
```

## 용도

분류 · 키워드 · 사람처럼 상태가 아닌 라벨 하나를 칩으로 보여 줄 때 쓴다. `onRemove`가 있으면 × 단추로 뺄 수 있다. 상태 뜻(승인 · 지연 · 오류)은 Badge · StatusDot, 고르는 칩 묶음은 FilterBar 칩 · SegmentedControl, 칩을 치고 넣는 칸은 TagInput.

## 해부(Anatomy)

root(`span`, `tl-tag`) · icon(16, `fg.secondary`) 또는 person(Avatar 원 24, 꾸밈) · label(`type.label` 500, sm은 `type.caption`, 넘치면 말줄임) · remove(`button`, 보이는 칸 16 · 누르는 영역 24, `x` 아이콘 `fg.secondary`). 면 `bg.sunken`, 테두리 `border.divider` 1px, 모서리 `radius.sm`(사람 칩은 `radius.full`).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` |  |  | 라벨 |
| `variant` | `'subtle' \| 'outline'` | `"subtle"` |  | 모양(subtle 옅은 면 · outline 테두리만). 상태 색 없음 |
| `size` | `'sm' \| 'md'` | `"md"` |  | 높이(sm 20 · md 24) |
| `icon` | `IconName` |  |  | 앞 아이콘 |
| `person` | `{ name, src? }` |  |  | 앞 사람 아바타(원 24) |
| `onRemove` | `() => void` |  |  | × 단추를 누를 때(있으면 단추가 생긴다) |
| `label` | `string` |  |  | × 단추 이름의 라벨(기본 children 글자 · person 이름) |
| `disabled` | `boolean` | `false` |  | 비활성(× 단추 없음) |

## Variants

variant 2 × size 2. 색은 중립 하나다. 톤 prop이 없다(상태는 Badge).

| variant | 면 | 테두리 | 글자 |
|---|---|---|---|
| subtle(기본) | `bg.sunken` | `border.divider` | `fg.primary` |
| outline | 없음 | `border.strong` | `fg.primary` |

| size | 높이 | 좌우 여백 | 글자 |
|---|---|---|---|
| sm | `space.20` | `space.6` | `type.caption` |
| md(기본) | `space.24` | `space.8` | `type.label` |

person이 있으면 크기와 관계없이 높이 24, 앞 여백 0, 원 아바타가 앞 끝에 붙는 알약 모양이다.

## States

지원 상태: `default` · `hover` · `focus` · `disabled`

default · hover(× 단추 면 `fg.primary` 10% 섞음 + 아이콘 `fg.primary`, `duration.fast`) · focus(× 단추 포커스 링) · disabled(글자 `fg.disabled`, × 단추 없음, `aria-disabled`). active · loading · error는 해당 없음. 칩 자체는 누르는 부품이 아니다.

## 동작

× 단추를 누르면(마우스 · Enter · Space) `onRemove`를 부른다. 칩을 목록에서 빼는 것은 부르는 쪽이다(컨트롤드). 빼고 나서 초점은 부르는 쪽이 옮긴다(TagInput은 입력 칸으로).

| 키 | 동작 |
|---|---|
| Tab | × 단추로 초점 |
| Enter · Space | 빼기(onRemove) |

## 접근성

× 단추 이름은 "<라벨> 삭제"(`tag.remove`). 라벨이 글자가 아니면 `label`로 준다. 사람 칩의 아바타는 꾸밈이고 이름 글자가 읽힌다. 글자 대비 `fg.primary` / `bg.sunken` 4.5:1 이상, × 아이콘 `fg.secondary` 3:1 이상. 누르는 영역은 보이는 칸 밖으로 24(WCAG 2.5.8).

## 밀도

치수가 밀도와 관계없다(칩 높이는 글줄 높이에 맞춘다). TagInput이 칸 크기에 맞춰 size를 고른다(xs · sm 칸 = sm 칩).

## 플랫폼 차이

네이티브는 View + Text, × 단추는 Pressable(hitSlop 4). props는 같다.

## 금지 사항

상태(승인 · 지연)를 Tag 색으로 → Badge · StatusDot · 행마다 색 칩을 줄줄이(상태는 점 · 글자) · Tag를 단추처럼 누르게 · 사람 칩 아바타를 직접 그리기(Avatar 규칙) → 리뷰.

## 예시

### 분류 · 키워드

중립 한 가지 색이다. 지울 수 있는 칩은 끝에 × 단추

```tsx
import { Tag } from '@terracelab/trellis-react';

const ROW = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--tl-space-8)',
  alignItems: 'center',
} as const;

function Basic() {
  return (
    <div style={ROW}>
      <Tag onRemove={() => undefined}>냉장</Tag>
      <Tag>수입 식자재</Tag>
      <Tag icon="tag">행사 상품</Tag>
      <Tag variant="outline">반품 가능</Tag>
    </div>
  );
}
```

### 지우기

× 단추 이름은 "<라벨> 삭제"이고 Tab으로 닿는다

```tsx
import { useState } from 'react';
import { Tag } from '@terracelab/trellis-react';

const ROW = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--tl-space-8)',
  alignItems: 'center',
} as const;

function Removable() {
  const [tags, setTags] = useState(['거래처 미팅', '견적 요청', '샘플 발송', '재계약']);
  return (
    <div style={ROW}>
      {tags.map((tag) => (
        <Tag key={tag} onRemove={() => setTags((all) => all.filter((x) => x !== tag))}>
          {tag}
        </Tag>
      ))}
      {tags.length === 0 && <span>태그가 없습니다</span>}
    </div>
  );
}
```

### 사람 칩

원 아바타 24 + 이름. 참조자 · 참석자처럼 사람을 넣고 빼는 자리

```tsx
import { Tag } from '@terracelab/trellis-react';

const ROW = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--tl-space-8)',
  alignItems: 'center',
} as const;

function People() {
  return (
    <div style={ROW}>
      <Tag person={{ name: '한서연' }} onRemove={() => undefined} />
      <Tag person={{ name: '정민호' }} onRemove={() => undefined} />
      <Tag person={{ name: '박서연' }} />
    </div>
  );
}
```

### 크기

sm은 표 칸 · 카드, md는 입력 칸 · 필터. 비활성은 × 단추가 없다

```tsx
import { Tag } from '@terracelab/trellis-react';

const ROW = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--tl-space-8)',
  alignItems: 'center',
} as const;

function Sizes() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-12)' }}>
      <div style={ROW}>
        <Tag size="sm">냉동</Tag>
        <Tag size="sm" variant="outline">
          유통기한 임박
        </Tag>
        <Tag size="sm" onRemove={() => undefined}>
          본사 창고
        </Tag>
      </div>
      <div style={ROW}>
        <Tag>냉동</Tag>
        <Tag variant="outline">유통기한 임박</Tag>
        <Tag disabled onRemove={() => undefined}>
          본사 창고
        </Tag>
      </div>
    </div>
  );
}
```
