# @terracelab/storybook

컴포넌트 스토리와 VRT(비주얼 회귀 검사) 기준 이미지를 두는 앱이다. 스토리는 손으로 쓰지 않고 생성기가 만든다.

## 명령

루트에서 실행한다.

| 명령 | 하는 일 |
| --- | --- |
| `pnpm storybook` | 의존 패키지를 빌드하고 스토리를 생성한 뒤 개발 서버를 연다(http://localhost:6006) |
| `pnpm storybook:build` | 정적 Storybook을 `apps/storybook/storybook-static/`에 만든다 |
| `pnpm vrt` | 정적 빌드 뒤 Docker 안에서 스냅샷을 찍어 커밋된 기준 이미지와 비교한다 |
| `pnpm vrt:update` | 다르거나 없는 스냅샷을 다시 쓰고, 대상이 아닌 스냅샷은 지운다 |
| `pnpm --filter @terracelab/storybook test` | 스토리 · 스냅샷 빠짐 검사(루트 `pnpm test`에 들어 있다) |
| `pnpm --filter @terracelab/storybook gen` | 스토리만 다시 생성한다 |

일부만 돌릴 때는 Playwright 인자를 `--` 뒤에 넘긴다.

```bash
pnpm --filter @terracelab/storybook vrt -- --grep " Button "
```

## 스토리 생성

`scripts/gen-stories.mjs`가 `dev` · `storybook:build` · `typecheck` 전에 돌아 `generated/<Name>.stories.tsx`를 만든다. `generated/`는 커밋하지 않는다(문서 사이트의 생성 콘텐츠와 같은 방식). 예시나 contract가 바뀌면 다음 실행에서 다시 만들어지므로 손으로 고칠 파일이 없다.

컴포넌트 하나에 스토리 파일 하나이고, 제목은 `Components/<Name>`이다(`docs/spec/components.md` §6). 파일 안의 스토리는 다음과 같다.

| 스토리 | 만드는 법 |
| --- | --- |
| 예시마다 하나 | `packages/react/src/<Name>/<Name>.examples.tsx`의 export 함수. 이름은 JSDoc 제목(`/** 제목 — 설명 */`). 예시 export 이름이 `Matrix` · `States`와 겹치면 `StatesExample`처럼 뒤에 Example을 붙인다 |
| `Matrix` | contract에 `variant` · `tone` · `shape` · `size` enum prop이 있으면 모든 조합. size는 열, 나머지는 행이다. 나머지 props는 `<Name>`을 직접 그리는 첫 예시의 첫 요소에서 가져온다(예시를 실제로 실행해 요소 트리에서 찾는다). 그 요소를 감싼 Field 같은 바깥 요소도 칸마다 같이 씌운다 |
| `States` | contract `states` 중 그릴 수 있는 것. hover · active · focus는 컴포넌트 CSS가 `data-force-state`를 받을 때만 칸에 넣고, disabled · loading · error는 같은 이름의 prop(`disabled` · `loading` · `invalid` 또는 `error`)으로 그린다. 그릴 수 없는 상태는 스토리 아래에 이유와 함께 적힌다 |

`trigger`로 여는 겹침 컴포넌트(Dialog · Drawer · Menu)는 칸마다 같은 트리거만 보이므로 Matrix · States를 만들지 않는다.

`@terracelab/trellis-react`는 소스로 읽는다(`.storybook/main.ts`의 alias). 예시가 소스 컴포넌트를 상대 경로로 가져오므로 모듈이 하나여야 Matrix의 요소 찾기와 TrellisProvider 문맥이 맞는다. tokens · icons · contracts는 dist를 쓰므로 먼저 빌드되어 있어야 한다(`pnpm storybook`이 알아서 빌드한다).

### 툴바

- 테마: light · dark → `<html data-theme>`
- 밀도: compact · comfortable · touch → `<html data-density>`. 폭이 640 미만이면 속성과 관계없이 touch다
- 언어: ko · en → `TrellisProvider locale`

a11y 패널(axe)이 스토리마다 켜져 있다. Matrix · States는 같은 컴포넌트를 여러 번 그려서 생기는 `landmark-unique` 규칙만 끈다.

## VRT

- 대상: 컴포넌트마다 `vrt` 태그가 붙은 스토리 하나. Matrix가 있으면 Matrix, 없으면 첫 예시다. 생성기가 태그를 붙이고, `vrt/vrt.spec.ts`는 `storybook-static/index.json`에서 태그로 고른다
- 더 찍는 예시(PR-38): 대표 스토리가 덮지 못하는 모양은 `scripts/gen-stories.mjs`의 `EXTRA_VRT`(컴포넌트 → 예시 export)에 올린다(Avatar · PersonLabel `Vacant`, Banner `Narrow`, PageHeader `Siblings`). `phone: true`면 태그 `vrt-phone`이 붙어 390×844로도 찍는다(라이트 · 다크, `<story>-<theme>-phone.png`)
- 조합: 라이트 · 다크 × compact · comfortable, 뷰포트 1280×800, `#storybook-root`만 찍는다
- 스냅샷: `vrt/__snapshots__/<Name>/<story>-<theme>-<density>.png` (커밋한다)
- 고정: 이미지 `mcr.microsoft.com/playwright:v1.64.1-noble`(`linux/amd64`), reduced-motion, 폰트 로딩 대기, 날짜 2026-11-06 09:00 KST, 시간대 Asia/Seoul. 외부 요청이나 페이지 오류가 있으면 실패한다
- 비교 기준: `maxDiffPixelRatio 0.001`, 다르면 2회 재시도 후 실패

`vrt/run.mjs`가 호스트에서 `docker run`으로 같은 명령을 컨테이너 안에서 다시 부른다. 저장소 루트를 `/work`에 붙이므로 컨테이너 안에서 따로 설치하지 않는다. Apple Silicon에서는 amd64 에뮬레이션으로 돌아 조금 느리지만 CI와 같은 그림이 나온다. CI 잡이 이 이미지 안에서 돌면 `VRT_IN_DOCKER=1`을 주어 Docker를 다시 부르지 않게 한다.

`@playwright/test` 버전과 이미지 태그는 같아야 한다. 올릴 때는 `apps/storybook/package.json`과 `vrt/run.mjs`의 `PLAYWRIGHT_VERSION`을 같이 바꾸고 `pnpm vrt:update`로 기준 이미지를 다시 만든다.

### 스냅샷 갱신

1. `pnpm vrt`가 실패하면 `apps/storybook/playwright-report/index.html`에서 차이 이미지를 본다.
2. 의도한 변경이면 `pnpm vrt:update`로 다시 쓰고, 바뀐 PNG를 커밋한다.
3. PR에 `vrt-update` 라벨을 붙이고 사람이 차이 이미지를 승인한다(`docs/spec/pipeline.md` §3). 에이전트는 라벨을 스스로 붙이지 않는다.

새 컴포넌트를 더하면 `pnpm test`의 스냅샷 빠짐 검사가 실패한다. `pnpm vrt:update`로 기준 이미지를 만들어 같이 커밋한다.

## 의존성 메모

- Storybook 10.6.3(`@storybook/react-vite` · `@storybook/addon-a11y`), Vite 8 · React 19와 함께 쓴다. 원격 측정 · 새 버전 알림은 끈다.
- `react-is` 19.3.1을 devDependencies에 둔다. 이 앱이 워크스페이스에 들어오면 pnpm이 recharts의 peer `react-is`를 테스트 도구가 쓰는 17.0.2로 바꿔 잡는다. React 19 요소를 못 알아보는 버전이라 19.3.1로 고정해 둔다.
- `pnpm-workspace.yaml`의 `allowBuilds: esbuild: false`: Storybook이 쓰는 esbuild는 설치 스크립트 없이 동작한다(플랫폼 바이너리는 optionalDependencies로 들어온다).
