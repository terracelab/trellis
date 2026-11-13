# @terracelab/trellis-react

React components for Trellis, TerraceLab's design system for Korean business software (accounting, electronic approval, purchasing, HR). 121 components with bundled docs for coding agents.

Trellis(트렐리스)의 웹 React 컴포넌트입니다. 기본 컴포넌트 106종과 차트 15종이 들어 있습니다. 표 · 결재선 · 금액 입력 · 달력처럼 한국 업무 화면에 쓰는 부품을 같은 토큰으로 그립니다.

## 설치

```bash
pnpm add @terracelab/trellis-tokens @terracelab/trellis-react
```

React 19가 필요합니다. `@terracelab/trellis-*` 패키지는 모두 같은 버전으로 설치합니다.

## 쓰기

진입 파일에서 CSS를 이 순서로 불러옵니다.

```ts
import '@terracelab/trellis-tokens/fonts.css'; // Pretendard Variable(패키지에 포함, 외부 요청 없음)
import '@terracelab/trellis-tokens/tokens.css'; // --tl-* 변수 · 라이트/다크 · 밀도
import '@terracelab/trellis-react/styles.css'; // 컴포넌트 CSS
```

```html
<html lang="ko" data-theme="light" data-density="compact">
```

```tsx
import { Badge, Button, DataGrid } from '@terracelab/trellis-react';
import { TrendChart } from '@terracelab/trellis-react/charts';

<Button variant="primary" onPress={save}>
  저장
</Button>;
```

- 누름 이벤트는 `onClick`이 아니라 `onPress`입니다.
- 화면의 값은 `--tl-*` 변수로만 씁니다. raw hex · px · 글꼴 이름을 쓰지 않습니다.
- 컴포넌트가 그리는 글자는 한국어가 기본이고 `<TrellisProvider locale="en">`으로 영어가 됩니다.
- 회사 색은 `<TrellisProvider theme={{ brand: '#0B7A5C' }}>` 한 곳에서 바꿉니다.

## 에이전트용 문서

패키지 안에 그 버전의 문서가 들어 있습니다. `@terracelab/trellis-react/docs/llms.txt`에서 시작하고, 컴포넌트마다 `docs/components/<Name>.md`가 있습니다.

## 문서

- 컴포넌트와 가이드: https://trellis.terracelab.co.kr/docs/guide/overview/
- 데모: https://trellis.terracelab.co.kr/demo/
- 소스: https://github.com/terracelab/trellis

화면 블록(복사형 소스)과 서비스용 에이전트 스킬은 npm이 아니라 저장소에 있습니다. git 하위 모듈로 넣어 쓰는 방법은 저장소 README에 있습니다.

## 라이선스

Apache-2.0
