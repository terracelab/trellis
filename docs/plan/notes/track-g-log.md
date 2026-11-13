# 트랙 G 진행 기록

Patrick 요청(2026-11-10): 계획한 대로 디자인 시스템 보강과 Figma 연결을 전부 진행한다(D-117). 사람 확인이 필요한 곳은 추천안으로 진행하고 "확인 대기"로 적는다. 새 토큰 값은 넣지 않고 제안만 남긴다. 단계마다 검사 → 커밋 → 이 파일에 한 줄. 문맥이 끊기면 이 기록과 `10-figma-showcase-coverage.md`의 상태 줄을 보고 잇는다.

브랜치는 `track-g`다(main에서 갈라 냈고 push하지 않았다). 병렬 작업은 worktree 에이전트가 하고 이 브랜치로 합친다.

| 단계 | 내용 | 증명 |
|---|---|---|
| 계획 | 감사 · 기획안 `10-figma-showcase-coverage.md` | e4523c0 |
| 타일 | Patrick 제공 모듈 타일 15종. 모듈 35개 전부 타일(36개) | `pnpm --filter @terracelab/trellis-icons test` 44 passed · 149175c |
| PG-00 | D-110~D-117, README 1.0 정의(메신저 · 에이전트 대화) · 실행 순서, 3절 순서를 게시 2회에 맞춤 | `grep -c "^\| D-11[0-7]" docs/plan/decisions.md` = 8 |
| PG-05(코드) | `layout/*` 9개를 Figma 변수 출력에 추가(D-118, 확인 대기). 변수 483 · 해시 d0377fa9 | `pnpm --filter @terracelab/trellis-tokens test` 433 passed |
| PG-01(코드) | `scripts/figma-audit.mjs`(--emit keys · links · sets · screens, --check, --keys) | `node --test "scripts/*.test.mjs"` 5 passed · 61dca07 |
| PG-05(Figma) | Foundations: 변수 483(layout 9 추가), 페이지 12(Guidelines · Chart palette · Motion · Layout · Paper · 수정 메모 추가), 표지 잘림 수정, 타일 `_tile/` 36, mono = Roboto Mono(확인 대기) | readback 해시 9ee5d49 · 길이 23110 = `figma-diff --hash`, allScopes 0 · 코드 구문 불일치 0, 묶이지 않은 칠 0 · 글자 스타일 없는 글자 0(노드 4,654). 캡처 `figma-2026-11/foundations-*.png` |
| figma-diff | 해시를 Figma 안의 변수 순서에 매이지 않게(컬렉션 안 이름순). Figma는 새 변수를 끝에 붙인다 | 같은 파일에서 9ee5d49 일치 |
| PG-07 | Components 차트 14종(세트 13 + 낱개 Legend · Sparkline, `Legend / Item` 3변형). 기하는 `apps/preview/src/data.ts` 숫자에서 계산. ChartCard의 chart 자리는 INSTANCE_SWAP | 감사(차트 14페이지, 노드 2,516): 변형 수 = 축 값의 곱, 묶이지 않은 칠 0 · 글자 0. 색 변수 30개(chart · finance · fg · border · bg + status 3: RadialMeter tone · BulletBar 상태 · 오류). 캡처 `figma-2026-11/components-chart-*.png` |
| PG-41 · PG-35 | Link · Tag · TagInput · Divider · SelectableList · AvatarGroup, TrellisProvider `navigate`, presence 도우미, 블록 3개가 SelectableList 사용 | 합친 뒤 react 테스트 600 passed · typecheck 통과 · 데모 검사(messenger · hr-payroll) axe 0. VRT 기준 이미지는 마지막에 한 번에 · 5b97052 |
| PG-06 | Components 화면 뼈대: PageHeader · FilterBar(+Chip · Field) · ActionBar · Pagination(+Page) · KpiCard · SideNav · LineItemsEditor(+Row), DataGrid 부품(Cell 30 · Header cell 6 · Row 5 · Summary row), DataGrid 세트를 부품 인스턴스로 다시 만듦. AppShell 치수를 layout 변수에 묶음 | 감사(8페이지): 변형 수 = 축 값의 곱, 묶이지 않은 칠 0 · 글자 0, DataGrid 표 영역의 부품 밖 글자 0(4,704개 중). 캡처 `figma-2026-11/components-*.png` |
| PG-30 · 31 · 32 | 에이전트 대화: 패턴 spec `ConversationalWork`, `AGENT_RUN_STATES` 6, RichText(의존성 없는 파서, HTML을 만들지 않음) · Citation · SuggestionChips · RunSteps · ProposalCard, MessageThread 답변 모양과 동작 줄, Composer `suggestions`, 아이콘 thumbs-up · thumbs-down | 합친 뒤 build · typecheck · lint 통과, 테스트 contracts 66 · react 639 passed(스토리북 VRT 스냅샷 검사만 실패: 새 컴포넌트 11종 기준 이미지 없음) · 648763a |
| D-119 | `llms.txt` 한도 4 KB → 6 KB. 컴포넌트 107종의 이름 줄로 4,119 B가 됐다 | `pnpm build:docs` 통과(llms 4119B) |
| PG-04 | 코드 쇼케이스 리뉴얼: 히어로(7묶음 35모듈 지도, 강조 구절은 회사 색 한 색) · 기기 콜라주(지금 화면, 고정 비율 틀) · 알림 카드 월(실제 NotificationCard · SegmentedBar · Sparkline) · 회사 색 8가지 · 업무 영역 4줄. `export-showcase.mjs` → `dist/showcase/molecule.json`. 문구 · 시안은 확인 대기 | 합친 뒤 `pnpm --filter preview build && check` 통과(axe 4조합 0 · 가로 넘침 1440 · 390 0px · 외부 요청 0 · 4.30MB), 지도 테스트 4 passed, `@terracelab/one build` 통과. 캡처 `notes/track-g/showcase-*.png` |
| PG-39 · PG-40 | DashboardGrid(키보드로 순서 바꾸기 · 숨기기 · 배치 저장, `_ui` Grid가 감싼다), PeriodPicker `compare`, CSV 내보내기(`toCsv` · `downloadCsv`, 블록 25곳의 "엑셀 다운로드"가 `ExportButton`), FunnelChart, ComboChart 누적 3계열 이상(6개부터 "기타"), TrendChart `forecast`(예측 점선 + 구간) | 합친 뒤 build · typecheck · lint 통과, contracts 80 · react 657 passed, `build:docs` 컴포넌트 109, check-blocks 64 통과, 데모 전체 검사 axe 0(에이전트 실행). VRT 스냅샷 검사만 실패 · 9832349 |
| 사람 | Patrick: Foundations 라이브러리 게시 · 섬네일 지정 · 히어로 제목 안 2 선택(2026-11-10) | Components에서 `importVariableByKeyAsync`(color/bg/surface · layout/sidebar/width) · `importStyleByKeyAsync`(body)가 remote로 들어온다. `get_libraries`는 Pro 팀 라이브러리를 보여 주지 않아 게시 확인에 못 쓴다 |
| PG-04(문구) | 히어로 기본 제목을 안 2로 | preview build · check 통과, one build 통과 |
| PG-08 · PG-09 | Components 입력 14종: Field · FormSection · Textarea · AmountInput · QuantityInput · MaskedInput · SegmentedControl(+Segment) · DateField(+Popup) · PeriodPicker(+Preset · Popup · Sheet) · MultiSelect(+Item · Popup) · CodeSearch(+Item · Popup · Sheet) · ScanField · FileUpload(+File) · Attachment(+File) | 감사(15페이지, 노드 4,980 · 인스턴스 813): 변형 수 = 축 값의 곱, 묶이지 않은 칠 0 · 글자 0. 캡처 `figma-2026-11/components-*.png` |
| PG-10 · PG-11 | Components 상태 · 피드백 9종(Banner · EmptyState · ErrorSummary · Skeleton · Spinner · Progress · StatusDot · DueBadge · Tooltip), 탐색 · 기록 · 서식 6종(Menu · CommandPalette · Stepper · Timeline · DescriptionList · Paper)과 부품 12세트, Module tiles에 `tile/<id>` 15개(36개) | 감사(15페이지 + 타일, 노드 4,923): 세트 27, 변형 수 = 축 값의 곱, 값 하나짜리 state 축 0, 묶이지 않은 칠 0 · 글자 0, 타일 36 전부 이미지 칠. 캡처 `figma-2026-11/components-*.png` |
| 순서 | Components의 기존 contract 세트가 다 들어가서 PG-02를 먼저 한다. 묶음 G의 새 세트와 PG-12는 연결 뒤 키트 v2로 만들고 Components를 한 번 더 게시한다(게시 3회) | — |
| PG-37 · PG-38 | Checklist(상태 4: 완료 · 진행 · 대기 · 보류), MaskedInput `bankAccount`(은행 12곳 형식, 사람 확인 필요), QuantityInput 단위 환산(`units[].factor`), 블록 `erp/accounting/aging` · `erp/treasury/reconcile` · `scm/inventory/count` · `scm/warehouse/picking`, 시산표 소계는 DataGrid groupBy | 합친 뒤 build · typecheck · lint 통과, contracts 88 · react 671 passed, `build:docs` 컴포넌트 110, check-blocks 68 통과, 금칙어 0. 데모 검사(에이전트 실행) axe 0 · 넘침 0. 캡처 `notes/track-g/pg37-*.png` · `pg38-*.png` · 81d032f |
| PG-42 · PG-43 | MonthCalendar 주 · 일 보기, TimeField, WorkTimeline(R-T23), PermissionMatrix, Toolbar, ApprovalLine `compact`(R-T24), ApprovalLineEditor(R-T25), CheckboxGroup 색 점(R-T58). 블록 6개가 새 부품 사용 | 합친 뒤 build · typecheck · lint 통과, contracts 102 · react 715 passed, 컴포넌트 115 · 75c10c1 |
| PG-33 · PG-36 · PG-34 | AppShell `aside`(1280부터 붙는 칸 · 1024~1280 겹침 · 그 아래 시트) · `AppShellAside`, Composer `mentions` · `commands`, MessageThread 반응 · 답글 · 입력 중 · 사진, 메신저 블록(고정 공지 · 검색 · 멘션), 블록 `platform/assistant/chat` · `ecm/my-docs/ask` | 합친 뒤 build · typecheck · lint 통과, react 740 passed, check-blocks 70 통과, 금칙어 0, 데모 빌드 통과. 데모 검사(에이전트 실행) axe 0 · 넘침 0. 캡처 `notes/track-g/assistant-*.png` · `my-docs-ask-*.png` · `messenger-*.png` · 0a6932a |
| PG-44 | FileViewer(그림 확대 · 회전, PDF는 브라우저 내장 보기), EmptyState `notFound` · `expired` · `headingLevel`, 블록 `platform/errors/{not-found,forbidden,expired}` · `platform/import/excel`(CSV 읽기 · 줄 검증 · 반영), 문서함 미리보기 | 합친 뒤 c038b05 |
| 전체 검증 | 코드 작업 PG-30~44를 다 합친 상태 | build · typecheck · lint exit 0, 테스트 contracts 109 · react 756 · tokens 433 · icons 44 · eslint-plugin 71 · skill 17 passed, `build:docs` 컴포넌트 116 · 예시 332(llms 4260B), check-blocks 74 통과, 금칙어 0, 데모 전체 검사 화면 76 × 2폭 × 라이트 · 다크 통과(외부 요청 0 · 콘솔 오류 0). 실패는 스토리북 VRT 스냅샷 검사 하나(새 컴포넌트 20종 기준 이미지 없음) |
| 결정 | 작업 중 정한 것을 D-120~D-129로 기록(확인 대기) | decisions.md |
| PG-01 · PG-02 | Components를 Foundations 라이브러리에 연결. 지역 컬렉션 6 · 변수 483 · 글자 스타일 12 · 효과 스타일 3 삭제, 바인딩 257,202개가 전부 라이브러리 변수로, 글자 스타일 8,019 · 효과 스타일 190 노드도 라이브러리로. `docs/figma/keys.json`(Foundations 변수 483 · 스타일 15, Components 세트 117 · 낱개 206), 키트 v2(스킬 문서 3절: key 표를 파일에 한 번 저장, `P()`가 실제 색을 적는다), 페이지 106개 순서와 표지 색인 | `figma-audit --check docs/figma/audit/PG-01.json docs/figma/audit/PG-02.json` 통과(65줄), `--keys` 483개, 세트 117 · 변형 2,109가 앞뒤 같음, 세트 10개 앞뒤 캡처 차이 0픽셀. 직접 읽어 확인: 지역 컬렉션 0 · 스타일 0, Button 칠이 remote 변수. 캡처 `figma-2026-11/pg02-*.png` |
| 대시보드 예시 | 블록 `home/dashboard/forecast`(수요 예측 · 발주 추천: KPI 4, TrendChart 예측 구간, 추천 근거와 계산식, 발주 추천 표, ProposalCard 승인 뒤에만 초안 등록, DashboardGrid 배치 편집) · `home/dashboard/franchise`(가맹점 현황: 비교 기간 KPI, 매장 순위, 지역 × 주차 표, 매장 목록, 초도 물량 산출 · 개점 준비 Checklist). `home/dashboard/trade`에 배치 편집, `crm/opportunities/pipeline`에 FunnelChart. 데모에 프리셋 "프랜차이즈 본부" | 에이전트 실행: lint · typecheck 통과, react 756 passed, check-blocks 76 통과, 데모 검사 `--only home/dashboard` · `crm/opportunities` axe 0 · 넘침 0. 캡처 `notes/track-g/dashboard-*.png` · `pipeline-funnel-*.png` · 439231a(합친 뒤 전체 검증은 손질 작업과 함께) |
| Figma 새 세트 1 | Components(키트 v2): 대화 5종 RichText · Citation(+Chip · Marker) · SuggestionChips(+Chip) · RunSteps(+Step, 실행 상태 6) · ProposalCard, 기본 6종 Link · Tag · TagInput(+Option · Popup) · Divider · SelectableList(+Item) · AvatarGroup. 제자리 보강: MessageThread(Actions · Answer · Reaction · Images · Quote · Typing 부품, `typing`), Composer(`suggestions`, Option · Menu), AppShell(`aside`, `AppShell / Aside`) | 감사(16페이지): 세트 28, 변형 수 = 축 값의 곱, 값 하나짜리 state 축 0, 지역 컬렉션 0 · 지역 바인딩 0 · 묶이지 않은 칠 0. 기존 세 세트의 변형 이름 · 속성 그대로. 캡처 `figma-2026-11/components-*.png` · `components-conversation-dark.png` |
| 손질 | 쇼케이스 업무 영역 판에 에이전트 대화 줄, ComboChart 아래 선 정렬 · 툴팁 단위 한 번, DataGrid 묶음 행 0 표시 · 접기 단추 44px, 블록 링크 3곳(`?id=` · `?next=` · 엑셀 업로드), 영어 spec, 컴포넌트 수 116(기본 101 + 차트 15), 가이드 `dashboards` · `conversation`(한 · 영), 스킬 do-dont 31줄 · 블록 패턴 표 · `ErrorPage` | b2b63f7(합친 뒤 검증은 아래 줄) |
| PG-03 | Screens를 라이브러리에 연결: 지역 컬렉션 6 · 변수 474 · 스타일 15 삭제, 바인딩 67,436개 전부 라이브러리, 인스턴스 2,942개 중 2,928개가 라이브러리 본체, 사본 페이지 3개 삭제, 표지, 화면 키트 v2. **남은 것: PersonLabel 12 · ProfileHeader 2 인스턴스** — 두 세트가 Components에서 게시되지 않았다(`getPublishStatusAsync` = UNPUBLISHED) | `figma-audit --check docs/figma/audit/PG-03.json` 34항목 중 32 통과, 실패 2(`localSets` 2 · `localMainInstances` 14). G2 프레임 4개 앞뒤 차이 0픽셀, 시험 프레임은 홈 아이콘 색만(검정 → `nav/fgActive`, 원래 의도한 색), 급여 명세는 휴일근로 칸 차이. 덮어쓴 값 3,156개 다시 읽어 확인. 캡처 `figma-2026-11/pg03-*.png` |
| 손질 뒤 검증 | 손질 · 대시보드 예시까지 합친 상태 | build · typecheck · lint exit 0, contracts 109 · react 760 passed, `build:docs` 컴포넌트 116 · 가이드 15, check-blocks 76 통과, 금칙어 0. **`docs check` 실패**(MonthCalendar 5 · PermissionMatrix 1 · KpiCard 영어 1 · 패턴 가이드 표 1, 깨진 링크 3). 고치는 중 |
| Figma 새 세트 2 | Components(키트 v2): DashboardGrid(+Item) · FunnelChart · Checklist(+Item) · TimeField(+Option · Popup) · WorkTimeline · PermissionMatrix(+Box) · Toolbar(+Button) · ApprovalLineEditor(+Row) · FileViewer. 제자리 보강: MonthCalendar `view`(주 · 일), ApprovalLine `variant`(compact), CheckboxGroup `dot`, PeriodPicker / Popup `compare`, TrendChart `forecast`, ComboChart 누적 3계열 + 기타, EmptyState `notFound` · `expired` · `heading`, QuantityInput `base`, MaskedInput 계좌번호 줄 | 감사(19페이지, 노드 18,788): 세트 24, 변형 수 = 축 값의 곱, 지역 바인딩 0 · 묶이지 않은 칠 0 · 글자 0 · 끊긴 인스턴스 0. 기존 변형의 노드 id 그대로. 캡처 `figma-2026-11/components-*.png` |
| VRT | 기준 이미지 갱신(Docker 고정 이미지): 스냅샷 520장 통과. 새 컴포넌트 20종 80장 추가, 기존 이미지 픽셀 변경 0, ApprovalLine 스토리 교체 4장(`purchase` → `matrix`, 변형 축이 생겨서) | `pnpm vrt:update` exit 0 · `pnpm --filter @terracelab/storybook test` 4 passed · 331b067 |
| PG-12 | Components 세트 16개를 제자리에서 정리(세트 key 그대로): 값 하나짜리 `state` 축 제거(Badge · Avatar · ModuleIcon · Dialog · Drawer · Toast · Delta · Card · ProfileHeader), 모양을 안 바꾸는 축 제거(ProfileHeader 360 → 120 · Popover 144 → 72 · Card 6 → 2 · HrRecord 6 → 2), 항목 부품(Tabs 8칸 · RadioGroup 6 · SelectableCard 6 · Payslip 지급 9 · 공제 8줄 · OrgChart 평면 구조), `Usage · <Name>` 프레임 25개(`usage.mjs` · `usage-frame.js`로 다시 만든다) | `figma-audit --check docs/figma/audit/PG-12.json` 27항목 통과. 파일 전체 세트 158: `bad` 0 · 값 하나짜리 state 축 0 · 모양 안 바꾸는 축 0. 캡처 `figma-2026-11/pg12-*.png` |
| main | Patrick 요청으로 `main`에 합쳐 푸시. 원격 `main`의 PageHeader 수정(d95bc37)을 합침. PageHeader VRT 4장 변경 없음. 이후 작업은 `main`에서 한다 | react 760 passed · 27d9fa7 |
| Components 마무리 | 속성 이름 충돌 수정(PersonLabel `show presence`, ProfileHeader `show status` · `show presence`, 파일 전체 충돌 0), 아이콘 172개(코드와 같음: 4개 새로 만들고 12개 이동), 겹친 맨 위 노드 0, 인스턴스 안 불투명도 19곳 수정(Button 위험 가리킴 덧칠 · TrendChart 예측 구간 · StatusDot 후광), 표지 카드 3개 추가, `keys.json` Components 세트 158 · 낱개 230 | `figma-audit --check docs/figma/audit/components-final.json` 35항목 통과: 세트 158 · 변형 2,353, 노드 103,759 · 바인딩 326,493 전부 라이브러리, 묶이지 않은 칠 0 · 글자 0 · 끊긴 인스턴스 0. 캡처 `figma-2026-11/housekeeping-*.png`. **Components 다시 게시 대기** |
| 문서 사이트 검사 수정 | MonthCalendar 주 · 일 일정 단추 이름(보이는 글자를 이름에 포함), PermissionMatrix 잠긴 행 글자 `fg.tertiary`, KpiCard 영어 다시 시도 이름, 넘치는 표만 키보드로 스크롤되는 영역(`table-scroll.js`), 예시 링크 관례(`#…`, 예시 앱 경로는 사이트 링크로 세지 않음) | b620e2f |
| 전체 검증(main) | 전부 합친 상태 | build · typecheck · lint exit 0, `pnpm test` exit 0(react 762 · contracts 109 · tokens 433 · icons 44 · eslint-plugin 71 · skill 17 · storybook 4 · scripts 5), VRT 520 passed(기준 이미지 변경 없음), `build:docs` 컴포넌트 116 · 가이드 15, check-blocks 76, 금칙어 0, `docs check` 통과(한 · 영 136쪽씩 axe 0 · 깨진 링크 0), 데모 전체 검사 화면 78 × 2폭 × 라이트 · 다크 통과, preview check 통과 |

