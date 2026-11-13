# Phase 0 · 기획·토큰 v0 — 2026-11-06 → 11-13

목표: 모노레포 골격, 토큰 원본·빌드·검증, 미리보기 v0. 끝에 **G1 토큰 스키마 동결**(이름·구조를 동결. 값은 가안이며 G2에서 확정).
사람 작업: D1·D2·D3 결정(11/13까지), 미리보기 v0 열어보기, G1 승인.
산출물: 이 플랜, `@terracelab/trellis-tokens` 0.0.x(미배포), `apps/preview/dist/preview.html`.
규격: `docs/spec/tokens.md` 전체, `docs/spec/pipeline.md` §1·§2.

---

### P0-01 레포 부트스트랩
상태: ☑ 완료 2026-11-06
의존: 없음
목표: pnpm + Turborepo 모노레포가 빈 패키지 상태로 설치·빌드·린트·타입체크·테스트까지 돈다.
산출물: `package.json`(`packageManager`, 루트 scripts), `pnpm-workspace.yaml`(`packages/*`, `apps/*`, `templates`), `turbo.json`, `tsconfig.base.json`, `.node-version`, `.editorconfig`, `.gitignore`, `eslint.config.js`(기본 규칙만), `.prettierrc`, `stylelint.config.js`(자리), `.changeset/config.json`(fixed 그룹: 모든 `@terracelab/*`), `.github/workflows/ci.yml`(install → build → lint → typecheck → test), `README.md`(한 단락 + `docs/plan/README.md` 링크), 빈 패키지 `packages/{tokens,icons,contracts,react,native,tailwind}`(`package.json` + `src/index.ts`), `packages/django/pyproject.toml`(name `terracelab-trellis`, 빈 모듈), `apps/{storybook,preview,playground}/package.json`, `templates/package.json`.
작업:
1. `git init`(기본 브랜치 `main`). 첫 커밋 전에 `.gitignore`(node_modules, dist, .turbo, coverage, playwright-report).
2. 패키지 이름 고정: `@terracelab/trellis-tokens` · `-icons` · `-contracts` · `-react` · `-native` · `-tailwind`, `@terracelab/trellis-templates`(private). 버전 전부 `0.0.0`.
3. `tsconfig.base.json`: `strict`, `exactOptionalPropertyTypes`, `moduleResolution: bundler`, `verbatimModuleSyntax`. 패키지별 `tsconfig.json`이 extends.
4. `turbo.json`: `build`(`dependsOn: ["^build"]`, outputs `dist/**`), `lint`, `typecheck`, `test`, `storybook:build`, `vrt`.
5. CI: PR·`main` push, pnpm store 캐시, Node는 `.node-version`.
완료 조건:
- `pnpm install && pnpm build && pnpm lint && pnpm typecheck && pnpm test` 종료 코드 0
- `pnpm changeset status` 가 에러 없이 끝남
- `git log --oneline` 에 `chore: bootstrap monorepo` 커밋 존재
사람 확인: 없음

### P0-02 색 스케일 생성기
상태: ☑ 완료 2026-11-07
의존: P0-01
목표: 7 hue × 11단계(50~950) primitive 색을 OKLCH 보간으로 결정적으로 생성해 `primitive/color.json`에 쓴다.
산출물: `packages/tokens/scripts/gen-color-scale.mjs`, `packages/tokens/scales.config.json`(hue별 500 기준값 + neutral의 50 앵커 `#F5F6F8`), `packages/tokens/src/primitive/color.json`, `packages/tokens/test/scale.test.ts`.
작업:
1. culori로 각 hue의 500을 OKLCH로 변환, L을 50(≈0.97)→950(≈0.20) 사이 고정 곡선으로 배치, C는 양끝에서 줄이고 H는 유지. neutral은 쿨톤(H ≈ 250~260) 유지, 50은 앵커 값으로 고정.
2. `color.base.white/black` 추가(D-14).
3. 출력은 sRGB hex 대문자, 키 순서 고정(50→950). 두 번 실행해도 diff 0.
4. `pnpm --filter @terracelab/trellis-tokens gen:colors` 스크립트.
완료 조건:
- `pnpm --filter @terracelab/trellis-tokens gen:colors && git diff --exit-code packages/tokens/src/primitive/color.json` (재실행 시 변화 없음)
- `scale.test.ts`: 77 + 2 색, 500 = 기준값 그대로, 각 hue L 단조 감소 — 통과
사람 확인: 없음(값은 가안. 보기 좋은지 판단은 P0-07 미리보기에서)

