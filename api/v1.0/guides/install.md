# 설치

## npm에서 설치

```bash
pnpm add @terracelab/trellis-tokens @terracelab/trellis-react
```

`.npmrc`나 토큰은 필요 없습니다. `@terracelab/trellis-icons`와 `@terracelab/trellis-contracts`는 react 패키지를 따라 들어옵니다. 서식 함수(`formatAmount` 등)를 앱 코드에서 직접 부르면 contracts도 함께 적습니다.

```bash
pnpm add @terracelab/trellis-contracts
```

| 패키지 | npm |
| --- | --- |
| `@terracelab/trellis-tokens` · `icons` · `contracts` · `react` | 있음 |
| `@terracelab/trellis-blocks`(화면 블록) · `@terracelab/trellis-skill`(에이전트 스킬 · 점검 도구) | 없음. git 하위 모듈로 씁니다 |

## git 하위 모듈로 쓰기

화면 블록을 복사해 쓰거나, 에이전트 스킬과 점검 도구(`ds:doctor`)를 쓰거나, 서비스를 만들면서 Trellis를 그 자리에서 고치려면 서비스 저장소에 Trellis를 하위 모듈로 넣고 같은 pnpm 워크스페이스로 묶습니다. 소스는 GitHub 저장소 `terracelab/trellis`에 있습니다. 절차는 [서비스 시작하기](service.md)에 있습니다.

## 요구 사항

- React 19, react-dom 19(peer). 차트는 Recharts 3을 내장 의존성으로 가져옵니다.
- 번들러: Vite · Next.js · Astro 등 ESM을 이해하는 도구. 패키지는 ESM만 냅니다.
- 모든 `@terracelab/trellis-*`는 **같은 버전**을 설치합니다. 섞으면 토큰과 컴포넌트가 어긋납니다.

## 확인

```ts
import { formatAmount } from '@terracelab/trellis-contracts';
formatAmount(1234567, { unit: '원' }); // "1,234,567원"
```

다음: [CSS · 테마 · 밀도](setup.md)
