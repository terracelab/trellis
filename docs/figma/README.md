# Figma — Trellis 라이브러리 파일

코드가 진실이고 Figma 파일은 생성물이다(pipeline.md §7). 토큰 값은 `packages/tokens/src/**/*.json`, 컴포넌트의 이름 · 변형 축 · 상태는 `packages/contracts/src/<Name>/<Name>.contract.ts`가 정한다. Figma에서 바꾼 값은 PR로 코드에 반영해야 유효하고 다음 동기화가 덮어쓴다.

2026-11-10에 만든 파일 세 개가 기준이다. 팀 "Kyongsub Kong의 팀"(Pro) 프로젝트에 있다. 주인은 D-110대로 나뉜다.

- Foundations가 변수 · 글자 스타일 · 그림자 스타일의 주인이다. 2026-11-10에 사람이 라이브러리로 게시했다.
- Components가 세트 · 아이콘 · 모듈 타일의 주인이다. 변수와 스타일은 Foundations 라이브러리에 묶여 있고 파일 안에 지역 변수 · 스타일이 없다(PG-02). 게시는 사람이 한다(아래 "게시 절차").
- Screens는 두 라이브러리를 쓰기만 한다(PG-03). PersonLabel · ProfileHeader 두 세트만 사본이다. 2026-11-13 현재 두 세트는 Components에서 게시되어 있고 사본을 라이브러리로 바꾸는 일이 남았다(아래 "4차 동기화"). 두 세트가 게시되지 않던 원인(같은 이름의 속성 두 개)은 2026-11-10 정리에서 고쳤다(아래 "Components 정리").

라이브러리에서 가져올 key는 `docs/figma/keys.json`에 있다. Foundations의 변수 483 · 글자 스타일 12 · 효과 스타일 3, Components의 세트 167 · 낱개 컴포넌트 234(아이콘 173 · 타일 36 포함)이다. `node scripts/figma-audit.mjs --keys docs/figma/keys.json`이 변수 key가 `variables.json`을 다 덮는지 확인한다.

| 파일 | 주소 | 내용 |
| --- | --- | --- |
| Trellis · Foundations | https://www.figma.com/design/k1mrv5tz9JpPUIt72dXHSj | 변수 6컬렉션 483 · 글자 스타일 12 · 그림자 3 · 문서 페이지 12 · 게시하지 않는 타일 사본 `_tile/<id>` 36 |
| Trellis · Components | https://www.figma.com/design/wm3bZ3mscnjwjmim1I8LeL | 아이콘 173 · 모듈 타일 36 · 세트 167(변형 2,444) · 낱개 컴포넌트 25. 변수 · 스타일은 Foundations 라이브러리 |
| Trellis · Screens | https://www.figma.com/design/QNmIYwV6G64VXwampA4b9e | 화면 17개 × 모드 = 프레임 48. 변수 · 스타일은 Foundations, 인스턴스는 Components 라이브러리. 게시 대기 사본 2(PersonLabel · ProfileHeader) |

## 변수와 스타일

원본은 `packages/tokens/dist/figma/variables.json`이다(`pnpm --filter @terracelab/trellis-tokens build`). Figma에서는 Foundations에만 있다.

