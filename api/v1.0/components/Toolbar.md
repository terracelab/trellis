# Toolbar

> `@terracelab/trellis-react` · CSS `.tl-toolbar` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { Toolbar } from '@terracelab/trellis-react';
```

## 용도

한 줄에 모은 도구 단추(서식 · 넣기 · 목록 동작)를 묶음과 구분선으로 보여 줄 때 쓴다(ecm/doc-editor 서식 도구 줄). 화면 머리의 주 동작은 PageHeader actions, 여러 건을 고른 뒤 할 일은 ActionBar, 더 보기 메뉴는 Menu, 보기 하나를 고르는 것은 SegmentedControl.

## 해부(Anatomy)

root(`tl-toolbar`, role=toolbar, 줄바꿈 flex, 간격 `space.4`) · group(role=group, 이름 = label) · separator(묶음 사이 세로 선 `border.divider` 1px × `space.20`) · button(높이 · 최소 폭 `density.control-height-sm` · md, `radius.md`, 글자 `fg.secondary`, IconButton ghost와 같은 토큰. 아이콘 16 또는 서식 글자 `type.body` · showLabel이면 아이콘 + 이름) · pressed(켠 단추 `brand.subtle` + `fg.link`) · content(Select 같은 부품 자리) · end(끝 글자 `type.caption` `fg.secondary` tabular, 오른쪽 끝).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `label` | `string` |  | 필수 | 도구 줄 이름(접근성) |
| `groups` | `ToolbarGroup[]` |  | 필수 | 묶음(id · label · items · content). 묶음 사이 구분선 |
| `onPress` | `(id: string) => void` |  |  | 단추를 누를 때 |
| `end` | `ReactNode` |  |  | 끝 자리 글자(초점 없음) |
| `size` | `'sm' \| 'md'` | `"sm"` |  | 단추 크기(sm 30 · md 36) |
| `orientation` | `'horizontal' \| 'vertical'` | `"horizontal"` |  | 방향(화살표 키도 따라간다) |
| `disabled` | `boolean` | `false` |  | 전부 잠금 |

## Variants

size sm(30, 기본) · md(36) × orientation horizontal(기본) · vertical. 단추 종류는 누르는 단추(pressed 없음) · 켜고 끄는 단추(pressed true · false) · 아이콘 + 이름(showLabel) · 서식 글자(text + textStyle bold · italic · underline · strike).

## States

지원 상태: `default` · `hover` · `active` · `focus` · `disabled`

default · hover(바탕 `bg.sunken`, 글자 `fg.primary`) · active(`bg.sunken`, 글자 `fg.strong`) · focus(링 `border.focus` 2px, `tl-focusable`) · disabled(글자 `fg.disabled`, 바탕 없음, `aria-disabled`. 화살표 이동에는 남는다). 켠 단추는 바탕 한 단계(`brand.subtle`)이고 굵은 띠가 없다. loading · error는 해당 없음.

## 동작

단추를 누르면 `onPress(id)`. 켜고 끄는 단추도 같은 onPress이고 pressed는 부르는 쪽이 뒤집는다(문서 상태가 진실이다). 잠긴 단추는 눌러도 onPress를 부르지 않는다.

| 키 | 동작 |
| --- | --- |
| Tab | 도구 줄로 들어온다(마지막에 있던 단추). 다시 Tab이면 밖으로 |
| → · ← (세로는 ↓ · ↑) | 다음 · 앞 단추(끝에서 처음으로 돈다). content 안의 첫 초점 요소(Select)도 들어간다 |
| Home · End | 첫 · 끝 단추 |
| Enter · Space | 단추 누르기 |

탭 정류장은 하나다(roving tabindex). content 안 부품의 tabindex도 도구 줄이 맞춘다. 글자 입력 칸 안에서는 화살표가 글자 커서를 옮긴다. 넓이가 모자라면 단추가 다음 줄로 넘어간다.

## 접근성

`role="toolbar"` + `aria-label`(label) + `aria-orientation`. 묶음은 `role="group"` + 이름, 구분선은 `role="separator"`. 아이콘 · 서식 글자만 있는 단추는 `aria-label`(label)과 툴팁(단축키가 있으면 "굵게 (Ctrl+B)"), 단축키는 `aria-keyshortcuts`. 켜고 끄는 단추는 `aria-pressed`. 잠긴 단추는 `aria-disabled`라 화면 읽기가 찾을 수 있다. 끝 글자는 초점을 받지 않는다. 대비: 글자 `fg.secondary`(4.5:1), 켠 단추 `fg.link` on `brand.subtle`.

## 밀도

단추 `density.control-height-sm`(compact 30 · comfortable 30 · touch 44), md는 `density.control-height-md`. 간격은 밀도와 관계없이 `space.4`.

## 플랫폼 차이

네이티브는 가로 스크롤 줄(키보드 위 서식 줄)로 그린다. 화살표 이동 대신 스크린 리더 쓸어 넘기기. props는 같다.

## 금지 사항

role=toolbar를 블록이 직접(roving 없는 단추 줄) → Toolbar · 켠 단추를 굵은 아래 · 왼쪽 띠로 · 주 동작(저장 · 결재 요청)을 도구 줄에 → PageHeader actions · ActionBar → 리뷰.

## 예시

### 문서 서식

문단 서식(Select) · 글자 서식(켜고 끄는 단추) · 넣기 묶음 사이에 구분선, 끝에 글자 수. 화살표로 옮긴다

```tsx
import { formatQuantity } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { Select, Toolbar } from '@terracelab/trellis-react';

