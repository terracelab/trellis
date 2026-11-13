import { INVOICE_STATES, type InvoiceState } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { Badge } from '../Badge/Badge.js';
import { Button } from '../Button/Button.js';
import { IconButton } from '../IconButton/IconButton.js';
import { Menu } from '../Menu/Menu.js';
import { DataGrid, DataGridLines } from './DataGrid.js';

const INVOICES = [
  {
    no: 'TI-2611-0118',
    date: '2026-11-07',
    buyer: '(주)한빛무역',
    supply: 12_400_000,
    tax: 1_240_000,
    state: 'ready' as InvoiceState,
  },
  {
    no: 'TI-2611-0117',
    date: '2026-11-06',
    buyer: '대양상사',
    supply: 8_750_000,
    tax: 875_000,
    state: 'sent' as InvoiceState,
  },
  {
    no: 'TI-2611-0116',
    date: '2026-11-06',
    buyer: '누리식품',
    supply: 3_120_000,
    tax: 312_000,
    state: 'failed' as InvoiceState,
  },
  {
    no: 'TI-2611-0115',
    date: '2026-11-05',
    buyer: '한결물산',
    supply: 21_900_000,
    tax: 2_190_000,
    state: 'sent' as InvoiceState,
  },
];

/** 세금계산서 목록 — 금액 서식 · 정렬 · 선택 · 합계 */
export function Invoices() {
  return (
    <DataGrid
      caption="매출 세금계산서"
      rows={INVOICES}
      rowKey="no"
      selectable
      summary
      rowTone={(r) => (r.state === 'failed' ? 'danger' : undefined)}
      columns={[
        { key: 'no', header: '문서 번호', width: 'md', sticky: true },
        { key: 'date', header: '작성일', width: 'sm', format: 'date', sortable: true },
        { key: 'buyer', header: '공급받는 자', sortable: true },
        {
          key: 'supply',
          header: '공급가액',
          width: 'md',
          format: 'amount',
          total: 'sum',
          sortable: true,
        },
        { key: 'tax', header: '세액', width: 'md', format: 'amount', total: 'sum' },
        {
          key: 'state',
          header: '상태',
          width: 'md',
          render: (r) => (
            <Badge tone={INVOICE_STATES[r.state].tone}>{INVOICE_STATES[r.state].label}</Badge>
          ),
        },
      ]}
    />
  );
}

/** 빈 상태 · 로딩 */
export function EmptyAndLoading() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-16)' }}>
      <DataGrid
        caption="이번 달 전표"
        rows={[] as { id: string }[]}
        rowKey="id"
        columns={[{ key: 'id', header: '전표 번호' }]}
        empty="이번 달 전표가 없습니다. 전표 입력에서 추가하세요"
      />
      <DataGrid
        caption="재고"
        rows={[] as { id: string }[]}
        rowKey="id"
        columns={[{ key: 'id', header: '품목' }]}
        loading
      />
    </div>
  );
}

const ORDER_LINES = [
  { code: 'A-1001', name: '무염버터 450g', wh: 'main', qty: 24, price: 8_900, due: '2026-11-12' },
  { code: 'A-1002', name: '강력분 20kg', wh: 'center', qty: 6, price: 31_500, due: '2026-11-10' },
  { code: 'A-1003', name: '생크림 1L', wh: 'main', qty: 40, price: 6_200, due: '2026-11-11' },
  { code: 'A-1004', name: '올리브유 3L', wh: 'store', qty: 8, price: 27_800, due: '2026-11-14' },
];

const WAREHOUSES = [
  { value: 'main', label: '본사 창고' },
  { value: 'center', label: '물류센터' },
  { value: 'store', label: '매장' },
];

/**
 * 칸 편집 — 방향키로 칸을 옮기고 Enter · F2로 고친다. Enter 저장, Esc 취소, Tab은 다음 편집 칸, 수량은 1 이상.
 * 고친 칸은 저장 전 점이 서고, 저장하면 마지막으로 고친 행이 1초 동안 선택 바탕을 갖는다
 */
