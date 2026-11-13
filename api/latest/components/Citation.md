# Citation

> `@terracelab/trellis-react` · CSS `.tl-citation` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { Citation } from '@terracelab/trellis-react';
```

## 용도

답변이 근거로 삼은 문서를 번호 · 문서 이름 · 쪽으로 보여 주고 열 때 쓴다. 답변 아래 출처 목록(list)과 글 안 번호 표시(inline) 두 모양이다. 첨부 파일 받기는 Attachment, 문서 사이 이동 링크는 글 안 링크(RichText).

## 해부(Anatomy)

list: root(`tl-citation`, `data-layout="list"`) · label(목록 이름 "출처", `type.caption` 500 `fg.secondary`) · list(`ol`, 감싸는 줄, 사이 `space.6` × `space.8`) · chip(`bg.surface` · `border.default` 1px 전체 · `radius.md`, 높이 `density.control-height-sm`, `type.caption`) · index(번호 상자 `bg.sunken` · `fg.secondary` 600 tabular · `radius.xs`) · title(문서 이름, 넘치면 말줄임) · location(쪽 · 절, `fg.secondary`) · external(새 창 아이콘 `fg.tertiary`, href만 있을 때).
inline: root(`span`, `data-layout="inline"`, 글줄 위쪽 맞춤) · marker(번호 상자 16, `type.micro` 600 · `bg.sunken` · `fg.secondary` · `radius.xs`) + Tooltip(문서 이름 · 쪽).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `sources` | `{ index?: number; title: string; location?: string; href?: string }[]` |  | 필수 | 출처(번호 · 문서 이름 · 쪽 · 주소) |
| `layout` | `'list' \| 'inline'` | `"list"` |  | 모양(답변 아래 목록 · 글 안 번호) |
| `onOpen` | `(source: CitationSource) => void` |  |  | 출처를 열 때 |
| `label` | `string` |  |  | 목록 이름(기본 출처) |

## Variants

layout list · inline. 색은 중립이다(출처는 상태가 아니다).

| layout | 모양 | 놓는 곳 |
|---|---|---|
| list | 번호 · 문서 이름 · 쪽 칩을 감싸는 줄로 | 답변 아래 · ProposalCard 근거 자리 |
| inline | 문장 끝 작은 번호 상자 | 답변 글 안(RichText가 `[1]`을 바꾼다) |

## States

지원 상태: `default` · `hover` · `focus`

default · hover(칩 `border.strong` + `bg.sunken`, 번호 `brand.subtle` + `fg.primary`) · focus(포커스 링). 여는 방법(href · onOpen)이 없는 출처는 글자일 뿐 상태가 없다. active · disabled · loading · error는 해당 없음.

## 동작

- 번호: `index`가 있으면 그 번호, 없으면 목록 순서(1부터, contracts `citationIndex`). 본문의 `[n]`과 목록 번호가 같아야 하므로 걸러 낸 목록에는 index를 준다.
- 열기: `onOpen`이 있으면 앱이 연다(href가 있으면 링크로 남겨 가운데 단추 · 새 탭은 그대로). onOpen 없이 href만 있으면 새 창 링크(`rel="noopener noreferrer"`), 둘 다 없으면 누를 수 없는 글자다.
- inline: 마우스를 올리거나 포커스하면 Tooltip이 문서 이름 · 쪽을 보인다.

| 키 | 동작 |
| --- | --- |
| Tab | 칩 · 번호 표시를 차례로 |
| Enter | 열기(링크 · 단추) |
| Space | 열기(onOpen만 있는 단추) |

## 접근성

list는 `ol` + 목록 이름(label, `aria-labelledby`)이라 "출처, 목록 3개"로 읽힌다. 칩 글자(번호 · 문서 이름 · 쪽)가 링크 · 단추 이름이다. inline 번호는 글자가 숫자 하나라 접근성 이름을 "출처 1 · 2026 취업규칙 · 제32조"로 준다(누를 수 없으면 숨은 글자). 새 창 아이콘은 꾸밈이다. 글자 대비는 `bg.sunken` · `bg.surface` 위 `fg.secondary` · `fg.primary`로 4.5:1 이상, 포커스 링은 항상 보인다.

## 밀도

칩 높이 `density.control-height-sm`(touch 44). 글자 크기 · 번호 상자는 밀도와 관계없다.

## 플랫폼 차이

네이티브는 칩을 Pressable 줄로 그리고 링크는 OS 브라우저로 연다. inline 번호의 Tooltip 대신 누르면 문서 이름 시트를 연다. props는 같다.

## 금지 사항

출처를 상태 색으로 칠하기 · 칩 왼쪽 색 띠(D-57) · 번호 없이 문서 이름만 · 본문 번호와 목록 번호가 다른 목록. 리뷰로 막는다.

## 예시

### 출처 목록

답변 아래에 번호 · 문서 이름 · 쪽을 칩으로 늘어놓는다. 주소가 있으면 새 창으로 연다

```tsx
import { Citation } from '@terracelab/trellis-react';

const SOURCES = [
  {
    title: '2026 취업규칙',
    location: '제32조',
    href: 'https://intranet.terra-trading.example/rules/2026#32',
  },
  {
    title: '연차 수당 지급 기준',
    location: '3.2 정산',
    href: 'https://intranet.terra-trading.example/hr/leave-pay',
  },
  { title: '2025 연차 사용 현황.xlsx', location: '인사팀 시트' },
];

function List() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 10)' }}>
      <Citation sources={SOURCES} />
    </div>
  );
}
```

### 글 안 번호

문장 끝에 작은 번호를 둔다. 마우스를 올리거나 포커스하면 문서 이름이 보인다

```tsx
import { Citation } from '@terracelab/trellis-react';

const SOURCES = [
  {
    title: '2026 취업규칙',
    location: '제32조',
    href: 'https://intranet.terra-trading.example/rules/2026#32',
  },
  {
    title: '연차 수당 지급 기준',
    location: '3.2 정산',
    href: 'https://intranet.terra-trading.example/hr/leave-pay',
  },
  { title: '2025 연차 사용 현황.xlsx', location: '인사팀 시트' },
];

function Inline() {
  return (
    <p style={{ maxWidth: 'calc(var(--tl-space-64) * 10)', margin: 0 }}>
      연차 사용 촉진은 사용 기간이 끝나기 6개월 전에 1차 통지를 보냅니다
      <Citation layout="inline" sources={[{ ...SOURCES[0]!, index: 1 }]} />. 쓰지 않은 연차는
      회계연도 말에 수당으로 정산합니다
      <Citation layout="inline" sources={[{ ...SOURCES[1]!, index: 2 }]} />.
    </p>
  );
}
```

### 앱 안에서 열기

onOpen이 있으면 새 창 대신 앱이 문서 보기를 연다

```tsx
import { Citation } from '@terracelab/trellis-react';

function OpenInApp() {
  return (
    <Citation
      label="근거 문서"
      sources={[
        { title: '전표 EX-2611-0018', location: '증빙 2쪽' },
        { title: '거래처 원장 한빛식품', location: '11월' },
      ]}
      onOpen={() => {}}
    />
  );
}
```
