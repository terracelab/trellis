# 배포 · 문서 · 에이전트 스킬 규격 (트랙 D)

Trellis를 **사람에게는 브랜드 페이지와 설치·사용 가이드로, 에이전트에게는 버전이 맞는 기계 읽기용 문서와 스킬로** 배포하는 방법이다. 플랜은 `docs/plan/06-docs-and-agent-skill.md`, 결정 근거는 `decisions.md` D-41~D-44.

## 0. 원칙

1. **코드가 진실, 문서는 생성물.** 컴포넌트·토큰 문서는 빌드가 `packages/contracts`·`packages/tokens`·스토리에서 만든다. 사람이 쓰는 글은 브랜드 페이지·가이드·결정 로그뿐이다.
2. **문서의 버전 = 패키지 버전.** 모든 패키지가 fixed group이므로 문서도 한 버전 번호(`v0.3.0`)로 묶인다. 버전마다 스냅샷이 남고 `latest`는 별칭이다.
3. **오프라인 우선.** 문서의 1차 산출물은 npm 패키지에 동봉되는 `dist/docs/`다. 사이트는 그 산출물을 버전별로 게시한 것이고, 사이트가 꺼져도 설치된 앱의 에이전트는 문서를 읽을 수 있다(설치형 앱은 오프라인).
4. **에이전트는 설치된 버전의 문서만 쓴다.** 최신 문서는 "업그레이드할 때" 보는 것이다. 스킬이 `node_modules`의 버전을 읽어 그 버전의 manifest를 연다.
5. 타사 제품의 자산·문구는 문서·브랜드 페이지에도 0이다.

## 1. 산출물 세 겹

| 겹 | 무엇 | 어디에 | 누가 읽나 |
|---|---|---|---|
| ① 동봉 문서 | `manifest.json` · `llms.txt` · `llms-full.txt` · `components/<Name>.md` · `guides/*.md` · `CHANGELOG.md` | `@terracelab/trellis-react/dist/docs/`(`exports: "./docs/*"`), 같은 내용이 PyPI `terracelab_trellis/docs/` | 에이전트(스킬), CI, 사이트 빌드 |
| ② 사이트 | 브랜드 페이지 · 설치·사용 가이드 · 레퍼런스(①을 렌더) · 버전 선택 · `/api/<v>/manifest.json` · `/llms.txt` | `apps/docs`(Astro + Starlight) → 정적 호스팅 | 사람, 외부 협력사, "최신" 탐색하는 에이전트 |
| ③ 스킬 | `trellis` 스킬(SKILL.md + CLI) | npm `@terracelab/trellis-skill` → 소비 레포 `.claude/skills/trellis/` | 소비 앱의 Claude Code |

DS 레포 **내부** 스킬(`.claude/skills/ds/*`, pipeline.md §10 — new-component · token-change 등)은 이 문서 범위가 아니다. ③은 **소비 앱에서 Trellis로 화면을 만드는** 스킬이다.

## 2. 동봉 문서 `dist/docs/` — 형식

생성기: 루트 `scripts/build-docs.mjs`(turbo `build`의 마지막 단계, `react` 패키지 뒤). 입력과 출력:

| 입력 | 출력 |
|---|---|
| `packages/contracts/src/<Name>/spec.md` + `<Name>.contract.ts`(dist import) | `components/<Name>.md` = spec 본문 + **Props 표(contract 메타에서 생성)** + 상태·a11y·플랫폼 + 사용 예 |
| `packages/react/src/<Name>/<Name>.examples.tsx`(JSDoc `/** 제목 — 설명 */` + `export function`, 타입 검사 대상, D-46) | `components/<Name>.md` "예시"(공개 entry import로 바꾼 코드) · 사이트 라이브 예시 |
| `packages/tokens/dist/json/flat.json` · `dist/docs/tokens.md` · `modules.json` | `manifest.tokens` · `tokens.md` |
| `docs/spec/components.md` §11 · `packages/contracts/src/charts/README.md` | `guides/charts.md` |
| `docs/guides/*.md`(사람이 씀: install · usage · patterns · migration) | `guides/*.md` 복사 |
| `CHANGELOG.md`(changesets) | `CHANGELOG.md` |
| CLAUDE.md 절대 규칙·원칙·이름 규칙 | `manifest.rules` · `llms.txt` 머리 |

### 2.1 `manifest.json` 스키마(요지, zod로 검증)