export function Editable() {
  const [saved, setSaved] = useState(ORDER_LINES);
  const [lines, setLines] = useState(ORDER_LINES);
  const [lastEdited, setLastEdited] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const isDirty = (row: (typeof lines)[number], key: string) => {
    const before: Record<string, unknown> | undefined = saved.find((r) => r.code === row.code);
    return !!before && before[key] !== (row as Record<string, unknown>)[key];
  };
  const dirtyCount = lines.reduce(
    (n, row) => n + (['wh', 'qty', 'price', 'due'] as const).filter((k) => isDirty(row, k)).length,
    0,
  );
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-12)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 'var(--tl-space-12)',
        }}
      >
        <span style={{ color: 'var(--tl-color-fg-secondary)' }}>저장 전 {dirtyCount}칸</span>
        <Button
          variant="primary"
          disabled={dirtyCount === 0}
          onPress={() => {
            setSaved(lines);
            setFlash(lastEdited);
          }}
        >
          저장
        </Button>
      </div>
      <DataGrid
        caption="발주 품목"
        rows={lines}
        rowKey="code"
        summary
        isDirty={isDirty}
        flashKey={flash}
        scrollToKey={flash}
        onCellChange={(row, key, value) => {
          setFlash(null);
          setLastEdited(row.code);
          setLines((all) => all.map((r) => (r.code === row.code ? { ...r, [key]: value } : r)));
        }}
        columns={[
          { key: 'code', header: '품목 코드', width: 'md' },
          { key: 'name', header: '품목' },
          { key: 'wh', header: '창고', width: 'md', editable: true, options: WAREHOUSES },
          {
            key: 'qty',
            header: '수량',
            width: 'sm',
            format: 'quantity',
            editable: true,
            validate: (v) => (typeof v === 'number' && v >= 1 ? null : '1 이상 입력하세요'),
          },
          { key: 'price', header: '단가', width: 'md', format: 'amount', editable: true },
          { key: 'due', header: '입고일', width: 'sm', format: 'date', editable: true },
          {
            key: 'amount',
            header: '금액',
            width: 'md',
            format: 'amount',
            total: 'sum',
            value: (r) => r.qty * r.price,
          },
        ]}
      />
    </div>
  );
}

const PARTNERS = [
  {
    id: 'P-0101',
    name: '(주)한빛무역',
    region: '서울',
    grade: 'A',
    owner: '김도윤',
    phone: '02-555-0101',
    balance: 12_400_000,
  },
  {
    id: 'P-0102',
    name: '대양상사',
    region: '부산',
    grade: 'B',
    owner: '이서연',
    phone: '051-555-0102',
    balance: 3_870_000,
  },
  {
    id: 'P-0103',
    name: '누리식품',
    region: '서울',
    grade: 'A',
    owner: '박지호',
    phone: '02-555-0103',
    balance: 8_120_000,
  },
  {
    id: 'P-0104',
    name: '한결물산',
    region: '대구',
    grade: 'C',
    owner: '김도윤',
    phone: '053-555-0104',
    balance: 0,
  },
  {
    id: 'P-0105',
    name: '바른유통',
    region: '부산',
    grade: 'B',
    owner: '최민준',
    phone: '051-555-0105',
    balance: 1_540_000,
  },
  {
    id: 'P-0106',
    name: '새벽농산',
    region: '광주',
    grade: 'A',
    owner: '이서연',
    phone: '062-555-0106',
    balance: 21_900_000,
  },
];

/** 열 필터 · 열 설정 — 거래처 이름은 글자로, 지역 · 등급은 값으로 거른다. 열 설정은 이 기기에 저장된다 */
export function FiltersAndColumns() {
  return (
    <DataGrid
      caption="거래처"
      rows={PARTNERS}
      rowKey="id"
      columnSettings={{ storageKey: 'example.partners' }}
      defaultSort={{ key: 'balance', direction: 'desc' }}
      columns={[
        { key: 'name', header: '거래처', filter: 'text', hideable: false, sortable: true },
        { key: 'region', header: '지역', width: 'sm', filter: 'values' },
        {
          key: 'grade',
          header: '등급',
          width: 'sm',
          filter: 'values',
          options: [
            { value: 'A', label: 'A 우수' },
            { value: 'B', label: 'B 보통' },
            { value: 'C', label: 'C 주의' },
          ],
        },
        { key: 'owner', header: '담당자', width: 'md', filter: 'values' },
        { key: 'phone', header: '전화', width: 'md', hidden: true },
        { key: 'balance', header: '미수금', width: 'md', format: 'amount', sortable: true },
      ]}
    />
  );
}

