# 파이프라인 규격 — 빌드 · CI 게이트 · 릴리즈 · 전파 · Figma 동기화 · 에이전트 루프

사람이 하는 일은 spec 작성과 리뷰 승인 두 가지다. 생성·검증·배포·전파는 CI와 에이전트가 맡는다. 도구는 셀프호스팅 또는 고정 비용만 고른다.

## 1. 로컬 빌드 (Turborepo)

```
tokens:build ─▶ icons:build ─▶ contracts:build ─▶ react:build ─┬▶ storybook:build ─▶ a11y ─▶ vrt
                                              └▶ native:build  │
                                              └▶ tailwind:build│
                                              └▶ django:build ─┘  (tokens dist를 static/으로 복사)
                                              └▶ templates / preview / playground
```

`turbo.json`의 `dependsOn: ["^build"]`로 강제한다. 토큰이 바뀌면 전부 재빌드된다. 캐시는 로컬 + 셀프호스팅 remote cache(선택).

## 2. CI 게이트 — PR마다, 전부 통과해야 머지

| # | 잡 | 도구 | 실패 조건 | 도입 |
|---|---|---|---|---|
| 1 | tokens | Style Dictionary + vitest | `docs/spec/tokens.md` §7 테스트 중 하나라도 실패 | P0-04 |
| 2 | lint | ESLint(`eslint-plugin-trellis`) + Stylelint + dependency-cruiser + Prettier check | raw hex·px·font-family, primitive 참조, 의존 방향 위반, 포맷 차이 | P1-03 |
| 3 | typecheck | `tsc -b` | 타입 오류 | P0-01 |
| 4 | spec-parity | `scripts/check-spec-parity.mjs` | react/native에 있는 컴포넌트에 spec.md 또는 contract.ts가 없음, contract가 있는데 Phase 범위의 구현이 없음, spec.md에 템플릿 필수 절이 비어 있음 | P1-01 |
| 5 | test | vitest(web·tokens) + jest-expo(native) | 실패, 커버리지 < 80%(statements, 컴포넌트 패키지) | P1-03 / P3-01 |
| 6 | storybook | `storybook build` | 빌드 실패, 스토리 없는 컴포넌트(parity 스크립트가 함께 검사) | P1-04 |
| 7 | a11y | Storybook test-runner + axe | critical·serious violation ≥ 1 | P1-04 |
| 8 | vrt | Playwright, Docker 고정 이미지 | 픽셀 차이 > 0.1% (threshold `maxDiffPixelRatio: 0.001`), 스냅샷 누락 | P1-04 |
| 9 | size | size-limit | 엔트리별 예산 초과(§6) | P3-14 |
| 10 | changeset | changesets/action check | 공개 패키지 변경에 changeset 없음; NAMES.lock 변경에 major 아님 | P0-01 |

- 러너: GitHub Actions. 1~7은 `ubuntu-latest`, 8은 `container: mcr.microsoft.com/playwright:<고정 태그>`. 셀프호스티드 러너로 바꿔도 Docker 이미지는 같아야 한다.
- 워크플로 파일: `.github/workflows/ci.yml`(위 전부), `release.yml`, `figma-report.yml`, `drift-scan.yml`, `agent-fix.yml`.
- `pnpm turbo run build lint typecheck test --filter=...[origin/main]`으로 변경된 패키지만 돌리되, tokens 변경은 전체.

## 3. VRT 규칙

- 대상: Storybook의 모든 스토리 중 `parameters.vrt !== false`. 각 스토리는 4가지(Light·Dark × compact·comfortable) 뷰포트 1280×800으로 찍는다. 패턴·템플릿 스토리는 1440·1024·390 추가.
- 스냅샷 위치: `apps/storybook/vrt/__snapshots__/<Name>/<story>-<theme>-<density>.png`. Git에 커밋(LFS 미사용, 단일 PNG ≤ 300KB).
- 갱신: `pnpm vrt:update`는 PR에 `vrt-update` 라벨이 있고 사람이 diff 이미지를 승인했을 때만. 에이전트는 라벨을 스스로 붙이지 않는다.
- 플레이크 정책: 애니메이션은 `prefers-reduced-motion` 강제, 폰트는 번들 woff2, 날짜·난수는 mock 고정. 2회 재시도 후에도 다르면 실패.

## 4. 릴리즈

1. 머지 → `changesets/action`이 "Version Packages" PR 생성(모든 패키지 **같은 버전**, fixed group).
2. 그 PR 머지 → `release.yml`: `pnpm -r publish`(npm, 사설 레지스트리) + `uv build && uv publish`(PyPI, 사설) + git tag `v<x.y.z>` + GitHub Release(체인지로그).
3. 같은 잡에서 `figma-report`(§7) 실행, Slack 봇 공지(선택, Phase 4).
4. 버전 의미: 토큰 **이름** 변경·삭제 = major(codemod 동봉). 토큰 값 변경·컴포넌트 추가 = minor. 버그 = patch. 0.x 동안은 minor가 breaking을 포함할 수 있음(체인지로그에 `BREAKING` 표기).

레지스트리: D-50으로 **공개 npm(`--provenance`) · PyPI(trusted publishing)**. 사설 레지스트리(D5)는 쓰지 않는다. npm 토큰은 GitHub Secrets, PyPI는 OIDC라 토큰이 없다.

## 5. 전파 — 소비 레포(제품 레포)

