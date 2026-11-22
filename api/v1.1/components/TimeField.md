# TimeField

> `@terracelab/trellis-react` · CSS `.tl-time-field` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { TimeField } from '@terracelab/trellis-react';
```

## 용도

시각 하나(회의 시작 · 출근 시각 · 예약 끝)를 넣을 때 쓴다. 글자로 치거나(930 → 09:30) step 간격(기본 30분) 목록에서 고른다. 날짜는 DateField, 날짜와 기간은 PeriodPicker, 하루의 출퇴근 기록 보기는 TimeClock · WorkTimeline.

## 해부(Anatomy)

root(`tl-time-field`, DateField와 같은 칸: `bg.surface`, `border.strong` 1px, `radius.md`, 높이 `density.control-height-*`) · control(`input` role=combobox, 글자 `density.input-font-size`, tabular) · picker(시계 단추 `clock` 16, `fg.tertiary`, 가리키면 `bg.sunken`) · popup(칸 아래, `bg.elevated` · `border.default` · `shadow.md` · `z.dropdown`, 최대 높이 `space.64` × 4) · option(행 높이 `density.row-height`, 가리킨 행 `bg.sunken`, 지금 값 600 + check `fg.link`) · note(걸리는 시간 `type.caption` `fg.secondary`) · sheet(좁은 화면 아래 시트, `_internal/sheet.tsx`) · 오류 글자(Field 오류 칸 또는 칸 아래).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `label` | `string` |  |  | Field 밖 접근성 이름 |
| `value` | `string \| null` |  |  | 값 'HH:MM'(제어) |
| `defaultValue` | `string \| null` |  |  | 처음 값(비제어) |
| `onChange` | `(value: string \| null) => void` |  |  | 시각이 바뀔 때 |
| `step` | `number` | `30` |  | 목록 · 화살표 간격(분) |
| `min` | `string` | `"00:00"` |  | 첫 시각 |
| `max` | `string` | `"23:59"` |  | 마지막 시각 |
| `durationFrom` | `string` |  |  | 목록 행 끝에 이 시각부터 걸리는 시간(종료 칸에 시작 시각) |
| `disabled` | `boolean` | `false` |  | 비활성 |
| `invalid` | `boolean` | `false` |  | 오류(Field error면 자동) |
| `required` | `boolean` | `false` |  | 필수 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `"md"` |  | 높이 |
| `name` | `string` |  |  | 폼 이름 |

## Variants

size 5(xs 26 · sm 30 · md 36 · lg 42 · xl 48). 모양은 DateField와 같다. durationFrom이 있으면 목록 행 끝에 그 시각부터 걸리는 시간("1시간 30분")이 붙는다.

## States

지원 상태: `default` · `hover` · `focus` · `disabled` · `error`

default · hover(테두리 `border.hover`) · focus(테두리 · 1px 링 `border.focus`) · disabled(면 `bg.sunken`, 테두리 없음, 시계 단추 `fg.disabled`) · error(테두리 `status.danger.default`, `aria-invalid`. 형식 · 범위 오류는 컴포넌트가 스스로 찾는다). active · loading은 해당 없음.

## 동작

글자는 칸을 떠날 때(Enter · Tab · 바깥 누름) 읽는다. 9 → 09:00, 930 · 0930 → 09:30, 18:5 → 18:05, 9시 30분 → 09:30(contracts `parseTimeText`). 읽을 수 없으면 "시각은 09:30처럼 넣으세요", min · max 밖이면 "{min}~{max} 사이 시각을 넣으세요"를 보이고 값은 그대로 둔다. 비우면 null. 글자로는 간격 밖 시각(09:10)도 넣는다. 목록 · 화살표만 step을 따른다.

| 키 | 동작 |
| --- | --- |
| ↓ · ↑ | 목록을 열고 지금 값(없으면 친 글자) 가까운 시각을 가리킨다. 열려 있으면 다음 · 앞 시각 |
| Home · End | 목록이 열려 있으면 첫 · 끝 시각 |
| Enter | 가리킨 시각을 고른다. 가리킨 행이 없으면 친 글자를 읽는다 |
| Escape | 목록만 닫는다(대화 상자는 닫지 않는다) |
| Tab | 글자를 읽고 다음 칸으로 |

시계 단추를 누르면 목록이 열리고 초점은 입력 칸에 남는다. 목록을 누르는 동안 칸은 초점을 잃지 않는다. 좁은 화면(`breakpoint.sm` 미만)은 시계 단추가 아래 시트를 열고, 시트는 지금 값에 초점을 두고 연다(D-60). value를 주면 컨트롤드, defaultValue는 언컨트롤드다. 바깥에서 value가 바뀌면 칸 글자도 바뀐다.

## 접근성

입력 칸은 `role="combobox"` + `aria-expanded` · `aria-controls` · `aria-activedescendant`, 목록은 `role="listbox"`(이름 = Field 라벨), 행은 `role="option"` + `aria-selected`(가리킨 행). 시계 단추 이름은 "시각 목록 열기"이고 넓은 화면에서는 탭 순서에서 빠진다(입력 칸이 목록을 다룬다). 오류 글자는 Field 오류 칸이나 칸 아래 `role="alert"`로 읽힌다. 대비: 글자 `fg.primary`, 자리 글자 `fg.tertiary`, 보조 `fg.secondary`(elevated 위 4.5:1).

## 밀도

칸 높이 `density.control-height-*`(touch 44 · 48 · 56), 입력 글자 `density.input-font-size`(touch 16), 목록 행 `density.row-height`, 시트 행 `space.48`.

## 플랫폼 차이

네이티브는 칸을 누르면 아래 시트의 시각 목록(또는 OS 시각 고르기)이 열린다. 글자 입력과 props는 같다.

## 금지 사항

30분 간격 Select를 블록이 직접 만들기 → TimeField · 오전 · 오후 12시간 표기(24시간, content.md §4) · 시각을 Input 글자 그대로 저장하기(형식 검사 없음) → 리뷰.

## 예시

### 회의 시각

시작 · 종료 두 칸. 종료 칸은 시작 이후만 고르고 목록 행 끝에 걸리는 시간을 보인다

```tsx
import { useState } from 'react';
import { Field, TimeField } from '@terracelab/trellis-react';

