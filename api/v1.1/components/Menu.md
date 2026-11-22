# Menu

> `@terracelab/trellis-react` · CSS `.tl-menu` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { Menu } from '@terracelab/trellis-react';
```

## 용도

버튼 하나에 딸린 동작 여러 개(행 끝 더 보기 · 툴바 더 보기)를 펼친다. 값을 고르는 것은 Select, 화면 이동 목록은 Sidebar.

## 해부(Anatomy)

trigger(IconButton · Button) · popup(`tl-menu`, `bg.elevated`, `border.default`, `shadow.md`, `radius.md`, `z.dropdown`) · group-label(`type.caption` `fg.tertiary`) · item(높이 `density.row-height`, icon 16 `fg.secondary` · label `fg.primary` · shortcut `type.caption` `fg.tertiary`) · separator(`border.divider`).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `trigger` | `ReactElement` |  | 필수 | 여는 요소 |
| `items` | `MenuEntry[]` |  | 필수 | 항목 · 구분선 · 묶음 이름 |
| `align` | `'start' \| 'end'` | `"end"` |  | 트리거 기준 정렬 |
| `disabled` | `boolean` | `false` |  | 열리지 않음 |
| `title` | `string` |  |  | 좁은 화면 시트 제목(없으면 트리거 이름) |

## Variants

align start · end. 항목은 기본 · danger(아이콘만 `status.danger.default`, 글자는 중립) · disabled(이유가 있으면 `disabledReason`).

## States

지원 상태: `default` · `hover` · `focus` · `disabled`

default · hover(항목 강조 `bg.sunken`) · focus(키보드 강조도 같은 `bg.sunken`, 트리거는 포커스 링) · disabled(`disabled` prop이면 열리지 않고, 항목 disabled는 `fg.disabled`, disabledReason이 있으면 같은 모양에 포커스가 닿고 툴팁이 뜬다). active · loading · error는 해당 없음.

## 동작

Base UI Menu. 트리거를 누르면 열리고 첫 항목 앞에 포커스가 간다. 항목을 고르면 `onSelect`를 부르고 닫힌 뒤 포커스가 트리거로 돌아온다. `label` 항목은 다음 구분선이나 다음 label 앞까지를 한 묶음으로 만든다.

항목(`items`, R-T39): 세 가지를 섞어 넣는다.

| 종류 | 필드 | 설명 |
| --- | --- | --- |
| 실행 항목 `MenuActionItem` | `id` · `label` | 필수. label은 동사 어간이나 명사(수정 · 복사 · 삭제) |
| | `icon` | 아이콘 이름(icons 패키지 `IconName`). 팝업과 시트 모두 라벨 앞 16에 그린다. 한 항목이라도 아이콘이 있으면 아이콘 없는 항목은 그 칸을 비워 라벨 시작선을 맞춘다 |
| | `shortcut` | 단축키 표기(Ctrl+D). 표시만 한다. 시트에서는 숨긴다 |
| | `danger` · `disabled` · `disabledReason` | 위험 동작(아이콘만 위험 색) · 비활성 · 비활성 이유 |
| | `onSelect` | 고르면 부른다 |
| 구분선 | `type: 'separator'` | 묶음 사이 선 |
| 묶음 이름 | `type: 'label'` · `label` | 다음 구분선 · 묶음 이름까지를 묶는다 |

좁은 화면(`breakpoint.sm` 미만, D-60): 같은 트리거가 팝업 대신 아래 시트(dialog)를 연다. 시트 제목은 `title`, 없으면 트리거 이름(IconButton label · Button 글자), 그것도 없으면 "동작". 항목은 메뉴 항목이 아니라 손가락 높이 행 단추(`space.48`)다. 키보드는 Tab · Shift+Tab으로 항목을 오가고(화살표 · 글자 찾기 없음) Enter · Space로 실행, Escape나 닫기 단추 · 바깥 누르기 · 아래로 쓸기로 닫는다. 고르면 시트를 닫은 뒤 onSelect를 부른다. 아이콘 · 묶음 이름 · 구분선 · 위험 색은 팝업과 같고 단축키 표기는 숨긴다. disabledReason은 툴팁 대신 행 끝 보조 글자로 보인다.

비활성 이유: 항목에 `disabled`와 `disabledReason`(Button과 같은 이름)을 함께 주면 화살표로 그 항목에 닿고, 가리키거나 키보드로 닿으면 이유가 오른쪽 Trellis Tooltip으로 뜬다. 고를 수는 없다(onSelect를 부르지 않는다).

| 키 | 동작 |
| --- | --- |
| Enter · Space | 트리거에서 열기, 항목에서 실행 |
| ArrowUp · ArrowDown | 항목 이동(끝에서 처음으로) |
| Home · End | 처음 · 끝 항목 |
| Escape | 닫고 트리거로 |
| 글자 입력 | 그 글자로 시작하는 항목으로 |

## 접근성

넓은 화면 팝업은 `role="menu"` + `menuitem`, 묶음은 `group` + 라벨 연결. 트리거에 `aria-haspopup` · `aria-expanded`가 붙는다. 좁은 화면 시트는 `role="dialog"`(`aria-modal`, 이름 = 시트 제목)이고 항목은 `menuitem`이 아니라 `button`이다. 묶음은 `role="group"` + `aria-labelledby`(묶음 이름), 트리거는 `aria-haspopup="dialog"` · `aria-expanded`. 시트 안에서 Tab은 시트 밖으로 나가지 않고, 닫히면 포커스가 트리거로 돌아온다. 화면 검사 스크립트가 폭마다 다른 role(넓으면 menuitem, 좁으면 dialog 안 button)로 찾아야 한다. 트리거가 IconButton이면 `label`이 이름이다. 비활성 항목은 `aria-disabled`라 포커스가 닿고, disabledReason은 항목 안 숨은 글자(`hidden`)를 `aria-describedby`로 이어 설명으로 읽힌다. 위험 동작은 색만으로 구분하지 않는다(라벨이 삭제 · 반려처럼 결과를 말한다). reduced-motion이면 페이드 없이 열린다.

## 밀도

항목 높이 `density.row-height`(compact 32 · comfortable 40), 글자 `density.body-font-size`.

## 플랫폼 차이

네이티브는 바텀시트 목록(같은 items). 단축키 표기는 네이티브에서 숨긴다. 웹도 폭이 `breakpoint.sm`보다 좁으면 같은 트리거가 아래 시트를 연다(D-60 · PR-10): 제목은 `title`, 없으면 트리거 이름(IconButton label · Button 글자), 그것도 없으면 "동작". 항목은 손가락 높이 행(`space.48`), 묶음 이름은 `type.label` fg.secondary, 구분선은 `border.divider`, 위험 동작은 아이콘만 위험 색. 고르면 시트를 닫은 뒤 onSelect를 부른다. 단축키 표기는 시트에서 숨긴다. disabledReason은 툴팁 대신 행 끝 보조 글자(`type.caption` `fg.secondary`)로 보이고, 그 행은 `aria-disabled` 단추라 포커스가 닿되 눌러도 실행되지 않는다. 트리거는 `aria-haspopup="dialog"` · `aria-expanded`.

## 금지 사항

항목 10개 넘김(화면이나 Dialog로) · 하위 메뉴 2단 이상 · 메뉴 안에 입력창 · 위험 항목 글자를 빨강으로 · 권한 때문에 막힌 항목을 이유 없이 비활성으로 → 리뷰.

## 예시

### 행 끝 더 보기

표 행의 보조 동작을 모은다. 삭제는 아이콘만 위험 색이다

```tsx
import { IconButton, Menu } from '@terracelab/trellis-react';

