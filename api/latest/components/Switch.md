# Switch

> `@terracelab/trellis-react` · CSS `.tl-switch` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { Switch } from '@terracelab/trellis-react';
```

## 용도

누르는 즉시 적용되는 켜기 · 끄기 설정(자동 발행 · 메일 알림). 저장 버튼으로 함께 제출하는 값은 Checkbox.

## 해부(Anatomy)

root · track(`radius.full`, 끔 `fg.tertiary` · 켬 `brand.default`) · thumb(`bg.surface`, `shadow.sm`) · label(`density.body-font-size`) · description(`type.caption`, `fg.tertiary`).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `checked` | `boolean` |  |  | 켬(제어) |
| `defaultChecked` | `boolean` | `false` |  | 처음 켬(비제어) |
| `onChange` | `(checked: boolean) => void` |  |  | 바뀔 때(즉시 적용) |
| `children` | `ReactNode` |  |  | 라벨 |
| `description` | `string` |  |  | 라벨 아래 설명 |
| `disabled` | `boolean` | `false` |  | 비활성 |
| `size` | `'sm' \| 'md' \| 'lg'` | `"md"` |  | 크기(touch 밀도 기본 lg) |
| `name` | `string` |  |  | 폼 이름 |

## Variants

size sm(track 28 × 16) · md(track 32 × 20) · lg(track 48 × 28, thumb 24, 손가락 크기). 라벨 오른쪽 배치 고정.

## States

지원 상태: `default` · `hover` · `focus` · `disabled`

default · hover(끔 track `fg.secondary` · 켬 `brand.hover`) · focus(track 링) · disabled(track `bg.sunken`, 라벨 `fg.disabled`). active · loading · error는 해당 없음(저장 실패는 토스트로 알리고 값을 되돌린다).

## 동작

누르거나 Space · Enter로 바꾼다. 바뀌는 즉시 onChange가 불린다. thumb 이동은 `duration.150`, reduced-motion이면 이동 애니메이션 없음. checked를 주면 제어, defaultChecked면 비제어.

## 접근성

Base UI Switch. `role="switch"` + `aria-checked`. 감싼 `<label>`이 이름, 설명은 `aria-describedby`. 끔 track `fg.tertiary`는 바탕 대비 3:1 이상. 포커스 링은 track에 항상 보인다.

## 밀도

track 크기는 size로 정한다(sm `space.24` + `space.4` × `space.16`, md `space.32` × `space.20`, lg `space.48` × `space.28`). size를 주지 않으면 touch 밀도(`data-density="touch"` · 휴대폰 폭)에서 lg로 그린다. contract 기본값은 md 그대로이고 CSS만 바꾼다(루트 `data-size-auto`). size를 준 스위치는 밀도와 관계없이 그 크기다. track과 라벨 사이 `space.8`.

## 플랫폼 차이

네이티브는 RN Switch에 토큰 색(trackColor · thumbColor)을 넣는다.

## 금지 사항

저장 버튼이 있는 폼 안의 Switch(Checkbox) · "켜기 / 끄기"를 라벨로(무엇을 켜는지 명사로) → 리뷰.

## 예시

### 즉시 적용 설정

켜면 무엇이 되는지를 라벨로

```tsx
import { Switch } from '@terracelab/trellis-react';

function Settings() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-12)' }}>
      <Switch defaultChecked description="매월 25일에 거래처별 세금계산서를 발행합니다">
        세금계산서 자동 발행
      </Switch>
      <Switch>결재 요청 메일 알림</Switch>
      <Switch size="sm" defaultChecked>
        표 줄무늬
      </Switch>
      <Switch disabled>외화 환율 자동 반영</Switch>
    </div>
  );
}
```

### 크기

sm · md · lg. lg(48 × 28)는 손가락 크기이고 touch 밀도에서 size를 주지 않으면 lg로 그린다

```tsx
import { Switch } from '@terracelab/trellis-react';

function Sizes() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-12)' }}>
      <Switch size="sm" defaultChecked>
        표 줄무늬
      </Switch>
      <Switch size="md" defaultChecked>
        결재 요청 메일 알림
      </Switch>
      <Switch size="lg" defaultChecked>
        입고 검수 사진 필수
      </Switch>
    </div>
  );
}
```
