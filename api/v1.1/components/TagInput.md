# TagInput

> `@terracelab/trellis-react` · CSS `.tl-tag-input` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { TagInput } from '@terracelab/trellis-react';
```

## 용도

값 여러 개를 칩으로 넣고 빼는 칸을 보여 줄 때 쓴다. text 모드는 키워드 · 분류(추천에 없는 글자도 넣는다), person 모드는 참조자 · 참석자 · 담당자처럼 사람을 칩(아바타 + 이름)으로 넣는다(R-T25). 정해진 선택지에서 여러 개 고르기만 하면 MultiSelect, 하나만 찾아 고르면 CodeSearch, 칩 하나 보여 주기는 Tag.

## 해부(Anatomy)

root(`tl-tag-input`) · box(Input과 같은 칸: `bg.surface`, `border.strong` 1px, `radius.md`, 최소 높이 `density.control-height-*`) · tags(`ul`, Tag 칩. person은 원 아바타 24) · control(`input` role=combobox, 글자 `density.input-font-size`) · popup(칸 바로 아래, `bg.elevated` · `border.default` · `shadow.md` · `z.dropdown`) · option(행 높이 `density.row-height`, 가리킨 행 `bg.sunken`. person은 PersonLabel sm) · 추가 줄('"글자" 추가', `fg.link` + plus 아이콘) · 빈 글자 · 알림 줄(`aria-live`) · 숨은 입력(`name`이 있으면 값마다).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `value` | `string[]` |  |  | 넣은 값들(제어). person은 사람 id |
| `defaultValue` | `string[]` |  |  | 처음 값 |
| `onChange` | `(value: string[]) => void` |  |  | 바뀔 때(값 전부) |
| `suggestions` | `TagSuggestion[]` |  |  | 추천(value · label · meta · src · disabled). 입력하면 거른다 |
| `mode` | `'text' \| 'person'` | `"text"` |  | text 글자 칩 · person 사람 칩(아바타 + 이름) |
| `allowCustom` | `boolean` |  |  | 추천에 없는 글자 넣기(기본 text = true · person = false) |
| `max` | `number` |  |  | 최대 개수(다 차면 입력 잠김) |
| `placeholder` | `string` |  |  | 비어 있을 때 예시 글자 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `"md"` |  | 최소 높이(칩이 넘치면 줄이 늘어난다) |
| `disabled` | `boolean` | `false` |  | 비활성 |
| `invalid` | `boolean` | `false` |  | 오류 표시 |
| `required` | `boolean` | `false` |  | 필수 |
| `name` | `string` |  |  | 폼 이름(값마다 숨은 입력) |
| `label` | `string` |  |  | Field 밖 접근성 이름 |

## Variants

mode 2 × size 5. 칸 높이는 Input과 같고(xs 26 · sm 30 · md 36 · lg 42 · xl 48) 칩이 넘치면 줄이 늘어난다. 칩 크기는 xs · sm 칸 = Tag sm, md 이상 = Tag md.

| mode | 칩 | 추천 행 | 추천에 없는 글자 |
|---|---|---|---|
| text(기본) | Tag 글자 | 이름 + 보조 글자 | 넣는다(allowCustom 기본 true) |
| person | Tag person(원 아바타 24 + 이름) | PersonLabel sm(아바타 · 이름 · 직책) | 넣지 않는다(기본 false) |

## States

지원 상태: `default` · `hover` · `focus` · `disabled` · `error`

default · hover(칸 테두리 `border.hover`) · focus(칸 테두리 · 1px 링 `border.focus`) · disabled(면 `bg.sunken`, 테두리 없음, 칩 × 단추 없음) · error(테두리 `status.danger.default`, `aria-invalid`). active · loading은 해당 없음.

## 동작

글자를 치면 추천이 이름 · 값 · 보조 글자로 걸러져 칸 아래에 열린다(contracts `filterTagSuggestions`, 넣은 값은 빠진다). 칸을 누르거나 ↓로도 연다.

| 키 | 동작 |
|---|---|
| ↓ · ↑ | 추천 행 가리키기(목록이 닫혀 있으면 ↓가 연다) |
| Enter | 가리킨 행을 넣는다. 가리킨 행이 없으면 친 글자를 넣는다(추천 이름과 같으면 그 추천, 아니면 allowCustom일 때 글자 그대로) |
| 쉼표 | text 모드에서 친 글자를 넣는다 |
| Backspace | 빈 칸에서 마지막 칩을 뺀다 |
| Escape | 목록을 닫는다. 닫혀 있으면 친 글자를 지운다 |
| Tab | 칩 × 단추 · 다음 칸으로 |

person 모드는 첫 추천을 바로 가리켜 Enter가 첫 사람을 넣는다. text 모드는 화살표로 고를 때만 가리켜 Enter가 친 글자를 넣는다. 한글 조합 중 Enter · 쉼표는 조합을 끝내는 키라 칩을 만들지 않는다. 쉼표 · 줄바꿈 · 탭이 든 글자를 붙여 넣으면 나눠서 한 번에 넣는다(`splitTagText`, text 모드). text 모드는 칸을 떠날 때 남은 글자를 칩으로 넣는다. 추천을 누르는 동안 입력 칸은 초점을 잃지 않는다. `max`에 닿으면 입력 칸이 읽기 전용이 되고 자리 글자가 "최대 N개를 넣었습니다"로 바뀐다. value를 주면 컨트롤드, defaultValue는 언컨트롤드다. person 모드의 값은 사람 id이고 칩 이름 · 사진은 suggestions에서 찾는다.

## 접근성

입력 칸은 `role="combobox"` + `aria-expanded` · `aria-controls` · `aria-activedescendant`(가리킨 행), 목록은 `role="listbox"`, 행은 `role="option"` + `aria-selected`. 이름은 Field 라벨(`<label for>`) 또는 `label`. 넣은 칩 목록은 `ul` "넣은 항목", × 단추 이름은 "<이름> 삭제". 넣기 · 빼기 · 한도는 `aria-live` 알림 줄이 읽는다("한서연 추가했습니다"). 오류는 Field 오류 글자 + `aria-invalid`. 대비: 글자 `fg.primary`, 자리 글자 `fg.tertiary`, 보조 글자 `fg.secondary`(다크 elevated 위 4.5:1).

## 밀도

칸 최소 높이 `density.control-height-*`(touch는 44 · 48 · 56), 입력 글자 `density.input-font-size`(touch 16, iOS 확대 방지), 추천 행 `density.row-height`.

## 플랫폼 차이

웹은 칸 바로 아래 목록(대화 상자 위에도 뜬다, `z.dropdown`). 네이티브는 칸 아래 목록 대신 아래 시트에서 찾는다. props는 같다.

## 금지 사항

상태 고르기에 TagInput → MultiSelect · 사람 칩을 CSS로 직접(R-T25) → TagInput person · 추천에 없는 사람을 글자로 넣기 · 칩 색으로 상태 표시 · 칸 안에 칩 대신 "외 3명" 글자 → 리뷰.

## 예시

### 키워드

치면 추천이 걸러진다. 추천에 없는 글자도 Enter · 쉼표 · 붙여 넣기로 칩이 된다

```tsx
import type { TagSuggestion } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { Field, TagInput } from '@terracelab/trellis-react';

