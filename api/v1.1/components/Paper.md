# Paper

> `@terracelab/trellis-react` · CSS `.tl-paper` · 안정 · 웹

```ts
import { Paper } from '@terracelab/trellis-react';
```

## 용도

A4 · A5 종이 서식(재직 · 경력 · 퇴직증명서 · 급여명세서 · 근로계약서 · 원천징수영수증 · 세금계산서 · 견적서 · 발주서)을 화면에서 미리 보고 브라우저 인쇄(PDF로 저장)로 내보낼 때 쓴다. 종이는 앱 테마와 관계없이 흰 바탕 · 검은 글자다. 화면 안의 정보 묶음은 Card · DescriptionList, 화면 표는 DataGrid를 쓴다(종이 서식이 아닌 곳에 Paper를 쓰지 않는다).

## 해부(Anatomy)

Paper 한 장 = header(위 줄, `paper.muted` `paper.type.caption`, 양 끝 정렬) · body(조각을 세로로 쌓는다, 사이 `space.16`) · footer(아래 줄, 쪽 맨 아래, 위 `paper.line` 1px). 종이는 `paper.bg` · `paper.fg` · `paper.shadow`(화면만), 크기 `paper.size.*`, 안쪽 여백 `paper.margin.*`, 글자 `paper.type.body`. 글자는 모두 `paper.type.*`(pt)이고 앱의 `type.*`를 쓰지 않는다. 같은 entry의 조각과 도구:

| 조각 | props | 모양 · 토큰 |
| --- | --- | --- |
| `PaperTitle` | `children` 제목 · `subtitle?` 아래 한 줄 | h1, 가운데, `paper.type.display` 700, 자간 `space.8`. subtitle `paper.muted` |
| `PaperFields` | `rows: { label, value, full?, blank? }[]` · `columns?: 4 \| 2`(기본 4) · `title?` · `note?` | 이름 \| 값 \| 이름 \| 값 표(4열은 두 칸씩 짝, `full`은 한 줄 전체). 이름 칸 `paper.fill` 600, 값이 비면 –. `blank`인 줄은 비어도 빈 칸(인쇄한 뒤 손으로 적는 수령일 · 서명) |
| `PaperMoneyTable` | `columns: { header, width?, align? }[]` · `rows: 칸[][]` · `total?: 칸[]` · `carryIn?: 칸[]` · `carryOut?: 칸[]` · `title?` · `note?` | 열 폭은 colgroup(`xs` · `sm` · `md` · `lg` · `xl` · `auto`, DataGrid와 같은 이름). number 칸은 `formatAmount` · 오른쪽 · tabular. 합계 줄은 700, 위 `paper.lineStrong` 2px, 첫 칸은 행 머리. carryIn은 본문 첫 줄(600, 아래 `paper.lineStrong` 2px), carryOut은 합계 줄 자리 |
| `PaperText` | `variant?: 'body' \| 'statement' \| 'note'` · `children` | statement = 가운데 확인 문장(`paper.type.h3`), note = 주석(`paper.muted` `paper.type.caption`) |
| `PaperSignature` | `company` · `representative` · `role?`(기본 사전 "대표이사") · `date?` · `seal?` | 날짜(`paper.type.h3`) 아래 회사 · 직함 · 이름(`paper.type.h2` 700) · 직인. 쪽 아래쪽으로 붙는다 |
| `PaperSignPair` | `left` · `right`: `{ title, rows }` · `date?` | 두 열(사업주 · 근로자), 열마다 제목 + 2열 칸 표. 날짜는 위 가운데. 쪽 아래쪽으로 붙는다 |
| `PaperSeal` | `name` · `src?` | 이미지가 있으면 `space.40` × 2 정사각 자리에 "(인)" 위로 겹쳐 찍는다. 없으면 "(인)"이 이름 뒤 글자로 붙는다 |
| `PaperPreview` | `children`(Paper 여러 장) · `label?` | 화면 미리보기. 바탕 `bg.sunken` · `radius.md` · 안쪽 `space.16`(휴대폰 `space.8`), 쪽 사이 `space.16`. 넘친 쪽 안내는 종이 위에 줄이지 않은 앱 글자(`type.caption` `fg.primary`, 아이콘 `circle-alert` `status.danger.default`) |
| `printPapers(content, { fileName?, locale?, onOpen?, onClose? })` · `usePrintPapers()` | content = Paper 요소 또는 화면의 DOM 요소 | 인쇄 도우미(동작 절) |
| `paginateMoneyRows(rows, { first, rest?, sum })` | contracts의 순수 함수 | 긴 금액 표를 쪽마다 나누고 이월 줄을 만든다(동작 절) |

표(PaperFields · PaperMoneyTable)는 바깥 테두리 `paper.lineStrong` 2px, 안쪽 칸 선 `paper.line` 1px, 칸 안쪽 `space.4` × 1.5 · `space.12`(행 33px), 머리 칸 바탕 `paper.fill`. 한글은 어절 단위로 줄을 바꾼다(`word-break: keep-all`). 묶음 제목은 h2 `paper.type.h3` 600, note는 표 위 `paper.muted` `paper.type.caption`.

넘침 표시(PaperPreview 안에서만): 1장이 끝나는 자리(종이 위에서 `paper.size.*` 높이)에 `status.danger.default` 1px 점선을 긋고, 선 위 오른쪽 여백에 "1장 끝"(`paper.type.caption` 600, 바탕 `paper.bg`)을 둔다. 종이 내용이 아니라 화면 표시라 status 색을 쓰고 인쇄에는 그리지 않는다.

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `size` | `'a4' \| 'a5'` | `"a4"` |  | 종이 크기(paper.size.*) |
| `orientation` | `'portrait' \| 'landscape'` | `"portrait"` |  | 세로 · 가로 |
| `margin` | `'sm' \| 'md'` | `"md"` |  | 안쪽 여백(paper.margin.*) |
| `density` | `'regular' \| 'compact'` | `"regular"` |  | compact = 표 행 · 칸 안쪽 · 서명 자리를 줄인다(칸 많은 서식) |
| `label` | `string` |  | 필수 | 쪽의 접근성 이름 |
| `header` | `ReactNode` |  |  | 위 줄(발급 번호 · 발급처) |
| `footer` | `ReactNode` |  |  | 아래 줄(진위 확인 · 근거), 쪽 맨 아래 |
| `children` | `ReactNode` |  |  | 한 쪽의 내용 |
| `onOverflowChange` | `(overflow: boolean) => void` |  |  | 내용이 종이 한 장 높이를 넘거나 다시 들어올 때(넘친 종이는 data-overflow) |