const EXPENSES = [
  { id: 'EX-1101', dept: '영업팀', item: '거래처 미팅 식대', date: '2026-11-02', amount: 184_000 },
  { id: 'EX-1102', dept: '물류팀', item: '지게차 정기 점검', date: '2026-11-03', amount: 420_000 },
  { id: 'EX-1103', dept: '영업팀', item: '출장 교통비(부산)', date: '2026-11-04', amount: 236_500 },
  { id: 'EX-1104', dept: '경영지원팀', item: '복합기 토너', date: '2026-11-04', amount: 98_000 },
  { id: 'EX-1105', dept: '물류팀', item: '포장재 보충', date: '2026-11-05', amount: 312_000 },
  { id: 'EX-1106', dept: '영업팀', item: '샘플 배송비', date: '2026-11-06', amount: 45_000 },
];

/** 묶음 소계 — 부서별로 묶고 묶음마다 소계, 맨 아래 합계. 묶음 머리를 누르면 접힌다 */
export function Grouped() {
  return (
    <DataGrid
      caption="11월 경비"
      rows={EXPENSES}
      rowKey="id"
      groupBy="dept"
      summary
      columns={[
        { key: 'item', header: '내용' },
        { key: 'dept', header: '부서', width: 'md' },
        { key: 'date', header: '사용일', width: 'sm', format: 'date' },
        { key: 'amount', header: '금액', width: 'md', format: 'amount', total: 'sum' },
      ]}
    />
  );
}

const ACCOUNTS = [
  {
    code: '1000',
    name: '자산',
    balance: 58_600_000,
    children: [
      {
        code: '1100',
        name: '유동자산',
        balance: 41_200_000,
        children: [
          { code: '1110', name: '현금', balance: 3_200_000 },
          { code: '1120', name: '보통예금', balance: 26_500_000 },
          { code: '1130', name: '외상매출금', balance: 11_500_000 },
        ],
      },
      {
        code: '1200',
        name: '비유동자산',
        balance: 17_400_000,
        children: [
          { code: '1210', name: '차량운반구', balance: 12_000_000 },
          { code: '1220', name: '비품', balance: 5_400_000 },
        ],
      },
    ],
  },
  {
    code: '2000',
    name: '부채',
    balance: 19_300_000,
    children: [
      { code: '2110', name: '외상매입금', balance: 14_800_000 },
      { code: '2120', name: '미지급금', balance: 4_500_000 },
    ],
  },
];

/** 트리 행 — 계정 과목처럼 단계가 있는 행. 단추로 펼치고 접는다. 합계는 맨 아래 단계만 더한다 */
export function Tree() {
  return (
    <DataGrid
      caption="계정별 잔액"
      rows={ACCOUNTS}
      rowKey="code"
      childrenKey="children"
      defaultExpanded={['1000', '1100']}
      columns={[
        { key: 'name', header: '계정 과목' },
        { key: 'code', header: '코드', width: 'sm' },
        { key: 'balance', header: '잔액', width: 'md', format: 'amount' },
      ]}
    />
  );
}

const STOCK = Array.from({ length: 1000 }, (_, i) => ({
  sku: `SKU-${String(i + 1).padStart(4, '0')}`,
  name: `${['무염버터', '강력분', '올리브유', '생크림', '설탕', '바닐라빈'][i % 6]} ${(i % 9) + 1}호`,
  wh: ['본사 창고', '물류센터', '매장'][i % 3],
  qty: (i * 37) % 500,
  price: 1_000 + ((i * 7919) % 90) * 100,
}));