## 사람에게 넘길 것

- ~~Foundations 게시~~(2026-11-10 완료) → ~~PG-02~~(완료) → ~~Components 게시~~(완료) → PG-03(14개 남음) → **Components 다시 게시**(지금: 새 세트 43 · 낱개 8 · 아이콘 16, 바뀐 세트 49) → 남은 14개 교체. Components 섬네일도 Cover 프레임으로 직접 지정
- mono 글꼴: Roboto Mono에 한글이 없어 ChangeDiff 목록의 한글이 대체 글꼴로 그려진다(`pg02-change-diff-mono.png`). 한글이 있는 고정폭 NanumGothicCoding도 Figma에 있다
- 확인 대기: 쇼케이스 지도 배치와 판 구성(PG-04, 제목은 안 2 확정), mono 글꼴 Roboto Mono(PG-05, 한글 글리프 없음), 에이전트 대화 부품 이름(PG-30), layout 변수(D-118)
- Foundations 파일 섬네일: MCP가 `setFileThumbnailNodeAsync`를 지원하지 않는다. Cover 프레임을 오른쪽 클릭 → Set as thumbnail
- 값 제안: 아래 "토큰 제안"에 모은다

## 토큰 제안(값은 사람이 승인)

- `color.bg.hover` · `color.bg.pressed`: 어느 바탕에서나 쓰는 행 가리킴 · 누름 색. 지금은 `color-mix(fg.primary 5% · 10%)`(SelectableList, 옛 블록 CSS와 같음)
- 팝업 최대 높이 크기 토큰: TagInput이 `calc(space-64 * 4)`를 쓴다
- 다크 차트 팔레트: 지금 검증기의 밝기 띠(0.48~0.67)를 series-1 · 3 · 5가 벗어난다(색각 · 대비는 통과). 다크 슬롯 단계를 다시 잡는 제안이 필요하다
- `color.chart.other`: "기타"가 지금 `compare`(전기 비교) 색을 같이 쓴다. 같은 값의 이름을 따로 두는 안
- 차트 칠 불투명도 토큰(area 0.12~0.18 · 예측 구간 0.14가 숫자 그대로다)
- 라벨 종이 크기: `paper.size.label-sm` 50×30mm · `label-md` 100×50mm · `label-lg` 100×150mm, `paper.margin.label` 2mm. 라벨 인쇄 화면은 만들지 않았다
- `size.viewer.sm · md · lg`: FileViewer 높이(240 · 400 · 560)를 `space.64` 곱으로 만든다
- `size.calendar.hour`: 달력 시간 칸 높이(`space.48`)
- `layout.aside.width` = 400: AppShell 옆 칸 폭(PG-33). 넣지 않고 있는 토큰 조합으로 만든다

