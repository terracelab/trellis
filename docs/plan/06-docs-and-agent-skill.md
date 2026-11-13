# 트랙 D · 문서 배포 + 에이전트 스킬 — Phase 2~4에 걸친 병렬 트랙

사이트: **`trellis.terracelab.co.kr`**(apps/docs, Starlight) · **`one.terracelab.co.kr`**(apps/one, 테라스원 소개) — D-45. 도메인(`trellis-design.com` · `terrace-one.com`)은 나중에 산다.
목표: Trellis를 **브랜드 페이지 + 설치·사용 가이드 + 버전별 레퍼런스**로 배포하고, 소비 앱의 에이전트가 **설치된 버전의 문서를 받아 컴포넌트·화면을 개발**할 수 있는 스킬을 함께 배포한다.
규격: `docs/spec/distribution.md`. 결정: D-41(사이트 스택) · D-42(문서는 패키지 동봉) · D-43(스킬 npm 배포) · D-44(브랜드 페이지 범위).
사람 작업: 브랜드 페이지 시각 검토, 도메인·호스팅·공개 범위 결정, 가이드 문장 검토.
게이트: **GD 사이트 공개**(distribution.md §6). G3(1.0)의 시험 서비스 항목은 P2-19가 증명한다(D-102 제안). 1.0에 드는 것은 동봉 문서 · 스킬이고 사이트 공개(PD-06)는 계정 일정을 따른다.

시작 조건: PD-01·PD-02는 P1-01(contracts 기반) 뒤 바로 시작할 수 있고 **지금도 차트 14종으로 시범 가동**할 수 있다. 버전별 스냅샷(PD-05)과 공개 npm 설치 검증은 PF-04·P3-12 뒤(D-50).

---

### PD-01 동봉 문서 생성기 (`dist/docs/`)
상태: ☑ 완료 2026-11-07 — 컴포넌트 14 · 예시 21 · 가이드 9, manifest 70KB · llms 3.0KB · full 87KB. Django 복사는 P3-10(Django 패키지 빌드), CI `docs` 잡은 P1-16(CI 게이트 v1)으로 넘겼다
의존: P1-01
목표: distribution.md §2의 `manifest.json` · `llms.txt` · `llms-full.txt` · `components/<Name>.md` · `guides/*.md`를 빌드가 만들고 검증한다.
산출물: `scripts/build-docs.mjs`(+ `.d.mts`, zod 스키마 내장 — contracts spec+contract 메타 · react `<Name>.examples.tsx` · tokens flat/src 설명 · modules.json · `docs/guides/*.md` · CHANGELOG(없으면 .changeset 미배포 목록) → `packages/react/dist/docs/`, Node ESM 로드 검증), `packages/react/test/docs.test.ts`, `packages/react/package.json` `exports["./docs/*"]`, 루트 `pnpm build:docs`, react `build` 마지막 단계 + turbo inputs(`docs/guides/**` 등), `docs/guides/` 9편(소개 · 설치 · CSS·테마·밀도 · 원칙과 규칙 · 차트 고르기 · 패턴 · 에이전트로 개발하기 · 버전 정책 · Figma), 예시 14파일(`packages/react/src/<Name>/<Name>.examples.tsx`, D-46). 넘김: Django 복사 → P3-10, CI 잡 → P1-16.
작업: Props 표는 `contract.props` 메타에서 생성(react-docgen 아님). 사용 예는 `<Name>.examples.tsx`(타입 검사를 받는 실제 코드, 스토리는 P1-04에서 이 파일을 재사용). 생성물은 커밋하지 않는다(dist).
완료 조건:
- `pnpm build:docs && pnpm --filter @terracelab/trellis-react exec vitest run test/docs.test.ts` 통과(스키마 · 컴포넌트 수 = contracts 폴더 수 · 링크 유효 · 크기 한도)
- `node -e "import('@terracelab/trellis-react/docs/manifest.json',{with:{type:'json'}}).then(m=>console.log(m.default.components.length))"` 가 contracts 수를 출력
- 금칙어 검사(build-docs `FORBIDDEN` + 저장소 밖 목록) 0건
사람 확인: `docs/guides/install.md`·`usage.md` 문장 검토

