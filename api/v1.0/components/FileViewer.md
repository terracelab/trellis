# FileViewer

> `@terracelab/trellis-react` · CSS `.tl-file-viewer` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { FileViewer } from '@terracelab/trellis-react';
```

## 용도

파일 하나를 내려받지 않고 화면 안에서 볼 때 쓴다. 그림(PNG · JPG · SVG)은 확대 · 축소 · 맞춤 · 회전, PDF는 브라우저 내장 PDF 보기로 쪽을 넘기고, 다른 형식은 파일 카드와 다운로드 단추를 보인다. 파일 목록 · 첨부 칩은 Attachment, 파일을 고르는 칸은 FileUpload, 인쇄할 서식은 Paper · PaperPreview다.

## 해부(Anatomy)

root(`tl-file-viewer`, `role="group"`, 테두리 `border.divider` · `radius.lg` · 바탕 `bg.surface`) · bar(도구 줄, 아래 선 `border.divider`, 안쪽 여백 `space.4` `space.8`) · name(파일 아이콘 16 `fg.tertiary` + 이름 `type.label` 600 `fg.primary` 말줄임 + 형식 · 크기 `type.caption` `fg.secondary` tabular) · tools(`role="toolbar"`, IconButton ghost sm, 묶음 사이 세로 선 `border.divider`) · value(배율 125% · 쪽 3 / 12, `type.caption` tabular `fg.secondary`) · stage(보기 영역, 바탕 `bg.sunken`, 넘치면 안에서 스크롤, 포커스 링 `border.focus` 안쪽) · image(그림, 그림자 `shadow.sm`) · pdf(`object`, 영역 전체) · card(EmptyState: 형식 아이콘 · 안내 · 다운로드 단추) · status(숨은 알림 줄, 배율 · 쪽 · 회전이 바뀌면 읽는다).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `name` | `string` |  | 필수 | 파일 이름(확장자 포함) |
| `src` | `string` |  |  | 파일 주소(없으면 파일 카드) |
| `size` | `number` |  |  | 바이트 |
| `mimeType` | `string` |  |  | MIME(없으면 확장자로) |
| `kind` | `'image' \| 'pdf' \| 'other'` |  |  | 보는 방법(없으면 MIME · 확장자로) |
| `alt` | `string` |  |  | 그림 대체 글자(없으면 파일 이름) |
| `pageCount` | `number` |  |  | PDF 전체 쪽 수 |
| `page` | `number` |  |  | 지금 쪽(제어, 1부터) |
| `defaultPage` | `number` | `1` |  | 처음 쪽 |
| `onPageChange` | `(page: number) => void` |  |  | 쪽이 바뀔 때 |
| `height` | `'sm' \| 'md' \| 'lg' \| 'fill'` | `"md"` |  | 보기 높이(sm 240 · md 400 · lg 560 · fill) |
| `loading` | `boolean` | `false` |  | 주소를 받는 중(Skeleton) |
| `error` | `string` |  |  | 불러오지 못한 이유(오류 블록) |
| `onRetry` | `() => void` |  |  | 오류 블록의 다시 시도 |
| `onDownload` | `() => void` |  |  | 다운로드(없으면 src를 받는다) |
| `downloadable` | `boolean` | `true` |  | 다운로드 단추 |

## Variants

kind 3 × height 4.

| kind | 보기 영역 | 도구 줄 |
|---|---|---|
| image | 그림. 처음에는 영역에 맞춤(작은 그림은 100%) | 축소 · 배율 · 확대 · 화면에 맞춤 · 회전 · 다운로드 |
| pdf | 브라우저 내장 PDF 보기(`object`). 쪽 · 배율은 주소 조각(`#page=3&zoom=125`)으로 넘긴다 | 이전 쪽 · 쪽 · 다음 쪽 · 축소 · 배율 · 확대 · 화면에 맞춤 · 새 창에서 열기 · 다운로드 |
| other | 파일 카드(형식 아이콘 · "미리 볼 수 없는 형식입니다" · 다운로드) | 다운로드 |

height sm 240 · md 400 · lg 560(`space.64` 배수) · fill(부모 남은 높이, Dialog · 목록 옆 칸). 좁은 칸(컨테이너 폭 400 미만)에서는 이름이 한 줄을 차지하고 도구가 그 아래 줄로 내려간다.

