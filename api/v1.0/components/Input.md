# Input

> `@terracelab/trellis-react` · CSS `.tl-input` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { Input } from '@terracelab/trellis-react';
```

## 용도

한 줄 글자 입력. 금액은 AmountInput, 수량은 QuantityInput, 번호 형식은 MaskedInput, 코드 검색은 CodeSearch.

## 해부(Anatomy)

root(`bg.surface`, `border.default`, `radius.md`, 높이 `density.control-height-*`) · icon · prefix · control(mono면 `font.family.mono`, 굵기 · 자간은 `type.mono`) · suffix(`fg.tertiary`) · clear.

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `value` | `string` |  |  | 값(제어) |
| `defaultValue` | `string` |  |  | 처음 값(비제어) |
| `onChange` | `(value: string) => void` |  |  | 값이 바뀔 때 |
| `placeholder` | `string` |  |  | 예시 값 |
| `type` | `'text' \| 'search' \| 'email' \| 'tel' \| 'password' \| 'url'` | `"text"` |  | 입력 종류 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `"md"` |  | 높이 |
| `icon` | `IconName` |  |  | 앞 아이콘 |
| `prefix` | `string` |  |  | 앞 글자 |
| `suffix` | `string` |  |  | 뒤 단위 |
| `align` | `'left' \| 'right'` | `"left"` |  | 글자 정렬 |
| `mono` | `boolean` | `false` |  | 고정폭 글꼴(코드 · 번호 입력) |
| `clearable` | `boolean` | `false` |  | 지우기 버튼 |
| `disabled` | `boolean` | `false` |  | 비활성 |
| `readOnly` | `boolean` | `false` |  | 읽기 전용 |
| `invalid` | `boolean` | `false` |  | 오류(Field error면 자동) |
| `required` | `boolean` | `false` |  | 필수 |
| `name` | `string` |  |  | 폼 이름 |
| `maxLength` | `number` |  |  | 최대 글자 수 |
| `inputMode` | `'text' \| 'numeric' \| 'decimal' \| 'tel' \| 'email' \| 'search'` |  |  | 모바일 키보드 |
| `autoComplete` | `string` |  |  | 자동 완성 |
| `onEnter` | `() => void` |  |  | Enter |
| `label` | `string` |  |  | Field 밖 접근성 이름 |

## Variants

size 5(xs · sm · md · lg · xl), icon · prefix · suffix · clearable · mono.

## States

지원 상태: `default` · `hover` · `focus` · `disabled` · `error`

default · hover(`border.strong`) · focus(`border.focus` + 링) · disabled(`bg.sunken`) · error(`status.danger.default` 테두리).

## 동작

clearable이면 값이 있을 때 지우기 버튼, Escape로도 지운다. `type="search"`에 clearable을 함께 주면 브라우저가 그리는 지우기 단추(Chromium · Safari)를 숨겨 지우기 단추가 하나만 보인다. Enter는 onEnter. mono면 글꼴만 고정폭으로 바뀌고 글자 크기는 입력 칸 규칙을 따른다(touch 16). 품목 코드 · 계좌번호 · 시각처럼 자리를 맞춰 보는 값에 쓴다.

## 접근성

Field 안에서는 라벨 · 설명 · 오류가 자동 연결(`aria-describedby` · `aria-invalid`).

## 밀도

높이 `density.control-height-*`(compact · comfortable 26 · 30 · 36 · 42 · 48, touch 44 · 44 · 48 · 56 · 56). 입력 글자는 xs~md `density.input-font-size`, lg · xl은 그것과 `type.body` 중 큰 값이다(touch 16은 그대로).

## 플랫폼 차이

네이티브는 TextInput, clear는 clearButtonMode.

## 금지 사항

placeholder를 라벨 대신 · 숫자를 왼쪽 정렬 · 이름 · 메모 같은 글에 mono → 리뷰.

## 예시

### 검색 · 단위 · 오류

숫자는 오른쪽 정렬

```tsx
import { Input } from '@terracelab/trellis-react';

function Kinds() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-8)',
        maxWidth: 'calc(var(--tl-space-64) * 5)',
      }}
    >
      <Input
        type="search"
        icon="search"
        label="검색"
        placeholder="거래처 · 품목 · 문서 번호"
        clearable
        defaultValue="한빛"
      />
      <Input align="right" suffix="EA" label="수량" inputMode="numeric" defaultValue="1,240" />
      <Input invalid label="사업자등록번호" defaultValue="123-45-678" />
      <Input disabled label="문서 번호" defaultValue="자동 채번" />
    </div>
  );
}
```

### 코드 입력

품목 코드 · 계좌번호처럼 글자 수를 맞춰 보는 값은 고정폭(mono)

```tsx
import { Input } from '@terracelab/trellis-react';

function Mono() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-8)',
        maxWidth: 'calc(var(--tl-space-64) * 5)',
      }}
    >
      <Input mono label="품목 코드" defaultValue="FD-2611-0042" />
      <Input mono label="계좌번호" inputMode="numeric" defaultValue="110-482-118204" />
    </div>
  );
}
```
