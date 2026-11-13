# KanbanBoard

> `@terracelab/trellis-react` · CSS `.tl-kanban-board` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { KanbanBoard } from '@terracelab/trellis-react';
```

## 용도

건마다 단계가 있는 업무(영업기회 · 작업지시 · 요청 처리)를 단계 칸에 카드로 늘어놓고 단계를 옮길 때 쓴다. 칸 머리에 건수와 금액 합계가 보인다. 단계 없이 한 목록을 거르고 고르는 것은 DataGrid, 한 건의 진행 단계는 Stepper.

## 해부(Anatomy)

root(`role="region"`) · column(`bg.canvas`, `border.divider` 1px, `radius.lg`, 칸 사이 `space.12`) · head(StatusDot + 단계 이름 600 · 건수 `type.caption` `fg.secondary` · trailing `type.caption` `fg.secondary` · 합계 `type.h3` 700 tabular + 단위 `fg.secondary` · caption `type.caption` `fg.secondary`, 아래 `border.divider`) · card(`bg.surface`, `border.divider` 1px, `radius.md`, 안쪽 여백 `space.12`) · card 내용(KanbanCard: 제목 `type.label` 600 · description `type.caption` `fg.secondary` · 금액 `type.body` 700 + 오른쪽 trailing `type.caption` `fg.secondary` · 담당 Avatar 24 + 이름 · DueBadge 또는 상태 Badge) · move(카드 오른쪽 위 IconButton sm `ellipsis` → Menu. 제목 줄 오른쪽은 이 단추 자리) · drop(놓일 자리 `border.focus` 2 가로 선).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `columns` | `KanbanColumn[]` |  | 필수 | 칸(단계) |
| `cards` | `KanbanCardItem[]` |  | 필수 | 카드(칸 안 순서 = 배열 순서) |
| `label` | `string` |  | 필수 | 보드 이름(접근성) |
| `onMove` | `(cardId: string, toColumn: string, index: number) => void` |  |  | 카드를 옮길 때(없으면 옮기기 없음) |
| `onCardPress` | `(card: KanbanCardItem) => void` |  |  | 카드를 누를 때 |
| `activeCardId` | `string \| null` |  |  | 열린 카드 |
| `summary` | `boolean` | `true` |  | 칸 머리 금액 합계 |
| `draggable` | `boolean` | `true` |  | 마우스로 끌어 옮기기 |
| `today` | `string` |  |  | 기한 기준일(ISO, 기본 오늘) |
| `warnDays` | `number` | `3` |  | 기한 주의 일수 |
| `renderCard` | `(card) => ReactNode` |  |  | 카드 안 내용(기본 KanbanCard) |

## Variants

layout 2. columns(넓은 화면 · 칸이 가로로 늘어서고 넘치면 보드 안에서 가로로 넘긴다), tabs(좁은 화면 · 단계 탭 + 고른 단계 한 열). onMove가 없으면 읽기 전용(옮기기 메뉴 · 끌기 없음). renderCard를 주면 카드 안 내용만 앱이 그리고 틀 · 옮기기 메뉴 · 끌기는 보드가 그린다.

## States

지원 상태: `default` · `hover` · `focus`

default · hover(카드 테두리 `border.strong`) · focus(카드 단추 링). 열린 카드(activeCardId)는 둘레 전체 `brand.default` 1px + 안쪽 1px. 끄는 카드는 흐리게, 놓을 칸은 테두리 `border.focus`. active · disabled · loading · error는 해당 없음.

## 동작

칸 안 카드 순서는 cards 배열 순서다. 보드는 카드 위치를 직접 바꾸지 않고 onMove(cardId, toColumn, index)로 알린다. 앱이 cards를 바꾸면 그대로 그린다. 실주처럼 확인이 필요한 단계는 onMove에서 대화상자를 먼저 열면 된다. index는 옮긴 뒤 그 칸 안의 순서(0부터)다.

옮기는 방법은 셋이다.
- 옮기기 메뉴. 카드 오른쪽 위 단추가 "옮길 칸" 메뉴를 연다. 지금 칸은 빠지고 잠긴 칸(locked)은 비활성이다. 고르면 그 칸 끝에 놓고 옮긴 카드로 포커스를 돌려준다. 키보드 · 손가락 · 화면 읽기 모두 이 길을 쓴다.
- 끌기. 마우스로 카드를 끌어 다른 칸이나 같은 칸의 다른 자리에 놓는다(draggable, 넓은 화면). 놓일 자리에 가로 선이 보인다.
- 좁은 화면. 메뉴가 아래 시트로 열린다(Menu D-60).

| 키 | 동작 |
| --- | --- |
| Tab | 카드 · 옮기기 단추 순서로 |
| ArrowUp · ArrowDown | 같은 칸의 위 · 아래 카드 |
| ArrowLeft · ArrowRight | 옆 칸(빈 칸은 건너뜀)의 같은 줄 카드 |
| Enter · Space | 카드 열기(onCardPress) |

좁은 화면(`breakpoint.sm` 미만)은 단계 Tabs(이름 + 건수)와 고른 단계 한 열이다. 가로로 넘기는 칸 목록 대신 탭을 쓴다. 모든 단계의 건수가 한눈에 보인다(원칙 2). 세로로 넘기는 화면 안에 가로 넘김이 겹치지 않는다. 카드가 폭 전체라 제목이 잘리지 않는다. 단계가 흔히 6개라 칸이 5개까지인 SegmentedControl 대신 넘치면 흐려지는 Tabs를 쓴다.

## 접근성

root는 `role="region"` + label. 칸은 `role="group"`이고 이름은 "단계 이름 N건"이다. 카드는 목록 항목 안의 단추(onCardPress가 있을 때)이고 이름은 카드 글자 전부다. 열린 카드는 `aria-current="true"`. 옮기기 단추 이름은 "제목 옮기기", 메뉴 · 시트 제목은 "옮길 칸". 끌기는 마우스 전용 보조 수단이고 같은 일을 메뉴로 할 수 있다. 상태 색(StatusDot · DueBadge)은 늘 글자와 함께 보인다. 좁은 화면 옮기기 단추와 탭은 40 이상이다.

## 밀도

칸 최소 폭 176(1024 미만 224 · 80%), 카드 안쪽 여백 `space.12`, 카드 사이 `space.8`, 옮기기 단추 `density.control-height-sm`. 휴대폰(touch)에서 단추는 40.

## 플랫폼 차이

네이티브는 같은 props로 단계 탭 + 한 열을 그리고, 카드를 길게 누르면 옮기기 시트가 열린다. 끌기는 없다(Phase 3). 웹은 폭이 `breakpoint.sm`보다 좁으면 같은 모양이고 끌기를 끈다.

## 금지 사항

옮기기를 끌기로만 제공하기(메뉴 필수, 리뷰) · 칸 건수를 알약 배지로(D-56, 리뷰) · 카드 왼쪽에 상태 색 띠(D-57, 리뷰) · 칸마다 다른 바탕색(단계 색은 머리 점으로만, 리뷰) · 카드 안에 입력창.

## 예시

### 영업 단계

카드 오른쪽 위 옮기기 메뉴(키보드 · 손가락)나 마우스 끌기로 단계를 옮긴다. 칸 머리에 건수와 금액 합계

```tsx
import type { KanbanCardItem } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { KanbanBoard } from '@terracelab/trellis-react';

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

function Pipeline() {
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
```

### 읽기 전용

onMove가 없으면 옮기기 메뉴와 끌기가 없다. 금액이 없는 카드는 합계를 그리지 않는다

```tsx
import { KanbanBoard } from '@terracelab/trellis-react';

function ReadOnly() {
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
```
