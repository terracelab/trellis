import { formatAmount, formatKoreanAmount } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { AmountInput } from '../AmountInput/AmountInput.js';
import { CodeSearch } from '../CodeSearch/CodeSearch.js';
import { Input } from '../Input/Input.js';
import { QuantityInput } from '../QuantityInput/QuantityInput.js';
import { Select } from '../Select/Select.js';
import { LineItemsEditor } from './LineItemsEditor.js';

const ITEMS = [
  { value: 'A-1001', label: '무염버터 450g', meta: 'EA' },
  { value: 'A-1002', label: '강력분 20kg', meta: 'BOX' },
  { value: 'A-1003', label: '생크림 1L', meta: 'EA' },
];

const PO_LINES = [
  { key: 1, item: 'A-1001', qty: 24, price: 8_900 },
  { key: 2, item: 'A-1002', qty: 6, price: 31_500 },
];

/** 발주 품목 — 품목 · 수량 · 단가를 넣으면 금액과 합계가 따라온다. Enter로 다음 칸, 마지막 칸에서 Enter면 줄 추가 */
export function PurchaseLines() {
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

const JOURNAL = [
  { key: 1, account: '보통예금', debit: 1_100_000, credit: 0, memo: '11월 매출 입금' },
  { key: 2, account: '외상매출금', debit: 0, credit: 1_000_000, memo: '' },
  { key: 3, account: '부가세예수금', debit: 0, credit: 0, memo: '' },
];

/** 전표 분개 — 두 줄은 남겨야 하고, 차변 · 대변을 함께 넣은 줄은 줄 아래에 이유를 보인다 */
export function JournalLines() {
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

const TAX_LINES = [
  { key: 1, item: 'A-1001', qty: 24, price: 8_900 },
  { key: 2, item: 'A-1003', qty: 40, price: 6_200 },
];

/** 세금계산서 품목 — 품목은 필수, 아래에 공급가액 · 세액 · 합계와 한글 금액 */
export function TaxInvoiceLines() {
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

/** 비목 예산 — 칸 안 고르기는 Select(행 칸에는 RadioGroup을 두지 않는다). 인건비가 과제비의 40%를 넘으면 그 줄 아래에 이유 */
export function BudgetLines() {
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

/** 참여 인력 — 직원은 CodeSearch, 역할은 Select. 참여율이 100%를 넘으면 칸 오류 */
export function StaffLines() {
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

/** 빈 상태 — minLines 0이면 줄을 모두 지울 수 있고, 줄이 없을 때 무엇을 하면 되는지 보인다 */
export function EmptyLines() {
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

const CHECK_LINES = [
  { key: 1, item: 'A-1001', qty: 24, price: 8_900 },
  { key: 2, item: '', qty: 0, price: 31_500 },
];

/** 칸 오류 — 오류 글자는 그 입력 아래에 붙고, 같은 줄의 다른 입력 · 읽기 칸 · 번호 · 삭제 단추는 한 줄에 선다 */
export function CellErrors() {
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

/** 줄이 없을 때 합계 — 줄이 0개면 합계 행 · 합계 묶음 · 한글 금액을 그리지 않고, 빈 상태 글자와 줄 추가만 남는다 */
export function EmptyTotals() {
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
