# FormSection

> `@terracelab/trellis-react` · CSS `.tl-form-section` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { FormSection } from '@terracelab/trellis-react';
```

## 용도

폼의 묶음 하나(기본 정보 · 공급받는 자 · 결제 조건). Field를 격자로 놓는다.

## 해부(Anatomy)

`<fieldset>` · legend(title `type.h3`) · description(`type.caption`) · action · grid(열 1 · 2 · 3, 간격 `density.gutter`).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `title` | `string` |  |  | 묶음 제목 |
| `description` | `string` |  |  | 설명 한 문장 |
| `columns` | `1 \| 2 \| 3` | `2` |  | 격자 열 수 |
| `action` | `ReactNode` |  |  | 제목 오른쪽 동작 |
| `collapsible` | `boolean` | `false` |  | 접을 수 있는 묶음(선택 항목) |
| `open` | `boolean` |  |  | 펼침(제어) |
| `defaultOpen` | `boolean` | `false` |  | 처음 펼침(비제어) |
| `onOpenChange` | `(open: boolean) => void` |  |  | 펼침이 바뀔 때 |
| `children` | `ReactNode` |  |  | Field 목록 |

## Variants

columns 1 · 2 · 3. Field의 span으로 칸을 합친다.

## States

지원 상태: `default`

default만. 묶음 자체는 상호작용이 없다. `collapsible`의 접는 단추는 단추 문법(가리킴 · 포커스 링 `tl-focusable`)을 따르고, 접힌 동안 안은 `inert`다.

## 동작

1024 미만에서는 열 수와 무관하게 한 열. **접기**: collapsible이면 제목 줄이 펼침 단추(앞 chevron, 펼치면 90도)가 되고 기본은 접힘이다(defaultOpen · open/onOpenChange). 등록 시트의 선택 항목(메모 · 증빙 · 시리얼 · 업태 · 주소)을 접어 휴대폰에서 저장 단추까지 스크롤을 줄인다. 접혀 있으면 제목 옆에 채운 칸 수("입력 2개", 흐린 글자, 0이면 없음)를 보인다. Field마다 입력 글자 · 체크 · 숨은 입력 값 · `data-filled`(단추 모양 입력) 중 하나라도 있으면 채운 칸이다. 접어도 입력은 그대로 남고(inert로 포커스 · 낭독에서 뺀다) 펼치면 이어서 쓴다. 안에 Field 오류가 새로 생기면(검증 뒤) 저절로 펼쳐 숨은 오류를 남기지 않는다. 사람이 다시 접으면 같은 오류로 또 펼치지 않는다. 펼침은 높이 전환(`duration.200`), reduced-motion이면 바로.

## 접근성

`<fieldset>` + `<legend>`로 묶음 이름을 읽는다. fieldset 이름은 제목(aria-labelledby). 접는 묶음의 제목 단추는 aria-expanded · aria-controls를 갖고 Enter · Space로 펼친다.

## 밀도

격자 간격 `density.gutter`.

## 플랫폼 차이

네이티브는 항상 한 열. 접기는 네이티브 다음 Phase(같은 contract).

## 금지 사항

묶음 안에 묶음.

## 예시

### 두 열

공급받는 자 정보

```tsx
import { Field, Input, FormSection } from '@terracelab/trellis-react';

function TwoColumns() {
  return (
    <FormSection title="공급받는 자" description="세금계산서에 그대로 찍힙니다">
      <Field label="상호" required>
        <Input defaultValue="(주)한빛무역" />
      </Field>
      <Field label="사업자등록번호" required>
        <Input defaultValue="214-86-30127" />
      </Field>
      <Field label="주소" span={2}>
        <Input defaultValue="서울특별시 중구 세종대로 110" />
      </Field>
    </FormSection>
  );
}
```

### 선택 항목 접기

꼭 필요한 칸 아래에 접어 둔다. 접혀 있으면 채운 칸 수, 안에 오류가 생기면 저절로 펼친다

```tsx
import { Field, Input, FormSection } from '@terracelab/trellis-react';

function OptionalCollapsed() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-24)' }}>
      <FormSection title="거래" columns={2}>
        <Field label="거래처" required>
          <Input defaultValue="대양상사" />
        </Field>
        <Field label="금액" required>
          <Input defaultValue="1,320,000" />
        </Field>
      </FormSection>
      <FormSection title="선택 항목" columns={2} collapsible>
        <Field label="메모">
          <Input defaultValue="11월 1차 납품분" />
        </Field>
        <Field label="증빙 번호">
          <Input />
        </Field>
      </FormSection>
    </div>
  );
}
```
