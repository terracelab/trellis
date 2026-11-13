import { DataGrid } from '../DataGrid/DataGrid.js';
import { Delta } from './Delta.js';

const BRANCHES = [
  { id: 'B01', name: '본사', sales: 1284000000, change: 12.4, margin: 0.3 },
  { id: 'B02', name: '부산지사', sales: 642300000, change: -3.1, margin: -0.8 },
  { id: 'B03', name: '대전지사', sales: 318900000, change: 0.02, margin: 0 },
];

/** 한국 관습 — 증가는 빨강, 감소는 파랑. 부호와 화살표가 늘 함께 보인다 */
export function Finance() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-8)', justifyItems: 'start' }}>
      <Delta value={12.4} label="전월 대비" />
      <Delta value={-3.1} label="전월 대비" />
      <Delta value={12400000} format="amount" label="전일 대비" />
      <Delta value={0.3} format="point" label="전년 동기 대비" />
    </div>
  );
}

/** 좋고 나쁨 — 아이콘만 상태 색이고 숨은 글자가 개선 · 악화를 읽는다 */
export function Polarity() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-8)', justifyItems: 'start' }}>
      <Delta value={1.3} polarity="up-good" label="전주 대비" />
      <Delta value={-0.6} format="point" polarity="up-bad" label="불량률 전일 대비" />
      <Delta value={4} format="number" unit="건" polarity="up-bad" label="결재 대기 전일 대비" />
    </div>
  );
}

/** 표 칸 — sm은 행 높이를 바꾸지 않고, 비교 대상은 열 머리에 둔다 */
export function InTable() {
  return (
    <DataGrid
      caption="지사별 매출"
      rowKey="id"
      rows={BRANCHES}
      columns={[
        { key: 'name', header: '지사', width: 'md' },
        { key: 'sales', header: '당월 매출', width: 'md', format: 'amount' },
        {
          key: 'change',
          header: '전월 대비',
          width: 'sm',
          align: 'right',
          render: (row: (typeof BRANCHES)[number]) => <Delta value={row.change} size="sm" />,
        },
        {
          key: 'margin',
          header: '이익률 차이',
          width: 'sm',
          align: 'right',
          render: (row: (typeof BRANCHES)[number]) => (
            <Delta value={row.margin} format="point" size="sm" />
          ),
        },
      ]}
    />
  );
}

/** 방향과 서식 — 서식마다 증가 · 감소 · 0. 보이는 자릿수에서 0이면 부호가 없다 */
export function States() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, max-content)',
        gap: 'var(--tl-space-8) var(--tl-space-16)',
      }}
    >
      <Delta value={8.2} />
      <Delta value={-8.2} />
      <Delta value={0.04} />
      <Delta value={1.5} format="point" />
      <Delta value={-1.5} format="point" />
      <Delta value={0} format="point" />
      <Delta value={250000} format="amount" />
      <Delta value={-250000} format="amount" />
      <Delta value={0} format="amount" />
      <Delta value={3} format="number" unit="EA" size="sm" />
      <Delta value={-3} format="number" unit="EA" size="sm" />
      <Delta value={0} format="number" unit="EA" size="sm" />
    </div>
  );
}