kind가 없으면 `fileViewerKind(name, mimeType)`가 정한다. MIME `image/*` · `application/pdf`가 먼저이고, 없으면 확장자다.

## States

지원 상태: `default` · `focus` · `loading` · `error`

default · focus(보기 영역에 포커스 링 `border.focus` 2px 안쪽, 도구 단추는 IconButton 포커스 링) · loading(`loading` 또는 그림을 받는 동안 보기 영역에 Skeleton rect. Skeleton이 `duration.normal` 뒤에 나타나 빠른 응답에 깜빡이지 않는다. root `aria-busy`) · error(`error` 또는 그림이 깨지면 보기 영역에 EmptyState kind="error": 이유 · 다시 시도. 도구 줄의 다운로드는 남는다). hover · active · disabled는 도구 단추(IconButton)의 상태이고 root에는 해당 없음.

## 동작

그림: 처음에는 영역에 맞춤이다(영역보다 작은 그림은 100%). 확대 · 축소는 25 · 50 · 75 · 100 · 125 · 150 · 200 · 300 · 400% 단계를 오간다(`nextZoom`). 맞춤 배율에서 확대하면 그보다 큰 첫 단계로 간다. 회전은 오른쪽으로 90도씩이고 맞춤은 회전한 모양에 맞춘다. 영역보다 크면 끌어서 옮기고, 두 번 누르면 맞춤 ↔ 100%다. 파일이 바뀌면 맞춤 · 회전 0으로 돌아간다.

PDF: 브라우저 내장 PDF 보기를 `object`로 넣고 쪽 · 배율을 주소 조각으로 넘긴다(PDF 라이브러리를 넣지 않는다, 외부 요청 없음). 쪽을 넘기면 보기를 그 쪽에서 다시 연다. `pageCount`가 있으면 "3 / 12"와 마지막 쪽에서 꺼지는 다음 쪽 단추, 없으면 "3쪽"이다. 사용자가 내장 보기 안에서 스크롤한 쪽은 도구 줄이 알지 못한다. 내장 PDF 보기가 없는 브라우저(`navigator.pdfViewerEnabled === false`, 머리 없는 브라우저 포함)는 보기 대신 안내 카드("이 브라우저는 PDF를 바로 보여 주지 않습니다")와 다운로드를 보이고, 새 창에서 열기는 남는다. `object`가 문서를 그리지 못해도 같은 카드가 선다.

다운로드: `onDownload`가 있으면 그것, 없으면 `src`를 파일 이름으로 받는다(`a[download]`). `downloadable={false}`면 단추가 없다.

쪽은 `page` · `onPageChange`로 제어하거나 `defaultPage`로 둔다. 배율 · 회전은 안에서 관리한다.

| 키 | 동작 |
|---|---|
| Tab | 도구 줄(지금 단추 하나) → 보기 영역 |
| ← · → | 도구 줄 안에서 앞 · 뒤 단추(꺼진 단추는 건너뛴다) |
| Home · End | 첫 · 끝 단추 |
| Enter · Space | 단추 누르기 |
| + · = / − / 0 | 그림 영역에서 확대 · 축소 · 화면에 맞춤 |
| R | 그림 영역에서 오른쪽으로 회전 |
| 방향 키 | 확대한 그림 옮기기(영역 스크롤) |
| PageUp · PageDown | 도구 줄에서 이전 · 다음 쪽(PDF) |

## 접근성

root는 `role="group"`이고 이름은 "{파일 이름} 미리 보기"다. 도구 줄은 `role="toolbar"`(이름 "보기 도구", `aria-controls` = 보기 영역)이고 탭 정지는 하나다(roving tabindex). 단추 이름은 IconButton `label`이 툴팁과 같다. 화면에 맞춤은 `aria-pressed`. 그림 영역은 `role="group"` · 이름 "그림 보기 영역"이고 키 안내를 `aria-describedby`로 읽는다. 넘치면 스크롤 영역이라 탭으로 닿는다. 그림 `alt`는 `alt` 또는 파일 이름. PDF `object`는 `title` · `aria-label`이 파일 이름이다. 배율 · 쪽 · 회전이 바뀌면 숨은 `role="status"`가 읽는다("배율 125%" · "12쪽 중 3쪽"). 불러오는 중은 root `aria-busy`, 오류는 EmptyState `role="alert"`. 글자 대비는 `fg.primary` · `fg.secondary`로 4.5:1 이상, 포커스 링은 늘 보인다. 움직임은 없다(배율 변화는 즉시).

