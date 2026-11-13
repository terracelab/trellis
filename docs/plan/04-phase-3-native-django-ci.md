# Phase 3 · 네이티브·Django·CI — 2026-12-19 → 2027-01-15

목표: Expo P0 14종, Django pip 패키지 + unfold 적용, 사설 레지스트리, 릴리즈 파이프라인, VRT 안정화, 번들 예산, Dark 검수.
사람 작업: D5 레지스트리 결정·서버 준비(1/15), Dark 화면 검수, 첫 publish 승인.
산출물: `@terracelab/trellis-native` 0.1, `terracelab-trellis` 0.1(PyPI), 전 패키지 0.3.0 첫 publish, 레지스트리.
규격: `docs/spec/components.md` §9, `docs/spec/pipeline.md` §2·§4·§6.
전제: G2 통과. 일정이 밀리면 P3-02~P3-08(Expo)을 Phase 4 뒤로 미루고 P3-09 이후를 먼저 한다.
1.0 범위(D-101 · D-102): 네이티브 P3-01~09 · Django P3-10 · 배포 P3-12는 1.0 뒤다. 작업은 그대로 두고 상태 줄에 이유를 적었다. 1.0에 남는 것은 P3-13 VRT 안정화 · P3-14 번들 예산 · P3-15 다크 검수다.

---

### P3-01 native 패키지 골격 + 플레이그라운드
상태: ☐ 1.0 뒤 — 네이티브는 웹 화면이 고객사 구축에서 검증된 뒤 같은 contract와 토큰으로 시작한다(D-101)
의존: G2
목표: Expo 라이브러리 패키지와 갤러리 앱, jest-expo 테스트, contract 테스트 연결.
산출물: `packages/native/`(react-native-builder-bob, `src/provider/TrellisProvider.tsx`, `_internal/{useTheme,useDensity,makeStyles,usePressableState}.ts`, `useTrellisFonts()`), `apps/native-playground/`(Expo 앱, 갤러리 화면: 컴포넌트별 `*.gallery.tsx` 자동 등록, theme·density 토글), `packages/native/jest.config.js`(jest-expo), parity 스크립트 `--phase 3` 로 전환.
완료 조건:
- `pnpm --filter @terracelab/trellis-native build && pnpm --filter @terracelab/trellis-native test` 통과(Provider·useTheme 테스트)
- `pnpm --filter native-playground start` 로 iOS 시뮬레이터 또는 Expo Go에서 갤러리 홈 렌더(스크린샷 `apps/native-playground/screenshots/home.png` 커밋)
- `import { themes } from '@terracelab/trellis-tokens/native'` 가 Metro에서 해석됨
사람 확인: 없음

### P3-02 Button · IconButton · Badge · Avatar · ModuleIcon (native)
상태: ☐ 1.0 뒤 — 네이티브는 웹 화면이 고객사 구축에서 검증된 뒤 같은 contract와 토큰으로 시작한다(D-101)
의존: P3-01
고유 사항: Pressable 상태 매핑, ModuleIcon은 icons 패키지 rn 생성물, Badge count/approval/status/module. 완료 조건 = 컴포넌트 DoD 3·5·7(jest 스냅샷)·9 + 갤러리 등록 + contract 테스트 통과.

### P3-03 Card · NotificationCard · Toast (native)
상태: ☐ 1.0 뒤 — 네이티브는 웹 화면이 고객사 구축에서 검증된 뒤 같은 contract와 토큰으로 시작한다(D-101)
의존: P3-02
고유 사항: Toast는 자체 오버레이(SafeArea 고려), 큐 3, 스와이프 닫기.

### P3-04 Input · Checkbox · Radio · Switch (native)
상태: ☐ 1.0 뒤 — 네이티브는 웹 화면이 고객사 구축에서 검증된 뒤 같은 contract와 토큰으로 시작한다(D-101)
의존: P3-02
고유 사항: amount 마스크는 `_shared/format.ts` 공유, 키보드 타입 numeric, 포커스 테두리 = `border.focus`.

### P3-05 Select · Tabs (native)
상태: ☐ 1.0 뒤 — 네이티브는 웹 화면이 고객사 구축에서 검증된 뒤 같은 contract와 토큰으로 시작한다(D-101)
의존: P3-04
고유 사항: Select → 바텀시트(검색 포함, multi 체크), Tabs 가로 스크롤 + 활성 밑줄.

### P3-06 Dialog · Drawer (native)
상태: ☐ 1.0 뒤 — 네이티브는 웹 화면이 고객사 구축에서 검증된 뒤 같은 contract와 토큰으로 시작한다(D-101)
의존: P3-02
고유 사항: Dialog = Modal 중앙, Drawer = 바텀시트(right/left는 fullscreen 모달로 대체, spec "플랫폼 차이"에 명시).

