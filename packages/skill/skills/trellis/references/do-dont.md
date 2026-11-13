# 자주 틀리는 것

| 하지 않는다 | 대신 |
|---|---|
| `color: #1F56E2`, `padding: 12px` | `var(--tl-color-brand-default)`, `var(--tl-space-12)` |
| `--tl-color-brand-500` 같은 primitive | `--tl-color-brand-default` 같은 semantic |
| 컴포넌트에 `style` · `className`으로 안쪽 덮기 | props와 variant. 없으면 보강 요청 |
| `onClick` | `onPress` |
| 수입 파랑 · 지출 빨강 | 수입 `finance.income`(빨강) · 지출 `finance.expense`(파랑) |
| 카드 · 행 · 배너 왼쪽의 굵은 색 띠 | 상태는 점 · 아이콘 · 배지 · 글자, 선택은 바탕 한 단계나 1px 테두리 전체 |
| 탭 · 칸 건수를 회색 알약에 | 작은 숫자 글자(Tabs `count`) |
| 경고 배너에 빨간 바탕 | `Banner` 그대로(흰 면, 상태는 아이콘 색) |
| 표의 줄마다 색 알약 | `Badge`를 DataGrid 셀에 두면 점 + 글자로 줄어든다 |
| "지금 바로 시작하세요!", "강력한" | 무엇을 하는지 평서문 |
| 금액 왼쪽 정렬, `1234567원` | 오른쪽 정렬, `formatAmount` → `1,234,567` |
| 서비스에서 새 버튼 · 표 컴포넌트를 만들기 | Trellis 컴포넌트 조합, 모자라면 보강 요청 |
| 줄을 더하고 빼는 입력 표를 CSS grid로 손으로 짜기 | `LineItemsEditor`(칸은 render로 Trellis 입력, 칸 오류는 `cellError`, 합계는 `totals`) |
| 줄 안 칸에 RadioGroup | 선택지가 2~5개라도 `Select`(줄 칸 예외) |
| 법인 · 지사 스위처와 사용자를 사이드바 맨 아래에 | AppShell `scope`(brand 오른쪽) · `user`(맨 오른쪽). 화면을 불러오는 동안은 `busy`(라우터 `useNavigation().state !== 'idle'`) |
| ⌘K 검색을 `Dialog` + `Input` + 목록으로 손으로 짜기 | `CommandPalette`(묶음 · 빠른 질문 · 답은 children, 앱이 거르면 `filter={false}`) |
| 표 칸에 두 줄을 `display: grid`로 직접, 칸마다 `원` | `DataGridLines`(두 줄 행 높이 고정), 금액 열 머리 단위는 DataGrid가 붙인다(5열 이상이면 표 위에 "단위 원" 한 번) |
| 행 끝 처리 단추를 render 안에 두고 행 열기를 막으려 `stopPropagation` | DataGrid `rowActions`(기본 행동 1개 + 더보기 Menu) |
| 화면 행동을 아이콘만으로(새로고침 · 내보내기) | 라벨 단추. 아이콘 전용은 보기 설정 · 더보기 같은 3차 행동만 |
| `transition: background 0.1s`, `--tl-duration-100` | `var(--tl-duration-fast) var(--tl-easing-standard)`(의미 이름: fast · normal · slow · slower · spin · pulse) |
| 조건 여러 개 + 검색 단추 조회 화면을 손으로 짜기 | `FilterBar layout="grid" onSearch`(라벨 열 격자) |
| 불러오는 동안 빈 화면 · 가운데 Spinner · `<Skeleton lines={6} />` | 내용과 같은 모양을 바로: 표 `Skeleton shape="table"` · 사람 목록 `list` · 숫자 줄 `kpi` · 카드 `card`(Skeleton이 150ms 뒤에 나타나 깜빡이지 않는다) |
| 사이드바 안에 `fg.secondary` · `bg.surface` 같은 본문 토큰 | `color.nav.*`(짙은 브랜드 면 위 글자 · 면 · 포커스) |
| 사람 이름 칸을 아바타 + 글자 두 줄로 직접 | `PersonLabel`(표 칸 `size="sm"` · 목록 md, 근무 상태 점) |
| 홈 카드 12개를 모두 같은 무게로, 급한 카드에 그림자 · 색 면 · 왼쪽 띠 | Card `emphasis`: "지금 해야 할 것" 한 구역만 `strong`(화면에 1개), 참고 정보는 `quiet`. 무게는 세 단계까지 |
| 카드 안 카드 | 안쪽은 Card `emphasis="quiet"` |
| 표(DataGrid)를 Card로 한 번 더 감싸기, 조회 줄(FilterBar)을 카드 안에 넣기 | DataGrid는 자기 면 · 테두리를 가진다(감싸면 테두리가 두 겹). 화면 목록은 `FilterBar` + `DataGrid`를 화면 바탕에 바로 둔다(둘 사이 `space.12`). 제목 있는 카드 안의 표만 `Card padding="none"` + DataGrid `className="tl-block-flat-grid"`(테두리 없이 위 구분선만, 첫 열이 카드 제목과 같은 선에서 시작, 좁은 화면은 행 카드 대신 구분선 목록) |
| 카드 묶음 · 표 위 구역 제목을 작은 라벨 · 중간 제목 + 건수 알약으로 따로 | `SectionHeader`(title · count · description · action, 감싸면 안 카드 제목이 한 단계 아래) |
| 알림 서랍을 목록 · 점 · 시각 글자로 손으로 짜기, 시각을 ISO 그대로 | `NotificationList`(날짜 묶음 · 모두 읽음) · 줄 하나는 `NotificationItem`, 시각은 `formatRelativeTime` |
| 담당자 공석을 "담당자 없음" 글자 + 따로 단추로 | `PersonLabel vacant`(점선 아바타 · 같은 높이 · `action`에 지정 단추) |
| neutral 배지 · 먼 기한(D-10)에 회색 점 | 점은 상태(StatusDot · Badge 점)와 범주 식별 두 뜻에만. neutral Badge · DueBadge 먼 단계는 점 없이 글자만(기본값) |
| 표 한 장 안에서 StatusDot sm과 md를 섞기 | 표 하나는 한 크기(표 칸은 sm) |
| 같은 묶음 화면 이동을 브레드크럼이나 탭으로만 | PageHeader `siblings`(제목 줄 탭 2~4개) + 화면 안 묶음은 Tabs |
| 조회 필터 Select를 이름 없이 나열 | label을 준 Select · MultiSelect · PeriodPicker → FilterBar가 "이름 값 ▾" 칩으로 묶는다 |
| 인사기록카드 · 출퇴근 · 주 52시간 · 연차 · 팀 휴가 달력 · 임금명세서를 블록마다 손으로 | `HrRecord` · `TimeClock` · `WorkHoursMeter` · `LeaveBalance` · `TeamSchedule` · `Payslip`(어휘 상수 · 타입은 `@terracelab/trellis-contracts`의 `HrMasterRecord` · `EMPLOYMENT_STATUSES` · `WORK_STATUSES` 등) |
| 주민등록번호 · 계좌를 화면에 그대로 | HrRecord가 가린다. 풀기는 `revealed` · `onRevealChange`로 앱이 권한 확인 · 감사 로그 뒤에 |
| 회사 색을 `--tl-color-brand-*`에 직접 써서 덮기 | `pnpm ds:theme --brand "#hex"`(빌드) 또는 `TrellisProvider theme={{ brand }}`(런타임). 엔진이 21개 토큰을 4모드로 대비를 맞춘다. 미리보기 · 회사 설정 화면은 `scope` |
| 브랜드 색 글자에 `brand.default`, 진행 막대에 `brand.default` | 글자는 `fg.link`, 글자 아닌 강조(진행 막대 · 로고 · 선택 점)는 `brand.accent`, 선택 · 현재 선은 `border.selected` |
| 증감을 `▲ 4.2%` 글자와 색으로 직접 | `Delta`(부호 · 화살표 늘 표시, finance는 증가 빨강 · 감소 파랑) |
| "항목 + 항목 − 항목 = 합계"를 DescriptionList로 | `AmountBreakdown`(연산 기호를 읽어 주고 합계 줄은 위 선 + 큰 글자) |
| 바뀐 값을 "이전: … / 이후: …" 글자로 | `ChangeDiff`(이전 값 취소선 · `diffFields`로 행 만들기) |
| 저장 전 검증 결과를 Banner 여러 개로 | `IssueList`(오류 먼저, 행으로 이동). 폼 제출 오류는 `ErrorSummary` |
| 반려 · 회수 · 삭제 사유를 Dialog + Textarea로 손으로 | `ReasonDialog`(최소 글자 수, 바깥 누름으로 닫히지 않는다) |
| 주민등록번호 · 계좌를 `formatRrn`으로 가리고 보기 단추를 직접 | `MaskedValue`(사유 확인 뒤 잠깐 원문, 다시 가리면 메모리에서 지운다). 권한 · 기록은 앱이 |
| 오류 · 권한 없음 · 오프라인 화면을 Banner나 빈 글자로 | `EmptyState kind="error" · "forbidden" · "offline"`(error는 요청 ID 한 줄), DataGrid는 `error` · `filtered` |
| 위험 토스트를 4초 뒤 사라지게 | Toast 기본이 위험 = 직접 닫을 때까지. 앱 설정은 `TrellisProvider toastDuration` |
| 글자 크기 · 고대비 · 포커스 강조를 앱 CSS로 | `TrellisProvider fontScale · contrast · focusRing · linkUnderline · chartPalette · motion`(`<html data-*>`) |
| 손가락 화면에서 작은 단추를 직접 키우기 | 크기는 그대로(xs 26 · sm 30), 손가락 기기에서는 누르는 자리가 저절로 36 · 44. 꼭 누를 실행은 `size="xl"`(48) |
| 블록 안에서 `window.location.hash` · `location.search`로 화면 값 읽기 | `useScreenParams()`(앱은 레이아웃 경로를 `ScreenParamsProvider`로 감싼다, 시작 템플릿 Shell) |
| 알림 · 링크 값에 앱 주소(`/people?id=…`)를 직접 | 블록 id(+ `?k=v`). 앱 주소는 `screens.ts`의 `screenHref`가 만든다. 여는 것은 `useOpenLink()` |
| 팀장 · 구성원 화면에서 다른 팀 · 남의 기록을 손으로 거르기 | `useScope().canSee(사람)`(역할의 scope: company · department · self) |
| 블록 목록 줄의 두 줄 글자를 CSS로 직접 | 표 칸은 `DataGridLines`, 목록 줄은 블록 `_ui`의 `Lines` |
| 블록을 고칠 때 slot이 어디인지 짐작 | 블록 코드의 `// slot:<이름>` … `// slot:<이름> end` 사이만 고친다(blocks/README.md) |
| 대시보드 카드를 CSS grid로 직접 놓고 순서 저장을 손으로 | `DashboardGrid`(`widgets` · `span` 2~12, `editing`에서 키보드 · 단추로 옮기고 숨긴다, `onLayoutChange` 값을 JSON으로 저장해 `layout`으로). 조립 순서는 `guides/dashboards.md` |
| "엑셀 다운로드"에 동작이 없거나 화면 표를 문자열로 이어 붙이기 | 블록은 `ExportButton`(`@terracelab/trellis-blocks/ui`, export 권한으로 막는다), 직접은 `toCsv`(contracts) + `downloadCsv`(react). 보이는 행만 넘긴다 |
| 단계 전환(문의 → 견적 → 수주)을 막대 차트나 표로 | `FunnelChart`(한 색 왼쪽 정렬 막대 + `conversion` 전환율) |
| 예측을 다른 색 선이나 별도 차트로 | TrendChart `forecast`(`from` 행부터 같은 색 점선, `lower` · `upper`로 범위 음영) |
| 전기 · 전년 비교 기간을 날짜 입력 두 개로 | PeriodPicker `compare`(직전 기간 · 전년 동기 · 직접 고르기, `resolvePeriodCompare`) |
| 목록 · 상세의 왼쪽 목록을 버튼 목록으로 직접 | `SelectableList`(행은 `aria-current` 단추, 묶음 · 안 읽음 수 · 근무 상태) |
| 분류 · 키워드를 Badge로, 사람 칩 입력을 Input + 목록으로 | 라벨 하나는 `Tag`(중립색, 상태 뜻은 Badge), 넣고 빼는 칩 칸은 `TagInput`(`mode="person"`이면 사람 칩) |
| 앱 안 링크를 `<a href>`로 두어 새로 고침 | `Link` + `TrellisProvider navigate`(앱 안 주소의 왼쪽 누름만 라우터로 넘긴다) |
| 구분선을 `border-top` div로 | `Divider`(가로 · 세로, 가운데 글자). 카드 · 표 테두리 위에 겹치지 않는다 |
| 참석자를 아바타 여러 개로 직접 겹치기 | `AvatarGroup`(`max`는 +N 칸 포함) |
| 마감 점검 · 온보딩 할 일을 체크박스 목록으로 | `Checklist`(상태 4: 완료 · 진행 · 대기 · 보류, 기한 · 담당 · 진행 요약) |
| 계좌번호를 숫자 칸 하나로 | `MaskedInput mask="bankAccount" bank="004"`(은행마다 형식, 저장은 숫자 + 은행 코드) |
| BOX · EA 환산을 화면에서 따로 계산 | QuantityInput `units`의 `factor`(기준 단위 factor 1, 기준 수량 줄을 보인다) |
| 시각을 Select 48칸이나 글자 칸으로 | `TimeField`(930 → 09:30, `step` 목록) |
| 주간 출퇴근을 표로만 | `WorkTimeline`(요일마다 출근 ~ 퇴근 막대, 소정 근무를 넘은 만큼 연장) |
| 주 · 일 일정을 별도 컴포넌트로 | MonthCalendar `views={['month', 'week', 'day']}`(기본은 월만) |
| 역할 권한 표를 체크박스 표로 직접 | `PermissionMatrix`(대상 × 동작 + 데이터 범위, `requires`로 조회 먼저) |
| 서식 도구 줄을 IconButton 나열로 | `Toolbar`(묶음 · 구분선 · 화살표 이동, 꺼진 단추도 닿는다) |
| 표 칸 · 목록 행에 결재선 전체를 | ApprovalLine `variant="compact"`(5색 점 + "2/3 합의" 한 줄) |
| 기안의 결재선 · 참조자 편집을 손으로 | `ApprovalLineEditor`(추가 · 순서 · 역할 · 참조, 마지막 승인 안내) |
| 첨부 미리보기를 `<img>` · `<iframe>`으로 | `FileViewer`(그림 확대 · 회전, PDF는 브라우저 내장 보기, 그 밖은 파일 카드) |
| 없는 주소 · 만료 화면을 빈 글자로 | `EmptyState kind="notFound" · "expired"`(`headingLevel={1}`), 화면 하나를 차지하면 블록 패턴 `ErrorPage`(`platform/errors/*`). 메뉴에 넣지 않는다 |
| 에이전트 답을 말풍선 안 HTML이나 `dangerouslySetInnerHTML`로 | MessageThread 항목 `kind: 'answer'`(본문은 RichText, HTML을 만들지 않는다). 순서는 `guides/conversation.md` |
| 답의 근거를 본문 끝 글자로 | `citations`(본문 `[1]`과 번호가 같은 Citation 목록, 누르면 `onCitationOpen`) |
| 추천 질문을 누르면 바로 보내기 | Composer `suggestions` · `SuggestionChips`(입력 칸에 넣기만 한다) |
| "분석 중..." 글자로 진행 표시 | `RunSteps`(상태는 `AGENT_RUN_STATES` 6개: 대기 · 실행 중 · 확인 대기 · 완료 · 실패 · 중단) |
| 에이전트가 데이터를 바로 고치거나 확인 Dialog 하나로 | `ProposalCard`(바뀌는 칸 `changes` + 승인 · 사유 받는 반려). 승인 전에는 바꾸지 않는다 |
| 업무 화면 옆 대화를 Drawer로 | AppShell `aside`(1280부터 붙는 칸 · 그 아래 겹침 · 휴대폰 시트), 블록은 `AppShellAside` |
| "@이름" · "/명령" 자동 완성을 직접 | Composer `mentions` · `commands`(보낼 때 `meta.mentions` · `meta.command`) |
| 메신저 반응을 이모지로, 답글을 왼쪽 띠 인용으로 | MessageThread `reactions`(아이콘 알약, `onReact`) · `replyTo`(둘레 상자 인용, 누르면 원문으로) |
| 화면 문구에 모델 · 공급사 이름 | 서비스가 정한 에이전트 이름(예: 업무 도우미) |