### PD-02 소비 앱용 스킬 패키지 `@terracelab/trellis-skill`
상태: ◐ 진행 — 2026-11-08 `packages/skill`: SKILL.md · references(blocks · do-dont · request · workflow), `install` · `doctor` · `docs`(git 하위 모듈 경로 기준, 테스트 9). 남은 것: `update`(사이트 manifest 비교), npm 배포 경로로 문서 읽기(PF-04 뒤), Renovate 프리셋
의존: PD-01
목표: distribution.md §4의 스킬(SKILL.md · references 3 · CLI install/doctor/docs/update)을 패키지로 만들고 빈 앱에서 설치·진단이 돈다.
산출물: `packages/skill/`(fixed group에 추가), `skills/trellis/SKILL.md`(§4.4 초안을 다듬어 확정), `references/{workflow,do-dont,request-component}.md`, `bin/trellis-skill.mjs`, `test/`(픽스처 Vite 앱: install → `.claude/skills/trellis/` 생성 · `.trellis/skill.lock` · doctor 종료 코드 · docs 출력 스냅샷 · update --check 모킹), `.github/ISSUE_TEMPLATE/spec-request.yml`(DS 레포가 받는 컴포넌트 요청 양식).
작업: doctor의 드리프트 스캔은 P4-01 `scripts/drift-scan.mjs`의 규칙을 공유 모듈(`packages/skill/src/drift.mjs`)로 빼서 양쪽이 같은 규칙을 쓴다. 네트워크는 `update`에서만.
완료 조건:
- `pnpm --filter @terracelab/trellis-skill test` 통과
- 임시 디렉터리 빈 Vite 앱에서 `pnpm add` 로컬 tgz → `npx trellis-skill install` → `.claude/skills/trellis/SKILL.md` 존재, `npx trellis-skill doctor` 종료 0, `#fff` 삽입 후 종료 1 + 후보 `--tl-color-base-white` 제안
- `npx trellis-skill docs component Button` 출력이 `dist/docs/components/Button.md`와 같다
사람 확인: SKILL.md 문구(에이전트에게 주는 지시) 검토

### PD-03 문서 사이트 골격 + 브랜드 페이지 + 시작하기
상태: ◐ 진행 — 사이트 · 브랜드 페이지 · 시작하기 · 검사 완료(axe 0 · 외부 요청 0 · 링크 0 · 콘솔 오류 0, 스크린샷 `notes/sites-2026-11/`). 남은 것: Lighthouse 성능 ≥ 90은 배포 URL에서 측정(PD-06 뒤), 브랜드 페이지 시각 승인
의존: PD-01, P0-07(쇼케이스 조각)
목표: `apps/docs`(Astro + Starlight)를 세우고 브랜드 페이지 `/`와 `/docs/latest/` 시작하기를 Trellis 토큰만으로 만든다.
산출물: `apps/docs/`(astro.config, Starlight, React 섬 `<Live>`로 실제 `@terracelab/trellis-react` 렌더, `tokens.css`·Pretendard 셀프호스트, 외부 요청 0), 브랜드 페이지(히어로 = `apps/preview` 분자 지도·카드 월 조각을 패키지화해 재사용(`apps/preview/src/sections/showcase.ts`의 SVG 생성기를 `packages/…` 또는 `apps/docs/src/showcase/`로 이동) · 원칙 6 · 토큰 한눈에 Light/Dark 스위치 · 컴포넌트 갤러리 · 제품 4 문구 · 설치 CTA · Figma 링크 · 버전 배지), 시작하기 4페이지(설치 · CSS 순서/Provider · Tailwind preset · Django/네이티브), `apps/docs/scripts/check.mjs`(axe · 외부 요청 0 · 링크 깨짐 0 · Lighthouse 성능 ≥ 90).
작업: 디자인은 미리보기와 같은 규칙(unslop: 크롬은 조용히, 색은 타일·차트에만). 카피는 테라스원 기준으로 새로 쓴다.
완료 조건:
- `pnpm --filter @terracelab/docs build && pnpm --filter @terracelab/docs check` 통과
- 1440·390 스크린샷 각 1장을 `docs/plan/notes/sites-2026-11/`에 남김
사람 확인: 브랜드 페이지 시각 검토(Patrick) — 아티팩트로 게시

