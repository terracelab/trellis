# CommandPalette

> `@terracelab/trellis-react` · CSS `.tl-command-palette` · 안정 · 웹

```ts
import { CommandPalette } from '@terracelab/trellis-react';
```

## 용도

화면 이름 · 할 일 · 거래처를 글자로 찾아 바로 연다(⌘K · Ctrl+K). 숙련자의 주 이동 수단이고, 메뉴를 몰라도 이름 일부로 닿는다. 값 하나를 골라 칸에 넣는 것은 CodeSearch, 목록을 거르는 것은 FilterBar.

## 해부(Anatomy)

backdrop(`bg.overlay`) · panel(`bg.elevated`, `radius.lg`, `shadow.lg`, 다크는 그림자 대신 `border.default`, 폭 640 · 화면 위에서 12vh) · search(search 아이콘 `fg.secondary` 16 · input `type.h3` 글자 · 오른쪽 Esc 키 모양 `type.caption` `border.default` · 아래 `border.divider`) · suggestions(입력 아래 글자 칩 = SuggestionChips, 지금 글자와 같은 칩이 눌린 모양, `type.caption`, `border.default`, 반경 full) · extra(children 자리) · list(최대 높이 화면의 60%, 안에서 스크롤) · group(머리 `type.caption` `fg.secondary` 600) · item(높이 `density.row-height` 이상, icon 16 `fg.secondary` · label `fg.primary` · description `type.caption` `fg.secondary`(이름 뒤 같은 줄) · meta 오른쪽 `type.caption` `fg.secondary`) · 지금 결과(`bg.sunken` 바탕 + 오른쪽 "열기 ↵") · footer(위 `border.divider`, 키 안내 "↑↓ 이동 · Tab 다음 묶음 · Enter 열기 · Esc 닫기" `type.caption` `fg.secondary`).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `open` | `boolean` |  |  | 열림(제어) |
| `defaultOpen` | `boolean` | `false` |  | 처음 열림 |
| `onOpenChange` | `(open: boolean) => void` |  |  | 열림이 바뀔 때 |
| `title` | `string` | `"검색 · 이동"` |  | 접근성 이름(보이지 않음) |
| `placeholder` | `string` |  |  | 입력 칸 안내 |
| `query` | `string` |  |  | 찾는 글자(제어) |
| `defaultQuery` | `string` | `""` |  | 처음 찾는 글자 |
| `onQueryChange` | `(query: string) => void` |  |  | 찾는 글자가 바뀔 때 |
| `groups` | `CommandPaletteGroup[]` |  | 필수 | 결과 묶음 |
| `onSelect` | `(item, group) => void` |  |  | 결과를 고를 때 |
| `closeOnSelect` | `boolean` | `true` |  | 고른 뒤 닫기 |
| `filter` | `boolean` | `true` |  | 찾는 글자로 거르기(false = 앱이 거름) |
| `suggestions` | `string[]` |  |  | 입력 아래 빠른 질문 |
| `loading` | `boolean` | `false` |  | 불러오는 중(스켈레톤) |
| `empty` | `ReactNode` |  |  | 결과가 없을 때 |
| `children` | `ReactNode` |  |  | 결과 위 자리(답 · 안내) |
| `inline` | `boolean` | `false` |  | 대화상자 없이 제자리에 |

## Variants

대화상자(기본) · inline(제자리). suggestions · children · meta · description 유무.

## States

지원 상태: `default`

default. 결과 줄의 지금(키보드 · 마우스) 표시는 `bg.sunken`, disabled 결과는 `fg.disabled`이고 고를 수 없다. loading은 스켈레톤 줄 4개, 결과 0건이면 empty(기본 "찾는 항목이 없습니다").

## 동작

