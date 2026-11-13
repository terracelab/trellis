# Phase 1 · 코어 구축 — 2026-11-14 → 11-27

목표: 아이콘·contracts·react 패키지, Storybook·테스트·VRT 인프라, 린트 플러그인, **P0 14종 웹 구현**, 에이전트 스킬.
사람 작업: P0 컴포넌트 시각 검토(스토리북), D4 Tauri 결정(11/27).
산출물: `@terracelab/trellis-react` 0.1.0(미배포, pack 검증), 아이콘 파이프라인, CI 게이트 1~8.
규격: `docs/spec/components.md` 전체, `docs/spec/pipeline.md` §1~§3.
전제: G1 통과(`g1-frozen` 태그).

컴포넌트 작업(P1-05~P1-15)의 완료 조건은 `docs/plan/README.md`의 **컴포넌트 DoD 10항목**이며, 아래에는 컴포넌트 고유 사항만 적는다. 네이티브 구현은 Phase 3(contract의 `platforms.native`는 지금 정한다). 네이티브 구현은 1.0 뒤다(D-101).

2026-11-10 상태 정리 증거(컴포넌트 작업 공통, 이 세션에서 명령으로 확인): contracts 폴더 96 = react 폴더 96 = 생성 스토리 96(`ls apps/storybook/generated | wc -l`) = VRT 폴더 96(`ls apps/storybook/vrt/__snapshots__ | wc -l`, PNG 440). 96개 모두 `spec.md` · `<Name>.contract.ts` · 구현 · `<Name>.examples.tsx`가 있다(폴더 대조). `pnpm --filter @terracelab/trellis-react exec vitest run` 521 통과, `pnpm --filter @terracelab/storybook test`(스토리 · 스냅샷 빠짐 검사) 4 통과, Base UI import는 `_headless/` 밖 0곳(grep). Storybook axe 760회 위반 0과 `pnpm vrt` 440 통과는 PR-30 기록이다(이 세션에서 다시 돌리지 않았다). States 스토리와 DoD 9는 D-105(제안)대로 읽는다.

---

### P1-01 contracts 패키지
상태: ◐ 진행 — 2026-11-10 확인: `src/_base.ts` · `src/_shared/{format,validate,vocab,hr,worktime,diff,messages}.ts` 있음, `pnpm --filter @terracelab/trellis-contracts test` 5파일 40 통과. 없는 것: `_testing/contractTest.ts` · `_templates/spec.md` · `scripts/check-spec-parity.mjs` · `scripts/gen-module-types.mjs`(`ModuleId`는 아직 `string`)
의존: P0-08
목표: 공통 타입·`defineContract`·contract 테스트 유틸·spec 템플릿·parity 스크립트를 만든다.
산출물: `packages/contracts/src/_base.ts`(components.md §2 그대로), `_shared/format.ts`(`formatAmount`, `formatCount`(99+), 테스트), `_testing/contractTest.ts`, `_templates/spec.md`(§3 템플릿), `scripts/check-spec-parity.mjs`(루트), `ModuleId` 타입을 `modules.json`에서 생성하는 `scripts/gen-module-types.mjs`.
작업: parity 스크립트는 `--phase 1|2|3` 인자로 native 요구 여부를 바꾼다. 결과는 표로 출력, 실패 시 종료 코드 1.
선행 반입(2026-11-07, D-39): `src/_base.ts`(§2 그대로) · `src/_shared/format.ts`(formatAmount · formatCount · formatCompactWon · formatPercent + 테스트) · 차트 contract 14종(`src/<Name>/`)과 spec.md · `src/charts/README.md`가 이미 있다. P1-01은 `_testing/contractTest.ts` · `_templates/spec.md` · parity 스크립트 · `gen-module-types.mjs`만 더한다.
완료 조건:
- `pnpm --filter @terracelab/trellis-contracts build && pnpm --filter @terracelab/trellis-contracts test` 통과(formatAmount: `1234567 → "1,234,567"`, `-1234 → "−1,234"`, 단위 옵션)
- `node scripts/check-spec-parity.mjs --phase 1` 가 "컴포넌트 0개" 로 통과
사람 확인: 없음

