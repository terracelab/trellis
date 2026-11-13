# Button

> `@terracelab/trellis-react` · CSS `.tl-button` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { Button } from '@terracelab/trellis-react';
```

## 용도

동작을 실행한다. 화면에서 primary는 하나다(저장 · 발행 · 결재 요청). 이동은 링크로.

## 해부(Anatomy)

root(`tl-button`, 높이 `density.control-height-*`, 반경 `radius.md`) · icon(16) · label(600. 글자 크기 xs · sm `type.caption` 12, md `type.label` 13, lg · xl `type.body` 14) · spinner(loading).
primary는 `brand.default` 바탕 + `brand.onBrand` 글자, secondary는 `bg.surface` + `border.default`, ghost는 투명, danger는 `status.danger.default` + `status.danger.on`.

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `"secondary"` |  | 역할 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `"md"` |  | 높이(밀도 토큰) |
| `icon` | `IconName` |  |  | 앞 아이콘 |
| `iconEnd` | `IconName` |  |  | 뒤 아이콘 |
| `loading` | `boolean` | `false` |  | 진행 중(누를 수 없고 스피너) |
| `disabled` | `boolean` | `false` |  | 비활성 |
| `disabledReason` | `string` |  |  | 비활성 이유(disabled와 함께. 포커스 유지 · 툴팁 · aria-describedby) |
| `fullWidth` | `boolean` | `false` |  | 부모 폭 전체 |
| `type` | `'button' \| 'submit' \| 'reset'` | `"button"` |  | 폼 동작 |
| `onPress` | `() => void` |  |  | 눌렀을 때 |
| `children` | `ReactNode` |  |  | 라벨 |

## Variants

variant 4 × size 5(xs · sm · md · lg · xl).

## States

지원 상태: `default` · `hover` · `active` · `focus` · `disabled` · `loading`

default · hover(`brand.hover` · `bg.canvas`) · active(`brand.active` · `bg.sunken`) · focus(링) · disabled(`bg.sunken` + `fg.disabled`) · loading(스피너, 폭 유지).

## 동작

loading이면 누를 수 없고 `aria-busy`. 라벨 폭은 그대로 둬 버튼이 줄어들지 않는다. loading · disabled인 submit 단추는 폼을 보내지 않는다.

비활성 이유(disabledReason): disabled와 함께 주면 같은 비활성 모양으로 그리되 포커스가 닿는다. 가리키거나 키보드로 포커스하면 이유가 Trellis Tooltip으로 뜬다. 눌러도 onPress를 부르지 않는다. 권한 없음 · 마감 지남처럼 사용자가 화면만 보고는 모르는 이유에 쓴다. disabled 없이 주면 무시한다.

## 접근성

`<button type>`. 아이콘만 있는 버튼은 IconButton. Enter · Space. disabledReason이 있으면 native `disabled` 대신 `aria-disabled="true"`라 Tab 순서에 남고, 이유는 숨은 글자(`hidden`)를 `aria-describedby`로 이어 이름 뒤 설명으로 읽힌다. 툴팁은 같은 글자를 보이는 것뿐이다.

## 밀도

xs · sm · md · lg · xl = `density.control-height-*`(compact · comfortable 26 · 30 · 36 · 42 · 48, touch 44 · 44 · 48 · 56 · 56). 좌우 여백 xs `space.6` · sm `space.8` · md `space.12` · lg `space.16` · xl `space.20`.

## 플랫폼 차이

네이티브는 Pressable, hover 없음.

## 금지 사항

한 화면에 primary 두 개 · 확인 대화상자의 "예 / 확인"(결과를 말하는 라벨로) · 링크 대신 버튼으로 이동 · 권한 · 마감 때문에 막힌 동작을 이유 없이 비활성으로 두기(disabledReason) → 리뷰.

## 예시

### 역할

화면의 주 동작은 primary 하나, 되돌릴 수 없는 동작은 danger

```tsx
import { Button } from '@terracelab/trellis-react';

function Variants() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-8)', flexWrap: 'wrap' }}>
      <Button variant="primary" icon="send">
        발행
      </Button>
      <Button icon="save">임시 저장</Button>
      <Button variant="ghost" icon="printer">
        인쇄
      </Button>
      <Button variant="danger" icon="trash-2">
        삭제
      </Button>
    </div>
  );
}
```

### 상태

진행 중 · 비활성 · 크기

```tsx
import { Button } from '@terracelab/trellis-react';

function States() {
  return (
    <div
      style={{ display: 'flex', gap: 'var(--tl-space-8)', alignItems: 'center', flexWrap: 'wrap' }}
    >
      <Button variant="primary" loading>
        발행
      </Button>
      <Button disabled>엑셀 다운로드</Button>
      <Button size="sm">작게</Button>
      <Button size="lg" iconEnd="chevron-down">
        더 보기
      </Button>
    </div>
  );
}
```

### 비활성 이유

권한이 없거나 마감이 지난 동작. 포커스가 닿고 이유를 툴팁으로 알린다

```tsx
import { Button } from '@terracelab/trellis-react';

function DisabledReason() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-8)', flexWrap: 'wrap' }}>
      <Button variant="primary" disabled disabledReason="결재 권한이 없습니다">
        승인
      </Button>
      <Button disabled disabledReason="11월 마감이 끝나 수정할 수 없습니다" icon="pencil">
        전표 수정
      </Button>
    </div>
  );
}
```