## Variants

size a4 · a5 × orientation portrait · landscape × margin md · sm × density regular · compact. 색은 모든 조합에서 같다(`paper.*`).

| prop | 값 | 바뀌는 것 |
| --- | --- | --- |
| size | a4 · a5 | 폭 · 최소 높이 `paper.size.a4.*` · `paper.size.a5.*` |
| orientation | portrait · landscape | 가로는 폭 · 높이를 바꿔 쓴다 |
| margin | md · sm | 안쪽 여백 `paper.margin.md`(18mm) · `paper.margin.sm`(12mm) |
| density | regular · compact | 아래 밀도 절 |

## States

지원 상태: `default`

default만. 종이는 문서라 hover · active · focus · disabled · loading · error는 해당 없음(누르거나 고르는 부분이 없다). 넘침은 상태가 아니라 `data-overflow` 속성과 `onOverflowChange`로 알린다.

## 동작

- 한 쪽 = Paper 하나. 최소 높이가 한 장이고, 내용이 더 길면 종이가 늘어나며 인쇄에서는 다음 장으로 넘어간다. 서식은 쪽마다 나눠 둔다(1쪽 · 2쪽 Paper).
- 넘침 감지: Paper는 자기 높이와 한 장 높이(최소 높이)를 비교한다. 1px보다 더 길면 넘침이다(반올림 오차는 넘침으로 치지 않는다). 처음 그린 뒤 한 번 재고, ResizeObserver로 내용 · 글꼴 · 이미지 때문에 높이가 바뀔 때 다시 잰다.
  - 넘친 종이는 `data-overflow` 속성을 단다. `onOverflowChange(overflow)`는 값이 바뀔 때 부른다. 처음 잰 값이 넘침이면 그때 한 번 부르고, 처음부터 한 장에 들어가면 부르지 않는다.
  - 잴 수 없는 환경(jsdom · 서버 렌더 · 화면에서 숨긴 인쇄 뿌리)에서는 값을 바꾸지 않는다. 화면과 인쇄의 글꼴 렌더링이 조금 달라 경계에 걸친 내용은 판정이 다를 수 있다.
  - PaperPreview 안에서는 넘친 종이에 1장 끝 선을 긋고, 미리보기 위에 쪽마다 한 줄씩 사전 `paper.overflow` 문구를 띄운다("근로계약서 2쪽의 내용이 종이 한 장을 넘습니다. 인쇄하면 다음 장으로 이어집니다."). 안내는 줄이지 않은 앱 글자라 휴대폰에서도 읽힌다.
- 긴 금액 표 나누기 `paginateMoneyRows(rows, { first, rest?, sum })`(contracts):
  - 첫 쪽에 first줄, 둘째 쪽부터 rest줄(기본 first)씩 나눈다. 돌려주는 쪽마다 `{ page, pages, rows, carryIn?, carryOut? }`.
  - carryIn은 앞 쪽까지의 누계(둘째 쪽부터), carryOut은 그 쪽까지의 누계(마지막 쪽 앞까지)다. sum에 적은 열만 더하고 0번 열(이름 칸) · 숫자가 아닌 칸은 더하지 않는다. 소수는 들어온 자릿수에서 자른다.
  - 쪽마다 Paper 하나에 같은 columns로 PaperMoneyTable을 그리고 carryIn · carryOut을 그대로 넘긴다. 머리 줄은 쪽마다 다시 나오고, 마지막 쪽에는 앱의 total을 둔다. carryIn · carryOut의 첫 칸이 null이면 사전 `paper.carryIn`("앞 쪽 이월") · `paper.carryOut`("다음 쪽 이월")이다.
  - 쪽마다 들어갈 줄 수는 앱이 정한다. 줄 높이를 재서 자동으로 나누지 않는다. 결정적 계산이라 인쇄 · 서버 렌더 · 테스트에서 결과가 같고, 칸 글자가 길어 줄이 두 줄로 늘면 넘침 감지가 알려 준다.
- PaperSignature · PaperSignPair는 body 아래쪽으로 붙는다(위 남는 자리를 차지). footer는 쪽 맨 아래.
- date가 'YYYY-MM-DD'면 사전 `paper.date`로 "2026년 11월 9일"이 된다. 다른 글자는 그대로 보인다.
- PaperPreview: 종이 묶음을 부모 폭에 맞춰 비율대로 줄인다(최대 1배). ResizeObserver로 부모 폭 · 내용 크기가 바뀔 때 다시 재고, 줄인 크기만큼 자리를 차지해 가로 넘침이 없다. 잴 수 없는 환경(jsdom · 첫 그리기 전)에서는 원래 크기로 두고 바깥이 자른다.
- 인쇄 `printPapers(content, { fileName, onOpen, onClose })`(이벤트 처리기에서 부른다). iframe을 쓰지 않고 지금 창에서 `window.print()`를 부른다:
  1. body 끝에 `.tl-print-root`(data-theme light)를 붙인다. content가 React 요소면 그 안에 그리고(locale은 옵션 · `usePrintPapers`는 지금 Provider 값), DOM 요소면 안의 `.tl-paper`만 복사한다(넘침 선은 빼고).
  2. 첫 종이의 크기 · 방향으로 `@page { size: A4 portrait; margin: 0 }`을 넣는다. 종이마다 이름 붙은 @page(`tl-paper-a4` · `tl-paper-a5-landscape` …)도 걸려 크기가 섞인 묶음도 쪽마다 맞다.
  3. 글꼴(`document.fonts.ready`)과 이미지(직인)가 다 그려지기를 기다린다(최대 10초).
  4. `document.title`을 fileName으로 바꾼다(끝의 .pdf는 뗀다). 브라우저가 PDF 파일 이름으로 쓴다.
  5. `window.print()`. 인쇄 CSS가 `.tl-print-root` 밖을 숨기고 쪽 여백 0 · 종이마다 쪽 나눔(`break-after: page`) · 그림자 없음 · `print-color-adjust: exact`. 인쇄 창이 열리면(`beforeprint`) `onOpen`을 한 번 부른다. beforeprint를 보내지 않는 브라우저는 print()를 부른 직후에 부른다.
  6. `afterprint`에서 제목을 되돌리고 뿌리를 뗀 뒤 `onClose`를 한 번 부른다. afterprint가 오지 않는 브라우저는 60초 뒤 정리한다. onClose는 onOpen을 부른 인쇄만 부르고, 인쇄했는지 취소했는지는 브라우저가 알려 주지 않는다. 돌려주는 Promise는 정리가 끝나면 풀린다.
  7. 끝나기 전에 다시 부르면 앞의 것을 먼저 정리한다. 글꼴 · 직인을 기다리는 중이었다면 앞의 것은 인쇄 창을 열지 않고(onOpen · onClose 없음) Promise가 바로 풀린다. 종이를 그리다 오류가 나면 뿌리를 떼고 그 오류로 거부된다.
