# ContextMenu

> `@terracelab/trellis-react` · CSS `.tl-context-menu` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { ContextMenu } from '@terracelab/trellis-react';
```

## 용도

목록 행 · 파일 · 메시지에 딸린 동작을 우클릭 · 길게 누르기 · Shift+F10으로 바로 연다. 보이는 단추(행 끝 더 보기 Menu · 상세의 동작 단추)를 먼저 두고, 이것은 그 지름길로 쓴다. 단추 하나에 딸린 동작은 Menu.

## 해부(Anatomy)

area(`tl-context-menu`, 상자를 만들지 않는 감싸개 `display: contents`, 받은 목록의 배치를 바꾸지 않는다) · popup(Menu와 같다: `tl-menu`, `bg.elevated`, `border.default`, `shadow.md`(다크는 그림자 없이 선), `radius.md`, `z.dropdown`) · group-label · item(icon 16 `fg.secondary` · label `fg.primary` · shortcut) · separator(`border.divider`). 좁은 화면은 아래 시트(Menu 시트와 같은 행).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` |  | 필수 | 메뉴를 받는 영역 |
| `items` | `MenuEntry[]` |  | 필수 | 항목 · 구분선 · 묶음 이름 |
| `onOpenChange` | `(open: boolean, target: HTMLElement \| null) => void` |  |  | 열림이 바뀔 때(웹은 연 요소도) |
| `disabled` | `boolean` | `false` |  | 열리지 않음(브라우저 메뉴가 뜬다) |
| `title` | `string` |  |  | 좁은 화면 시트 제목(없으면 "동작") |

## Variants

항목은 Menu와 같다: 기본 · danger(아이콘만 `status.danger.default`, 글자는 중립) · disabled · 묶음 이름 · 구분선.

## States

지원 상태: `default` · `hover` · `focus` · `disabled`

default · hover(항목 강조 `bg.sunken`) · focus(키보드 강조도 같은 `bg.sunken`) · disabled(`disabled`면 열지 않고 브라우저 메뉴를 막지 않는다, 항목 disabled는 `fg.disabled`). active · loading · error는 해당 없음.

## 동작

- 여는 법: 영역 안에서 우클릭하면 누른 자리에, 포커스한 요소에서 Shift+F10 · 메뉴 키를 누르면 그 요소 왼쪽 아래에 연다. 터치는 500ms 길게 누르면 연다(10 넘게 움직이면 취소). 열린 동안 브라우저 메뉴는 뜨지 않는다.
- 어느 행의 메뉴인가: 열 때 `onOpenChange(true, target)`의 target이 누른 요소(키보드는 포커스한 요소)다. 앱은 `target.closest('[data-id]')`처럼 행을 찾아 그 행의 items를 넘긴다. items가 비어 있으면(빈 자리) 열지 않는다.
- 고르면: 항목의 `onSelect`를 부르고 닫는다. 닫히면 포커스가 연 요소로 돌아간다.
- 좁은 화면(`breakpoint.sm` 미만, D-60): 같은 동작이 아래 시트를 연다. 제목은 `title`(없으면 "동작"), 행은 손가락 높이(`space.48`), 고르면 시트를 닫은 뒤 실행한다. 길게 누른 뒤 손을 떼며 오는 click은 한 번 삼켜 행이 열리지 않는다.

| 키 | 동작 |
| --- | --- |
| Shift+F10 · 메뉴 키 | 포커스한 요소의 메뉴 열기 |
| ArrowUp · ArrowDown | 항목 이동 |
| Home · End | 처음 · 끝 항목 |
| Enter · Space | 항목 실행 |
| Escape | 닫고 연 요소로 |

## 접근성

`role="menu"` + `menuitem`, 묶음은 `group` + 라벨 연결. 우클릭 · 길게 누르기는 숨은 기능이라 같은 동작을 보이는 단추(더 보기 Menu · 상세 동작)로도 제공한다. 키보드 사용자는 행에 포커스를 두고 Shift+F10을 쓴다. 위험 동작은 색만으로 구분하지 않는다(라벨이 결과를 말한다). reduced-motion이면 페이드 없이 열린다.

