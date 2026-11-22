# OrgChart

> `@terracelab/trellis-react` · CSS `.tl-org-chart` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { OrgChart } from '@terracelab/trellis-react';
```

## 용도

회사 조직을 위에서 아래로 내려가는 나무로 보여 주고, 조직을 골라 그 조직의 구성원 · 결재 정책을 옆에서 열 때 쓴다. 조직 칸에 조직장(PersonLabel sm)과 인원을 둔다. 폴더 · 메일함처럼 이름만 고르면 FolderTree.

## 해부(Anatomy)

root(가로 스크롤) · tree(`ul role=tree`) · item(`li role=treeitem`) · node(칸: 이름 700 · 조직장 · 인원 caption `fg.tertiary`, `radius.lg` 테두리) · toggle(칸 아래 가장자리 가운데 동그라미, +/−) · group(`ul role=group`) · 연결선(구조선 `border.strong` 1px).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `nodes` | `OrgChartNode[]` |  | 필수 | 조직(하위는 children) |
| `selected` | `string \| null` |  |  | 고른 조직(제어) |
| `defaultSelected` | `string \| null` |  |  | 처음 고른 조직 |
| `onSelect` | `(id: string) => void` |  |  | 조직을 고를 때 |
| `expanded` | `string[]` |  |  | 펼친 조직(제어) |
| `defaultExpanded` | `string[] \| 'all'` | `"all"` |  | 처음 펼친 조직('all' = 전부) |
| `onExpandedChange` | `(expanded: string[]) => void` |  |  | 펼침이 바뀔 때 |
| `label` | `string` |  |  | 트리 이름(기본 "조직도") |

## Variants

defaultExpanded 'all'(기본) · 펼칠 id 목록. 고른 조직은 테두리 한 바퀴(`border.selected`).

## States

지원 상태: `default` · `hover` · `focus`

default · hover(칸 테두리 진하게, `duration.fast`) · focus(칸에 포커스 링).

## 동작

칸을 누르면 고른다(onSelect). 동그라미를 누르면 하위 조직을 접고 편다(고르지 않음). 넓으면 가로로 스크롤한다. 휴대폰(640 미만)은 들여 쓴 목록이 되고 하위 묶음 왼쪽에 나무 구조선이 생긴다.

## 접근성

ARIA tree(탐색 트리 패턴: 항목 = 노드 칸, 하위 group은 형제 ul + aria-owns). 트리 안 Tab 정지는 하나(로빙 tabindex). ↑ ↓ = 보이는 순서로 이동, → = 펼치기 · 첫 하위로, ← = 접기 · 상위로, Home · End, Enter · Space = 고르기. 항목 이름 = 노드 칸의 보이는 글자 전체(조직 이름 · 조직장 · 인원). 보이는 글자가 이름에 다 들어가야 한다(WCAG 2.5.3). 동그라미는 마우스용(aria-hidden).

## 밀도

세로 간격 `space.32`, 형제 사이 `space.16`, 칸 폭 192~256. 밀도와 관계없이 같다.

## 플랫폼 차이

네이티브는 들여 쓴 목록만 그린다.

## 금지 사항

조직마다 다른 바탕색 · 인원을 알약으로 · 칸 왼쪽 색 띠(D-56 · D-57) → 리뷰.

## 예시

### 회사 조직도

조직 칸에 조직장과 인원. 고른 조직은 테두리 한 바퀴

```tsx
import { useState } from 'react';
import { OrgChart } from '@terracelab/trellis-react';

const COMPANY = [
  {
    id: 'root',
    name: '테라트레이딩',
    head: { name: '이도윤', title: '대표' },
    headcount: 42,
    children: [
      {
        id: 'ops',
        name: '경영지원본부',
        head: { name: '김성경', title: '본부장' },
        headcount: 9,
        children: [
          { id: 'fin', name: '재무팀', head: { name: '박지수', title: '팀장' }, headcount: 4 },
          { id: 'hr', name: '인사팀', head: { name: '한서연', title: '파트장' }, headcount: 3 },
        ],
      },
      {
        id: 'sales',
        name: '영업본부',
        head: { name: '정민호', title: '본부장' },
        headcount: 18,
        children: [
          { id: 'kr', name: '국내영업팀', head: { name: '최유진', title: '팀장' }, headcount: 11 },
          { id: 'global', name: '해외영업팀', headcount: 6 },
        ],
      },
      {
        id: 'dev',
        name: '개발본부',
        head: { name: '이민호', title: '본부장' },
        headcount: 14,
        children: [
          {
            id: 'platform',
            name: '플랫폼팀',
            head: { name: '오세훈', title: '팀장' },
            headcount: 8,
          },
          { id: 'data', name: '데이터팀', head: { name: '서다은', title: '팀장' }, headcount: 5 },
        ],
      },
    ],
  },
];

function Company() {
  const [selected, setSelected] = useState<string | null>('hr');
  return <OrgChart nodes={COMPANY} selected={selected} onSelect={setSelected} />;
}
```

### 본부까지만 펼침

동그라미 단추나 → 키로 하위 조직을 연다

```tsx
import { OrgChart } from '@terracelab/trellis-react';

const COMPANY = [
  {
    id: 'root',
    name: '테라트레이딩',
    head: { name: '이도윤', title: '대표' },
    headcount: 42,
    children: [
      {
        id: 'ops',
        name: '경영지원본부',
        head: { name: '김성경', title: '본부장' },
        headcount: 9,
        children: [
          { id: 'fin', name: '재무팀', head: { name: '박지수', title: '팀장' }, headcount: 4 },
          { id: 'hr', name: '인사팀', head: { name: '한서연', title: '파트장' }, headcount: 3 },
        ],
      },
      {
        id: 'sales',
        name: '영업본부',
        head: { name: '정민호', title: '본부장' },
        headcount: 18,
        children: [
          { id: 'kr', name: '국내영업팀', head: { name: '최유진', title: '팀장' }, headcount: 11 },
          { id: 'global', name: '해외영업팀', headcount: 6 },
        ],
      },
      {
        id: 'dev',
        name: '개발본부',
        head: { name: '이민호', title: '본부장' },
        headcount: 14,
        children: [
          {
            id: 'platform',
            name: '플랫폼팀',
            head: { name: '오세훈', title: '팀장' },
            headcount: 8,
          },
          { id: 'data', name: '데이터팀', head: { name: '서다은', title: '팀장' }, headcount: 5 },
        ],
      },
    ],
  },
];

function Collapsed() {
  return <OrgChart nodes={COMPANY} defaultExpanded={['root']} />;
}
```
