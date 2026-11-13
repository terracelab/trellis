# Phase 2 · 패턴·Theme A — 2026-11-28 → 12-18

목표: P1 컴포넌트 10작업, 패턴(화면 블록), G2 화면 7종(블록, D-104), G2 증거 → **G2 미리보기 승인(토큰 값 확정)** → Figma 초안 다시 맞추기(D-103).
1.0 범위(D-101): 이 Phase의 남은 작업은 전부 1.0 안이다. 실행 순서는 `README.md` "실행 순서" 표를 따른다.
사람 작업: G2 체크리스트 사람 항목, 토큰 값 승인, Figma 초안 확인, D0 상표 확인(12/18).
산출물: 승인된 토큰 값(`g2-approved` 태그), Figma 파일 셋(Foundations · Components · Screens, G2 전 초안 → G2 뒤 정렬), `@terracelab/trellis-react` 0.2.0(미배포).
규격: `docs/spec/components.md` §6·§10, `docs/spec/pipeline.md` §7.
전제: Phase 1 완료.

P1 컴포넌트(P2-01~P2-10) 완료 조건은 README의 컴포넌트 DoD. 네이티브는 1.0 뒤다(D-101). 2026-11-10 상태 정리의 공통 증거(폴더 대조 96 · react 테스트 521 · 스토리 · 스냅샷 빠짐 검사 4 · Storybook axe · VRT 기록)는 `02-phase-1-core.md` 머리에 있다.

---

### P2-01 Form · Field · FormRow · ActionBar
상태: ☑ 완료 2026-11-11(웹) — Field · FormSection · ActionBar contract · spec · 구현 · 예시 · 스토리 · VRT 4 · 4 · 4장, 폼 어댑터 `@terracelab/trellis-react/form`(PR-09). FormSection 상태는 default 하나로 바로잡았다(묶음은 상호작용이 없고 접는 단추는 단추 문법, e646b75). 네이티브는 1.0 뒤(P3)
의존: Phase 1
고유 사항: react-hook-form 어댑터(`useTrellisForm`, zod resolver 선택). Field = 라벨(좌 120px compact / 상단) + 컨트롤 + 도움말/에러. 필수 표시는 라벨 뒤 점(`status.danger.default`). FormRow 1열·2열. ActionBar 하단 고정, 버튼 순서 고정(취소 ← 저장). 네이티브 true.

### P2-02 DatePicker · DateRangePicker
상태: ☑ 완료 2026-11-10(웹) — DateField · PeriodPicker: 스토리 Matrix · States · VRT 4 · 4장, 공통 증거는 Phase 1 머리. 네이티브는 1.0 뒤(P3)
의존: P2-01
고유 사항: react-day-picker 그리드 + Base UI Popover(D-11). 단일·기간·월 선택, 한국어 로케일(date-fns ko), `YYYY-MM-DD` 입력 마스크, 키보드 그리드 이동, 프리셋(오늘·이번 주·이번 달·지난 달). 네이티브 true(네이티브 피커 위임).

### P2-03 Dropdown · Menu · ContextMenu
상태: ☑ 완료 2026-11-10(웹) — Menu(+ ContextMenu PR-08): 예시 스토리 · VRT 4 · 4장(트리거로 여는 겹침 컴포넌트라 Matrix · States 없음, D-105), 좁은 화면 시트 PR-10. 네이티브는 1.0 뒤(P3)
의존: Phase 1
고유 사항: Base UI Menu 어댑터. 항목·구분선·서브메뉴·단축키 표시·danger 항목. ContextMenu는 우클릭 위치. 네이티브 true(ActionSheet).

### P2-04 Tooltip · Popover
상태: ☑ 완료 2026-11-10(웹) — Tooltip(+ Popover PR-08): 예시 스토리 · VRT 4 · 4장(contract states 기본 하나), 공통 증거는 Phase 1 머리. 네이티브는 1.0 뒤(P3)
의존: Phase 1
고유 사항: Tooltip은 hover·focus 400ms 지연, 터치 비표시, IconButton과 연결(P1-05 `title` 대체 제거). Popover는 포커스 이동·닫기 버튼 옵션. Tooltip native false, Popover native true.

### P2-05 Pagination
상태: ☑ 완료 2026-11-10(웹) — Pagination: 스토리 States · VRT 4장, 공통 증거는 Phase 1 머리. 네이티브는 1.0 뒤(P3)
의존: Phase 1
고유 사항: 페이지 번호(최대 7칸 + 생략), 페이지 크기 Select(20·50·100), "N건 중 a~b" 텍스트, 무한스크롤 모드(IntersectionObserver). 네이티브 true(무한스크롤만).

