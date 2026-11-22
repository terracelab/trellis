# FolderTree

> `@terracelab/trellis-react` · CSS `.tl-folder-tree` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { FolderTree } from '@terracelab/trellis-react';
```

## 용도

폴더 · 메일함처럼 겹쳐 담긴 묶음을 트리로 보여 주고 하나를 고를 때 쓴다. 고른 폴더의 내용은 옆 목록(DataGrid · 메일 목록)이 보인다. 화면 이동 메뉴는 SideNav, 표 안의 계층 행(계정 과목 · BOM)은 DataGrid childrenKey, 값 하나 고르기는 Select.

## 해부(Anatomy)

root(`role="tree"`) · item(행 높이 `density.row-height`, `radius.md`, 들여쓰기 단계마다 `space.12`, 글자 `density.body-font-size` `fg.secondary`) · toggle(펼침 칸 `density.control-height-sm` 정사각, chevron-right 16 `fg.tertiary`, 펼치면 90도) · icon(16 `fg.tertiary`, 기본 folder) · label(말줄임) · count(흐린 숫자 `type.caption` `fg.secondary` tabular, 알약 없음).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `nodes` | `FolderTreeNode[]` |  | 필수 | 폴더(하위는 children) |
| `selected` | `string \| null` |  |  | 고른 폴더(제어) |
| `defaultSelected` | `string \| null` |  |  | 처음 고른 폴더 |
| `onSelect` | `(id: string) => void` |  |  | 폴더를 고를 때 |
| `expanded` | `string[]` |  |  | 펼친 폴더(제어) |
| `defaultExpanded` | `string[]` | `[]` |  | 처음 펼친 폴더 |
| `onExpandedChange` | `(expanded: string[]) => void` |  |  | 펼침이 바뀔 때 |
| `label` | `string` |  |  | 트리 이름(기본 "폴더") |

## Variants

없음. 하위가 하나도 없는 한 단계 목록(메일함)은 펼침 칸 없이 아이콘부터 시작한다.

## States

지원 상태: `default` · `hover` · `focus` · `disabled`

default · hover(행 `bg.sunken`, 글자 `fg.primary`) · focus(행 안쪽 링) · disabled(`fg.disabled`, 고를 수 없음, 포커스는 간다). 고른 폴더는 `brand.subtle` 바탕 + `fg.link` 600(아이콘도 `fg.link`). active · loading · error는 해당 없음.

## 동작

행을 누르면 그 폴더를 고르고(onSelect) 포커스가 행으로 간다. 펼침 칸을 누르면 펼치기 · 접기만 하고 고르지 않는다. 행을 두 번 누르면 펼치기 · 접기. 접힌 폴더의 하위는 그리지 않는다. selected · expanded를 주면 제어, defaultSelected · defaultExpanded만 주면 컴포넌트가 들고 있다. 고르기와 포커스는 따로다. 화살표로 옮겨 다니고 Enter · Space로 고른다.

| 키 | 동작 |
| --- | --- |
| ArrowDown · ArrowUp | 보이는 다음 · 이전 행 |
| ArrowRight | 접힌 폴더는 펼친다. 펼친 폴더는 첫 하위로 |
| ArrowLeft | 펼친 폴더는 접는다. 아니면 상위로 |
| Home · End | 첫 행 · 마지막 행 |
| Enter · Space | 고르기 |
| 글자 입력 | 그 글자로 시작하는 다음 행으로(이어 치면 이어 찾는다) |

## 접근성

`role="tree"` + 평평한 `treeitem`(`aria-level` · `aria-setsize` · `aria-posinset`). 하위가 있으면 `aria-expanded`, 고른 행은 `aria-selected="true"`, 쓸 수 없으면 `aria-disabled`. 트리에는 한 행만 탭 순서에 든다(포커스했던 행 → 고른 행 → 첫 행). 행 이름은 "폴더 이름 N건"(건은 숨은 글자). 트리 이름은 label, 없으면 "폴더". 펼침 상태는 chevron 방향과 `aria-expanded`가 함께 말한다. reduced-motion이면 chevron이 돌지 않는다. 휴대폰(touch)에서 행은 48, 펼침 칸은 40.

## 밀도

행 높이 `density.row-height`(compact 32 · comfortable 40 · touch 48), 펼침 칸 `density.control-height-sm`, 글자 `density.body-font-size`.

## 플랫폼 차이

네이티브는 같은 props로 행 목록을 그리고, 펼침 칸 · 행을 누르는 동작이 같다. 화살표 키 · 글자 찾기는 없다(Phase 3).

## 금지 사항

건수를 알약 배지로(D-56, 리뷰) · 고른 행 왼쪽에 색 띠(D-57, 리뷰) · 행 안에 단추 넣기(펼침 칸 말고는 행 전체가 하나) · 다섯 단계 넘는 깊이(화면 구조를 다시 본다, 리뷰).

## 예시

### 문서함 폴더

펼친 폴더 · 고른 폴더를 화면이 들고 있다. 숫자는 하위 폴더까지 센 문서 수

```tsx
import { useState } from 'react';
import { FolderTree } from '@terracelab/trellis-react';

const DOC_FOLDERS = [
  {
    id: 'root',
    label: '내 문서',
    count: 14,
    children: [
      {
        id: 'close',
        label: '2026 결산',
        count: 7,
        children: [
          { id: 'close-10', label: '10월 마감', count: 4 },
          { id: 'close-11', label: '11월 마감', count: 3 },
        ],
      },
      {
        id: 'tax',
        label: '세무 신고',
        count: 2,
        children: [{ id: 'vat', label: '부가세 2기 예정', count: 2 }],
      },
      { id: 'contracts', label: '거래처 계약서', count: 3 },
      { id: 'minutes', label: '회의록', count: 2 },
    ],
  },
  { id: 'shared', label: '공유받은 문서', icon: 'users', count: 2 },
  { id: 'trash', label: '휴지통', icon: 'trash-2', count: 0 },
] as const;

function Documents() {
  const [selected, setSelected] = useState('close-10');
  const [expanded, setExpanded] = useState<string[]>(['root', 'close', 'tax']);
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 4)' }}>
      <FolderTree
        label="문서 폴더"
        nodes={DOC_FOLDERS}
        selected={selected}
        onSelect={setSelected}
        expanded={expanded}
        onExpandedChange={setExpanded}
      />
    </div>
  );
}
```

### 메일함

하위가 없는 한 단계 목록도 같은 트리로 그린다. 숫자는 안 읽은 메일

```tsx
import { FolderTree } from '@terracelab/trellis-react';

const MAILBOXES = [
  { id: 'inbox', label: '받은편지함', icon: 'inbox', count: 3 },
  { id: 'sent', label: '보낸편지함', icon: 'send' },
  { id: 'drafts', label: '임시 보관함', icon: 'file-pen', count: 1 },
  { id: 'spam', label: '스팸', icon: 'ban' },
] as const;

function Mailboxes() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 3)' }}>
      <FolderTree label="메일함" nodes={MAILBOXES} defaultSelected="inbox" />
    </div>
  );
}
```
