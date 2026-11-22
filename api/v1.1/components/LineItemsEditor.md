# LineItemsEditor

> `@terracelab/trellis-react` · CSS `.tl-line-items-editor` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { LineItemsEditor } from '@terracelab/trellis-react';
```

## 용도

줄을 더하고 빼며 칸을 채우는 입력 표(전표 분개 · 세금계산서 품목 · 발주 품목 · 견적 품목). 칸은 Trellis 입력(CodeSearch · AmountInput · QuantityInput · Input · DateField)을 render로 넣고, 줄 추가 · 삭제 · Enter 이동 · 합계 · 줄 오류 · 좁은 화면 카드는 이 컴포넌트가 맡는다. 보기 · 고르기 목록은 DataGrid(칸 하나 고치기는 DataGrid editable). 줄 안 칸에서 고르기는 선택지가 2~5개라도 Select를 쓴다(RadioGroup 규칙의 예외, 줄 높이에 라디오 묶음이 들어가지 않는다).

## 해부(Anatomy)

wrapper(`bg.surface`, `border.divider`, `radius.lg`, 가로 스크롤) · head(`bg.canvas`, `type.label` fg.secondary, 600) · row(칸 안쪽 `space.4` `space.8`, 아래 `border.divider`, 칸은 위에 맞춘다) · number(번호 열 xs, fg.secondary, tabular) · cell(편집 칸은 sm 입력이 칸을 채운다, 읽기 칸은 숫자 오른쪽 · tabular) · remove(줄 끝 IconButton sm trash-2) · error(줄 아래 한 줄, circle-alert + `status.danger.default` 글자 `type.label`) · foot(합계 `bg.canvas` 600 + 줄 추가 단추 Button sm plus) · required(머리 글자 뒤 `status.danger.default` 점 4, 숨은 "(필수)") · cell-error(칸 입력 바로 아래 `status.danger.default` 글자 `type.label`, 한글 낱말 중간에서 줄을 바꾸지 않는다) · totals(표 아래 오른쪽 숫자 묶음: 이름 `type.label` fg.secondary 위 + 값 `type.amount` 아래, 사이 `space.24`) · footnote(합계 아래 fg.secondary `type.label` 한 줄, 한글 금액) · empty(줄이 없을 때 가운데 fg.secondary 글자). 표가 안 들어가는 폭(상자 폭이 열 최소 폭 합보다 좁을 때, 서랍 · 태블릿): rows(머리 줄 없음, 줄 사이 `border.divider`, 번호 + title 칸 + 삭제 머리 줄, 나머지 칸은 칸 이름 위 + 입력 아래 격자 `space.64`×2.5 이상). 좁은 화면(`breakpoint.sm` 미만): card(줄마다 `bg.surface` · `border.divider` · `radius.lg`, 안쪽 `space.12`) · card-head(번호 + title 칸 + 삭제, 삭제는 오른쪽. 번호 · 삭제는 title 입력과 한 줄) · card-fields(두 칸 격자, 칸 이름 `type.label` fg.secondary 위 + 입력 아래, full 칸은 한 줄 다) · cards-foot(합계 + 줄 추가).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `caption` | `string` |  | 필수 | 표 이름(접근성) |
| `value` | `Line[]` |  | 필수 | 줄 목록 |
| `onChange` | `(lines) => void` |  | 필수 | 줄이 바뀔 때(추가 · 삭제 · 칸 수정) |
| `lineKey` | `string` |  | 필수 | 줄 식별 열 |
| `columns` | `LineItemsColumn[]` |  | 필수 | 열 정의(편집 칸은 render) |
| `newLine` | `() => Line` |  | 필수 | 줄 추가 때 새 줄 |
| `minLines` | `number` | `1` |  | 남겨야 하는 줄 수 |
| `maxLines` | `number` |  |  | 최대 줄 수 |
| `numbered` | `boolean` | `false` |  | 번호 열 |
| `lineError` | `(line, index) => string \| null` |  |  | 줄 전체 오류(줄 아래) |
| `cellError` | `(line, index, key) => string \| null` |  |  | 칸 오류(칸 아래) |
| `totals` | `{ label, value }[]` |  |  | 표 아래 합계 묶음(줄이 없으면 숨김) |
| `footnote` | `ReactNode` |  |  | 합계 아래 한 줄(줄이 없으면 숨김) |
| `empty` | `string` |  |  | 줄이 없을 때 글자 |
| `summary` | `boolean` | `false` |  | 합계 행(줄이 없으면 숨김) |
| `summaryLabel` | `string` |  |  | 합계 행 첫 칸 글자 |
| `addLabel` | `string` |  |  | 줄 추가 단추 글자 |
| `addIcon` | `IconName` | `"plus"` |  | 줄 추가 단추 아이콘 |
| `enterToNext` | `boolean` | `true` |  | Enter로 다음 칸 · 마지막 칸이면 줄 추가 |
| `disabled` | `boolean` | `false` |  | 추가 · 삭제 막음 |
| `name` | `string` |  |  | 폼 이름 |

## Variants

numbered · summary · totals · footnote · minLines(0이면 empty) · maxLines · enterToNext · column.required · column.mobile(title · full · half · hidden). 모양은 폭이 정한다: table(열이 다 들어갈 때) · rows(안 들어갈 때) · cards(`breakpoint.sm` 미만).

## States

지원 상태: `default` · `focus` · `disabled` · `error`

default · focus(칸) · disabled(추가 · 삭제 막음, 칸 입력도 disabled가 이어진다) · error(칸 단위 cellError · 줄 단위 lineError). hover · active는 칸 입력이 맡는다. loading은 없다: 편집 표는 이미 있는 값을 고치는 자리라 불러오는 동안은 화면이 Skeleton을 그린다.

## 동작

값은 부모가 들고(value · onChange), 칸 render는 `update(patch)`로 그 줄만 바꾼다. 줄 추가는 newLine()을 뒤에 붙이고 새 줄 첫 칸에 포커스. 삭제하면 윗줄의 같은 칸(삭제 단추, 꺼져 있으면 그 줄 첫 칸)으로, 윗줄이 없으면 줄 추가 단추로 포커스가 간다. minLines보다 적게는 지울 수 없고(삭제 단추 꺼짐), maxLines에 닿으면 줄 추가가 꺼진다. Tab은 칸 사이를 간다. Enter는 다음 입력 칸으로 가고, 마지막 줄 마지막 칸이면 줄을 더한다(enterToNext). 한글 조합 중 · Shift+Enter · 목록이 열린 칸(aria-expanded=true, CodeSearch 고르기)은 Enter를 가로채지 않는다. 합계 행은 total: 'sum' 열의 값을 더해 format으로 보인다. 줄 오류는 lineError가 돌려준 글자를 줄 아래에 "<표 이름> <행> · 글자"로 보이고, 그 줄 첫 입력 칸의 aria-describedby로 잇는다. 칸 오류는 cellError(line, index, key)가 돌려준 글자를 칸 아래에 보인다. 칸 render는 FieldContext 안에서 그려져 칸 안 Trellis 입력이 저절로 aria-invalid · aria-describedby · required를 받는다(render ctx의 invalid · size도 넘긴다). 폼 오류(useTrellisForm의 lines.0.qty)는 cellError에서 꺼내 넘긴다. totals는 표 아래 오른쪽 숫자 묶음이고 휴대폰에서는 세로로 한 줄씩, footnote는 그 아래 한 줄이다. 줄이 0개면 empty 글자(기본 "아직 줄이 없습니다. 줄 추가로 시작하세요")를 보이고, 합계 행(summary) · 합계 묶음(totals) · footnote는 세 모양 모두 그리지 않는다. 0원 합계는 빈 상태가 할 말(무엇을 하면 되는지)을 가린다. 줄을 더하면 다시 생긴다. footer는 앱 내용이라 그대로 둔다.

정렬(R-35): 칸 오류가 생겨 한 칸이 길어져도 같은 줄의 입력은 한 줄에 선다. 표는 줄 칸을 위에 맞추고(`vertical-align: top`), 입력은 글자 기준선이 아니라 칸 위에 붙는다. 입력이 없는 칸(번호 · 읽기 칸 · 삭제)은 입력 높이(`density.control-height-sm`)를 한 줄로 써서 글자와 단추가 옆 입력 글자와 같은 줄에 선다. 줄 · 카드 모양에서는 읽기 칸 값이 입력 높이 안에서 가운데에 서고, 머리 줄의 번호 · 삭제는 title 칸 이름 줄만큼 내려 title 입력과 한 줄이다. 오류 글자는 그 입력 바로 아래에 붙는다. 상자 폭이 열 최소 폭 합보다 좁으면(오른쪽 서랍 · 태블릿) 머리 줄 없는 줄 모양, 화면 폭이 `breakpoint.sm`보다 좁으면 줄마다 카드가 되고, 두 모양 모두 칸 이름이 입력 위에 선다. 폭은 화면이 아니라 이 상자에서 잰다(ResizeObserver). Enter로 옮겨 가는 칸은 보이는 입력 · 고르기 단추 · 콤보박스뿐이다. 부품 안의 숨은 입력(QuantityInput 숫자 칸 · Select 값 칸)과 보조 단추(CodeSearch 목록 열기)는 tabindex="-1"이라 건너뛰어, 마지막 칸이 QuantityInput이어도 Enter로 줄이 늘어난다(R-34). 읽기 칸은 column.tone(line)으로 상태를 보인다: 앞 아이콘만 상태 색(danger circle-alert · warning triangle-alert · success circle-check), 글자는 본문 색, 숨은 상태 글자("(확인 필요)" 등)를 붙인다. 줄 추가 단추 아이콘은 addIcon(기본 plus, 인력은 user-plus).

## 접근성

`<table>` + `<caption>`(숨김), 스크롤 상자는 `role="region"` + 표 이름. 칸 render에 넘기는 label은 "<표 이름> <행> <열 이름>"(품목 2 단가)이고 입력의 접근성 이름으로 쓴다. 삭제 단추 이름은 "<표 이름> <행> 삭제". 필수 열은 머리에 숨은 "(필수)"가 붙고 칸 입력은 required. 줄 오류는 그 줄 칸들의 설명이 아니라 바로 아래 행 글자이고, 오류가 생기면 `role="status"`로 읽힌다. 카드의 칸 이름은 보이는 글자이고 입력 이름("1행 수량")이 그 글자를 담는다(WCAG 2.5.3). 오류는 색만이 아니라 글자로 보인다.

## 밀도

행 칸 안쪽 `space.4` `space.8`, 입력 sm(`density.control-height-sm`). 카드 안쪽 `space.12`, 칸 사이 `space.8` `space.12`.

## 플랫폼 차이

네이티브는 다음 Phase다(이번 범위는 웹). 같은 contract로 줄마다 카드(같은 columns · render), Enter 대신 다음 칸 자판 단추(returnKeyType next)를 쓸 예정이다.

## 금지 사항

칸마다 저장 단추 · 줄 순서를 뜻 없이 바꾸기 · 합계를 칸 render 안에서 따로 계산해 표와 다르게 보이기 · 휴대폰에서 입력 표를 가로 스크롤로 두기.

## 예시

### 발주 품목

품목 · 수량 · 단가를 넣으면 금액과 합계가 따라온다. Enter로 다음 칸, 마지막 칸에서 Enter면 줄 추가

```tsx
import { useState } from 'react';
import { AmountInput, CodeSearch, QuantityInput, LineItemsEditor } from '@terracelab/trellis-react';