- `.tl-print-root`가 없을 때 앱 화면을 그냥 인쇄하면 아무것도 바뀌지 않는다(숨김 규칙은 `:has(.tl-print-root)`에만 걸린다).

## 접근성

- Paper는 `<article aria-label={label}>`(쪽 이름: "근로계약서 2쪽"). header · footer는 `<header>` · `<footer>`(article 안이라 랜드마크가 아니다).
- PaperTitle은 h1, 묶음 제목은 h2. 표는 `<table>`이고 제목이 있으면 `aria-labelledby`, note가 있으면 `aria-describedby`로 잇는다. PaperFields는 한 줄에 이름 칸이 둘이라 값 칸마다 `headers`로 자기 이름 칸을 가리킨다. PaperMoneyTable 머리는 `th scope="col"`, 합계 · 이월 줄 첫 칸은 `th scope="row"`.
- 직인 이미지 대체 글자는 사전 `paper.sealAlt`("<회사> 직인"). 이미지가 있으면 밑의 "(인)"은 `aria-hidden`.
- PaperPreview는 `role="group"` + `label`(기본 "서식 미리보기") + `tabIndex=0`. 대화상자 · 서랍 안에서 미리보기가 길면 미리보기에 포커스한 채 방향키로 감싼 영역을 스크롤한다(포커스 링 `tl-focusable`). 줄여 보이는 종이는 화면 확대로 읽고, 원래 크기는 인쇄 · PDF가 맡는다.
- 넘침 안내는 늘 있는 `role="status"` 영역이라 넘침이 생기거나 풀리면 읽어 준다. 안내가 있으면 미리보기 묶음의 `aria-describedby`가 된다. 종이 위 1장 끝 선과 글자는 같은 내용이라 `aria-hidden`이다.
- 대비: `paper.fg` / `paper.bg` 21:1, `paper.muted` / `paper.bg` 6.33:1, `paper.muted` / `paper.fill` 5.11:1, 칸 선 `paper.line` 3.21:1(그래픽 3:1). 앱이 다크여도 종이 안 글자 대비는 같다. 종이 안에 넣은 Trellis 컴포넌트는 Paper의 `data-theme="light"`로 라이트 토큰을 쓴다. 넘침 표시: 1장 끝 글자 · 선 `status.danger.default` / `paper.bg` 5.35:1, 안내 글자 `fg.primary` / `bg.sunken` 11.90:1(다크 16.77:1), 아이콘 `status.danger.default` / `bg.sunken` 4.31:1(다크 6.53:1, 그래픽 3:1).
- Paper 자체는 누르는 부분이 없고 움직임도 없다(reduced-motion 해당 없음).

## 밀도

앱 밀도(compact · comfortable · touch)와 앱 글자 크기 모드는 종이에 닿지 않는다. 글자는 `paper.type.*`(pt), 간격은 `space.*` 고정이다. 앱이 글자를 키우려고 `type.*`를 덮어써도 종이 글자와 인쇄 쪽수는 그대로다(R-35). 휴대폰에서도 종이는 같은 모양으로 줄어 보인다. 종이 자체의 `density`는 글자를 한 단계씩 줄인다:

| 치수 | regular | compact |
| --- | --- | --- |
| 본문 글자 | `paper.type.body`(10.5pt, 14/20px) | `paper.type.label`(9.75pt, 13/18px) |
| 표 칸 안쪽 | `space.4` × 1.5 · `space.12`(행 33px) | `space.4` · `space.8`(행 27px) |
| 조각 사이 | `space.16` | `space.12` |
| 제목 | `paper.type.display`, 자간 `space.8` | `paper.type.h1`, 자간 `space.4` |
| 묶음 제목 · 확인 문장 · 서명 날짜 | `paper.type.h3` | `paper.type.body` |
| 서명 줄 | `paper.type.h2` | `paper.type.h3` |
| 서명 위 여백 · 직인 이미지 | `space.24` · `space.40` × 2 | `space.8` · `space.64` |

`data-density="compact"`는 안에 넣은 Trellis 컴포넌트에도 compact 밀도 토큰을 건다.

## 플랫폼 차이

웹만(`platforms.native = false`). 네이티브 다음 Phase: 같은 조각 이름으로 종이 미리보기(줄여 보기)와 PDF 내보내기(인쇄 · 공유)를 붙이고 그때 native를 켠다. 토큰은 이미 네이티브 산출물에 있다(`paper`, mm × 96 / 25.4 · pt × 96 / 72를 숫자로). `paginateMoneyRows`는 contracts의 순수 함수라 네이티브도 그대로 쓴다.

## 금지 사항

- 종이 안에서 테마 색(`--tl-color-*`) · 밀도 토큰 · 앱 글자 토큰(`--tl-type-*`)으로 칠하거나 쓰기 → 리뷰(종이는 `--tl-paper-*`만. 넘침 표시만 화면 표시라 status 색)
- 앱 글자 크기 모드에서 `--tl-paper-type-*`까지 덮어쓰기 → 리뷰(인쇄물 쪽수가 바뀐다. 종이 글자는 승인된 토큰 값으로만 바꾼다)
- mm · pt · px 값을 앱 코드에 직접 쓰기 → `trellis/no-px` · stylelint(크기 · 여백 · 글자는 `paper.size.*` · `paper.margin.*` · `paper.type.*`)
- 종이를 감싸 `data-theme="light"`로 라이트 색을 빌리기 → 리뷰(Paper가 이미 테마와 무관하다)
- 왼쪽 굵은 색 띠 · 색 배지 · 칠한 배너로 강조하기 → 리뷰(D-57, 종이는 문서 모양)
- 화면 정보 묶음 · 화면 표를 Paper로 만들기 → 리뷰(Card · DescriptionList · DataGrid)
- 인쇄용 화면을 따로 만들기 · 앱 전체 `@page`를 고치기 → 리뷰(printPapers가 인쇄 뿌리만 찍는다)
- 금액을 글자로 미리 서식해 넣기 → 리뷰(number를 넘기면 표가 `formatAmount` · 오른쪽 정렬)
- 한 장을 넘는 표를 Paper 하나에 두고 브라우저 쪽 나눔에 맡기기 → 리뷰(머리 줄 · 이월이 없다. `paginateMoneyRows`로 쪽마다 Paper)
- 이월 금액을 앱에서 따로 더해 글자로 넣기 → 리뷰(`paginateMoneyRows`의 carryIn · carryOut을 그대로 넘긴다)