function Meeting() {
  const [start, setStart] = useState<string | null>('14:00');
  const [end, setEnd] = useState<string | null>('15:00');
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-12)',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        maxWidth: 'calc(var(--tl-space-64) * 6)',
      }}
    >
      <Field label="시작">
        <TimeField value={start} onChange={setStart} min="08:00" max="20:00" />
      </Field>
      <Field label="종료">
        <TimeField
          value={end}
          onChange={setEnd}
          min={start ?? '08:00'}
          max="21:00"
          durationFrom={start ?? undefined}
        />
      </Field>
    </div>
  );
}
```

### 간격 · 범위

출근 시각은 10분 간격 07:00~11:00, 교대는 1시간 간격. 글자로는 간격 밖 시각도 넣는다

```tsx
import { Field, TimeField } from '@terracelab/trellis-react';

function Steps() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-12)',
        gridTemplateColumns: 'repeat(auto-fit, minmax(calc(var(--tl-space-64) * 3), 1fr))',
      }}
    >
      <Field label="출근 시각" help="10분 간격입니다">
        <TimeField defaultValue="08:50" step={10} min="07:00" max="11:00" />
      </Field>
      <Field label="교대 시작">
        <TimeField defaultValue="22:00" step={60} />
      </Field>
      <Field label="퇴근 시각" required>
        <TimeField defaultValue={null} min="12:00" max="23:30" />
      </Field>
    </div>
  );
}
```

### 글자 입력 · 오류

930 · 9시 30분처럼 쳐도 09:30이 된다. 읽을 수 없거나 범위 밖이면 칸 아래 오류

```tsx
import { useState } from 'react';
import { Field, TimeField } from '@terracelab/trellis-react';

function Typed() {
  const [value, setValue] = useState<string | null>('09:30');
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-8)',
        maxWidth: 'calc(var(--tl-space-64) * 3)',
      }}
    >
      <Field label="회의실 사용 시작" help="09:00~18:00 사이에 예약합니다">
        <TimeField value={value} onChange={setValue} min="09:00" max="18:00" />
      </Field>
      <p style={{ margin: 0, color: 'var(--tl-color-fg-secondary)' }} aria-live="polite">
        값: {value ?? '없음'}
      </p>
      <Field label="퇴근 시각" error="퇴근 시각을 넣으세요">
        <TimeField value={null} />
      </Field>
    </div>
  );
}
```