### PD-04 레퍼런스 자동 생성 페이지
상태: ◐ 진행 — 컴포넌트 14쪽(라이브 예시 · Props · 상태), 토큰 · 모듈 쪽, `/api/latest` · `/api/v0.0` · `/llms.txt` 완료, 전 컴포넌트 페이지 라이트·다크 axe 0 · 콘솔 오류 0. 남은 것: Storybook 링크 · `/storybook/`(P1-04 뒤), Figma 컴포넌트 링크
의존: PD-03, P1-04
목표: `dist/docs/`의 컴포넌트·토큰 문서를 사이트 content collection으로 렌더하고 Storybook·Figma 링크를 단다.
산출물: `apps/docs/scripts/sync-content.mjs`(① 폴더 → Starlight 콘텐츠 · `/api` · `/llms.txt`, 생성물은 .gitignore), 컴포넌트 페이지 템플릿(Props 표 · 상태 · a11y · 라이브 예시 · Storybook 링크 · Figma 컴포넌트 링크 `figma-state`의 키), 토큰 페이지(semantic 표 + 대비 + Light/Dark), `/storybook/` 정적 빌드 포함, `/api/latest/manifest.json` · `/llms.txt` 라우트.
완료 조건:
- 컴포넌트 페이지 수 = manifest.components 수, 모든 라이브 예시가 콘솔 에러 0으로 렌더(Playwright)
- `curl /api/latest/manifest.json | jq .version` = 패키지 버전
사람 확인: 없음

### PD-05 버전별 문서 + 릴리즈 연동
상태: ☐ 1.0 뒤 — 버전별 문서는 릴리즈 파이프라인(P3-12)과 공개 배포 뒤에 의미가 있다(D-102 제안)
의존: PD-04, P3-12
목표: 릴리즈 태그마다 문서 스냅샷을 남기고 `latest` 별칭과 버전 선택기를 가동한다(distribution.md §3 버전 정책·§5).
산출물: `apps/docs/versions/v<x.y>/`(스냅샷, 커밋), `scripts/docs-snapshot.mjs`, `release.yml` 단계(publish → build:docs → snapshot 커밋 → 사이트 배포 → 별칭), 사이드바 버전 선택기, `/docs/v<x.y>/…`·`/api/v<x.y>/manifest.json`·`/skill/v<x.y>/SKILL.md`, 보존 정책(5버전).
완료 조건:
- 테스트 릴리즈 2회(`0.3.0`, `0.3.1`)로 `/docs/v0.3/`가 덮어써지고 `/docs/latest/`가 최신을 가리킴, `/api/v0.3/manifest.json`·`/api/latest/`의 version 일치
- 롤백 스크립트로 `latest`만 이전 버전으로 되돌림 확인
사람 확인: 없음

### PD-06 호스팅 · 도메인 · 공개
상태: ⛔ 막힘(Cloudflare 계정 · DNS 접근 · GitHub 원격 저장소가 필요 — 워크플로·안내는 준비 완료)
넘김: ① Cloudflare Pages 프로젝트 `trellis-docs` · `terrace-one` 생성 ② `terracelab.co.kr` DNS에 CNAME `trellis` · `one` ③ Secrets `CLOUDFLARE_API_TOKEN` · `CLOUDFLARE_ACCOUNT_ID` ④ 저장소 GitHub 원격. 선택지: Cloudflare Pages(추천, 무료 · 존 이전 불필요) / 사설 서버 nginx 정적 서빙 / GitHub Pages(저장소당 도메인 1개라 비추천). 절차 `docs/plan/notes/sites-hosting.md`
의존: PD-03
목표: 사이트를 정적 호스팅에 배포하고 도메인을 붙인다.
산출물: `.github/workflows/sites.yml`(main 푸시 → 두 사이트 빌드 · 검사 · Cloudflare Pages 배포), 색인 스위치 `SITE_INDEXABLE`(noindex 메타 + `robots.txt` 생성), `docs/plan/notes/sites-hosting.md`(DNS · 토큰 · 공개 · 롤백 · 비용).
완료 조건: `https://trellis.terracelab.co.kr`의 `/` · `/docs/guide/overview/` · `/llms.txt` · `/api/latest/manifest.json`, `https://one.terracelab.co.kr/` 200 · HTTPS · 외부 요청 0, 배포 URL Lighthouse 성능 ≥ 90
사람 확인: 호스팅 계정 · DNS · 공개 범위 결정(도메인 구매는 나중)