### P1-02 icons 패키지
상태: ◐ 진행 — UI 아이콘 데이터(Lucide 155종 생성, `uiIcons`) · react `<Icon>` 완료. 남은 것: 모듈 아이콘 png · contact sheet
의존: P1-01
목표: Lucide 어댑터 `Icon`과 업무 아이콘·모듈 앱 아이콘 생성 파이프라인(svg → react · rn · png)을 만든다.
산출물: `packages/icons/src/Icon.tsx`(웹, lucide-react 동적 맵, size 16·20·24 토큰), `src/Icon.native.tsx`(lucide-react-native), `src/custom/*.svg`(업무 전용, 초기엔 `hwp`·`approval-stamp` 2개), `scripts/build-icons.mjs`(svgo → @svgr/core 웹·네이티브 → @resvg/resvg-js png), `scripts/build-module-icons.mjs`(`modules.json` → 20 × 3크기 svg/react/rn/png; **타일 일러스트가 있는 모듈은 `src/module-tiles/<id>.svg`를 쓰고(D-36), 없는 모듈만** radius 22%, `gradientFrom→gradientTo` 세로, 흰 Lucide 라인 아이콘 중앙 50%로 생성), `dist/module-icons/{svg,react,native,png}/`, `test/icons.test.ts`(모듈 20개 × 3 존재, Lucide 이름 유효성, png 해시 스냅샷).
작업: 모듈 아이콘 색은 `color.module.*.gradientFrom/To`의 **Light 해석값**을 flat.json에서 읽는다(primitive 직접 참조 금지). svg에 `<title>`로 모듈 라벨.
선행 반입(2026-11-07, D-36): 모듈 타일 일러스트 12종(모듈 배정 11 + 미배정 1)이 `src/module-tiles/`에 있고, `scripts/module-tiles.mjs`(정규화·검증·스프라이트·manifest·JS export)와 `test/module-tiles.test.ts`, `./module-tiles` export가 이미 있다. P1-02는 이를 그대로 두고 react·rn·png 변환과 폴백 생성만 더한다. 타일 없는 모듈 9종은 같은 화법으로 그려 추가하는 것이 목표이고, 그때까지는 폴백이다.
완료 조건:
- `pnpm --filter @terracelab/trellis-icons build && ls packages/icons/dist/module-icons/png | wc -l` = 60
- `pnpm --filter @terracelab/trellis-icons test` 통과
- `modules.json`에 가짜 아이콘 이름을 넣으면 빌드가 실패함을 확인하고 되돌림
사람 확인: 모듈 아이콘 20종 PNG 한 장(contact sheet, `dist/module-icons/sheet.png`)을 보고 타사 제품과의 유사성·식별성 검토. 일러스트 타일과 폴백이 한 판에서 어울리는지, 문서작성 타일을 다시 그릴지(D-36) 함께 판단

