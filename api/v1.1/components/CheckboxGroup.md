# CheckboxGroup

> `@terracelab/trellis-react` · CSS `.tl-checkbox-group` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { CheckboxGroup } from '@terracelab/trellis-react';
```

## 용도

한 라벨 아래 선택지 여러 개를 켜고 끈다(4대보험 취득 대상 · 법인 범위 · 퇴사 처리 목록 · 판매 채널 · 캘린더 표시). 하나만 고르면 RadioGroup, 목록 필터처럼 자리가 좁으면 MultiSelect, 설명이 긴 선택지는 SelectableCard.

## 해부(Anatomy)

root(group) · all(선택. 맨 위 한 줄 전체 선택 Checkbox, 일부만 고르면 indeterminate) · options(Checkbox 목록. 상자 · 라벨 · 설명은 Checkbox 그대로) · dot(선택. 라벨 앞 색 점 8, `color.chart.*` · `status.*` 슬롯, 꾸밈. 캘린더 · 범주 범례, R-T58) · meta(선택. 줄 끝 보조 정보, `fg.secondary`, 숫자는 `font.numeric`, 링크는 `fg.link`. 라벨 밖) · spinner(저장 중인 선택지의 라벨 오른쪽 Spinner 16, `fg.secondary`) · more("n개 더 보기" · "접기" 글자 단추, `fg.link`, `type.label`).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `label` | `string` |  |  | 접근성 이름(Field 밖) |
| `options` | `CheckboxGroupOption[]` |  | 필수 | 선택지 |
| `value` | `string[]` |  |  | 고른 값(제어) |
| `defaultValue` | `string[]` |  |  | 처음 값(비제어) |
| `onChange` | `(value: string[], change: CheckboxGroupChange) => void` |  |  | 바뀔 때(옵션 순서) + 바뀐 선택지 · 상태 |
| `pending` | `string[]` |  |  | 저장 중인 선택지(loading, 누를 수 없음) |
| `orientation` | `'vertical' \| 'horizontal'` | `"vertical"` |  | 배치 방향 |
| `selectAll` | `string \| boolean` |  |  | 전체 선택 체크박스 라벨(true면 "전체") |
| `maxVisible` | `number` |  |  | 처음 보일 선택지 수(넘치면 더 보기) |
| `disabled` | `boolean` | `false` |  | 전체 비활성 |
| `invalid` | `boolean` | `false` |  | 오류(Field error면 자동) |
| `required` | `boolean` | `false` |  | 하나 이상 필수(Field required면 자동) |
| `name` | `string` |  |  | 폼 이름(고른 값마다 하나씩 제출) |

## Variants

orientation vertical(설명이 있을 때) · horizontal(짧은 라벨, 좁으면 줄을 넘긴다). selectAll 유무(라벨 글자 또는 true = "전체"). maxVisible 유무. meta 유무(vertical이면 줄이 묶음 폭을 채우고 meta가 줄 끝에, horizontal이면 라벨 바로 뒤). pending(바로 저장).

## States

지원 상태: `default` · `hover` · `focus` · `disabled` · `loading` · `error`

default · hover(상자 `border.focus`) · focus(상자 링) · disabled(묶음 전체 또는 선택지 하나, `fg.disabled`) · loading(pending의 선택지 하나씩: 라벨 오른쪽 Spinner, `aria-busy`, 읽기 전용, 줄에 `data-state="loading"`) · error(Field 오류면 상자마다 `status.danger.default` 테두리 + `aria-invalid`). active는 해당 없음.

## 동작

선택지는 Checkbox다. 라벨이나 상자를 누르거나 Space로 켜고 끈다. Tab은 상자마다 멈춘다. onChange는 옵션 순서로 정렬한 배열을 넘긴다. 옵션에 없는 값이 value에 있으면 뒤에 그대로 둔다.

| 키 | 동작 |
| --- | --- |
| Tab | 다음 상자(더 보기 단추 포함) |
| Space | 포커스한 상자를 켜고 끈다 |
| Enter | 더 보기 단추를 펼치고 접는다 |

selectAll을 주면 배치와 관계없이 맨 위 한 줄에 전체 선택이 생긴다. 라벨은 selectAll 글자("법인 전체"), true면 "전체"다. 고를 수 있는 선택지가 모두 켜졌으면 체크, 일부면 가운데 줄이다. 누르면 고를 수 있는 선택지를 모두 켜거나 끈다. 비활성 선택지의 값은 바꾸지 않는다.

maxVisible보다 선택지가 많으면 처음 maxVisible개만 보이고 "n개 더 보기"로 펼친다. 숨은 선택지도 폼 제출 값은 그대로 낸다.

onChange 둘째 인자 change는 이번에 바뀐 것이다. `values`는 바뀐 선택지 값(옵션 순서)이고 `checked`는 바뀐 뒤 상태다. 하나를 누르면 그 하나, 전체 선택을 누르면 상태가 바뀐 선택지 전부다. 첫 인자(전체 배열)만 받는 기존 코드는 그대로 동작한다.

바로 저장: 바꾸면 바로 서버에 저장하는 화면은 change로 무엇을 보낼지 알고, 저장하는 동안 그 값을 pending에 넣는다. pending의 선택지는 loading이다. 라벨 오른쪽에 Spinner(숨은 글자 "저장 중")가 서고, 상자는 `aria-busy="true"`와 읽기 전용(`aria-readonly`)이 되어 끝날 때까지 누르거나 Space로 바꿀 수 없다. disabled와 달리 포커스는 그 자리에 남는다. 고를 수 있는 선택지 중 하나라도 저장 중이면 전체 선택도 loading이다(누르면 저장 중인 값과 부딪친다). 실패하면 앱이 value를 되돌리고 Toast로 알린다. 혼자 있는 설정 하나를 바로 저장하는 것은 Switch다(Checkbox 금지 사항 그대로). 바로 저장은 선택지 묶음에만 둔다.

meta는 줄 끝 보조 정보(건수 · 배지 · 링크)다. 라벨 밖에 놓여 링크를 눌러도 상자가 바뀌지 않고, 상자의 `aria-describedby`로 읽힌다. vertical이면 줄이 묶음 폭을 채우고 meta가 줄 끝에 서며, horizontal이면 라벨 바로 뒤에 붙는다. 첫 줄 글자 높이에 맞춘다.

value를 주면 제어, defaultValue면 비제어다. name을 주면 켜진 선택지마다 같은 이름으로 값을 제출한다. `useTrellisForm`의 `form.bind(name)`을 그대로 넘긴다(값은 배열).

## 접근성

`role="group"`. Field 안이면 Field 라벨이 `aria-labelledby`로 묶음 이름이 되고, 밖이면 label prop이 `aria-label`이 된다. Field의 도움말 · 오류가 묶음의 `aria-describedby`다. 필수(required prop 또는 Field required)는 묶음의 뜻(하나 이상)이라 상자마다 `required`를 걸지 않는다. `role="group"`에는 `aria-required`가 없으므로 Field 안이면 Field 라벨의 "(필수)", 밖이면 label 뒤에 붙인 "(필수)"가 이름에 들어간다. 루트에는 `data-required`가 붙는다. 하나 이상 골랐는지는 앱(스키마)이 검사한다. 안의 Checkbox는 Field id를 가져가지 않고 자기 id를 갖는다. 오류 요약에서 묶음으로 오면 첫 상자로 포커스를 넘긴다. 저장 중인 상자는 `aria-busy="true"` · `aria-readonly="true"`이고, Spinner의 `role="status"`가 "저장 중"을 읽는다. 상자를 끄지 않아서(disabled 아님) 누른 뒤에도 포커스가 그 상자에 남는다. meta는 상자의 설명으로 읽힌다. 더 보기 단추는 `aria-expanded` · `aria-controls`.

## 밀도

상자 16 고정. vertical 줄 사이 `space.8`, horizontal 항목 사이 `space.16`. 휴대폰 폭(touch)은 줄 높이 `density.control-height-md`(40).

## 플랫폼 차이

네이티브는 Pressable 목록이다. 더 보기는 같은 단추다. props는 같다.

## 금지 사항

선택지 하나짜리 묶음(Checkbox) · 표의 행 × 열 권한 매트릭스를 CheckboxGroup으로(표 안 Checkbox) · 전체 선택을 options에 넣기(selectAll) · 라벨 없는 묶음 · div 안에 Checkbox를 쌓아 묶음 이름 없이 쓰기 → 리뷰.

## 예시

### 4대보험 취득 대상

Field 라벨 · 필수 · 도움말이 묶음에 이어진다

```tsx
import { Field, CheckboxGroup } from '@terracelab/trellis-react';