## 예시

### 재직증명서

인적 사항 · 회사 · 재직 사항 칸 표, 확인 문장, 날짜 · 회사 · 직인. 위 줄은 발급 번호, 아래 줄은 진위 확인 번호입니다.

```tsx
import { formatBizNo } from '@terracelab/trellis-contracts';
import { Paper, PaperFields, PaperSignature, PaperText, PaperTitle, PaperPreview } from '@terracelab/trellis-react';

const SEAL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiNDODMxMkIiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIG9wYWNpdHk9IjAuODgiPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ1IiBzdHJva2Utd2lkdGg9IjUiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIzOC41IiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0zMSAzMWgxNXYxNUgzMXpNNTQgMzFoMTV2MTVINTR6TTMxIDU0aDE1djE1SDMxek01NCA1NGgxNXYxNUg1NHoiIHN0cm9rZS13aWR0aD0iMyIvPjxwYXRoIGQ9Ik0zOC41IDMxdjE1TTMxIDM4LjVoMTVNNTQgMzguNWgxNU02MS41IDMxdjE1TTMxIDYxLjVoMTVNMzguNSA1NHYxNU01NCA2MS41aDE1TTYxLjUgNTR2MTUiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=';

const COMPANY = {
  name: '주식회사 테라트레이딩',
  bizNo: formatBizNo('2148736125'),
  ceo: '박은서',
  address: '서울특별시 성동구 성수이로 118, 7층',
};

function EmploymentCertificate() {
  return (
    <PaperPreview label="재직증명서 미리보기">
      <Paper
        label="재직증명서"
        header={
          <>
            <span>발급 번호 HR-2026-0412</span>
            <span>{COMPANY.name}</span>
          </>
        }
        footer={
          <>
            <span>진위 확인 번호 7F3K-92QD</span>
            <span>인사팀 02-6953-1180에서 확인할 수 있습니다</span>
          </>
        }
      >
        <PaperTitle>재직증명서</PaperTitle>
        <PaperFields
          title="인적 사항"
          rows={[
            { label: '성명', value: '이도윤' },
            { label: '생년월일', value: '1992년 4월 18일' },
            { label: '주소', value: '서울특별시 마포구 월드컵북로 21, 2층', full: true },
          ]}
        />
        <PaperFields
          title="회사"
          rows={[
            { label: '회사명', value: COMPANY.name },
            { label: '사업자등록번호', value: COMPANY.bizNo },
            { label: '대표자', value: COMPANY.ceo },
            { label: '소재지', value: COMPANY.address },
          ]}
        />
        <PaperFields
          title="재직 사항"
          rows={[
            { label: '소속', value: '영업팀' },
            { label: '직위', value: '대리' },
            { label: '재직 기간', value: '2022년 3월 2일~현재', full: true },
            { label: '용도', value: '금융기관 제출' },
            { label: '제출처', value: '' },
          ]}
        />
        <PaperText variant="statement">위 사람은 현재 당사에 재직하고 있음을 증명합니다.</PaperText>
        <PaperSignature
          date="2026-11-09"
          company={COMPANY.name}
          representative={COMPANY.ceo}
          seal={SEAL}
        />
        <PaperText variant="note">
          근로기준법 제39조(사용증명서)에 따라 근로자가 요구한 사항만 사실대로 적었습니다.
        </PaperText>
      </Paper>
    </PaperPreview>
  );
}
```

### 급여명세서

지급 · 공제 표는 항목 · 금액 · 계산 방법이고, 합계 줄이 임금 총액 · 공제 총액입니다. 임금명세서는 서명 칸이 없습니다.

```tsx
import { formatAmount, formatBizNo } from '@terracelab/trellis-contracts';
import { Paper, PaperFields, PaperMoneyTable, PaperText, PaperTitle, PaperPreview } from '@terracelab/trellis-react';

const COMPANY = {
  name: '주식회사 테라트레이딩',
  bizNo: formatBizNo('2148736125'),
  ceo: '박은서',
  address: '서울특별시 성동구 성수이로 118, 7층',
};

const EARNINGS = [
  ['기본급', 3200000, '월 정액'],
  ['직책 수당', 200000, '대리 직책'],
  ['식대(비과세)', 200000, '월 20만 원 한도'],
];

const DEDUCTIONS = [
  ['국민연금', 153000, '기준소득월액 × 4.5%'],
  ['건강보험', 120530, '보수월액 × 3.545%'],
  ['장기요양보험', 15600, '건강보험료 × 12.95%'],
  ['고용보험', 30600, '보수월액 × 0.9%'],
  ['소득세', 84850, '간이세액표'],
  ['지방소득세', 8480, '소득세 × 10%'],
];

function Payslip() {
  return (
    <PaperPreview label="급여명세서 미리보기">
      <Paper
        label="2026년 10월분 급여명세서"
        header={
          <>
            <span>교부일 2026-10-24</span>
            <span>{COMPANY.name}</span>
          </>
        }
      >
        <PaperTitle subtitle="2026년 10월분">급여명세서</PaperTitle>
        <PaperFields
          title="인적 사항"
          rows={[
            { label: '성명', value: '이도윤' },
            { label: '사원번호', value: 'E-1027' },
            { label: '소속 · 직위', value: '영업팀 · 대리' },
            { label: '임금 지급일', value: '2026년 10월 24일' },
            { label: '근로일수', value: '22일' },
            { label: '근로시간 수', value: '연장 4 · 야간 0 · 휴일 0시간' },
            { label: '지급 계좌', value: '기업은행 482-019284-01-013', full: true },
          ]}
        />
        <PaperMoneyTable
          title="지급 내역"
          note="단위: 원"
          columns={[{ header: '항목' }, { header: '금액', width: 'md' }, { header: '계산 방법' }]}
          rows={EARNINGS}
          total={['임금 총액', 3600000, '지급 항목 합계']}
        />
        <PaperMoneyTable
          title="공제 내역"
          note="단위: 원. 보험료 · 세액은 10원 미만을 버립니다."
          columns={[{ header: '항목' }, { header: '금액', width: 'md' }, { header: '계산 방법' }]}
          rows={DEDUCTIONS}
          total={['공제 총액', 413060, '공제 항목 합계']}
        />
        <PaperFields
          columns={2}
          rows={[{ label: '실지급액', value: `${formatAmount(3186940)}원(임금 총액 − 공제 총액)` }]}
        />
        <PaperText variant="note">
          근로기준법 제48조 제2항과 같은 법 시행령 제27조의2에 따른 임금명세서입니다.
        </PaperText>
      </Paper>
    </PaperPreview>
  );
}
```