### P3-07 AppShell (native)
상태: ☐ 1.0 뒤 — 네이티브는 웹 화면이 고객사 구축에서 검증된 뒤 같은 contract와 토큰으로 시작한다(D-101)
의존: P3-02, P3-05
고유 사항: 하단 탭바(모듈 그룹 4 + 홈) + 상단 요약 바 + 스택 헤더. 네비게이션 라이브러리 비의존(화면·현재 키를 props로). 모바일 홈 패턴(NotificationHome 1열) 포함.

### P3-08 ListTable (DataGrid native)
상태: ☐ 1.0 뒤 — 네이티브는 웹 화면이 고객사 구축에서 검증된 뒤 같은 contract와 토큰으로 시작한다(D-101)
의존: P3-04
고유 사항: FlatList, 고정 열(좌 1), 열 타입 text/number/amount/date/badge, 정렬(헤더 탭), 행 선택, 무한스크롤, 편집 없음. contract는 `DataGrid`를 공유하되 `platforms.native` 주석에 미지원 props(inlineEdit·pinnedColumns>1) 명시, 전달 시 개발 경고.

### P3-09 contract 교차 검증 CI
상태: ☐ 1.0 뒤 — 두 플랫폼 교차 검증이라 네이티브(P3-02~08)가 있어야 의미가 있다(D-102 제안)
의존: P3-02 ~ P3-08
목표: 두 플랫폼의 contract 테스트와 parity 스크립트를 CI 게이트로 묶고 API diff 리포트를 만든다.
산출물: `ci.yml`에 `native-test`(jest-expo) 잡, `scripts/api-diff.mjs`(react·native 각 컴포넌트의 props 타입을 `tsc` 선언에서 추출해 contract와 비교 → 마크다운 PR 코멘트).
완료 조건:
- `node scripts/check-spec-parity.mjs --phase 3` 통과(P0 14종 양 플랫폼)
- 의도적으로 native Button에 prop 하나를 빼고 PR → api-diff 코멘트에 노출, CI 실패 확인 후 되돌림
사람 확인: 없음

### P3-10 Django 패키지
상태: ☐ 1.0 뒤 — Django 패키지는 식자재 ERP 관리자 적용(P4-04)과 함께 한다. 1.0의 고객사 화면은 웹 블록이다(D-101)
의존: G2
목표: `terracelab-trellis` pip 패키지로 토큰 CSS·폰트·아이콘·unfold-patrick 테마를 배포하고 예제 프로젝트로 검증한다.
산출물: `packages/django/pyproject.toml`(hatchling, 버전은 changesets가 `scripts/sync-py-version.mjs`로 주입), `terracelab_trellis/{__init__,apps,unfold}.py`, `terracelab_trellis/static/trellis/{tokens.css,fonts.css,fonts/,icons/module-icons/png/}`(빌드 시 tokens·icons dist에서 복사, `turbo` 의존), `terracelab_trellis/templatetags/trellis.py`(`{% trellis_css %}`, `{% trellis_module_icon "approval" 32 %}`), `terracelab_trellis/templates/trellis/base.html`(data-theme·data-density 속성 + CSS 링크), `unfold.py`: `TRELLIS_UNFOLD = trellis_unfold_settings(theme="light")` → unfold-patrick `UNFOLD["COLORS"]` 등에 토큰 값 매핑, `apps/django-example/`(settings에 적용, 어드민 1화면, pytest-django 스모크), `packages/django/tests/`.
작업: Python 3.12, uv. 정적 파일만 포함하고 템플릿 컴포넌트는 만들지 않는다(원문: 어드민은 테마 설정만 교체).
완료 조건:
- `cd packages/django && uv build && uv run pytest` 통과(static 존재, 템플릿 태그 렌더, unfold 설정 키)
- `apps/django-example`에서 `uv run python manage.py check && uv run pytest` 통과, 어드민 로그인 화면 스크린샷에 Pretendard·캔버스 색 적용(Playwright) → `apps/django-example/screenshots/admin.png`
사람 확인: 식자재 ERP 관리자 unfold-patrick 버전과 설정 키 호환 확인

