# SectionHeader

> `@terracelab/trellis-react` · CSS `.tl-section-header` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { SectionHeader } from '@terracelab/trellis-react';
```

## 용도

카드 묶음 · 표 위에 구역 제목을 둘 때 쓴다(이번 달 기한 · 구성원 · 참고 자료). 화면 이름은 PageHeader, 카드 한 장의 제목은 Card title이다. 카드 밖 구역 제목은 이것 하나로 한다(앱마다 작은 라벨 · 중간 제목을 따로 짜지 않는다).

## 해부(Anatomy)

root(grid, 간격 `space.12`) · head(flex, 아래 맞춤) · title(`type.h2` `fg.strong`) · count(제목 뒤 `space.8`, `fg.tertiary` 500, tabular. 알약 · 배지가 아니라 글자) · description(`type.label` `fg.secondary`) · action(오른쪽, 단추 하나) · body(children이 있을 때).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `title` | `ReactNode` |  | 필수 | 구역 제목 |
| `count` | `number` |  |  | 건수(제목 뒤 흐린 글자) |
| `countLabel` | `string` |  |  | 건수 글자(단위가 건이 아닐 때) |
| `description` | `ReactNode` |  |  | 제목 아래 설명 |
| `action` | `ReactNode` |  |  | 오른쪽 동작 |
| `headingLevel` | `2 \| 3 \| 4` |  |  | 제목 단계(없으면 문맥: 화면 h2) |
| `children` | `ReactNode` |  |  | 아래 내용(안 카드 제목이 한 단계 아래) |

## Variants

children 유무(묶음을 감쌀 때 · 제목만). count(숫자 → "12건") · countLabel(단위가 건이 아닐 때 "8명").

## States

지원 상태: `default`

default.

## 동작

children을 주면 그 묶음을 감싸고 안 카드의 제목 단계를 한 단계 내린다(SectionHeader h2 → 안 Card h3). 제목 단계는 headingLevel(2 · 3 · 4), 없으면 문맥(화면 바로 아래 h2). 크기는 단계와 관계없이 `type.h2`다(화면 h1 28 > 구역 제목 > 카드 제목 `type.h3`).

## 접근성

제목은 제목 요소(h2 기본). 건수는 제목 안 글자라 "이번 달 기한 12건"으로 함께 읽는다. 랜드마크를 만들지 않는다(같은 이름 구역이 겹치지 않게).

## 밀도

밀도와 관계없이 같다. 머리와 내용 사이 `space.12`.

## 플랫폼 차이

없음.

## 금지 사항

구역 제목을 Card 안 큰 제목 · 카드 밖 작은 라벨 · 색 글자로 섞어 쓰기 · 건수를 알약 · 색 배지로 · 동작 둘 이상(→ 더 보기는 화면으로) · 제목 앞 색 막대.

## 예시

### 카드 묶음 위

구역 제목 · 건수 · 설명 · 동작 하나. 묶음을 감싸면 안 카드 제목이 한 단계 아래(h3)가 된다

```tsx
import { Button, Card, SectionHeader } from '@terracelab/trellis-react';

const grid = {
  display: 'grid',
  gap: 'var(--tl-space-16)',
  gridTemplateColumns: 'repeat(auto-fit, minmax(calc(var(--tl-space-64) * 4), 1fr))',
} as const;

function Default() {
  return (
    <SectionHeader
      title="이번 달 기한"
      count={12}
      description="11월 신고 · 납부 · 갱신"
      action={
        <Button size="sm" variant="ghost" iconEnd="chevron-right">
          전체 보기
        </Button>
      }
    >
      <div style={grid}>
        <Card title="Operations" subtitle="4건">
          계약 갱신 · 인증 연장
        </Card>
        <Card title="Numbers" subtitle="5건">
          원천세 · 부가세 예정신고
        </Card>
        <Card title="Employees" subtitle="3건">
          4대보험 취득신고
        </Card>
      </div>
    </SectionHeader>
  );
}
```

### 제목만

표 위에 놓는 짧은 머리. 단위가 건이 아니면 countLabel

```tsx
import { SectionHeader } from '@terracelab/trellis-react';

const grid = {
  display: 'grid',
  gap: 'var(--tl-space-16)',
  gridTemplateColumns: 'repeat(auto-fit, minmax(calc(var(--tl-space-64) * 4), 1fr))',
} as const;

function Plain() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-24)' }}>
      <SectionHeader title="구성원" countLabel="8명" />
      <SectionHeader title="참고 자료" description="지난 분기 보고서와 규정" />
    </div>
  );
}
```