### P2-06 KpiCard · StatRow
상태: ☑ 완료 2026-11-10(웹) — KpiCard: 스토리 Matrix · States · VRT 8장(StatRow는 따로 두지 않고 KpiCard 여러 개), 공통 증거는 Phase 1 머리. 네이티브는 1.0 뒤(P3)
의존: Phase 1
고유 사항: 값은 `amountLg`, 증감은 화살표 + `finance.income/expense/neutral` 색(증가=빨강이 아니라 **수입=빨강**이므로 `kind` prop으로 의미를 받는다), 전일 대비 캡션. StatRow는 KPI 4개 가로. 네이티브 true.

### P2-07 StackedBar · Sparkline · Donut
상태: ☑ 완료 2026-11-07(D-39로 흡수 — `@terracelab/trellis-react/charts`의 SegmentedBar · Sparkline · Donut. 스토리·VRT는 P1-19)
의존: Phase 1
고유 사항: 자체 SVG, 범례, 카테고리 색은 `module.*.default` 4색 + status 보조, 숫자 라벨 tabular-nums, 접근성은 `<title>`+ 데이터 표 대체(`aria-describedby`). 근태 스택 바(출근·지각·휴가·결근) 스토리. 네이티브 true(react-native-svg).

### P2-08 Stepper · ApprovalLine
상태: ☑ 완료 2026-11-10(웹) — Stepper · ApprovalLine: 스토리(Stepper Matrix) · VRT 4 · 4장(contract states 기본 하나), 공통 증거는 Phase 1 머리. 네이티브는 1.0 뒤(P3)
의존: P1-06
고유 사항: 가로 Stepper(현재 단계 강조), ApprovalLine = 결재자 Avatar + 이름·직급 + ApprovalState Badge, 현재 결재자 강조, 반려 시 사유 Popover. 네이티브 true.

### P2-09 EmptyState · Skeleton · Spinner
상태: ☑ 완료 2026-11-10(웹) — EmptyState · Skeleton · Spinner: 스토리 Matrix · VRT 4 · 4 · 4장(states 기본 또는 loading 하나), 공통 증거는 Phase 1 머리. 네이티브는 1.0 뒤(P3)
의존: Phase 1
고유 사항: EmptyState 아이콘(Lucide만, 일러스트 없음)·제목·설명·액션 1개. Skeleton은 DataGrid 행·카드 프리셋. Spinner 16·20·24, reduced-motion 시 정지 + 텍스트. DataGrid·Select 빈 상태를 EmptyState로 교체. 네이티브 true.

### P2-10 FileUpload · Attachment
상태: ☑ 완료 2026-11-10(웹) — FileUpload · Attachment: 스토리(FileUpload States) · VRT 4 · 4장, 공통 증거는 Phase 1 머리. 네이티브는 1.0 뒤(P3)
의존: P1-05
고유 사항: 드래그 영역·다중·진행률·오류, Attachment는 파일 타입 아이콘(hwp·pdf·xlsx·docx·img·zip — `custom:hwp` 포함), 크기 표시, 삭제·다운로드. 네이티브 true(DocumentPicker).

### P2-11 패턴 5종 + 템플릿
상태: ◐ 진행 — 패턴은 화면 블록으로 먼저 구현(blocks/, D-51 · D-54): 알림 홈 · 목록 · 상세 · 폼 · 등록 · 결재 · 전표 입력 · 신고서 등(블록 60, `find blocks/src -name block.json | wc -l`). 남은 것: 패턴 spec. templates/ · Storybook Templates는 블록과 데모가 대신한다(D-104 제안, `templates/src`는 index.ts뿐)
의존: P2-01 ~ P2-10
목표: components.md §10의 패턴 5종을 `packages/react/src/patterns/`에, 템플릿 5종을 `templates/`에 mock 데이터와 함께 만든다.
산출물: `patterns/{NotificationHome,ListDetail,FormRegister,ApprovalFlow,ConversationalWork}/`(+ `DashboardGrid`, `FilterBar`, `Chat`·`MessageList`의 **최소 구현** — P2 컴포넌트지만 패턴에 필요한 범위만, spec은 완전히), `packages/contracts/src/patterns/*/spec.md`, `templates/src/{Home,List,Register,ApprovalDetail,Assistant}Page.tsx`, `templates/src/mock/*.ts`(결정적, 날짜 2026-12-01 고정), Storybook `Patterns/*`·`Templates/*`(1440·1024·390).
작업: §10 "코드로 강제하는 규칙"을 타입·개발 모드 경고로 구현. CommandPalette는 Phase 3 이후 P2이므로 ConversationalWork는 슬롯만.
완료 조건:
- 컴포넌트 DoD 1·2·4·6·7·8(패턴은 contract 대신 spec의 구성 규칙)
- `Templates/*` 15 스냅샷(5 × 3 뷰포트) 커밋
- ListDetail에서 Drawer 중첩 시 콘솔 경고 테스트 통과
사람 확인: 패턴 규칙이 업무 화면 관습과 맞는지

