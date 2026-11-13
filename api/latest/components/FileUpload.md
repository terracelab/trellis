# FileUpload

> `@terracelab/trellis-react` · CSS `.tl-file-upload` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { FileUpload } from '@terracelab/trellis-react';
```

## 용도

파일을 끌어 놓거나 골라 올리고 진행을 보인다(증빙 · 계약서 · 거래명세서). 이미 올린 파일을 보여만 줄 때는 Attachment.

## 해부(Anatomy)

root · zone(점선 `border.default`, `bg.canvas`, `radius.md`, upload 아이콘 + 안내 + hint `fg.tertiary`) · input(숨은 `<input type="file">`) · notice(거른 파일 안내, `type.caption`) · list · file(파일 아이콘 · 이름 · 크기와 상태 `fg.tertiary` · 진행 막대 `brand.default` / `bg.sunken` · 삭제 IconButton).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `accept` | `string` |  |  | 받을 형식 |
| `multiple` | `boolean` | `false` |  | 여러 파일 |
| `maxSize` | `number` |  |  | 파일 하나의 최대 바이트 |
| `files` | `UploadFile[]` | `[]` |  | 파일 목록(앱이 관리) |
| `onFilesChange` | `(files: File[]) => void` |  |  | 새로 고른 파일 |
| `onRemove` | `(name: string) => void` |  |  | 목록에서 삭제를 누를 때 |
| `disabled` | `boolean` | `false` |  | 비활성 |
| `hint` | `string` |  |  | 형식 · 크기 안내 |

## Variants

multiple 유무, 파일 상태 uploading(진행 막대 + %) · done(완료) · error(`status.danger.default` 아이콘 + 오류 문구).

## States

지원 상태: `default` · `hover` · `active` · `focus` · `disabled` · `error`

default · hover(zone `border.strong`) · active(끌어 놓는 중 zone `border.focus` + `brand.subtle`) · focus(zone 링) · disabled(zone `bg.sunken`, `fg.disabled`) · error(거른 파일 안내 · 파일 오류). loading은 파일 행의 uploading으로 보인다.

## 동작

zone을 누르거나 Enter · Space로 파일 선택 창을 연다. 끌어 놓은 파일도 accept · maxSize로 거르고, 통과한 파일만 onFilesChange로 넘긴다. 거른 파일은 이름과 이유를 zone 아래에 보인다. 목록은 files prop 그대로 그리고, 삭제를 누르면 onRemove(name). 업로드 자체는 앱이 한다.

## 접근성

숨은 input이 Tab을 받고 zone에 포커스 링이 보인다. 이름은 Field 라벨 + 안내 문구, hint는 `aria-describedby`. 진행 막대는 `role="progressbar"` + `aria-valuenow`. 거른 파일 안내는 `role="alert"`. 삭제 버튼 이름은 "<파일 이름> 삭제".

## 밀도

zone 안쪽 여백 `space.16`(comfortable `space.24`), 파일 행 `density.row-height` 이상.

## 플랫폼 차이

네이티브는 DocumentPicker를 여는 버튼(끌어 놓기 없음), 목록은 같다.

## 금지 사항

업로드 중 파일에 진행 표시 없음 · 오류를 색만으로 · 형식 · 크기 안내 없이 거르기 → 리뷰.

## 예시

### 증빙 첨부

올리는 중 · 완료 · 오류를 한 목록에

```tsx
import { Field, FileUpload } from '@terracelab/trellis-react';

function Basic() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 7)' }}>
      <Field label="증빙 첨부" help="세금계산서 · 거래명세서를 함께 올립니다">
        <FileUpload
          accept=".pdf,.xlsx,.jpg,.png"
          multiple
          maxSize={10485760}
          hint="PDF · XLSX · JPG, 10MB 이하"
          files={[
            { name: '한빛무역_세금계산서_2611.pdf', size: 248320, status: 'done' },
            { name: '대양상사_거래명세서.xlsx', size: 1572864, status: 'uploading', progress: 64 },
            {
              name: '누리식품_납품사진.heic',
              size: 3355443,
              status: 'error',
              error: 'HEIC는 받지 않습니다. JPG로 바꿔 올리세요',
            },
          ]}
          onRemove={() => undefined}
        />
      </Field>
    </div>
  );
}
```

### 비활성

마감된 전표는 첨부를 바꿀 수 없다

```tsx
import { FileUpload } from '@terracelab/trellis-react';

function Disabled() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 7)' }}>
      <FileUpload
        disabled
        hint="PDF, 5MB 이하"
        files={[{ name: '10월_결산_보고서.pdf', size: 524288, status: 'done' }]}
      />
    </div>
  );
}
```