- 이 레포가 Renovate 프리셋 `renovate/trellis.json5`를 제공: `@terracelab/trellis-*`와 `terracelab-trellis`를 하나의 그룹 PR로, `minor` 이하는 소비 레포 VRT 통과 시 automerge, `major`는 사람 승인 + codemod 실행 안내.
- 소비 레포 VRT는 각 레포의 책임. 최소한 Storybook 또는 Playwright 스모크 1개가 있어야 automerge를 켠다.
- 드리프트 스캔(`scripts/drift-scan.mjs <repo-path>`): 소비 레포에서 raw hex·px·font-family·`style={{color:`를 찾아 `--tl-*` 후보를 제안하는 리포트 → 매일 이슈 1개로 갱신(`drift-scan.yml`, 소비 레포는 체크아웃만).

## 6. 번들 예산 (size-limit, gz)

| 엔트리 | 예산 |
|---|---|
| `@terracelab/trellis-tokens/web` | 6 KB |
| `tokens.css` | 12 KB |
| `react/Button` (headless 포함) | 8 KB |
| `react/DataGrid` | 45 KB |
| `react` 전체(모든 컴포넌트 import) | 180 KB |
| `react/styles.css` 전체 | 40 KB |

초과하면 실패. 예산 변경은 changeset 설명에 이유를 쓴다.

## 7. Figma 동기화 (D-6)

```
토큰 PR 머지 ─▶ release.yml ─▶ dist/figma/variables.json 생성
                              ─▶ figma-report: 이전 릴리즈 variables.json과 diff → 추가/변경/삭제 변수 목록을 Release 노트 + 이슈 코멘트로
사람 또는 에이전트 ─▶ Claude Code 세션에서 `/ds-figma-sync` 실행
                       (Figma MCP use_figma: Primitives · Semantic · Density · Typography 컬렉션 upsert, Text Styles 바인딩, 삭제 변수는 보고만)
```

- 방향은 코드 → Figma 하나다. Figma에서 바꾼 값은 PR로 JSON에 반영해야 유효하고, 다음 동기화가 덮어쓴다.
- 컴포넌트 변경은 자동 반영하지 않는다. 리포트에 "변경된 컴포넌트·props" 목록만 올리고 사람이 Figma에서 variant를 고친다.
- 초기 생성(Phase 2, P2-15·16)은 같은 스킬로 한다. Code Connect는 플랜 확인 후(D-8).
- 후순위: `apps/figma-import-plugin` — variables.json을 붙여 넣으면 upsert 하는 자체 플러그인. Claude 세션 없이도 동기화하려면 만든다.

## 8. 에이전트 루프 (Phase 4, `agent-fix.yml`)

1. PR의 CI 잡이 실패하면 Claude Code GitHub Action이 실패 로그와 diff를 읽고 수정 커밋을 푸시한다. 커밋 메시지 접두 `fix(ci):`.
2. 같은 PR에서 **3회** 실패하면 `needs-human` 라벨을 붙이고 멈춘다. 코멘트에 시도한 것·남은 가설을 쓴다.
3. `packages/contracts/src/<Name>/spec.md`만 바뀐 PR(라벨 `spec-only`)이면 에이전트가 `/ds-new-component` 스킬로 웹·네이티브 구현, 스토리, 테스트를 같은 PR에 추가한다.
4. 에이전트는 토큰 값, VRT 스냅샷, `decisions.md` §1을 수정하지 않는다. 필요하면 코멘트로 제안한다.
5. 스킬·프롬프트는 `.claude/skills/ds/*/SKILL.md`에 두고 PR로만 바꾼다.

## 9. 주기 작업

| 주기 | 작업 | 구현 |
|---|---|---|
| PR마다 | §2 게이트 전체 | `ci.yml` |
| 매일 | 소비 레포 드리프트 스캔 → 이슈 갱신 | `drift-scan.yml` + `scripts/drift-scan.mjs` |
| 매주 | 의존성 범프 PR, `react-docgen`으로 props 표 재생성(`dist/docs`), 스냅샷 기준 갱신 검토 목록 | Renovate(이 레포), `docs:gen` 스크립트 |
| 매월 | 미사용 토큰(flat.json 대비 소비 레포 grep)·미사용 컴포넌트 리포트, 번들 크기 추이(size-limit 결과 누적), a11y 전수(Storybook 전체 axe) | `monthly-report.yml` → `docs/reports/<YYYY-MM>.md` |
| 릴리즈마다 | Figma diff 리포트, 체인지로그 공지 | `release.yml` |

## 10. 에이전트 스킬 목록 (`.claude/skills/ds/`)

| 스킬 | 입력 | 출력 |
|---|---|---|
| `new-component` | 컴포넌트 이름(+ spec.md 초안 또는 원문 §5 행) | spec.md 완성 → contract.ts → react 구현 → native 구현(범위 내) → 스토리 → 테스트 → VRT 스냅샷 → changeset. 완료 조건은 `docs/plan/README.md` DoD |
| `token-change` | 바꾸고 싶은 토큰과 이유 | 영향 분석(소비 컴포넌트·소비 레포 grep), 대비 재계산, **제안서**(`docs/plan/notes/`). 값은 바꾸지 않음 |
| `review-pr` | PR 번호 | CLAUDE.md 절대 규칙·spec 템플릿·DoD 기준 체크리스트 리뷰, 타사 제품과의 유사성 의심 항목 |
| `figma-sync` | `dist/figma/variables.json` | Figma MCP로 Variables·Text Styles upsert, 결과 보고 |
| `adopt` | 소비 레포 경로 | 드리프트 리포트 + 패턴 매핑 제안 + 마이그레이션 PR 초안 |

소비 앱 **안에서** 쓰는 스킬 `trellis`(설치된 버전의 동봉 문서로 화면을 만드는 스킬, npm `@terracelab/trellis-skill`)는 `docs/spec/distribution.md` §4에 있다. 릴리즈(§4) 뒤에 문서 스냅샷·사이트 배포·스킬 publish 단계가 붙는다(distribution.md §5).