### P2-12 G2 화면 7종(화면 블록)
상태: ☑ 완료 2026-11-11 — 화면 7종을 블록으로(D-104 제안): 새 `home/dashboard/people`(역할별 홈) · `groupware/attendance/leave-request`(휴가 신청) · `home/launcher/modules`(모듈 런처) · `home/dashboard/mobile`(휴대폰 홈), 다시 씀 `erp/hr-payroll/employees` · `erp/hr-payroll/payslip`, 바꿈 `groupware/approval/document`(반려 · 회수 사유 ReasonDialog). 블록 검사 64 통과, 데모 66화면 × 1440 · 390 × 라이트 · 다크 axe 0(e2d0461). 시각 검토는 G2 사람 항목
의존: PF-05, P2-19
목표: G2에서 토큰 값을 판단할 화면 7종을 복사형 화면 블록으로 만들고 `apps/demo`에서 보인다(D-104 제안).
산출물: 화면 7종. 있는 블록을 쓴다: 구성원 목록 `erp/hr-payroll/employees` · 급여 명세 `erp/hr-payroll/payslip` · 결재 상세 `groupware/approval/document`. 새 블록 4개: 역할별 홈(데모의 역할 바꿔 보기 사원 · 팀장 · 관리자마다 첫 화면이 다르다) · 휴가 신청 폼(종류 · 기간 · 반차 · 남은 연차 · 결재선, `groupware/attendance/` 아래) · 모듈 런처(`modules.json` 그룹 + 즐겨찾기) · 휴대폰 홈(390 한 열 + 아래 탭바). 각 블록은 `block.json` · 샘플 데이터 · slots를 갖는다. 데모 메뉴에 "G2 화면" 묶음.
작업: §7.1 비주얼 톤(포인트는 회사 색 하나, 두 번째 강조는 모듈 색만)과 D-56 · D-57 · D-90 조립 규칙을 지킨다. 화면 문구는 `docs/spec/content.md`. 시험 서비스(P2-19)가 같은 영역에서 막힌 곳이 있으면 블록이 먼저 그 답을 보인다. 블록 id는 `<group>/<module>/<screen>` 규칙으로 만들 때 정한다.
완료 조건:
- `node blocks/scripts/check-blocks.mjs` 통과(새 블록 4개 포함, 토큰 밖 값 · 왼쪽 띠 · 금칙어 0)
- `pnpm --filter @terracelab/demo build && pnpm --filter @terracelab/demo check` 통과(7화면 포함, 1440 · 390 × 라이트 · 다크 axe critical · serious 0, 390 가로 넘침 0)
- 린트 통과(블록 코드에도 raw 값 0)
사람 확인: 7화면 시각 검토(G2 핵심 입력, P2-13 접촉 시트로)

