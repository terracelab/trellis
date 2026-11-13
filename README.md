# Trellis (트렐리스)

한국어 | [English](README.en.md)

테라스랩 B2B 제품(파일 관리 · 브랜드 운영 · 식자재 ERP · 그룹웨어 · CRM)과 테라스원 맞춤 구축이 함께 쓰는 디자인 시스템 모노레포다. `packages/tokens`의 토큰 JSON이 유일한 원본이고, 웹(React) · 데스크톱(Tauri) · 모바일(Expo) · Django · Figma가 모두 그 생성물을 쓴다. 구현 계획과 진행 현황은 [docs/plan/README.md](docs/plan/README.md), 작업 규칙은 [CLAUDE.md](CLAUDE.md)에 있다.

| 사이트 | 앱 |
| --- | --- |
| 문서 `trellis.terracelab.co.kr/docs/` | [apps/docs](apps/docs) (Astro + Starlight) |
| 테라스원 소개 `one.terracelab.co.kr` | [apps/one](apps/one) |
| 테라스원 데모 `trellis.terracelab.co.kr/demo/` | [apps/demo](apps/demo) (화면 블록으로 조립) |
| Trellis 소개 `trellis.terracelab.co.kr`(홈 · 컴포넌트 · 블록 · 테마. 문서 · 데모와 한 묶음) | [apps/site](apps/site) |
| 토큰 · 컴포넌트 미리보기(단일 HTML) | [apps/preview](apps/preview) |

## 이 저장소에서 개발하기

```bash
pnpm install && pnpm build && pnpm lint && pnpm typecheck && pnpm test
pnpm --filter @terracelab/demo dev      # 데모
pnpm --filter @terracelab/docs dev      # 문서 사이트
pnpm --filter @terracelab/site dev      # 소개 사이트
```

## 다른 프로젝트에서 쓰기

컴포넌트만 쓰는 앱은 npm에서 설치한다(`pnpm add @terracelab/trellis-tokens @terracelab/trellis-react`). 화면 블록 · 에이전트 스킬 · 점검 도구까지 쓰는 서비스는 Trellis를 **git 하위 모듈**로 넣고 같은 pnpm 워크스페이스로 묶어 쓴다. 아래는 하위 모듈 방법이다. 라이선스는 Apache-2.0이다([LICENSE](LICENSE) · [NOTICE](NOTICE)).

| 필요한 것 | 버전 |
| --- | --- |
| Node | 22.12 이상(Trellis는 26으로 개발) |
| pnpm | 12 |
| React | 19 |
| 검증한 조합 | Vite 8 · TypeScript 6(시작 템플릿), Vite 7 · TypeScript 5.9(기존 앱) |

### 새 프로젝트: 시작 템플릿으로 만들기

```bash
# 이 저장소에서
node scripts/create-service.mjs ~/dev/Projects/서비스폴더 --title "서비스 이름"
cd ~/dev/Projects/서비스폴더
pnpm ds:theme --preset forest        # 회사 테마. --brand "#0B7A5C" --neutral warm 도 된다
pnpm ds:add erp/tax/invoice-list     # 화면 블록 복사
pnpm dev
```

만들어지는 것:

- `apps/web` Vite · React · React Router 앱. 앱 틀 · 메뉴 · 알림 · 테마와 밀도 전환 · 화면 설정이 들어 있다
- `trellis/` 하위 모듈과 pnpm 워크스페이스
- `package.json`의 `ds:*` 명령, 서비스용 `CLAUDE.md`, 에이전트 스킬 `.claude/skills/trellis/`
- 설치 · Trellis 빌드 · 점검까지 마친 첫 커밋

옵션은 `--name <패키지 이름>`, `--submodule <git 주소>`, `--no-install`. 템플릿 원본은 [starters/service](starters/service)다.

### 기존 프로젝트에 붙이기

앱이 저장소 루트에 있는 경우다. 모노레포라면 아래 경로의 `src`를 앱 폴더 기준으로 바꾼다(예: `apps/web/src`).

**1. 하위 모듈과 워크스페이스**

```bash
git submodule add https://github.com/terracelab/trellis.git trellis
```

`pnpm-workspace.yaml`에 세 줄을 더한다. 파일이 없으면 새로 만든다. `trellis` 루트도 넣어야 Trellis 빌드 도구가 설치된다.

```yaml
packages:
  - trellis
  - trellis/packages/*
  - trellis/blocks
```

**2. package.json**

