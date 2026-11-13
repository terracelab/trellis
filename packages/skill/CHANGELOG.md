# @terracelab/trellis-skill

## 1.0.0

### Minor Changes

- `trellis-skill doctor`가 더 본다(R-T04 · R-T53): primitive 색 변수(`--tl-color-<색>-<단계>` · shell · alpha · base · cvd), `rgb()` · `hsl()` 같은 색 함수, 서비스 CSS의 Trellis 안쪽 부품 덮기(`.tl-<이름>__<부품>`), `@terracelab/trellis-react` 컴포넌트에 준 `onClick`. 복사한 블록에서 Trellis 원본과 같은 줄은 실패 대신 경고로 따로 센다. theme.css 첫 줄의 고른 값으로 지금 생성기 결과와 비교해 오래된 파일(예: `@media (prefers-contrast: more)` 블록 없음)을 알린다. `trellis-ignore`는 그대로 통한다.
- 브랜드 짙은 사이드바 · 차분한 HR 결 · 스켈레톤 · HR 컴포넌트 9종(PR-27, D-91 ~ D-96). 토큰 값은 Patrick 승인(2026-11-09).

  - 토큰: `color.bg.nav` = brand.950(라이트 · 다크), 새 `color.nav.fg · fgMuted · fgActive · hover · selected · border · focus`, 아바타 6색 `color.avatar.{1~6}.bg · fg`, 라이트 `bg.canvas` 흰색 · `bg.sunken` neutral.50, 제목 `type.h1` 28 · 700 · `display` 32 · 700 · `h2` 700. 테마 생성기가 nav · `border.selected`를 만들고 PR-26 값(다크 brand 600 + 흰 글자, fg 700/600)과 맞췄다
  - AppShell: 사이드바를 바 높이까지 세우고 brand를 사이드바 맨 위로. SideNav는 nav 토큰(지금 화면 = 한 단계 밝은 면 + 흰 굵은 글자, 지연 건수 = 빨간 점)
  - PageHeader `siblings` · `onSiblingPress`(제목 줄 탭), Tabs 16 · 600 + 진한 밑줄, FilterBar 한 줄 필터의 "이름 값 ▾" 칩(기본값이 아닌 칩만 칠함, 검색 칸은 칩과 같은 높이 · 넓은 폭 · 진한 테두리), Avatar `shape`(square 기본 · circle) · `tone`(이름으로) · 성을 뺀 이니셜
  - Skeleton 묶음 모양 `list · table · kpi · card` + `columns` · `immediate`, `duration.normal` 뒤에 나타남
  - 새 컴포넌트(HR 사람): PersonLabel · ProfileHeader · OrgChart · HrRecord(한국형 인사기록카드), 어휘 `_shared/hr.ts`
  - 새 컴포넌트(근무 · 휴가 · 급여): TimeClock · WorkHoursMeter · LeaveBalance · TeamSchedule · Payslip, 어휘 `_shared/worktime.ts`
  - 컴포넌트 안 옅은 칸(표 머리 · 라벨 열 · 아이콘 상자 · 가리킴)은 `bg.sunken`을 쓴다(canvas가 흰색이 되어서)
  - 동봉 문서 manifest.json을 들여쓰기 없이 쓴다(300 KB 한도)
  - doctor: 테마 허용 변수에 `--tl-color-bg-nav` · `--tl-color-nav-*` · `--tl-color-border-selected`

### Patch Changes