const ITEMS = [
  { value: 'A-1001', label: '무염버터 450g', meta: 'EA' },
  { value: 'A-1002', label: '강력분 20kg', meta: 'BOX' },
  { value: 'A-1003', label: '생크림 1L', meta: 'EA' },
];

const PO_LINES = [
  { key: 1, item: 'A-1001', qty: 24, price: 8_900 },
  { key: 2, item: 'A-1002', qty: 6, price: 31_500 },
];

function PurchaseLines() {
  const [lines, setLines] = useState(PO_LINES);
  return (
    <LineItemsEditor
      caption="발주 품목"
      value={lines}
      onChange={setLines}
      lineKey="key"
      newLine={() => ({ key: Date.now(), item: '', qty: 1, price: 0 })}
      numbered
      summary
      addLabel="품목 추가"
      columns={[
        {
          key: 'item',
          header: '품목',
          render: (l, { label, update }) => (
            <CodeSearch
              size="sm"
              label={label}
              options={ITEMS}
              value={l.item || null}
              onChange={(v) => update({ item: v ?? '' })}
            />
          ),
        },
        {
          key: 'qty',
          header: '수량',
          format: 'quantity',
          width: 'md',
          render: (l, { label, update }) => (
            <QuantityInput
              size="sm"
              label={label}
              value={l.qty}
              onChange={(v) => update({ qty: v ?? 0 })}
              showStepper={false}
            />
          ),
        },
        {
          key: 'price',
          header: '단가',
          format: 'amount',
          width: 'md',
          render: (l, { label, update }) => (
            <AmountInput
              size="sm"
              label={label}
              value={l.price}
              onChange={(v) => update({ price: v ?? 0 })}
            />
          ),
        },
        {
          key: 'amount',
          header: '금액',
          width: 'md',
          format: 'amount',
          total: 'sum',
          value: (l) => l.qty * l.price,
        },
      ]}
    />
  );
}
```

### 전표 분개

두 줄은 남겨야 하고, 차변 · 대변을 함께 넣은 줄은 줄 아래에 이유를 보인다

```tsx
import { formatAmount } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { AmountInput, Input, LineItemsEditor } from '@terracelab/trellis-react';