```jsonc
{
  "schemaVersion": 1,
  "version": "0.3.0",                       // 패키지 버전(fixed group)
  "generatedAt": "2027-01-20T00:00:00Z",
  "packages": { "@terracelab/trellis-react": "0.3.0", "@terracelab/trellis-tokens": "0.3.0", "terracelab-trellis": "0.3.0" },
  "rules": ["토큰 밖의 값은 없다 …", "컴포넌트는 semantic만 …", "상태 7 …", "결재 5 …", "수입 빨강 · 지출 파랑"],
  "install": { "npm": ["pnpm add @terracelab/trellis-react @terracelab/trellis-tokens"], "css": ["@terracelab/trellis-tokens/fonts.css", "@terracelab/trellis-tokens/tokens.css", "@terracelab/trellis-react/styles.css"], "provider": "TrellisProvider" },
  "tokens": {
    "cssPrefix": "--tl-",
    "semantic": [{ "name": "color.bg.surface", "css": "--tl-color-bg-surface", "light": "#FFFFFF", "dark": "#252830", "description": "카드·패널" }],
    "density": { "compact": {…}, "comfortable": {…} },
    "typography": [{ "name": "type.body", "fontSize": "…", "lineHeight": "…" }],
    "chart": { "series": ["--tl-color-chart-series-1", "…"], "compare": "--tl-color-chart-compare" }
  },
  "components": [{
    "name": "Button", "entry": "@terracelab/trellis-react/Button", "cssClass": "tl-button",
    "status": "stable | preview",            // 0.x에서 preview 허용
    "props": [{ "name": "variant", "type": "'primary'|'secondary'|'ghost'|'danger'", "default": "primary", "required": false, "values": ["primary","secondary","ghost","danger"], "description": "시각 위계" }],
    "states": ["default","hover","active","focus","disabled","loading"],
    "a11y": { "role": "button", "keyboard": ["Enter","Space"], "labelling": "children" },
    "platforms": { "web": true, "native": true },
    "doc": "components/Button.md", "story": "components-button--default"
  }],
  "patterns": [{ "name": "NotificationHome", "doc": "guides/patterns.md#notificationhome", "components": ["AppShell","DashboardGrid","NotificationCard","KpiCard"] }],
  "modules": { /* modules.json 그대로 */ },
  "figma": { "file": "https://www.figma.com/design/uNZmEBsbRnkivkF79zdd2L", "variablesHash": "…" }
}
```

### 2.2 `llms.txt` 규칙

- `llms.txt`(≤ 6 KB, D-119): 한 문단 소개 · 절대 규칙 5줄 · 설치 3줄 · 섹션 링크(상대 경로: `components/*.md`, `guides/*.md`, `tokens.md`, `CHANGELOG.md`). 사이트에서는 같은 파일을 `/docs/<v>/llms.txt`와 루트 `/llms.txt`(= latest)로 게시.
- `llms-full.txt`(≤ 1.5 MB, D-134): 위 파일들을 순서대로 이어 붙인 것(`CHANGELOG.md`는 빼고 링크만). 에이전트가 한 번에 읽을 때 쓴다.

### 2.3 검증(`packages/react/test/docs.test.ts` + 생성기 자체 검증, CI 잡은 P1-16)

- manifest가 스키마를 통과하고 `components.length === contracts 폴더 수`, 모든 `doc`·`story` 링크가 실제 파일·스토리 id를 가리킨다.
- 컴포넌트 md에 spec 필수 절 11개가 다 있다(parity 스크립트와 같은 규칙).
- 크기 한도: manifest 300 KB · llms-full 1.5 MB(D-134). 초과는 실패.
- 생성물에 raw hex가 있어도 된다(토큰 **값** 표). 단 금칙어 0.

## 3. 사이트 `apps/docs`

- 스택: **Astro + Starlight**(MDX, 버전 플러그인, React 섬으로 실제 Trellis 컴포넌트 렌더). 스타일은 `tokens.css`만 쓴다(사이트 자체가 도그푸딩). Pretendard는 패키지 폰트를 셀프호스트, 외부 요청 0.
- 페이지 구조와 URL

