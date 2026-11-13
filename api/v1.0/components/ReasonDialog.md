# ReasonDialog

> `@terracelab/trellis-react` · CSS `.tl-reason-dialog` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { ReasonDialog } from '@terracelab/trellis-react';
```

## 용도

사유를 받아야 끝나는 동작을 확인할 때 쓴다(결재 반려 · 회수, 삭제, 가린 정보 보기). 사유 칸 하나와 결과를 말하는 확인 단추로 된 Dialog다. 사유 없는 확인은 Dialog, 여러 칸을 받는 입력은 Drawer나 화면 폼.

## 해부(Anatomy)

Dialog(sm 폭, `bg.elevated`, 그림자 · 테두리는 Dialog를 따른다) · head(제목 `type.h3` · 설명 `fg.secondary`, danger면 triangle-alert `status.danger.default`) · field(Field + Textarea, 라벨 기본 "사유", 필수 점, 글자 수) · help(최소 글자 수 안내 `type.caption` `fg.tertiary`) · error(Field 오류 문구 `status.danger.default`) · note(아래 안내 한 줄 `type.caption` `fg.tertiary`) · footer(취소 secondary · 확인 primary 또는 danger).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `open` | `boolean` |  |  | 열림(제어) |
| `defaultOpen` | `boolean` | `false` |  | 처음 열림 |
| `onOpenChange` | `(open: boolean) => void` |  |  | 열림이 바뀔 때 |
| `trigger` | `ReactElement` |  |  | 여는 단추 |
| `title` | `string` |  | 필수 | 제목 |
| `description` | `string` |  |  | 설명 한 문장 |
| `label` | `string` |  |  | 사유 칸 라벨(기본 사유) |
| `placeholder` | `string` |  |  | 예시 사유 |
| `confirmLabel` | `string` |  | 필수 | 확인 단추(결과를 말한다) |
| `minLength` | `number` | `1` |  | 최소 글자 수(앞뒤 공백 제외) |
| `maxLength` | `number` |  |  | 최대 글자 수 |
| `tone` | `'default' \| 'danger'` | `"default"` |  | 확인의 무게 |
| `note` | `string` |  |  | 아래 안내 한 줄 |
| `onConfirm` | `(reason: string) => void \| Promise<unknown>` |  |  | 확인(사유는 앞뒤 공백을 뺀 글자) |
| `loading` | `boolean` | `false` |  | 진행 중 |
| `error` | `string` |  |  | 오류 문구 |

## Variants

tone default(확인 primary) · danger(확인 danger, 제목 앞 경고 아이콘). size는 sm 고정.

## States

지원 상태: `default` · `disabled` · `loading` · `error`

default · disabled(사유가 minLength보다 짧으면 확인이 꺼진다) · loading(확인 단추 스피너, 취소 · Esc 막힘, 사유 칸 읽기 전용) · error(사유 칸 아래 오류 문구, `aria-invalid`). hover · active · focus는 안의 Button · Textarea 상태를 따른다.

## 동작

사유는 앞뒤 공백을 뺀 글자로 센다. 모자라면 확인이 꺼지고 minLength가 2 이상이면 "N자 이상 입력하세요"가 보인다. maxLength가 있으면 글자 수가 보이고 그 이상 입력되지 않는다. 확인을 누르면 `onConfirm(사유)`를 부른다. Promise를 돌려주면 끝날 때까지 loading이고, 성공하면 닫히며 사유를 비운다. 실패하면 열린 채 "처리하지 못했습니다. 다시 시도하세요"를 보인다(error prop이 있으면 그것). 닫기 규칙은 다음과 같다. 바깥을 눌러도 닫히지 않는다(쓰던 사유를 잃지 않게). Esc는 사유 칸이 비었을 때만 닫는다. 글자가 있으면 취소 단추로만 닫는다. 오른쪽 위 닫기 단추는 두지 않는다. 열리면 사유 칸에 포커스가 가고, 닫히면 여는 단추로 돌아간다. open을 주면 제어, 없으면 trigger로 연다.

## 접근성

`role="dialog"` + `aria-modal`, 이름은 title, 설명은 description. 사유 칸은 Field 라벨과 이어지고 도움말 · 오류 · 글자 수가 `aria-describedby`로 읽힌다. 확인이 꺼진 이유(최소 글자 수)가 화면 글자로 보인다. 키보드는 Tab 순환, Ctrl+Enter(맥은 Cmd+Enter) 확인, 빈 칸에서 Esc 닫기. 포커스 링은 항상 보인다.

## 밀도

Dialog를 따른다. 사유 칸은 4줄(`rows=4`), 글자는 `density.input-font-size`.

## 플랫폼 차이

네이티브는 Modal + TextInput(multiline). 하드웨어 뒤로 단추는 Esc와 같은 규칙(빈 칸일 때만 닫기).

## 금지 사항

확인 단추에 "확인 · 예" · 사유 없이 반려 · 회수 · 바깥 누름으로 닫혀 사유 잃기 · 사유 칸 여러 개(폼으로) · 반려 사유를 Toast로만 받기 → 리뷰.

## 예시

### 결재 반려

사유가 다섯 글자가 될 때까지 반려 단추가 꺼져 있다. 바깥을 눌러도 닫히지 않는다

```tsx
import { Button, ReasonDialog } from '@terracelab/trellis-react';

function Reject() {
  return (
    <ReasonDialog
      trigger={
        <Button variant="danger" icon="x">
          반려
        </Button>
      }
      tone="danger"
      title="지출결의서 EX-2611-0018을 반려합니다"
      description="반려하면 기안자에게 돌아가고 결재선이 처음부터 다시 시작됩니다."
      label="반려 사유"
      placeholder="영수증 2건이 빠졌습니다"
      minLength={5}
      maxLength={200}
      confirmLabel="반려"
      note="반려 사유는 기안자와 결재선 전원에게 보입니다."
      onConfirm={() => {}}
    />
  );
}
```

### 결재 회수

확인하면 요청이 끝날 때까지 진행 중이고, 끝나면 닫힌다

```tsx
import { Button, ReasonDialog } from '@terracelab/trellis-react';

function Withdraw() {
  return (
    <ReasonDialog
      trigger={<Button icon="undo-2">회수</Button>}
      title="결재 요청을 회수합니다"
      description="회수하면 문서가 기안 상태로 돌아갑니다. 다음 결재자의 결재함에서 빠집니다."
      label="회수 사유"
      confirmLabel="회수"
      onConfirm={() => new Promise((resolve) => setTimeout(resolve, 800))}
    />
  );
}
```

### 상태

확인 꺼짐 · 진행 중 · 오류 문구를 각각 단추로 연다

```tsx
import { Button, ReasonDialog } from '@terracelab/trellis-react';

function States() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--tl-space-8)' }}>
      <ReasonDialog
        trigger={<Button>확인 꺼짐</Button>}
        title="거래처를 삭제합니다"
        minLength={10}
        tone="danger"
        confirmLabel="삭제"
      />
      <ReasonDialog
        trigger={<Button>진행 중</Button>}
        title="결재 요청을 회수합니다"
        confirmLabel="회수"
        loading
      />
      <ReasonDialog
        trigger={<Button>오류</Button>}
        title="결재 요청을 회수합니다"
        confirmLabel="회수"
        error="다음 결재자가 이미 승인해 회수할 수 없습니다"
      />
    </div>
  );
}
```