### P0-03 토큰 원본 작성
상태: ☑ 완료 2026-11-07
의존: P0-02
목표: `docs/spec/tokens.md` §1~§3의 모든 소스 파일을 DTCG 형식으로 작성하고 스키마·패리티·alias 테스트를 통과시킨다.
산출물: `src/primitive/{space,radius,border,shadow,motion,z,breakpoint,layout,size,font}.json`, `src/semantic/color.light.json`, `src/semantic/color.dark.json`, `src/density/{compact,comfortable}.json`, `src/typography.json`, `src/modules.json`(components.md §7 그대로), `src/modules.schema.json`, `test/{schema,mode-parity,alias-only}.test.ts`.
작업:
1. semantic Light는 tokens.md §2 표의 alias를 그대로. Dark는 §2 "Dark 규칙" 열대로 1차 작성.
2. 모든 semantic `$value`는 `{…}` alias. `$description`에 용도 한 줄.
3. zod 스키마로 DTCG 리프 검증(`$type` 허용 목록).
완료 조건:
- `pnpm --filter @terracelab/trellis-tokens test` 에서 schema · mode-parity · alias-only 통과
- `jq '.modules | length' packages/tokens/src/modules.json` = 20
사람 확인: 없음

### P0-04 Style Dictionary 빌드
상태: ☑ 완료 2026-11-07
의존: P0-03
목표: 토큰 JSON에서 tokens.md §4의 산출물 8종을 생성하고 패키지 `exports`로 노출한다.
산출물: `packages/tokens/sd.config.mjs`, `packages/tokens/sd/{transforms,formats,preprocessors}/*.mjs`, `dist/css/tokens.css`, `dist/css/fonts.css`, `dist/web/`, `dist/native/`, `dist/tailwind/theme.css`, `dist/figma/variables.json`, `dist/json/flat.json`, `dist/docs/tokens.md`, `test/outputs.test.ts`(스냅샷), `package.json` exports(`.`, `./web`, `./native`, `./tokens.css`, `./fonts.css`, `./tailwind`, `./figma`, `./flat`).
작업:
1. 이름 transform: `--tl-` 접두 케밥, 숫자 키 유지. 모드별 소스 집합을 별도 플랫폼으로 빌드해 §5 구조의 CSS 한 파일로 합친다(semantic은 `var(--tl-…)` 참조 유지).
2. 네이티브 포맷: 해석값, 단위 제거, fontWeight 문자열, shadow → `{shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation}`.
3. Tailwind 포맷: `@theme inline` 블록. 키 규칙은 `color.*` → `--color-*`, `space.*` → `--spacing-*`, `radius.*` → `--radius-*`, `type.*.fontSize` → `--text-*`.
4. Figma 포맷: tokens.md §6 스키마. `layout.*`, `z.*`, `breakpoint.*` 제외.
5. `dist/docs/tokens.md`에 semantic 색의 Light·Dark 대비율 열 포함.
완료 조건:
- `pnpm --filter @terracelab/trellis-tokens build && ls packages/tokens/dist/{css,web,native,tailwind,figma,json,docs}` 전부 존재
- `grep -c -- '--tl-' packages/tokens/dist/css/tokens.css` ≥ 250
- `node -e "import('@terracelab/trellis-tokens/native').then(m=>console.log(Object.keys(m.themes)))"` → `[ 'light', 'dark' ]` (워크스페이스 링크로 실행)
- `outputs.test.ts` 스냅샷 통과(최초 생성 커밋 포함)
사람 확인: 없음

### P0-05 대비 테스트 · 이름 lock
상태: ☑ 완료 2026-11-09 — 1번 brand 대안 A(D-55), 2~5번 approval.*.text로 해결(D-64). 대비 테스트 전부 통과
의존: P0-04
목표: tokens.md §7의 contrast 테스트와 NAMES.lock 메커니즘을 만들고, 실패 쌍은 **값 변경 제안서**로 정리한다.
산출물: `test/contrast.test.ts`, `scripts/lock-names.mjs`, `NAMES.lock`, `test/names-lock.test.ts`(G1 전에는 skip 플래그), `docs/plan/notes/contrast-2026-11.md`(실패가 있을 때만).
작업:
1. WCAG 2.x 대비 계산(알파 색은 surface 위에 합성 후 계산). OKLCH ΔE로 income/expense 색차.
2. 실패 쌍은 테스트를 `todo`로 두지 말고, 제안서에 "현재 값 · 대비 · 제안 값 · 제안 대비 · 영향 토큰"을 표로 쓴다. 특히 D-10(brand.onBrand on brand.default ≈ 4.5:1)을 확인한다.
3. `lock-names.mjs`: 모든 토큰 경로를 정렬해 `NAMES.lock`에 기록. 테스트는 lock에 있던 이름이 사라지면 `.changeset/*.md`에 `major`가 있는지 본다.
완료 조건:
- `pnpm --filter @terracelab/trellis-tokens test` 통과 (contrast 실패가 있으면 제안서 작성 후 `⛔ 막힘(대비 N쌍 승인 대기)`로 넘김)
- `node packages/tokens/scripts/lock-names.mjs && wc -l packages/tokens/NAMES.lock` ≥ 250
사람 확인: 제안서가 있으면 값 승인
넘김: 대비 검사 30개 중 라이트 5쌍이 실패해 `docs/plan/notes/contrast-2026-11.md`에 제안서를 썼다. 결정할 것은 두 가지다.
1. 브랜드 버튼(흰 글자 4.499): **추천** 기준값 `#2F6BFF` → `#2E6AFE`(눈으로 구분 안 됨) / 대안 `brand.default`를 brand.600으로.
2. 결재 배지 4종(기안·진행·승인·회수) 글자색: **추천** 각각 neutral.700 · amber.800 · green.700 · neutral.600으로 진하게 / 대안 글자 전용 토큰 이름 추가(G1 전에만 쉬움).
승인 전까지 `contrast.test.ts`의 5개 케이스는 실패 상태로 둔다(제안서 절차, todo 처리 금지). 이름 lock은 완료: `NAMES.lock` 251개, `names-lock.test.ts`는 G1 전이라 동결 검사 2개를 건너뛴다.

