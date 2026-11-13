# PageHeader

> `@terracelab/trellis-react` · CSS `.tl-page-header` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { PageHeader } from '@terracelab/trellis-react';
```

## 용도

화면 맨 위의 이름 · 위치 · 동작. 모든 업무 화면이 하나씩 가진다.

## 해부(Anatomy)

breadcrumbs(`type.caption` fg.tertiary, `/` 구분) · back(IconButton) · title(`type.h1` 28 · 700) · meta · description(`fg.secondary`) · actions(오른쪽) · tabs(아래). PR-26: actions 안 크기를 정하지 않은(md) Button · IconButton은 `density.control-height-lg`(화면 행동은 한 단계 크게). 화면 행동은 라벨 단추가 기본이고 아이콘 전용은 3차 행동에만.

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `title` | `string` |  | 필수 | 화면 이름 |
| `description` | `string` |  |  | 설명 한 문장 |
| `breadcrumbs` | `Crumb[]` |  |  | 위치 |
| `actions` | `ReactNode` |  |  | 오른쪽 동작 |
| `meta` | `ReactNode` |  |  | 제목 옆 상태(형제가 있으면 설명 줄) |
| `onBack` | `() => void` |  |  | 뒤로 |
| `tabs` | `ReactNode` |  |  | 아래 탭 |
| `siblings` | `PageSibling[]` |  |  | 제목 줄 탭(같은 묶음 화면 2~4개) |
| `onSiblingPress` | `(href: string) => void` |  |  | 제목 줄 탭을 누를 때 |

## Variants

breadcrumbs · back · tabs 유무. siblings(PR-27): 같은 묶음 화면 2~4개를 나란히 둔다. 지금 화면만 h1(`type.h1`, `fg.primary`)이고 나머지는 한 단계 작은 `type.h3`(`fg.tertiary`, 기준선은 h1에 맞춤)이다. 가리키면 `fg.secondary` + 밑줄 `border.width.2`로 누를 쪽이 보인다(D-141 확정). 형제 사이는 `space.32`이고 한가운데에 세로 구분선(`border.strong`, 줄 높이의 절반)을 둔다. 이름 안 가운뎃점(법인 · 임원 · 주주)과 형제 사이가 섞여 한 제목처럼 읽히지 않게 하려는 것이다. 줄이 넘치면 새 줄 맨 앞 구분선은 감춘다. 제목 아래 Tabs와 함께 쓰면 큰 묶음(제목 줄) → 작은 묶음(탭) 두 단계가 된다.

## States

지원 상태: `default`

default.

## 동작

1024 미만에서는 actions가 제목 아래로 내려간다. 형제(siblings)가 있으면 제목 줄은 형제만 두고 meta는 설명 줄(description 옆)로 내린다(PR-38). 휴대폰(폭 `breakpoint.sm` 미만)에서 형제 줄은 줄바꿈하지 않는다: 한 줄 가로 스크롤(스냅)이고 지금 화면이 보이게 그 줄만 옆으로 옮긴다(페이지 스크롤은 그대로). 넘치는 오른쪽 끝은 흐려진다. 휴대폰(폭 `breakpoint.sm` 미만)과 touch 밀도에서는 뒤로 단추가 엄지로 누르는 큰 크기가 된다. 크기는 `density.control-height-lg`이고 `size.touch.min`(44)보다 작아지지 않는다. touch에서는 56이다. 아이콘은 20으로 키우고, 제목이 한 줄이면 단추 가운데 높이에 맞춘다.

## 접근성

제목은 `<h1>`, 위치는 `<nav aria-label="위치">`.

## 밀도

아래 여백 `density.gutter`. 뒤로 단추는 넓은 화면 `density.control-height-md`, 휴대폰 · touch는 max(`size.touch.min`, `density.control-height-lg`).

## 플랫폼 차이

네이티브는 내비게이션 바가 대신한다.

## 금지 사항

인사말 제목(content.md §5) · primary 두 개.

## 예시

### 목록 화면

위치 · 이름 · 동작

```tsx
import { Button, PageHeader } from '@terracelab/trellis-react';

function List() {
  return (
    <PageHeader
      breadcrumbs={[{ label: '세무' }, { label: '세금계산서' }]}
      title="매출 세금계산서"
      description="발행 · 국세청 전송 · 취소를 한 곳에서 처리합니다"
      actions={
        <>
          <Button icon="download">엑셀 다운로드</Button>
          <Button variant="primary" icon="plus">
            발행
          </Button>
        </>
      }
    />
  );
}
```

### 상세 화면

뒤로 · 상태

```tsx
import { Badge, Button, PageHeader } from '@terracelab/trellis-react';

function Detail() {
  return (
    <PageHeader
      onBack={() => undefined}
      title="PO-2611-0042"
      meta={<Badge tone="info">입고 예정</Badge>}
      description="대양상사 · USD 48,200.00 · 2026-11-06 발주"
      actions={<Button variant="primary">입고 처리</Button>}
    />
  );
}
```

### 제목 줄 탭

지금 화면은 h1, 같은 묶음 다른 화면은 한 단계 작게 나란히(사이 구분선, 가리키면 밑줄, D-141). meta는 설명 줄로 내려가고, 휴대폰은 한 줄 가로 스크롤(PR-27 · PR-38)

```tsx
import { Badge, Button, PageHeader, Tabs } from '@terracelab/trellis-react';

function Siblings() {
  return (
    <PageHeader
      title="연차 · 근태"
      siblings={[
        { label: '직원 · 외주', href: '#people' },
        { label: '급여', href: '#payroll' },
        { label: '연차 · 근태', href: '#leave', current: true },
        { label: '문서함', href: '#docs' },
      ]}
      onSiblingPress={() => undefined}
      description="11월 6일(금) 기준 · 테라스랩"
      meta={<Badge tone="warning">승인 대기 2건</Badge>}
      actions={<Button icon="upload">연차 사용 내역 올리기</Button>}
      tabs={
        <Tabs
          items={[
            { value: 'own', label: '휴가 보유 현황' },
            { value: 'used', label: '휴가 사용 내역' },
            { value: 'month', label: '월별 연차 사용' },
            { value: 'promo', label: '연차 촉진' },
          ]}
          value="month"
        />
      }
    />
  );
}
```