const JOURNAL = [
  { key: 1, account: '보통예금', debit: 1_100_000, credit: 0, memo: '11월 매출 입금' },
  { key: 2, account: '외상매출금', debit: 0, credit: 1_000_000, memo: '' },
  { key: 3, account: '부가세예수금', debit: 0, credit: 0, memo: '' },
];

function JournalLines() {
  const [lines, setLines] = useState(JOURNAL);
  const debit = lines.reduce((a, l) => a + l.debit, 0);
  const credit = lines.reduce((a, l) => a + l.credit, 0);
  return (
    <LineItemsEditor
      caption="분개"
      value={lines}
      onChange={setLines}
      lineKey="key"
      newLine={() => ({ key: Date.now(), account: '', debit: 0, credit: 0, memo: '' })}
      minLines={2}
      numbered
      summary
      lineError={(l) =>
        l.debit && l.credit
          ? '차변과 대변 중 하나만 입력합니다'
          : l.account && !l.debit && !l.credit
            ? '금액을 입력하세요'
            : null
      }
      footer={
        <span>
          {debit === credit ? '대차 일치' : `차액 ${formatAmount(Math.abs(debit - credit))}원`}
        </span>
      }
      columns={[
        {
          key: 'account',
          header: '계정과목',
          width: 'lg',
          render: (l, { label, update }) => (
            <Input
              size="sm"
              label={label}
              value={l.account}
              onChange={(v) => update({ account: v })}
            />
          ),
        },
        {
          key: 'debit',
          header: '차변',
          width: 'md',
          total: 'sum',
          format: 'amount',
          render: (l, { label, update }) => (
            <AmountInput
              size="sm"
              label={label}
              value={l.debit || null}
              invalid={!!(l.debit && l.credit)}
              onChange={(v) => update({ debit: v ?? 0 })}
            />
          ),
        },
        {
          key: 'credit',
          header: '대변',
          width: 'md',
          total: 'sum',
          format: 'amount',
          render: (l, { label, update }) => (
            <AmountInput
              size="sm"
              label={label}
              value={l.credit || null}
              invalid={!!(l.debit && l.credit)}
              onChange={(v) => update({ credit: v ?? 0 })}
            />
          ),
        },
        {
          key: 'memo',
          header: '적요',
          render: (l, { label, update }) => (
            <Input size="sm" label={label} value={l.memo} onChange={(v) => update({ memo: v })} />
          ),
        },
      ]}
    />
  );
}
```

### 세금계산서 품목

품목은 필수, 아래에 공급가액 · 세액 · 합계와 한글 금액

```tsx
import { formatAmount, formatKoreanAmount } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { AmountInput, CodeSearch, QuantityInput, LineItemsEditor } from '@terracelab/trellis-react';