const INSURANCE = [
  { value: 'pension', label: '국민연금' },
  { value: 'health', label: '건강보험' },
  { value: 'employment', label: '고용보험' },
  { value: 'accident', label: '산재보험' },
];

function Vertical() {
  return (
    <Field label="4대보험 취득 대상" required help="취득 신고를 할 보험을 고릅니다">
      <CheckboxGroup
        options={INSURANCE}
        defaultValue={['pension', 'health', 'employment']}
        name="insurance"
      />
    </Field>
  );
}
```

### 가로 배치

짧은 라벨은 나란히 놓고 줄이 차면 넘긴다

```tsx
import { Field, CheckboxGroup } from '@terracelab/trellis-react';

function Horizontal() {
  return (
    <Field label="중량">
      <CheckboxGroup
        orientation="horizontal"
        defaultValue={['1kg', '2kg']}
        options={['500g', '1kg', '2kg', '5kg', '10kg'].map((w) => ({ value: w, label: w }))}
      />
    </Field>
  );
}
```

### 색 점 범례

캘린더 표시처럼 라벨 앞에 범주 색 점(color). 색은 점뿐이고 뜻은 라벨이 말한다

```tsx
import { CheckboxGroup } from '@terracelab/trellis-react';

function ColorDots() {
  return (
    <CheckboxGroup
      label="캘린더"
      orientation="horizontal"
      defaultValue={['mine', 'team', 'company', 'leave']}
      options={[
        { value: 'mine', label: '내 일정', color: 'series-1' },
        { value: 'team', label: '팀', color: 'series-2' },
        { value: 'company', label: '회사', color: 'series-3' },
        { value: 'leave', label: '휴가 · 출장', color: 'series-4' },
        { value: 'deadline', label: '마감', color: 'series-5' },
      ]}
    />
  );
}
```

### 전체 선택

selectAll에 라벨을 주면 맨 위에 생기고, 일부만 고르면 가운데 줄로 보인다

```tsx
import { useState } from 'react';
import { Field, CheckboxGroup } from '@terracelab/trellis-react';