### P2-13 G2 증거 수집
상태: ☑ 완료 2026-11-11 — `docs/plan/notes/g2-evidence.md` + 연락처 시트 27장(`notes/g2-2026-11/`, 7화면 × 3폭, 행 = 회사 색 #FE5C2B · #1F56E2 · #FFD400, 열 = 라이트 · 다크 · 고대비). 캡처 189장 axe 0 · 390 넘침 0 · 외부 요청 0, 상태 캡처 16장 · 색각 시뮬레이션 · 확대(표 행 36 · 13px) · 키보드 포커스 시트(`apps/demo/scripts/g2-capture.mjs`)
의존: P2-12
목표: G2 체크리스트의 에이전트 항목을 증거 파일과 캡처로 채운다(D-104 제안).
산출물: `docs/plan/notes/g2-evidence.md`(항목별 증거 · 실행한 명령 · 링크), 접촉 시트 `docs/plan/notes/g2-2026-11/`: 회사 색 3개(#fe5c2b 기본 · #1F56E2 · #FFD400) × 라이트 · 다크 · 고대비(`data-contrast="high"`) × 1440 · 1024 · 390 = 27장, 한 장에 G2 화면 7종(휴대폰 홈은 390 장에만). 그 밖에 색각 시뮬레이션 캡처(금융 2색 · 모듈 그룹색), compact DataGrid 확대 캡처, 포커스 링 연속 캡처, 회사 색마다 겹침 경고(D-99) 결과. 캡처 스크립트는 `apps/demo/scripts/` 아래.
작업: 캡처는 데모 검사와 같은 Playwright 설정(reduced-motion · 날짜 고정)으로 찍고, 회사 색은 `TrellisProvider theme={{ brand }}`로 바꾼다. 세 색 모두에서 axe를 같이 돌려 결과를 증거 파일에 적는다. `apps/preview`는 그대로 둔다(D-45).
완료 조건:
- `docs/plan/notes/g2-evidence.md`의 에이전트 항목이 전부 증거와 함께 ☑
- `ls docs/plan/notes/g2-2026-11/*.png | wc -l` ≥ 27
- 회사 색 3개 × 라이트 · 다크 · 고대비 × 3폭에서 G2 화면 7종 axe critical · serious 0
- Storybook 정적 빌드 · 데모 · 접촉 시트를 Artifact로 게시하고 링크를 G2 체크리스트에 적는다
사람 확인: G2 사람 항목

### P2-14 G2 게이트 — 토큰 값 확정
상태: ⏸ 승인 대기 — 증거 준비 끝(P2-13). 사람이 정할 것: G2 토큰 값 동결, D-53 모듈 그룹색, D-77 · D-80 종이 토큰(아침 보고)
의존: P2-13
목표: 사람 승인 → 토큰 값 동결, 태그 `g2-approved`, Figma 초안 정렬(P2-22) 시작. 승인 대기인 값(D-53 모듈 그룹색 3종 · D-77 · D-80 종이 토큰 · backlog `status.*.fg`)도 여기서 승인하거나 1.0 뒤로 보낸다.
작업: 승인 과정에서 요청된 값 변경은 `token-change` 스킬로 제안서 → 승인 → 반영 → VRT 스냅샷 갱신(`vrt-update` 라벨). 승인 후 `scales.config.json`·semantic 값 변경은 minor + 체인지로그 "토큰 값 변경" 섹션 필수.
완료 조건:
- `git tag | grep g2-approved`
- changeset: tokens·react minor(0.2.0)
사람 확인: G2 승인(Patrick)

### P2-15 Figma Foundations
상태: ◐ G2 전 초안 2026-11-11 — https://www.figma.com/design/k1mrv5tz9JpPUIt72dXHSj 변수 6컬렉션 474개 = variables.json(`scripts/figma-diff.mjs` 차이 0, 별칭 506 확인), Company 8모드 · Semantic 4모드 · Density 3모드, 글자 스타일 12 · 그림자 3 · 모듈 아이콘 21, ALL_SCOPES 0 · 코드 구문 100%(D-103 · D-106). G2 뒤 P2-22가 다시 맞춘다
의존: 없음(D-103으로 G2 의존을 초안에 한해 푼다. 원래 P2-14)
목표: "Trellis · Foundations" 파일에 변수 컬렉션 · 텍스트 스타일 · 효과 스타일 · 모듈 아이콘을 지금 토큰 값으로 만든다.
산출물: Figma 파일 "Trellis · Foundations"(컬렉션 구조는 `packages/tokens/sd/formats/figma.mjs`가 정한다. Company 컬렉션의 모드는 회사 색 프리셋이고 값은 `createTheme` 결과), 텍스트 스타일, 그림자 효과 스타일(D-26), Module Icons 페이지, `docs/figma/README.md`(파일 셋 URL · 페이지 구조 · 이름 규칙 · "Figma 수정은 PR 필수").
작업: 변수 이름은 슬래시 경로(CLAUDE.md 이름 규칙). Primitives는 숨김 스코프. 그림자 · 베지어는 변수가 아니라 스타일. 라이브러리 공개는 G2 뒤(P2-22).
완료 조건:
- 변수 수 · 모드 수 = `variables.json`(Figma MCP로 다시 읽어 스크립트로 비교, 결과를 `docs/figma/README.md`에 기록)
- 무작위 10개 alias가 맞는 대상 변수를 가리킨다
- 텍스트 스타일 수 = `typography.json`의 글자 스타일 수, Module Icons 페이지에 `modules.json` 모듈 수 × 3크기
사람 확인: Figma에서 Variables 패널과 Company 모드 전환 확인

### P2-16 Figma Components
상태: ◐ G2 전 초안 2026-11-11 — https://www.figma.com/design/wm3bZ3mscnjwjmim1I8LeL 43종 · 변형 1,459(세트마다 contract 값 곱과 같음), 묶이지 않은 칠 0(31,560 노드), 밤 작업 컴포넌트 변경(AppShell · WorkHoursMeter · Payslip · Avatar · PersonLabel · ApprovalLine) 반영. 그리지 않은 것은 D-106. G2 뒤 P2-22
의존: P2-15
목표: "Trellis · Components" 파일에 웹 컴포넌트를 1종당 1페이지, variant 속성 = contract props(variant · size · tone · state)로 만들고 색 · 간격 · 반경을 Foundations 변수에 바인딩한다.
산출물: Figma 파일 "Trellis · Components", `docs/figma/components-report.md`(컴포넌트별 variant 수 · 바인딩 안 된 속성 수).
작업: 범위는 P0 14종과 G2 화면 7종이 쓰는 컴포넌트다. 1.0 전까지 이 범위를 다 덮고, 나머지 컴포넌트는 1.0 뒤 같은 절차로 더한다. Auto layout 필수, 고정 크기는 아이콘 · 아바타만, hover · focus · active · disabled는 variant 또는 interactive component, loading · error는 variant, 슬롯은 instance swap, 텍스트는 text 속성. Code Connect는 플랜 확인 뒤(D-8).
완료 조건:
- 범위 안 컴포넌트 페이지 수와 variant 수를 리포트에 기록하고, variant 수가 contract `values` 곱과 같다
- Figma MCP로 다시 읽어 hex 직접 입력 fill 0
사람 확인: 시각 검토

### P2-17 좁은 화면 고르기 · 날짜 달력 · MultiSelect
상태: ☑ 완료 2026-11-10(웹) — 2026-11-08 구현 · 검사(D-60) 뒤 남았던 스토리 · VRT 있음(MultiSelect 4 · DateField 4 · PeriodPicker 4 · Select 8 · FilterBar 4장), 페이지 입력 글자 16은 backlog "완료(P2-18 density.input.fontSize · touch)". react 테스트 521 통과(pickers.test 포함). 네이티브는 1.0 뒤(P3)
의존: P2-01 · P2-02 · P2-03
목표: 검색 필터에 필요한 고르기를 휴대폰에서도 쓰게 한다(Patrick, 2026-11-08: "드롭다운 모바일도 지원 가능한 컴포넌트가 안 보인다").
산출물: `_internal/sheet.tsx`(Base UI Drawer 아래 시트, `useSheetMode`) · `_internal/calendar.tsx`(react-day-picker 9.14, D-11) · `_internal/date-text.ts`(ISO 글자 칸). Select · DateField · PeriodPicker · FilterBar 좁은 화면 모드, DateField 자체 날짜 칸 + 달력(`today` 추가), PeriodPicker 기간 달력(`label` 추가), FilterBar `activeCount`, MultiSelect 신설(contract · spec · 구현 · 예시). 블록: 주문 목록 채널 필터를 MultiSelect로, DateField 블록 10곳에 `today={TODAY}`.
완료 조건:
- `pnpm --filter @terracelab/trellis-react exec vitest run` 통과(pickers.test: 시트 · 달력 · 기간 · 여러 개 고르기 · 필터 시트)
- `pnpm --filter @terracelab/demo check` · `pnpm --filter @terracelab/docs check` 통과
- 390 폭 시트 4종 · 1440 팝업 2종 라이트 · 다크 axe critical · serious 0
사람 확인: 휴대폰에서 시트 손맛(쓸어 닫기 · 필터 시트 위 고르기 시트)

### P2-18 휴대폰 밀도 · 카드 목록 · 탭바
상태: ☑ 완료 2026-11-10(웹) — Menu · CodeSearch 시트는 PR-10, 스토리 · VRT 있음(DataGrid · AppShell · KpiCard · Tabs 각 8장), react 테스트 521 통과(mobile.test 포함). Figma Density Touch 모드는 P2-15 초안이 맡는다(`variables.json` Density compact · comfortable · touch, 86e320c). 네이티브는 1.0 뒤(P3)
의존: P2-17
목표: ERP 화면이 휴대폰에서 읽히고 눌린다(Patrick, 2026-11-08: "모바일 가독성 · 다크/라이트 · ERP 모바일 컴포넌트").
산출물: `density/touch.json` + 모든 산출물(CSS 미디어 블록 · native · Figma Touch 모드 · 문서), 입력 칸 글자 토큰, DataGrid `mobile` · `column.mobile`, AppShell `tabs`, KpiCard 휴대폰 격자, Tabs `data-overflow`, 데모 Shell 탭 4개, `apps/demo/scripts/check.mjs` 두 폭 · 가로 넘침 · 터치 영역 보고.
완료 조건:
- `pnpm --filter @terracelab/trellis-tokens test` 통과(결재 대비 4건 제외) · `pnpm --filter @terracelab/trellis-react exec vitest run` 통과(mobile.test)
- `pnpm --filter @terracelab/demo check` 1440 · 390 라이트 · 다크 통과, 390 가로 넘침 0
- 390에서 본문 15 · 컨트롤 40, 목록 화면에 가로 스크롤 표 없음(scroll 지정 제외)
사람 확인: 휴대폰 실기기, 다크 A/B 캡처(검토 페이지)

### P2-19 인사 화면 시험 서비스
상태: ☑ 완료 2026-11-11 — `trellis-trial`(로컬 git, 회사 색 #0B7A5C) 18화면 × 344 · 720 · 1024 · 1440 × 라이트 · 다크 axe 0 · 가로 넘침 0, #fe5c2b · #FFD400도 각 144/144, 휴가 신청 → 결재 흐름 통과, doctor 통과. 찾은 것 53건 → backlog R-T01~T53(원문 trellis-trial/FINDINGS.md)
의존: PF-16, PD-02(지금 판으로 시험한다)
목표: 에이전트가 스킬 `trellis`만 보고 새 서비스에 인사 · 근태 · 휴가 · 급여 화면을 회사 색 하나로 만들 수 있는지 시험하고, 막힌 곳을 backlog에 쌓는다. PD-07 · PF-13의 첫 실행이고 G3에서 같은 절차를 다시 돌린다(D-102 제안).
산출물: Trellis 밖 시험 서비스(`node scripts/create-service.mjs <경로>`로 생성, 경로와 커밋을 결과 노트에 적는다), 결과 노트 `docs/plan/notes/trial-hr-2026-11.md`(요청 문장 · 걸린 시간 · 만든 화면 · 검사 결과 · 막힌 곳), backlog.md에 막힌 곳(절차 `packages/skill/skills/trellis/references/request.md`).
작업:
1. 빈 서비스를 만들고 회사 색 하나(예: #1F56E2)를 `pnpm ds:theme` 또는 `TrellisProvider theme={{ brand }}`로 넣는다.
2. 새 에이전트 세션은 서비스 저장소의 `.claude/skills/trellis/`와 스킬이 가리키는 동봉 문서 · 블록 목록만 읽는다. Trellis 플랜 · 규격 · 소스를 따로 열지 않는다.
3. 요청 한 장: 인사 홈 · 구성원 목록 · 근태 · 휴가 신청 · 급여 명세 5화면.
4. 막히면 Trellis를 고치지 않고 backlog에 한 줄을 남긴 뒤 서비스 안 임시 처리로 넘어간다.
완료 조건:
- 시험 서비스에서 `trellis-skill doctor` 종료 0, `pnpm lint` · `pnpm typecheck` 통과
- 5화면 1440 · 390 × 라이트 · 다크 axe critical · serious 0, 토큰 밖 값 0, Trellis에 없는 공용 컴포넌트를 새로 만들지 않음
- 결과 노트에 걸린 시간과 막힌 곳 수, backlog에 같은 수의 줄
사람 확인: 결과 화면 시각 검토(회사 색 하나로 Trellis 블록과 같은 품질로 보이는가)

### P2-20 Figma Screens
상태: ◐ G2 전 초안 2026-11-11 — https://www.figma.com/design/QNmIYwV6G64VXwampA4b9e G2 화면 7종 × 4(라이트 · 주황 · 다크 · 주황 · 라이트 · 파랑 · 라이트 · 노랑) + 시험 화면 10 × 2(초록) = 48프레임, 인스턴스 2,942, 묶이지 않은 칠 0, 세 파일 변수 해시 같음(5c4305f7). 참조와 다른 곳은 docs/figma/README.md
의존: P2-15, P2-16(인스턴스로 바꿀 때)
목표: "Trellis · Screens" 파일에 데모 화면을 넣고, G2 화면 7종(P2-12)이 생기면 1440 · 390 라이트 · 다크로 넣는다.
산출물: Figma 파일 "Trellis · Screens"(페이지: G2 화면 7종 · 업무 영역별 화면), `docs/figma/README.md`에 페이지 목록.
작업: 처음에는 캡처(플레인 레이어)로 넣고 "현재 모습 기록"이라고 페이지에 적는다(D-38과 같다). Components 초안에 있는 부품부터 인스턴스로 바꾼다. 화면 문구와 숫자는 데모 샘플 그대로 둔다.
완료 조건:
- G2 화면 7종 × 1440 · 390 × 라이트 · 다크 프레임이 있다(Figma MCP로 프레임 이름을 읽어 확인)
- 인스턴스로 바꾼 프레임은 hex 직접 입력 fill 0
사람 확인: 시각 검토

### P2-21 figma-sync 스킬 · figma-diff
상태: ☑ 완료 2026-11-11 — `.claude/skills/ds/figma-sync/SKILL.md`(변수 upsert · 컴포넌트 다시 만들기 · Screens · 감사 스크립트 · screen-kit.js), `scripts/figma-diff.mjs`(--help · --emit upsert|readback · --hash, 차이면 종료 코드 1). 9e9bcea · 5d03018
의존: P2-15
목표: 토큰이 바뀌면 Figma 변수 · 스타일 · 컴포넌트 바인딩을 같은 절차로 다시 맞추고, 무엇이 바뀌는지 먼저 본다(D-6 · D-103).
산출물: `.claude/skills/ds/figma-sync/SKILL.md`(Figma MCP `use_figma` 절차: `docs/figma/README.md`에서 파일 키 읽기 → `variables.json` 읽기 → 컬렉션 · 모드 · 변수 upsert(alias 포함, 지울 변수는 목록만 보고하고 사람 확인 뒤 지운다) → 텍스트 · 효과 스타일 → Components 바인딩 점검 → 수 보고), `scripts/figma-diff.mjs`(두 `variables.json`, 또는 `variables.json`과 Figma에서 다시 읽은 JSON을 비교해 추가 · 삭제 · 값 바뀜 · alias 바뀜을 마크다운 표로), 테스트(픽스처 두 벌 비교 결과 스냅샷).
완료 조건:
- `node scripts/figma-diff.mjs <a> <b>`가 픽스처의 추가 · 삭제 · 값 바뀜 · alias 바뀜을 모두 잡는다(테스트 통과)
- 같은 파일끼리 비교하면 "변경 없음"
- 스킬을 Foundations 초안에 한 번 돌려 변수 수 · 모드 수가 `variables.json`과 같다고 보고한다
사람 확인: 스킬 문구 검토

### P2-22 G2 뒤 Figma 다시 맞추기
상태: ☐ 대기
의존: P2-14, P2-21
목표: G2에서 승인된 토큰 값으로 Figma 파일 셋을 다시 맞추고 라이브러리로 공개한다(D-103, 공개 시점은 제안).
산출물: `docs/figma/diff-g2.md`(초안 대비 바뀐 변수 표), `docs/figma/README.md` 갱신(맞춘 커밋 · 날짜), Components 리포트 갱신.
작업: `figma-diff`로 초안과 승인 값의 차이를 남긴다 → `figma-sync`로 반영한다 → Components 바인딩을 점검한다 → Screens의 G2 화면 7종을 승인 값으로 다시 넣는다 → 라이브러리를 공개한다.
완료 조건:
- `node scripts/figma-diff.mjs packages/tokens/dist/figma/variables.json <Figma에서 다시 읽은 JSON>` = 변경 없음
- Components 리포트의 바인딩 안 된 속성 0, hex 직접 입력 fill 0
사람 확인: 라이브러리 공개, Company 모드 전환 확인

### P2-23 backlog 1.0 범위 정리
상태: ◐ 진행 — 2026-11-11 밤 작업: R-T 53건 중 고침 31 · 일부 2(R-T09 · T13), 묶음 A(스킬 · 문서 · 시작 템플릿) · B(컴포넌트) · C(블록) + R-T07. 남은 것: R-T22~25 새 컴포넌트 후보, R-T26~29 contracts 어휘, R-T42 · T43 · T45, 토큰 값이 필요한 R-T47 · T48, 블록 정리 요청 R-T54~59
의존: P2-19
목표: backlog.md의 열린 줄과 아직 1.0 안 · 뒤가 정해지지 않은 작업을 1.0 정의(`README.md` "1.0 정의")로 나누고, 1.0 안에는 플랜 작업 ID를 붙인다.
산출물: backlog.md 상태 칸(작업 ID · "1.0 뒤" · 완료 중 하나), 해당 Phase · 트랙 파일의 새 작업, `README.md` 실행 순서 표 갱신, 값이 걸린 줄은 G2 사람 항목으로.
작업: 기준은 하나다. 인사 · 근태 · 휴가 · 급여 · ERP · SCM · 세무 · 회계 · 대시보드 화면을 회사 색 하나로 만드는 데 필요한가. 이커머스 · 제조 전용(보드 밀도 · BoardTile · ProductCell · Price 등)은 1.0 뒤가 기본이다. 대상은 backlog 열린 줄, 트랙 D · E · F의 ☐ · ◐ 작업, 실행 순서 표와 "1.0 뒤로 미룬 것" 어디에도 없는 작업이다.
완료 조건:
- backlog.md에 상태가 "요청"인 줄 0
- 대상 작업마다 1.0 안이면 실행 순서 표에 있고, 1.0 뒤면 상태 줄에 "1.0 뒤"와 이유가 있다
사람 확인: 1.0 뒤로 보낸 목록

---

## G2 체크리스트 — 미리보기 승인 → Figma 정렬

G2 화면 7종은 블록이다(P2-12, D-104 제안). 증거는 회사 색 3개(#fe5c2b · #1F56E2 · #FFD400) × 라이트 · 다크 · 고대비 × 1440 · 1024 · 390 접촉 시트(P2-13). Figma는 G2 전 초안이 있고(D-103) 승인 뒤 P2-22가 다시 맞춘다.

에이전트 항목(증거: `docs/plan/notes/g2-evidence.md`)
- [x] 본문·보조 텍스트 대비 4.5:1 이상, Light·Dark 모두 (contrast 테스트 + dist/docs/tokens.md 표) — 2026-11-10 PR-28: 라이트 · 다크 · 고대비 2, 회사 색 검증 10색 × 4모드 못 넘는 쌍 0
- [ ] compact DataGrid 행 36px(D-97)에서 13px 본문 가독 (확대 캡처)
- [ ] 수입·지출 색이 Light·Dark에서 혼동 없음 (ΔE 테스트 + 색각 시뮬레이션 캡처) — ΔE 테스트 4모드 통과(2026-11-10). 색각 시뮬레이션 캡처는 남음
- [ ] 모듈 그룹색이 서로 구분됨(승인된 4그룹 + 가안 3그룹 D-53, 색각 이상 시뮬레이션 3종 캡처)
- [ ] G2 화면 7종이 회사 색 3개 × 라이트 · 다크 · 고대비 × 1440 · 1024 · 390에서 깨지지 않음 (접촉 시트 27장, `docs/plan/notes/g2-2026-11/`)
- [ ] 금액 열 우측 정렬·천 단위 구분·tabular-nums (DataGrid 스토리 캡처 + 테스트)
- [ ] 포커스 링이 모든 컨트롤에서 보임 (States 스토리 focus VRT 전부 존재) — 2026-11-10 Storybook axe 760회 위반 0, 포커스 강조 모드 추가(PR-30). States 스토리가 빠진 Tabs · SideNav · AppShell · FormSection(P1-11 · P1-14 · P2-01)을 채운 뒤 전수 확인
- [ ] G2 화면 7종 axe 0(회사 색 3개 × 라이트 · 다크 · 고대비 × 3폭), 린트 0, `node blocks/scripts/check-blocks.mjs` 통과
- [ ] 회사 색 3개의 겹침 경고(D-99) 결과 기록
- [ ] Storybook · 데모(G2 화면) · 접촉 시트 Artifact 링크: ___

사람 항목(Patrick)
- [x] 브랜드 블루 기준값 확정 (#2F6BFF 유지 / 변경: ___) — 2026-11-10 Patrick: 회사 색 기본 = 식자재 ERP 주황 #FE5C2B(엔진 생성, D-97 · D-98), 파랑 #2F6BFF는 고정 blue(지출 · 정보 · 차트 1)로 유지
- [x] 7 hue 500 값 확정, 캔버스 #F5F6F8 확정 — 2026-11-10 Patrick: 고정 hue는 Trellis 값 유지, 캔버스는 식자재 ERP 회색 #F3F4F6 + 흰 surface(D-97 정한 것 3), 회색은 식자재 ERP 회색 · 다크 무채색
- [ ] G2 화면 7종 인상 승인(회사 색 3개, 라이트 · 다크)
- [ ] 승인 대기 값 결정: D-53 모듈 그룹색 3종(commerce 빨강 재검토) · D-77 · D-80 종이 토큰 · backlog `status.*.fg`(승인 또는 1.0 뒤)
- [ ] 레퍼런스 제품 자산과 유사성 없음 확인(아이콘·문구)
- [ ] 승인 → 태그 `g2-approved`. 이후 토큰 **값** 변경은 minor + 체인지로그 명시 + VRT 갱신 승인
