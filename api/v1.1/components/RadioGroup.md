# RadioGroup

> `@terracelab/trellis-react` · CSS `.tl-radio-group` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { RadioGroup } from '@terracelab/trellis-react';
```

## 용도

2~5개 선택지 중 하나를 고른다(과세 구분 · 결제 조건). 선택지가 많으면 Select, 보기 전환은 SegmentedControl. 예외: LineItemsEditor · DataGrid 칸처럼 줄 안의 칸에서는 선택지가 2~5개라도 Select를 쓴다(줄 높이 안에 라디오 묶음이 들어가지 않는다).

## 해부(Anatomy)

root(radiogroup) · option · radio(16 원, `fg.tertiary` 테두리, `bg.surface`) · dot(선택 시 radio가 `brand.default` 바탕 + `fg.inverse` 점) · label(`density.body-font-size`) · description(`type.caption`, `fg.tertiary`).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `options` | `RadioOption[]` |  | 필수 | 선택지 |
| `value` | `string \| null` |  |  | 값(제어) |
| `defaultValue` | `string \| null` |  |  | 처음 값(비제어) |
| `onChange` | `(value: string) => void` |  |  | 바뀔 때 |
| `orientation` | `'vertical' \| 'horizontal'` | `"vertical"` |  | 배치 방향 |
| `disabled` | `boolean` | `false` |  | 전체 비활성 |
| `name` | `string` |  |  | 폼 이름 |
| `label` | `string` |  |  | 접근성 이름(Field 밖) |

## Variants

orientation vertical(설명이 있을 때) · horizontal(짧은 라벨 3개 이하).

## States

지원 상태: `default` · `hover` · `focus` · `disabled` · `error`

default · hover(radio `border.focus`) · focus(radio 링) · disabled(전체 또는 선택지 하나, `fg.disabled`) · error(Field 오류면 radio 테두리 `status.danger.default`). active · loading은 해당 없음.

## 동작

Base UI RadioGroup. Tab으로 그룹에 들어오면 선택된 항목(없으면 첫 항목)에 포커스, 화살표 키로 옮기면서 바로 고른다. 라벨을 눌러도 고른다. value를 주면 제어, defaultValue면 비제어.

## 접근성

`role="radiogroup"` + 각 `role="radio"`. Field 안이면 Field 라벨이 `aria-labelledby`로 그룹 이름이 되고, 밖이면 label prop이 `aria-label`이 된다. 선택지 설명은 radio의 `aria-describedby`. radio 테두리 `fg.tertiary`는 바탕 대비 3:1 이상. 포커스 링은 radio에 항상 보인다.

## 밀도

radio 16 고정. vertical 항목 사이 `space.8`, horizontal 항목 사이 `space.16`.

## 플랫폼 차이

네이티브는 Pressable 목록, 화살표 키 대신 각 항목을 누른다.

## 금지 사항

선택지 하나짜리 RadioGroup(Checkbox) · 6개 넘는 선택지(Select) · 그룹 이름 없음 → 리뷰.

## 예시

### 과세 구분

Field 라벨이 그룹 이름이 된다

```tsx
import { Field, RadioGroup } from '@terracelab/trellis-react';

const TAX_TYPES = [
  { value: 'tax', label: '과세', description: '공급가액의 10%를 세액으로 계산합니다' },
  { value: 'zero', label: '영세율', description: '수출 · 내국신용장 거래' },
  { value: 'free', label: '면세', description: '미가공 식료품 등', disabled: true },
];

function Vertical() {
  return (
    <Field label="과세 구분" required>
      <RadioGroup options={TAX_TYPES} defaultValue="tax" name="taxType" />
    </Field>
  );
}
```

### 가로 배치

짧은 라벨 3개 이하

```tsx
import { RadioGroup } from '@terracelab/trellis-react';

function Horizontal() {
  return (
    <RadioGroup
      label="결제 조건"
      orientation="horizontal"
      defaultValue="credit"
      options={[
        { value: 'cash', label: '현금' },
        { value: 'credit', label: '외상' },
        { value: 'bill', label: '어음' },
      ]}
    />
  );
}
```
