# CSS · 테마 · 밀도

## CSS를 이 순서로 불러온다

```ts
// 앱의 진입점(main.tsx, layout.tsx 등). 순서가 중요하다
import '@terracelab/trellis-tokens/fonts.css'; // Pretendard Variable(패키지에 동봉, 외부 요청 없음)
import '@terracelab/trellis-tokens/tokens.css'; // --tl-* 변수 · 라이트/다크 · 밀도
import '@terracelab/trellis-react/styles.css'; // 컴포넌트 CSS
```

폰트는 패키지 안의 woff2를 씁니다. 오프라인 설치형 앱에서도 똑같이 렌더됩니다.

## 테마와 밀도는 html 속성 두 개

```html
<html lang="ko" data-theme="light" data-density="compact">
```

| 속성 | 값 | 기본 |
| --- | --- | --- |
| `data-theme` | `light` · `dark` | `light` |
| `data-density` | `compact` · `comfortable` · `touch` | `compact`. 업무 화면은 촘촘하게, 대시보드만 comfortable. 휴대폰(640 미만)은 루트가 자동으로 `touch`(본문 15 · 컨트롤 40 · 입력 글자 16) |

속성은 `<html>`이 아니어도 됩니다. 어떤 요소에 걸면 그 안만 바뀝니다(미리보기의 다크 폰 화면처럼). React 앱은 `TrellisProvider`의 `theme` · `density`로 걸어도 됩니다([TrellisProvider](../components/TrellisProvider.md)). 사용자의 `prefers-reduced-motion`은 토큰이 처리합니다(모든 애니메이션 시간 0).

## 문구 언어는 TrellisProvider 하나

```tsx
import { TrellisProvider } from '@terracelab/trellis-react';

<TrellisProvider locale="en">{app}</TrellisProvider>
```

컴포넌트가 직접 그리는 글자(닫기 · 필터 · 달력 요일 · 빈 상태 · 접근성 이름)가 `ko` · `en` 중 고른 언어가 됩니다. 기본은 `ko`이고 Provider가 없어도 한국어로 동작합니다. 숫자 · 금액 · 날짜 서식(원 · 만 · 억 · ISO)은 언어와 관계없이 그대로입니다. 앱 화면의 문구는 앱이 정합니다.

## 값은 변수로만

```css
.invoice-total {
  padding: var(--tl-space-16);
  border-radius: var(--tl-radius-md);
  background: var(--tl-color-bg-surface);
  color: var(--tl-color-fg-primary);
  font-size: var(--tl-type-amount-font-size);
  font-variant-numeric: var(--tl-font-numeric);
}
```

TS에서는 같은 이름의 객체를 씁니다.

```ts
import { tokens } from '@terracelab/trellis-tokens';
tokens.color.bg.surface; // 'var(--tl-color-bg-surface)'
```

React Native는 해석된 값을 씁니다: `import { themes, density } from '@terracelab/trellis-tokens/native'`.

## Tailwind v4

```css
@import 'tailwindcss';
@import '@terracelab/trellis-tokens/tokens.css';
@import '@terracelab/trellis-tokens/tailwind';
```

semantic 색 · 간격 · 반경 · 글자 · 그림자가 Tailwind 테마로 들어옵니다. `bg-bg-surface text-fg-primary p-16 rounded-md`처럼 씁니다. Tailwind 기본 팔레트(`bg-blue-500` 등)는 쓰지 않습니다.

## Django

`terracelab-trellis` pip 패키지(`{% trellis_css %}` 템플릿 태그 · 어드민 테마)는 1.0 뒤에 나옵니다. 지금은 `tokens.css` · `fonts.css`를 정적 파일로 복사해 씁니다.

다음: [원칙과 규칙](principles.md)