| URL | 내용 | 출처 |
|---|---|---|
| `/` | **브랜드 페이지**: 히어로(미리보기 쇼케이스의 분자 지도·카드 월 재사용, D-37) · 원칙 6 · 토큰 한눈에(Light/Dark 스위치) · 컴포넌트 갤러리 · 제품 4(문구만) · 설치 CTA · Figma 링크 · 최신 버전 배지 | 사람이 씀 + `apps/preview` 조각 |
| `/docs/guide/<slug>/` | 시작하기 · 원칙 · 문구 · 차트 고르기 · 패턴 · 에이전트 · 버전 · Figma(가이드 10편) | `guides/*.md` |
| `/docs/components/` · `/docs/components/<kebab>/` | 목록 · 레퍼런스: Props 표 · 상태 · 접근성 · 예시(React 섬 라이브 + 코드) · (P1-04 뒤) Storybook 링크 | `components/<Name>.md` + manifest |
| `/docs/foundations/tokens/` · `/docs/foundations/modules/` | 토큰 표(견본이 테마를 따름) · 모듈 20과 타일 | manifest.tokens · modules · module-tiles |
| `/docs/changelog/` | 변경 이력 | `CHANGELOG.md` |
| `/en/` · `/en/docs/…` | 영어판. 위 페이지와 같은 구조(§3.2) | `spec.en.md` · `docs/guides/en/*.md` · `apps/docs/src/i18n/` |
| `/api/latest/*` · `/api/v<x.y>/*` | 동봉 문서 폴더 그대로(manifest.json · llms.txt · llms-full.txt · components · guides · tokens.md) | ① 그대로 |
| `/llms.txt` · `/llms-full.txt` | 최신판(링크는 `/api/latest/…` 절대 주소) | ① |
| `/skill/v0.3/SKILL.md` · `/skill/latest/` | 스킬 원문(설치 없이 보기) | ③ |
| `/storybook/` | Storybook 정적 빌드(latest만) | `apps/storybook` |

- 버전 정책: 지금은 `/docs/` = 현재 버전, `/api/latest` = `/api/v0.0`. 릴리즈 파이프라인(P3-12) 뒤 태그마다 `apps/docs/versions/v<x.y>/`에 ①을 스냅샷(patch는 같은 폴더 덮어씀)하고 사이드바 버전 선택기를 켠다(PD-05). 보존 5버전, 그 이전은 `/api/<v>/`만 남긴다.
- 호스팅: Cloudflare Pages(`.github/workflows/sites.yml`), **`trellis.terracelab.co.kr`**. 도메인 `trellis-design.com`은 나중에 사서 붙인다(D-45). 공개 승인 전에는 `noindex` + `robots.txt Disallow`(`SITE_INDEXABLE=1`로 해제). 패키지는 공개 npm으로 나간다(D-50). 토큰은 사이트에 절대 싣지 않는다.
- 테마: Starlight의 `<html data-theme>`와 tokens.css가 같은 속성을 보므로 `--sl-*` → `--tl-*` 매핑 한 벌(`src/styles/starlight.css`)로 라이트·다크가 함께 바뀐다. 브랜드 히어로는 Starlight `Hero` 대체 컴포넌트.
- 사이트도 CI 게이트를 지킨다: `apps/docs/scripts/check.mjs` — 사이트 전 페이지(한국어 · 영어) × 라이트·다크 axe critical·serious 0(대비 승인 대기와 비활성 컴포넌트 안 글자(WCAG 1.4.3 예외)는 따로 셈), 외부 요청 0, 콘솔 오류 0, 내부 링크 깨짐 0. Lighthouse 성능 ≥ 90은 배포 URL에서.

### 3.1 테라스원 소개 `apps/one` → `one.terracelab.co.kr`

한 쪽짜리 Astro 사이트. 화면 조각은 `apps/preview`의 exports(`./showcase` · `./home` · `./charts` · `./styles.css`)를 그대로 쓰고 문구만 제품 기준으로 넘긴다(D-45). 순서: 히어로(분자 지도) → 모듈 20 → 알림 카드 월 → 업무 홈(실제 차트) → 기기 콜라주 → Trellis 소개. 폭은 미리보기와 같은 `data-width`(1440 · 1024 · 390), 테마는 버튼 + `prefers-color-scheme`. 검사 `apps/one/scripts/check.mjs`. 도메인 `terrace-one.com`은 나중에.

### 3.2 영어판 `/en/` (PR-12)

한국어가 루트 locale이고 주소는 그대로다. 영어는 `/en/…`이고 Starlight 언어 선택으로 오간다. 동봉 문서 · `/api` · `/llms.txt`는 한국어 그대로다. 영어 페이지는 `apps/docs/scripts/sync-content.mjs`가 만든다.