### 2쪽 문서

근로계약서. 쪽마다 Paper 하나이고, 인쇄하면 한 장씩 나뉩니다. 2쪽 아래는 사업주 · 근로자 서명입니다.

```tsx
import { formatBizNo } from '@terracelab/trellis-contracts';
import { Paper, PaperFields, PaperMoneyTable, PaperSeal, PaperSignPair, PaperText, PaperTitle, PaperPreview } from '@terracelab/trellis-react';

const SEAL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiNDODMxMkIiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIG9wYWNpdHk9IjAuODgiPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ1IiBzdHJva2Utd2lkdGg9IjUiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIzOC41IiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0zMSAzMWgxNXYxNUgzMXpNNTQgMzFoMTV2MTVINTR6TTMxIDU0aDE1djE1SDMxek01NCA1NGgxNXYxNUg1NHoiIHN0cm9rZS13aWR0aD0iMyIvPjxwYXRoIGQ9Ik0zOC41IDMxdjE1TTMxIDM4LjVoMTVNNTQgMzguNWgxNU02MS41IDMxdjE1TTMxIDYxLjVoMTVNMzguNSA1NHYxNU01NCA2MS41aDE1TTYxLjUgNTR2MTUiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=';

const COMPANY = {
  name: '주식회사 테라트레이딩',
  bizNo: formatBizNo('2148736125'),
  ceo: '박은서',
  address: '서울특별시 성동구 성수이로 118, 7층',
};

function TwoPages() {
  return (
    <PaperPreview label="근로계약서 미리보기">
      <Paper label="근로계약서 1쪽" footer={<span>1 / 2</span>}>
        <PaperTitle>근로계약서</PaperTitle>
        <PaperText>
          {COMPANY.name}(이하 사업주)과 이도윤(이하 근로자)은 다음과 같이 근로계약을 체결한다.
        </PaperText>
        <PaperFields
          title="근로 조건"
          columns={2}
          rows={[
            { label: '1. 근로개시일', value: '2022년 3월 2일부터' },
            { label: '2. 근무 장소', value: `본사(${COMPANY.address})` },
            { label: '3. 업무 내용', value: '국내 영업 · 거래처 관리' },
            { label: '4. 소정근로시간', value: '09:00~18:00(휴게 12:00~13:00)' },
            { label: '5. 근무일 · 휴일', value: '매주 5일(월~금) 근무, 주휴일 매주 일요일' },
          ]}
        />
        <PaperMoneyTable
          title="6. 임금"
          note="단위: 원. 매월 24일 근로자 명의 계좌로 지급한다."
          columns={[{ header: '구분' }, { header: '월 금액', width: 'md' }, { header: '비고' }]}
          rows={[
            ['기본급', 3200000, ''],
            ['직책 수당', 200000, '대리 직책'],
            ['식대', 200000, '비과세'],
          ]}
          total={['월 합계', 3600000, '']}
        />
      </Paper>
      <Paper label="근로계약서 2쪽" footer={<span>2 / 2</span>}>
        <PaperFields
          title="근로 조건(계속)"
          columns={2}
          rows={[
            { label: '7. 연차유급휴가', value: '근로기준법에서 정하는 바에 따라 부여함' },
            { label: '8. 사회보험 적용', value: '고용보험 · 산재보험 · 국민연금 · 건강보험' },
            {
              label: '9. 근로계약서 교부',
              value: '사업주는 계약을 체결함과 동시에 본 계약서를 사본하여 근로자에게 교부함',
            },
            { label: '10. 기타', value: '이 계약에 정함이 없는 사항은 근로기준법령에 의함' },
          ]}
        />
        <PaperSignPair
          date="2022-02-25"
          left={{
            title: '사업주',
            rows: [
              { label: '사업체명', value: COMPANY.name },
              { label: '주소', value: COMPANY.address },
              {
                label: '대표자',
                value: (
                  <>
                    {COMPANY.ceo} <PaperSeal src={SEAL} name={COMPANY.name} />
                  </>
                ),
              },
            ],
          }}
          right={{
            title: '근로자',
            rows: [
              { label: '성명', value: '이도윤' },
              { label: '주소', value: '서울특별시 마포구 월드컵북로 21, 2층' },
              { label: '연락처', value: '010-4821-7730' },
              { label: '서명', value: '(서명)' },
            ],
          }}
        />
      </Paper>
    </PaperPreview>
  );
}
```

### 칸이 많은 서식

density compact · margin sm. 사업소득 원천징수영수증처럼 표가 긴 서식을 한 장에 넣습니다.

