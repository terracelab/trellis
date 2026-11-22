# Select

> `@terracelab/trellis-react` · CSS `.tl-select` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { Select } from '@terracelab/trellis-react';
```

## 용도

정해진 선택지 중 하나(상태 · 창고 · 과세 구분). 선택지가 많아 검색이 필요하면 CodeSearch.

## 해부(Anatomy)

trigger(Input과 같은 테두리 · 높이) · mark(고른 선택지의 앞 표시) · value · chevron · popup(`bg.elevated`, `shadow.md`, `radius.md`, `z.dropdown`) · item(높이 `density.row-height`, 앞 표시 · 이름 · note · 선택 표시 check) · mark(점 `space.8` 원, 색은 tone 토큰 · 아이콘 16 `fg.secondary`) · note(`type.caption` `fg.secondary`, 고른 줄에서도 보통 굵기, 비활성 줄은 `fg.disabled`) · empty(선택지 0개 안내, `fg.secondary`). 좁은 화면: sheet(제목 = 라벨) · option(높이 `space.48`, 앞 표시 · 이름 · note · 고른 항목 check).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `options` | `SelectOption[]` |  | 필수 | 선택지(value · label · disabled · leading · note) |
| `value` | `string \| null` |  |  | 값(제어) |
| `defaultValue` | `string \| null` |  |  | 처음 값 |
| `onChange` | `(value: string \| null) => void` |  |  | 바뀔 때 |
| `placeholder` | `string` | `"선택"` |  | 값이 없을 때 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `"md"` |  | 높이 |
| `disabled` | `boolean` | `false` |  | 비활성 |
| `invalid` | `boolean` | `false` |  | 오류 |
| `required` | `boolean` | `false` |  | 필수 |
| `name` | `string` |  |  | 폼 이름 |
| `width` | `'auto' \| 'full'` | `"full"` |  | 폭 |
| `label` | `string` |  |  | Field 밖 접근성 이름 |

## Variants

size 5(xs · sm · md · lg · xl), width auto · full. 선택지 앞 표시(leading)는 점(`kind: 'dot'`) · 아이콘(`kind: 'icon'`) 둘. 점의 tone은 토큰 이름만 받는다(`SelectMarkTone`): 차트 계열 슬롯 series-1~5 · compare · income · expense · success · warning · danger(`color.chart.*` · `color.finance.*` · `color.status.*.default`, 범례와 같은 색), 상태 톤 info · neutral(StatusDot과 같은 색), 결재 5상태 draft · pending · approved · rejected · withdrawn(`color.approval.*.default`, 결재 배지 점과 같은 색). hex · CSS 색 문자열은 타입이 막는다.

## States

지원 상태: `default` · `hover` · `focus` · `disabled` · `error`

default · hover · focus · disabled · error.

## 동작

Base UI Select. 글자를 치면 그 글자로 시작하는 항목으로 간다(이름 글자로만 찾고 note는 보지 않는다). 열릴 때 선택된 항목에 맞춰 놓인다. 고른 선택지에 앞 표시가 있으면 닫힌 칸에도 이름 앞에 보이고, note는 목록에만 보인다. note는 disabled와 따로 쓴다(쓸 수 있지만 "사용 중"인 것, 쓸 수 없고 "운영 종료"인 것 모두). 체크는 고른 줄에만 보이고 다른 줄은 자리만 잡아 note가 줄마다 같은 끝에 선다. 폭이 `breakpoint.sm`보다 좁으면 화면 아래 시트로 열고, 항목을 누르면 고르고 닫는다. 시트는 아래로 쓸어 닫을 수 있다. 선택지가 0개면 빈 목록 대신 "선택할 항목이 없습니다"(messages `select.empty`, en "No options")를 팝업 · 시트에 보인다.

## 접근성

넓은 화면: `role="combobox"` 트리거 + listbox. 좁은 화면: `aria-haspopup="dialog"` 버튼 → `role="dialog"` 시트(제목 = 라벨) 안 `role="radiogroup"`. Field 라벨이 이름이 된다. 앞 표시는 꾸밈이라 `aria-hidden`이고 뜻은 이름 글자가 말한다(색만으로 구분하지 않는다). note는 선택지 글자의 일부라 함께 읽는다("CRM 이전 사용 중"). note 글자 대비는 `bg.elevated` 위 4.5:1 이상(`fg.secondary`). 빈 안내는 `role="status"`이고, 그때 listbox · radiogroup은 그리지 않는다.

## 밀도

트리거 `density.control-height-*`(compact · comfortable 26 · 30 · 36 · 42 · 48, touch 44 · 44 · 48 · 56 · 56), 항목 `density.row-height`. 트리거 글자는 xs~md `density.input-font-size`, lg · xl은 그것과 `type.body` 중 큰 값이다(touch 16은 그대로). 시트 행은 밀도와 관계없이 `space.48`(손가락).

## 플랫폼 차이

네이티브는 바텀시트(components.md §9).

## 금지 사항

선택지 2개를 Select로(RadioGroup · SegmentedControl, 단 LineItemsEditor · DataGrid 줄 안의 칸은 Select) · 20개 넘는 목록(CodeSearch) · 점 색을 hex · CSS 변수로 넘기기(타입이 막는다, tone 이름만) · 이름 없이 점만으로 뜻 전하기 · note에 긴 설명(한두 단어) → 리뷰.

## 예시

### 창고 선택

Field 라벨이 이름이 된다

```tsx
import { Field, Select } from '@terracelab/trellis-react';