const ITEMS = [
  { value: 'A-1001', label: '무염버터 450g', meta: 'EA' },
  { value: 'A-1002', label: '강력분 20kg', meta: 'BOX' },
  { value: 'A-1003', label: '생크림 1L', meta: 'EA' },
];

const TAX_LINES = [
  { key: 1, item: 'A-1001', qty: 24, price: 8_900 },
  { key: 2, item: 'A-1003', qty: 40, price: 6_200 },
];

function TaxInvoiceLines() {
  const [lines, setLines] = useState(TAX_LINES);
  const supply = lines.reduce((a, l) => a + l.qty * l.price, 0);
  const tax = Math.round(supply / 10);
  return (
    <LineItemsEditor
      caption="품목"
      value={lines}
      onChange={setLines}
      lineKey="key"
      newLine={() => ({ key: Date.now(), item: '', qty: 1, price: 0 })}
      addLabel="품목 추가"
      cellError={(l, _i, key) => (key === 'item' && !l.item ? '품목을 고르세요' : null)}
      totals={[
        { label: '공급가액', value: `${formatAmount(supply)}원` },
        { label: '세액', value: `${formatAmount(tax)}원` },
        { label: '합계', value: `${formatAmount(supply + tax)}원` },
      ]}
      footnote={formatKoreanAmount(supply + tax)}
      columns={[
        {
          key: 'item',
          header: '품목',
          required: true,
          mobile: 'title',
          render: (l, { label, update }) => (
            <CodeSearch
              size="sm"
              label={label}
              options={ITEMS}
              value={l.item || null}
              onChange={(v) => update({ item: v ?? '' })}
            />
          ),
        },
        {
          key: 'qty',
          header: '수량',
          format: 'quantity',
          width: 'md',
          render: (l, { label, update }) => (
            <QuantityInput
              size="sm"
              label={label}
              value={l.qty}
              onChange={(v) => update({ qty: v ?? 0 })}
              showStepper={false}
            />
          ),
        },
        {
          key: 'price',
          header: '단가',
          format: 'amount',
          width: 'md',
          render: (l, { label, update }) => (
            <AmountInput
              size="sm"
              label={label}
              value={l.price}
              onChange={(v) => update({ price: v ?? 0 })}
            />
          ),
        },
        {
          key: 'supply',
          header: '공급가액',
          format: 'amount',
          width: 'md',
          value: (l) => l.qty * l.price,
        },
        {
          key: 'tax',
          header: '세액',
          format: 'amount',
          width: 'sm',
          value: (l) => Math.round((l.qty * l.price) / 10),
        },
      ]}
    />
  );
}
```

### 비목 예산

칸 안 고르기는 Select(행 칸에는 RadioGroup을 두지 않는다). 인건비가 과제비의 40%를 넘으면 그 줄 아래에 이유

```tsx
import { formatAmount } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { AmountInput, Input, Select, LineItemsEditor } from '@terracelab/trellis-react';