```jsonc
{
  "dependencies": {
    "@terracelab/trellis-react": "workspace:*",
    "@terracelab/trellis-tokens": "workspace:*",
    "@terracelab/trellis-icons": "workspace:*",
    "@terracelab/trellis-contracts": "workspace:*",
    "@terracelab/trellis-blocks": "workspace:*" // 화면 블록을 쓸 때만
  },
  "scripts": {
    "ds:build": "pnpm --filter \"@terracelab/trellis-react...\" build",
    "ds:doctor": "node trellis/packages/skill/bin/trellis-skill.mjs doctor --app .",
    "ds:docs": "node trellis/packages/skill/bin/trellis-skill.mjs docs",
    "ds:skill": "node trellis/packages/skill/bin/trellis-skill.mjs install",
    "ds:add": "node trellis/scripts/add-block.mjs --to src/blocks",
    "ds:theme": "node trellis/packages/tokens/scripts/gen-theme.mjs --out src/theme.css",
    "ds:update": "git -C trellis switch main && git -C trellis pull --ff-only && pnpm install && pnpm ds:build && pnpm ds:skill && pnpm ds:add --outdated"
  }
}
```

```bash
pnpm install
pnpm ds:build      # 토큰 · 아이콘 · 컴포넌트 빌드
pnpm ds:skill      # 에이전트 스킬 설치
```

`pnpm install`이 `ERR_PNPM_IGNORED_BUILDS`로 멈추면 그 프로젝트의 의존성(예: esbuild)이 설치 스크립트를 돌리려는 것이다. `pnpm approve-builds esbuild`로 허용하면 `pnpm-workspace.yaml`에 기록된다. 설치 때 나오는 "settings in trellis/pnpm-workspace.yaml do not apply" 경고는 무시해도 된다.

**3. CSS와 html 속성**

진입 파일(main.tsx 등)에서 이 순서로 불러온다. `pnpm ds:doctor`가 순서를 확인한다.

```ts
import '@terracelab/trellis-tokens/fonts.css';  // Pretendard(패키지에 포함, 외부 요청 없음)
import '@terracelab/trellis-tokens/tokens.css'; // --tl-* 변수
import './theme.css';                            // 회사 테마(pnpm ds:theme이 만든다. 없으면 빈 파일)
import '@terracelab/trellis-react/styles.css';  // 컴포넌트
import '@terracelab/trellis-blocks/ui.css';     // 화면 블록을 쓸 때만
```

```html
<html lang="ko" data-theme="light" data-density="compact">
```

**4. 소스 바로 읽기(권장)**

Vite와 TypeScript에 `@terracelab/source` 조건을 켜면 `trellis/packages/*/src`를 바로 읽는다. 서비스를 만들다 Trellis 컴포넌트를 고치면 다시 빌드하지 않아도 화면에 보인다. 켜지 않으면 빌드된 `dist`를 쓰고, Trellis를 고칠 때마다 `pnpm ds:build`가 필요하다.

```ts
// vite.config.ts
export default defineConfig({
  resolve: {
    conditions: ['@terracelab/source', 'module', 'browser', 'development|production'],
    dedupe: ['react', 'react-dom'],
  },
});
```

```jsonc
// tsconfig.json
{ "compilerOptions": { "moduleResolution": "bundler", "customConditions": ["@terracelab/source"] } }
```

**5. 확인**

```bash
pnpm ds:doctor     # 빌드 · CSS 순서 · 토큰 밖 값 · 테마 범위 · 스킬 버전
pnpm build
```

### 컴포넌트 쓰기

```tsx
import { Badge, Button, DataGrid, PageHeader } from '@terracelab/trellis-react';
import { formatAmount } from '@terracelab/trellis-contracts';

<Button variant="primary" onPress={save}>저장</Button>
```

- 문서는 설치된 Trellis와 같은 버전으로 본다. `pnpm ds:docs list`(목록), `pnpm ds:docs DataGrid`(컴포넌트), `pnpm ds:docs guide service`(가이드).
- 화면은 블록에서 시작한다. `pnpm ds:add --list`로 고르고 `pnpm ds:add <블록 id>`로 복사한다. 복사한 블록은 서비스 코드가 되고, 출처 커밋은 `.trellis/blocks.lock`에 남는다.
- 값은 `--tl-*` 변수만 쓴다. raw hex · px · font-family는 `pnpm ds:doctor`가 잡는다.
- 회사 테마는 `pnpm ds:theme --list`에서 고르거나 `--brand`와 `--neutral cool | neutral | warm`로 만든다. 상태 · 수입 · 지출 · 결재 색은 바뀌지 않는다. 자세한 내용은 [docs/guides/theme.md](docs/guides/theme.md).

### 최신 Trellis로 올리기

```bash
pnpm ds:update
```

이 명령이 하는 일:

1. `trellis/`를 main 브랜치로 옮기고 GitHub의 최신 커밋을 받는다
2. 의존성을 다시 설치하고 Trellis를 다시 빌드한다
3. 에이전트 스킬을 다시 설치한다
4. 복사해 간 화면 블록 중 Trellis에서 바뀐 것을 알려 준다

개발 서버가 켜져 있었다면 다시 켠다. Trellis가 새 라이브러리를 들였으면(예: 달력의 react-day-picker) 켜 둔 서버는 그 이름을 찾지 못해 화면이 오류로 바뀐다.

그다음 무엇이 바뀌었는지 보고, 하위 모듈이 가리키는 커밋을 서비스 저장소에 커밋한다.

```bash
git -C trellis log --oneline $(git rev-parse HEAD:trellis)..HEAD   # 이번에 들어온 Trellis 커밋
git diff --submodule                            # 서비스 기준 변경 요약
pnpm ds:add --diff erp/tax/invoice-list         # 복사한 블록의 바뀐 내용
pnpm typecheck && pnpm build && pnpm ds:doctor
git add trellis && git commit -m "chore: update Trellis"
```

- **복사한 블록**은 저절로 바뀌지 않는다. `--diff`로 보고 필요한 부분만 옮긴다. 통째로 다시 받으려면 `pnpm ds:add <블록 id> --force`(서비스에서 고친 내용은 사라진다).
- **변경 내역**은 `trellis/packages/react/CHANGELOG.md`(릴리즈한 것) · `trellis/.changeset/*.md`(아직 릴리즈하지 않은 것) · `trellis/docs/plan/decisions.md`에 있다. 토큰 이름을 바꾸거나 지우는 변경은 major 버전과 codemod를 함께 낸다.
- **특정 버전에 고정하거나 되돌리기**는 `git -C trellis checkout <커밋>` 뒤 `git add trellis`로 커밋한다.
- **다른 컴퓨터에서 받기**는 `git pull && git submodule update --init && pnpm install && pnpm ds:build`.

### 서비스에서 Trellis 고치기

버그 · 문구 · 스타일 한 곳처럼 공개 API를 바꾸지 않는 수정은 서비스 안의 `trellis/`에서 바로 한다.

```bash
git -C trellis switch main                      # 커밋에 고정돼 있으면 브랜치로
# trellis/ 안에서 고친다. 규칙은 trellis/CLAUDE.md
git -C trellis commit -am "fix(react): ..."     # Conventional Commits, scope는 패키지 이름
git -C trellis push                             # Trellis 저장소에 올린다
git add trellis && git commit -m "chore: update Trellis"
```

새 컴포넌트 · 새 props · 토큰 값처럼 큰 것은 서비스에서 만들지 않고 서비스 저장소의 `.trellis/requests.md`에 한 줄을 남긴다. 그동안은 기존 컴포넌트 조합으로 둔다. Trellis 쪽에서 `node scripts/collect-requests.mjs <서비스 경로…>`로 모아 [docs/plan/backlog.md](docs/plan/backlog.md)에 옮긴다.

### npm으로 옮길 때

패키지 이름은 그대로다. 배포가 시작되면 `workspace:*`를 버전으로 바꾸고, `pnpm-workspace.yaml`의 trellis 세 줄과 하위 모듈을 지운다. 소스 바로 읽기 조건은 남겨 둬도 동작에 영향이 없다(배포 패키지는 `dist`만 담는다).

## 저장소 구조

| 경로 | 내용 |
| --- | --- |
| [packages/tokens](packages/tokens) | 토큰 원본(JSON)과 CSS · TS · Tailwind · Figma 생성물, 회사 테마 생성기(`theme/`) |
| [packages/icons](packages/icons) | UI 아이콘 · 모듈 타일 |
| [packages/contracts](packages/contracts) | 컴포넌트 계약(props · 상태 어휘)과 spec.md, 금액 · 날짜 형식 |
| [packages/react](packages/react) | 웹 React 컴포넌트(기본 · 차트), 동봉 문서(`dist/docs`, 컴포넌트 목록과 수는 `manifest.json`) |
| [packages/skill](packages/skill) | 서비스용 에이전트 스킬과 점검 도구(install · doctor · docs) |
| [blocks](blocks) | 복사형 화면 블록(블록마다 `block.json`) · 플랫폼 기본 타입 · 샘플 데이터 |
| [starters/service](starters/service) | 서비스 시작 템플릿 |
| [scripts](scripts) | `create-service` · `add-block` · 동봉 문서 생성 |
| [docs](docs) | 규격(`spec`) · 계획(`plan`) · 가이드(`guides`) |