### P1-03 react 패키지 골격 + 린트 플러그인
상태: ◐ 진행 — 2026-11-10 확인: TrellisProvider(`src/TrellisProvider/`, PR-02), Base UI는 `_headless/index.ts`에서만 import(밖 0곳), `@terracelab/eslint-plugin-trellis` 5규칙 · 픽스처 테스트 69 통과(PR-04), stylelint 규칙(`scripts/stylelint/hover-transition.mjs` 등), 빌드는 tsc + build-css(exports `.` · `./charts` · `./core` · `./form` · `./styles.css`). 남은 것: 규칙 headless-boundary · event-naming, `getRootAttributes()`. Vite lib 모드 · `sync-exports.mjs`는 D-105(제안)를 받으면 하지 않고, dependency-cruiser는 eslint `dependency-direction` 규칙이 대신한다
의존: P1-01
목표: react 패키지의 Provider·headless 어댑터·내부 유틸·빌드와, `eslint-plugin-trellis`·stylelint·dependency-cruiser 규칙을 완성한다.
산출물: `packages/react/src/provider/TrellisProvider.tsx`, `_headless/{index,dialog,popover,select,menu,tabs,tooltip,checkbox,radio,switch,toast}.ts`(Base UI 재export, 중립 이름), `_internal/{cx,useControllableState,portal,focus.css,useMediaQuery}.ts`, `styles.css`, `vite.config.ts`(lib 모드, 컴포넌트별 엔트리 자동 수집, preserveModules, CSS 분리), `packages/eslint-plugin-trellis/`(components.md §5의 eslint 규칙 6개 + 픽스처 테스트), `stylelint.config.js`(§5), `.dependency-cruiser.cjs`, 루트 `eslint.config.js`에 플러그인 연결.
작업: 빌드는 `src/<Name>/index.ts`를 엔트리로 자동 수집하고 `package.json` `exports`를 스크립트(`scripts/sync-exports.mjs`)로 생성한다.
선행 반입(2026-11-07, D-39): react 패키지에 차트 14종(`src/<Name>/`, `src/charts/index.ts` 엔트리 `./charts`, `scripts/build-css.mjs` → `dist/styles.css`, vitest jsdom + RTL 테스트 19개)이 tsc 빌드로 먼저 들어와 있다. Vite lib 모드로 바꿀 때 `./charts` 엔트리와 `styles.css`를 유지하고, stylelint 규칙은 `stylelint.config.js`의 `packages/react/src/**/*.css` 오버라이드를 플러그인으로 옮긴다. `_internal/chart/Glyph.tsx`(상태 글리프 3종)는 P1-02의 `<Icon>`으로 교체한다. Provider는 `theme`·`density`를 `document.documentElement` 속성으로 쓰고 SSR에서는 초기 속성 문자열을 반환하는 `getRootAttributes()`도 제공.
완료 조건:
- `pnpm --filter eslint-plugin-trellis test` 통과(규칙별 valid/invalid 픽스처 ≥ 3)
- 임시 파일에 `color: #fff`, `padding: 4px`, `@base-ui-components/react` import를 넣고 `pnpm lint`가 각각 실패함을 확인 후 삭제
- `pnpm --filter @terracelab/trellis-react build` 가 `dist/provider`·`dist/styles.css` 생성
- `pnpm depcruise` 통과
사람 확인: 없음

### P1-04 Storybook · 테스트 · VRT 인프라
상태: ◐ 진행 — 2026-11-10 확인: Storybook 10.6.3 + addon-a11y(`apps/storybook/package.json`), 생성 스토리 96 · VRT PNG 440(Docker Playwright v1.64.1, PR-03 · PR-30), CI `vrt` 잡(`.github/workflows/ci.yml`, PR-05), a11y 검사 `pnpm --filter @terracelab/storybook a11y`(axe, test-runner 대신). 남은 것: `Foundations/Tokens` · `Typography` · `Icons` 스토리, ContractProps 문서 블록
의존: P1-03
목표: Storybook(react-vite) + a11y + vitest 애드온, Playwright VRT 러너(Docker 고정)를 세우고 CI 게이트 6~8을 켠다.
산출물: `apps/storybook/.storybook/{main,preview}.ts`(툴바 theme·density, 데코레이터, `Foundations/Tokens`·`Typography`·`Icons` 스토리를 tokens dist에서 자동 생성), `apps/storybook/vrt/{playwright.config.ts,vrt.spec.ts,snapshot-name.ts}`, `apps/storybook/vrt/Dockerfile` 또는 `docker-compose.yml`(playwright 이미지 태그 고정), 루트 스크립트 `vrt`·`vrt:update`, `.github/workflows/ci.yml`에 storybook·a11y·vrt 잡, contract 기반 autodocs 블록 `apps/storybook/blocks/ContractProps.tsx`.
작업: VRT 스펙은 Storybook `index.json`을 읽어 `parameters.vrt !== false`인 스토리를 4조합으로 순회. 스냅샷 이름 `<Name>/<story>-<theme>-<density>.png`. `maxDiffPixelRatio 0.001`.
완료 조건:
- `pnpm storybook:build` 성공, `Foundations/*` 3 스토리 렌더
- `pnpm vrt` 가 Docker 안에서 `Foundations/Tokens` 스냅샷을 생성·비교(두 번째 실행 통과)
- `pnpm test:a11y`(storybook test-runner) 통과
- CI 워크플로가 PR에서 8개 잡을 모두 실행
사람 확인: 없음

