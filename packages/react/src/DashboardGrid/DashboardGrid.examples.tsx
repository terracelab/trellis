import { type DashboardLayout } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { Button } from '../Button/Button.js';
import { Card } from '../Card/Card.js';
import { KpiCard } from '../KpiCard/KpiCard.js';
import { DashboardGrid, DashboardGridItem, type DashboardWidgetWeb } from './DashboardGrid.js';

const WIDGETS: DashboardWidgetWeb[] = [
  {
    id: 'sales',
    title: '당월 매출',
    span: 3,
    hideable: false,
    content: (
      <KpiCard
        label="당월 매출"
        value={874_479_500}
        format="amount"
        delta={{ value: 12.4, label: '전월 대비' }}
      />
    ),
  },
  {
    id: 'orders',
    title: '수주 건수',
    span: 3,
    content: <KpiCard label="수주 건수" value={128} unit="건" />,
  },
  {
    id: 'receivable',
    title: '미수금',
    span: 3,
    content: <KpiCard label="미수금" value={96_200_000} format="amount" />,
  },
  {
    id: 'stock',
    title: '안전재고 미달',
    span: 3,
    content: <KpiCard label="안전재고 미달" value={7} unit="품목" />,
  },
  {
    id: 'pending',
    title: '결재 대기',
    span: 6,
    content: <Card title="결재 대기">지출결의 4건 · 발주 2건</Card>,
  },
  {
    id: 'notice',
    title: '공지',
    span: 6,
    content: <Card title="공지">11월 25일 부가세 예정신고 마감</Card>,
  },
];

/** 배치 편집 — 손잡이에서 화살표 키나 앞뒤 단추로 순서를 바꾸고, 숨긴다. 앱은 onLayoutChange 값을 저장한다 */
export function Editing() {
  const [editing, setEditing] = useState(true);
  const [layout, setLayout] = useState<DashboardLayout>([]);
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-12)' }}>
      <div>
        <Button
          icon={editing ? 'check' : 'layout-grid'}
          variant={editing ? 'primary' : 'secondary'}
          onPress={() => setEditing((v) => !v)}
        >
          {editing ? '완료' : '배치 편집'}
        </Button>
      </div>
      <DashboardGrid
        label="본사 대시보드"
        widgets={WIDGETS}
        layout={layout}
        onLayoutChange={setLayout}
        editing={editing}
      />
    </div>
  );
}

/** 고정 배치 — widgets 없이 DashboardGridItem으로. 블록 `_ui`의 Grid가 감싸는 12열 격자다 */
export function Static() {
  return (
    <DashboardGrid>
      <DashboardGridItem span={4}>
        <KpiCard label="당일 입고" value={42} unit="건" />
      </DashboardGridItem>
      <DashboardGridItem span={4}>
        <KpiCard label="당일 출고" value={57} unit="건" />
      </DashboardGridItem>
      <DashboardGridItem span={4}>
        <KpiCard label="배송 지연" value={3} unit="건" />
      </DashboardGridItem>
      <DashboardGridItem span={12}>
        <Card title="오늘 할 일">입고 검수 12건 · 피킹 30건</Card>
      </DashboardGridItem>
    </DashboardGrid>
  );
}

/** 저장한 배치 — 불러온 배치에 숨긴 위젯이 하나 있다. 목록에서 빠진 위젯은 사라지고 새 위젯은 뒤에 붙는다 */
export function Saved() {
  const saved: DashboardLayout = [
    { id: 'pending' },
    { id: 'sales' },
    { id: 'orders', hidden: true },
    { id: 'removed' },
    { id: 'receivable' },
  ];
  return <DashboardGrid widgets={WIDGETS} defaultLayout={saved} gap="tight" />;
}