function SelectAll() {
  const [value, setValue] = useState<string[]>(['hq']);
  return (
    <Field label="법인 범위" help="초대한 사용자가 볼 수 있는 법인입니다">
      <CheckboxGroup
        selectAll="법인 전체"
        value={value}
        onChange={setValue}
        options={[
          { value: 'hq', label: '테라트레이딩 본사' },
          { value: 'busan', label: '테라트레이딩 부산지사' },
          { value: 'food', label: '테라푸드' },
        ]}
      />
    </Field>
  );
}
```

### 설명

선택지마다 라벨 아래 한 줄 설명을 둔다

```tsx
import { Field, CheckboxGroup } from '@terracelab/trellis-react';

function Descriptions() {
  return (
    <Field label="퇴사 처리">
      <CheckboxGroup
        defaultValue={['account']}
        options={[
          { value: 'account', label: '계정 잠금', description: '퇴사일 18:00에 로그인을 막습니다' },
          { value: 'assets', label: '지급 자산 회수', description: '노트북 1대 · 출입증 1장' },
          {
            value: 'payroll',
            label: '퇴직금 정산',
            description: '마지막 급여일에 함께 지급합니다',
          },
          {
            value: 'insurance',
            label: '4대보험 상실 신고',
            description: '퇴사 다음 달 15일까지',
            disabled: true,
          },
        ]}
      />
    </Field>
  );
}
```

### 오류

Field error가 있으면 상자마다 오류 테두리와 aria-invalid가 붙는다

```tsx
import { Field, CheckboxGroup } from '@terracelab/trellis-react';