const BUDGET_KINDS = [
  { value: 'labor', label: '인건비' },
  { value: 'equipment', label: '연구장비 · 재료비' },
  { value: 'activity', label: '연구활동비' },
  { value: 'allowance', label: '연구수당' },
  { value: 'indirect', label: '간접비' },
];

const BUDGET = [
  { key: 1, kind: 'labor', amount: 52_000_000, memo: '참여 연구원 3명' },
  { key: 2, kind: 'equipment', amount: 18_000_000, memo: '' },
  { key: 3, kind: 'activity', amount: 9_500_000, memo: '학회 · 출장' },
];

function BudgetLines() {
  const [lines, setLines] = useState(BUDGET);
  const grant = 120_000_000;
  const total = lines.reduce((a, l) => a + (l.amount ?? 0), 0);
  return (
    <LineItemsEditor
      caption="비목"
      value={lines}
      onChange={setLines}
      lineKey="key"
      newLine={() => ({ key: Date.now(), kind: '', amount: 0, memo: '' })}
      addLabel="비목 추가"
      lineError={(l) =>
        l.kind === 'labor' && l.amount > grant * 0.4
          ? `인건비는 과제비의 40%(${formatAmount(grant * 0.4)}원)까지 편성합니다`
          : null
      }
      totals={[
        { label: '편성 합계', value: `${formatAmount(total)}원` },
        { label: '과제비', value: `${formatAmount(grant)}원` },
      ]}
      footnote={
        total === grant
          ? '과제비와 같습니다'
          : `과제비까지 ${formatAmount(grant - total)}원 남았습니다`
      }
      columns={[
        {
          key: 'kind',
          header: '비목',
          width: 'lg',
          required: true,
          mobile: 'title',
          render: (l, { label, update }) => (
            <Select
              size="sm"
              label={label}
              options={BUDGET_KINDS}
              value={l.kind || null}
              onChange={(v) => update({ kind: v ?? '' })}
            />
          ),
        },
        {
          key: 'amount',
          header: '금액',
          format: 'amount',
          width: 'md',
          required: true,
          render: (l, { label, update }) => (
            <AmountInput
              size="sm"
              label={label}
              value={l.amount}
              onChange={(v) => update({ amount: v ?? 0 })}
            />
          ),
        },
        {
          key: 'memo',
          header: '비고',
          render: (l, { label, update }) => (
            <Input size="sm" label={label} value={l.memo} onChange={(v) => update({ memo: v })} />
          ),
        },
      ]}
    />
  );
}
```

### 참여 인력

직원은 CodeSearch, 역할은 Select. 참여율이 100%를 넘으면 칸 오류

```tsx
import { useState } from 'react';
import { CodeSearch, QuantityInput, Select, LineItemsEditor } from '@terracelab/trellis-react';

