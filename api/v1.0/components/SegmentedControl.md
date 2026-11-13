# SegmentedControl

> `@terracelab/trellis-react` · CSS `.tl-segmented-control` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { SegmentedControl } from '@terracelab/trellis-react';
```

## 용도

같은 목록의 보기 · 범위를 2~5개 중 하나로 바꾼다(전체 · 진행 · 승인, 일 · 주 · 월). 화면 내용이 통째로 바뀌면 Tabs, 폼 값이면 RadioGroup.

## 해부(Anatomy)

root(`bg.sunken`, `radius.md`, 안쪽 여백 2) · segment(`radius.sm`, `type.label`, `fg.secondary`) · icon(16) · count(`font.numeric`, `fg.tertiary`).
선택된 segment는 `bg.surface` + `shadow.sm` + `fg.primary` 600.

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `options` | `SegmentedOption[]` |  | 필수 | 칸(2~5개) |
| `value` | `string` |  |  | 값(제어) |
| `defaultValue` | `string` |  |  | 처음 값(없으면 첫 칸) |
| `onChange` | `(value: string) => void` |  |  | 바뀔 때 |
| `size` | `'sm' \| 'md'` | `"md"` |  | 높이 |
| `fullWidth` | `boolean` | `false` |  | 부모 폭 전체 |
| `disabled` | `boolean` | `false` |  | 비활성 |
| `name` | `string` |  |  | 폼 이름 |
| `label` | `string` |  |  | 접근성 이름(Field 밖) |

## Variants

size sm · md(`density.control-height-sm/md`), fullWidth(칸 같은 폭), icon · count 유무.

## States

지원 상태: `default` · `hover` · `focus` · `disabled`

default · hover(segment `fg.primary`) · focus(segment 링) · disabled(전체 `fg.disabled`). active · loading · error는 해당 없음.

## 동작

누르면 바로 바뀐다. Tab으로 들어오면 선택된 칸에 포커스, 화살표 키로 옮기면서 고른다. 하나는 항상 선택되어 있다(defaultValue가 없으면 첫 칸). count는 99를 넘으면 99+.

## 접근성

Base UI RadioGroup으로 `role="radiogroup"` + 각 칸 `role="radio"`. 칸 이름은 라벨 + 건수(진행 12건, "건"은 화면에 숨긴 글자). Field 안이면 Field 라벨이, 밖이면 label prop이 그룹 이름. 포커스 링은 칸에 항상 보인다.

## 밀도

높이 `density.control-height-sm/md`, 칸 좌우 여백 `space.12`(sm `space.8`).

## 플랫폼 차이

네이티브는 같은 모양의 Pressable 줄, 화살표 키 없음.

## 금지 사항

5개 넘는 칸(Select · Tabs) · 칸마다 다른 동작 실행(버튼 묶음) · 라벨 없이 아이콘만 → 리뷰.

## 예시

### 결재 상태 필터

칸마다 건수

```tsx
import { SegmentedControl } from '@terracelab/trellis-react';

function ApprovalFilter() {
  return (
    <SegmentedControl
      label="결재 상태"
      defaultValue="pending"
      options={[
        { value: 'all', label: '전체', count: 48 },
        { value: 'pending', label: '진행', count: 12 },
        { value: 'approved', label: '승인', count: 31 },
        { value: 'rejected', label: '반려', count: 5 },
      ]}
    />
  );
}
```

### 보기 전환

아이콘 · 작은 크기 · 부모 폭

```tsx
import { SegmentedControl } from '@terracelab/trellis-react';

function Views() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-12)',
        maxWidth: 'calc(var(--tl-space-64) * 5)',
      }}
    >
      <SegmentedControl
        label="보기"
        options={[
          { value: 'table', label: '표', icon: 'table' },
          { value: 'chart', label: '차트', icon: 'chart-bar' },
        ]}
      />
      <SegmentedControl
        label="집계 단위"
        size="sm"
        fullWidth
        defaultValue="month"
        options={[
          { value: 'day', label: '일' },
          { value: 'week', label: '주' },
          { value: 'month', label: '월' },
          { value: 'quarter', label: '분기' },
        ]}
      />
    </div>
  );
}
```