function WithError() {
  return (
    <Field label="판매 채널" required error="채널을 하나 이상 고르세요">
      <CheckboxGroup
        orientation="horizontal"
        options={[
          { value: 'mall', label: '자사몰' },
          { value: 'open', label: '오픈마켓' },
          { value: 'social', label: '소셜 커머스' },
        ]}
      />
    </Field>
  );
}
```

### 더 보기

선택지가 많으면 처음 몇 개만 보이고 나머지는 펼친다

```tsx
import { CheckboxGroup } from '@terracelab/trellis-react';

function MaxVisible() {
  return (
    <CheckboxGroup
      label="창고"
      maxVisible={4}
      defaultValue={['seoul']}
      options={[
        { value: 'seoul', label: '서울 본사 창고' },
        { value: 'yongin', label: '용인 물류센터' },
        { value: 'busan', label: '부산 냉동창고' },
        { value: 'incheon', label: '인천 보세창고' },
        { value: 'pyeongtaek', label: '평택항 창고' },
        { value: 'daejeon', label: '대전 물류센터' },
        { value: 'gwangju', label: '광주 물류센터' },
      ]}
    />
  );
}
```

### 줄 끝 정보

meta에 건수 · 링크를 둔다. 라벨 밖이라 링크를 눌러도 상자는 바뀌지 않는다

```tsx
import { Field, CheckboxGroup } from '@terracelab/trellis-react';

function WithMeta() {
  return (
    <Field label="캘린더 표시">
      <CheckboxGroup
        defaultValue={['mine', 'team']}
        options={[
          { value: 'mine', label: '내 일정', meta: '12건' },
          { value: 'team', label: '영업팀', meta: '34건' },
          { value: 'holiday', label: '공휴일', meta: '3건' },
          {
            value: 'shared',
            label: '공유받은 캘린더',
            meta: <a href="#calendar-settings">설정</a>,
          },
        ]}
      />
    </Field>
  );
}
```

### 바로 저장

onChange 둘째 인자로 바뀐 선택지만 저장하고, 저장하는 동안 pending에 넣어 Spinner를 보이고 누를 수 없게 한다

```tsx
import { useEffect, useState } from 'react';
import { Field, CheckboxGroup } from '@terracelab/trellis-react';

function ImmediateSave() {
  const [value, setValue] = useState<string[]>(['email', 'app']);
  const [pending, setPending] = useState<string[]>(['sms']);
  // 서버 저장 대신 1초 기다린다. 처음 보일 때는 문자가 저장 중이다
  useEffect(() => {
    const timer = window.setTimeout(() => setPending((p) => p.filter((v) => v !== 'sms')), 1000);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <Field label="결재 알림 받기" help="바꾸면 바로 저장합니다">
      <CheckboxGroup
        value={value}
        pending={pending}
        onChange={(next, change) => {
          setValue(next);
          setPending((p) => [...p, ...change.values]);
          window.setTimeout(
            () => setPending((p) => p.filter((v) => !change.values.includes(v))),
            1000,
          );
        }}
        options={[
          { value: 'email', label: '이메일' },
          { value: 'app', label: '앱 알림' },
          { value: 'sms', label: '문자' },
        ]}
      />
    </Field>
  );
}
```