| 영어 페이지 | 원본 | 원본이 없으면 |
| --- | --- | --- |
| `/en/docs/guide/<slug>/` | `docs/guides/en/<slug>.md`(한국어 가이드와 같은 이름) | 한국어 가이드 링크만 있는 쪽 + 경고 |
| `/en/docs/components/<kebab>/` | `packages/contracts/src/<Name>/spec.en.md` + contract의 props 타입 · 기본값 · 필수 | Props 표(타입)와 예시만 있는 최소판 + 경고 |
| `/en/docs/foundations/tokens/` · `modules/` | `apps/docs/src/i18n/tokens.en.json` · `modules.en.json` | 설명 빈 칸 · 한국어 모듈 이름 |
| `/en/` · 컴포넌트 목록 · 토큰 · 모듈 머리말 | `apps/docs/src/content/docs/en/`(손으로 씀) | 없음 |
| `/en/docs/changelog/` | changeset(한국어) 그대로. 번역하지 않는다고 쪽에 적는다 | 없음 |

spec.en.md 형식(예: `packages/contracts/src/Button/spec.en.md`):

```markdown
---
props:
  variant: Role. `primary` is the one main action on a screen
  size: Height (density token)
examples:
  Variants: Roles — Use one primary for the main action on a screen.
---
# Button
## Purpose
## Anatomy
## Props
Generated from the contract.
## Variants
## States
## Behavior
## Accessibility
## Density
## Platform differences
## Avoid
## Stories
## References
```

- 절은 spec.md 12절과 같은 순서로, 이름은 위 영어 그대로 쓴다(용도 Purpose · 동작 Behavior · 금지 사항 Avoid · 참고 References 등). Stories · References는 사이트에 싣지 않는다.
- `props`: contract의 props마다 한 줄(`id` · `testID` 제외). 타입 · 기본값 · 필수는 contract에서 오므로 설명만 쓴다. 영어 설명을 위해 contract `.ts`를 고치지 않는다. 값은 한 줄이고, 따옴표 · `#` · `[` · `{`로 시작하면 JSON 문자열로 감싼다.
- `examples`: `<Name>.examples.tsx`의 내보낸 함수 이름마다 `제목 — 설명`. 없으면 함수 이름(`WithIcon` → With icon)이 제목이 된다.
- Purpose 첫 문장이 목록 카드와 메타 설명이 된다. "Use it to …"로 시작하고 마침표로 끝낸다.
- 화면 문구 · 단위처럼 한글이 필요하면 코드 서체 안에만 쓴다.
- 영어 페이지의 라이브 예시는 `TrellisProvider locale="en"`으로 감싼다. 예시 데이터(한국어)는 그대로다.
- 검사: `pnpm --filter @terracelab/docs check:i18n`이 빠진 번역(파일 · 절 · props · 예시 제목 · 가이드 · 토큰 설명 · 모듈 이름 · 코드 서체 밖 한글)과 금칙어를 나열한다. `--strict`면 하나라도 있을 때 실패하고, 컴포넌트 이름을 주면 그것만 자세히 본다. sync-content는 빠진 번역을 경고로 찍고 금칙어가 있으면 실패한다. `check.mjs`는 `/en/` 전 페이지를 같은 기준(axe 라이트 · 다크 · 링크 · 콘솔 · 외부 요청)으로 보고 `lang="en"` · 언어 선택 · 한국어 대체 본문 0을 더 본다.
- 새 컴포넌트는 spec.md와 함께 spec.en.md를 쓴다. 늦어져도 빌드는 최소판으로 통과한다.

## 4. 소비 앱용 스킬 `trellis` (`@terracelab/trellis-skill`)

서비스가 Trellis를 쓰는 방식은 둘이고 스킬은 둘 다에서 돈다(PD-02, 2026-11-13).

| 방식 | Trellis가 있는 곳 | 스킬을 부르는 명령 | 버전 |
|---|---|---|---|
| npm | `node_modules/@terracelab/trellis-*` | `npx @terracelab/trellis-skill <명령>` | react 패키지 버전 |
| 하위 모듈 | 서비스 저장소의 `trellis/`(같은 pnpm 워크스페이스) | `pnpm ds:<명령>`(시작 템플릿이 넣는다) | Trellis 커밋 |

방식은 CLI가 가린다. 앱 폴더에서 위로 올라가며 `@terracelab/trellis-react`를 찾고, 그 패키지가 Trellis 저장소 안에 있으면 하위 모듈, 아니면 npm이다. npx는 이 패키지를 캐시 폴더에서 실행하므로 패키지를 CLI 위치 기준으로 찾지 않는다.

### 4.1 패키지 구조

