# RichText

> `@terracelab/trellis-react` · CSS `.tl-rich-text` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { RichText } from '@terracelab/trellis-react';
```

## 용도

에이전트 답변처럼 서식이 있는 글(제목 · 목록 · 표 · 코드 · 링크 · 굵게)을 마크다운 일부에서 그려 보여 줄 때 쓴다. MessageThread의 답변(`kind: 'answer'`) 본문이 이것이다. 사람이 쓴 메시지 평문은 MessageThread 말풍선, 입력값 표는 DataGrid, 서식 문서 편집은 문서 작성 블록.

## 해부(Anatomy)

root(`tl-rich-text`, 블록 사이 `space.8`) · heading(글 안 가장 높은 제목 = `type.h4`, 그 아래는 본문 크기 600, `fg.strong`) · paragraph(줄바꿈 그대로) · list(`ol` · `ul`, 들여쓰기 `space.20`, 표시 `fg.secondary`) · table(가로 스크롤 칸 + `table`: 머리 `bg.sunken` · `fg.secondary` · `type.label` 600, 행 사이 `border.divider` 1px, 숫자 열 오른쪽 · tabular) · code(인라인 `bg.sunken` · `font.family.mono` · `type.mono`) · pre(코드 블록 `bg.sunken` · `radius.md` · 가로 스크롤) · link(`fg.link` 밑줄) · cite(본문 [1] → Citation inline) · rule(`border.divider` 1px) · caret(쓰는 중 커서, `fg.secondary` 2px 막대).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `text` | `string` |  | 필수 | 마크다운 일부(제목 · 목록 · 표 · 코드 · 링크 · 굵게) |
| `streaming` | `boolean` | `false` |  | 쓰는 중(끝 커서 · aria-busy) |
| `citations` | `CitationSource[]` |  |  | 본문 [1] 표시가 가리키는 출처 |
| `onCitationOpen` | `(source: CitationSource) => void` |  |  | 출처 표시를 누를 때 |
| `onLinkPress` | `(href: string) => void` |  |  | 링크를 누를 때(없으면 새 창) |
| `headingLevel` | `2 \| 3 \| 4` | `3` |  | 가장 높은 제목의 단계 |

## Variants

변형 prop이 없다. 블록 종류(제목 · 문단 · 목록 · 표 · 코드 · 구분선)와 `headingLevel`(2 · 3 · 4)로 모양이 정해진다.

| 블록 | 문법 | 그리는 것 |
|---|---|---|
| 제목 | `#` ~ `######` + 띄어쓰기 | `h{headingLevel + 상대 단계 − 1}`(최대 h6) |
| 목록 | `-` · `*` · `+` · `1.` · `1)` | `ul` · `ol`(첫 번호 유지), 2칸 이상 들여 쓰면 안쪽 목록 |
| 표 | GFM 파이프 표(머리 줄 + 구분 줄) | 구분 줄의 `:---` · `:---:` · `---:` 정렬, 정하지 않은 숫자 열은 right |
| 코드 블록 | ```` ``` ```` · `~~~`(언어 이름 선택) | `pre > code`, 안의 글은 해석하지 않는다 |
| 인라인 | `**굵게**` · `` `코드` `` · `[글](https://…)` · http(s) 주소 · `[1]` · `[^1]` | `strong` · `code` · `a` · Citation |
| 구분선 | `---` · `***` | `hr` |

## States

지원 상태: `default` · `loading`

default · loading(`streaming`: 끝에 커서, root `aria-busy="true"` · `data-state="loading"`). hover · focus는 안의 링크 · 출처 표시 · 스크롤 칸이 가진다. active · disabled · error는 해당 없음(답변 실패는 MessageThread가 글자로 알린다).

## 동작

- 해석: contracts `parseRichText(text)`가 블록 나무를 만들고 컴포넌트는 React 요소로만 그린다. HTML 문자열을 넣지 않는다(`dangerouslySetInnerHTML` 없음). 웹 · 네이티브가 같은 해석기를 쓴다.
- 쓰는 중: 같은 글에는 늘 같은 결과라 글자가 붙어도 앞 블록이 바뀌지 않는다. 닫히지 않은 코드 블록은 그 줄부터 끝까지 꾸밈 없는 글자(`plain`), 닫히지 않은 `**` · 백틱 · `[글](` 는 글자 그대로다. 구분 줄이 덜 온 표는 문단이다. 다음 글자가 와서 닫히면 그때 서식이 된다.
- 문단: 한 줄 바꿈은 줄바꿈(`br`)이다(대화 답변 관습). 목록 표시는 빈 줄 없이도 문단을 끊는다. 세 자리를 넘는 숫자 + 점(2026.)은 번호 목록이 아니다.
- 제목 단계: `#` 개수가 아니라 글 안 가장 높은 제목을 `headingLevel`(기본 3)로 맞춘다. `###`만 쓴 답변도 첫 단계 제목이 h3이다.
- 표 숫자: 빈 칸 · `–`를 뺀 본문 칸이 모두 숫자(부호 · 쉼표 · 소수 · 원 · % · %p · 건 · EA 같은 짧은 단위)인 열은 오른쪽 정렬 · tabular 숫자다. 서식은 바꾸지 않는다(답변을 만드는 쪽이 `formatAmount`로 쓴다). 단위는 표 위 문장에 한 번 적는다.
- 링크: http · https · mailto · tel · 앱 안 경로(`/` · `#`)만 링크가 된다(`safeHref`). `javascript:` 등은 글만 남는다. http(s)는 새 창(`rel="noopener noreferrer"`), 앱 안 경로는 같은 창이다. `onLinkPress`가 있으면 모든 링크를 앱이 연다(보조 키 · 가운데 단추는 브라우저 몫).
- 출처: `citations`가 있으면 본문 `[n]`이 번호 n인 출처의 Citation inline 표시가 된다. 없는 번호는 글자 `[n]` 그대로다. 누르면 `onCitationOpen(source)`, 없으면 출처 href.

| 키 | 동작 |
| --- | --- |
| Tab | 링크 · 출처 표시 · 표 · 코드 블록(가로 스크롤 칸) 순서 |
| ArrowLeft · ArrowRight | 포커스가 표 · 코드 블록에 있으면 가로 스크롤 |

## 접근성

제목 · 목록 · 표는 실제 `h*` · `ol` · `ul` · `table`(`th scope="col"`)이라 보조 기술이 구조를 읽는다. 넓은 표 · 코드 블록은 `tabindex="0"`이라 키보드로 스크롤하고, 표 칸은 `role="group"` + 이름 "표"다. 쓰는 중에는 root가 `aria-busy`라 글이 붙는 동안 읽기를 미루고, 글이 아직 없으면 숨은 글자 "답변을 쓰는 중"이 있다. 커서는 꾸밈(aria-hidden)이다. 링크 색 `fg.link`와 본문 `fg.primary`는 4.5:1 이상이고 링크는 밑줄로도 구분된다. 커서 깜빡임은 reduced-motion에서 멈춘다(막대는 남는다).

## 밀도

글자 `density.body-font-size` · `density.body-line-height`, 표 칸 안쪽 `space.4` × `space.12`. 블록 사이 `space.8`, 제목 앞 `space.16`은 밀도와 관계없다.

## 플랫폼 차이

네이티브는 같은 `parseRichText` 결과를 Text · View로 그린다(표는 가로 ScrollView, 링크는 OS 브라우저 · onLinkPress). props는 같다.

## 금지 사항

HTML 문자열 넣기(`dangerouslySetInnerHTML`) · 열면 안 되는 주소를 링크로 · 표 숫자 열 가운데 정렬 · 칸마다 단위 반복 · 쓰는 중에 닫히지 않은 서식을 추측해 꾸미기 · 왼쪽 띠 인용(D-57). 리뷰로 막는다.

## 예시

### 목록

가장 높은 제목이 h3이 되고, 들여 쓴 줄은 안쪽 목록이 된다

```tsx
import { RichText } from '@terracelab/trellis-react';

const BOX = { maxWidth: 'calc(var(--tl-space-64) * 10)' };

const LIST = `## 11월 결산 전에 확인할 것
미결 전표가 **7건** 남아 있습니다. 마감은 11월 30일(월)입니다.

1. 미지급금 전표 4건
   - 거래처 사업자등록번호가 비어 있습니다
   - 세금계산서를 아직 수취하지 않았습니다
2. 가지급금 정산 2건
3. 미분류 카드 사용 내역 1건`;

function List() {
  return (
    <div style={BOX}>
      <RichText text={LIST} />
    </div>
  );
}
```

### 표

숫자 열은 오른쪽 정렬과 tabular 숫자다. 단위는 표 위에 한 번 적는다

```tsx
import { RichText } from '@terracelab/trellis-react';

const BOX = { maxWidth: 'calc(var(--tl-space-64) * 10)' };

const TABLE = `### 거래처별 미지급금
11월 6일 기준입니다. 금액 단위는 원입니다.

| 거래처 | 전표 | 미지급금 | 지급 예정일 |
|---|---|---|---|
| 한빛식품 | 3건 | 12,480,000 | 2026-11-10 |
| 동해수산 | 1건 | 3,215,500 | 2026-11-15 |
| 대성물류 | 2건 | 860,000 | 2026-11-20 |
| **합계** | **6건** | **16,555,500** | |`;

function Table() {
  return (
    <div style={BOX}>
      <RichText text={TABLE} />
    </div>
  );
}
```

### 코드

인라인 코드와 코드 블록은 고정폭 글자이고 넓으면 칸 안에서 가로로 스크롤한다

```tsx
import { RichText } from '@terracelab/trellis-react';

const BOX = { maxWidth: 'calc(var(--tl-space-64) * 10)' };

const CODE = `전표 번호는 \`EX-2611-0018\`입니다. 같은 조건으로 다시 조회하려면 아래 조건을 필터 저장에 붙여 넣습니다.

\`\`\`
기간: 2026-11-01~2026-11-30
계정과목: 251 미지급금
거래처: 한빛식품
\`\`\``;

function Code() {
  return (
    <div style={BOX}>
      <RichText text={CODE} />
    </div>
  );
}
```

### 링크

http(s)는 새 창, 앱 안 경로는 같은 창으로 연다. 본문의 주소도 링크가 된다

```tsx
import { RichText } from '@terracelab/trellis-react';

const BOX = { maxWidth: 'calc(var(--tl-space-64) * 10)' };

const LINKS = `지출결의서 작성 기준은 [경비 처리 규정](https://intranet.terra-trading.example/policy/expense) 4장에 있습니다. 전표는 [전표 입력](#voucher "전표 입력 화면") 화면에서 엽니다.
문의는 [finance@terra-trading.example](mailto:finance@terra-trading.example)로 보냅니다. 규정 원문은 https://intranet.terra-trading.example/policy/expense.pdf 입니다.`;

function Links() {
  return (
    <div style={BOX}>
      <RichText text={LINKS} />
    </div>
  );
}
```

### 쓰는 중

끝에 커서가 보이고 aria-busy다. 닫히지 않은 코드 블록은 꾸밈 없는 글자로 보인다

```tsx
import { RichText } from '@terracelab/trellis-react';

const BOX = { maxWidth: 'calc(var(--tl-space-64) * 10)' };

const PARTIAL = `조회 조건은 다음과 같습니다.

\`\`\`
기간: 2026-11-01~2026-11-30
계정과목: 251 미지급금`;

function Streaming() {
  return (
    <div style={{ ...BOX, display: 'grid', gap: 'var(--tl-space-16)' }}>
      <RichText text="" streaming />
      <RichText text={PARTIAL} streaming />
    </div>
  );
}
```

### 출처 표시

본문의 [1]이 출처 번호가 된다. 누르면 출처 문서를 연다

```tsx
import { RichText } from '@terracelab/trellis-react';

const BOX = { maxWidth: 'calc(var(--tl-space-64) * 10)' };

const CITED = `연차 사용 촉진은 사용 기간이 끝나기 6개월 전에 1차 통지를 보냅니다[1]. 쓰지 않은 연차는 회계연도 말에 수당으로 정산합니다[2].`;

function Citations() {
  return (
    <div style={BOX}>
      <RichText
        text={CITED}
        citations={[
          {
            title: '2026 취업규칙',
            location: '제32조',
            href: 'https://intranet.terra-trading.example/rules/2026#32',
          },
          { title: '연차 수당 지급 기준', location: '3.2 정산' },
        ]}
      />
    </div>
  );
}
```