### P1-05 Button · IconButton
상태: ☑ 완료 2026-11-10(웹) — Button · IconButton: contract · spec · 구현 · 예시 · 스토리(Matrix · States) · VRT 8 · 4장, 공통 증거는 위. 네이티브는 1.0 뒤(P3)
의존: P1-04
고유 사항: variant primary·secondary·ghost·danger, `iconOnly`(IconButton은 `aria-label` 필수 + Tooltip은 Phase 2 Tooltip 완성 후 연결, 그때까지 `title`), `loading`은 Spinner 자리 확보로 폭 변화 0, 네이티브 true. 높이 `--tl-density-control-height-*`. `brand.onBrand`/`brand.default` 대비는 contrast 테스트 결과를 따른다(D-10).
사람 확인: 스토리북 시각 검토

### P1-06 Badge · Avatar · ModuleIcon
상태: ☑ 완료 2026-11-10(웹) — Badge · Avatar · ModuleIcon: 스토리 Matrix(contract states가 기본 하나라 States 없음, D-105) · VRT 8 · 4 · 4장, 공통 증거는 위. 네이티브는 1.0 뒤(P3)
의존: P1-04
고유 사항: Badge variant `status`(StatusKind) · `approval`(ApprovalState, 라벨은 `APPROVAL_LABELS`) · `count`(`formatCount`, 99+) · `module`(ModuleGroup). Avatar 24·32·40·48, 이니셜 fallback(한글 첫 글자). ModuleIcon은 icons 패키지 생성물 사용, `moduleId` prop(ModuleId). 셋 다 네이티브 true.
사람 확인: 없음

### P1-07 Card · NotificationCard
상태: ☑ 완료 2026-11-10(웹) — Card · NotificationCard: 스토리(NotificationCard Matrix · States, Card는 states 기본 하나) · VRT 4 · 4장, 공통 증거는 위. 네이티브는 1.0 뒤(P3)
의존: P1-06
고유 사항: Card variant default·interactive(hover 상승 없음, border 강조)·notification. NotificationCard = ModuleIcon + 제목 + 상태 한 줄 + 우상단 count/approval Badge, `onPress` 필수, 전체가 하나의 버튼(role=button 또는 `<a>`). `span` prop(4·6·12)은 DashboardGrid에서 사용. 네이티브 true.
사람 확인: Theme A 인상과 맞는지 1회

### P1-08 Input
상태: ☑ 완료 2026-11-10(웹) — Input: 스토리 Matrix · States · VRT 8장, 공통 증거는 위. 네이티브는 1.0 뒤(P3)
의존: P1-05
고유 사항: type text·number·amount·search·password. `amount`는 `formatAmount` 마스크(입력 중 천 단위, blur 시 정규화, 우측 정렬, `tl-amount`, `inputMode=numeric`), `search`는 leading 아이콘 + clear 버튼, `password`는 보기 토글(IconButton). `error` 상태는 `aria-invalid` + 메시지 슬롯. Field·라벨은 Phase 2 Form. 네이티브 true.
사람 확인: 없음

### P1-09 Checkbox · Radio · Switch
상태: ☑ 완료 2026-11-10(웹) — Checkbox · RadioGroup · Switch: 스토리 States(Switch는 Matrix도) · VRT 8 · 4 · 8장, 공통 증거는 위. 네이티브는 1.0 뒤(P3)
의존: P1-05
고유 사항: Base UI Checkbox·Radio·Switch 어댑터. indeterminate(Checkbox), RadioGroup 방향, Switch는 라벨 좌/우. 터치 타깃 ≥ 24px(compact)는 패딩으로 확보. 네이티브 true.
사람 확인: 없음

### P1-10 Select
상태: ☑ 완료 2026-11-10(웹) — Select: 스토리 Matrix · States · VRT 8장, 여러 개 고르기는 MultiSelect(P2-17), 공통 증거는 위. 네이티브는 1.0 뒤(P3)
의존: P1-09
고유 사항: single·multi·searchable, 옵션 가상화(≥ 200개), 그룹 헤더, `renderOption` 슬롯, 키보드 타입어헤드. 네이티브 true(바텀시트).
사람 확인: 없음

### P1-11 Tabs
상태: ☑ 완료 2026-11-11(웹) — Tabs contract · spec · 구현 · 예시 · Matrix · States 스토리(e646b75: CSS가 `data-force-state` hover · active · focus를 받는다) · VRT 8장. 네이티브는 1.0 뒤(P3)
의존: P1-05
고유 사항: variant line·pill, 개수 넘침 시 가로 스크롤 + 화살표, 탭마다 count Badge 슬롯, 활성 표시는 `brand.default`. 네이티브 true.
사람 확인: 없음