### P0-06 Pretendard 폰트 패키징
상태: ☑ 완료 2026-11-07
의존: P0-01
목표: Pretendard Variable woff2와 라이선스를 tokens 패키지에 포함하고 `fonts.css`가 번들 경로를 가리킨다.
산출물: `packages/tokens/fonts/PretendardVariable.woff2`, `packages/tokens/fonts/LICENSE-OFL.txt`, `dist/css/fonts.css`(`@font-face`, `font-display: swap`, `font-weight: 100 900`), 패키지 `files`에 fonts 포함.
작업: 공식 배포본(GitHub orioncactus/pretendard 릴리즈)에서 Variable woff2만 받는다. 파일 해시를 `fonts/CHECKSUMS`에 기록.
완료 조건:
- `ls -la packages/tokens/fonts/` 에 woff2(≈1.5~2.5MB)와 LICENSE
- `pnpm --filter @terracelab/trellis-tokens pack --pack-destination /tmp && tar tf /tmp/terracelab-trellis-tokens-*.tgz | grep -c woff2` = 1
  (pnpm 12에서는 `pnpm -C packages/tokens pack --pack-destination /tmp`, D-32)
사람 확인: 없음

### P0-07 미리보기 아티팩트 v0
상태: ☑ 완료 2026-11-07
의존: P0-04, P0-06
목표: 토큰·타이포·아이콘·P0 컴포넌트 경량 갤러리를 단일 HTML로 빌드해 Light/Dark · compact/comfortable 토글로 검토할 수 있게 한다(D-4).
산출물: `apps/preview/`(Vite + `vite-plugin-singlefile`, Vanilla TS, `tokens.css`·`fonts.css` import), `apps/preview/dist/preview.html`(커밋하지 않음, CI 아티팩트), 섹션: 토큰(7 hue 스와치, semantic 표 이름·값·대비율, 간격·radius·그림자 샘플), 타이포(9 스타일 한글+숫자+금액, tabular-nums 비교), 아이콘(Lucide 16·20·24 샘플 12개, 모듈 앱 아이콘 20종을 `modules.json`에서 즉석 svg 생성), 컴포넌트(Button·Badge·Input·Card·NotificationCard·Tabs·DataGrid 정적 20행 — 경량 vanilla, variant × 7 state), 패턴 미리보기(알림 카드 홈 mock 1장).
작업:
1. 상단 고정 바: Light/Dark, Compact/Comfortable, 뷰포트 1440/1024/390 프레임 폭 전환.
2. 미리보기 컴포넌트는 코드 패키지 구현이 아니다. 치수·토큰 확인용이므로 `tl-preview-*` 클래스를 쓰고 `--tl-*` 변수만 참조한다(린트 적용).
3. 폰트는 base64 인라인. 총 크기 ≤ 5MB.
4. 빌드 후 Playwright로 axe 검사 1회(스크립트 `pnpm --filter preview check`).
완료 조건:
- `pnpm --filter preview build && ls -la apps/preview/dist/preview.html` (단일 파일, ≤ 5MB)
- `pnpm --filter preview check` → axe critical·serious 0, 외부 요청 0(네트워크 로그)
- 세션 끝에 Claude가 `preview.html`을 Artifact로 게시하고 링크를 보고한다
사람 확인: 열어보고 색·밀도 인상 피드백(G1 체크리스트)

