import type { CommandPaletteGroup } from '@terracelab/trellis-contracts';
import { useEffect, useState } from 'react';
import { Button } from '../Button/Button.js';
import { CommandPalette } from './CommandPalette.js';

const GROUPS: CommandPaletteGroup[] = [
  {
    id: 'recent',
    label: '최근',
    items: [
      {
        id: 'tx',
        label: '거래 내역',
        description: '카드 · 계좌 · 홈택스',
        icon: 'list',
        meta: '회계',
      },
      { id: 'payroll', label: '급여', description: '11월 귀속', icon: 'banknote', meta: '인사' },
    ],
  },
  {
    id: 'screens',
    label: '화면',
    items: [
      { id: 'home', label: '홈', icon: 'house' },
      { id: 'approvals', label: '할 일', description: '승인 · 확인 요청', icon: 'inbox' },
      {
        id: 'invoices',
        label: '매출 · 세금계산서',
        icon: 'file-text',
        meta: '회계',
        keywords: ['세금계산서', '전자세금계산서', 'invoice'],
      },
      {
        id: 'filings',
        label: '세무 신고',
        description: '부가세 · 원천세',
        icon: 'calculator',
        meta: '세무',
      },
      { id: 'employees', label: '직원 · 외주', icon: 'users', meta: '인사' },
      { id: 'audit', label: '감사 로그', icon: 'history', meta: '관리', disabled: true },
    ],
  },
];

/** 제자리 — 대화상자 없이 그린 판. 열린 팔레트의 모양이다 */
export function Inline() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 10)' }}>
      <CommandPalette inline groups={GROUPS} onSelect={() => {}} />
    </div>
  );
}

/** ⌘K 대화상자 — 단추나 ⌘K · Ctrl+K로 연다. 화면 이름 일부를 치고 Enter */
export function Shortcut() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--tl-space-12)' }}>
      <Button icon="search" onPress={() => setOpen(true)}>
        검색 · 이동 ⌘K
      </Button>
      {picked && <span>연 화면: {picked}</span>}
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        groups={GROUPS}
        onSelect={(item) => setPicked(item.label)}
      />
    </div>
  );
}

/** 질문과 답 — 빠른 질문을 누르면 글자가 채워지고, 앱이 결과 위에 답을 보인다 */
export function Answer() {
  const [query, setQuery] = useState('이번 달 부가세 얼마야');
  const asked = query.includes('부가세');
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 10)' }}>
      <CommandPalette
        inline
        query={query}
        onQueryChange={setQuery}
        suggestions={['이번 달 부가세 얼마야', '현금 얼마 남았어', '승인할 거 뭐 있어']}
        groups={GROUPS}
        filter={!asked}
      >
        {asked && (
          <p style={{ margin: 0 }}>
            11월 예상 부가세는 <strong>4,820,000원</strong>입니다. 신고 기한은 2027년 1월
            25일입니다.
          </p>
        )}
      </CommandPalette>
    </div>
  );
}

/** 결과 없음 — 무엇이 없는지와 다음에 해 볼 것을 말한다 */
export function Empty() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 10)' }}>
      <CommandPalette
        inline
        defaultQuery="급여명세서 재발급"
        groups={GROUPS}
        empty="찾는 화면이 없습니다. 화면 이름 일부(예: 급여)로 다시 찾아 보세요."
      />
    </div>
  );
}
