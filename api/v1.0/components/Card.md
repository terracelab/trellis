# Card

> `@terracelab/trellis-react` · CSS `.tl-card` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { Card } from '@terracelab/trellis-react';
```

## 용도

화면 안의 한 덩어리(목록 · 표 · 요약)를 묶는다. 숫자 하나는 KpiCard, 차트는 ChartCard.

## 해부(Anatomy)

root(`bg.surface`, `border.divider`, `radius.lg`) · head(tone 아이콘 16 · title `type.h3` · subtitle `type.caption` fg.tertiary · action) · body(`density.card-padding`) · footer(위 구분선).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `title` | `ReactNode` |  |  | 제목 |
| `subtitle` | `ReactNode` |  |  | 단위 · 기간 |
| `action` | `ReactNode` |  |  | 우상단 동작 |
| `footer` | `ReactNode` |  |  | 아래 영역 |
| `padding` | `'default' \| 'none'` | `"default"` |  | 안쪽 여백 |
| `emphasis` | `'default' \| 'strong' \| 'quiet'` | `"default"` |  | 무게(strong은 화면에 하나, quiet는 참고 정보) |
| `tone` | `'info' \| 'success' \| 'warning' \| 'danger' \| 'neutral'` |  |  | 제목 앞 상태 아이콘(면 색은 그대로) |
| `headingLevel` | `2 \| 3 \| 4` |  |  | 제목 단계(없으면 문맥: 화면 h2, 카드 안 h3) |
| `landmark` | `boolean` | `false` |  | region 랜드마크로(section) |
| `children` | `ReactNode` |  |  | 내용 |

## Variants

padding default · none. emphasis 세 단계(PR-38, 한 화면에서 어디부터 볼지):

| emphasis | 모양 | 쓰는 자리 |
| --- | --- | --- |
| strong | 테두리 `border.strong` + 제목 `type.h2` | "지금 해야 할 것" 한 구역. 화면에 하나 |
| default | 테두리 `border.divider` + 제목 `type.h3` | 나머지 카드 |
| quiet | 테두리 · 면 없음(바탕 그대로), 안쪽 여백은 그대로 | 참고 정보 · 보조 목록. 카드 안 카드 대신 |

그림자 · 색 면 · 왼쪽 색 띠로 올리지 않는다(다크에서 그림자가 안 보이고, 색 면 · 띠는 장식으로 읽힌다). tone(info · success · warning · danger · neutral)은 제목 앞 상태 아이콘(Banner와 같은 모양, 톤 색)만 더하고 면 · 테두리 색은 그대로 둔다. 뜻은 제목 글자가 말한다("지난 기한 2건"). strong과 함께 쓰는 것이 기본이다.

## States

지원 상태: `default`

default.

## 동작

title이 있으면 `aria-labelledby`로 영역 이름이 된다. 제목 단계는 headingLevel(2 · 3 · 4), 없으면 문맥으로 정한다: 화면 바로 아래 카드는 h2(PageHeader h1 다음), 카드 안 카드는 한 단계 아래. 기본은 랜드마크가 아니고(div), landmark면 section + 제목 이름의 region이다. 법인마다 같은 제목 카드가 여러 개면 같은 이름 랜드마크가 겹치기 때문이다(R-33). 머리 · 바닥은 header · footer 요소가 아니라 div다(main 밖에서 banner · contentinfo가 되지 않게). 본문(children)이 비면 본문 칸을 그리지 않는다. footer가 제목 바로 아래에 붙고, 격자에서 늘어난 높이는 카드 아래 빈자리가 된다. 본문이 있으면 footer는 카드 맨 아래에 붙어 같은 줄 카드끼리 footer가 맞는다.

## 접근성

landmark면 `<section>` + 제목 연결. tone 아이콘은 꾸밈(aria-hidden)이라 상태는 제목 글자로 말한다.

## 밀도

안쪽 여백 `density.card-padding`(12 · 16).

## 플랫폼 차이

없음.

## 금지 사항

카드 안에 카드(→ quiet) · 그림자 강조(다크에서는 테두리로) · 한 화면에 strong 둘 이상 · 무게 4단계 이상(KpiCard · ChartCard도 세 단계 안에서) · 색 면 · 왼쪽 색 띠.

## 예시

### 무게 세 단계

strong은 "지금 해야 할 것" 한 구역에만, 보통 카드, quiet는 참고 정보(테두리 · 면 없이)

```tsx
import { Button, Card } from '@terracelab/trellis-react';

const grid = {
  display: 'grid',
  gap: 'var(--tl-space-16)',
  gridTemplateColumns: 'repeat(auto-fit, minmax(calc(var(--tl-space-64) * 4), 1fr))',
  alignItems: 'stretch',
} as const;

function Emphasis() {
  return (
    <div style={grid}>
      <Card
        emphasis="strong"
        tone="danger"
        title="지난 기한 2건"
        subtitle="오늘 처리할 것"
        action={
          <Button size="sm" variant="ghost" iconEnd="chevron-right">
            전체
          </Button>
        }
      >
        10월 원천세 신고 · 2일 경과
        <br />
        4대보험 취득신고(이서연) · 1일 경과
      </Card>
      <Card title="이번 주 일정" subtitle="11월 2주" footer="합계 5건">
        11월 10일(화) 급여 지급
        <br />
        11월 12일(목) 부가세 예정신고
      </Card>
      <Card emphasis="quiet" title="참고" subtitle="지난달 같은 주">
        일정 4건 · 모두 완료
      </Card>
    </div>
  );
}
```

### 기본

제목 · 기준 · 우상단 동작 · 아래 합계

```tsx
import { Button, Card } from '@terracelab/trellis-react';

function Default() {
  return (
    <Card
      title="이번 주 입고 예정"
      subtitle="11월 2주 · 거래처 6곳"
      action={
        <Button size="sm" variant="ghost" iconEnd="chevron-right">
          전체
        </Button>
      }
      footer="합계 18건 · 4,820EA"
    >
      입고 예정 목록이 여기에 온다
    </Card>
  );
}
```

### 본문 없는 카드

내용이 없으면 footer가 제목 바로 아래에 붙고, 격자에서 늘어난 높이는 카드 아래에 남는다

```tsx
import { Card } from '@terracelab/trellis-react';

const grid = {
  display: 'grid',
  gap: 'var(--tl-space-16)',
  gridTemplateColumns: 'repeat(auto-fit, minmax(calc(var(--tl-space-64) * 4), 1fr))',
  alignItems: 'stretch',
} as const;

function NoBody() {
  return (
    <div style={grid}>
      <Card title="미결 결재" subtitle="내 차례" footer="결재할 문서가 없습니다" />
      <Card title="이번 달 입사자" subtitle="11월" footer="2명 · 온보딩 진행 중">
        김테라 · 영업팀
        <br />
        박하나 · 회계팀
        <br />첫 출근 안내 메일 보냄
      </Card>
    </div>
  );
}
```