```tsx
import { formatBizNo } from '@terracelab/trellis-contracts';
import { Paper, PaperFields, PaperMoneyTable, PaperSignature, PaperText, PaperTitle, PaperPreview } from '@terracelab/trellis-react';

const SEAL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiNDODMxMkIiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIG9wYWNpdHk9IjAuODgiPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ1IiBzdHJva2Utd2lkdGg9IjUiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIzOC41IiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0zMSAzMWgxNXYxNUgzMXpNNTQgMzFoMTV2MTVINTR6TTMxIDU0aDE1djE1SDMxek01NCA1NGgxNXYxNUg1NHoiIHN0cm9rZS13aWR0aD0iMyIvPjxwYXRoIGQ9Ik0zOC41IDMxdjE1TTMxIDM4LjVoMTVNNTQgMzguNWgxNU02MS41IDMxdjE1TTMxIDYxLjVoMTVNMzguNSA1NHYxNU01NCA2MS41aDE1TTYxLjUgNTR2MTUiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=';

const COMPANY = {
  name: '주식회사 테라트레이딩',
  bizNo: formatBizNo('2148736125'),
  ceo: '박은서',
  address: '서울특별시 성동구 성수이로 118, 7층',
};

const BIZ_ROWS = [
  ['2026-01-25', '2026-01', 2500000, '3%', 75000, 7500],
  ['2026-02-25', '2026-02', 2500000, '3%', 75000, 7500],
  ['2026-03-25', '2026-03', 3200000, '3%', 96000, 9600],
  ['2026-04-24', '2026-04', 2500000, '3%', 75000, 7500],
  ['2026-05-25', '2026-05', 1800000, '3%', 54000, 5400],
  ['2026-06-25', '2026-06', 2500000, '3%', 75000, 7500],
  ['2026-07-24', '2026-07', 2500000, '3%', 75000, 7500],
  ['2026-08-25', '2026-08', 4100000, '3%', 123000, 12300],
  ['2026-09-25', '2026-09', 2500000, '3%', 75000, 7500],
  ['2026-10-23', '2026-10', 2500000, '3%', 75000, 7500],
];

function CompactForm() {
  return (
    <PaperPreview label="사업소득 원천징수영수증 미리보기">
      <Paper label="거주자의 사업소득 원천징수영수증" density="compact" margin="sm">
        <PaperTitle subtitle="2026년 귀속">사업소득 원천징수영수증</PaperTitle>
        <PaperFields
          title="징수의무자"
          rows={[
            { label: '법인명(상호)', value: COMPANY.name },
            { label: '사업자등록번호', value: COMPANY.bizNo },
            { label: '대표자(성명)', value: COMPANY.ceo },
            { label: '법인등록번호', value: '110111-7654321' },
            { label: '소재지(주소)', value: COMPANY.address, full: true },
          ]}
        />
        <PaperFields
          title="소득자"
          rows={[
            { label: '성명', value: '한지우' },
            { label: '주민등록번호', value: '880512-2******' },
            { label: '주소', value: '경기도 성남시 분당구 정자일로 95, 1203호', full: true },
            { label: '업종(하는 일)', value: '디자인 용역' },
            { label: '귀속 연도', value: '2026년' },
          ]}
        />
        <PaperMoneyTable
          title="지급 내역"
          note="단위: 원. 지급 총액에서 소득세 3%와 지방소득세(소득세의 10%)를 떼고 지급했습니다."
          columns={[
            { header: '지급 연월일', width: 'sm' },
            { header: '귀속 연월', width: 'sm' },
            { header: '지급 총액' },
            { header: '세율', width: 'xs', align: 'right' },
            { header: '소득세' },
            { header: '지방소득세' },
          ]}
          rows={BIZ_ROWS}
          total={['합계', '10건', 26600000, '', 798000, 79800]}
        />
        <PaperText variant="statement">
          위의 원천징수액(사업소득)을 정히 영수(지급)합니다.
        </PaperText>
        <PaperSignature
          date="2026-11-09"
          company={COMPANY.name}
          role="징수(보고)의무자"
          representative={COMPANY.ceo}
          seal={SEAL}
        />
        <PaperText variant="statement">세무서장 귀하</PaperText>
      </Paper>
    </PaperPreview>
  );
}
```

### 다크 화면

감싼 화면이 다크여도 종이는 paper 토큰으로 흰 바탕 · 검은 글자입니다.

```tsx
import { formatBizNo } from '@terracelab/trellis-contracts';
import { Paper, PaperFields, PaperMoneyTable, PaperText, PaperTitle, PaperPreview } from '@terracelab/trellis-react';

const COMPANY = {
  name: '주식회사 테라트레이딩',
  bizNo: formatBizNo('2148736125'),
  ceo: '박은서',
  address: '서울특별시 성동구 성수이로 118, 7층',
};

function DarkScreen() {
  return (
    <div
      data-theme="dark"
      style={{
        padding: 'var(--tl-space-16)',
        borderRadius: 'var(--tl-radius-lg)',
        background: 'var(--tl-color-bg-canvas)',
      }}
    >
      <PaperPreview label="영수증 미리보기">
        <Paper size="a5" label="영수증">
          <PaperTitle subtitle="2026-11-06 · 공급받는 자 보관용">영수증</PaperTitle>
          <PaperFields
            columns={2}
            rows={[
              { label: '공급자', value: COMPANY.name },
              { label: '사업자등록번호', value: COMPANY.bizNo },
              { label: '공급받는 자', value: '대양상사' },
            ]}
          />
          <PaperMoneyTable
            columns={[{ header: '품목' }, { header: '수량', width: 'xs' }, { header: '금액' }]}
            rows={[
              ['복사 용지 A4', 10, 248000],
              ['토너 카트리지', 1, 38000],
            ]}
            total={['합계', 11, 286000]}
          />
          <PaperText variant="statement">위 금액을 정히 영수합니다.</PaperText>
        </Paper>
      </PaperPreview>
    </div>
  );
}
```

### 직인 있음 · 없음

직인 이미지가 있으면 "(인)" 위에 찍고, 없으면 "(인)"만 남깁니다.

```tsx
import { formatBizNo } from '@terracelab/trellis-contracts';
import { Paper, PaperSignature, PaperText, PaperTitle, PaperPreview } from '@terracelab/trellis-react';

const SEAL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiNDODMxMkIiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIG9wYWNpdHk9IjAuODgiPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ1IiBzdHJva2Utd2lkdGg9IjUiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIzOC41IiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0zMSAzMWgxNXYxNUgzMXpNNTQgMzFoMTV2MTVINTR6TTMxIDU0aDE1djE1SDMxek01NCA1NGgxNXYxNUg1NHoiIHN0cm9rZS13aWR0aD0iMyIvPjxwYXRoIGQ9Ik0zOC41IDMxdjE1TTMxIDM4LjVoMTVNNTQgMzguNWgxNU02MS41IDMxdjE1TTMxIDYxLjVoMTVNMzguNSA1NHYxNU01NCA2MS41aDE1TTYxLjUgNTR2MTUiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=';

const COMPANY = {
  name: '주식회사 테라트레이딩',
  bizNo: formatBizNo('2148736125'),
  ceo: '박은서',
  address: '서울특별시 성동구 성수이로 118, 7층',
};

function SealImage() {
  return (
    <PaperPreview label="직인 비교 미리보기">
      <Paper size="a5" orientation="landscape" label="확인서, 직인 이미지 있음">
        <PaperTitle>확인서</PaperTitle>
        <PaperText variant="statement">위와 같이 확인합니다.</PaperText>
        <PaperSignature
          date="2026-11-09"
          company={COMPANY.name}
          representative={COMPANY.ceo}
          seal={SEAL}
        />
      </Paper>
      <Paper size="a5" orientation="landscape" label="확인서, 직인 이미지 없음">
        <PaperTitle>확인서</PaperTitle>
        <PaperText variant="statement">위와 같이 확인합니다.</PaperText>
        <PaperSignature date="2026-11-09" company={COMPANY.name} representative={COMPANY.ceo} />
      </Paper>
    </PaperPreview>
  );
}
```

