# Paper
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
contract 표.
## Variants
size a4 · a5 × orientation portrait · landscape × margin md · sm × density regular · compact. 색은 모든 조합에서 같다(`paper.*`).

| prop | 값 | 바뀌는 것 |
| --- | --- | --- |
| size | a4 · a5 | 폭 · 최소 높이 `paper.size.a4.*` · `paper.size.a5.*` |
| orientation | portrait · landscape | 가로는 폭 · 높이를 바꿔 쓴다 |
| margin | md · sm | 안쪽 여백 `paper.margin.md`(18mm) · `paper.margin.sm`(12mm) |
| density | regular · compact | 아래 밀도 절 |
## States
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
## 스토리
EmploymentCertificate(재직증명서) · Payslip(급여명세서) · TwoPages(근로계약서 2쪽) · CompactForm(사업소득 원천징수영수증, compact) · DarkScreen(다크 화면의 흰 종이) · SealImage(직인 있음 · 없음) · PrintButton(인쇄, onOpen · onClose) · Overflow(한 장을 넘는 거래명세서, onOverflowChange로 compact 맞추기) · LongTable(거래내역서 3쪽, paginateMoneyRows · 이월 줄) · AppTextSize(앱 글자 1.3배에서도 같은 종이). 생성: Matrix(size a4 · a5, VRT 대상. a5 칸은 재직증명서가 한 장을 넘어 넘침 표시가 보인다).
## 참고
서비스 요청 R-32(인사 문서 9종 미리보기 · PDF), R-35(종이 글자 토큰 · 인쇄 창 콜백 · 넘침 감지 · 긴 표 나누기), 블록 세금계산서 발행(`erp/tax/invoice-issue`) 미리 보기. 토큰 docs/spec/tokens.md §9, 결정 D-77(값 승인 대기). 국세청 · 고용노동부 서식은 칸 구성만 참고했다.
