# @terracelab/trellis-icons

Icons for Trellis, TerraceLab's design system for Korean business software. 173 UI icons and 36 module tile illustrations (SVG, sprite and manifest).

Trellis(트렐리스)의 아이콘입니다. UI 아이콘 173개와 업무 모듈 타일 일러스트 36개가 들어 있습니다. 외부 요청 없이 패키지 안의 파일만 씁니다.

## 설치

```bash
pnpm add @terracelab/trellis-icons
```

`@terracelab/trellis-react`를 설치하면 함께 들어옵니다. React 앱에서는 이 패키지를 직접 부르지 않고 `Icon` · `ModuleIcon` 컴포넌트를 씁니다.

```tsx
import { Icon, ModuleIcon } from '@terracelab/trellis-react';

<Icon name="plus" size={16} />;
```

## 쓰기

```ts
import { ICON_NAMES, uiIcons } from '@terracelab/trellis-icons';
import { moduleTiles } from '@terracelab/trellis-icons/module-tiles';
```

타일 SVG 파일은 `@terracelab/trellis-icons/module-tiles/<id>.svg`로 가져옵니다.

## 문서

- 모듈과 타일: https://trellis.terracelab.co.kr/docs/foundations/modules/
- 소스: https://github.com/terracelab/trellis

## 라이선스

Apache-2.0. UI 아이콘은 Lucide(ISC)의 경로에서 만들었습니다(`LICENSE-LUCIDE.txt`).