const WAREHOUSES = [
  { value: 'icheon', label: '이천 1센터' },
  { value: 'busan', label: '부산 신항 보세창고' },
  { value: 'pyeongtaek', label: '평택 2센터' },
];

function Basic() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 5)',
      }}
    >
      <Field label="입고 창고" required>
        <Select options={WAREHOUSES} defaultValue="busan" />
      </Field>
      <Field label="과세 구분">
        <Select
          options={[
            { value: 'tax', label: '과세' },
            { value: 'zero', label: '영세율' },
            { value: 'free', label: '면세' },
          ]}
          placeholder="과세 구분"
        />
      </Field>
    </div>
  );
}
```

### 앞 표시 · note

점은 차트 계열 · 상태 톤 · 결재 상태 이름으로만 고른다. 고른 선택지의 표시는 닫힌 칸에도 보인다

```tsx
import type { SelectOption } from '@terracelab/trellis-contracts';
import { Field, Select } from '@terracelab/trellis-react';

const SITES: SelectOption[] = [
  { value: 'hq', label: '본사', leading: { kind: 'dot', tone: 'series-1' }, note: '기본' },
  { value: 'busan', label: '부산 지사', leading: { kind: 'dot', tone: 'series-2' } },
  { value: 'pyeongtaek', label: '평택 물류센터', leading: { kind: 'dot', tone: 'series-3' } },
  {
    value: 'daegu',
    label: '대구 영업소',
    leading: { kind: 'dot', tone: 'series-4' },
    note: '운영 종료',
    disabled: true,
  },
];

const PROGRESS: SelectOption[] = [
  { value: 'todo', label: '대기', leading: { kind: 'dot', tone: 'neutral' } },
  { value: 'doing', label: '진행', leading: { kind: 'dot', tone: 'info' } },
  { value: 'done', label: '완료', leading: { kind: 'dot', tone: 'success' } },
  { value: 'hold', label: '보류', leading: { kind: 'dot', tone: 'warning' } },
];

const CHANNELS: SelectOption[] = [
  { value: 'mail', label: '메일', leading: { kind: 'icon', icon: 'mail' } },
  { value: 'messenger', label: '메신저', leading: { kind: 'icon', icon: 'message-circle' } },
  { value: 'app', label: '앱 알림', leading: { kind: 'icon', icon: 'bell' }, note: '사용 중' },
];

function Marks() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 5)',
      }}
    >
      <Field label="사업장" help="점 색은 매출 차트의 사업장 색과 같습니다">
        <Select options={SITES} defaultValue="busan" />
      </Field>
      <Field label="진행 상태">
        <Select options={PROGRESS} defaultValue="doing" />
      </Field>
      <Field label="알림 방법">
        <Select options={CHANNELS} defaultValue="app" />
      </Field>
    </div>
  );
}
```

### 빈 목록

고를 수 있는 선택지가 없으면 팝업에 안내 한 줄

```tsx
import { Field, Select } from '@terracelab/trellis-react';

function Empty() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 5)' }}>
      <Field label="출고 창고" help="창고 관리에서 창고를 먼저 등록하세요">
        <Select options={[]} />
      </Field>
    </div>
  );
}
```