### 인쇄 · PDF로 저장

단추를 누르면 종이만 인쇄 창으로 보냅니다. 인쇄 창에서 PDF로 저장하면 파일 이름이 fileName입니다. 인쇄 창이 열리면 onOpen, 닫히면 onClose가 불립니다.

```tsx
import { formatBizNo } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { Button, Paper, PaperFields, PaperSignature, PaperText, PaperTitle, PaperPreview, usePrintPapers } from '@terracelab/trellis-react';

const SEAL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiNDODMxMkIiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIG9wYWNpdHk9IjAuODgiPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ1IiBzdHJva2Utd2lkdGg9IjUiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIzOC41IiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0zMSAzMWgxNXYxNUgzMXpNNTQgMzFoMTV2MTVINTR6TTMxIDU0aDE1djE1SDMxek01NCA1NGgxNXYxNUg1NHoiIHN0cm9rZS13aWR0aD0iMyIvPjxwYXRoIGQ9Ik0zOC41IDMxdjE1TTMxIDM4LjVoMTVNNTQgMzguNWgxNU02MS41IDMxdjE1TTMxIDYxLjVoMTVNMzguNSA1NHYxNU01NCA2MS41aDE1TTYxLjUgNTR2MTUiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=';

const COMPANY = {
  name: '주식회사 테라트레이딩',
  bizNo: formatBizNo('2148736125'),
  ceo: '박은서',
  address: '서울특별시 성동구 성수이로 118, 7층',
};

function PrintButton() {
  const print = usePrintPapers();
  const [status, setStatus] = useState('');
  const page = (
    <Paper label="재직증명서">
      <PaperTitle>재직증명서</PaperTitle>
      <PaperFields
        title="인적 사항"
        rows={[
          { label: '성명', value: '이도윤' },
          { label: '소속 · 직위', value: '영업팀 · 대리' },
        ]}
      />
      <PaperText variant="statement">위 사람은 현재 당사에 재직하고 있음을 증명합니다.</PaperText>
      <PaperSignature
        date="2026-11-09"
        company={COMPANY.name}
        representative={COMPANY.ceo}
        seal={SEAL}
      />
    </Paper>
  );
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-12)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--tl-space-12)' }}>
        <Button
          icon="printer"
          onPress={() =>
            void print(page, {
              fileName: '재직증명서_이도윤',
              // 발급 대장에 남길 자리. 인쇄했는지 취소했는지는 브라우저가 알려 주지 않는다
              onOpen: () => setStatus('인쇄 창을 열었습니다'),
              onClose: () => setStatus('인쇄 창을 닫았습니다'),
            })
          }
        >
          인쇄
        </Button>
        <span role="status">{status}</span>
      </div>
      <PaperPreview label="재직증명서 미리보기">{page}</PaperPreview>
    </div>
  );
}
```

### 한 장을 넘는 종이

내용이 종이 높이를 넘으면 미리보기가 1장이 끝나는 자리에 점선을 긋고 위에 안내를 띄웁니다. 앱은 onOverflowChange로 같은 사실을 받습니다. 여기서는 compact로 줄이는 단추를 보여 줍니다.

```tsx
import { formatBizNo } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { Button, Paper, PaperFields, PaperMoneyTable, PaperText, PaperTitle, PaperPreview } from '@terracelab/trellis-react';

const COMPANY = {
  name: '주식회사 테라트레이딩',
  bizNo: formatBizNo('2148736125'),
  ceo: '박은서',
  address: '서울특별시 성동구 성수이로 118, 7층',
};

const RECEIPT_ITEMS = [
  ['복사 용지 A4', 10, 24800],
  ['토너 카트리지', 1, 38000],
  ['스테이플러', 2, 6500],
  ['클립 소', 5, 1200],
  ['포스트잇', 6, 2300],
  ['네임펜 흑색', 12, 900],
  ['서류 봉투', 50, 150],
  ['L자 파일', 20, 400],
  ['수정 테이프', 4, 1800],
  ['박스 테이프', 3, 2100],
  ['볼펜 흑색', 24, 500],
  ['형광펜', 6, 1100],
  ['인주', 1, 3500],
] as const;

function Overflow() {
  const [overflow, setOverflow] = useState(false);
  const [compact, setCompact] = useState(false);
  const total = RECEIPT_ITEMS.reduce((sum, [, qty, price]) => sum + qty * price, 0);
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-12)' }}>
      <div style={{ display: 'flex', gap: 'var(--tl-space-8)' }}>
        {overflow && !compact && (
          <Button variant="secondary" onPress={() => setCompact(true)}>
            한 장에 맞추기
          </Button>
        )}
        {compact && (
          <Button variant="ghost" onPress={() => setCompact(false)}>
            원래 크기
          </Button>
        )}
      </div>
      <PaperPreview label="거래명세서 미리보기">
        <Paper
          size="a5"
          label="거래명세서"
          density={compact ? 'compact' : 'regular'}
          margin={compact ? 'sm' : 'md'}
          onOverflowChange={setOverflow}
        >
          <PaperTitle subtitle="2026-11-06 · 공급받는 자 보관용">거래명세서</PaperTitle>
          <PaperFields
            columns={2}
            rows={[
              { label: '공급자', value: COMPANY.name },
              { label: '등록번호', value: COMPANY.bizNo },
              { label: '공급받는 자', value: '대양상사' },
            ]}
          />
          <PaperMoneyTable
            columns={[
              { header: '품목' },
              { header: '수량', width: 'xs' },
              { header: '단가', width: 'sm' },
              { header: '금액', width: 'md' },
            ]}
            rows={RECEIPT_ITEMS.map(([name, qty, price]) => [name, qty, price, qty * price])}
            total={['합계', '', '', total]}
          />
          <PaperText variant="statement">위 금액을 정히 영수합니다.</PaperText>
        </Paper>
      </PaperPreview>
    </div>
  );
}
```

### 여러 쪽으로 나눈 표

paginateMoneyRows로 줄을 쪽마다 나눕니다. 둘째 쪽부터 앞 쪽 이월 줄, 마지막 쪽 앞까지 다음 쪽 이월 줄이 붙고 머리 줄은 쪽마다 다시 나옵니다.