const STAFF_OPTIONS = [
  { value: 'E-101', label: '김도윤', meta: '연구소' },
  { value: 'E-102', label: '이서연', meta: '개발팀' },
  { value: 'E-103', label: '박지호', meta: '개발팀' },
];

const ROLES = [
  { value: 'lead', label: '책임연구원' },
  { value: 'researcher', label: '참여연구원' },
  { value: 'assistant', label: '연구보조원' },
];

const STAFF = [
  { key: 1, person: 'E-101', rate: 40, role: 'lead' },
  { key: 2, person: 'E-102', rate: 110, role: 'researcher' },
];

function StaffLines() {
  const [lines, setLines] = useState(STAFF);
  return (
    <LineItemsEditor
      caption="참여 인력"
      value={lines}
      onChange={setLines}
      lineKey="key"
      newLine={() => ({ key: Date.now(), person: '', rate: 0, role: 'researcher' })}
      addLabel="인력 추가"
      cellError={(l, _i, key) =>
        key === 'rate' && l.rate > 100 ? '참여율은 100%까지 넣습니다' : null
      }
      columns={[
        {
          key: 'person',
          header: '직원',
          required: true,
          mobile: 'title',
          render: (l, { label, update }) => (
            <CodeSearch
              size="sm"
              label={label}
              options={STAFF_OPTIONS}
              value={l.person || null}
              onChange={(v) => update({ person: v ?? '' })}
            />
          ),
        },
        {
          key: 'rate',
          header: '참여율',
          format: 'percent',
          width: 'sm',
          render: (l, { label, update }) => (
            <QuantityInput
              size="sm"
              label={label}
              unit="%"
              value={l.rate}
              onChange={(v) => update({ rate: v ?? 0 })}
              showStepper={false}
            />
          ),
        },
        {
          key: 'role',
          header: '역할',
          width: 'md',
          render: (l, { label, update }) => (
            <Select
              size="sm"
              label={label}
              options={ROLES}
              value={l.role}
              onChange={(v) => update({ role: v ?? 'researcher' })}
            />
          ),
        },
      ]}
    />
  );
}
```

### 빈 상태

minLines 0이면 줄을 모두 지울 수 있고, 줄이 없을 때 무엇을 하면 되는지 보인다

```tsx
import { useState } from 'react';
import { Input, LineItemsEditor } from '@terracelab/trellis-react';

function EmptyLines() {
  const [lines, setLines] = useState<{ key: number; name: string }[]>([]);
  return (
    <LineItemsEditor
      caption="첨부 서류"
      value={lines}
      onChange={setLines}
      lineKey="key"
      minLines={0}
      newLine={() => ({ key: Date.now(), name: '' })}
      empty="첨부 서류가 없습니다. 서류 추가로 이름을 넣으세요"
      addLabel="서류 추가"
      columns={[
        {
          key: 'name',
          header: '서류 이름',
          render: (l, { label, update }) => (
            <Input size="sm" label={label} value={l.name} onChange={(v) => update({ name: v })} />
          ),
        },
      ]}
    />
  );
}
```

### 칸 오류

오류 글자는 그 입력 아래에 붙고, 같은 줄의 다른 입력 · 읽기 칸 · 번호 · 삭제 단추는 한 줄에 선다

```tsx
import { useState } from 'react';
import { AmountInput, CodeSearch, QuantityInput, LineItemsEditor } from '@terracelab/trellis-react';

const ITEMS = [
  { value: 'A-1001', label: '무염버터 450g', meta: 'EA' },
  { value: 'A-1002', label: '강력분 20kg', meta: 'BOX' },
  { value: 'A-1003', label: '생크림 1L', meta: 'EA' },
];

const CHECK_LINES = [
  { key: 1, item: 'A-1001', qty: 24, price: 8_900 },
  { key: 2, item: '', qty: 0, price: 31_500 },
];