### PD-07 에이전트 E2E — 빈 앱에서 홈 1화면
상태: ⛔ 대체 — P2-19(인사 화면 시험 서비스)가 같은 증명을 하고 G3에서 다시 돌린다(D-102 제안)
의존: PD-02, P2-11(NotificationHome 템플릿)
목표: 스킬만으로 에이전트가 Trellis 화면을 만들 수 있음을 시간과 함께 증명한다(G3 채택 항목).
산출물: `scripts/agent-e2e.sh`(빈 Vite 앱 생성 → 패키지·스킬 설치 → Claude Code 비대화 실행 `/trellis 알림 카드 홈 만들어줘` → doctor·린트·스크린샷 → 소요 시간 기록), 결과 `docs/plan/notes/agent-e2e-<date>.md`.
완료 조건: drift 0 · doctor 0 · 1440/390 스크린샷 · 30분 이내. 실패하면 SKILL.md·가이드를 고쳐 재시도(3회 규칙)
사람 확인: 결과 화면 검토

### PD-09 테라스원 제품 소개 사이트 (`one.terracelab.co.kr`)
상태: ☑ 완료 2026-11-07
의존: P0-07(쇼케이스 조각)
목표: 테라스원(맞춤 구축 서비스, D-49)을 소개하는 한 쪽짜리 사이트를 Trellis 조각만으로 만든다(D-45). 2차는 트랙 F PF-14.
산출물: `apps/one/`(Astro + React, 히어로(분자 지도) · 모듈 20 · 알림 카드 월 · 실제 업무 홈(차트 마운트) · 기기 콜라주 · Trellis 소개, 테마 전환, 폭 1440 · 1024 · 390), `apps/preview` exports(`./showcase` · `./home` · `./charts` · `./styles.css` — 패널 문구는 옵션), `apps/one/scripts/check.mjs`.
완료 조건:
- `pnpm --filter @terracelab/one build && pnpm --filter @terracelab/one check` 통과(1440 라이트·다크 · 1024 · 390에서 axe 0 · 외부 요청 0 · 콘솔 오류 0 · 차트 마운트)
사람 확인: 제품 문구("스무 가지 업무" 등)와 미리보기 고지 문구, 공개 범위

