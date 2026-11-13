import { useState } from 'react';
import { SideNav } from './SideNav.js';

const groups = [
  {
    id: 'home',
    items: [{ id: 'dashboard', label: '대시보드', icon: 'layout-dashboard' as const }],
  },
  {
    id: 'operations',
    label: 'Operations',
    group: 'erp' as const,
    collapsible: true,
    items: [
      { id: 'tax-calendar', label: '세무 캘린더', icon: 'calendar' as const },
      { id: 'contracts', label: '계약', icon: 'file-text' as const },
    ],
  },
  {
    id: 'employees',
    label: 'Employees',
    group: 'groupware' as const,
    collapsible: true,
    items: [
      { id: 'members', label: '구성원', icon: 'users' as const },
      { id: 'payroll', label: '급여', icon: 'banknote' as const },
    ],
  },
];

/** 무역 회사 메뉴 — 그룹 색 점 · 카운트 · 하위 기능 */
export function Trade() {
  return (
    <div
      style={{
        height: 'calc(var(--tl-space-64) * 6)',
        width: 'var(--tl-layout-sidebar-width)',
        border: 'var(--tl-border-width-1) solid var(--tl-color-border-divider)',
      }}
    >
      <SideNav
        activeId="invoices"
        sections={[
          { id: 'home', items: [{ id: 'dashboard', label: '대시보드', icon: 'layout-dashboard' }] },
          {
            id: 'erp',
            label: 'ERP',
            group: 'erp',
            collapsible: true,
            items: [
              {
                id: 'tax',
                label: '세무',
                icon: 'landmark',
                children: [
                  { id: 'invoices', label: '세금계산서', count: 12 },
                  { id: 'vat', label: '부가세 신고' },
                ],
              },
              { id: 'ledger', label: '거래처 원장', icon: 'scale' },
            ],
          },
          {
            id: 'scm',
            label: '유통·물류',
            group: 'scm',
            collapsible: true,
            items: [
              { id: 'po', label: '발주', icon: 'file-text', count: 4 },
              { id: 'receiving', label: '입고', icon: 'warehouse', count: 3, countTone: 'danger' },
              { id: 'stock', label: '재고', icon: 'boxes' },
            ],
          },
        ]}
      />
    </div>
  );
}

/** 묶음 열림 제어 — open과 onSectionOpenChange로 앱이 열림을 정하고 기억한다. 지금 화면이 접힌 묶음 안으로 바뀌면 SideNav가 onSectionOpenChange(id, true)로 알린다 */
export function ControlledSections() {
  const [open, setOpen] = useState<Record<string, boolean>>({ operations: true, employees: false });
  const [active, setActive] = useState('tax-calendar');
  return (
    <div
      style={{
        height: 'calc(var(--tl-space-64) * 5)',
        width: 'var(--tl-layout-sidebar-width)',
        border: 'var(--tl-border-width-1) solid var(--tl-color-border-divider)',
      }}
    >
      <SideNav
        activeId={active}
        onNavigate={setActive}
        onSectionOpenChange={(id, next) => setOpen((o) => ({ ...o, [id]: next }))}
        sections={groups.map((s) => (s.id in open ? { ...s, open: open[s.id] } : s))}
      />
    </div>
  );
}

/** 접힌 묶음 안 지금 화면 — 묶음 머리가 지금 화면 색 · 굵기로 보이고 화면 낭독기는 "지금 화면 있음"을 읽는다 */
export function ActiveInCollapsed() {
  return (
    <div
      style={{
        height: 'calc(var(--tl-space-64) * 4)',
        width: 'var(--tl-layout-sidebar-width)',
        border: 'var(--tl-border-width-1) solid var(--tl-color-border-divider)',
      }}
    >
      <SideNav
        activeId="payroll"
        revealActive={false}
        sections={groups.map((s) => (s.collapsible ? { ...s, open: false } : s))}
      />
    </div>
  );
}
