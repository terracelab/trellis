# @terracelab/trellis-tokens

Design tokens for Trellis, TerraceLab's design system for Korean business software. CSS variables (`--tl-*`), a TypeScript object, a Tailwind v4 theme, a company theme generator and the Pretendard Variable font.

Trellis(트렐리스)의 디자인 토큰입니다. 색 · 간격 · 글자 · 밀도 값을 `--tl-*` CSS 변수와 TypeScript 객체로 냅니다. 라이트 · 다크 · 고대비와 밀도 세 단계가 들어 있습니다. Pretendard Variable 글꼴 파일을 포함해 외부 요청이 없습니다.

## 설치

```bash
pnpm add @terracelab/trellis-tokens
```

## 쓰기

```ts
import '@terracelab/trellis-tokens/fonts.css'; // Pretendard Variable
import '@terracelab/trellis-tokens/tokens.css'; // --tl-* 변수
```

```html
<html lang="ko" data-theme="light" data-density="compact">
```

```css
.invoice-total {
  color: var(--tl-color-fg-primary);
  padding: var(--tl-space-12);
}
```

| 경로 | 내용 |
| --- | --- |
| `@terracelab/trellis-tokens` | TypeScript 객체 `tokens` · `tokenNames` |
| `@terracelab/trellis-tokens/tokens.css` | CSS 변수 |
| `@terracelab/trellis-tokens/fonts.css` | 글꼴 선언 |
| `@terracelab/trellis-tokens/theme` | 회사 색 하나로 테마를 계산하는 `createTheme` |
| `@terracelab/trellis-tokens/tailwind` | Tailwind v4 테마 CSS |
| `@terracelab/trellis-tokens/native` | React Native용 객체 |
| `@terracelab/trellis-tokens/figma` | Figma 변수 JSON |

수입은 빨강(`finance.income`), 지출은 파랑(`finance.expense`)입니다. 한국 업무 관습을 따른 것이고 바꾸지 않습니다.

## 문서

- 토큰 표: https://trellis.terracelab.co.kr/docs/foundations/tokens/
- 회사별 테마: https://trellis.terracelab.co.kr/docs/guide/theme/
- 소스: https://github.com/terracelab/trellis

## 라이선스

Apache-2.0. 포함된 Pretendard Variable은 SIL Open Font License 1.1입니다(`fonts/LICENSE-OFL.txt`).