열리면 입력 칸에 초점이 가고 첫 결과가 지금 결과다. 글자를 치면 filter가 true일 때 이름 · 설명 · keywords에 그 글자가 들어간 결과만 남기고(대소문자 무시, 앞뒤 공백 무시) 빈 묶음은 숨긴다. filter가 false면 groups를 그대로 보인다(앱이 서버에서 찾을 때). ArrowDown · ArrowUp은 결과를 옮기고 끝에서 처음으로 돈다. Home · End는 처음 · 마지막. Tab은 다음 묶음의 첫 결과로(Shift+Tab은 앞 묶음), 묶음이 하나면 그대로. Enter나 누르기는 onSelect(item, group)을 부르고 closeOnSelect면 닫는다. Escape나 바깥을 누르면 닫는다. 마우스를 올리면 지금 결과가 그 줄로 옮겨지고, 지금 결과는 목록 안에서 보이게 스크롤된다. 빠른 질문을 누르면 그 글자가 입력에 들어가고(onQueryChange) 초점은 입력에 남는다. 닫았다 열면 찾는 글자는 비제어일 때 비워진다. 열고 닫을 때 투명도와 위아래 4px 이동, `duration.normal`(들어올 때 `easing.enter`, 나갈 때 `easing.exit`).

## 접근성

입력은 `role="combobox"` · `aria-expanded` · `aria-controls`(목록) · `aria-activedescendant`(지금 결과) · `aria-autocomplete="list"`. 목록은 `role="listbox"`, 묶음은 `role="group"` + 머리로 `aria-labelledby`, 결과는 `role="option"` · `aria-selected`(지금 결과) · `aria-disabled`. 대화상자는 `role="dialog"` · `aria-modal="true"`이고 이름은 title(보이지 않는 제목). 결과 건수가 바뀌면 `role="status"`로 "결과 N건"을 polite로 알린다. 초점은 입력에만 있고 결과 줄은 Tab 대상이 아니다(콤보박스 패턴). 닫히면 연 단추로 초점이 돌아간다.

## 밀도

결과 줄 `density.row-height`(compact 32 · comfortable 40), 휴대폰 `space.48`. 입력 줄 높이 `space.48`. 입력 글자 `type.h3`, 휴대폰은 `density.input-font-size`(16, iOS 확대 방지).

## 플랫폼 차이

웹 전용(native false). 폭이 `breakpoint.sm`보다 좁으면 화면 위에 붙은 전체 폭 판(아래만 둥근 모서리, 최대 높이 화면 전체)으로 열린다. 키보드가 아래에서 올라와도 입력과 첫 결과가 보이게 위에 둔다(D-60의 아래 시트와 다른 점). 키 안내 줄은 휴대폰에서 숨긴다.

## 금지 사항

제목 줄 · 닫기 단추를 보이기(폼 대화상자처럼 보인다) · 지금 결과를 왼쪽 색 띠로 표시(D-57) · 묶음 건수 알약(D-56) · 결과를 고르면 확인 없이 외부로 나가는 동작(발행 · 이체) 실행 → 리뷰.

## 예시

### 제자리

대화상자 없이 그린 판. 열린 팔레트의 모양이다

```tsx
import type { CommandPaletteGroup } from '@terracelab/trellis-contracts';
import { CommandPalette } from '@terracelab/trellis-react';

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

function Inline() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 10)' }}>
      <CommandPalette inline groups={GROUPS} onSelect={() => {}} />
    </div>
  );
}
```

### ⌘K 대화상자

단추나 ⌘K · Ctrl+K로 연다. 화면 이름 일부를 치고 Enter

```tsx
import type { CommandPaletteGroup } from '@terracelab/trellis-contracts';
import { useEffect, useState } from 'react';
import { Button, CommandPalette } from '@terracelab/trellis-react';

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

function Shortcut() {
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
```

### 질문과 답

빠른 질문을 누르면 글자가 채워지고, 앱이 결과 위에 답을 보인다

```tsx
import type { CommandPaletteGroup } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { CommandPalette } from '@terracelab/trellis-react';

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

function Answer() {
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
```

### 결과 없음

무엇이 없는지와 다음에 해 볼 것을 말한다

```tsx
import type { CommandPaletteGroup } from '@terracelab/trellis-contracts';
import { CommandPalette } from '@terracelab/trellis-react';

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

function Empty() {
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
```