/** 1,000행 — height="fill"이고 행이 200개를 넘으면 보이는 줄만 그린다. 머리 · 정렬 · 필터는 그대로 */
export function ThousandRows() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(var(--tl-space-64) * 6)',
      }}
    >
      <DataGrid
        caption="재고 현황"
        rows={STOCK}
        rowKey="sku"
        height="fill"
        columns={[
          { key: 'sku', header: '품목 코드', width: 'md', sortable: true },
          { key: 'name', header: '품목', filter: 'text' },
          { key: 'wh', header: '창고', width: 'md', filter: 'values' },
          { key: 'qty', header: '재고', width: 'sm', format: 'quantity', sortable: true },
          { key: 'price', header: '단가', width: 'md', format: 'amount', sortable: true },
        ]}
      />
    </div>
  );
}

const RECEIVABLES = [
  {
    id: 'r1',
    buyer: '서울분식 12호점',
    cycle: '10-27~11-02',
    billed: 4_524_640,
    paid: 0,
    adjust: 0,
  },
  {
    id: 'r2',
    buyer: '광안떡볶이 센텀점',
    cycle: '10-27~11-02',
    billed: 2_515_460,
    paid: 0,
    adjust: -15_060,
  },
  {
    id: 'r3',
    buyer: '할매돼지국밥',
    cycle: '10-20~10-26',
    billed: 1_970_490,
    paid: 1_000_000,
    adjust: 0,
  },
  {
    id: 'r4',
    buyer: '토박이라멘 장유점',
    cycle: '10-20~10-26',
    billed: 1_871_590,
    paid: 1_871_590,
    adjust: 0,
  },
].map((r) => ({ ...r, due: r.billed - r.paid + r.adjust }));

/** 받을 금액 — 숫자 열이 이어지는 표: 세로선(auto) · 머리 단위(원) · 결과 열 강조 · 두 줄 칸 · 링크 열 · 행 끝 행동 */
export function Receivables() {
  return (
    <DataGrid
      caption="거래처별 받을 금액"
      rowKey="id"
      rows={RECEIVABLES}
      onRowPress={() => {}}
      summary
      columns={[
        {
          key: 'buyer',
          header: '거래처',
          width: 'auto',
          link: true,
          render: (r) => <DataGridLines primary={r.buyer} secondary={`주기 ${r.cycle}`} />,
        },
        { key: 'billed', header: '청구', format: 'amount', width: 'md', total: 'sum' },
        { key: 'paid', header: '수금', format: 'amount', width: 'md', total: 'sum' },
        { key: 'adjust', header: '환불 조정', format: 'amount', width: 'md', total: 'sum' },
        {
          key: 'due',
          header: '받을 금액',
          format: 'amount',
          width: 'md',
          total: 'sum',
          emphasis: true,
        },
      ]}
      rowActions={(r) => (
        <>
          <Button size="sm" variant="secondary" disabled={r.due === 0}>
            입금
          </Button>
          <Menu
            trigger={<IconButton size="sm" icon="ellipsis" label={`${r.buyer} 동작`} />}
            items={[
              { id: 'remind', label: '정산 요청 알림톡' },
              { id: 'statement', label: '거래 명세서' },
            ]}
          />
        </>
      )}
    />
  );
}

/** 불러오기 오류 · 검색 결과 없음 — 요청 ID와 다시 시도가 있는 오류 블록, 바깥 필터가 걸렸을 때의 빈 상태 */
export function ErrorAndNoResult() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-16)' }}>
      <DataGrid
        caption="거래처"
        rows={[] as { id: string; name: string }[]}
        rowKey="id"
        columns={[
          { key: 'id', header: '거래처 코드', width: 'md' },
          { key: 'name', header: '거래처' },
        ]}
        error={{
          message: '거래처 목록을 불러오지 못했습니다',
          requestId: 'req-8f2a41c9',
          onRetry: () => {},
        }}
      />
      <DataGrid
        caption="세금계산서"
        rows={[] as { no: string; buyer: string }[]}
        rowKey="no"
        columns={[
          { key: 'no', header: '승인 번호', width: 'md' },
          { key: 'buyer', header: '공급받는자' },
        ]}
        filtered
        empty="이 조건의 세금계산서가 없습니다. 기간이나 상태를 바꿔 보세요"
      />
    </div>
  );
}