function CellErrors() {
  const [lines, setLines] = useState(CHECK_LINES);
  return (
    <LineItemsEditor
      caption="입고 품목"
      value={lines}
      onChange={setLines}
      lineKey="key"
      newLine={() => ({ key: Date.now(), item: '', qty: 1, price: 0 })}
      numbered
      summary
      addLabel="품목 추가"
      cellError={(l, _i, key) =>
        key === 'item' && !l.item
          ? '품목을 고르세요'
          : key === 'qty' && l.qty < 1
            ? '1 이상 입력하세요'
            : null
      }
      columns={[
        {
          key: 'item',
          header: '품목',
          required: true,
          mobile: 'title',
          render: (l, { label, update }) => (
            <CodeSearch
              size="sm"
              label={label}
              options={ITEMS}
              value={l.item || null}
              onChange={(v) => update({ item: v ?? '' })}
            />
          ),
        },
        {
          key: 'qty',
          header: '수량',
          format: 'quantity',
          width: 'sm',
          render: (l, { label, update }) => (
            <QuantityInput
              size="sm"
              label={label}
              value={l.qty}
              onChange={(v) => update({ qty: v ?? 0 })}
              showStepper={false}
            />
          ),
        },
        {
          key: 'price',
          header: '단가',
          format: 'amount',
          width: 'md',
          render: (l, { label, update }) => (
            <AmountInput
              size="sm"
              label={label}
              value={l.price}
              onChange={(v) => update({ price: v ?? 0 })}
            />
          ),
        },
        {
          key: 'amount',
          header: '금액',
          format: 'amount',
          width: 'md',
          total: 'sum',
          value: (l) => l.qty * l.price,
        },
      ]}
    />
  );
}
```

### 줄이 없을 때 합계

줄이 0개면 합계 행 · 합계 묶음 · 한글 금액을 그리지 않고, 빈 상태 글자와 줄 추가만 남는다

```tsx
import { formatAmount, formatKoreanAmount } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { AmountInput, CodeSearch, QuantityInput, LineItemsEditor } from '@terracelab/trellis-react';

const ITEMS = [
  { value: 'A-1001', label: '무염버터 450g', meta: 'EA' },
  { value: 'A-1002', label: '강력분 20kg', meta: 'BOX' },
  { value: 'A-1003', label: '생크림 1L', meta: 'EA' },
];

function EmptyTotals() {
  const [lines, setLines] = useState<{ key: number; item: string; qty: number; price: number }[]>(
    [],
  );
  const supply = lines.reduce((a, l) => a + l.qty * l.price, 0);
  const tax = Math.round(supply / 10);
  return (
    <LineItemsEditor
      caption="견적 품목"
      value={lines}
      onChange={setLines}
      lineKey="key"
      minLines={0}
      newLine={() => ({ key: Date.now(), item: '', qty: 1, price: 0 })}
      summary
      empty="견적 품목이 없습니다. 품목 추가로 시작하세요"
      addLabel="품목 추가"
      totals={[
        { label: '공급가액', value: `${formatAmount(supply)}원` },
        { label: '세액', value: `${formatAmount(tax)}원` },
        { label: '합계', value: `${formatAmount(supply + tax)}원` },
      ]}
      footnote={formatKoreanAmount(supply + tax)}
      columns={[
        {
          key: 'item',
          header: '품목',
          mobile: 'title',
          render: (l, { label, update }) => (
            <CodeSearch
              size="sm"
              label={label}
              options={ITEMS}
              value={l.item || null}
              onChange={(v) => update({ item: v ?? '' })}
            />
          ),
        },
        {
          key: 'qty',
          header: '수량',
          format: 'quantity',
          width: 'sm',
          render: (l, { label, update }) => (
            <QuantityInput
              size="sm"
              label={label}
              value={l.qty}
              onChange={(v) => update({ qty: v ?? 0 })}
              showStepper={false}
            />
          ),
        },
        {
          key: 'price',
          header: '단가',
          format: 'amount',
          width: 'md',
          render: (l, { label, update }) => (
            <AmountInput
              size="sm"
              label={label}
              value={l.price}
              onChange={(v) => update({ price: v ?? 0 })}
            />
          ),
        },
        {
          key: 'amount',
          header: '금액',
          format: 'amount',
          width: 'md',
          total: 'sum',
          value: (l) => l.qty * l.price,
        },
      ]}
    />
  );
}
```