## 밀도

도구 단추는 IconButton sm(밀도의 `control-height-sm`). 보기 높이는 밀도와 관계없다. 휴대폰(touch)에서는 단추가 손가락 크기다.

## 플랫폼 차이

웹은 그림 `img`와 브라우저 내장 PDF 보기(`object`). 네이티브는 그림이 Image + 핀치 확대이고, PDF는 OS 미리 보기(공유 시트 · 빠른 보기)로 연다. props는 같다.

## 금지 사항

PDF를 그리려고 PDF 라이브러리 · 외부 보기 서비스(외부 요청)를 넣기 → 리뷰. 보기 영역 바탕을 상태색으로 칠하기 · 오류에 붉은 바탕(D-56) → 리뷰. 미리 보기를 위해 파일을 서버 밖 주소로 보내기 → 리뷰. 도구 단추에 글자 없는 아이콘만 두고 `label`을 빼기 → IconButton이 막는다.

## 예시

### 그림

확대 · 축소 · 맞춤 · 회전. 그림 영역에서 + · − · 0 · R 키로도 된다

```tsx
import { FileViewer } from '@terracelab/trellis-react';

const SCAN = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  [
    '<svg xmlns="http://www.w3.org/2000/svg" width="560" height="760" viewBox="0 0 560 760">',
    '<g fill-opacity="0.82"><rect x="48" y="56" width="220" height="22" rx="3"/></g>',
    '<g fill-opacity="0.35"><rect x="48" y="92" width="150" height="10" rx="2"/>',
    '<rect x="360" y="56" width="152" height="10" rx="2"/><rect x="392" y="74" width="120" height="10" rx="2"/></g>',
    '<g fill="none" stroke-opacity="0.5" stroke="currentColor"><rect x="48" y="136" width="464" height="420"/>',
    '<path d="M48 176H512M48 216H512M48 256H512M48 296H512M48 336H512M48 376H512M48 416H512M48 456H512M48 496H512M300 136V556M392 136V556"/></g>',
    '<g fill-opacity="0.25">',
    [0, 1, 2, 3, 4, 5, 6, 7]
      .map(
        (i) =>
          `<rect x="60" y="${190 + i * 40}" width="${150 + ((i * 37) % 80)}" height="10" rx="2"/>` +
          `<rect x="316" y="${190 + i * 40}" width="60" height="10" rx="2"/>` +
          `<rect x="${440 - ((i * 13) % 30)}" y="${190 + i * 40}" width="${60 + ((i * 13) % 30)}" height="10" rx="2"/>`,
      )
      .join(''),
    '</g><g fill-opacity="0.82"><rect x="300" y="580" width="212" height="18" rx="3"/></g>',
    '<circle cx="452" cy="664" r="34" fill="none" stroke="currentColor" stroke-opacity="0.6" stroke-width="4"/>',
    '</svg>',
  ].join(''),
)}`;

function Image() {
  return <FileViewer name="거래명세서 스캔 2026-11-05.png" size={184320} src={SCAN} />;
}
```

### PDF

브라우저 내장 PDF 보기에 쪽 · 배율을 넘긴다. 내장 보기가 없는 브라우저는 파일 카드

```tsx
import { useEffect, useState } from 'react';
import { FileViewer } from '@terracelab/trellis-react';

const samplePdf = (pages: number) => {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${Array.from({ length: pages }, (_, i) => `${4 + i * 2} 0 R`).join(' ')}] /Count ${pages} >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  for (let i = 0; i < pages; i += 1) {
    const draw = `BT /F1 18 Tf 56 776 Td (2026-10 Closing report  ${i + 1} / ${pages}) Tj ET 0.8 g 56 720 483 10 re f 56 700 420 10 re f 56 680 450 10 re f 56 640 483 160 re S`;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${5 + i * 2} 0 R >>`,
      `<< /Length ${draw.length} >>\nstream\n${draw}\nendstream`,
    );
  }
  let out = '%PDF-1.4\n';
  const offsets = objects.map((o, i) => {
    const at = out.length;
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
    return at;
  });
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  out += offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
  return `${out}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
};