const PURCHASES = [
  {
    no: 'PI-2611-0042',
    vendor: '누리식품',
    supply: 4_200_000,
    tax: 420_000,
    memo: '11월 정기 매입',
  },
  { no: 'PI-2611-0041', vendor: '대양상사', supply: 1_880_000, tax: 188_000, memo: '' },
  {
    no: 'PI-2611-0040',
    vendor: '한결물산',
    supply: 9_350_000,
    tax: 935_000,
    memo: '분할 입고 2차',
  },
];

/** 열 묶음 머리 — 공급가액 · 세액 · 합계 위에 "금액". 메모 열은 폭 1024~1279에서 숨는다 */
export function ColumnGroups() {
  return (
    <DataGrid
      caption="매입 세금계산서"
      rows={PURCHASES}
      rowKey="no"
      summary
      groups={[{ key: 'amount', header: '금액' }]}
      columns={[
        { key: 'no', header: '승인 번호', width: 'md' },
        { key: 'vendor', header: '공급자' },
        {
          key: 'supply',
          header: '공급가액',
          width: 'md',
          format: 'amount',
          total: 'sum',
          group: 'amount',
        },
        {
          key: 'tax',
          header: '세액',
          width: 'md',
          format: 'amount',
          total: 'sum',
          group: 'amount',
        },
        {
          key: 'total',
          header: '합계',
          width: 'md',
          format: 'amount',
          total: 'sum',
          group: 'amount',
          emphasis: true,
          value: (r) => r.supply + r.tax,
        },
        { key: 'memo', header: '메모', priority: 'low' },
      ]}
    />
  );
}

const PAYROLL = (
  [
    ['김하늘', '경영지원팀', 3_800_000, 200_000, 150_000],
    ['박서준', '영업팀 · 수도권 대리점 담당', 4_200_000, 300_000, 0],
    ['이서연', '물류센터', 3_100_000, 100_000, 220_000],
    ['정민호', '개발팀', 4_600_000, 200_000, 0],
  ] as const
).map(([name, team, base, meal, extra], i) => {
  const gross = base + meal + extra;
  const pension = Math.round(base * 0.045);
  const health = Math.round(base * 0.03545);
  const care = Math.round(health * 0.1295);
  const job = Math.round(base * 0.009);
  const income = Math.round(gross * 0.03);
  const local = Math.round(income * 0.1);
  const deduct = pension + health + care + job + income + local;
  return {
    id: `p${i}`,
    name,
    team,
    base,
    meal,
    extra,
    gross,
    pension,
    health,
    care,
    job,
    income,
    local,
    deduct,
    net: gross - deduct,
  };
});

const money = (key: string, header: string) =>
  ({ key, header, width: 'md', format: 'amount', total: 'sum' }) as const;

/** 넓은 표 · 양쪽 고정 — 14열 급여 표. 이름은 왼쪽, 실지급은 오른쪽(sticky "end")에 붙어 있고 가린 쪽 가장자리에 그림자가 선다. 잘린 칸은 가리키면 전체 글자 */
export function WidePayroll() {
  return (
    <DataGrid
      caption="11월 급여"
      rows={PAYROLL}
      rowKey="id"
      summary
      columns={[
        { key: 'name', header: '이름', width: 'sm', sticky: true },
        { key: 'team', header: '부서', width: 'sm' },
        money('base', '기본급'),
        money('meal', '식대'),
        money('extra', '연장 수당'),
        money('gross', '지급 합계'),
        money('pension', '국민연금'),
        money('health', '건강보험'),
        money('care', '장기요양'),
        money('job', '고용보험'),
        money('income', '소득세'),
        money('local', '지방소득세'),
        money('deduct', '공제 합계'),
        { ...money('net', '실지급'), emphasis: true, sticky: 'end' },
      ]}
    />
  );
}