### PD-10 Trellis 소개 사이트 + GitHub Pages 묶음 배포
상태: ☑ 완료 2026-11-12 — `https://terracelab.github.io/trellis/`(공개 저장소 `terracelab/terracelab.github.io`의 `trellis/`, 배포 커밋 42bab63). 묶음 검사 통과(5쪽 × 1440 라이트 · 다크 · 390, axe 0 · 외부 요청 0 · 콘솔 오류 0 · 내부 링크 139개 · 넘침 0, 경로 `/trellis/`와 `/` 둘 다), 환경 변수 없이 docs(4조각) · one · demo 검사 통과, `pnpm lint` · `typecheck` · `test` 통과, 배포 주소 7곳 200. 남은 것: 홈 문구와 화면 확인(사람), 영어 소개 페이지, CI에서 올리기(배포 키), 저장소 원격에 푸시
의존: PD-03 · PD-04(문서 사이트), PF-01(데모), D-58(회사 테마 엔진)
목표: Trellis를 소개하는 사이트를 만들고 문서 · 데모와 한 묶음으로 GitHub Pages에 올린다(D-148, 2026-11-12 Patrick 요청).
산출물: `apps/site/`(Astro + React. 홈 · `/components/` · `/blocks/` · `/themes/` · 404, 회사 색 프리셋 `presets.css`, 블록 그림 `public/blocks/`), `apps/site/scripts/`(`shots.mjs` 블록 그림 · `assemble.mjs` 문서와 데모 묶기 · `check.mjs` 묶음 검사 · `deploy.mjs` 정적 저장소로 올리기), `SITE_URL` · `SITE_BASE`를 읽는 `apps/docs` · `apps/demo`, 조사 노트 `notes/site-survey-2026-11.md`.
작업:
1. 레퍼런스 사이트 전수 조사(구조와 패턴만, 노트로 남긴다)
2. `apps/site` 뼈대: 공통 틀 · 테마 전환 · 회사 색 프리셋(테마 엔진으로 미리 만든 범위 CSS)
3. 홈: 히어로(워드마크 · 한 문장 · 실제 컴포넌트 카드 · 회사 색 고르기) → 네 칸 → 원칙 세 가지 → 업종별 화면 → 마무리
4. 컴포넌트 목록(예시를 서버에서 그린 미리보기 카드) · 화면 블록 목록(데모에서 찍은 그림) · 회사 테마(색을 넣으면 엔진이 계산)
5. 문서 · 데모를 경로 아래에서도 돌게 하고(`SITE_BASE`) 한 폴더로 묶는다
6. 검사 스크립트와 배포 스크립트, 배포
완료 조건:
- `SITE_URL=<주소> SITE_BASE=<경로> pnpm turbo run build --filter=@terracelab/site...` 뒤 `pnpm --filter @terracelab/site check` 통과(소개 페이지 전부 × 1440 라이트 · 다크 · 390에서 axe critical · serious 0, 외부 요청 0, 콘솔 오류 0, 내부 링크 전부 열림, 390에서 가로 넘침 0)
- 환경 변수 없이 `pnpm --filter @terracelab/docs check` · `pnpm --filter @terracelab/one check` · `pnpm --filter @terracelab/demo check` 통과(기존 동작 유지)
- `pnpm lint && pnpm typecheck` 통과
- 배포 주소의 `/` · `/components/` · `/blocks/` · `/themes/` · `/docs/guide/overview/` · `/demo/` · `/llms.txt`가 200
사람 확인: 배포할 공개 저장소와 주소, 홈 문구와 화면, 공개 범위(색인은 `SITE_INDEXABLE=1` 전까지 금지)

### PD-08 문서 품질 주기 작업 (선택)
상태: ☐ 1.0 뒤 — PD-05 · P4-08(둘 다 1.0 뒤)에 기댄다(D-102 제안)
의존: PD-05, P4-08
목표: 주간 docgen 재생성 PR · 링크 검사 · llms 크기 추이를 P4-08 주기 리포트에 합친다.
완료 조건: 수동 트리거 1회로 PR·리포트 생성
사람 확인: 없음

---

## GD 체크리스트 — 사이트 공개 (distribution.md §6)

에이전트 항목
- [ ] PD-01 생성물 검증 통과, 컴포넌트 수 = contracts 수
- [ ] PD-02 빈 앱 install → doctor 통과, docs 출력 = 동봉 문서
- [ ] PD-04 레퍼런스 전 컴포넌트, 라이브 예시 콘솔 에러 0
- [ ] PD-05 버전 ≥ 2 선택 가능, `/llms.txt`·`/api/<v>/manifest.json` 일치
- [ ] PD-07 에이전트 30분 내 홈 1화면 drift 0
- [ ] 사이트 axe 0 · 외부 요청 0 · 링크 깨짐 0 · Lighthouse ≥ 90

사람 항목(Patrick)
- [ ] 브랜드 페이지 시각 승인
- [ ] 도메인·호스팅·공개 범위 확정
- [ ] 가이드·SKILL.md 문장 승인
