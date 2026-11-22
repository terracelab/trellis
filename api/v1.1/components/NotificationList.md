# NotificationList

> `@terracelab/trellis-react` · CSS `.tl-notification-list` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { NotificationList } from '@terracelab/trellis-react';
```

## 용도

알림 여러 건을 목록으로 보일 때 쓴다(상단 바 종 단추로 여는 알림 서랍 · 알림 화면). 한 줄 모양은 NotificationItem이고, 홈 화면 모듈 타일은 NotificationCard다.

## 해부(Anatomy)

root(grid, 간격 `space.16`) · bar(읽지 않음 N건 `type.label` `fg.secondary` + "모두 읽음" Button ghost sm, onMarkAllRead가 있고 읽지 않은 것이 있을 때만) · group(heading `type.caption` 600 `fg.secondary` + list) · list(`<ul>`, 줄 사이 `border.divider` 1px) · empty(가운데 한 줄 `fg.secondary`).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `items` | `NotificationListItem[]` |  | 필수 | 알림 |
| `onItemPress` | `(id: string) => void` |  |  | 알림을 누를 때 |
| `onMarkAllRead` | `() => void` |  |  | "모두 읽음" 단추 |
| `groupBy` | `'day' \| 'none'` | `"day"` |  | 날짜 묶음 |
| `now` | `string` |  |  | 상대 시각 · 묶음 기준(없으면 지금) |
| `emptyText` | `string` |  |  | 빈 목록 글 |
| `label` | `string` |  |  | 목록 이름(기본 "알림") |
| `headingLevel` | `2 \| 3 \| 4` | `3` |  | 묶음 제목 단계 |

## Variants

groupBy day(기본: 오늘 · 어제 · 이번 주 · 이전) · none(한 목록). 빈 목록.

## States

지원 상태: `default`

default. 불러오는 중은 서랍 · 화면이 Skeleton(list)으로 그린다(목록이 아직 없으므로).

## 동작

items 순서는 상관없다. 날짜 묶음은 현지 날짜로 센다(`relativeDayGroup`): 오늘 · 어제 · 이번 주(월요일 시작, 오늘 · 어제 밖) · 이전. 묶음 안에서는 읽지 않은 것이 먼저, 그다음 최근 순이다. 빈 묶음은 그리지 않는다. 줄을 누르면 onItemPress(id): 부르는 쪽이 읽음 처리 후 화면을 옮긴다. "모두 읽음"을 누르면 onMarkAllRead. 상대 시각 · 묶음 기준은 now(없으면 지금).

## 접근성

묶음마다 제목(h3 기본, headingLevel) + 그 제목으로 이름 붙은 목록(`<ul aria-labelledby>`). 묶지 않으면 목록 이름 = label(기본 "알림"). 빈 상태는 `role="status"`. 읽지 않은 건수는 머리 줄 글자로 읽힌다.

## 밀도

줄은 NotificationItem 밀도를 따른다. 묶음 사이 `space.16`.

## 플랫폼 차이

네이티브는 SectionList(묶음 머리 고정).

## 금지 사항

알림 서랍을 블록 · 앱이 손으로 짜기 · 줄마다 카드 · 묶음 제목을 큰 글자로 · 읽지 않은 것만 색 면으로.

## 예시

### 날짜 묶음

오늘 · 어제 · 이번 주 · 이전. 묶음 안에서는 읽지 않은 것이 먼저, 머리에 "모두 읽음"

```tsx
import type { NotificationListItem } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { NotificationList } from '@terracelab/trellis-react';

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

function Default() {
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
```

### 빈 상태

알림이 없으면 한 줄

```tsx
import { NotificationList } from '@terracelab/trellis-react';

const NOW = '2026-11-06T09:00:00+09:00';

function Empty() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <NotificationList items={[]} now={NOW} />
    </div>
  );
}
```

### 알림 서랍

상단 바 종 단추로 여는 오른쪽 서랍 안 목록. 누르면 읽음 처리 후 그 화면으로

```tsx
import type { NotificationListItem } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { Drawer, IconButton, NotificationList } from '@terracelab/trellis-react';

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

function InDrawer() {
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
```
