# Dialog

> `@terracelab/trellis-react` · CSS `.tl-dialog` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { Dialog } from '@terracelab/trellis-react';
```

## 용도

화면을 떠나지 않고 짧게 확인하거나 입력받는다(반려 사유 · 삭제 확인 · 발행 확인). 긴 입력이나 상세 보기는 Drawer.

## 해부(Anatomy)

backdrop(`bg.overlay`) · popup(`bg.elevated`, `radius.lg`, `shadow.lg`, 폭 sm 400 · md 560 · lg 800) · head(title `type.h2`, description, 닫기) · body · footer(오른쪽 정렬 버튼).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `open` | `boolean` |  |  | 열림(제어) |
| `defaultOpen` | `boolean` | `false` |  | 처음 열림 |
| `onOpenChange` | `(open: boolean) => void` |  |  | 열림이 바뀔 때 |
| `title` | `string` |  | 필수 | 제목 |
| `description` | `string` |  |  | 설명 한 문장 |
| `size` | `'sm' \| 'md' \| 'lg'` | `"md"` |  | 폭(400 · 560 · 800) |
| `trigger` | `ReactElement` |  |  | 여는 버튼 |
| `footer` | `ReactNode` |  |  | 아래 동작 |
| `tone` | `'default' \| 'danger'` | `"default"` |  | 확인의 무게 |
| `closable` | `boolean` | `true` |  | 닫기 버튼 |
| `children` | `ReactNode` |  |  | 내용 |

## Variants

size 3, tone default · danger(제목 앞 경고 아이콘).

## States

지원 상태: `default`

default.

## 동작

Base UI Dialog. 열리면 첫 입력 칸이나 첫 버튼으로 포커스, 닫히면 연 버튼으로 돌아간다. Escape · 바깥 누름으로 닫힌다(danger는 바깥 누름으로 닫지 않는다).

## 접근성

`role="dialog" aria-modal`, 제목 · 설명 연결, 포커스 가둠. 포커스는 창 안에 갇힌다: 마지막 칸에서 Tab → 첫 칸, 첫 칸에서 Shift+Tab → 마지막 칸을 keydown에서 바로 옮겨, Tab을 빨리 눌러도(자동 검사 · 키 반복) 창 밖으로 나가지 않는다. 창에는 aria-modal="true"(R-33).

## 밀도

안쪽 여백 `space.24`, 버튼 사이 `space.8`.

## 플랫폼 차이

네이티브는 Modal(components.md §9).

## 금지 사항

대화상자 안에서 대화상자 · "예 / 확인" 버튼 · 긴 폼.

## 예시

### 발행 확인

버튼은 결과를 말한다

```tsx
import { Button, Dialog, DialogClose } from '@terracelab/trellis-react';

function Confirm() {
  return (
    <Dialog
      trigger={
        <Button variant="primary" icon="send">
          발행
        </Button>
      }
      title="세금계산서 3건을 발행합니다"
      description="발행하면 국세청 전송 대기열에 올라갑니다. 전송 전까지는 발행 취소할 수 있습니다."
      footer={
        <>
          <DialogClose render={<Button>취소</Button>} />
          <DialogClose render={<Button variant="primary">3건 발행</Button>} />
        </>
      }
    />
  );
}
```

### 위험

바깥을 눌러도 닫히지 않는다

```tsx
import { Button, Dialog, DialogClose } from '@terracelab/trellis-react';

function Danger() {
  return (
    <Dialog
      tone="danger"
      size="sm"
      trigger={
        <Button variant="danger" icon="trash-2">
          삭제
        </Button>
      }
      title="발주서 PO-2611-0042를 삭제합니다"
      description="삭제하면 되돌릴 수 없습니다. 입고 예정 2건도 함께 지워집니다."
      footer={
        <>
          <DialogClose render={<Button>취소</Button>} />
          <DialogClose render={<Button variant="danger">삭제</Button>} />
        </>
      }
    />
  );
}
```
