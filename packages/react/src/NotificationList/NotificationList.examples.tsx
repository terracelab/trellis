import type { NotificationListItem } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { Drawer } from '../Drawer/Drawer.js';
import { IconButton } from '../IconButton/IconButton.js';
import { NotificationList } from './NotificationList.js';

// 스토리 · VRT 기준 시각(샘플 회사의 오늘, 금요일)
const NOW = '2026-11-06T09:00:00+09:00';

const ITEMS: NotificationListItem[] = [
  {
    id: 'n1',
    title: '결재 요청: 11월 법인카드 정산',
    body: '한서연 매니저가 결재를 요청했습니다. 금액 1,284,000원',
    time: '2026-11-06T08:56:00+09:00',
    unread: true,
  },
  {
    id: 'n2',
    title: '원천세 신고 기한이 지났습니다',
    body: '10월 귀속 · 테라스파트너스',
    time: '2026-11-06T06:10:00+09:00',
    unread: true,
    tone: 'danger',
  },
  {
    id: 'n3',
    title: '급여 대장을 확정했습니다',
    time: '2026-11-06T07:40:00+09:00',
  },
  {
    id: 'n4',
    title: '입사 서류가 모두 들어왔습니다',
    body: '이서연 · 11월 10일 입사',
    time: '2026-11-05T17:20:00+09:00',
  },
  {
    id: 'n5',
    title: '벤처기업확인 갱신 서류를 올려 주세요',
    body: '만료 2026-12-01',
    time: '2026-11-03T10:00:00+09:00',
    unread: true,
    tone: 'warning',
    toneLabel: 'D-25',
  },
  {
    id: 'n6',
    title: '10월 부가세 자료를 세무사에게 보냈습니다',
    time: '2026-10-28T15:30:00+09:00',
  },
];

/** 날짜 묶음 — 오늘 · 어제 · 이번 주 · 이전. 묶음 안에서는 읽지 않은 것이 먼저, 머리에 "모두 읽음" */
export function Default() {
  const [items, setItems] = useState(ITEMS);
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <NotificationList
        items={items}
        now={NOW}
        onItemPress={(id) =>
          setItems((list) => list.map((i) => (i.id === id ? { ...i, unread: false } : i)))
        }
        onMarkAllRead={() => setItems((list) => list.map((i) => ({ ...i, unread: false })))}
      />
    </div>
  );
}

/** 빈 상태 — 알림이 없으면 한 줄 */
export function Empty() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <NotificationList items={[]} now={NOW} />
    </div>
  );
}

/** 알림 서랍 — 상단 바 종 단추로 여는 오른쪽 서랍 안 목록. 누르면 읽음 처리 후 그 화면으로 */
export function InDrawer() {
  const [items, setItems] = useState(ITEMS);
  const unread = items.filter((i) => i.unread).length;
  return (
    <Drawer
      trigger={<IconButton icon="bell" label="알림" count={unread} />}
      title="알림"
      width="md"
    >
      <NotificationList
        items={items}
        now={NOW}
        onItemPress={(id) =>
          setItems((list) => list.map((i) => (i.id === id ? { ...i, unread: false } : i)))
        }
        onMarkAllRead={() => setItems((list) => list.map((i) => ({ ...i, unread: false })))}
      />
    </Drawer>
  );
}