## 밀도

항목 높이 `density.row-height`(compact 32 · comfortable 40), 글자 `density.body-font-size`. 시트 행은 밀도와 관계없이 `space.48`.

## 플랫폼 차이

네이티브는 길게 누르기(onLongPress)로 바텀시트 목록을 연다. 우클릭 · 키보드는 없다. 웹 `onOpenChange`의 둘째 인자(target)는 웹 전용이고, 네이티브는 항목을 감싼 쪽에서 무엇을 눌렀는지 안다. props는 같다.

## 금지 사항

이 메뉴에만 있는 동작(보이는 단추 없이) · 항목 10개 넘김 · 하위 메뉴 · 위험 항목 글자를 빨강으로 · 입력 칸 안에서 브라우저 메뉴(붙여넣기)를 막기. 리뷰로 막는다.

## 예시

### 파일 목록

행을 우클릭하거나 길게 누르거나 포커스한 행에서 Shift+F10을 누르면 그 행의 메뉴가 열린다. 휴대폰은 아래 시트다

```tsx
import { formatAttachmentSize } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { Icon, ContextMenu } from '@terracelab/trellis-react';

const FILES = [
  { id: 'f1', name: '10월 결산 보고서.xlsx', size: 482_304, by: '김테라', at: '2026-11-05' },
  { id: 'f2', name: '부가세 예정신고 증빙.zip', size: 18_874_368, by: '정우진', at: '2026-11-04' },
  { id: 'f3', name: '누리식품 공급 계약서.pdf', size: 1_258_291, by: '문채원', at: '2026-11-02' },
];

function FileRows() {
  const [fileId, setFileId] = useState<string | null>(null);
  const [last, setLast] = useState('');
  const file = FILES.find((f) => f.id === fileId);
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-8)',
        maxWidth: 'calc(var(--tl-space-64) * 8)',
      }}
    >
      <ContextMenu
        title={file?.name ?? '파일'}
        onOpenChange={(open, target) => {
          if (open) setFileId(target?.closest('li')?.dataset['id'] ?? null);
        }}
        items={
          file
            ? [
                {
                  id: 'open',
                  label: '열기',
                  icon: 'eye',
                  onSelect: () => setLast(`${file.name} 열기`),
                },
                {
                  id: 'download',
                  label: '다운로드',
                  icon: 'download',
                  onSelect: () => setLast(`${file.name} 다운로드`),
                },
                {
                  id: 'share',
                  label: '공유',
                  icon: 'users',
                  onSelect: () => setLast(`${file.name} 공유`),
                },
                { type: 'separator' },
                {
                  id: 'trash',
                  label: '휴지통으로 이동',
                  icon: 'trash-2',
                  danger: true,
                  onSelect: () => setLast(`${file.name} 휴지통으로 이동`),
                },
              ]
            : []
        }
      >
        <ul
          aria-label="문서"
          style={{
            margin: 0,
            padding: 0,
            border: 'var(--tl-border-width-1) solid var(--tl-color-border-default)',
            borderRadius: 'var(--tl-radius-md)',
            listStyle: 'none',
          }}
        >
          {FILES.map((f, i) => (
            <li
              key={f.id}
              data-id={f.id}
              tabIndex={0}
              className="tl-focusable"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--tl-space-8)',
                minHeight: 'var(--tl-density-row-height)',
                padding: '0 var(--tl-space-12)',
                borderTop: i ? 'var(--tl-border-width-1) solid var(--tl-color-border-divider)' : 0,
              }}
            >
              <Icon name="file-text" size={16} />
              <span style={{ flex: '1 1 auto', minWidth: 0 }}>{f.name}</span>
              <span style={{ color: 'var(--tl-color-fg-secondary)' }}>
                {formatAttachmentSize(f.size)} · {f.by} · {f.at}
              </span>
            </li>
          ))}
        </ul>
      </ContextMenu>
      <p role="status" style={{ margin: 0, color: 'var(--tl-color-fg-secondary)' }}>
        {last || '행에서 우클릭하세요'}
      </p>
    </div>
  );
}
```
