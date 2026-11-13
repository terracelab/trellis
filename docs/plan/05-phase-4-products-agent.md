# Phase 4 · 제품 적용·에이전트 — 2027-01-16 → 02-27

목표: **G3 = 1.0**. 1.0은 디자인 시스템 완성이다(D-101). 에이전트가 Trellis만 보고 테라스원 고객사 화면(인사 · 근태 · 휴가 · 급여 · ERP · SCM · 세무 · 회계 · 대시보드)을 회사 색 하나로 만들 수 있으면 1.0이다.
1.0 범위: 토큰 · 회사 테마 · 웹 컴포넌트 · 화면 블록 · 동봉 문서 · 스킬 · Figma 라이브러리. 이 Phase의 제품 적용(P4-02~05)은 1.0 뒤이고(D-101), 이전 도구 · 주기 작업(P4-01 · P4-06~08)도 1.0 뒤로 제안한다(D-102). 작업은 지우지 않고 상태 줄에 이유를 적었다.
사람 작업: G2 뒤 화면 시각 검토, 1.0 API 동결 승인, D0 상표 결과.
산출물: 저장소 태그 `v1.0.0` + major changeset + CHANGELOG, G3 증거 `docs/plan/notes/g3-evidence.md`. 공개 npm 배포는 PF-04(계정 준비 뒤).
규격: `docs/spec/pipeline.md` §5·§8·§9·§10, `docs/spec/distribution.md`.
전제: G2 통과(P2-14). 1.0까지 남은 순서는 `README.md` "실행 순서" 표를 따른다.

---

### P4-01 마이그레이션 도구 · 채택 가이드
상태: ☐ 1.0 뒤 — 기존 제품 저장소를 옮기는 도구라 제품 적용(P4-02~05)과 함께 한다. 새 서비스는 create-service · doctor(PF-16 · PD-02)가 맡는다(D-102 제안)
의존: Phase 3
목표: 소비 레포가 Trellis를 도입할 때 쓰는 스캔·codemod·가이드를 만든다.
산출물: `scripts/drift-scan.mjs <repo>`(raw hex·px·font-family·인라인 color 검출 → `--tl-*` 후보 제안, flat.json 기반 최근접 색 매칭, 마크다운·JSON 출력), `packages/codemods/`(jscodeshift: 색 리터럴 → 토큰 변수, Tailwind 색 클래스 → preset 클래스, 토큰 이름 변경용 `rename-tokens` 템플릿), `docs/guides/adopt.md`(설치, Provider, CSS import, Tailwind preset, Django 설정, 패턴 매핑 표: "기존 화면 유형 → 템플릿"), `.claude/skills/ds/adopt/SKILL.md`, `renovate/trellis.json5`.
완료 조건:
- `node scripts/drift-scan.mjs apps/playground` → 0건(자기 검증), 임시 파일에 `#fff` 넣으면 1건 + 후보 `--tl-color-base-white`
- codemod 픽스처 테스트 통과
사람 확인: 가이드 검토

### P4-02 파일 관리 제품 적용 (DS 측)
상태: ☐ 1.0 뒤 — 제품 적용은 1.0 디자인 시스템으로 고객사 화면이 검증된 뒤 한다(D-101)
의존: P4-01
목표: 파일 관리 제품 레포가 Trellis로 홈·목록·폼·결재·질의응답 화면을 조립하는 동안, 발견되는 빈 컴포넌트·패턴을 DS에 추가하고 0.x 릴리즈를 낸다.
작업: 파일 관리 제품 레포에서 `adopt` 스킬 실행 → 드리프트 리포트 → 화면 유형별 템플릿 매핑 → 스프린트마다 "DS에 없는 것" 목록을 이 작업 밑에 `요청:` 블록으로 기록 → `new-component` 스킬로 추가(P2 범위 중 필요한 것: CommandPalette(cmdk)·TreeView·Chat/MessageList 완성 우선). Tauri 2 쉘 자체는 제품 레포(D4).
완료 조건:
- 파일 관리 제품 홈·목록·폼·결재·질의응답 5화면이 Trellis 컴포넌트만으로 렌더(제품 레포 드리프트 스캔 0건)
- 파일 관리 제품 레포 Renovate가 `@terracelab/trellis-*` 그룹 PR을 생성·automerge(minor)
- DS 측 추가 컴포넌트는 모두 DoD 충족
사람 확인: 화면별 승인

### P4-03 브랜드 운영 제품 홈 교체 (DS 측)
상태: ☐ 1.0 뒤 — 제품 적용은 1.0 디자인 시스템으로 고객사 화면이 검증된 뒤 한다(D-101)
의존: P4-01
목표: 브랜드 운영 제품 홈을 `NotificationHome` 패턴(comfortable density)으로 교체할 때 필요한 DashboardGrid·KpiCard·DataGrid 보완.
완료 조건:
- 브랜드 운영 제품 홈 화면 드리프트 스캔 0건, comfortable 모드 VRT 통과
사람 확인: 홈 승인

