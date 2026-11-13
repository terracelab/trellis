import type { ChecklistItem } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { Checklist } from './Checklist.js';

const TODAY = '2026-11-06';

const CLOSING: ChecklistItem[] = [
  {
    id: 'bank',
    title: '은행 잔액 대사',
    description: '기업 · 국민 · 외화 계좌 3개',
    state: 'done',
    owner: '정민호',
    meta: '11-06 15:40',
  },
  {
    id: 'sales',
    title: '매출 · 매입 전표',
    description: '11월 6일까지 16건 입력',
    state: 'doing',
    owner: '박서연',
    due: '2026-11-30',
  },
  {
    id: 'payroll',
    title: '급여 전표',
    description: '11월 25일 급여 확정 뒤에 입력합니다',
    state: 'blocked',
    owner: '한서연',
    due: '2026-11-25',
  },
  {
    id: 'fx',
    title: '외화 환산',
    description: 'USD 계좌 · 외상매입금',
    state: 'pending',
    owner: '박서연',
    due: '2026-11-04',
  },
];

/** 월 마감 점검 — 체크 단추로 완료를 표시하고, 항목마다 그 일을 하는 화면으로 가는 단추 하나 */
export function Closing() {
  const [items, setItems] = useState(CLOSING);
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 7)' }}>
      <Checklist
        label="11월 결산 준비"
        today={TODAY}
        items={items.map((i) =>
          i.id === 'fx' ? { ...i, action: { label: '환산하기', onPress: () => {} } } : i,
        )}
        onChange={(id, done) =>
          setItems((list) =>
            list.map((i) => (i.id === id ? { ...i, state: done ? 'done' : 'pending' } : i)),
          )
        }
      />
    </div>
  );
}

/** 온보딩 — 다른 화면에서 일을 끝내면 상태가 바뀌는 목록이라 체크 단추 없이 보기만 한다 */
export function Onboarding() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <Checklist
        label="테라스원 시작하기"
        today={TODAY}
        items={[
          { id: 'company', title: '회사 정보 입력', state: 'done', meta: '11-03' },
          { id: 'users', title: '사용자 초대', description: '12명 중 9명 가입', state: 'doing' },
          {
            id: 'bank',
            title: '은행 계좌 연결',
            state: 'pending',
            action: { label: '연결', icon: 'landmark', onPress: () => {} },
          },
          {
            id: 'tax',
            title: '전자세금계산서 인증서 등록',
            description: '계좌 연결 뒤에 할 수 있습니다',
            state: 'blocked',
          },
        ]}
      />
    </div>
  );
}

/** 불러오는 중 · 빈 목록 — 불러오는 동안 같은 모양의 Skeleton, 항목이 없으면 다음 행동을 말한다 */
export function Loading() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-24)',
        gridTemplateColumns: 'repeat(auto-fit, minmax(calc(var(--tl-space-64) * 4), 1fr))',
      }}
    >
      <Checklist label="11월 결산 준비" items={[]} loading />
      <Checklist
        label="12월 결산 준비"
        items={[]}
        emptyText="12월 결산 항목이 없습니다. 11월 마감 뒤에 만듭니다"
      />
    </div>
  );
}