## 코드에서 찾은 것(고칠 것)

- ComboChart: 아래 보조 차트에 막대가 없으면 선이 위 막대와 어긋난다(Recharts가 점 눈금을 쓴다). 미리보기의 아래 툴팁이 "13.3%%"로 찍힌다(퍼센트 서식 + 단위 `%`). PG-40 합친 뒤 고친다
- Figma에서 숫자 고정폭(tnum)을 못 건다(Plugin API에 OpenType 설정이 없다). Figma 글자 스타일에서 손으로 켤 수 있다
- Figma 키트 `P()`: 인스턴스에서 본체와 같은 변수로 칠을 덮으면 바인딩은 남고 검정으로 그려진다. 덮는 칠은 `variable.resolveForConsumer(node)` 색으로 만든다. Components 전체를 한 번 훑어 고치고 스킬 문서 함정에 적는다
- Components AppShell 페이지에 옛 DataGrid 빌드가 남긴 "box" 사각형 48개(10:502…10:7595)를 지운다
- 내보내기는 xlsx가 아니라 CSV다(BOM · CRLF · 수식 주입 막기). 단추 글은 "엑셀 다운로드" 그대로. 확인 대기
- 컴포넌트 수 문구(overview 98종)를 마지막에 `build:docs` 수로 맞춘다
- 은행별 계좌 형식 표(`BANK_ACCOUNT_FORMATS`)는 사람이 확인한다(지역 농축협 012 · 우체국 071이 불확실). 표에 은행 이름이 들어 있다(금칙어 아님, 확인 대기)
- `erp/accounting/vendor-ledger`가 `?id=`를 읽지 않아 채권 연령 표의 거래처 링크가 목록만 연다
- DataGrid 묶음 행이 0 소계를 "0"으로 적고(데이터 행은 빈칸) 묶음 접기 단추가 휴대폰에서 40px보다 작다
- 영어 spec: Composer · MessageThread의 새 동작 글이 아직 번역되지 않았다
- 휴대폰에서 40px보다 작은 누름 자리: 출처 번호, 메신저 반응 알약(32) · 답글 인용
- R-T32(TeamSchedule 월 보기)는 하지 않았다
- 쇼케이스 업무 영역 판에 에이전트 대화 줄을 더하고 "1.0 전에 더합니다" 문장을 뺀다
- 대시보드 블록에서 찾은 빠진 부품: Card · ChartCard 머리가 좁은 화면에서 줄을 바꾸지 않는다, ChartCard `height: 'auto'` 없음, HeatCell 척도 시작값(`min`) 없음, BulletBar 표 칸용(이름 숨김) 모양 없음, BarList 이름 폭 상한 120
- Components 마무리(세트 작업이 다 끝난 뒤): 새 아이콘 16개를 Icons 페이지에(여섯 개는 MessageThread 페이지 `Icons · 새 아이콘`에 임시로 있다), AppShell 페이지에서 `SideNav / Item`이 AppShell 세트와 겹침, 표지에 새 묶음 카드, `keys.json` · README 갱신
- Figma는 인스턴스 안에서 변수에 묶인 칠의 불투명도를 버린다(5% 칠이 100%로 보인다). StatusDot pulse 후광 · Button danger 가리킴 덧칠이 인스턴스에서 그렇게 보일 수 있다. 덧칠은 노드 불투명도로 만든다
- PersonLabel · ProfileHeader가 게시에서 빠졌다. 같은 이름의 속성이 둘이다(`presence` 불리언과 변형, ProfileHeader는 `status`도). 불리언 이름을 바꿔 충돌을 없앤 뒤 다시 게시한다
- 라이브러리 Payslip의 근로 정보 칸은 4개다(Screens 사본은 휴일근로 포함 5개였다). PG-12가 줄 부품을 넣은 뒤 PG-13에서 화면을 다시 만든다
- ~~문서 사이트 검사 실패~~ 고침(b620e2f)
- PG-12 뒤 Screens 주의: 다시 게시하면 `state` · `headingLevel` · `initialFocus` 속성이 없어진다. 화면 키트가 그 속성을 넣으면 실패한다. 새 선택지: `show tab 4`(퇴직 탭) · `show card 4`(병가) · Payslip `show <항목>` · OrgChart `flat teams`
- StatusDot 후광(pulse) 불투명도를 Figma에서 0.2로 두었다(CSS pulse의 2배 크기 때 값). 확인 대기