const KEYWORDS: TagSuggestion[] = [
  { value: '냉장', label: '냉장' },
  { value: '냉동', label: '냉동' },
  { value: '수입 식자재', label: '수입 식자재' },
  { value: '행사 상품', label: '행사 상품' },
  { value: '유통기한 임박', label: '유통기한 임박' },
];

function Keywords() {
  const [tags, setTags] = useState<string[]>(['냉장', '행사 상품']);
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <Field
        label="상품 태그"
        help="Enter나 쉼표로 넣습니다. 빈 칸에서 Backspace는 마지막 태그를 뺍니다"
      >
        <TagInput value={tags} onChange={setTags} suggestions={KEYWORDS} placeholder="냉장" />
      </Field>
    </div>
  );
}
```

### 참조자

사람 모드는 사람 칩(아바타 + 이름)이고 목록에 있는 사람만 넣는다. 값은 사번

```tsx
import type { TagSuggestion } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { Field, TagInput } from '@terracelab/trellis-react';

const PEOPLE: TagSuggestion[] = [
  { value: 'E-0012', label: '한서연', meta: '인사팀 · 매니저' },
  { value: 'E-0031', label: '정민호', meta: '영업팀 · 책임' },
  { value: 'E-0044', label: '박서연', meta: '재무팀 · 선임' },
  { value: 'E-0052', label: '이도윤', meta: '구매팀 · 주임' },
  { value: 'E-0067', label: '최하늘', meta: '물류팀 · 사원' },
];

function People() {
  const [cc, setCc] = useState<string[]>(['E-0031']);
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <Field label="참조" help={`${cc.length}명. 결재가 끝나면 알림을 받습니다`}>
        <TagInput
          mode="person"
          value={cc}
          onChange={setCc}
          suggestions={PEOPLE}
          placeholder="이름 · 부서"
          name="cc"
        />
      </Field>
    </div>
  );
}
```

### 한도 · 오류 · 비활성

max에 닿으면 입력 칸이 잠기고 그 사실을 읽어 준다

```tsx
import type { TagSuggestion } from '@terracelab/trellis-contracts';
import { Field, TagInput } from '@terracelab/trellis-react';

const KEYWORDS: TagSuggestion[] = [
  { value: '냉장', label: '냉장' },
  { value: '냉동', label: '냉동' },
  { value: '수입 식자재', label: '수입 식자재' },
  { value: '행사 상품', label: '행사 상품' },
  { value: '유통기한 임박', label: '유통기한 임박' },
];

const PEOPLE: TagSuggestion[] = [
  { value: 'E-0012', label: '한서연', meta: '인사팀 · 매니저' },
  { value: 'E-0031', label: '정민호', meta: '영업팀 · 책임' },
  { value: 'E-0044', label: '박서연', meta: '재무팀 · 선임' },
  { value: 'E-0052', label: '이도윤', meta: '구매팀 · 주임' },
  { value: 'E-0067', label: '최하늘', meta: '물류팀 · 사원' },
];

function Limits() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 6)',
      }}
    >
      <Field label="회의 참석자" help="최대 3명">
        <TagInput
          mode="person"
          defaultValue={['E-0012', 'E-0044', 'E-0067']}
          suggestions={PEOPLE}
          max={3}
        />
      </Field>
      <Field label="담당자" error="담당자를 한 명 이상 넣으세요" required>
        <TagInput mode="person" suggestions={PEOPLE} />
      </Field>
      <Field label="상품 태그" disabled>
        <TagInput defaultValue={['냉동']} suggestions={KEYWORDS} />
      </Field>
    </div>
  );
}
```