### P4-04 식자재 ERP 관리자 적용 (DS 측)
상태: ☐ 1.0 뒤 — 제품 적용이고 Django 패키지(P3-10, 1.0 뒤)가 있어야 한다(D-101)
의존: P3-10
목표: `pip install terracelab-trellis` + unfold 설정 교체로 어드민 톤이 바뀌고, 신규 화면은 템플릿을 쓴다.
완료 조건:
- 식자재 ERP 관리자 settings에 `TRELLIS_UNFOLD` 적용, 로그인·목록 화면 스크린샷 비교 전/후
- React 신규 화면 1개가 `ListDetail` 템플릿으로 시작
사람 확인: 운영 어드민 영향 확인

### P4-05 식자재 ERP 앱 (선택)
상태: ☐ 1.0 뒤 — 제품 적용이고 네이티브 ListTable(P3-08, 1.0 뒤)이 있어야 한다(D-101)
의존: P3-08
목표: 토큰·P0 네이티브만 적용. 일정이 밀리면 1.0 이후로.
완료 조건: 앱의 `TrellisProvider` 적용 + 홈 1화면 `NotificationHome(1열)`.
사람 확인: 일정 판단

### P4-06 드리프트 스캔 일일 잡 + Renovate
상태: ☐ 1.0 뒤 — 제품 저장소를 매일 스캔하는 작업이라 제품 적용 뒤에 의미가 있다(D-102 제안)
의존: P4-01
목표: pipeline.md §5·§9의 매일 스캔과 Renovate 프리셋을 가동한다.
산출물: `.github/workflows/drift-scan.yml`(소비 레포 3개 체크아웃 → 스캔 → 레포별 이슈 1개 갱신), 소비 레포 `renovate.json`이 `github>terracelab/trellis//renovate/trellis` 확장.
완료 조건:
- 수동 트리거 1회로 이슈 3개 생성·갱신 확인
- 소비 레포 Renovate 대시보드에 Trellis 그룹 표시
사람 확인: 없음

### P4-07 에이전트 루프
상태: ☐ 1.0 뒤 — GitHub 비밀 값 · 비용 한도 승인과 릴리즈 파이프라인(P3-12)이 필요하다(D-102 제안)
의존: P1-17, P3-12
목표: pipeline.md §8의 CI 실패 자동 수정(3회 규칙)과 spec-only PR 자동 구현을 가동한다.
산출물: `.github/workflows/agent-fix.yml`(Claude Code GitHub Action, 실패 로그·diff 입력, `fix(ci):` 커밋, 3회 후 `needs-human`), `agent-implement.yml`(`spec-only` 라벨 → `new-component` 스킬), 스킬 보강(`review-pr`을 PR 열림 시 자동 코멘트), `docs/plan/notes/agent-runbook.md`(권한·비용 한도·중단 방법).
완료 조건:
- 의도적 린트 실패 PR → 에이전트가 1회 수정 커밋으로 녹색
- 고칠 수 없는 실패(테스트가 잘못된 기대) PR → 3회 후 `needs-human` 라벨 + 코멘트
- spec.md만 있는 PR(`Tag` 컴포넌트) → 구현·스토리·테스트·VRT 커밋이 붙고 CI 녹색
사람 확인: 토큰 비용 한도, 권한 범위 승인

### P4-08 주기 리포트
상태: ☐ 1.0 뒤 — 주기 리포트는 배포와 제품 사용이 생긴 뒤 의미가 있다(D-102 제안)
의존: P4-06
목표: 매주·매월 작업(pipeline.md §9)을 워크플로로 만든다.
산출물: `weekly.yml`(Renovate는 외부, docgen 재생성 PR, 스냅샷 갱신 검토 목록 이슈), `monthly-report.yml`(미사용 토큰·컴포넌트, size 추이, a11y 전수 → `docs/reports/<YYYY-MM>.md` PR).
완료 조건: 수동 트리거로 각 1회 산출물 생성
사람 확인: 없음