```tsx
import { formatBizNo, paginateMoneyRows } from '@terracelab/trellis-contracts';
import { Paper, PaperFields, PaperMoneyTable, PaperSignature, PaperTitle, PaperPreview } from '@terracelab/trellis-react';

const SEAL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiNDODMxMkIiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIG9wYWNpdHk9IjAuODgiPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ1IiBzdHJva2Utd2lkdGg9IjUiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIzOC41IiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0zMSAzMWgxNXYxNUgzMXpNNTQgMzFoMTV2MTVINTR6TTMxIDU0aDE1djE1SDMxek01NCA1NGgxNXYxNUg1NHoiIHN0cm9rZS13aWR0aD0iMyIvPjxwYXRoIGQ9Ik0zOC41IDMxdjE1TTMxIDM4LjVoMTVNNTQgMzguNWgxNU02MS41IDMxdjE1TTMxIDYxLjVoMTVNMzguNSA1NHYxNU01NCA2MS41aDE1TTYxLjUgNTR2MTUiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=';

const COMPANY = {
  name: '주식회사 테라트레이딩',
  bizNo: formatBizNo('2148736125'),
  ceo: '박은서',
  address: '서울특별시 성동구 성수이로 118, 7층',
};

const LEDGER_ITEMS = [
  ['양파 15kg', 32000],
  ['대파 1단', 3800],
  ['깐마늘 1kg', 9500],
  ['감자 20kg', 41000],
  ['당근 10kg', 18500],
  ['애호박', 1600],
  ['청양고추 4kg', 27000],
  ['양배추', 3200],
] as const;

const LEDGER_ROWS = Array.from({ length: 44 }, (_, i) => {
  const [name, price] = LEDGER_ITEMS[i % LEDGER_ITEMS.length]!;
  const qty = (i % 5) + 1;
  const supply = qty * price;
  const day = String(Math.floor(i / 2) + 1).padStart(2, '0');
  return [`2026-10-${day}`, name, qty, price, supply, Math.floor(supply / 10)] as const;
});

const LEDGER_TOTAL = LEDGER_ROWS.reduce<[number, number]>(
  (t, row) => [t[0] + row[4], t[1] + row[5]],
  [0, 0],
);

function LongTable() {
  const pages = paginateMoneyRows(LEDGER_ROWS, { first: 16, rest: 22, sum: [4, 5] });
  const columns = [
    { header: '일자', width: 'md' },
    { header: '품목' },
    { header: '수량', width: 'xs' },
    { header: '단가', width: 'sm' },
    { header: '공급가액', width: 'md' },
    { header: '세액', width: 'sm' },
  ] as const;
  return (
    <PaperPreview label="거래내역서 미리보기">
      {pages.map(({ page, pages: count, rows, carryIn, carryOut }) => (
        <Paper
          key={page}
          label={`거래내역서 ${page}쪽`}
          footer={
            <>
              <span>{COMPANY.name}</span>
              <span>
                {page} / {count}
              </span>
            </>
          }
        >
          {page === 1 && (
            <>
              <PaperTitle subtitle="2026년 10월분">거래내역서</PaperTitle>
              <PaperFields
                rows={[
                  { label: '공급자', value: COMPANY.name },
                  { label: '사업자등록번호', value: COMPANY.bizNo },
                  { label: '공급받는 자', value: '한빛푸드' },
                  { label: '거래 기간', value: '2026-10-01~10-22' },
                ]}
              />
            </>
          )}
          <PaperMoneyTable
            title={page === 1 ? '거래 내역' : '거래 내역(계속)'}
            note={page === 1 ? '단위: 원' : undefined}
            columns={columns}
            rows={rows}
            carryIn={carryIn}
            carryOut={carryOut}
            total={page === count ? ['합계', '', '', '', ...LEDGER_TOTAL] : undefined}
          />
          {page === count && (
            <PaperSignature
              date="2026-10-31"
              company={COMPANY.name}
              representative={COMPANY.ceo}
              seal={SEAL}
            />
          )}
        </Paper>
      ))}
    </PaperPreview>
  );
}
```

### 앱 글자 크기 1.3배

앱이 글자 크기 모드로 type 토큰을 키워도 종이 글자는 paper.type 토큰이라 그대로입니다. 위 문단은 앱 글자라 커지고, 인쇄물 쪽수는 바뀌지 않습니다.

```tsx
import { formatBizNo } from '@terracelab/trellis-contracts';
import type { CSSProperties } from 'react';
import { Paper, PaperFields, PaperSignature, PaperText, PaperTitle, PaperPreview } from '@terracelab/trellis-react';

const COMPANY = {
  name: '주식회사 테라트레이딩',
  bizNo: formatBizNo('2148736125'),
  ceo: '박은서',
  address: '서울특별시 성동구 성수이로 118, 7층',
};

const TYPE_STYLES = ['display', 'h1', 'h2', 'h3', 'body', 'label', 'caption'] as const;

const CAPTURE_TYPE = Object.fromEntries(
  TYPE_STYLES.flatMap((s) => [
    [`--example-${s}-size`, `var(--tl-type-${s}-font-size)`],
    [`--example-${s}-leading`, `var(--tl-type-${s}-line-height)`],
  ]),
) as CSSProperties;

const SCALE_TYPE = Object.fromEntries(
  TYPE_STYLES.flatMap((s) => [
    [`--tl-type-${s}-font-size`, `calc(var(--example-${s}-size) * 1.3)`],
    [`--tl-type-${s}-line-height`, `calc(var(--example-${s}-leading) * 1.3)`],
  ]),
) as CSSProperties;

function AppTextSize() {
  return (
    <div style={CAPTURE_TYPE}>
      <div style={{ ...SCALE_TYPE, display: 'grid', gap: 'var(--tl-space-12)' }}>
        <p
          style={{
            margin: 0,
            fontSize: 'var(--tl-type-body-font-size)',
            lineHeight: 'var(--tl-type-body-line-height)',
          }}
        >
          이 문단은 앱 글자라 1.3배로 커졌습니다.
        </p>
        <PaperPreview label="확인서 미리보기">
          <Paper size="a5" orientation="landscape" label="확인서">
            <PaperTitle>확인서</PaperTitle>
            <PaperFields
              columns={2}
              rows={[
                { label: '성명', value: '이도윤' },
                { label: '소속 · 직위', value: '영업팀 · 대리' },
              ]}
            />
            <PaperText variant="statement">위와 같이 확인합니다.</PaperText>
            <PaperSignature date="2026-11-09" company={COMPANY.name} representative={COMPANY.ceo} />
          </Paper>
        </PaperPreview>
      </div>
    </div>
  );
}
```
