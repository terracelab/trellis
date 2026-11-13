import { useState } from 'react';
import { Button } from '../Button/Button.js';
import { Drawer } from './Drawer.js';

/** 상세 — 목록을 떠나지 않고 한 건을 연다 */
export function Detail() {
  return (
    <Drawer
      trigger={<Button iconEnd="chevron-right">PO-2611-0042 보기</Button>}
      title="PO-2611-0042"
      description="대양상사 · 2026-11-06 발주"
      actions={
        <Button size="sm" icon="printer">
          인쇄
        </Button>
      }
      footer={<Button variant="primary">입고 처리</Button>}
    >
      발주 품목과 입고 이력이 여기에 온다
    </Drawer>
  );
}

const ORDERS = [
  { no: 'PO-2611-0041', vendor: '한결물산', date: '2026-11-05' },
  { no: 'PO-2611-0042', vendor: '대양상사', date: '2026-11-06' },
  { no: 'PO-2611-0043', vendor: '누리식품', date: '2026-11-06' },
];

/** 이전 · 다음 — onPrev · onNext를 주면 머리에 이전 · 다음 단추가 생기고 ← → 키로 건을 넘긴다 */
export function Paging() {
  const [index, setIndex] = useState(1);
  const order = ORDERS[index] ?? ORDERS[0]!;
  return (
    <Drawer
      trigger={<Button iconEnd="chevron-right">발주 목록 보기</Button>}
      title={order.no}
      description={`${order.vendor} · ${order.date} 발주`}
      onPrev={index > 0 ? () => setIndex(index - 1) : undefined}
      onNext={index < ORDERS.length - 1 ? () => setIndex(index + 1) : undefined}
      footer={<Button variant="primary">입고 처리</Button>}
    >
      {order.vendor} 발주 품목과 입고 이력이 여기에 온다
    </Drawer>
  );
}

/** 아래 시트 — 휴대폰 상세는 손잡이가 있는 아래 시트로 열고 아래로 쓸어 닫는다 */
export function Bottom() {
  return (
    <Drawer
      side="bottom"
      trigger={<Button>입고 예정 보기</Button>}
      title="입고 예정 3건"
      description="2026-11-06 · 이천 물류센터"
      footer={
        <>
          <Button>나중에</Button>
          <Button variant="primary">입고 처리</Button>
        </>
      }
    >
      입고 예정 품목이 여기에 온다
    </Drawer>
  );
}