function Pdf() {
  const [src, setSrc] = useState<string>();
  useEffect(() => {
    const url = URL.createObjectURL(new Blob([samplePdf(3)], { type: 'application/pdf' }));
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, []);
  return (
    <FileViewer
      name="2026년 10월 결산 보고서.pdf"
      size={2516600}
      src={src}
      loading={!src}
      pageCount={3}
    />
  );
}
```

### 다른 형식

미리 볼 수 없는 형식은 파일 카드와 다운로드 단추

```tsx
import { FileViewer } from '@terracelab/trellis-react';

function Other() {
  return (
    <FileViewer name="11월 1주차 자금 일보.xlsx" size={186400} height="sm" onDownload={() => {}} />
  );
}
```

### 불러오는 중 · 오류

주소를 받는 동안 Skeleton, 실패하면 이유 · 다시 시도 · 다운로드

```tsx
import { FileViewer } from '@terracelab/trellis-react';

function LoadingError() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-16)' }}>
      <FileViewer name="평택 냉동센터 검수 사진 01.jpg" size={2411724} height="sm" loading />
      <FileViewer
        name="평택 냉동센터 검수 사진 02.jpg"
        size={2290116}
        height="sm"
        error="사진을 불러오지 못했습니다"
        onRetry={() => {}}
        onDownload={() => {}}
      />
    </div>
  );
}
```

### 크게 보기

목록 옆 작은 보기에서 Dialog lg로 크게 연다

```tsx
import { useState } from 'react';
import { Button, Dialog, FileViewer } from '@terracelab/trellis-react';

const SCAN = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  [
    '<svg xmlns="http://www.w3.org/2000/svg" width="560" height="760" viewBox="0 0 560 760">',
    '<g fill-opacity="0.82"><rect x="48" y="56" width="220" height="22" rx="3"/></g>',
    '<g fill-opacity="0.35"><rect x="48" y="92" width="150" height="10" rx="2"/>',
    '<rect x="360" y="56" width="152" height="10" rx="2"/><rect x="392" y="74" width="120" height="10" rx="2"/></g>',
    '<g fill="none" stroke-opacity="0.5" stroke="currentColor"><rect x="48" y="136" width="464" height="420"/>',
    '<path d="M48 176H512M48 216H512M48 256H512M48 296H512M48 336H512M48 376H512M48 416H512M48 456H512M48 496H512M300 136V556M392 136V556"/></g>',
    '<g fill-opacity="0.25">',
    [0, 1, 2, 3, 4, 5, 6, 7]
      .map(
        (i) =>
          `<rect x="60" y="${190 + i * 40}" width="${150 + ((i * 37) % 80)}" height="10" rx="2"/>` +
          `<rect x="316" y="${190 + i * 40}" width="60" height="10" rx="2"/>` +
          `<rect x="${440 - ((i * 13) % 30)}" y="${190 + i * 40}" width="${60 + ((i * 13) % 30)}" height="10" rx="2"/>`,
      )
      .join(''),
    '</g><g fill-opacity="0.82"><rect x="300" y="580" width="212" height="18" rx="3"/></g>',
    '<circle cx="452" cy="664" r="34" fill="none" stroke="currentColor" stroke-opacity="0.6" stroke-width="4"/>',
    '</svg>',
  ].join(''),
)}`;

function Expand() {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-8)',
        maxWidth: 'calc(var(--tl-space-64) * 5)',
      }}
    >
      <FileViewer name="거래명세서 스캔 2026-11-05.png" size={184320} src={SCAN} height="sm" />
      <Button icon="maximize-2" onPress={() => setOpen(true)}>
        크게 보기
      </Button>
      <Dialog open={open} onOpenChange={setOpen} size="lg" title="거래명세서 스캔 2026-11-05.png">
        <FileViewer name="거래명세서 스캔 2026-11-05.png" size={184320} src={SCAN} height="lg" />
      </Dialog>
    </div>
  );
}
```
