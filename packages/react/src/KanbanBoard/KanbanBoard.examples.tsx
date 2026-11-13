import { type KanbanCardItem } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { KanbanBoard } from './KanbanBoard.js';

const STAGES = [
  { id: 'discover', title: '발굴', tone: 'neutral', trailing: '확률 10%' },
  { id: 'propose', title: '제안', tone: 'info', trailing: '확률 30%' },
  { id: 'negotiate', title: '협상', tone: 'warning', trailing: '확률 70%' },
  { id: 'won', title: '수주', tone: 'success', caption: '세금계산서 발행 기준' },
] as const;

const DEALS: KanbanCardItem[] = [
  {
    id: 'OP-2611-012',
    column: 'discover',
    title: '해밀호텔앤리조트',
    description: '연회용 올리브오일 · 발사믹 정기 납품',
    trailing: '10%',
    amount: 24_000_000,
    owner: '송유나',
    due: '2026-12-10',
  },
  {
    id: 'OP-2611-015',
    column: 'discover',
    title: '청담다이닝그룹',
    description: '가리비 관자 정기 납품',
    trailing: '10%',
    amount: 36_000_000,
    owner: '최민준',
    due: '2027-01-15',
  },
  {
    id: 'OP-2611-008',
    column: 'propose',
    title: '오름케이터링',
    description: '연말 케이터링 수산물 패키지',
    trailing: '30%',
    amount: 42_000_000,
    owner: '송유나',
    due: '2026-11-27',
  },
  {
    id: 'OP-2611-004',
    column: 'negotiate',
    title: '누리식품',
    description: '가리비 관자 단가 재협상',
    trailing: '60%',
    amount: 31_200_000,
    owner: '최민준',
    due: '2026-11-10',
  },
  {
    id: 'OP-2610-031',
    column: 'negotiate',
    title: '대양상사',
    description: '2027 연간 공급 계약 갱신',
    trailing: '70%',
    amount: 420_000_000,
    owner: '강도현',
    due: '2026-12-15',
  },
  {
    id: 'OP-2610-022',
    column: 'won',
    title: '누리식품',
    description: '11월 관자 · 아이스박스',
    trailing: '100%',
    amount: 5_850_000,
    owner: '최민준',
    due: '2026-11-03',
    done: true,
    doneLabel: '수주',
  },
];

/** 영업 단계 — 카드 오른쪽 위 옮기기 메뉴(키보드 · 손가락)나 마우스 끌기로 단계를 옮긴다. 칸 머리에 건수와 금액 합계 */
export function Pipeline() {
  const [cards, setCards] = useState(DEALS);
  const [active, setActive] = useState<string | null>(null);
  return (
    <KanbanBoard
      label="단계별 영업기회"
      columns={STAGES}
      cards={cards}
      today="2026-11-06"
      warnDays={7}
      activeCardId={active}
      onCardPress={(c) => setActive(c.id)}
      onMove={(id, to, index) =>
        setCards((list) => {
          const card = { ...list.find((c) => c.id === id)!, column: to };
          const rest = list.filter((c) => c.id !== id);
          const inTarget = rest.filter((c) => c.column === to);
          const before = inTarget[index];
          const at = before ? rest.indexOf(before) : rest.length;
          return [...rest.slice(0, at), card, ...rest.slice(at)];
        })
      }
    />
  );
}

/** 읽기 전용 — onMove가 없으면 옮기기 메뉴와 끌기가 없다. 금액이 없는 카드는 합계를 그리지 않는다 */
export function ReadOnly() {
  return (
    <KanbanBoard
      label="작업지시 진행"
      columns={[
        { id: 'todo', title: '대기', tone: 'neutral' },
        { id: 'doing', title: '진행', tone: 'info' },
        { id: 'done', title: '완료', tone: 'success' },
      ]}
      cards={[
        {
          id: 'WO-1107',
          column: 'todo',
          title: 'WO-2611-1107',
          description: '냉동 새우 1kg 소분 · 2라인',
          meta: '1,200EA',
          due: '2026-11-09',
        },
        {
          id: 'WO-1104',
          column: 'doing',
          title: 'WO-2611-1104',
          description: '관자 500g 진공 포장 · 1라인',
          meta: '860EA',
          due: '2026-11-06',
        },
        {
          id: 'WO-1101',
          column: 'done',
          title: 'WO-2611-1101',
          description: '연어 필렛 200g · 1라인',
          meta: '640EA',
          due: '2026-11-05',
          done: true,
        },
      ]}
      today="2026-11-06"
    />
  );
}
