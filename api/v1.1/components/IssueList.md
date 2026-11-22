# IssueList

> `@terracelab/trellis-react` · CSS `.tl-issue-list` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { IssueList } from '@terracelab/trellis-react';
```

## 용도

저장 · 결재 요청 전에 검증이 찾은 오류 · 경고를 한곳에 모아 보여 줄 때 쓴다(표 편집 · 전표 입력 · 일괄 등록). 항목을 누르면 그 행 · 칸으로 간다. 폼 제출 오류(칸 이름 + 문장, 칸으로 포커스)는 ErrorSummary, 칸 하나의 오류는 Field, 저장 결과는 Toast · Banner.

## 해부(Anatomy)

root(`bg.surface`) · head(제목 `type.label` 600 `fg.primary` + 건수 "오류 2 · 경고 3" `type.caption` `fg.secondary`) · list(최대 높이를 넘으면 목록만 스크롤) · item(아이콘 · 꼬리표 · 제목 · 문장 · 자세히, 항목 사이 `border.divider`) · icon(오류 circle-x `status.danger.default` · 경고 triangle-alert `status.warning.default`, 16) · tag(`type.caption` `fg.secondary`, 1px `border.default` 테두리 `radius.sm`) · title(`density.body-font-size` 600 `fg.primary`) · message(`type.caption` `fg.secondary`) · detail(ghost sm 단추) · empty(`fg.tertiary` 한 줄).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `items` | `{ id: string; level: 'error' \| 'warning'; tag?: string; title: string; message?: string }[]` |  | 필수 | 검증 결과(오류가 먼저) |
| `title` | `string` |  |  | 머리 제목 |
| `onSelect` | `(id: string) => void` |  |  | 항목을 누를 때(그 행으로 이동) |
| `onDetail` | `(id: string) => void` |  |  | 자세히 단추 |
| `loading` | `boolean` | `false` |  | 검증 중(Skeleton) |
| `empty` | `string` |  |  | 항목이 없을 때 문구 |
| `maxHeight` | `string` |  |  | 목록 최대 높이(CSS 길이) |

## Variants

onSelect가 있으면 항목 본문이 단추(누르면 그 행으로), 없으면 글자. onDetail이 있으면 항목마다 "자세히" 단추. 단계는 아이콘 모양으로 나눈다(원 안 × · 세모 안 !). 바탕색 · 왼쪽 띠는 쓰지 않는다(D-56 · D-57).

## States

지원 상태: `default` · `hover` · `focus` · `loading`

default · hover(누를 수 있는 항목 바탕 `bg.sunken`, `duration.fast`) · focus(항목 단추 포커스 링) · loading(Skeleton list 3줄, `aria-busy`). active · disabled · error는 해당 없음(목록 자체가 오류를 보이는 부품이다).

## 동작

오류가 먼저, 그다음 경고다. 같은 단계 안에서는 받은 순서(화면의 행 순서)를 지킨다. 항목을 누르면 `onSelect(id)`를 부르고, 화면이 그 행으로 스크롤 · 포커스를 옮긴다(DataGrid `scrollToKey` 등). "자세히"는 `onDetail(id)`(규칙 설명 서랍 · 팝오버). 항목이 없으면 empty 문구(기본 "확인할 항목이 없습니다"). maxHeight를 넘으면 목록만 스크롤하고 머리는 남는다. 항목별 걸러 보기(오류만 · 경고만)는 화면이 SegmentedControl로 붙인다.

## 접근성

root는 `role="group"`, 이름은 title(기본 "확인할 항목"). 목록은 `ul`. 단계는 색만이 아니라 아이콘 모양과 숨은 글자("오류 · 경고")로도 알린다. 건수 글자는 `aria-live="polite"`라 다시 검증하면 바뀐 건수가 읽힌다. 항목 단추 이름 = 단계 + 꼬리표 + 제목 + 문장. "자세히" 단추 이름 = "{제목} 자세히". 단추가 없는 목록이 스크롤되면 목록이 `tabIndex=0` 영역이 되어 키보드로 스크롤한다.

## 밀도

항목은 `density.row-height`(compact 36 · comfortable 40 · touch 48)를 최소 높이로 쓰고 위아래 여백은 `space.8`이다. 글자는 `density.body-font-size`.

## 플랫폼 차이

네이티브는 FlatList, 항목은 Pressable. "자세히"는 길게 누르기가 아니라 같은 단추다.

## 금지 사항

오류 · 경고를 색 바탕 카드로 나누기 · 항목 왼쪽 색 띠(D-57) · 색만으로 단계 구분 · 폼 제출 오류에 쓰기(ErrorSummary) · 경고를 오류보다 위에 → 리뷰.

## 예시

### 저장 전

오류가 먼저, 그다음 경고. 항목을 누르면 그 행으로 간다

```tsx
import { IssueList } from '@terracelab/trellis-react';