## 3차 동기화(2026-11-12)

- 계기: Patrick이 더해진 커밋의 컴포넌트 변경을 소개 사이트와 Figma에 반영해 달라고 했다. 기준은 Figma 마지막 동기화(e7d5237) 뒤 contract · CSS 변경 전부다
- Components: 새 페이지 5(SectionHeader · NotificationItem · NotificationList · DeadlineStrip · AgentReplay), 그 자리 보강 4(Card emphasis · Link plain · MonthCalendar size · Paper / Fields blank), 부품 세트 3(Avatar / Vacant · PersonLabel / Vacant · MonthCalendar / Event), 아이콘 mouse-pointer-2. 세트 158 → 167, 변형 2,353 → 2,439, 낱개 22 → 25, 페이지 129 → 134
- 감사: `figma-audit --check docs/figma/audit/sync-3.json` 29항목 통과. 기존 key 해시 그대로
- 사이트: 소개 가이드 컴포넌트 수 116 → 121(ko · en), 묶음을 다시 빌드해 GitHub Pages에 올렸다(Pages 저장소 b7eff9f). 문서의 FilterBar `label` · PaperFields `blank` · 변경 이력이 반영됐다
- 남은 것(사람): Components 다시 게시. 게시 뒤 Screens의 Components key 목록을 다시 넣는다
- 남은 것(다음 동기화): PageHeader 형제 제목(D-141) · DataGrid 고정 열 그림자 · Banner 좁은 화면 · TeamSchedule 날짜 머리 · AppShell 옆 칸 폭과 접힘 · Badge neutral 점 기본값
- Docs 프레임의 옛 글: MonthCalendar Docs 첫 줄이 PG-42 때 고쳐지지 않아 "state 3 = 3"으로 남아 있었다. 축을 더할 때 Docs 글을 정규식으로만 찾지 말고 읽어서 확인한다