| 컬렉션 | 모드 | 변수 | 내용 |
| --- | --- | --- | --- |
| Primitives | Value | 203 | 색 137(스코프를 비워 선택 목록에서 숨김) · 간격 · 반경 · 크기 · 굵기 · 시간 · layout 9(D-118) |
| Company | 회사 색 프리셋 8: 주황(기본) · 파랑 · 초록 · 보라 · 분홍 · 노랑 · 하늘 · 거의 검정 | 84 | `<light\|dark\|hcLight\|hcDark>/color/...` 원시 색(일부 #RRGGBBAA). 스코프 없음 |
| Semantic | Light · Dark · HC Light · HC Dark | 122 | 전부 별칭. 회사 색 21개는 `Company/<엔진 모드>/<같은 이름>`, 나머지는 `Primitives/...` |
| Density | Compact · Comfortable · Touch | 12 | 컨트롤 · 행 높이 · 카드 여백 · 본문 크기 |
| Typography | Value | 36 | 글자 스타일 12개의 크기 · 줄 높이 · 굵기(굵기는 Primitives 별칭) |
| Paper | Value | 26 | 인쇄 서식(색은 Primitives 별칭) |

- 모든 변수에 WEB 코드 구문 `var(--tl-…)`이 있다. Company 변수는 엔진 모드 접두를 뺀 CSS 변수 이름을 쓴다.
- 프레임에서 Company 모드만 바꾸면 회사 색이 바뀐다. Semantic 모드와 Company 모드는 서로 독립이다.
- 글자 스타일 12: display · h1 · h2 · h3 · h4 · body · label · caption · micro · mono · amount · amountLg. 크기 · 줄 높이 · 굵기는 Typography 변수에 묶었다. 글꼴은 Figma에 Pretendard Variable이 없어 같은 디자인의 정적 Pretendard(400 Regular · 500 Medium · 600 SemiBold · 700 Bold)를 쓴다. mono는 Roboto Mono Regular다(PG-05, 확인 대기). Roboto Mono에는 한글 글리프가 없어 한글은 대체 글꼴로 그려진다.
- 효과 스타일 shadow/sm · md · lg = `packages/tokens/src/primitive/shadow.json`. Figma 변수에 그림자 타입이 없어 스타일로 둔다.

## Trellis · Foundations 페이지

| 페이지 | 내용 |
| --- | --- |
| Cover | 파일 설명 · 메타 · 페이지 색인 |
| Guidelines | 절대 규칙 · 원칙 6 · 고정 어휘(상태 7 · 결재 5 · 금융 색) · 이름 규칙 · 상태 표시 규칙 · Figma 사용 규칙 |
| Color | Semantic 122 견본을 Light · Dark · HC Light · HC Dark 네 열로(열마다 Semantic 모드 고정). 회사 색 모드 예시 6프레임(주황 · 파랑 · 노랑 × Light · Dark, 레이어는 같고 모드만 다름). Primitives 팔레트 |
| Chart palette | 계열 5 · 비교 · 격자 · 축 · 열 5, 색각 보정 12 |
| Typography | 글자 스타일 12 견본 · 금액 표기 |
| Space · Radius | 간격 17 · 반경 6 · 테두리 3 · 크기(아이콘 · 모듈 아이콘 · 아바타 · 터치) · 그림자 3 |
| Density | Compact · Comfortable · Touch 세 열(열마다 Density 모드 고정) |
| Motion | duration 11 · 쓰임 |
| Layout | 글로벌 바 · 사이드바 · 본문 폭 · breakpoint · z 순서 |
| Paper | 종이 크기 4 · 여백 · 글자 14 |
| Module icons | 게시하지 않는 타일 사본 `_tile/<id>` 36 · modules.json 모듈 35 표. 게시하는 타일은 Components의 `tile/<id>`다 |
| 수정 메모 | G2 승인 대기 값 목록 |

## Trellis · Components 페이지

- Cover(묶음별 색인) · Icons(`icon/<lucide 이름>` 173, 24 격자 · 선 1.5 · 선 색 color/fg/primary, `packages/icons`의 `ICON_NAMES`와 같은 수 · 같은 순서) · Module tiles(`tile/<id>` 36, 모듈 35개 전부와 지출결의) 뒤에 묶음 구분 페이지 12개와 컴포넌트 페이지 119개가 있다. 페이지는 모두 134개다.
- 컴포넌트마다 한 페이지에 `Docs · <Name>`(설명) · `Labels · <Name>`(행 · 열 라벨) · 컴포넌트 세트 `<Name>`이 있다. 세트 설명에 contract 경로 · spec 경로 · 문서 주소가 있다. 하위 부품은 `<Name> / <부품>` 세트나 낱개 컴포넌트로 같은 페이지에 둔다(D-112).
- 변형 축은 contract에서 `values`가 있는 props와 `state`(contract의 states)다. 예외 두 개는 기본값이 없어 값이 없을 때 모양이 다른 Badge.approval · Avatar.status이고 `none` 값을 더했다(Badge 150 → 180, Avatar 32 → 40). 나머지 선택 값이 없는 경우는 해당 부분을 숨기는 BOOLEAN 속성으로 나타낸다.
- 상태와 겹치지 않는 켜고 끄기(checked · indeterminate · unread · dot · count · description 등)는 BOOLEAN, 라벨은 TEXT, 아이콘은 `icon/<name>`을 바꿔 끼우는 INSTANCE_SWAP 속성이다.
- 포커스 상태는 CSS outline과 같은 자리에 그린 바깥 링(border/focus · border/width/2 · 2 바깥)이다.
- 안쪽 단추 · 배지 · 아바타 · 확인란은 같은 파일 세트의 인스턴스다. Button · IconButton · Badge · Avatar · ModuleIcon · Checkbox를 다시 만들면 그것을 쓰는 세트도 다시 만든다(목록은 스킬 문서).
- D-113은 PG-12(2026-11-10)에서 적용했다. 값 하나짜리 state 축을 Badge · Avatar · ModuleIcon · Card · Dialog · Drawer · Toast · Delta · ProfileHeader에서 뺐고, 화면에 안 보이는 축(headingLevel · initialFocus)을 Card · Popover · ProfileHeader · HrRecord에서 뺐다. 세트는 그 자리에서 고쳐 key가 그대로다. 항목 수가 바뀌는 Tabs · RadioGroup · SelectableCard · Payslip · OrgChart는 항목 부품과 숨긴 칸(`show <칸>` 속성)을 더했다. P0 · Layout 페이지 25개에 `Usage · <Name>` 프레임(해부 · 쓰는 곳 · 쓰지 않는 곳 · 키보드 · 화면 예)이 있다. 결과는 `docs/figma/audit/PG-12.json`이다.

묶음별 세트와 변형 수다. 낱개는 변형이 없는 컴포넌트다. 합계는 컴포넌트 페이지 119 · 세트 167 · 변형 2,444 · 낱개 25(아이콘 173 · 타일 36 별도)다. 2026-11-13 4차 동기화 뒤 잰 수이고(`docs/figma/audit/sync-4.json`) Cover 색인 카드와 같다.

| 묶음 | 페이지 | 세트 | 변형 | 낱개 |
| --- | --- | --- | --- | --- |
| P0 | 18 | 25 | 849 | 4 |
| PR-08 | 11 | 19 | 239 | 3 |
| PR-30 | 6 | 6 | 55 | 0 |
| HR | 9 | 10 | 195 | 2 |
| Layout | 7 | 9 | 60 | 2 |
| Inputs | 14 | 20 | 289 | 6 |
| Feedback | 9 | 9 | 84 | 1 |
| Navigation · Record · Paper | 6 | 18 | 111 | 0 |
| Charts | 15 | 14 | 90 | 2 |
| Conversation | 6 | 10 | 62 | 1 |
| Basics | 6 | 9 | 199 | 0 |
| Dashboard · Operations | 12 | 18 | 211 | 4 |
| 합계 | 119 | 167 | 2,444 | 25 |

**--- P0** · 페이지 18 · 세트 25 · 변형 849 · 낱개 4

| 페이지 | 세트 변형 수 · 낱개 컴포넌트 |
| --- | --- |
| Button | Button 120 |
| IconButton | IconButton 150 |
| Badge | Badge 180 |
| Avatar | Avatar 40 · Avatar / Vacant 8 |
| ModuleIcon | ModuleIcon 3 |
| Card | Card 6 |
| NotificationCard | NotificationCard 8 |
| Input | Input 50 |
| Checkbox | Checkbox 5 |
| RadioGroup | RadioGroup 10 · RadioGroup / Option 10 |
| Switch | Switch 12 |
| Select | Select 50 |
| Tabs | Tabs 25 · Tabs / Tab 50 |
| Dialog | Dialog 6 |
| Drawer | Drawer 12 |
| Toast | Toast 5 |
| AppShell | SideNav / Item 6 · AppShell 4 · AppShell / Phone 낱개 · AppShell / Aside 낱개 |
| DataGrid | DataGrid / Card row 낱개 · DataGrid / Cell 30 · DataGrid / Header cell 6 · DataGrid / Row 5 · DataGrid / Summary row 낱개 · DataGrid 48 |

**--- PR-08** · 페이지 11 · 세트 19 · 변형 239 · 낱개 3

| 페이지 | 세트 변형 수 · 낱개 컴포넌트 |
| --- | --- |
| MonthCalendar | MonthCalendar 18 · MonthCalendar / Event 9 |
| KanbanBoard | KanbanBoard 3 |
| FolderTree | FolderTree 4 |
| MessageThread | MessageThread 4 · MessageThread / Actions 3 · MessageThread / Answer 3 · MessageThread / Reaction 2 · MessageThread / Images 2 · MessageThread / Quote 낱개 · MessageThread / Typing 낱개 · MessageThread / Tools 낱개 |
| Composer | Composer 5 · Composer / Option 4 · Composer / Menu 2 |
| ContextMenu | ContextMenu 4 |
| Popover | Popover 72 |
| SelectableCard | SelectableCard 50 · SelectableCard / Card 20 |
| CheckboxGroup | CheckboxGroup 24 |
| AddressInput | AddressInput 6 |
| ApprovalLine | ApprovalLine 4 |

**--- PR-30** · 페이지 6 · 세트 6 · 변형 55

| 페이지 | 세트 변형 수 · 낱개 컴포넌트 |
| --- | --- |
| Delta | Delta 24 |
| AmountBreakdown | AmountBreakdown 12 |
| ChangeDiff | ChangeDiff 4 |
| IssueList | IssueList 4 |
| ReasonDialog | ReasonDialog 8 |
| MaskedValue | MaskedValue 3 |

**--- HR** · 페이지 9 · 세트 10 · 변형 195 · 낱개 2

| 페이지 | 세트 변형 수 · 낱개 컴포넌트 |
| --- | --- |
| PersonLabel | PersonLabel 30 · PersonLabel / Vacant 2 |
| ProfileHeader | ProfileHeader 120 |
| OrgChart | OrgChart 3 · OrgChart / Node 낱개 |
| HrRecord | HrRecord 2 |
| TimeClock | TimeClock 24 |
| WorkHoursMeter | WorkHoursMeter 4 |
| LeaveBalance | LeaveBalance 4 |
| TeamSchedule | TeamSchedule 4 |
| Payslip | Payslip 2 · Payslip / Row 낱개 |

**--- Layout** · 페이지 7 · 세트 9 · 변형 60 · 낱개 2

| 페이지 | 세트 변형 수 · 낱개 컴포넌트 |
| --- | --- |
| PageHeader | PageHeader 낱개 |
| FilterBar | FilterBar / Chip 3 · FilterBar / Field 낱개 · FilterBar 4 |
| ActionBar | ActionBar 4 |
| Pagination | Pagination / Page 10 · Pagination 5 |
| KpiCard | KpiCard 18 |
| SideNav | SideNav 8 |
| LineItemsEditor | LineItemsEditor / Row 4 · LineItemsEditor 4 |

**--- Inputs** · 페이지 14 · 세트 20 · 변형 289 · 낱개 6

| 페이지 | 세트 변형 수 · 낱개 컴포넌트 |
| --- | --- |
| Field | Field 6 |
| FormSection | FormSection 3 |
| Textarea | Textarea 10 |
| AmountInput | AmountInput 25 |
| QuantityInput | QuantityInput 25 |
| MaskedInput | MaskedInput 25 |
| SegmentedControl | SegmentedControl / Segment 16 · SegmentedControl 8 |
| DateField | DateField 25 · DateField / Popup 낱개 |
| PeriodPicker | PeriodPicker 25 · PeriodPicker / Preset 6 · PeriodPicker / Popup 낱개 · PeriodPicker / Sheet 낱개 |
| MultiSelect | MultiSelect / Item 6 · MultiSelect 50 · MultiSelect / Popup 낱개 |
| CodeSearch | CodeSearch 25 · CodeSearch / Item 6 · CodeSearch / Popup 낱개 · CodeSearch / Sheet 낱개 |
| ScanField | ScanField 15 |
| FileUpload | FileUpload / File 3 · FileUpload 6 |
| Attachment | Attachment / File 2 · Attachment 2 |

**--- Feedback** · 페이지 9 · 세트 9 · 변형 84 · 낱개 1

| 페이지 | 세트 변형 수 · 낱개 컴포넌트 |
| --- | --- |
| Banner | Banner 10 |
| EmptyState | EmptyState 28 |
| ErrorSummary | ErrorSummary / Link 낱개 · ErrorSummary 2 |
| Skeleton | Skeleton 7 |
| Spinner | Spinner 3 |
| Progress | Progress 12 |
| StatusDot | StatusDot 10 |
| DueBadge | DueBadge 8 |
| Tooltip | Tooltip 4 |

**--- Navigation · Record · Paper** · 페이지 6 · 세트 18 · 변형 111

| 페이지 | 세트 변형 수 · 낱개 컴포넌트 |
| --- | --- |
| Menu | Menu / Item 6 · Menu 8 |
| CommandPalette | CommandPalette / Item 3 · CommandPalette 2 |
| Stepper | Stepper / Step 16 · Stepper 4 |
| Timeline | Timeline / Item 20 · Timeline 2 |
| DescriptionList | DescriptionList / Item 6 · DescriptionList 6 |
| Paper | Paper / Seal 4 · Paper / Title 2 · Paper / Fields 4 · Paper / MoneyTable 2 · Paper / Text 6 · Paper / Signature 2 · Paper / SignPair 2 · Paper 16 |

**--- Charts** · 페이지 15 · 세트 14 · 변형 90 · 낱개 2

| 페이지 | 세트 변형 수 · 낱개 컴포넌트 |
| --- | --- |
| Legend | Legend / Item 3 · Legend 낱개 |
| Sparkline | Sparkline 낱개 |
| SegmentedBar | SegmentedBar 4 |
| HeatCell | HeatCell 18 |
| DataBar | DataBar 2 |
| BulletBar | BulletBar 8 |
| RadialMeter | RadialMeter 12 |
| TrendChart | TrendChart 12 |
| ComboChart | ComboChart 8 |
| BarList | BarList 4 |
| WaterfallChart | WaterfallChart 4 |
| Donut | Donut 2 |
| CalendarHeatmap | CalendarHeatmap 4 |
| ChartCard | ChartCard 3 |
| FunnelChart | FunnelChart 6 |

**--- Conversation** · 페이지 6 · 세트 10 · 변형 62 · 낱개 1

| 페이지 | 세트 변형 수 · 낱개 컴포넌트 |
| --- | --- |
| RichText | RichText 2 |
| Citation | Citation / Chip 3 · Citation / Marker 3 · Citation 6 |
| SuggestionChips | SuggestionChips / Chip 8 · SuggestionChips 4 |
| RunSteps | RunSteps / Step 12 · RunSteps 6 |
| ProposalCard | ProposalCard 12 |
| AgentReplay | AgentReplay 6 · AgentReplay / Pointer 낱개 |

**--- Basics** · 페이지 6 · 세트 9 · 변형 199

| 페이지 | 세트 변형 수 · 낱개 컴포넌트 |
| --- | --- |
| Link | Link 30 |
| Tag | Tag 32 |
| TagInput | TagInput / Option 9 · TagInput / Popup 2 · TagInput 50 |
| Divider | Divider 16 |
| SelectableList | SelectableList / Item 30 · SelectableList 24 |
| AvatarGroup | AvatarGroup 6 |

**--- Dashboard · Operations** · 페이지 12 · 세트 18 · 변형 211 · 낱개 4

| 페이지 | 세트 변형 수 · 낱개 컴포넌트 |
| --- | --- |
| DashboardGrid | DashboardGrid / Item 6 · DashboardGrid 4 |
| Checklist | Checklist / Item 16 · Checklist 5 |
| TimeField | TimeField 25 · TimeField / Option 4 · TimeField / Popup 낱개 |
| WorkTimeline | WorkTimeline 낱개 |
| PermissionMatrix | PermissionMatrix / Box 8 · PermissionMatrix 8 |
| Toolbar | Toolbar / Button 20 · Toolbar 20 |
| ApprovalLineEditor | ApprovalLineEditor / Row 4 · ApprovalLineEditor 5 |
| FileViewer | FileViewer 48 |
| SectionHeader | SectionHeader 낱개 |
| NotificationItem | NotificationItem 18 |
| NotificationList | NotificationList 2 · NotificationList / Empty 낱개 |
| DeadlineStrip | DeadlineStrip 3 · DeadlineStrip / Point 12 · DeadlineStrip / Row 3 |

## 4차 동기화(2026-11-13, 769837e 뒤 변경)

코드 e3e1d00 기준이다. 3차 동기화(769837e) 뒤 코드에서 바뀐 것은 토큰 설명 글(D-151)과 FilterBar · ProfileHeader · TeamSchedule CSS다. contract · 아이콘 · 모듈 · 토큰 값은 바뀌지 않았다. 3차에서 남긴 모양 가운데 그 자리에서 고칠 수 있는 것도 함께 옮겼다. 결과 파일은 `docs/figma/audit/sync-4.json`이고 `node scripts/figma-audit.mjs --check docs/figma/audit/sync-4.json`이 통과한다(54항목). 세트 167 · 낱개 234의 key는 모두 그대로다(해시 bb6cb043 · 60f13d5c, `keys.json`과 같다).

고치기 전에 잰 차이다.

| 파일 | 잰 것 | 결과 |
| --- | --- | --- |
| Foundations | 변수 스냅샷 | 해시 9ee5d49(길이 23,110) = `figma-diff --hash`. 값 · 별칭 · 모드 차이 0, ALL_SCOPES 0, 코드 구문 불일치 0 |
| Foundations | 변수 설명 | Figma 변수 483개에는 설명이 없다. 코드의 `$description`은 `variables.json`에 실리지 않는다. 바꿀 것이 없었다 |
| 세 파일 | 저장소 밖 금칙어 목록으로 훑기 | 변수 · 스타일 · 세트 · 컴포넌트 설명, 페이지 · 노드 이름, 글자 노드(Foundations 2,012 · Components 27,555 · Screens 전체)에서 0 |
| Components | contract 121개와 세트 축 | 세트가 없는 contract는 Icon(Icons 페이지) · TrellisProvider(모양 없음) 둘이다. 축 값이 빠진 것은 CalendarHeatmap `layout=auto` 하나다 |
| Components | 세트 감사 | 세트 167 · 변형 2,439, 모두 변형 수 = 축 값의 곱. 값 하나짜리 state 축 0 |
| Screens | 연결 상태 | 지역 컬렉션 · 스타일 0, 본체 없는 인스턴스 0, 프레임 48개 모두 모드 두 개 명시, 사본 인스턴스 14(PersonLabel 12 · ProfileHeader 2) |

값(`values`)이 있는데 축이 아닌 prop은 11개이고 3차 동기화 때와 같다. `headingLevel`(Card · HrRecord · NotificationList · ProfileHeader · SectionHeader)과 Popover `initialFocus`는 모양을 바꾸지 않는다(D-113). 나머지는 AmountInput `currency` · KpiCard `format` · Field `span` · BulletBar `polarity` · PersonLabel `status`다. 이 다섯이 축이 아닌 까닭은 이번에 다시 확인하지 않았다.

고친 것이다. 세트 · 변형 key가 그대로다.

| 대상 | 바뀐 점 |
| --- | --- |
| Foundations Cover | 메타 글자 `tokens 0.1.0` → `tokens 1.0.0`, `2026-11-10 · 8b7c210` → `2026-11-13 · e3e1d00`. 변수 · 스타일은 건드리지 않았다 |
| TeamSchedule(변형 4) | 오늘 열을 중립색으로 바꿨다(D-146). 열 바탕 fg/primary 8%, 날짜 원 fg/strong, 숫자 fg/inverse다. 전에는 brand/subtle · brand/default였다. 주말 열은 fg/primary가 100%로 칠해져 검게 보였다. 4%로 되돌렸다. 두 덧칠은 칸 안 `tint` 사각형 60개(오늘 20 · 주말 40)의 노드 불투명도다 |
| FilterBar(격자 변형 2) | 줄(`field row`) 4개에 아래 구분선을 주었다. 조건이 줄을 다 채우지 못해도 선이 줄 끝까지 이어진다(4b8b69c). 줄의 앞 칸 4개는 폭을 고정해 `field 3` · `field 4`를 꺼도 열 폭이 그대로다 |
| PageHeader(낱개) | 형제 제목 3개를 type/h3로 바꾸고 기준선을 제목(h1)에 맞췄다. 사이 간격은 space/32이고 한가운데에 세로 구분선(border/strong, 길이 10.5)이 있다(D-141). 구분선은 `sibling 1` ~ `sibling 3` 불리언을 따른다 |
| Banner | `layout` 축(wide · narrow)을 더해 변형 5 → 10. 기존 5변형은 이름에 `layout=wide`만 붙였다. narrow는 폭 360이고 동작 단추가 글 아래 줄로 내려가 글 첫머리에 맞는다. 닫기 단추는 첫 줄 오른쪽에 남는다(PR-38). layout은 prop이 아니라 배너 폭에 따른 모양이다(D-129 3) |
| AppShell / Aside(낱개) | 숨긴 폭 손잡이 `resize handle`(BOOLEAN, 기본 꺼짐). 켜면 왼쪽 가장자리에 border/focus 선(border/width/2)이 보인다(R-41) |
| Cover(Components) | Feedback 카드의 Banner 줄 `변형 5` → `변형 10` |

- ProfileHeader(7cc6726)는 고치지 않았다. 세트의 항목 줄은 한 줄이고 첫 항목이 구분선 없이 왼쪽 끝에서 시작한다. 바뀐 CSS의 한 줄 모양과 같다. 줄이 바뀐 모양은 세트에 없다.
- TeamSchedule · FilterBar · PageHeader · Banner · AppShell / Aside의 세트 설명과 `Docs · <Name>` 글을 바뀐 모양에 맞게 고쳤다.
- Screens는 고치지 않았다. PersonLabel · ProfileHeader는 이제 게시되어 있어 key로 가져올 수 있다(`remote: true`, 변형 30 · 120). 스킬 6절 "게시 대기 세트 바꾸기"를 돌릴 수 있는 상태다. Screens 문서의 Components key 목록(plugin data `components`)은 아직 세트 117 · 낱개 206이다. Screens Cover의 메타(`2026-11-10 · 87e6232`)는 그대로 두었다.

검증(바뀐 6페이지 Cover · AppShell · TeamSchedule · PageHeader · FilterBar · Banner, 숨은 인스턴스 자식 포함): 노드 4,036 · 바인딩 12,937이 모두 라이브러리 변수다. 지역 컬렉션 · 스타일 0, 묶이지 않은 칠 · 글자 0, 본체 없는 인스턴스 0, 칠 불투명도와 변수 알파가 다른 곳 0, 맨 위 노드 겹침 0이다. 파일 전체에서 세트 167 · 변형 2,444는 모두 변형 수 = 축 값의 곱이고 속성 이름 충돌 · 변형 이름 중복이 0이다. 진한 글자색 변수(fg/primary · secondary · tertiary)를 100%로 칠한 넓은 면을 파일 전체에서 찾았다. Tooltip 팝업과 Switch 트랙만 남았고 둘 다 코드와 같은 색이다. 캡처는 `docs/plan/notes/figma-sync-4/`에 있다(`team-schedule.png` · `filter-bar-grid-3.png` · `page-header-siblings.png` · `banner-set.png` · `banner-narrow.png` · `foundations-cover.png` · `components-cover.png`, 고치기 전은 `before-*.png`).

아직 옮기지 않은 모양이다.

- AppShell 사이드바 접힘(`sidebarCollapsed`, 폭 64). 큰 변형 4개에 축을 더하고 접힌 메뉴 줄을 그려야 한다. `SideNav / Item`에 접힌 모양이 없어 먼저 그 부품에 축을 더해야 한다.
- DataGrid 가로 넘침 가장자리 그림자와 오른쪽 고정 열. 가로로 넘칠 때만 보이는 모양이라 축을 더해야 하고 변형 48개의 열 구조를 바꿔야 한다.
- PageHeader에서 형제가 있을 때 meta가 설명 줄로 내려가는 배치. 불리언으로 자리를 옮길 수 없어 설명에만 적었다.
- Badge neutral의 점 기본값. 세트의 `dot` 속성 기본값은 하나라 변형마다 다르게 둘 수 없다. 세트 설명에 적혀 있다.
- ProfileHeader 항목 줄이 바뀐 모양.

다시 게시할 것(사람): Components만이다. Foundations는 Cover 글자만 바뀌어 게시할 것이 없다. `getPublishStatusAsync` 기준 새로 게시 13(3차 동기화의 세트 9 · 낱개 3 · 아이콘 1, 아직 게시되지 않았다), 바뀜 33(세트 30 · 낱개 3)이다. 이번에 바뀜으로 들어온 것은 TeamSchedule · Banner · AppShell · AppShell / Aside이고 FilterBar · PageHeader는 이미 바뀜이었다. 게시 뒤 Screens에서 Components key 목록을 새 `keys.json`으로 다시 넣고(세트 167 · 낱개 234) 스킬 6절 "게시 대기 세트 바꾸기"를 돌린다.

## 3차 동기화(2026-11-12, e7d5237 뒤 contract 변경)

코드 769837e 기준이다. 마지막 동기화(2026-11-10) 뒤 바뀐 contract · CSS를 Components 파일에 옮겼다. 토큰은 바뀌지 않아 Foundations는 그대로다. 결과 파일은 `docs/figma/audit/sync-3.json`이고 `node scripts/figma-audit.mjs --check docs/figma/audit/sync-3.json`이 통과한다(29항목). 기존 세트 158 · 낱개 230의 key는 모두 그대로다(해시 9308e5f3 · 2e007e8b).

새 페이지 5개다.

| 페이지 | 묶음 | 세트 변형 수 · 낱개 컴포넌트 | 내용 |
| --- | --- | --- | --- |
| SectionHeader | Dashboard · Operations | SectionHeader 낱개 | 제목 · 건수 글자 · 설명 · 동작 단추 · 내용 자리. headingLevel은 축에 두지 않았다(D-113) |
| NotificationItem | Dashboard · Operations | NotificationItem 18 | tone 3 × unread 2 × state 3. 배지 · 모듈 아이콘은 Badge · ModuleIcon 인스턴스 |
| NotificationList | Dashboard · Operations | NotificationList 2 · NotificationList / Empty 낱개 | groupBy day · none. 줄은 NotificationItem 인스턴스, 모두 읽음은 Button 인스턴스 |
| DeadlineStrip | Dashboard · Operations | DeadlineStrip 3 · DeadlineStrip / Point 12 · DeadlineStrip / Row 3 | layout strip · strip-panel · list. layout은 prop이 아니라 화면 폭과 패널 열림에 따른 모양이다(D-129 3) |
| AgentReplay | Conversation | AgentReplay 6 · AgentReplay / Pointer 낱개 | status 3 × state 2. 띠의 단추는 Button 인스턴스 |

그 자리에서 고친 세트다. 세트 · 변형 key가 그대로다.

| 세트 | 바뀐 점 |
| --- | --- |
| Card | `emphasis` 축(default · strong · quiet)을 더해 변형 2 → 6. 기존 두 변형은 이름에 `emphasis=default`만 붙였다. `tone` 불리언과 `tone icon` 바꿔 끼우기 속성(제목 앞 상태 아이콘) |
| Link | `variant=plain` 변형 10개(20 → 30). 글자색 fg/primary |
| MonthCalendar | `size` 축(md · sm)을 더해 9 → 18. sm 월 보기는 낮은 칸에 날 숫자 + 점(3개까지) + 건수다. 주 · 일 보기 sm은 md와 같다. 오늘 숫자 원과 지금 선은 fg/strong이다(D-146) |
| Paper / Fields | `row 1 value` ~ `row 4 value` 불리언. 끄면 인쇄한 뒤 손으로 적는 빈 칸(blank)이다 |

- 새 부품 세트: Avatar / Vacant 8(size 4 × shape 2, 점선 테두리 + 사람 아이콘) · PersonLabel / Vacant 2(size sm · md, "담당자 없음" + 담당자 지정 단추) · MonthCalendar / Event 9(marks dot · dots · icon × state default · done · late).
- 공석은 PersonLabel 세트에 축을 더하지 않고 부품 세트로 두었다. presence 5 × state 3과 곱하면 같은 모양의 변형이 30개 늘기 때문이다.
- 아이콘: `icon/mouse-pointer-2`를 Icons 페이지 Grid의 `ICON_NAMES` 순서 자리(moon 뒤)에 더했다. 173개이고 순서가 코드와 같다.
- 설명만 고친 세트(모양은 그대로): FilterBar(`label`) · DataGrid(열 `sticky` end) · SideNav(묶음 열림 제어) · Toast · Drawer · MaskedValue · Badge.
- Cover: 묶음 카드에 새 줄 12개를 더하고 Card · MonthCalendar · Link 변형 수, Conversation 6개 · Dashboard · Operations 12개, 아이콘 수 173을 고쳤다.
- Figma에 아직 옮기지 않은 모양 변경: PageHeader 형제 제목 크기와 구분선(D-141), DataGrid 고정 열 가장자리 그림자와 오른쪽 고정, Banner 좁은 화면 배치, TeamSchedule 날짜 머리, AppShell 옆 칸 폭과 사이드바 접힘, Badge neutral의 점 기본값. 다음 동기화에서 한다.

검증(바뀐 12페이지, 숨은 인스턴스 자식 포함): 노드 7,150 · 바인딩 25,114가 모두 라이브러리 변수다. 지역 컬렉션 · 스타일 0, 묶이지 않은 칠 · 글자 0, 본체 없는 인스턴스 0, 칠 불투명도와 변수 알파가 다른 곳 0, 맨 위 노드 겹침 0이다. 파일 전체에서 세트 167은 모두 변형 수 = 축 값의 곱이고 속성 이름 충돌 · 변형 이름 중복이 0이다. 캡처는 `docs/plan/notes/figma-2026-11/sync3-*.png`다.

다시 게시할 것(사람): `getPublishStatusAsync` 기준 새로 게시 13(세트 9 · 낱개 3 · 아이콘 1), 바뀜 4(Card · Link · MonthCalendar · Paper / Fields)다. 게시 뒤 Screens 문서의 Components key 목록(plugin data `components`)을 새 `keys.json`으로 다시 넣는다(세트 167 · 낱개 234).

## Components 정리(2026-11-10, 다시 게시 전)

새 세트 · 제자리 보강 · PG-12가 끝난 뒤 다시 게시할 수 있게 정리했다. 결과 파일은 `docs/figma/audit/components-final.json`이고 `node scripts/figma-audit.mjs --check docs/figma/audit/components-final.json`이 통과한다(35항목). 세트 · 변형 key는 모두 그대로다.

- 게시 실패 원인: PersonLabel · ProfileHeader에 같은 이름의 속성이 둘 있었다(BOOLEAN `presence`와 변형 축 `presence`, ProfileHeader는 `status`도). 불리언만 그 자리에서 이름을 바꿨다. PersonLabel `show presence`, ProfileHeader `show status` · `show presence`. 레이어 참조와 이 파일 안 인스턴스 값이 그대로다. 파일 전체(세트 158 · 낱개 230)에서 속성 이름 충돌 · 변형 이름 중복 · 같은 축 값 조합 · 빈 변형 값 · 앞에 `_`나 `.`이 붙은 이름은 이제 0이다.
- 아이콘: 코드 `ICON_NAMES` 172개 중 16개가 Icons 페이지에 없었다. MessageThread 페이지 `Icons · 새 아이콘`의 6개(thumbs-up · thumbs-down · reply · smile-plus · heart · party-popper)와 `--- Dashboard · Operations` 페이지 `Icons · 트랙 G`의 6개(zoom-in · zoom-out · scan · rotate-cw · map-pin-off · timer-off)는 같은 노드를 옮겼고, bot · file-up · panel-right-open · pin-off는 Lucide 데이터(`packages/icons/src/generated/ui-icons.ts`)로 새로 만들었다. 칸 순서는 `ICON_NAMES` 순서이고 임시 프레임 두 개는 지웠다.
- 겹침: AppShell 페이지의 `SideNav / Item` 문서 · 세트가 AppShell 세트 두 번째 열에 겹쳐 있어 AppShell / Phone · AppShell / Aside 오른쪽 줄로 옮겼다. DataGrid 페이지의 Summary row 묶음 · Card row와 ErrorSummary / Link도 옮겼다. 맨 위 노드끼리 겹치는 곳은 0이다(같은 이름의 Docs · Labels · 세트는 키트가 일부러 겹쳐 놓아 뺐다).
- 인스턴스 안 불투명도: Figma는 인스턴스 안에서 변수에 묶인 칠을 변수 값의 알파로 그리고 칠 불투명도를 버린다. Button danger hover · active의 `bg/overlay` 덧칠(0.15 · 0.25)이 인스턴스에서 0.40으로, TrendChart 예측 구간(0.14)과 툴팁 견본(0.30)이 100%로 보였다. 덧칠을 노드 불투명도로 바꿨다. Button은 새 `overlay` 사각형(칠 `bg/overlay` 0.40 × 노드 0.375 · 0.625), TrendChart는 칠 1 × 노드 0.14 · 0.30이다. 본체 모양은 같고 Button은 인스턴스 내보내기가 본체와 같은 바이트다. StatusDot pulse는 칠 · 노드 모두 1이라 점의 2배 크기 진한 원이었다. 노드 불투명도 0.2(CSS 맥박이 2배 크기일 때 값)로 바꿨다.
- Cover 색인: 묶음 카드 12개(Conversation · Basics · Dashboard · Operations 추가). Charts에 FunnelChart, PR-08에 MessageThread · Composer 부품, P0에 AppShell / Aside. 바뀐 변형 수: MonthCalendar 3 → 9, CheckboxGroup 12 → 24, ApprovalLine 2 → 4, EmptyState 10 → 28, TrendChart 6 → 12. 카드 아래 설명 글의 아이콘 수를 172로 고쳤다.
- `docs/figma/keys.json` Components: 세트 158 · 낱개 230(아이콘 172 · 타일 36). 옮겨 적은 key는 Figma 안에서 낸 FNV-1a 해시(세트 3af7737f · 낱개 217c5125)와 같고, 기존 세트 117 · 낱개 206의 key가 모두 그대로다.
- 감사: 노드 103,759(숨은 인스턴스 자식 포함) · 바인딩 326,493이 모두 라이브러리 변수, 지역 컬렉션 · 스타일 0, 묶이지 않은 칠 · 글자 0, 본체 없는 인스턴스 0, 세트 158 모두 변형 수 = 축 값의 곱.
- 캡처: `docs/plan/notes/figma-2026-11/housekeeping-cover.png` · `housekeeping-icons.png` · `housekeeping-appshell.png`.

### 다시 게시할 것

Components를 다시 게시해야 Screens가 아래를 받는다. 2026-11-10 정리 뒤 `getPublishStatusAsync` 기준이다.

| 상태 | 세트 | 낱개 컴포넌트 |
| --- | --- | --- |
| 새로 게시(UNPUBLISHED) | 43: PersonLabel · ProfileHeader(첫 게시에서 빠짐), RadioGroup / Option · Tabs / Tab · SelectableCard / Card(PG-12 항목 부품), MessageThread / Actions · Answer · Reaction · Images, Composer / Option · Menu, FunnelChart, Conversation 9, Basics 9, Dashboard · Operations 13 | 24: 아이콘 16, AppShell / Aside, MessageThread / Quote · Typing · Tools, OrgChart / Node, Payslip / Row, TimeField / Popup, WorkTimeline |
| 바뀜(CHANGED) | 49: Button · Badge · Avatar · ModuleIcon · Card · NotificationCard · RadioGroup · Tabs · Dialog · Drawer · Toast · AppShell · DataGrid / Cell · DataGrid / Row · DataGrid · MonthCalendar · KanbanBoard · MessageThread · Composer · Popover · SelectableCard · CheckboxGroup · AddressInput · ApprovalLine · Delta · AmountBreakdown · ChangeDiff · IssueList · ReasonDialog · OrgChart · HrRecord · TimeClock · LeaveBalance · TeamSchedule · Payslip · FilterBar · ActionBar · KpiCard · LineItemsEditor · FormSection · QuantityInput · Banner · EmptyState · StatusDot · DueBadge · Paper · TrendChart · ComboChart · ChartCard. PG-12 · 제자리 보강 · 이번 정리(Button · StatusDot · TrendChart)로 바뀐 세트와 그 세트를 안에 쓰는 세트다 | 5: AppShell / Phone · DataGrid / Summary row · PageHeader · PeriodPicker / Popup · PeriodPicker / Sheet |
| 그대로(CURRENT) | 66 | 9 · 아이콘 156 · 타일 36 |

게시 뒤 Screens에서 할 것: 스킬 6절 "게시 대기 세트 바꾸기"를 돌린다. 사본의 불리언 `presence` · `status`는 라이브러리에서 `show presence` · `show status`라 속성을 다시 넣을 때 이 이름을 쓴다. Screens 문서의 Components key 목록(plugin data `components`)은 새 `keys.json`으로 다시 넣는다(세트 158 · 낱개 230).

## 라이브러리 연결(PG-02, 2026-11-10)

Components의 바인딩을 지역 사본에서 Foundations 라이브러리로 옮기고 사본을 지웠다. 절차는 스킬 문서 5절이다.

- 지역 변수마다 같은 컬렉션 · 같은 이름의 라이브러리 변수를 key로 가져와 다시 묶었다. 인스턴스 밖 노드를 먼저 고치고(A단계), 인스턴스 안은 그 자리에서 덮어 쓴 값만 고쳤다(B단계). 본체에서 물려받은 값은 건드리지 않았다.
- 지역 변수 · 스타일을 가리키는 곳이 0인 것을 확인한 뒤 지역 컬렉션 6개(변수 483) · 글자 스타일 12 · 효과 스타일 3을 지웠다.
- AppShell 페이지에 옛 DataGrid 빌드가 남긴 떠 있는 "box" 사각형 48개를 지웠다. 어떤 컴포넌트에도 속하지 않았다.
- 인스턴스 덮어쓰기 칠의 저장 색이 변수가 풀리는 색과 다른 곳(검정 칠 함정)을 전 페이지에서 찾았다. 묶인 칠 60,904개 중 0개였다.
- Button danger hover · active 10개 변형의 `bg/overlay` 칠은 다시 묶을 때 불투명도가 변수 알파 0.40으로 바뀌어 빌더 값 0.15 · 0.25로 되돌렸다.
- mono 글자 스타일이 Foundations의 Roboto Mono로 바뀌어 ChangeDiff의 mono 글자 20개만 글꼴이 달라졌다. 다른 글자 스타일 11개와 그림자 3개는 값이 같다.
- 페이지를 묶음 순서로 다시 놓고 구분 페이지 `--- Layout` · `--- Feedback` · `--- Navigation · Record · Paper`를 더했다. Charts 묶음은 맨 뒤로 옮겼다. Cover 색인을 묶음 9개 카드로 다시 만들었다.
- 파일 문서에 Foundations key 목록을 저장했다(`figma.root.getSharedPluginData('trellis','keys')`). 키트 v2가 이것으로 변수 · 스타일을 가져온다.

## 2차 동기화(2026-11-10, 86e320c 이후 contract 변경)

Components 파일에서 아래 세트를 고쳤다. 안쪽 인스턴스가 끊기지 않도록 Avatar · PersonLabel · Payslip은 세트를 지우지 않고 그 자리에서 고쳤다.

| 세트 | 바뀐 점 |
| --- | --- |
| AppShell | 다시 만듦(변형 4). 머리줄에 `userName` TEXT 속성과 사용자 메뉴(이름 + 아래 화살표), 메뉴 칸은 `SideNav / Item` 인스턴스 |
| SideNav / Item | 새 세트(변형 6, kind × state). AppShell 메뉴 칸과 화면의 메뉴에 쓴다 |
| AppShell / Phone | 새 컴포넌트(390 × 844). 머리줄 오른쪽 아바타 단추 · 아래 탭 막대 |
| WorkHoursMeter | 다시 만듦. 변형 축 `overtimeBasis` = week · day(변형 4) |
| Payslip | 직급은 `직급`, 직위는 `직위` 칸으로 나눔. 근로 정보 칸 5개(휴일근로 포함) |
| Avatar | 모든 크기에서 두 글자. 24는 micro 글자 |
| PersonLabel | sm은 근무 상태를 점만 보인다 |
| ApprovalLine | 새 세트(orientation 가로 · 세로, 변형 2). 최대 폭 100% |

## Trellis · Screens 페이지

PG-03(2026-11-10)에서 두 라이브러리에 연결했다. 변수 · 글자 스타일 · 그림자 스타일은 Foundations 라이브러리이고 인스턴스는 Components 라이브러리 세트다. 파일 안에 지역 변수 컬렉션과 스타일이 없다. 예외는 Components에서 아직 게시되지 않은 PersonLabel · ProfileHeader 두 세트다(아래 "게시 대기").

| 페이지 | 내용 |
| --- | --- |
| Cover | 파일 설명 · 메타 · 페이지 색인 · 프레임과 모드. Foundations · Components 표지와 같은 틀이고 라이브러리 변수 · 스타일에 묶었다 |
| G2 · 역할별 홈 | `home/dashboard/people` 인사 담당 화면 |
| G2 · 구성원 목록 | `erp/hr-payroll/employees` |
| G2 · 휴가 신청 | `groupware/attendance/leave-request` |
| G2 · 결재 상세 | `groupware/approval/document` |
| G2 · 급여 명세 | `erp/hr-payroll/payslip` |
| G2 · 모듈 런처 | `home/launcher/modules` |
| G2 · 휴대폰 홈 | `home/dashboard/mobile`(390 폭) |
| 시험 · 테라스원 인사 | 역할별 홈 · 구성원 목록 · 인사기록카드 · 조직도 · 출퇴근 · 팀 근태/휴가 달력 · 휴가 신청 · 결재함 · 휴가 결재 · 급여 명세서 |
| 컴포넌트 사본 | 게시 대기 사본 2개. PersonLabel(변형 1) · ProfileHeader(변형 1). 안쪽 인스턴스와 변수 · 스타일은 라이브러리다. 게시 뒤 지운다 |

- G2 화면은 한 줄에 네 벌을 놓는다: Light · 주황, Dark · 주황, Light · 파랑, Light · 노랑. 한 번 만든 프레임을 복제하고 프레임에 Semantic 모드와 Company 모드를 명시했다. 레이어는 같고 모드만 다르다.
- 시험 화면(테라스원 인사)은 Company 모드 초록으로 Light · 초록, Dark · 초록 두 벌이다. 기준 화면은 trellis-trial의 캡처(`screenshots/green-light-1440-*.png`)다.
- 1440 화면은 AppShell 인스턴스(폭 1440, 메뉴 240 · 머리줄 48) 위에 내용 프레임을 얹었다. 시험 화면은 AppShell 메뉴 칸의 항목을 숨기고 그 자리에 `SideNav / Item` 인스턴스로 만든 메뉴를 얹었다. 높이는 내용에 맞춘다(최소 900).
- 내용은 세트 인스턴스와 변수에 묶은 프레임 · 글자로 만들었다. 표 · 목록 칸 · 카드 틀 · 막대그래프처럼 세트가 없는 부분만 프레임이다.

세트 모양 때문에 기준 화면과 다른 곳:

- Tabs 세트는 탭 칸이 3개다. G2 구성원 목록은 전체 · 재직 · 휴직만 보이고(퇴직 탭 빠짐), 팀 근태/휴가 달력은 세 번째 칸을 숨겼다.
- SelectableCard 세트는 항목이 3개다. G2 휴가 신청의 휴가 종류는 연차 · 보상 휴가 · 경조 휴가다(병가 빠짐).
- Payslip 세트는 지급 항목이 3줄이다. G2 급여 명세는 기본급 · 직책수당 · 식대로 두고 합계를 다시 계산했다(지급 5,350,000 · 공제 810,890 · 실지급 4,539,110). 직급이 없는 사람은 직급 칸을 숨겼다. 라이브러리 Payslip은 근로 정보 칸이 4개라 휴일근로 칸이 없다.
- OrgChart 세트는 본부가 있는 3단 구조라 시험 조직도(회사 아래 팀 4개)는 프레임 · Avatar 인스턴스로 그렸다.
- 모듈 런처는 타일이 있는 모듈만 놓았다. WorkHoursMeter · LeaveBalance 안의 막대 길이는 세트 견본 비율 그대로이고 글자만 바꿨다. 휴가 달력의 일정은 날짜 칸마다 Badge 인스턴스로 두었다(여러 날 이어진 막대는 없음).

### 라이브러리 연결(PG-03, 2026-11-10)

- 변수 · 스타일은 스킬 5절 절차로 옮겼다. 지역 변수 474개를 같은 컬렉션 · 같은 이름의 Foundations 변수로 다시 묶었다(인스턴스 밖 A단계 쓰기 26,238 · 인스턴스 덮어쓰기 B단계 20). 프레임 48개의 명시 모드 96개는 라이브러리 Semantic · Company 컬렉션의 같은 이름 모드로 옮겼다. 칠의 색과 불투명도는 그대로다. 알파 변수에 다시 묶여 불투명도가 바뀐 칠 4개는 원래 값을 다시 넣었다.
- 맨 위 인스턴스 1,146개 중 1,132개를 같은 세트 · 같은 변형 이름의 라이브러리 변형으로 `swapComponent` 했다. 바꾸기 전에 덮어쓰기(글자 · 칠 · 선 · 보이기 · 크기 · 이름)를 맨 위 인스턴스에서 자식 순번 경로로 적고, 바꾼 뒤 속성 값(TEXT · BOOLEAN · INSTANCE_SWAP)과 덮어쓰기를 다시 넣었다. ApprovalLine · TimeClock · WorkHoursMeter 라이브러리 세트는 글자 레이어 이름이 글자 내용이라 이름이 아니라 경로로 맞췄다.
- 바뀐 세트별 수: SideNav / Item 280 · Avatar 238 · 아이콘 144 · Badge 124 · Button 98 · ModuleIcon 88 · AppShell 44 · Input 26 · Select 16 · ApprovalLine 12 · Tabs 10 · IconButton 10 · LeaveBalance · TimeClock · Payslip · NotificationCard · Checkbox 6 · SelectableCard · AppShell / Phone 4 · HrRecord · WorkHoursMeter 2. 아이콘 · 타일을 바꿔 끼우는 INSTANCE_SWAP 속성은 라이브러리 `icon/<name>` · `tile/<id>`를 가리킨다.
- 덮어쓰기 3,156개와 인스턴스마다 모든 글자를 바꾼 뒤 다시 읽어 비교했다. 다른 곳은 Payslip 6개의 높이와 휴일근로 칸 글자뿐이다. 경로를 못 찾은 덮어쓰기 0, 바꾼 인스턴스 안에 남은 지역 본체 0이다.
- 지울 컴포넌트를 가리키는 인스턴스가 0인 것을 확인한 뒤 페이지 `--- 라이브러리 사본` · `Icons` · `Module tiles`와 `컴포넌트 사본`의 세트 · Docs 프레임을 지웠다. 파일 전체에서 지역 변수 · 스타일 · 모드 참조가 0인 것을 확인한 뒤 지역 컬렉션 6(변수 474) · 글자 스타일 12 · 효과 스타일 3을 지웠다.
- 파일 문서 plugin data는 `keys`(Foundations key 목록) · `components`(Components key 목록) · `kit`(screen-kit v2) · `pg03swap`(게시 대기 세트를 바꿀 일회용 키트)이다.

라이브러리 세트 때문에 달라진 곳:

- Payslip 라이브러리 세트는 근로 정보 칸이 4개다(사본은 휴일근로 포함 5개). Payslip 6개에서 휴일근로 칸이 빠지고 그 아래가 54 올라갔다.
- 시험 화면 메뉴의 '홈' 아이콘은 사본에서 선의 저장 색이 검정이라 어둡게 보였다(키트 v1 검정 칠 함정). 라이브러리 세트는 `nav/fgActive`로 그린다. 시험 프레임마다 아이콘 12 × 12 자리만 다르다.
- 라이브러리 AppShell에는 layout 변수 바인딩이 3개 더 있다. 그림은 같다.

### 게시 대기(PersonLabel · ProfileHeader)

- Components 파일에서 두 세트의 게시 상태가 UNPUBLISHED라 key로 가져올 수 없다. 화면의 PersonLabel 12개(G2 결재 상세 · 시험 휴가 신청)와 ProfileHeader 2개(시험 인사기록카드)는 `컴포넌트 사본` 페이지의 지역 변형을 쓴다. 사본은 쓰는 변형만 남겼다. 안쪽 Avatar · Badge · Button은 라이브러리 인스턴스이고 변수 · 스타일도 라이브러리다.
- 사람이 Components에서 두 세트를 게시하면 에이전트가 스킬 6절 "게시 대기 세트 바꾸기"를 돌린다. 2026-11-13 4차 동기화에서 두 세트를 key로 가져올 수 있는 것을 확인했다(게시됨). 바꾸기는 아직 돌리지 않았다. 라이브러리 ProfileHeader는 headingLevel · state 축이 빠져 변형이 120개라 가장 가까운 변형으로 간다.

### 검증(PG-03)

결과 파일은 `docs/figma/audit/PG-03.json`이다. 숨은 인스턴스 자식까지 셌다. 화면 페이지 8개 기준이다.

| 항목 | 바꾸기 전 | 바꾼 뒤 |
| --- | --- | --- |
| 지역 컬렉션 · 변수 | 6 · 474 | 0 · 0 |
| 지역 글자 · 효과 스타일 | 12 · 3 | 0 · 0 |
| 노드 | 20,070 | 20,052(Payslip 휴일근로 칸 -18) |
| 바인딩(지역 · 라이브러리) | 67,364 · 0 | 0 · 67,436(AppShell +132 · Payslip -60) |
| 글자 · 효과 스타일을 쓰는 노드(지역 → 라이브러리) | 2,234 · 12 | 2,228 · 12 |
| 명시 모드(지역 · 라이브러리) | 96 · 0 | 0 · 96 |
| 인스턴스 · 맨 위 인스턴스 | 2,942 · 1,146 | 2,942 · 1,146 |
| 본체가 지역인 인스턴스 | 2,942 | 14(게시 대기) |
| 프레임 · 모드 두 개 명시 · 묶이지 않은 SOLID 칠 | 48 · 48 · 0 | 48 · 48 · 0 |
| 사본 페이지(노드) | 4(28,256) | 1(61) |

- `node scripts/figma-audit.mjs --check docs/figma/audit/PG-03.json`은 localSets 2 · localMainInstances 14 두 항목에서 실패한다(게시 대기). 나머지 32항목은 통과한다.
- 앞뒤 캡처 픽셀 차이: G2 역할별 홈 Dark · 주황, 구성원 목록 Light · 파랑, 결재 상세 Light · 주황, 모듈 런처 Light · 노랑은 0이다. 시험 역할별 홈 Light · 초록 124, 인사기록카드 Dark · 초록 140은 홈 아이콘이다. 더 본 11장에서 G2 휴가 신청 · 휴대폰 홈은 0, 시험 Light 7장은 148(홈 아이콘), G2 급여 명세 81,545 · 시험 급여 명세서 87,662는 Payslip 휴일근로 칸이다. 캡처는 `docs/plan/notes/figma-2026-11/pg03-*.png`다.

## 검증

PG-02(2026-11-10, Components). 결과 파일은 `docs/figma/audit/PG-02.json`이고 `node scripts/figma-audit.mjs --check docs/figma/audit/PG-01.json docs/figma/audit/PG-02.json`이 통과한다. 숨은 인스턴스 자식까지 셌다.

| 항목 | 바꾸기 전 | 바꾼 뒤 |
| --- | --- | --- |
| 지역 컬렉션 · 변수 | 6 · 483 | 0 · 0 |
| 지역 글자 · 효과 스타일 | 12 · 3 | 0 · 0 |
| 노드 | 82,607 | 82,559(box 48개 삭제) |
| 바인딩(지역 · 라이브러리) | 257,202 · 0 | 0 · 256,621 |
| 지역 · 라이브러리 글자 스타일을 쓰는 노드 | 8,019 · 0 | 0 · 8,019 |
| 지역 · 라이브러리 효과 스타일을 쓰는 노드 | 190 · 0 | 0 · 190 |
| 변수에 묶이지 않은 SOLID 칠 · 선 / 글자 | 0 / 0 | 0 / 0 |
| 인스턴스 · 본체 없는 인스턴스 | 15,856 · 0 | 15,856 · 0 |
| 세트 · 변형 | 117 · 2,109 | 117 · 2,109(세트마다 같음, 변형 수 = 축 값의 곱) |

- 바인딩은 box 삭제(-576)를 빼면 256,626이 기준이고 측정값이 5 적다. 글자 칠의 `textRangeFills` 표기 차이다. ScanField value 글자 15개는 칠을 노드 전체로 다시 쓰면서 범위 칠 중복 표기가 사라졌고, ChangeDiff mono 글자 10개는 글자 스타일을 바꾸면서 생겼다. 칠 변수는 그대로이고 다른 페이지는 페이지마다 바인딩 수가 같다.
- 앞뒤 캡처의 픽셀 차이: Button · Badge · DataGrid(변형 하나) · AppShell · Payslip · KpiCard · TrendChart · PeriodPicker · Paper · Menu 모두 0. DataGrid / Row는 PG-06 캡처와 차이 0이다. 캡처는 `docs/plan/notes/figma-2026-11/pg02-*.png`다.
- Cover를 다시 만든 뒤 Cover · 새 구분 페이지를 다시 쟀다. 노드 434 · 바인딩 2,061이 모두 라이브러리이고 묶이지 않은 칠 · 글자는 0이다. 파일 합계는 노드 82,843 · 바인딩 257,969다.

2026-11-10 처음 만든 때:

- Foundations 변수: `node scripts/figma-diff.mjs <스냅샷>` 차이 0. PG-05 뒤 변수 483 · readback 해시 9ee5d49(길이 23,110) = `figma-diff --hash`. ALL_SCOPES 0 · 코드 구문 불일치 0.
- Screens 변수: readback 해시 `5c4305f7`(길이 22,840, PG-05 전 474개).
- Screens 프레임 48(G2 7 × 4 · 시험 10 × 2): 변수에 묶이지 않은 SOLID 칠 · 선 0(인스턴스 밖 노드 기준), 인스턴스 2,942(맨 위 인스턴스 1,146), 프레임마다 Semantic · Company 모드 명시 확인.
- 대표 화면: `docs/plan/notes/figma-2026-11/` foundations-*.png · components-*.png · screens-approval-document.png(G2 결재 상세 Light · 주황) · screens-role-home-dark.png(G2 역할별 홈 Dark · 주황) · screens-trial-home-hr.png(시험 인사 담당 홈 Light · 초록).

## 게시 절차(사람)

Foundations는 2026-11-10에 게시했다. Components는 PG-02 뒤 아래 순서로 게시한다.

1. Components 파일을 연다. 왼쪽 Assets 패널에서 Libraries 창을 열고 이 파일 줄의 Publish를 누른다.
2. 게시 목록에 컴포넌트 세트 117 · 낱개 컴포넌트 206(아이콘 156 · 타일 36 포함)이 보이는지 본다. 변수 · 스타일은 목록에 없어야 한다(파일 안에 없다).
3. 설명 칸에 "PG-02 Foundations 라이브러리 연결, 세트 117"처럼 적고 게시한다.
4. Cover 프레임을 오른쪽 클릭해 Set as thumbnail로 섬네일을 지정한다. MCP는 섬네일 지정을 지원하지 않는다.
5. Screens 파일의 Libraries 창에서 Trellis · Foundations와 Trellis · Components를 켠다. 그 뒤 에이전트가 PG-03을 한다.

게시 뒤 확인할 것: Screens 파일에서 `figma.importComponentSetByKeyAsync(<keys.json Components.sets.Button>)`이 `remote: true` 세트를 돌려준다. Components를 다시 고치면 다시 게시해야 Screens에 보인다.

다시 게시(2026-11-13 4차 동기화 뒤): 같은 창에서 Publish를 누르면 목록에 새 세트 9 · 낱개 3 · 아이콘 1(3차 동기화)과 바뀐 세트 30 · 낱개 3이 보인다(위 "4차 동기화"). 설명 칸에는 "3차 · 4차 동기화: 새 세트 9, Banner layout, PageHeader 형제, TeamSchedule 오늘 열"처럼 적는다. 게시가 끝나면 모든 세트 · 낱개 컴포넌트의 `getPublishStatusAsync`가 CURRENT여야 한다.

다시 게시(2026-11-10 정리 뒤): 같은 창에서 Publish를 누르면 목록에 새 세트 43 · 낱개 24(아이콘 16 포함)와 바뀐 세트 49 · 낱개 5가 보인다(위 "다시 게시할 것" 표). 게시가 끝나면 Components 파일에서 모든 세트 · 낱개 컴포넌트의 `getPublishStatusAsync`가 CURRENT여야 한다. 설명 칸에는 "새 세트 · PG-12 · 아이콘 172 · PersonLabel · ProfileHeader 속성 이름"처럼 적는다.

## 다시 만들기

절차는 `.claude/skills/ds/figma-sync/SKILL.md`에 있다. 요약하면 다음과 같다.

1. `pnpm --filter @terracelab/trellis-tokens build`로 variables.json을 만든다.
2. `node scripts/figma-diff.mjs --emit upsert`가 내는 스크립트를 Foundations에 `use_figma`로 실행한다. 이름으로 찾아 고치고 없는 것은 지운다. 사람이 다시 게시하면 Components가 갱신을 받는다.
3. `node scripts/figma-diff.mjs --emit readback` 스크립트로 해시를 읽어 `--hash` 값과 비교한다. 다르면 스냅샷 글을 파일로 저장해 `node scripts/figma-diff.mjs <파일>`로 차이를 본다.
4. 변수 이름이 늘거나 줄면 `figma-audit --emit keys`로 `keys.json`을 다시 만들고 Components 문서의 key 목록을 다시 넣는다(스킬 3절).
5. contract가 바뀐 컴포넌트는 스킬 문서의 키트 v2 + 빌더로 세트를 다시 만들고 감사 스크립트를 돌린다. Components를 다시 게시한다.
6. 화면은 Screens 파일에서 만든다. PG-03 전에는 사본 세트를 같은 빌더로 맞추고, PG-03 뒤에는 라이브러리 세트 인스턴스를 쓴다(스킬 6절).

토큰 값(색 · 크기)은 에이전트가 제안만 하고 사람이 승인한다(CLAUDE.md).

## 이전 파일

2026-11-07 파일 https://www.figma.com/design/uNZmEBsbRnkivkF79zdd2L 은 As-is 캡처 파일이다. 화면 블록 · 미리보기의 HTML 캡처와 1차 컴포넌트 보드가 있고 변수 구조(Semantic 2모드 · Company 없음)가 지금 코드와 다르다. 고치지 않고 참고용으로 둔다.