### P0-08 G1 게이트 준비
상태: ☑ 완료 2026-11-10 — Patrick G1 승인(밤 작업 지시: D1 · D2 · D3 확정, 대비 제안서는 D-55 · D-64로 해결). `packages/tokens/test/names-lock.test.ts` `G1_FROZEN = true`, 로컬 태그 `g1-frozen` = 9e467d0(`git rev-parse g1-frozen^{commit}`), `vitest run test/names-lock.test.ts` 4 통과(동결 뒤 검사 포함), `NAMES.lock` 433줄, changeset `.changeset/g1-frozen.md`(tokens patch)
의존: P0-05, P0-07
목표: G1 체크리스트의 에이전트 항목을 채우고 사람 승인을 받을 상태로 만든다.
산출물: 이 파일 끝의 G1 체크리스트 갱신, `decisions.md` §1 D1~D3 상태 반영, changeset(`@terracelab/trellis-tokens` minor, "토큰 스키마 v0").
작업: 체크리스트의 에이전트 항목을 실제로 확인해 체크하고, 사람 항목은 비워 둔다. 승인되면 `names-lock.test.ts`의 skip을 풀고 태그 `g1-frozen`을 만든다.
완료 조건:
- G1 체크리스트 에이전트 항목 전부 ☑
- `git tag | grep g1-frozen` (사람 승인 후)
사람 확인: G1 승인(Patrick) — 2026-11-10 승인
넘김(해결 2026-11-10): 에이전트 항목 7개는 2026-11-07에 명령으로 확인해 체크했다. P0-05가 대비 승인 대기라 의존이 완전히 충족되지 않았지만, G1 체크리스트가 "제안서 승인 대기"를 선택지로 두고 있어 준비를 마쳤다. Patrick이 결정할 것은 아래 사람 항목 6개다.
1. D1 Base UI · D2 다크 검수 Phase 3 · D3 compact 기본: **추천** 셋 다 확정 / 바꿀 항목이 있으면 `decisions.md` §1에 적기.
2. 미리보기 v0(위 링크)에서 7 hue와 캔버스 톤 인상: 반대가 없으면 통과. 값 조정 요청은 G2까지 열어 둔다.
3. 대비 제안서(`notes/contrast-2026-11.md`) 1절 5개 항목과 2절 관찰 6건.
4. 승인되면 다음 세션이 `names-lock.test.ts`의 `G1_FROZEN`을 `true`로 바꾸고 태그 `g1-frozen`을 만든 뒤 이 작업을 ☑로 바꾼다. 그 전에는 Phase 1을 시작하지 않는다.

---

## G1 체크리스트 — 토큰 스키마 동결

에이전트 항목
- [x] tokens.md §1의 모든 소스 파일이 존재하고 schema · mode-parity · alias-only · scale · outputs 테스트 통과 (2026-11-07, 5파일 80개 → 2026-11-10 PR-28: 11파일 429개, 고대비 · 색각 친화 세트 · 기본 테마 = 엔진 테스트 포함)
- [x] semantic 색 토큰 이름이 tokens.md §2 표와 1:1 (추가·누락 0) — `alias-only.test.ts`가 §2 표를 직접 읽어 비교, 61종 → 2026-11-10 122종(PR-28, 추가만)
- [x] `NAMES.lock` 생성, 이름 수 기록: 251 → 2026-11-10 433(PR-28 · 30, 삭제 0)
- [x] 산출물 8종 생성, `exports` 로 import 가능 — apps/preview에서 `.` `./web` `./native` `./figma` `./flat` `./modules` `./tokens.css` `./fonts.css` `./tailwind` 확인
- [x] 대비 테스트 결과: 제안서 `notes/contrast-2026-11.md` 승인 대기 (30개 중 라이트 5쌍 미달) → 2026-11-10 라이트 · 다크 · 고대비 2모드 전부 통과(PR-01 · PR-26 · PR-28, 회사 색 토큰은 엔진이 맞춘다 D-98)
- [x] 미리보기 v0 Artifact 링크: https://claude.ai/artifact/2kJx3xod2fzcoACojNFKZh
- [x] `modules.json` 20모듈, Lucide 이름 전부 유효 (lucide 1.59.0, `apps/preview/scripts/gen-icons.mjs`)

사람 항목(Patrick)
- [x] D1 headless = Base UI 확정 (또는 변경) — 2026-11-10 Patrick 확정
- [x] D2 Dark 검수 Phase 3 확정 — 2026-11-10 Patrick, 적힌 그대로
- [x] D3 compact 기본 확정 — 2026-11-10 Patrick 확정
- [x] 미리보기 v0에서 7 hue 인상·캔버스 톤에 반대 없음(값 조정 요청은 G2까지 열어 둔다) — 2026-11-10 G1 승인에 포함
- [x] 대비 제안서가 있으면 승인 — 1번 brand 대안 A(D-55), 2~5번 approval.*.text(D-64)
- [x] 승인 → 태그 `g1-frozen`. 이후 토큰 **이름** 변경은 major + codemod — 2026-11-10 로컬 태그 `g1-frozen` = 9e467d0, `G1_FROZEN = true`