const ROW_ACTIONS = [
  { id: 'edit', label: '수정', icon: 'pencil' },
  { id: 'copy', label: '복사해서 등록', icon: 'copy', shortcut: 'Ctrl+D' },
  { id: 'print', label: '발주서 인쇄', icon: 'printer', shortcut: 'Ctrl+P' },
  { type: 'separator' },
  { id: 'delete', label: '삭제', icon: 'trash-2', danger: true },
] as const;

function RowActions() {
  return (
    <Menu
      trigger={<IconButton icon="ellipsis" label="발주 PO-2611-0042 동작" />}
      items={ROW_ACTIONS}
    />
  );
}
```

### 묶음

이름으로 묶고 구분선으로 나눈다. 쓸 수 없는 항목은 비활성이고 이유를 툴팁으로 알린다

```tsx
import { Button, Menu } from '@terracelab/trellis-react';

const EXPORT_ITEMS = [
  { type: 'label', label: '파일' },
  { id: 'xlsx', label: '엑셀(.xlsx)', icon: 'file-spreadsheet' },
  { id: 'pdf', label: 'PDF', icon: 'file-text' },
  { type: 'separator' },
  { type: 'label', label: '보내기' },
  { id: 'mail', label: '거래처 메일로 보내기', icon: 'mail' },
  {
    id: 'erp',
    label: 'ERP 전송',
    icon: 'send',
    disabled: true,
    disabledReason: 'ERP 연동을 먼저 설정하세요',
  },
] as const;

function Groups() {
  return (
    <Menu
      align="start"
      trigger={<Button iconEnd="chevron-down">내보내기</Button>}
      items={EXPORT_ITEMS}
    />
  );
}
```
