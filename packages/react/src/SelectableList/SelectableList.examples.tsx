import { formatAmount, type SelectableListItem } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { SelectableList } from './SelectableList.js';

const ROOMS: SelectableListItem[] = [
  {
    id: 'ch-notice',
    group: '채널',
    title: '전사 공지',
    icon: 'megaphone',
    secondary: '정민호: 11월 마감 일정을 올렸습니다',
    meta: '09:12',
    muted: true,
    count: 3,
  },
  {
    id: 'ch-sales',
    group: '채널',
    title: '영업팀',
    icon: 'users',
    secondary: '박서연: 한결물산 견적서 확인 부탁드립니다',
    meta: '10:48',
    count: 12,
  },
  {
    id: 'dm-han',
    group: '대화',
    title: '한서연 매니저',
    avatar: { name: '한서연', status: 'online' },
    secondary: '연차 신청서 결재 올렸습니다',
    meta: '어제',
  },
  {
    id: 'dm-lee',
    group: '대화',
    title: '이도윤 주임',
    avatar: { name: '이도윤', status: 'away' },
    secondary: '파일을 보냈습니다',
    meta: '11-06',
    count: 1,
  },
];

const PEOPLE: SelectableListItem[] = [
  {
    id: 'E-0012',
    title: '한서연',
    avatar: { name: '한서연' },
    secondary: '인사팀 · 매니저',
    presence: 'remote',
  },
  {
    id: 'E-0031',
    title: '정민호',
    avatar: { name: '정민호' },
    secondary: '영업팀 · 책임',
    presence: 'working',
  },
  {
    id: 'E-0044',
    title: '박서연',
    avatar: { name: '박서연' },
    secondary: '재무팀 · 선임',
    presence: 'leave',
  },
  {
    id: 'E-0052',
    title: '이도윤',
    avatar: { name: '이도윤' },
    secondary: '구매팀 · 주임 · 휴직',
    disabled: true,
  },
];

const MONTHS: SelectableListItem[] = [
  {
    id: '2026-10',
    title: '2026년 10월',
    secondary: '지급 10-23',
    value: `${formatAmount(3412870)}원`,
  },
  {
    id: '2026-09',
    title: '2026년 9월',
    secondary: '지급 09-25',
    value: `${formatAmount(3398120)}원`,
  },
  {
    id: '2026-08',
    title: '2026년 8월',
    secondary: '지급 08-25',
    value: `${formatAmount(3405550)}원`,
  },
];

/** 대화방 목록 — 묶음 머리(채널 · 대화), 앞 아이콘 · 아바타(접속 점), 뒤 시각 · 안 읽음 수. 알림 끈 방의 수는 흐리다 */
export function Rooms() {
  const [room, setRoom] = useState('ch-sales');
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 5)' }}>
      <SelectableList label="대화방" items={ROOMS} selected={room} onSelect={setRoom} />
    </div>
  );
}

/** 사원 목록 — 사람 행은 PersonLabel과 같은 모양(아바타 · 이름 · 직책 · 근무 상태). 화살표로 옮기고 Enter로 고른다 */
export function People() {
  const [id, setId] = useState('E-0031');
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 5)' }}>
      <SelectableList label="사원 목록" items={PEOPLE} selected={id} onSelect={setId} />
    </div>
  );
}

/** 지급 달 목록 — 앞 칸 없이 제목 · 보조 · 오른쪽 값. 1px 테두리 표시(ring) */
export function Months() {
  const [period, setPeriod] = useState('2026-10');
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 4)' }}>
      <SelectableList
        label="지급 달"
        items={MONTHS}
        selected={period}
        onSelect={setPeriod}
        variant="ring"
      />
    </div>
  );
}

/** 한 줄 · 불러오는 중 · 빈 목록 — sm은 아바타 24에 보조 글자가 제목 옆. 불러오는 동안 같은 모양의 Skeleton */
export function Compact() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-24)',
        gridTemplateColumns: 'repeat(auto-fit, minmax(calc(var(--tl-space-64) * 4), 1fr))',
      }}
    >
      <SelectableList label="사원 목록" items={PEOPLE} size="sm" defaultSelected="E-0012" />
      <SelectableList label="사원 목록" items={[]} loading />
      <SelectableList
        label="사원 목록"
        items={[]}
        emptyText="찾는 사원이 없습니다. 이름 · 사번을 다시 확인하세요"
      />
    </div>
  );
}
