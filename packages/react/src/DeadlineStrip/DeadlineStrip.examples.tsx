import { type DeadlineStripItem } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { DeadlineStrip } from './DeadlineStrip.js';

// 점 색은 범주 슬롯(운영 · 숫자 · 사람). 범주 식별색 토큰(R-38)이 들어오기 전까지 차트 슬롯을 쓴다
const ITEMS: DeadlineStripItem[] = [
  { id: 'd01', date: '2026-11-02', title: '10월 근태 마감', category: '사람', color: 'series-3' },
  {
    id: 'd02',
    date: '2026-11-04',
    title: '법인카드 사용 내역 확인',
    category: '숫자',
    color: 'series-1',
  },
  {
    id: 'd03',
    date: '2026-11-05',
    title: '사무실 임대차 갱신 회신',
    category: '운영',
    color: 'series-2',
    done: true,
  },
  { id: 'd04', date: '2026-11-06', title: '주간 매출 보고', category: '숫자', color: 'series-1' },
  {
    id: 'd05',
    date: '2026-11-10',
    title: '원천세 신고 · 납부',
    category: '숫자',
    color: 'series-1',
  },
  {
    id: 'd06',
    date: '2026-11-10',
    title: '이서연 4대보험 취득신고',
    category: '사람',
    color: 'series-3',
  },
  {
    id: 'd07',
    date: '2026-11-10',
    title: '10월분 급여 명세서 발송',
    category: '사람',
    color: 'series-3',
  },
  {
    id: 'd08',
    date: '2026-11-16',
    title: '정부지원사업 중간 보고',
    category: '운영',
    color: 'series-2',
  },
  { id: 'd09', date: '2026-11-25', title: '부가세 예정신고', category: '숫자', color: 'series-1' },
  {
    id: 'd10',
    date: '2026-11-30',
    title: '벤처기업확인 갱신 서류',
    category: '운영',
    color: 'series-2',
  },
  { id: 'd11', date: '2026-12-01', title: '연말정산 안내', category: '사람', color: 'series-3' },
];

/** 30일 기한 — 오늘부터 30일을 가로 축에 점으로. 같은 날 여러 건은 숫자 묶음, 오늘은 세로 선과 "오늘" 글자, 끝난 기한은 속 빈 점 */
export function ThirtyDays() {
  return (
    <DeadlineStrip
      caption="30일 기한"
      items={ITEMS.filter((i) => i.date >= '2026-11-06')}
      start="2026-11-06"
      today="2026-11-06"
    />
  );
}

/** 지난 기한 · 누르기 — 첫날 전 끝나지 않은 기한은 왼쪽 끝 "지남 n" 묶음. 하나뿐인 점은 바로 onItemPress, 묶음은 아래에 그날 목록을 연다 */
export function OverdueAndPress() {
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-8)' }}>
      <DeadlineStrip
        caption="30일 기한"
        items={ITEMS}
        start="2026-11-06"
        today="2026-11-06"
        onItemPress={(item) => setOpened(item.title)}
      />
      <p style={{ margin: 0, color: 'var(--tl-color-fg-secondary)' }} aria-live="polite">
        {opened ? `${opened}을(를) 열었습니다` : '점을 누르면 기한 이름이 여기에 보입니다'}
      </p>
    </div>
  );
}

/** 2주 · 기준일 — days로 기간을 바꾼다. start가 오늘보다 앞이면 오늘 선은 그 자리에, 지난 기한은 첫날 기준 */
export function TwoWeeks() {
  return (
    <DeadlineStrip
      caption="이번 2주 기한"
      items={ITEMS}
      start="2026-11-02"
      days={14}
      today="2026-11-06"
    />
  );
}