### P3-11 사설 레지스트리
상태: ⛔ 대체 — D-50(오픈소스 공개)으로 사설 레지스트리를 세우지 않는다. 공개 npm · PyPI 배포는 트랙 F PF-04
의존: D5 결정
목표: npm·PyPI 사설 레지스트리를 세우고 dry-run publish까지 확인한다(D-7).
산출물: `infra/registry/docker-compose.yml`(Gitea/Forgejo 패키지 레지스트리 **또는** Verdaccio + pypiserver), `infra/registry/README.md`(백업·토큰 발급·소비 레포 `.npmrc`·`pip.conf` 설정), 루트 `.npmrc`(`@terracelab:registry=`), `pyproject` publish index, GitHub Secrets 목록.
완료 조건:
- `pnpm -r publish --dry-run --no-git-checks` 가 레지스트리 URL을 가리키며 성공
- `uv publish --dry-run` 성공(또는 `twine check`)
- 소비 레포 시뮬레이션: 빈 디렉터리에서 `pnpm add @terracelab/trellis-tokens@0.0.0-dry`(태그 테스트 패키지) 설치 성공 후 삭제
사람 확인: 서버·도메인·결제(고정 비용) 준비, 결정 D5 확정

### P3-12 릴리즈 파이프라인 + 첫 publish
상태: ☐ 1.0 뒤 — 공개 배포 경로라 PF-04와 함께 한다. 1.0은 저장소 태그 `v1.0.0`과 CHANGELOG로 낸다(D-102 제안)
의존: P3-09, P3-10, P3-11
목표: pipeline.md §4의 Changesets 릴리즈 흐름으로 전 패키지 0.3.0을 사설 레지스트리에 publish 한다.
산출물: `.github/workflows/release.yml`(changesets/action → Version PR → publish npm+PyPI → tag → GitHub Release → `figma-diff.mjs` 리포트 코멘트), `scripts/sync-py-version.mjs`, `CHANGELOG.md`(패키지별 자동).
완료 조건:
- Version Packages PR 머지 후 레지스트리에 `@terracelab/trellis-{tokens,icons,contracts,react,native,tailwind}@0.3.0`, `terracelab-trellis==0.3.0` 존재
- `git tag | grep v0.3.0`, GitHub Release에 체인지로그
- Release 코멘트에 Figma 변수 diff(0건이면 "변경 없음")
사람 확인: 첫 publish 승인(워크플로 `environment: release` 수동 승인)

### P3-13 VRT 안정화
상태: ☐ 대기
의존: Phase 2
목표: 플레이크 0을 만들고 스냅샷 갱신 흐름을 라벨·승인으로 고정한다.
작업: 폰트 로딩 대기(`document.fonts.ready`), 애니메이션 비활성 전역 CSS, 날짜 mock 고정, 10회 반복 실행 스크립트 `pnpm vrt:flake`. `vrt-update` 라벨 없는 PR의 스냅샷 변경은 CI 실패.
완료 조건:
- `pnpm vrt:flake`(10회) 전부 통과
- 라벨 없이 스냅샷을 바꾼 PR이 `vrt` 잡에서 실패함을 확인 후 닫기
사람 확인: 없음

### P3-14 번들 크기 예산
상태: ☐ 대기
의존: 없음(배포 없이 잴 수 있어 P3-12를 뺐다, D-102 제안)
측정(2026-11-10, vite 8 lib · react 외부화 · gzip -9, KB = 1024바이트, D-105): Button만 58.8KB · DataGrid만 97.5KB · TrendChart만 132.2KB. DataGrid는 P1-15 예산 45KB를 넘고, Button 번들에도 Base UI floating 모듈이 들어 있다. 이 작업이 원인을 보고 엔트리 분리 · 지연 로딩 또는 예산 변경을 제안한다
목표: size-limit을 pipeline.md §6 예산으로 켜고 CI 게이트 9로 추가한다.
완료 조건:
- `pnpm size` 통과, 결과를 `docs/reports/size-2027-01.md`에 기록
- 예산 초과 항목이 있으면 분리 엔트리·지연 로딩으로 해결, 불가하면 예산 변경 제안(사람 승인)
사람 확인: 예산 변경 시

### P3-15 Dark 모드 검수
상태: ☐ 대기
의존: P2-12, P3-13
목표: D2에 따라 G2 화면 7종(P2-12) · P0 · P1 컴포넌트를 Dark에서 검수하고 Dark 값 조정 제안서를 만든다. 1.0 안이다(D-102).
산출물: G2 화면 7종 다크 캡처(P2-13의 캡처 스크립트로 G2 뒤 값을 다시 찍는다), Storybook Dark VRT(이미 자동), `docs/plan/notes/dark-review-2027-01.md`(대비·그림자 대체 border·모듈 색 식별성 점검, 조정 제안).
완료 조건:
- Dark에서 contrast 테스트 통과(이미 CI), axe 7화면 0
- 제안서 작성(변경 없음이면 "조정 불필요" 명시)
사람 확인: Dark 인상 승인, 제안 값 승인