### P1-12 Dialog · Drawer
상태: ☑ 완료 2026-11-10(웹) — Dialog · Drawer: 예시 스토리 · VRT 8 · 4장(트리거로 여는 겹침 컴포넌트라 Matrix · States 없음, D-105), 공통 증거는 위. 네이티브는 1.0 뒤(P3)
의존: P1-05
고유 사항: size sm·md·lg·fullscreen, Drawer는 side right(기본)·left·bottom, 포커스 트랩·ESC·배경 클릭 옵션, 중첩 금지 개발 경고(ListDetail 규칙), 하단 ActionBar 슬롯(저장 우하단·취소 좌). 네이티브 true(Modal·바텀시트).
사람 확인: 없음

### P1-13 Toast
상태: ☑ 완료 2026-11-10(웹) — Toast: 스토리 Matrix · VRT 8장(contract states 기본 하나), 공통 증거는 위. 네이티브는 1.0 뒤(P3)
의존: P1-06
고유 사항: status 4종, 액션 1개, 자동 닫힘 5s(hover 시 멈춤), 큐 최대 3, `useToast()` + Provider 큐, `role=status`/`alert`(danger). 네이티브 true.
사람 확인: 없음

### P1-14 AppShell
상태: ☑ 완료 2026-11-11(웹) — AppShell · SideNav contract · spec · 구현 · 예시 · States 스토리(e646b75: AppShell loading = `busy`, SideNav hover · active · focus) · VRT 8 · 8장. 네이티브는 1.0 뒤(P3)
의존: P1-06, P1-11
고유 사항: 글로벌 바 48(로고 슬롯·통합검색 슬롯·알림·프로필), 사이드바 240/접힘 64(`modules.json` 4그룹 메뉴, 활성 모듈 `module.*.default` 표시, 접힘 시 아이콘만 + 툴팁 대체 `title`), 브레드크럼, 콘텐츠 최대 1440·거터 토큰, 1024 미만은 사이드바 오버레이. 네이티브 true(탭바 + 스택, 화면은 props).
사람 확인: 레이아웃 치수 검토

### P1-15 DataGrid
상태: ◐ 진행 — 2026-11-10 확인: DataGrid contract · spec · 구현 · 예시 · States 스토리 · VRT 8장, 업무 기능은 PR-06. 남은 것: 완료 조건 추가 항목 미달. 엔트리 gz 97.5KB로 45KB 예산을 넘는다(2026-11-10 측정, D-105). 예산 판단은 P3-14. 네이티브는 1.0 뒤(P3)
의존: P1-09, P1-13
고유 사항: TanStack Table + Virtual. 정렬·필터(열 헤더)·고정열(좌 n)·행 선택(Checkbox)·인라인 편집(Input, Enter 저장·Esc 취소)·합계행(amount 열 자동 합)·열 타입 `text|number|amount|date|badge`(amount는 `tl-amount`, badge는 Badge). 행 높이 `--tl-density-row-height`(compact 32). 키보드: 셀 이동 화살표, 행 선택 Space. 1000행 스토리에서 60fps 스크롤. 빈 상태는 Phase 2 EmptyState 전까지 텍스트. 네이티브 `ListTable`(Phase 3, 고정 열·편집 없음).
완료 조건 추가: `DataGrid` 엔트리 gz ≤ 45KB(size-limit은 Phase 3에 켜지만 지금 측정해 기록)
사람 확인: compact 13px 가독 검토(G2 항목 선행 확인)

### P1-16 CI 게이트 완성 v1
상태: ◐ 진행 — 2026-11-10 확인: PR-05에서 CI 4잡(verify · checks · vrt · changeset, `.github/workflows/ci.yml`)이 2d48e11에서 초록불(D-68). 남은 것: 의도적 위반 PR 3종 확인, parity 스크립트 연결(P1-01 뒤), 커버리지 80%
의존: P1-04, P1-03
목표: pipeline.md §2의 게이트 1~8과 10(changeset check)이 PR에서 모두 돌고 실패 조건이 실제로 실패시킨다.
산출물: `.github/workflows/ci.yml` 최종, `scripts/check-spec-parity.mjs` CI 연결(`--phase 1`), 커버리지 임계 80%.
완료 조건:
- 의도적 위반 PR 3종(raw hex, spec 없는 컴포넌트, VRT 스냅샷 누락)이 각각 해당 잡에서 실패함을 확인하고 PR 닫기
- 정상 PR이 전부 녹색
사람 확인: 없음