### P4-09 1.0.0 (G3)
상태: ☐ 대기 — 버전 숫자는 2026-11-13에 Patrick 지시로 먼저 1.0.0이 됐다(D-154 · PR-39). G3 체크리스트 증명과 태그 `v1.0.0`은 남아 있다
의존: P2-22, P2-23, P3-13, P3-14, P3-15, `README.md` 실행 순서 표의 1.0 줄 전부
목표: G3 체크리스트를 명령으로 증명하고 저장소에 1.0.0 태그를 단다(D-101 · D-102).
산출물: `docs/plan/notes/g3-evidence.md`(항목별 실행 명령과 결과), 시험 서비스 재실행 결과(P2-19 절차를 G2 뒤 값 · 블록으로), `major` changeset("1.0: API 안정화. 토큰 이름 · props 변경은 이후 major"), CHANGELOG 0.x → 1.0 노트, 태그 `v1.0.0`.
작업: P2-19 절차로 새 시험 서비스를 만들어 회사 색 셋(#fe5c2b · #1F56E2 · #FFD400)으로 돌린다 → G3 에이전트 항목을 차례로 실행해 증거 파일에 적는다 → `figma-sync`로 Figma가 같은지 본다 → 사람 승인 → changeset version · 태그. 공개 npm · PyPI 배포는 하지 않는다(PF-04).
완료 조건:
- G3 체크리스트 에이전트 항목 전부 ☑(증거 파일에 명령 출력)
- `git tag | grep v1.0.0`
- `node scripts/figma-diff.mjs packages/tokens/dist/figma/variables.json <Figma에서 다시 읽은 JSON>` = 변경 없음
사람 확인: G3 승인

---

## G3 체크리스트 — 1.0(디자인 시스템 완성)

정의(D-101): 에이전트가 Trellis만 보고 테라스원 고객사 화면(인사 · 근태 · 휴가 · 급여 · ERP · SCM · 세무 · 회계 · 대시보드)을 회사 색 하나로 만들 수 있다. 아래 항목은 전부 명령으로 증명한다.

에이전트 항목(증거: `docs/plan/notes/g3-evidence.md`)
- [ ] 시험 서비스 통과: P2-19 절차를 G2 뒤 값으로 다시 돌려 스킬만 읽은 에이전트가 화면 5개를 만들고, 회사 색 셋(#fe5c2b · #1F56E2 · #FFD400)에서 `trellis-skill doctor` 종료 0 · `pnpm lint` · `pnpm typecheck` · axe critical · serious 0(1440 · 390 × 라이트 · 다크) · 토큰 밖 값 0. 회사 색은 `pnpm ds:theme` 또는 `TrellisProvider theme={{ brand }}` 한 곳만 바꾼다
- [ ] 블록이 업무 영역 9개를 덮는다: 인사(`erp/hr-payroll/employees` · `hr-master` · `org-chart`) · 근태(`groupware/attendance/*`) · 휴가(P2-12 휴가 신청) · 급여(`erp/hr-payroll/payroll` · `payslip`) · ERP(`erp/purchasing` · `sales` · `production`) · SCM(`scm/*`) · 세무(`erp/tax/*`) · 회계(`erp/accounting/*` · `erp/treasury/*`) · 대시보드(`home/*` · P2-12 역할별 홈). `node blocks/scripts/check-blocks.mjs` 통과, `manifest.blocks` 수 = `find blocks/src -name block.json | wc -l`
- [ ] 데모 검사: `pnpm --filter @terracelab/demo check` 전 화면 × 1440 · 390 × 라이트 · 다크 axe 0, G2 화면 7종은 회사 색 셋 × 고대비까지(P2-13 스크립트)
- [ ] 웹 컴포넌트 DoD: contracts 폴더 수 = react = 생성 스토리 = VRT 폴더, `pnpm --filter @terracelab/storybook test` · `pnpm vrt` 통과, Storybook axe 위반 0, `node scripts/check-spec-parity.mjs --phase 2` 통과(P1-01)
- [ ] 회사 테마: `pnpm --filter @terracelab/trellis-tokens test`(대비 4모드 · 기본 테마 = 엔진 · 검증 색 못 넘는 쌍 0)
- [ ] 동봉 문서 완비: `pnpm build:docs` · `packages/react/test/docs.test.ts` 통과(컴포넌트 수 = contracts 수, `manifest.blocks` 있음), `check:i18n --strict` 통과
- [ ] 스킬 완비: `pnpm --filter @terracelab/trellis-skill test` 통과, 시험 서비스에서 install → doctor → docs 흐름이 막힘 없이 끝남(P2-19 결과 노트의 스킬 쪽 막힘 0)
- [ ] Figma 라이브러리: 초안(P2-15 · P2-16 · P2-20)이 G2 뒤 다시 맞춰졌고(P2-22) `figma-diff` = 변경 없음
- [ ] 저장소 전체 `pnpm lint && pnpm typecheck && pnpm test` 통과, CI main 초록불

사람 항목(Patrick)
- [ ] 시험 서비스 화면 시각 승인(회사 색 셋)
- [ ] 1.0 API 동결 승인(이후 토큰 이름 · props 변경은 major)
- [ ] D0 상표 · 도메인 결과 반영(이름 유지 / 변경 시 codemod 계획)
- [ ] 승인 → 태그 `v1.0.0`. 공개 npm · PyPI 배포는 계정이 준비되면 PF-04
