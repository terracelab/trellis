# ModuleIcon

> `@terracelab/trellis-react` · CSS `.tl-module-icon` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { ModuleIcon } from '@terracelab/trellis-react';
```

## 용도

업무 모듈(회계 · 메일 · 재고 …) 하나를 앱 아이콘 타일로 보여 줄 때 쓴다. 런처 · 즐겨찾기 · 알림 카드 · 사이드바 머리에 쓰고, 일반 UI 아이콘은 Icon.

## 해부(Anatomy)

root(정사각, `size.module-icon-32/40/48`, 반경 22%) · tile(일러스트 SVG, `@terracelab/trellis-icons/module-tiles`) 또는 fallback(`color.module.<group>.gradient-from → gradient-to` 세로 그라데이션 + 모듈 Lucide 아이콘 `fg.inverse`, 타일의 56%).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `module` | `ModuleId` |  | 필수 | 모듈 id |
| `size` | `32 \| 40 \| 48` | `40` |  | 한 변(size.module-icon 토큰) |
| `label` | `string` |  |  | 접근성 이름(기본 모듈 라벨) |
| `decorative` | `boolean` | `false` |  | 장식(옆에 모듈 이름이 있을 때) |

## Variants

size 3 × 그림 2(일러스트 타일 · 생성형 폴백). 어떤 그림을 쓸지는 모듈 id가 정한다.

## States

지원 상태: `default`

default.

## 동작

`moduleTileByModule[module]`이 있으면 그 일러스트를, 없으면 modules.json의 그룹 색과 아이콘으로 폴백을 그린다(D-36). 일러스트의 SVG id는 인스턴스마다 접두를 붙여 한 화면에 같은 모듈이 여러 번 있어도 그라데이션이 겹치지 않는다. 모르는 모듈 id면 회색 격자 아이콘을 그리고 개발 모드에서 경고한다.

## 접근성

`role="img"` + `aria-label`(기본 modules.json 라벨). 옆에 모듈 이름 글자가 있으면 `decorative`로 숨긴다. 일러스트 안의 `<title>`은 지우고 바깥 라벨 하나만 읽힌다.

## 밀도

크기는 밀도와 무관하다. 사이드바 즐겨찾기 32, 알림 카드 40, 런처 48.

## 플랫폼 차이

네이티브는 react-native-svg로 같은 타일을 그린다. props는 같다.

## 금지 사항

타일 안에 카운트 넣기(카운트는 카드 · 배지 쪽) · 그룹 색 대신 임의 색 · 타사 앱 아이콘 → 리뷰.

## 예시

### 일러스트 타일

타일이 있는 모듈은 일러스트를 그린다

```tsx
import { ModuleIcon } from '@terracelab/trellis-react';

function Tiles() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-12)' }}>
      <ModuleIcon module="accounting" />
      <ModuleIcon module="approval" />
      <ModuleIcon module="purchasing" />
      <ModuleIcon module="mail" />
    </div>
  );
}
```

### 생성형 폴백

타일이 없는 모듈은 그룹 색 그라데이션과 라인 아이콘

```tsx
import { ModuleIcon } from '@terracelab/trellis-react';

function Fallback() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-12)' }}>
      <ModuleIcon module="tax" />
      <ModuleIcon module="inventory" />
      <ModuleIcon module="orders" />
      <ModuleIcon module="equipment" />
    </div>
  );
}
```

### 크기

즐겨찾기 32 · 알림 카드 40 · 런처 48

```tsx
import { ModuleIcon } from '@terracelab/trellis-react';

function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-12)', alignItems: 'end' }}>
      <ModuleIcon module="warehouse" size={32} />
      <ModuleIcon module="warehouse" size={40} />
      <ModuleIcon module="warehouse" size={48} />
    </div>
  );
}
```