const ISSUES = [
  {
    id: 'w1',
    level: 'warning' as const,
    tag: '5행',
    title: '단가가 지난 발주보다 18% 높습니다',
    message: '거래처 단가표를 확인하세요',
  },
  {
    id: 'e1',
    level: 'error' as const,
    tag: '3행',
    title: '단가가 0원입니다',
    message: '단가를 넣거나 줄을 삭제하세요',
  },
  { id: 'e2', level: 'error' as const, tag: '거래처', title: '사업자등록번호가 없습니다' },
  { id: 'w2', level: 'warning' as const, tag: '7행', title: '유통기한이 30일 남았습니다' },
];

function BeforeSave() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <IssueList title="저장 전 확인" items={ISSUES} onSelect={() => {}} />
    </div>
  );
}
```

### 자세히

항목마다 규칙 설명을 여는 자세히 단추

```tsx
import { IssueList } from '@terracelab/trellis-react';

const ISSUES = [
  {
    id: 'w1',
    level: 'warning' as const,
    tag: '5행',
    title: '단가가 지난 발주보다 18% 높습니다',
    message: '거래처 단가표를 확인하세요',
  },
  {
    id: 'e1',
    level: 'error' as const,
    tag: '3행',
    title: '단가가 0원입니다',
    message: '단가를 넣거나 줄을 삭제하세요',
  },
  { id: 'e2', level: 'error' as const, tag: '거래처', title: '사업자등록번호가 없습니다' },
  { id: 'w2', level: 'warning' as const, tag: '7행', title: '유통기한이 30일 남았습니다' },
];

function WithDetail() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <IssueList items={ISSUES.slice(0, 2)} onSelect={() => {}} onDetail={() => {}} />
    </div>
  );
}
```

### 상태

검증 중은 Skeleton 목록, 항목이 없으면 문구 한 줄, 길면 maxHeight 안에서 스크롤

```tsx
import { IssueList } from '@terracelab/trellis-react';

const ISSUES = [
  {
    id: 'w1',
    level: 'warning' as const,
    tag: '5행',
    title: '단가가 지난 발주보다 18% 높습니다',
    message: '거래처 단가표를 확인하세요',
  },
  {
    id: 'e1',
    level: 'error' as const,
    tag: '3행',
    title: '단가가 0원입니다',
    message: '단가를 넣거나 줄을 삭제하세요',
  },
  { id: 'e2', level: 'error' as const, tag: '거래처', title: '사업자등록번호가 없습니다' },
  { id: 'w2', level: 'warning' as const, tag: '7행', title: '유통기한이 30일 남았습니다' },
];

function States() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(min(100%, calc(var(--tl-space-64) * 4)), 1fr))',
        gap: 'var(--tl-space-24)',
      }}
    >
      <IssueList items={[]} loading />
      <IssueList items={[]} empty="저장할 수 있습니다. 확인할 항목이 없습니다" />
      <IssueList items={ISSUES} maxHeight="calc(var(--tl-space-64) * 2)" />
    </div>
  );
}
```