- doctor가 `inner-override:`로 표시한 안쪽 덮기를 잡지 않는다. Trellis 블록은 prop이 없어 안쪽 부품을 덮는 자리에 규칙 위 주석으로 이 표시와 이유를 적는데(blocks/README.md), 블록 검사만 그 표시를 보고 doctor는 보지 않아 복사한 블록 그대로 `pnpm ds:doctor`가 실패했다(결재함 · 팀 근태 · 거래처 목록 · 일일 시재 · 문의 · 공지 블록)
- 블록 도우미 `tl-block-flat-grid`(Card padding none 안의 표)를 다듬고 do-dont에 적었다. 양 끝 칸의 바깥 여백을 카드 안쪽 여백에 맞춰 첫 열이 카드 제목과 같은 선에서 시작하고, 좁은 화면에서 행이 카드가 되면 카드 안 카드가 되지 않게 구분선 목록으로 둔다. 표를 Card로 한 번 더 감싸거나 FilterBar를 카드 안에 넣지 않는다
- 동봉 문서에 가이드 2편을 더했습니다. "대시보드 만들기"(guides/dashboards.md)는 PageHeader → FilterBar · PeriodPicker 비교 → KpiCard 줄 → DashboardGrid의 ChartCard 위젯 → DataGrid와 내보내기 순서, 질문별 차트, 상태 · 휴대폰 규칙, 시작할 블록을 다룹니다. "에이전트 대화 화면 만들기"(guides/conversation.md)는 전체 화면과 AppShell 옆 칸 배치, 답 항목 부품, 실행 상태 6개, 앱이 넘기는 것, 승인 규칙을 다룹니다. 스킬의 SKILL.md · 자주 틀리는 것 · 블록 표가 두 가이드와 새 부품 · 블록 패턴 `ErrorPage`를 가리킵니다. 소개 가이드의 컴포넌트 수를 116종(기본 101 · 차트 15)으로 맞췄습니다.
- 보강 요청은 서비스 저장소의 `.trellis/requests.md` 한 곳에 적는다(R-T05). 스킬 `references/request.md`, 가이드 서비스 시작하기 · 에이전트로 개발하기, llms.txt 규칙이 같은 곳을 가리킨다. 시작 템플릿이 머리줄만 있는 파일을 만든다. Trellis 쪽은 `node scripts/collect-requests.mjs <서비스 경로…>`로 backlog에 없는 줄을 모은다. 가이드의 오래된 문장(Phase 예정 · 51종 · 스킬 준비 중)을 지금 상태로 고쳤다(R-T37).
- 서비스 저장소에서 git 하위 모듈로 쓰기(D-58). react · contracts · icons에 `@terracelab/source` 내보내기 조건을 더해 개발 중에는 소스를 바로 읽는다. 서비스용 스킬 패키지(install · doctor · docs)를 추가했다. SegmentedControl이 Field 안에서 칸 폭으로 늘어나던 것을 고쳤다.
- 스킬: SKILL 0절에 회사 테마 단계(`pnpm ds:theme --brand`, 겹침 경고의 세 가지 · 밝은 색 제안, R-T02), `references/blocks.md`에 블록 플랫폼 · 화면 도우미 API 표(PlatformProvider props · Session · Role · User · usePlatform · setRole · useScreens · Page · Grid · useSiblings · josa · addDays 등, R-T06), 4절 검증은 `pnpm lint` · `pnpm check`(R-T41). 서비스 시작 템플릿에 `pnpm check`(전 화면 × 4폭 × 라이트 · 다크, axe · 가로 넘침 · 콘솔 오류, 본문 높이 스크린샷)와 eslint + Trellis 규칙 `pnpm lint`가 들어가고(R-T03), `pnpm ds:update`가 theme.css를 지금 생성기로 다시 만든다. 가이드 서비스 시작하기가 이 명령을 적는다.
- Card에 무게(`emphasis`: `strong` · `default` · `quiet`)와 제목 앞 상태 아이콘(`tone`)을 더했다. strong은 진한 테두리와 한 단계 큰 제목이고 화면에 하나만 쓴다. quiet는 테두리와 면이 없다. 본문이 비면 본문 칸을 그리지 않아 footer가 제목 바로 아래에 붙는다.

  새 컴포넌트 3개: `SectionHeader`(카드 밖 구역 제목 · 건수 · 설명 · 동작), `NotificationItem`(알림 목록 한 줄), `NotificationList`(오늘 · 어제 · 이번 주 · 이전 묶음, 읽지 않은 것 먼저, 모두 읽음). contracts에 `formatRelativeTime` · `relativeDayGroup`을 더했다.

  Avatar · PersonLabel에 공석(`vacant`)을 더했다. 점선 테두리와 사람 아이콘이고 "담당자 없음"으로 읽는다. PersonLabel은 `vacantLabel` · `action`을 받는다. 두 컴포넌트 모두 공석이면 `name`이 없어도 된다.

  Badge는 tone이 neutral이면 기본으로 점이 없다(결재 상태는 그대로 점). DueBadge의 먼 단계와 완료도 글자만 보인다. 점을 두려면 `dot`을 준다.

  PageHeader: 형제(siblings)가 있으면 meta가 설명 줄로 내려가고, 휴대폰에서는 형제 줄이 줄바꿈하지 않고 한 줄로 가로 스크롤된다. 형제를 가리키면 밑줄이 생긴다. Banner는 폭이 560보다 좁으면 동작 단추를 글 아래 줄로 내린다. Drawer는 열리면 첫 초점을 제목에 둔다(`data-autofocus`가 있는 칸이 있으면 그 칸).
