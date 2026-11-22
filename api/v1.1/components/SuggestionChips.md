# SuggestionChips

> `@terracelab/trellis-react` · CSS `.tl-suggestion-chips` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { SuggestionChips } from '@terracelab/trellis-react';
```

## 용도

추천 질문 · 자주 찾는 글자를 누를 수 있는 알약 단추 줄로 보여 줄 때 쓴다. Composer(`suggestions`)와 CommandPalette(빠른 질문)가 같은 부품을 쓴다. 값을 하나 고르는 컨트롤은 SegmentedControl, 걸러 보기 조건은 FilterBar.

## 해부(Anatomy)

root(`tl-suggestion-chips`, `role="group"`, 감싸는 줄, 사이 `space.8`, 둘레 여백은 놓는 곳이 정한다) · chip(`button`, 높이 `density.control-height-sm`, 좌우 `space.12`, `border.default` 1px · `radius.full` · 바탕 없음, 글자 `type.caption` `fg.secondary`, 넘치면 말줄임).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `items` | `string[]` |  | 필수 | 추천 질문 |
| `onSelect` | `(text: string) => void` |  | 필수 | 고를 때 |
| `label` | `string` |  |  | 묶음 이름(기본 추천 질문) |
| `selected` | `string` |  |  | 지금 입력과 같은 항목(눌린 모양) |
| `disabled` | `boolean` | `false` |  | 비활성 |

## Variants

변형 prop이 없다. `selected`를 주면 칩이 누름 단추(`aria-pressed`)가 되고 같은 글의 칩이 눌린 모양(`border.strong` · `fg.primary` · 600)이다.

## States

지원 상태: `default` · `hover` · `focus` · `disabled`

default · hover(`border.strong` · `bg.sunken` · `fg.primary`) · focus(포커스 링) · disabled(`border.divider` · `fg.disabled`, 누를 수 없음, root `data-state="disabled"`). active · loading · error는 해당 없음.

## 동작

- 누르면 `onSelect(text)`. 입력 칸에 넣을지 바로 보낼지는 쓰는 쪽이 정한다. Composer · CommandPalette는 넣기만 하고 커서를 입력 칸에 둔다(고쳐서 보낼 수 있게, 에이전트에게 사람이 확인하지 않은 질문이 가지 않게).
- `selected`: 대소문자 · 띄어쓰기를 무시하고 같은 글이면 눌린 모양이다(CommandPalette의 걸러 찾기와 같은 기준).
- 항목이 없으면 아무것도 그리지 않는다.

| 키 | 동작 |
| --- | --- |
| Tab | 칩을 차례로 |
| Enter · Space | 고르기 |

## 접근성

root는 `role="group"` + 이름(label, 기본 "추천 질문")이다. 칩 글자가 단추 이름이다. 눌린 모양은 색이 아니라 `aria-pressed`와 굵기로도 보인다. 글자 대비 `fg.secondary` 4.5:1 이상, 포커스 링은 항상 보인다. 휴대폰(touch 밀도)에서 칩 높이는 44다.

## 밀도

칩 높이 `density.control-height-sm`(compact · comfortable 30, touch 44). 글자 크기 · 사이 간격은 밀도와 관계없다.

## 플랫폼 차이

네이티브는 가로로 감싸는 Pressable 줄(넘치면 가로 스크롤)이다. props는 같다.

## 금지 사항

칩을 누르자마자 에이전트에게 보내기(Composer 안에서) · 칩마다 다른 색 · 아이콘 · 이모지 꾸밈 · 다섯 개 넘게 늘어놓기. 리뷰로 막는다.

## 예시

### 추천 질문

대화를 시작할 때 입력 위에 둔다. 누르면 그 글을 입력 칸에 넣는다

```tsx
import { SuggestionChips } from '@terracelab/trellis-react';

const QUESTIONS = [
  '11월 미지급금 현황',
  '이번 주 입고 예정',
  '부가세 예정신고 일정',
  '연차 사용 현황',
];

function Questions() {
  return <SuggestionChips items={QUESTIONS} onSelect={() => {}} />;
}
```

### 지금 입력과 같은 항목

selected를 주면 같은 글의 칩이 눌린 모양이다(검색 · 이동의 자주 찾는 것)

```tsx
import { SuggestionChips } from '@terracelab/trellis-react';

function Selected() {
  return (
    <SuggestionChips
      label="자주 찾는 것"
      items={['급여명세서', '전표 입력', '거래처 등록']}
      selected="전표 입력"
      onSelect={() => {}}
    />
  );
}
```