```
packages/skill/
  package.json              name @terracelab/trellis-skill, bin: trellis-skill(런타임 의존성 없음)
  bin/trellis-skill.mjs     인자를 나눠 src의 명령을 부른다
  src/
    locate.mjs              설치 방식 · 패키지 위치 · 패키지 관리자
    checks.mjs              판단 함수: 토큰 밖 값 · onClick · 테마 범위 · CSS 순서
    suggest.mjs             토큰 밖 값에 대신 쓸 토큰 후보(tokens.css를 뒤집어 읽는다)
    install.mjs · doctor.mjs · docs.mjs · add.mjs
  skills/
    trellis/                하위 모듈 방식의 SKILL.md · references(workflow · request · blocks)
    trellis-npm/            npm 방식의 SKILL.md · references(dashboard · setup · request)
    shared/references/      두 방식이 같이 쓰는 글(do-dont)
  templates/dashboard/      시작 화면(Dashboard.tsx · data.ts · dashboard.css · template.json)
  test/                     판단 함수 · npm 방식 CLI(임시 폴더에 node_modules 배치)
  scripts/e2e.mjs           빈 Vite 앱에 묶음(pnpm pack)을 설치해 끝에서 끝까지
```

### 4.2 CLI

서비스 저장소 루트에서 돌린다. 네트워크를 쓰는 명령은 없다.

| 명령 | 하는 일 |
|---|---|
| `install [--to <폴더>] [--app <앱 폴더>]` | 방식에 맞는 SKILL.md · references를 `.claude/skills/trellis/`에 복사한다. `.trellis/skill.lock`에 스킬 버전 · Trellis 버전 · 방식 · 복사한 파일을 적는다. 지난 설치가 둔 파일 가운데 이번에 없는 것은 지운다. 스킬은 커밋한다 |
| `doctor [--app] [--entry <파일>] [--strict]` | 아래 4.3. 실패가 있으면 종료 코드 1 |
| `docs [list \| llms \| tokens \| path \| <컴포넌트> \| guide <이름>]` | 설치된 버전의 `dist/docs`를 표준 출력으로 낸다. `docs component <이름>`도 같다. `path`는 문서 폴더 경로 |
| `add [<시작 화면>] [--to <폴더>] [--force]` | `templates/<id>/`를 서비스 소스로 복사한다. 이름 없이 부르면 목록. 같은 이름 파일은 `--force` 없이 덮지 않는다 |

`--app`은 앱이 저장소 루트가 아닐 때 준다. `install`에 한 번 주면 lock에 남아 다음 명령이 그대로 쓴다. 기본값은 `apps/web`이 있으면 그것, 없으면 실행 폴더다.

`update`(사이트 manifest와 설치 버전 비교)는 PD-05와 함께 만든다.

### 4.3 doctor가 보는 것

| 순서 | npm | 하위 모듈 |
|---|---|---|
| 1 | react · tokens 설치, `@terracelab/trellis-*` 버전 일치, React 19, 동봉 문서. 없으면 서비스의 패키지 관리자 명령을 알려 준다 | Trellis 빌드 산출물 |
| 2 | CSS import 순서(fonts → tokens → styles). 진입 파일 후보(Vite · Next.js · React Router)와 소스 전체에서 찾고 CSS의 `@import`도 본다 | `src/main.tsx`의 순서(theme · blocks 포함) |
| 3 | 글꼴. 컴포넌트 CSS는 font-family를 정하지 않으므로 앱 CSS가 `--tl-font-family-sans`를 걸어야 한다 | 없음(시작 템플릿이 건다) |
| 4 | 토큰 밖 값. Trellis를 쓰는 파일만 실패로 세고 나머지는 경고로 건수만 낸다. `--strict`면 전부 실패 | 토큰 밖 값(전부 실패). 복사한 블록에서 원본과 같은 줄은 경고 |
| 5 | `src/theme.css`가 있으면 테마 범위 | 테마 범위와 생성기 결과 비교 |
| 6 | lock의 Trellis 버전 = 설치된 버전, 스킬과 major.minor 일치 | lock의 커밋 = 지금 커밋 |

- "Trellis를 쓰는 파일"은 `@terracelab/trellis-*`에서 이름을 가져오는 파일, 그 파일이 불러오는 CSS, `--tl-*` 변수를 쓰는 CSS다. 원래 있던 앱에 화면 하나를 더할 때 옛 코드로 막히지 않게 한다.
- hex와 px에는 대신 쓸 토큰 후보를 붙인다(`#fff → 후보 --tl-color-bg-surface`). 색 후보는 semantic 토큰만 낸다. primitive는 doctor가 막는다.
- 스킬 본문은 버전에 묶이지 않고 문서만 버전에 묶인다. 스킬 패키지는 fixed group으로 DS와 같은 버전에 나간다.