function Editor() {
  const [para, setPara] = useState<string | null>('body');
  const [marks, setMarks] = useState<string[]>(['bold']);
  const [last, setLast] = useState('');
  const toggle = (id: string) =>
    setMarks((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-8)' }}>
      <Toolbar
        label="서식"
        onPress={(id) => (['bold', 'italic', 'underline'].includes(id) ? toggle(id) : setLast(id))}
        end={`${formatQuantity(1284, '자')} · 붙임 2건`}
        groups={[
          {
            id: 'para',
            label: '문단',
            content: (
              <Select
                size="sm"
                width="auto"
                label="문단 서식"
                value={para}
                onChange={setPara}
                options={[
                  { value: 'body', label: '본문' },
                  { value: 'h1', label: '제목 1' },
                  { value: 'h2', label: '제목 2' },
                  { value: 'quote', label: '인용' },
                ]}
              />
            ),
          },
          {
            id: 'marks',
            label: '글자 서식',
            items: [
              {
                id: 'bold',
                label: '굵게',
                text: '가',
                textStyle: 'bold',
                shortcut: 'Ctrl+B',
                pressed: marks.includes('bold'),
              },
              {
                id: 'italic',
                label: '기울임',
                text: '가',
                textStyle: 'italic',
                shortcut: 'Ctrl+I',
                pressed: marks.includes('italic'),
              },
              {
                id: 'underline',
                label: '밑줄',
                text: '가',
                textStyle: 'underline',
                shortcut: 'Ctrl+U',
                pressed: marks.includes('underline'),
              },
            ],
          },
          {
            id: 'insert',
            label: '넣기',
            items: [
              { id: 'list', label: '목록', icon: 'list' },
              { id: 'table', label: '표', icon: 'table' },
              { id: 'image', label: '이미지', icon: 'image' },
              { id: 'file', label: '첨부', icon: 'paperclip' },
            ],
          },
        ]}
      />
      <p style={{ margin: 0, color: 'var(--tl-color-fg-secondary)' }} aria-live="polite">
        {last ? `${last} 단추를 눌렀습니다` : '넣기 단추를 누르면 여기에 보입니다'}
      </p>
    </div>
  );
}
```

### 글자 단추 · 잠금

showLabel은 아이콘 옆에 이름을 쓴다. 결재 중 문서는 disabled로 잠그고 단추는 화살표 이동에 남는다

```tsx
import { Toolbar } from '@terracelab/trellis-react';

function Labels() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-16)' }}>
      <Toolbar
        label="목록 동작"
        size="md"
        groups={[
          {
            id: 'edit',
            items: [
              { id: 'add', label: '추가', icon: 'plus', showLabel: true },
              { id: 'copy', label: '복사', icon: 'copy', showLabel: true },
            ],
          },
          {
            id: 'out',
            items: [
              { id: 'print', label: '인쇄', icon: 'printer', showLabel: true },
              { id: 'download', label: '다운로드', icon: 'download', showLabel: true },
            ],
          },
        ]}
      />
      <Toolbar
        label="서식"
        disabled
        end="결재 중에는 고칠 수 없습니다"
        groups={[
          {
            id: 'marks',
            items: [
              { id: 'bold', label: '굵게', text: '가', textStyle: 'bold', pressed: false },
              { id: 'list', label: '목록', icon: 'list' },
            ],
          },
        ]}
      />
    </div>
  );
}
```
