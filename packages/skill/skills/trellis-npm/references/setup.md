# 서비스에 Trellis 넣기

`doctor`가 "설치되지 않음" · "CSS import가 없다" · "글꼴이 걸려 있지 않다"를 내면 이 순서로 넣는다. doctor가 통과하면 읽지 않아도 된다.

## 1. 패키지

서비스가 쓰는 패키지 관리자로 설치한다. doctor가 그 관리자의 명령을 알려 준다.

```bash
pnpm add @terracelab/trellis-react @terracelab/trellis-tokens @terracelab/trellis-contracts
```

- 셋은 같은 버전이어야 한다. `@terracelab/trellis-icons`는 react 패키지를 따라 들어온다.
- React 19가 필요하다(`react` · `react-dom`). 18이면 먼저 올린다. 올릴 수 없는 서비스면 멈추고 사람에게 알린다.
- 패키지는 ESM만 낸다. Vite · Next.js처럼 ESM을 읽는 번들러에서 쓴다.
- 이 도구를 `devDependencies`에 같은 버전으로 넣어 두면 `npx @terracelab/trellis-skill`이 그 버전을 쓴다.

## 2. CSS

앱 진입 파일 맨 위에 이 순서로 둔다. Vite는 `src/main.tsx`, Next.js는 `app/layout.tsx`다. 앱의 CSS는 이 세 줄 뒤에 온다.

```ts
import '@terracelab/trellis-tokens/fonts.css'; // Pretendard(패키지에 들어 있다. 바깥 요청 없음)
import '@terracelab/trellis-tokens/tokens.css'; // --tl-* 변수, 라이트 · 다크, 밀도
import '@terracelab/trellis-react/styles.css'; // 컴포넌트 CSS
```

## 3. 앱 기본 CSS

컴포넌트는 글꼴과 글자색을 물려받는다. 앱 CSS에 아래를 둔다. 없으면 브라우저 기본 글꼴로 보인다.

```css
html,
body,
#root {
  height: 100%;
  margin: 0;
}

body {
  background: var(--tl-color-bg-canvas);
  color: var(--tl-color-fg-primary);
  font-family: var(--tl-font-family-sans);
  -webkit-font-smoothing: antialiased;
}
```

새로 만든 앱이면 틀이 넣어 둔 기본 CSS를 지운다. Vite의 `src/index.css` · `src/App.css`가 그렇다. 글꼴 · 색 · 가운데 정렬을 정해 두어 Trellis 화면을 덮는다. doctor가 그런 파일을 `!` 경고로 알려 준다.

원래 있던 앱에 화면 하나만 더할 때는 전역 CSS를 건드리지 않는다. 그 화면의 바깥 요소에 위 `body`의 세 줄(바탕 · 글자색 · 글꼴)을 건다.

## 4. 테마 · 밀도 · 문구

```html
<html lang="ko" data-theme="light" data-density="compact">
```

- 속성이 없으면 라이트 · compact다. 다크는 `data-theme="dark"`다. 숫자가 큰 대시보드 화면은 `data-density="comfortable"`을 써도 된다.
- `TrellisProvider`는 없어도 한국어 · 기본 테마로 돈다. 영어 문구(`locale="en"`)나 회사 색(`theme={{ brand: '#RRGGBB' }}`)이 필요하면 앱 맨 바깥에 한 번 둔다.
- Next.js App Router에서는 훅이나 이벤트를 쓰는 화면 파일 맨 위에 `'use client'`를 둔다. 시작 화면에는 들어 있다.
- Vite 빌드는 `'use client'` 줄마다 `MODULE_LEVEL_DIRECTIVE` 경고를 낸다. 의존 패키지에서 300건쯤 나온다. 동작에는 영향이 없으니 고치려 하지 않는다.

## 5. 확인

```bash
npx @terracelab/trellis-skill doctor
```

`✗`가 없으면 화면을 만들기 시작한다.