### P1-17 에이전트 스킬
상태: ☐ 대기
의존: P1-05(한 컴포넌트가 완성된 뒤 그 과정을 스킬로 추출)
목표: pipeline.md §10의 스킬 중 `new-component`·`token-change`·`review-pr`를 `.claude/skills/ds/`에 작성한다.
산출물: `.claude/skills/ds/new-component/SKILL.md`(spec 작성 → contract → 웹 → (범위 내) 네이티브 → 스토리 → 테스트 → VRT → changeset, DoD 자기검증 체크리스트 포함), `token-change/SKILL.md`, `review-pr/SKILL.md`, 각 스킬에 예시 1개.
완료 조건:
- 새 세션에서 `/ds:new-component Tag`(P2 범위 밖 가짜 컴포넌트)를 실행해 DoD 10항목이 자동으로 채워지는지 확인한 뒤 결과를 **커밋하지 않고** 폐기
사람 확인: 스킬 문구 검토

### P1-19 차트 계열 정식화(D-39)
상태: ◐ 진행 — 2026-11-10 확인: 차트 14종(ChartCard · TrendChart · ComboChart · BarList · WaterfallChart · Donut · SegmentedBar · CalendarHeatmap · Sparkline · Legend · RadialMeter · BulletBar · DataBar · HeatCell) 스토리 · VRT 있음. Button만 넣은 번들에 recharts 글자 0(TrendChart 번들은 188, D-105 측정). 남은 것: `_internal/chart/Glyph.tsx` → `<Icon>` 교체, parity 스크립트(P1-01), 팔레트 사람 확인
의존: P1-04
목표: 선행 반입된 차트 14종을 컴포넌트 DoD에 맞춘다 — 스토리(Default · States · Density + 고유) · a11y 애드온 0 · VRT 4조합 · contract 테스트 유틸 연결 · `Glyph` → `Icon` 교체.
산출물: `packages/react/src/<Name>/<Name>.stories.tsx` 14, VRT 스냅샷, `docs/spec/components.md` §11 보강, 네이티브 contract `platforms.native` 유지(구현은 P3).
완료 조건:
- `node scripts/check-spec-parity.mjs --phase 1`에 차트 14종 포함 통과
- `pnpm vrt` 차트 스토리 통과, Storybook a11y violation 0
- `pnpm --filter @terracelab/trellis-react build`가 `./charts` 엔트리를 내보내고 `Button`만 import 시 번들에 `recharts` 문자열 없음
사람 확인: 차트 팔레트(`notes/chart-palette-2026-11.md`)와 다크 계열 색 ≠ 다크 모듈 색 승인

### P1-18 0.1.0 패키징 검증
상태: ☐ 1.0 뒤 — pack으로 외부 앱 설치를 보는 npm 경로 검증이라 공개 배포(PF-04)와 함께 한다. 1.0의 소비 검증은 하위 모듈 서비스(PF-16 · P2-19)가 하고, 트리셰이킹은 2026-11-10 측정으로 확인했다(D-105). D-102 제안
의존: P1-05 ~ P1-15, P1-16
목표: tokens·icons·contracts·react를 `pnpm pack`으로 묶어 외부 Vite 앱에서 설치·렌더되는지 확인하고 0.1.0 changeset을 만든다.
산출물: `scripts/smoke-consumer.sh`(임시 디렉터리에 Vite React 앱 생성 → tgz 설치 → Button·DataGrid 렌더 → Playwright 스크린샷), changeset(minor, "P0 14종 웹 구현").
완료 조건:
- `bash scripts/smoke-consumer.sh` 종료 코드 0, 스크린샷에 Button 표시
- 소비 앱에서 `import '@terracelab/trellis-react/styles.css'` 와 `import { Button } from '@terracelab/trellis-react/Button'` 모두 동작, 트리셰이킹 확인(`Button`만 import 시 번들에 `DataGrid` 문자열 없음)
사람 확인: Phase 1 완료 보고 확인, D4 결정