### 4.4 SKILL.md와 시작 화면

SKILL.md는 방식마다 하나다(`skills/trellis/SKILL.md` · `skills/trellis-npm/SKILL.md`). 둘의 순서는 같다. 시작할 때 doctor와 문서를 보고, 요청을 Trellis 어휘로 바꾸고, 구현 규칙을 지키고, 검증하고, 보고한다. 문구는 사람이 검토한다.

| | npm | 하위 모듈 |
|---|---|---|
| 시작 | `add dashboard`로 시작 화면 복사 | `pnpm ds:add`로 화면 블록 복사 |
| 참고 | `dashboard.md`(요청 → 부품 표 · 배치 · 상태) · `setup.md`(패키지 · CSS · 앱 기본 CSS) | `blocks.md`(플랫폼 API · 블록 패턴) · `workflow.md` |
| Trellis 고치기 | 요청만 남긴다(`.trellis/requests.md`, 이슈는 사람이) | 작은 수정은 하위 모듈에서, 큰 것은 요청 |
| 화면 검사 | 서비스의 타입 · 빌드 + 1440 · 390 스크린샷 | `pnpm check`(전 화면 × 4폭 × 라이트 · 다크) |

시작 화면은 npm에 있는 패키지만 쓴다(`@terracelab/trellis-react` · `-contracts`). 화면 블록(`@terracelab/trellis-blocks`)이 npm에 올라가기 전까지 npm 방식의 출발점이다. 이 저장소에서 타입 검사(`packages/skill/tsconfig.json`)와 토큰 린트(eslint `COMPONENT_SOURCES`)를 받는다.

- `dashboard`: PageHeader(기간 SegmentedControl · 엑셀 다운로드) → KpiCard 넷 → ChartCard(TrendChart 비교 · BarList) → SectionHeader + DataGrid(DataBar · 증감 · Badge · 합계). 불러오는 중 · 빈 상태 · 오류는 `useDashboardData`의 값이 카드마다 들어간다.

### 4.5 에이전트 작업 루프(소비 앱)

```
요청 ─▶ [0] 버전·문서 읽기 ─▶ [1] 패턴·컴포넌트 매핑 ─▶ [2] 구현(토큰만) ─▶ [3] doctor·린트·스크린샷 ─▶ [4] 보고
                                      │ 없는 부품
                                      └─▶ request-component 이슈 초안 ─▶ DS 레포 `spec-only` PR ─▶ (P4-07) new-component 스킬이 구현 ─▶ 릴리즈 ─▶ Renovate ─▶ 소비 앱 업그레이드 ─▶ update --check
```

## 5. 릴리즈 연동 (pipeline.md §4에 추가되는 단계)

1. `release.yml` publish 뒤: `pnpm build:docs`(①) → `apps/docs`에 `versions/v<x.y>/` 스냅샷 커밋 → 사이트 빌드·배포 → `/api/latest`·`/llms.txt` 별칭 갱신.
2. 스킬 패키지 publish(같은 버전). 사이트 `/skill/v<x.y>/`에 SKILL.md 게시.
3. 실패 시: 패키지는 이미 올라갔으므로 사이트 배포만 재시도한다(문서는 패키지에 동봉돼 있어 사용자는 영향 없음).
4. 롤백: `latest` 별칭만 이전 버전으로 되돌린다. 스냅샷은 지우지 않는다.

## 6. 게이트 GD — 사이트 공개

- [ ] `pnpm build:docs` 산출물이 스키마·링크·크기 검증 통과, 컴포넌트 수 = contracts 수
- [ ] 빈 Vite 앱에서 `npx @terracelab/trellis-skill install && … doctor` 통과, Opus 세션이 `/trellis`로 홈 1화면을 drift 0으로 30분 내 완성(스크립트로 시간 기록, G3 채택 항목과 공유)
- [ ] 사이트: 브랜드 페이지 + 시작하기 + 레퍼런스(전 컴포넌트) + 버전 선택(≥ 2버전) + `/llms.txt` + `/api/<v>/manifest.json`, axe 0, 외부 요청 0
- [ ] Patrick: 브랜드 페이지 시각 승인, 도메인·호스팅 확정, 공개 범위 승인
