# SideNav

> `@terracelab/trellis-react` · CSS `.tl-side-nav` · 안정 · 웹

```ts
import { SideNav } from '@terracelab/trellis-react';
```

## 용도

사이드바의 메뉴: 홈 · 즐겨찾기 · 모듈 묶음(그룹 색 점) · 하위 기능. AppShell의 sidebar 슬롯에 둔다.

## 해부(Anatomy)

header · section(label `type.caption` 600 fg.tertiary, 그룹 색 점, 접기 chevron) · item(높이 `density.row-height`, icon 16 fg.tertiary, label, count 오른쪽, 선택은 `brand.subtle` 바탕 + `fg.link`) · child item(들여쓰기) · footer. PR-27: 면 `bg.nav`(브랜드 950, 라이트 · 다크 같다), 글자 `nav.fg`, 묶음 이름 · 아이콘 · 펼침 `nav.fgMuted`, 가리킴 `nav.hover` + `nav.fgActive`, 지금 화면 `nav.selected` 면 + `nav.fgActive` 600(왼쪽 띠 없음), 구분선 `nav.border`, 포커스 링 `nav.focus`. 1단 아이콘 20 · 하위 16, 1단 글자 500, 하위 항목은 부모 글자 시작에 맞춰 들인다. 건수는 알약 없이 `type.caption` 600 흰 숫자(지연 · 오류는 숫자 앞 6px `status.danger.default` 점. 짙은 면 위 빨간 글자는 대비가 모자란다).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `sections` | `SideNavSection[]` |  | 필수 | 메뉴 묶음 |
| `activeId` | `string` |  |  | 지금 화면 |
| `onNavigate` | `(id: string) => void` |  |  | 항목을 누를 때 |
| `collapsed` | `boolean` | `false` |  | 아이콘만(없으면 AppShell 접힘) |
| `onSectionOpenChange` | `(id: string, open: boolean) => void` |  |  | 묶음 열림이 바뀔 때(머리 누름 · 지금 화면 드러내기) |
| `revealActive` | `boolean` | `true` |  | 지금 화면이 접힌 묶음 안이면 연다 |
| `header` | `ReactNode` |  |  | 위 영역 |
| `footer` | `ReactNode` |  |  | 아래 영역 |
| `label` | `string` | `"주 메뉴"` |  | 내비게이션 이름 |

## Variants

collapsed(아이콘만, 라벨은 title), 묶음 접기.

## States

지원 상태: `default` · `hover` · `active` · `focus`

default · hover(`bg.sunken`) · active(선택) · focus.

## 동작

선택된 항목의 묶음과 부모는 펼친 채로 시작한다. href가 있으면 링크, 없으면 버튼.

묶음 열림(R-42): 비제어는 `defaultOpen`(없으면 접는 묶음은 닫힘)으로 시작하되, 지금 화면(activeId)이 든 묶음은 `revealActive`(기본 true)면 defaultOpen이 false여도 연다. 그래서 앱이 기억한 열림을 넘겨도 지금 묶음을 따로 챙기지 않아도 된다. 제어는 묶음마다 `open`을 주고, 머리를 누르면 SideNav는 `onSectionOpenChange(id, 열림)`만 부른다. 비제어에서도 같은 콜백을 불러 앱이 기억할 수 있다.

지금 화면 드러내기(R-42): activeId가 접힌 묶음 · 하위 메뉴 안으로 바뀌면(본문 링크 · 탭 · 도우미 등 사이드바 밖에서 옮겨 와도) 그 묶음을 연다. 제어 묶음은 `onSectionOpenChange(id, true)`로 알리고 앱이 open을 바꾼다. 제어 묶음이 처음부터 닫힌 채 지금 화면을 품고 있어도 첫 그리기에서 한 번 알린다. 다시 그리지 않으므로 스크롤 위치 · 하위 메뉴 열림이 그대로다. 사람이 지금 묶음을 닫으면 activeId가 바뀔 때까지 닫힌 채 둔다. `revealActive={false}`로 끈다.

접힌 묶음 안 지금 화면(R-42): 지금 화면이 든 묶음이 닫혀 있으면 머리 글자가 `nav.fgActive` · 700(한 단계 굵게)이 된다. 색만이 아니라 굵기로도 다르고, 화면 낭독기에는 머리 이름 뒤에 "지금 화면 있음"을 읽는다.

묶음 머리 · 묶음에는 `data-section-id`(묶음 id)가 붙는다. 시험 · 자동화(에이전트 재생)는 이름 글자 대신 이것으로 찾는다.

collapsed를 주지 않으면 AppShell 사이드바 접힘을 따른다(R-41). AppShell 밖이면 펼친 모양이다.

스크롤: 목록이 넘치면 사이드바 안에서 스크롤한다. 스크롤바는 짙은 면에 맞춰 `nav.hover` 손잡이이고, 가리키거나 키보드로 들어오면 `nav.fgMuted`. 자리를 늘 비워 두어(`scrollbar-gutter: stable`) 스크롤바가 생겨도 항목이 밀리지 않는다(R-37).

## 접근성

`<nav aria-label>`, 선택은 `aria-current="page"`, 묶음 버튼은 `aria-expanded`. 목록은 열렸을 때만 그리므로 `aria-controls`도 열렸을 때만 단다(닫힌 동안 없는 id를 가리키지 않는다). 하위 메뉴 단추도 같다. 접힌 묶음 안 지금 화면은 숨은 글 "지금 화면 있음"으로 알린다.

## 밀도

행 `density.row-height`, 묶음 사이 `space.16`.

## 플랫폼 차이

네이티브에는 없다(탭바 + 전체 메뉴 화면).

## 금지 사항

색을 항목마다 칠하기(색은 그룹 점 · danger 카운트뿐, D-40).

## 예시

### 무역 회사 메뉴

그룹 색 점 · 카운트 · 하위 기능

```tsx
import { SideNav } from '@terracelab/trellis-react';

function Trade() {
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
```

### 묶음 열림 제어

open과 onSectionOpenChange로 앱이 열림을 정하고 기억한다. 지금 화면이 접힌 묶음 안으로 바뀌면 SideNav가 onSectionOpenChange(id, true)로 알린다

```tsx
import { useState } from 'react';
import { SideNav } from '@terracelab/trellis-react';

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

function ControlledSections() {
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
```

### 접힌 묶음 안 지금 화면

묶음 머리가 지금 화면 색 · 굵기로 보이고 화면 낭독기는 "지금 화면 있음"을 읽는다

```tsx
import { SideNav } from '@terracelab/trellis-react';

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

function ActiveInCollapsed() {
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
```
