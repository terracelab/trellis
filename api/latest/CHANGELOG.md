# 변경 이력

## 1.0.0

### Major Changes

- 1.0.0. 첫 공개 버전이다. 0.x 미리보기를 마친다. 이후 토큰 이름과 컴포넌트 props의 변경 · 삭제는 major 버전에서만 하고 자동 변환 스크립트를 함께 낸다

### Minor Changes

- 접근성 모드 · 손가락 입력(D-97, 식자재 ERP): TrellisProvider `fontScale` · `contrast` · `focusRing` · `linkUnderline` · `chartPalette` · `motion` · `contentWidth`가 `data-font-scale` · `data-contrast` · `data-focus` · `data-links` · `data-chart` · `data-motion` · `data-content-width`를 건다. 포커스 강조는 링 3px + border.focusStrong(입력 칸은 감싸개 둘레, 목록 줄은 안쪽 링), 링크 밑줄 항상, 고대비 자리 표시 · 고른 글자. 손가락 입력 기기에서 xs · sm 단추의 누르는 영역이 36(1024 이상) · 44로 넓어지고 입력 칸 글자는 폭과 관계없이 16px. Spinner는 움직임 줄이기에서도 돈다(새 토큰 `duration.essential`). 블록 Page는 와이드(1920 이상)에서 본문 1600 · 가운데, 본문 너비 설정을 따른다.
- 에이전트 대화 컴포넌트 5종을 더했다: RichText(답변 본문의 제목 · 목록 · 표 · 코드 · 링크 · 굵게, 쓰는 중 커서) · Citation(출처 목록 · 글 안 번호) · SuggestionChips(추천 질문) · RunSteps(실행 단계 · 걸린 시간 · 펼친 상세) · ProposalCard(변경 제안 승인 · 사유 받는 반려). MessageThread는 에이전트 답변을 말풍선 없이 그리고 복사 · 다시 생성 · 좋음 · 나쁨 동작 줄을 둔다. Composer는 입력 위 추천 질문을 보인다. CommandPalette 빠른 질문은 SuggestionChips를 쓴다(API는 그대로).
- AppShell에 옆 칸을 더했다(`aside` · `asideTitle` · `asideActions` · `asideOpen` · `defaultAsideOpen` · `onAsideOpenChange`). 본문 오른쪽에 붙고 모달이 아니라 본문을 계속 쓴다. 1024 미만에서는 아래 시트로 열린다. 블록은 본문 안에서 `AppShellAside`로 채우고, 여는 단추의 `aria-controls`는 `useAppShellAsideId()`로 얻는다. aside가 없으면 틀은 지금 모양 그대로다.

  Composer에 멘션(`mentions`, "@")과 명령(`commands` · `onCommand`, 글 맨 앞 "/")을 더했다. 목록은 입력 칸 위에 뜨고 화살표 · Enter · Tab · Escape로 다루며 한글 조합 중 Enter는 고르지 않는다. 멘션 · 명령을 쓰면 `onSend`가 셋째 값으로 멘션한 사람 id와 명령을 받는다.

  MessageThread에 반응(`reactions` · `onReact` · `reactionOptions`), 답글 인용(`replyTo` · `onReply`, 누르면 원문으로), 멘션 표시(`mentions`), 입력 중 표시(`typing`), 그림 미리 보기(`files[].thumb`, 누르면 크게)를 더했다. AttachmentFile에 `thumb`가 생겼다.
- 동봉 문서: `@terracelab/trellis-react/docs/*`(manifest.json · llms.txt · llms-full.txt · components/*.md · guides/*.md · tokens.md · CHANGELOG.md)를 빌드가 만들어 패키지에 넣는다(D-42). 컴포넌트 예시 `<Name>.examples.tsx` 14파일 추가(D-46). contracts · react 산출물의 상대 import에 `.js` 확장자를 붙여 번들러 없이 Node ESM에서 로드된다(SSR 소비자 수정).
- 차트 계열 14종 선행 반입(D-39). contracts: `_base.ts`(components.md §2) · `_shared/format.ts`(formatAmount · formatCount · formatCompactWon · formatPercent) · 차트 contract 14 + spec.md 14 + `charts/README.md`. react: `@terracelab/trellis-react/charts`(ChartCard · TrendChart · ComboChart · BarList · WaterfallChart · Donut · SegmentedBar · CalendarHeatmap · Sparkline · Legend · RadialMeter · BulletBar · DataBar · HeatCell) — Recharts 3.10 래퍼 + 순수 SVG/div, 색은 토큰 슬롯만, `styles.css`.
- CheckboxGroup 줄 끝 정보와 바로 저장(서비스 요청 R-35). 선택지마다 `meta`(웹은 ReactNode)로 건수 · 배지 · 링크를 줄 끝에 두고, 라벨 밖이라 링크를 눌러도 상자는 바뀌지 않으며 상자의 설명으로 읽힌다. `onChange` 둘째 인자 `{ values, checked }`가 이번에 바뀐 선택지와 바뀐 뒤 상태를 알린다(첫 인자만 받는 코드는 그대로). `pending`에 넣은 선택지는 loading이다. 라벨 오른쪽 Spinner("저장 중"), `aria-busy`, 읽기 전용이라 끝날 때까지 누를 수 없고 포커스는 남는다. 하나라도 저장 중이면 전체 선택도 loading이다. 문구 사전에 `common.saving`을 더했다.
- CodeSearch(서비스 요청 R-25): onCreate · createLabel(목록 맨 아래 "새로 등록" 줄, 값은 그대로), allowCustomValue · onCustomValue(목록에 없는 글자 그대로 받기), showCode(false = 이름만). 좁은 화면 시트에도 같은 줄. 빈 결과 글자를 fg.secondary로.
- 컴포넌트가 회사 색 토큰을 따른다(D-97): 탭 밑줄 · 지금 탭 글자는 회사 색(border.selected · fg.link), 진행 막대 · 상단 진행 줄은 강조(brand.accent), 표 선택 행은 bg.rowSelected, 사이드바 하위 메뉴는 nav.sub 면 · nav.fgMuted 글자, 제목 · KPI 값은 fg.strong. 입력 칸 테두리는 쉴 때 border.strong · 가리킬 때 새 토큰 border.hover(식자재 ERP 입력 칸). 화면 글자 굵기는 600이 상한(종이 서식 제외).
- `TrellisProvider theme={{ brand, neutral, buttonText, mode }}`가 회사 색을 새로 고침 없이 입힌다. `scope`(또는 안쪽 Provider)면 그 안에만(미리보기 · 회사 설정 화면)(D-98). 문자열 theme은 예전처럼 `<html data-theme>`만 바꾼다.
- 동봉 문서에 가이드 "문구"(guides/content.md)를 추가했다. 목소리 · 버튼과 메시지 패턴 · 숫자와 날짜 표기 · 업종 용어 사전. 금칙어 검사에 문구 규격의 수식어 11종을 넣어 동봉 문서에 들어가면 빌드가 실패한다.
- 새 컴포넌트 4개(PR-08, 블록에서 올림). MessageThread는 대화를 날짜 · 보낸 사람으로 묶고 내 메시지를 오른쪽에 읽음 · 안 읽은 수 글자와 함께 보인다(role="log", 이전 메시지 단추, 실패 다시 보내기). Composer는 늘어나는 입력 칸 · 첨부 · 보내기를 한 줄에 둔다(Enter 보내기, 한글 조합 중 Enter는 보내지 않음, 휴대폰 아래 고정). ContextMenu는 우클릭 · 길게 누르기 · Shift+F10으로 Menu와 같은 항목을 연다. Popover는 트리거 옆 패널(제목 · 닫기 · 아래 동작)이다. 넷 다 좁은 화면에서는 아래 시트로 연다. 문구 사전에 messageThread · composer 키를 더했다.
- DataGrid: 칸 편집(column.editable + onCellChange, Enter 저장 · Esc 취소 · validate), 열 필터(column.filter text · values, filters · onFiltersChange), 열 설정(columnSettings 숨김 · 순서, storageKey로 이 기기에 저장, columnState · onColumnStateChange), 묶음 소계(groupBy · groupLabel), 트리 행(childrenKey · defaultExpanded), 가상 스크롤(virtualize, auto = fill이고 200행 넘을 때). 빈 값은 정렬 방향과 관계없이 맨 뒤. 의존성 @tanstack/react-virtual 3.14.21 추가.
- DateField 범위 밖 입력을 앱에 알린다(서비스 요청 R-35). 값은 그대로 두는 D-74는 그대로이고, `onOutOfRangeChange(error | null)`가 범위 밖 상태가 생기거나 바뀔 때 `{ bound, date, typed, text }`를, 걷힐 때 null을 받는다. 글자 칸에는 같은 안내로 `setCustomValidity`를 걸어 `form.checkValidity()`가 실패하고 기본 제출이 막힌다. 폼 어댑터에 `form.bindDate(name)`을 더했다. 범위 밖 상태가 남아 있는 동안 `form.submit`이 저장하지 않고 그 칸 오류(type 'range')와 요약에 안내가 선다.
- FilterBar `label`: 검색 영역(role="search")의 이름을 줄 수 있다. 없으면 지금처럼 "검색 조건"이다. 한 화면에 FilterBar가 둘 이상이면 같은 이름의 search 영역이 둘이 되어 보조 기술에서 구별되지 않았다(axe landmark-unique)
- 폼 어댑터: `@terracelab/trellis-react/form` 엔트리에 `useTrellisForm`(react-hook-form, 선택 peer · zod 등 safeParseAsync 스키마) — `field(name, label)` · `bind(name)` · `bindChecked(name)` · `submit(onValid)` · `summary`. 새 컴포넌트 ErrorSummary(제출 뒤 오류 모음, 항목을 누르면 그 칸으로).
- FormSection(서비스 요청 R-28): collapsible · open · defaultOpen · onOpenChange. 접혀 있으면 제목 옆에 채운 칸 수, 안에 Field 오류가 생기면 저절로 펼친다. fieldset 이름을 제목으로 잇는다(aria-labelledby).
- 새 컴포넌트 LineItemsEditor: 줄을 더하고 빼며 칸을 채우는 입력 표(칸은 render로 Trellis 입력). Enter로 다음 칸 · 마지막 칸이면 줄 추가, minLines · maxLines, 합계 행, 줄 오류, 좁은 화면 카드. value · onChange라 useTrellisForm의 bind로 바로 잇는다.
- LineItemsEditor(서비스 요청 R-24): 칸 오류 `cellError`(칸 아래 글자 + 칸 입력 aria-invalid · 설명이 저절로), `column.required`(머리 표시 · 칸 required), `totals` · `footnote`(표 아래 합계 묶음 · 한글 금액), `empty`(minLines 0), `column.mobile: 'title'`, 표가 안 들어가는 상자 폭에서는 머리 없는 줄 모양. 칸 이름은 "{표 이름} {행} {열}", 삭제는 "{표 이름} {행} 삭제", 지운 뒤 포커스는 윗줄의 같은 칸.
- 표 · 목록 안 링크는 본문 색, 오늘 표시는 중립색(D-146 제안, R-43 2 a + c). Link에 `variant="plain"`(본문 색 500 + 가리키거나 키보드로 오면 밑줄)을 더하고, DataGrid 칸 · DescriptionList 안의 default Link와 DataGrid 링크 열 · Attachment 이름이 이 모양을 쓴다. MonthCalendar 오늘 원 · 지금 선과 TeamSchedule 오늘 원 · 열은 회사 색 · 위험 빨강 대신 `fg.strong` · 연한 회색이다. 토큰 값은 바뀌지 않는다.
- `TrellisProvider`(locale · theme · density)와 문구 사전을 더했다(D-65). 컴포넌트가 그리는 글자 · 접근성 이름 · 기본 placeholder가 `locale="en"`이면 영어가 된다. 기본은 한국어이고 Provider 없이도 그대로다. `useLocale` · `useMessages`를 내보낸다. `kpiValue` · `kpiDeltaText` · `progressText` · `multiSelectSummary`가 마지막 인자로 locale을 받는다
- MaskedInput에 주민등록번호 프리셋 `rrn`(6-7, 외국인등록번호도 같은 형식)과 `secret`을 더했다. secret이면 뒷자리 첫 숫자만 보이고 나머지 여섯 자리는 ●로 가린다. 친 숫자는 1초쯤 보였다가 가려지고, 보기 버튼으로 잠깐 펼친다. onChange의 raw는 늘 숫자 전부다. bizNo `validate`를 켜면 다 친 번호의 검증 숫자가 틀릴 때 오류와 문구를 보인다. contracts에 `formatRrn(value, { masked })` · `isValidBizNo(value)`를 더했다. 입력 부품이 스스로 찾은 오류는 Field 오류 칸에 보인다(Field error가 이긴다). 구분 글자를 Delete로 지우면 뒤 숫자를 지운다(D-72)
- Menu · CodeSearch: 좁은 화면(breakpoint.sm 미만)에서 아래 시트로 연다(D-60). Menu는 title prop(없으면 트리거 이름), CodeSearch는 칸이 시트를 여는 단추가 되고 시트에서 코드 · 이름 · 설명으로 찾는다. CodeSearch 코드 · 설명 · 보조 정보 글자를 fg.secondary로(다크 대비).
- 좁은 화면(640 미만)에서 Select · DateField 달력 · PeriodPicker · FilterBar 필터를 화면 아래 시트로 연다(D-60). DateField는 브라우저 날짜 입력 대신 ISO 글자 칸과 자체 달력(react-day-picker), PeriodPicker는 프리셋 + 기간 달력이다. MultiSelect를 새로 넣었다(필터 여러 개, "자사몰 외 2"). DateField `today` · PeriodPicker `label` · FilterBar `activeCount` props가 늘었다
- 회계 · 재고 보강 컴포넌트(트랙 G PG-37 · PG-38).

  - 새 컴포넌트 Checklist: 결산 마감 · 온보딩처럼 차례로 끝내는 일. 앞 표시 모양(체크 · 점 · 빈 고리 · 멈춤) + 상태 글자, 기한(D-n · N일 경과) · 담당 · 보조 글자, 행동 단추 하나, 위 진행 막대. `onChange`를 주면 앞 표시가 체크 단추(보류 항목은 누를 수 없다). 줄 바탕 칠 · 왼쪽 띠 · 회색 알약 없음
  - MaskedInput: `mask="bankAccount"` + `bank`. 은행 형식으로 구분 글자를 넣고 placeholder는 그 은행의 예시
  - QuantityInput: `units[].factor`가 있으면 기준 단위가 아닌 단위를 고를 때 칸 아래에 기준 수량("= 240EA")을 보이고 − / + 알림에도 붙인다. factor가 없으면 지금과 같다
- AppShell은 휴대폰 폭(breakpoint.sm 미만)에서 `userName`이 있으면 user 칸을 아바타 단추 하나로 줄이고(새 props `userName` · `userMenu`), 344에서도 바가 넘치지 않는다. 폭 단계를 돌려주는 `useBreakpoint()`를 공개한다. WorkHoursMeter `overtimeBasis`(week 기본 · day)로 요약 · 범례 · 요일 막대가 같은 연장 기준을 쓴다. Payslip은 `employee.position`을 직위로 적고 `employee.grade`(직급)를 더한다. Avatar 이니셜은 크기와 관계없이 성을 뺀 두 글자다. PersonLabel sm의 근무 상태는 점만 보인다. ApprovalLine의 긴 의견이 부모 최소 폭을 넓히지 않는다. Input `type="search"` + clearable은 브라우저 지우기 단추를 숨긴다. Menu 문서에 항목 필드와 좁은 화면 시트 동작 · 접근성을 적었다.
- PaperFields 줄 `blank`: 인쇄한 뒤 손으로 적는 칸(수령일 · 서명 · 근로자 주소)은 값이 비어도 "–"를 넣지 않고 빈 칸으로 둔다. PaperSignPair의 줄에도 같이 쓴다
- 새 컴포넌트 Paper: A4 · A5 종이 서식을 화면에서 미리 보고 브라우저 인쇄(PDF로 저장)로 내보낸다. 서식 조각 PaperTitle · PaperFields · PaperMoneyTable · PaperText · PaperSignature · PaperSignPair · PaperSeal, 부모 폭에 맞춰 줄이는 PaperPreview, 종이만 인쇄하는 printPapers · usePrintPapers(파일 이름 · 글꼴과 직인 이미지 대기 · 인쇄 뒤 정리). 새 토큰 `paper.*`(종이 색 · 그림자 · A4 · A5 크기 · 여백, 테마와 무관, 값은 승인 대기 D-67)가 CSS · TS · 네이티브 · Figma 산출물에 들어간다.
- Paper 보완(서비스 요청 R-35).

  - 종이 글자는 `paper.type.*` 토큰을 쓴다. 앱이 `type.*`를 덮어써도 종이 글자와 인쇄 쪽수는 그대로다. 지금 모양은 바뀌지 않는다.
  - 내용이 종이 한 장 높이를 넘으면 Paper가 `data-overflow`를 달고 `onOverflowChange(overflow)`를 부른다. PaperPreview 안에서는 1장이 끝나는 자리에 점선 "1장 끝"을 긋고, 미리보기 위에 쪽마다 안내 한 줄을 띄운다. 둘 다 인쇄에는 그리지 않는다.
  - PaperMoneyTable `carryIn` · `carryOut`: 여러 쪽으로 나눈 표의 앞 쪽 이월 · 다음 쪽 이월 줄. `paginateMoneyRows` 결과를 그대로 넘긴다.
  - printPapers · usePrintPapers 옵션 `onOpen`(인쇄 창이 열릴 때) · `onClose`(닫히고 정리가 끝난 뒤).
  - printPapers: 글꼴 · 직인을 기다리는 동안 다시 부르면 앞의 인쇄를 정리하고 그 Promise를 바로 푼다(인쇄 뿌리가 두 벌 찍히지 않는다). 종이를 그리다 오류가 나면 뿌리를 떼고 그 오류로 거부된다. 화면의 DOM을 넘기면 넘침 선은 복사하지 않는다.
- 대시보드 보강과 차트 보강(PG-39 · PG-40).

  - 새 컴포넌트 DashboardGrid: 12열 위젯 격자. 편집 모드에서 순서 바꾸기(손잡이 화살표 키 · Home · End, 앞뒤 단추) · 숨기기 · 보이기를 하고, 배치(`{ id, hidden? }[]`)를 onLayoutChange로 알린다. 끌기 없이 키보드와 단추로만 옮기고, 결과는 알림 영역이 읽는다. 폭 1280 · 1024 · 640에서 칸이 접힌다. 고정 배치는 `DashboardGridItem`
  - 새 차트 FunnelChart: 단계마다 남은 수와 앞 단계 대비 · 누적 전환율. 한 색, 왼쪽 정렬 막대, 아래 전체 전환율 한 줄
  - ComboChart: `stacked`로 3계열 이상을 쌓는다(툴팁 마지막 줄 합계). 6계열부터 다섯 뒤는 회색 "기타" 하나로 접는다
  - TrendChart: `forecast`(from번째 행부터 예측 점선, lower~upper 신뢰 구간 음영, 시작 세로선)
  - PeriodPicker: `compare` · `defaultCompare` · `onCompareChange` · `compareModes`(직전 기간 · 전년 동기 · 직접 선택). 주지 않으면 지금과 같다
  - 표 내보내기: contracts `toCsv` · `csvFileName`(UTF-8 BOM, 금액은 서식 없는 숫자, 수식 주입 막기), react `downloadCsv` · `downloadFile`
  - contracts: `dashboardLayoutOf` · `moveDashboardWidget` · `setDashboardWidgetHidden` · `funnelSteps` · `foldSeries` · `resolvePeriodCompare`
- 범용 기본 부품 4종과 고르는 목록 · 겹친 아바타(트랙 G PG-41 · PG-35).

  - 새 컴포넌트: Link(글자 링크. 앱 안 주소는 라우터로, 바깥 주소는 새 탭) · Tag(중립 라벨 칩, `onRemove`로 빼기, 사람 칩) · TagInput(칩 입력. text 모드는 키워드, person 모드는 참조자 · 참석자 사람 칩) · Divider(가로 · 세로 구분선, 가운데 글자) · SelectableList(목록 · 상세 화면의 고르는 세로 목록. 고른 행은 바탕 한 단계 또는 1px 테두리, 안 읽음 수는 숫자 글자, 화살표로 초점 이동) · AvatarGroup(겹친 아바타 + "+N")
  - TrellisProvider: `navigate`를 주면 Link와 PersonLabel `href`의 앱 안 주소를 새로 고침 없이 그 함수로 연다. 새 탭 누름 · 바깥 주소는 브라우저에 맡긴다
  - PersonLabel: `status`(메신저 접속 상태)를 아바타 점으로 보인다
  - contracts: `presenceToStatus` · `presenceLabel` · `avatarStatusLabel` · `AVATAR_STATUS_TONES`(근무 상태와 접속 상태, 두 어휘의 관계) · `isAppHref` · `isExternalHref` · `filterTagSuggestions` · `splitTagText` · `avatarGroupSlots`
- 일정 부품과 편집 부품을 더했다(트랙 G PG-42 · PG-43).

  - TimeField: 글자로 치거나(930 → 09:30) 30분 간격 목록에서 고르는 시각 칸. 종료 칸은 `durationFrom`으로 걸리는 시간을 보이고, 휴대폰에서는 아래 시트로 연다
  - WorkTimeline: 요일마다 출근 ~ 퇴근 막대(정규 · 연장 · 근무 중, 07~23시 눈금). 표라서 화면 읽기가 줄 · 칸으로 읽는다
  - PermissionMatrix: 모듈 × 동작 체크 표와 데이터 범위. 화살표로 칸을 옮기고 Space로 바꾸며, 수정을 켜면 조회도 켜진다. 읽기 전용 모양이 있다
  - Toolbar: 묶음 · 구분선 · 켜고 끄는 단추 · Select 자리가 있는 도구 줄. 탭 정류장 하나에 화살표로 옮긴다
  - ApprovalLineEditor: 기안자 아래로 결재자 순서 · 역할(검토 · 합의 · 승인) · 위로 · 아래로 · 빼기, 결재자 찾기, 참조자 칩
  - MonthCalendar: `views`를 주면 주 · 일 시간표(종일 줄 · 겹친 일정 나란히 · 지금 선). 휴대폰 주 보기는 날마다 일정 목록
  - ApprovalLine: `variant="compact"`는 결재 5색 점과 "3/4 검토" 한 줄
  - CheckboxGroup: 선택지 `color`로 라벨 앞 색 점
- 파일 미리 보기와 전체 화면 오류(트랙 G PG-44).

  - 새 컴포넌트 FileViewer: 그림은 확대 · 축소 · 화면에 맞춤 · 회전(그림 영역에서 + · − · 0 · R 키, 끌어서 옮기기), PDF는 브라우저 내장 PDF 보기에 쪽 · 배율을 넘겨 이전 · 다음 쪽으로 넘긴다(PDF 라이브러리 · 외부 요청 없음). 내장 보기가 없는 브라우저와 다른 형식은 파일 카드와 다운로드. 도구 줄은 탭 정지 하나이고 ← → Home End로 옮긴다. 불러오는 중은 Skeleton, 실패는 이유 · 다시 시도
  - EmptyState: `kind` `notFound`(주소에 화면이 없음) · `expired`(로그인 만료)와 기본 아이콘 · 문구, `headingLevel`(화면 하나를 차지하는 오류는 1, 제목 · 설명이 한 단계 크다). 원래 다섯 종류는 그대로
  - contracts: `fileViewerKind` · `nextZoom` · `clampPage` · `fileViewerPdfSrc` · `FILE_VIEWER_KINDS` · `FILE_VIEWER_ZOOM_STEPS`
- 완성도 점검(PR-26, D-84 ~ D-90). 토큰 값은 Patrick 승인(2026-11-09).

  - 토큰: `color.bg.nav`(사이드바 면) · `color.border.selected`(선택 · 현재 표시 선) 추가, 라이트 `fg.secondary` 700 · `fg.tertiary` 600, 다크 `border.divider` 700 · `brand.default` 600 + 흰 글자, 움직임 의미 이름 `duration.fast · normal · slow · slower · spin · pulse` · `easing.enter · exit`, `density.row.heightTall`(두 줄 행 44 · 56 · 64)
  - AppShell `scope` · `user` · `busy`(바 아래 진행 줄), 사이드바 면 `bg.nav`
  - SideNav 1단 아이콘 20 · 글자 500 · hover surface, 건수는 알약 없는 숫자 글자
  - DataGrid `rowActions` · `dividers`(auto = 숫자 열 4개 이상이면 세로선) · column `link` · `emphasis` · `headerUnit`(amount 머리 "(원)", 4열까지) · `DataGridLines`(두 줄 칸, heightTall), 머리 글자 fg.primary
  - FilterBar `layout="grid"` · `columns` · `onSearch`(라벨 열 조회 화면)
  - CommandPalette(새 컴포넌트, 웹): 찾기 칸 첫 줄 · 묶음 · 지금 줄 "열기 ↵" · 키 안내 · 빠른 질문 · children 자리
  - PageHeader 화면 행동 단추 한 단계 크게(lg)
  - 모든 hover 색 전환에 transition(stylelint `trellis/hover-transition`), 숫자 움직임 변수 금지, 컴포넌트별 reduce 중복 규칙 정리, 차트 첫 그리기(선 드러남 · 막대 자람)
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
- 컨트롤 보강(PR-30, 비교표 5절 1 · 8 · 13~17 · 22번).

  - 컨트롤 크기 `Size`가 xs · sm · md · lg · xl 다섯이 된다(새 상수 `SIZES`). Button · IconButton · Input · AmountInput · QuantityInput · MaskedInput · CodeSearch · DateField · PeriodPicker · Select · MultiSelect · ScanField · Tabs가 xs · xl을 그린다. 높이는 `density.control-height-*`, 글자는 xs · sm 12 · md 13 · lg · xl 14(입력 칸은 touch 16 유지). RadialMeter는 지름이라 자기 타입 `RadialMeterSize`(sm · md · lg)를 쓴다.
  - Input `mono`: 고정폭 글꼴(`font.family.mono`, `type.mono` 굵기 · 자간).
  - Button `disabledReason` · Menu 항목 `disabledReason`: disabled와 함께 주면 포커스가 닿는 `aria-disabled` 컨트롤이 되고, 이유를 툴팁(가리킴 · 키보드)과 `aria-describedby`로 알린다. 좁은 화면 메뉴 시트는 행 끝 글자로 보인다. loading · disabled인 submit Button은 폼을 보내지 않는다.
  - IconButton은 이름을 `title` 대신 Trellis Tooltip으로 보인다(가리킴 · 키보드 포커스). 바깥 Tooltip이 감싸면 그 Tooltip 하나만 뜬다.
  - Switch `size="lg"`(track 48 × 28). size를 주지 않으면 touch 밀도에서 lg로 그린다.
  - QuantityInput: 손가락 입력(touch 밀도 · 휴대폰 폭 · `pointer: coarse`)에서 칸 44 이상, − / + 는 칸 높이 정사각. − / + 로 바뀐 값을 `aria-live="polite"`로 읽는다.
  - Select · MultiSelect: 선택지가 0개면 "선택할 항목이 없습니다"(messages `select.empty`).
  - PeriodPicker `max`(뒤 날짜는 고를 수 없고 프리셋 끝이 줄어든다) · `maxDays`(넘으면 경고, 적용은 막지 않음), 적용 단추 옆 · 시트 아래 줄에 "N일".
- 데이터 화면을 보강한다(PR-30). EmptyState에 `kind`(empty · noResult · error · forbidden · offline)와 `requestId`를 더했다. 종류마다 기본 아이콘 · 제목 · 설명이 messages `emptyState.*`에 있고, error는 `role="alert"`로 읽힌다. `title`은 이제 선택이다. DataGrid는 `error`(메시지 · 요청 ID · 다시 시도)와 `filtered`를 받아 행 대신 EmptyState 블록을 그린다(카드 모양도 같다). 편집 칸이 있는 표는 `role="grid"`가 되어 방향키 · Home · End · PageUp · PageDown으로 칸을 옮기고 Enter · F2로 편집, Tab으로 다음 편집 칸에 간다. 열 묶음 머리 `groups` + `column.group`, 저장 전 칸 `isDirty` · `dirtyHint`, 행 찾아가기 `scrollToKey` · `flashKey`, 폭 1024~1279에서 숨는 `column.priority: 'low'`를 더했다. FilterBar는 기본값이 아닌 칩에 해제 단추(`onClearFilter`, 없으면 컨트롤 onChange에 기본값)를 달고, 좁은 화면에서 "필터 N" 단추 + 칩 가로 줄을 남긴다. 시트 안 선택지가 6개 이하인 Select · MultiSelect는 칩 묶음으로 바로 고른다. grid 모양에 `searching` · `collapsible`을 더했다. 한 줄 모양의 건수 · 동작이 다시 오른쪽 끝에 선다(PR-27 CSS 회귀 수정).
- 검토 · 확인 컴포넌트 6종과 개인정보 가림 함수(PR-30, 컴포넌트 비교표 5.2의 23 · 24 · 30 · 31 · 32 · 35 · 41 · 42).

  - 새 컴포넌트: Delta(증감 하나, 부호 · 화살표 · 한국식 색) · AmountBreakdown(항목 + 항목 − 항목 = 합계, 단위는 머리에 한 번) · ChangeDiff(필드별 이전 → 이후, 표 · 고정폭 목록) · IssueList(저장 전 오류 · 경고 목록, 오류가 먼저) · ReasonDialog(사유를 받는 확인 창, 바깥 누름으로 닫히지 않음) · MaskedValue(사유 뒤 원문을 잠깐 보이고 다시 가림)
  - KpiCard: 증감 줄을 Delta로 그린다. `error` · `onRetry`(값 자리에 불러오지 못함 + 다시 시도) · `masked`(가림 글자 + 이유 한 줄) · `size="sm"`(서랍 머리 작은 지표)을 더했다
  - HrRecord: 주민등록번호 · 계좌번호를 MaskedValue로 그린다. 새 `onRevealField(field, reason)`가 있으면 칸마다 사유를 받고 보인다(권한 확인 · 기록은 앱)
  - contracts: `formatDelta` · `deltaDirection` · `maskPhone` · `maskName` · `maskAddress` · `diffFields`
- 서랍 · 토스트 · 차트 보강(PR-30). Drawer에 `onPrev` · `onNext` · `prevLabel` · `nextLabel`을 더했다. 머리에 이전 · 다음 단추가 생기고 ← → 키가 같은 일을 한다. 입력 칸 안에서는 키를 무시한다. Drawer `side="bottom"`은 고르는 시트와 같은 아래 시트로 열린다. 손잡이가 있고 아래로 쓸어 닫으며 머리 단추는 손가락 크기(44)다. 새 `height`(auto · full)로 높이를 고른다. Drawer footer와 sticky ActionBar는 아래 여백에 안전 영역을 더한다. PageHeader 뒤로 단추는 휴대폰 · touch 밀도에서 lg 손가락 크기다. Toast는 danger면 직접 닫을 때까지, action이 있으면 10초 동안 남는다. 같은 제목 · 같은 tone이 다시 오면 쌓지 않고 ×N으로 센다. 표시 시간 앱 설정(기본 · 길게 · 직접 닫기)을 읽는 컨텍스트를 들였다. BarList에 `onBarPress`(막대가 단추) · `extremes`(최고 · 최저만 값 글자)를, BulletBar에 `targetLabel`(기준 이름) · `showRatio`(오른쪽 비율, 기본 켬)를 더했다. BulletBar는 showState가 false면 막대도 기본 색으로 칠한다.
- 접근성 · LineItemsEditor 후속(서비스 요청 R-33 · R-34): Card headingLevel(문맥 기본 h2 · 카드 안 h3) · landmark(기본 아님), Dialog · Drawer · 시트 Tab 순환을 keydown에서 바로 + aria-modal, Checkbox 누르는 자리 24, `<html data-motion="reduce">` 토큰 모드. LineItemsEditor Enter가 숨은 입력 · 보조 단추를 건너뛴다(마지막 칸 QuantityInput에서 줄 추가), 읽기 칸 column.tone, addIcon.
- 표 · 달력 보강과 기한 띠(서비스 요청 R-37 4 · 8 · 9, R-40, R-43 5).

  - DataGrid: `column.sticky: 'end'`로 결과 열(실지급)을 오른쪽에 붙인다. 같은 쪽 고정 열 여럿은 앞 열 폭만큼 밀어 앉는다. 가로로 넘치면 가린 쪽 가장자리(고정 열이 있으면 그 경계)에 안쪽 그림자가 선다. 말줄임으로 잘린 칸은 가리키면 전체 글자(title)
  - MonthCalendar: 일정 `colors`(점 여럿) · `icon`(유형 아이콘) · `state`(끝남 · 지연), 잘린 칩은 가리키면 전체 제목. `size="sm"`(낮은 칸에 점 + 건수)과 `onDayPress(날, 그날 일정)`
  - TeamSchedule: 날짜 머리 이름을 칸 안 숨은 글자로(axe empty-table-header)
  - DeadlineStrip(새 컴포넌트): 첫날부터 N일의 기한을 가로 날짜 축에 점으로. 같은 날은 숫자 묶음, 지난 기한은 "지남 n", 오늘은 선과 글자. 휴대폰은 날짜순 세로 목록
- KpiCard delta.format `point`(%p, 비율끼리의 차이). Input: 입력의 기본 최소 폭이 좁은 화면 바깥 칸을 밀던 문제(리눅스 390에서 FilterBar 넘침). DateField: 손가락 화면에서 달력 단추를 칸 높이(40)로. Toast: 왼쪽 강조 띠 제거(D-57). ChartCard: figure에 허용되지 않는 role="group" 제거(figure 기본 역할).
- Select · MultiSelect 선택지에 앞 표시 `leading`(점 `{ kind: 'dot', tone }` · 아이콘 `{ kind: 'icon', icon }`)과 오른쪽 보조 글자 `note`를 더했다. 점 색은 `SelectMarkTone`(차트 계열 슬롯 · 상태 톤 · 결재 5상태 이름)만 받는다. 고른 선택지의 표시는 닫힌 칸에도 보이고, 좁은 화면 시트도 같은 줄이다(D-73)
- 새 입력 컴포넌트 3종(PR-08). SelectableCard는 설명이 있는 선택지를 큰 카드로 보이고 하나(`mode="single"`, radio) 또는 여러 개(`mode="multiple"`, checkbox)를 고릅니다. 고른 카드는 1px 브랜드 테두리 전체와 체크로 보이고, 열 수는 묶음 폭으로 줄어 휴대폰은 한 열입니다. CheckboxGroup은 한 라벨 아래 체크박스 여러 개를 묶습니다. Field 라벨 · 도움말 · 오류 · 필수가 묶음에 이어지고, `selectAll`(전체 선택 라벨) · `orientation` · `maxVisible`(더 보기)을 받습니다. AddressInput은 우편번호 · 도로명 · 상세 주소를 받습니다. 주소 검색은 앱이 `search` prop · `AddressSearchProvider` · `onSearchRequest`로 넣고, 없으면 세 칸을 직접 입력합니다. 검색 창은 넓은 화면에서 대화상자, 좁은 화면에서 아래 시트입니다.
- AppShell 옆 칸 폭을 바꿀 수 있다(`asideWidth` · `defaultAsideWidth` · `onAsideWidthChange`). 옆 칸 왼쪽 가장자리 손잡이를 끌거나 ← → · Home · End로 바꾸고, Enter나 두 번 누르기로 기본 폭(400)으로 돌아간다. 범위는 320 ~ 720이고 본문 옆 열이면 본문이 560 아래로 줄지 않는다.

  AppShell에 사이드바 접기 단추를 더했다(`onSidebarCollapsedChange` · `defaultSidebarCollapsed`). 틀이 사이드바 안 SideNav에 접힘을 넘기므로 SideNav에 `collapsed`를 따로 주지 않아도 된다. 접혔을 때 맨 위에 보일 짧은 로고는 `brandCollapsed`. 옆 칸이 본문 옆 열로 열려 본문이 1024보다 좁아지면 사이드바가 저절로 접힌다(`autoCollapseSidebar`, 기본 true).

  SideNav 묶음 열림을 앱이 정하고 알 수 있다: 묶음 `open`(제어) · `onSectionOpenChange(id, open)`. 지금 화면(activeId)이 접힌 묶음 안으로 바뀌면 그 묶음을 연다(`revealActive`, 기본 true). defaultOpen이 false여도 지금 화면이 든 묶음은 열린 채 시작한다. 지금 화면이 든 묶음이 닫혀 있으면 머리 글자가 지금 화면 색 · 굵기가 되고 화면 낭독기는 "지금 화면 있음"을 읽는다. 묶음 머리에 `data-section-id`가 붙고, 닫힌 묶음은 `aria-controls`를 달지 않는다.

  새 컴포넌트 AgentReplay: 에이전트가 화면을 옮기며 칸을 채우는 모습(커서 · 지금 칸 테두리 · 누름 물결 · 아래 진행 띠)을 클릭을 막지 않는 맨 위 층에 그린다. 휴대폰에서는 탭바 위 꽉 찬 띠, 움직임 줄이기에서는 테두리만. 아이콘 `mouse-pointer-2`를 더했다.
- Card에 무게(`emphasis`: `strong` · `default` · `quiet`)와 제목 앞 상태 아이콘(`tone`)을 더했다. strong은 진한 테두리와 한 단계 큰 제목이고 화면에 하나만 쓴다. quiet는 테두리와 면이 없다. 본문이 비면 본문 칸을 그리지 않아 footer가 제목 바로 아래에 붙는다.

  새 컴포넌트 3개: `SectionHeader`(카드 밖 구역 제목 · 건수 · 설명 · 동작), `NotificationItem`(알림 목록 한 줄), `NotificationList`(오늘 · 어제 · 이번 주 · 이전 묶음, 읽지 않은 것 먼저, 모두 읽음). contracts에 `formatRelativeTime` · `relativeDayGroup`을 더했다.

  Avatar · PersonLabel에 공석(`vacant`)을 더했다. 점선 테두리와 사람 아이콘이고 "담당자 없음"으로 읽는다. PersonLabel은 `vacantLabel` · `action`을 받는다. 두 컴포넌트 모두 공석이면 `name`이 없어도 된다.

  Badge는 tone이 neutral이면 기본으로 점이 없다(결재 상태는 그대로 점). DueBadge의 먼 단계와 완료도 글자만 보인다. 점을 두려면 `dot`을 준다.

  PageHeader: 형제(siblings)가 있으면 meta가 설명 줄로 내려가고, 휴대폰에서는 형제 줄이 줄바꿈하지 않고 한 줄로 가로 스크롤된다. 형제를 가리키면 밑줄이 생긴다. Banner는 폭이 560보다 좁으면 동작 단추를 글 아래 줄로 내린다. Drawer는 열리면 첫 초점을 제목에 둔다(`data-autofocus`가 있는 칸이 있으면 그 칸).
- TrellisProvider `toastDuration`(기본 · 길게 · 직접 닫기)이 그 아래 ToastProvider의 자동 닫힘 시간을 바꾼다(WCAG 2.2.1, 식자재 ERP 화면 설정).
- 휴대폰 밀도 `touch`를 추가했다(행 48 · 컨트롤 32/40/48 · 본문 15/22 · 입력 글자 16). 폭이 640보다 좁으면 루트에 자동으로 적용된다(D-61). 새 토큰 `density.input.fontSize`를 입력 칸이 쓴다. DataGrid는 휴대폰에서 행마다 카드가 되고(`mobile` · `column.mobile`), AppShell은 `tabs`로 아래 탭바를 그리며, KpiCard는 두 열, Tabs는 넘치는 쪽을 흐리게 한다
- 블록에서 나온 새 컴포넌트 셋(PR-08). MonthCalendar는 월 달력이다. 칸마다 일정 칩 세 건과 "N건 더"를 보이고, 오늘 · 고른 날 · 키보드 이동(화살표 · Home · End · PageUp · PageDown)을 지원한다. 좁은 화면에서는 숫자 + 점과 고른 날 일정 목록으로 바뀐다. KanbanBoard는 단계 칸반이다. 칸 머리에 건수와 금액 합계를 보이고, 카드마다 옮기기 메뉴(키보드 · 손가락)와 마우스 끌기로 onMove를 부른다. 좁은 화면에서는 단계 탭 + 한 열이다. 기본 카드 내용은 KanbanCard로 따로 쓸 수 있다. FolderTree는 폴더 트리(role tree)다. 화살표 · Home · End · 글자 찾기로 옮겨 다니고 Enter로 고르며, 건수는 흐린 숫자로 보인다. 일정 · 문서함 · 메일 · 영업기회 블록이 이 컴포넌트를 쓴다.

### Patch Changes

- AgentReplay 진행 띠가 모달(등록 서랍 · 시트) 아래에서 보조 기술에 안 보이던 문제를 고쳤다. Base UI는 모달 밖 요소를 aria-hidden으로 가리고 aria-live 속성이 있는 요소만 남기는데, 띠 글이 role=status뿐이라 띠와 단추(건너뛰기 · 멈추기 · 결과 보기)가 함께 가려졌다. 띠에 aria-live="off", 글 칸에 aria-live="polite"를 적었다
- AmountInput: 한글 입력기 조합으로 숫자를 넣으면 조합이 끝난 뒤 onChange가 빠지던 것을 고쳤다(마지막으로 알린 값과 비교). PE-05 키보드 · IME 테스트(ScanField · CodeSearch 키보드만으로, AmountInput 조합).
- 차트 y축 글자가 잘리던 문제를 고쳤다. WaterfallChart는 눈금을 직접 정해 그 글자로 축 폭을 재고, ComboChart는 쌓은 막대의 합계 글자까지 잰다
- DataBar 경고 글리프가 칸 크기로 커지던 문제를 고쳤다. 차트 글리프가 받은 className을 덮지 않고 덧붙인다
- CodeSearch: 넓은 화면 목록이 열려도 바깥 칸에 aria-hidden이 남지 않는다(axe aria-hidden-focus). 받아 둔 자유 입력 글자에 넓은 화면에도 지우기 단추가 있다. 좁은 화면 시트 모드는 name이 없어도 FormSection "입력 N개"에 센다(`data-filled`)
- ComboChart: 아래 보조 차트가 선뿐이어도 점이 위 막대의 가운데에 섭니다(두 차트가 같은 칸 눈금). 아래 차트 툴팁은 숫자(소수 한 자리까지) 뒤에 `unit`을 한 번 붙이고 `yFormat`은 축 눈금에만 씁니다. 눈금 서식에 %를 넣어도 툴팁이 "13.3%%"로 찍히지 않습니다.
- 좁은 자리에서 글자 · 표가 상자 밖으로 나가던 곳을 고쳤다. PermissionMatrix · LineItemsEditor는 스크롤 칸을 기준 블록으로 두어 칸 안의 읽어 주기 전용 글이 화면에 숨은 가로 스크롤을 만들지 않는다(PermissionMatrix는 390 폭에서 화면이 485px 넓어졌다). MessageThread 답글 인용은 말풍선 폭 안에서 줄어든다. KpiCard 숫자는 카드가 좁으면 카드 안에서 줄을 바꾼다. KanbanBoard 카드는 금액과 단위를 한 줄에 두고 뒤 글자가 안 들어가면 아랫줄로 내린다. MonthCalendar 7일 시간표는 날짜 칸 폭이 112 미만이면 화면 폭과 관계없이 블록 시각을 감춘다
- DashboardGrid 배치 편집에서 숨긴 위젯의 옮기기 손잡이 이름에 보이는 글자 "숨김"을 넣었다("재고 숨김 위치 옮기기"). 보이는 글자와 접근성 이름이 어긋나던 문제(axe label-content-name-mismatch)를 고친다.
- DataGrid 묶음 행: 소계 0을 그 열의 데이터 행이 0을 그리는 대로 그립니다. `render`가 0을 비우는 열은 소계도 빈칸입니다. 묶음 접기 단추의 높이는 `density.control-height-xs`라 휴대폰(touch 밀도)에서 44가 됩니다.
- DateField에서 min · max 밖의 날을 치면 값은 그대로 두고 칸을 오류 상태로 바꾸며 "{min} 이후 날짜를 넣으세요" · "{max}까지 넣을 수 있습니다"를 Field 오류 칸에 보인다. 예전에는 칸을 떠나면 말없이 되돌렸다. `outOfRangeText(bound, date)`로 문구를 바꾸고, Field error가 있으면 그것이 보인다(D-74)
- 문서 사이트 검사에서 나온 접근성 문제를 고쳤다.

  - MonthCalendar 주 · 일 보기의 일정 블록 단추가 aria-label 대신 보이는 글자로 이름을 짓는다. 숨은 날짜 · 시각 뒤에 보이는 시각 · 제목(일 보기는 meta까지)이 이어져 보이는 글자가 이름 안에 그대로 있다(WCAG 2.5.3). 이름 글자는 전과 같다.
  - PermissionMatrix 잠긴 줄의 이름 · 설명이 `fg.tertiary`가 됐다(전에는 이름이 `fg.disabled`라 4.5:1이 안 됐다).
  - KpiCard 다시 시도 단추의 영어 이름이 `Try again to load {label}`이 됐다. 보이는 글자 `Try again`이 이름 안에 든다.
  - RichText 링크 예시의 앱 안 주소를 같은 쪽 안 주소(`#voucher`)로 바꿨다. 문서 사이트에서 눌러도 404가 나지 않는다.
- 동봉 문서의 예시 코드가 그대로 컴파일된다(R-T38). `import type`을 옮기고, 여러 줄 상수를 끝까지, 상수가 쓰는 상수까지 함께 넣는다(TeamSchedule 교대 근무 · HrRecord · AddressInput · MessageThread · Paper 등). 컴포넌트 문서의 저장소 안 경로(contracts `_shared/*.ts`)는 `@terracelab/trellis-contracts`로 적는다. 테스트가 모든 예시를 타입 검사한다.
- 동봉 문서의 컴포넌트 상태(`manifest.components[].status`)가 스토리 유무를 제대로 읽는다. 스토리 파일을 패키지 폴더에서 찾아 121종이 모두 `preview`로 적혀 있었다. 생성 스토리를 찍은 VRT 스냅샷 폴더를 기준으로 본다. 컴포넌트 문서 머리의 "미리보기(0.x)"는 "미리보기"로 적는다
- Drawer 본문이 넘쳐 스크롤되는데 안에 초점 받을 것이 없으면 본문을 Tab 순서에 넣는다. 글만 있는 긴 서랍(계산 근거 · 안내)을 휴대폰 폭이나 큰 글자에서 키보드로 내려 읽을 수 없던 문제다(WCAG 2.1.1). 넘치지 않거나 안에 단추 · 입력이 있으면 넣지 않는다
- FilterBar grid의 줄 구분선이 조건이 줄을 다 채우지 못해도 오른쪽 끝까지 이어진다. 3칸 격자에 조건이 둘이면 빈 칸 아래에 선이 없어 줄이 중간에서 끊겼다
- 문서 · 주석 · 설명 글에서 다른 제품과 서비스 이름을 일반 명칭으로 바꿨습니다. 회색 톤 "기본"의 설명 글이 바뀌었고 토큰 값과 동작은 그대로입니다.
- 동봉 문서에 가이드 2편을 더했습니다. "대시보드 만들기"(guides/dashboards.md)는 PageHeader → FilterBar · PeriodPicker 비교 → KpiCard 줄 → DashboardGrid의 ChartCard 위젯 → DataGrid와 내보내기 순서, 질문별 차트, 상태 · 휴대폰 규칙, 시작할 블록을 다룹니다. "에이전트 대화 화면 만들기"(guides/conversation.md)는 전체 화면과 AppShell 옆 칸 배치, 답 항목 부품, 실행 상태 6개, 앱이 넘기는 것, 승인 규칙을 다룹니다. 스킬의 SKILL.md · 자주 틀리는 것 · 블록 표가 두 가이드와 새 부품 · 블록 패턴 `ErrorPage`를 가리킵니다. 소개 가이드의 컴포넌트 수를 116종(기본 101 · 차트 15)으로 맞췄습니다.
- LineItemsEditor 정렬과 빈 합계(서비스 요청 R-35). 칸 오류가 붙어 한 칸이 길어져도 같은 줄의 입력 · 읽기 칸 · 번호 · 삭제 단추가 한 줄에 서고 오류 글자는 그 입력 아래에 붙는다(표 · 줄 · 카드 모두). 표 줄 높이가 입력 기준선 때문에 1 더 높던 것도 함께 맞췄다. 줄이 0개면 합계 행 · 합계 묶음(totals) · footnote를 모든 모양에서 그리지 않는다. 예전에는 카드 · 줄 모양에서 합계와 합계 묶음이, 표에서 합계 묶음이 남았다.
- 목록 화면을 조용하게(D-56). Tabs 카운트는 알약 없이 숫자 글자, Banner는 톤 바탕 · 왼쪽 띠 대신 `bg.surface` + 1px 테두리(상태는 아이콘 색과 제목), DataGrid 셀 안의 점 있는 subtle Badge는 점 + 글자, 정렬 아이콘은 정렬 중인 열만 보인다. FilterBar는 자기 면 없는 도구 줄이고, DataGrid `height="fill"`은 남은 높이까지만 자란다. API 변경 없음.
- MaskedValue 잠금 이유가 좁은 칸 · 큰 글자에서 줄을 바꾼다. 줄바꿈 금지라 320 · 344 폭 + 글자 112 · 125%에서 칸 밖으로 나갔다(서비스는 이유를 짧게 줄여 피했다). 자물쇠 아이콘은 첫 줄 가운데에 남는다
- 왼쪽 강조 띠를 없앴다(D-57). DataGrid의 열린 행은 바탕만 바꾸고, `rowTone`은 `data-tone`만 달고 띠를 그리지 않는다. 상태는 상태 열의 점 · 배지가 보인다. API 변경 없음.
- SegmentedBar 범례는 좁으면 금액 · 비율을 다음 줄로(이름을 자르지 않는다), DataBar는 좁은 열에서 막대가 먼저 준다(값 글자는 남는다), Radio 누르는 자리 24 이상. 기기 설정 고대비(`prefers-contrast: more`)가 `data-contrast`가 없을 때 고대비 토큰을 켠다(tokens.css · 회사 테마 theme.css 둘 다).
- 소개 가이드의 컴포넌트 수를 121종(기본 106 · 차트 15)으로 맞췄습니다. SectionHeader · NotificationItem · NotificationList · DeadlineStrip · AgentReplay가 더해진 수입니다.
- PageHeader 제목 줄 탭(siblings) 사이를 space-32로 벌리고 가운데에 세로 구분선(border.strong, 줄 높이의 절반)을 넣었다. 이름 안 가운뎃점(법인 · 임원 · 주주)과 형제 사이 간격이 섞여 한 제목처럼 읽히던 문제다. 줄이 넘치면 새 줄 맨 앞 구분선은 감춘다
- PageHeader 형제(siblings)는 지금 화면(h1)보다 한 단계 작은 `type.h3`로 그리고 기준선을 h1에 맞춘다(D-141 확정). 1440에서 형제 줄이 절반쯤으로 줄고 390에서 대부분 스크롤 없이 들어간다.
- PageHeader 휴대폰 형제 줄(한 줄 가로 스크롤)이 스크롤되지 않고 머리 전체를 화면 밖으로 밀던 문제를 고쳤다. 머리와 제목 묶음의 격자 열이 내용 폭이라 형제 3개 이상이면 본문이 가로로 넘쳤다(390에서 440). 격자 열을 minmax(0, 1fr)로 두어 줄 안에서만 스크롤된다
- ProfileHeader 요약(facts)이 좁은 화면에서 줄이 바뀌면 줄 첫 항목이 구분선 없이 왼쪽 끝에서 시작한다. 둘째 줄부터 맨 앞에 구분선과 들여쓰기가 남아 첫 줄과 시작선이 어긋났다
- TrellisProvider: 바깥 Provider만 `<html lang · data-theme · data-density>`를 바꾸고, 내려갈 때 원래 값으로 돌린다. 안쪽 Provider(페이지 일부만 다른 언어)는 문구 언어만 바꾼다. spec 원문 모순 정리(Banner 띠 · DataGrid 예시 제목 · DateField 달력 언어 · SegmentedControl 칸 수).
- tokens.css가 테마마다 `color-scheme`(light · dark)을 넣는다. 다크 테마에서 브라우저 기본 스크롤바 · 컨트롤도 어둡게 그린다. 스크롤바는 테마 색(손잡이 `border.strong`)과 thin 굵기를 따르고, 사이드바 스크롤바는 짙은 면에 맞춘 `nav.hover`(가리키면 `nav.fgMuted`)다. Safari는 기본 그대로다.

  Icon 크기를 `size.icon.16` · `20` · `24` 토큰이 정한다(`data-size`). 앱이 글자 크기 모드에서 이 토큰을 키우면 아이콘도 커진다. 기본 값에서는 화면이 바뀌지 않는다. IconButton 개수 배지는 숫자 글자 크기를 따라 커지고, AppShell 바는 안의 컨트롤이 더 크면 그 높이까지 커진다. 휴대폰 탭은 높이 56이 최소가 됐다.
- 보강 요청은 서비스 저장소의 `.trellis/requests.md` 한 곳에 적는다(R-T05). 스킬 `references/request.md`, 가이드 서비스 시작하기 · 에이전트로 개발하기, llms.txt 규칙이 같은 곳을 가리킨다. 시작 템플릿이 머리줄만 있는 파일을 만든다. Trellis 쪽은 `node scripts/collect-requests.mjs <서비스 경로…>`로 backlog에 없는 줄을 모은다. 가이드의 오래된 문장(Phase 예정 · 51종 · 스킬 준비 중)을 지금 상태로 고쳤다(R-T37).
- 서비스 저장소에서 git 하위 모듈로 쓰기(D-58). react · contracts · icons에 `@terracelab/source` 내보내기 조건을 더해 개발 중에는 소스를 바로 읽는다. 서비스용 스킬 패키지(install · doctor · docs)를 추가했다. SegmentedControl이 Field 안에서 칸 폭으로 늘어나던 것을 고쳤다.
- 스킬: SKILL 0절에 회사 테마 단계(`pnpm ds:theme --brand`, 겹침 경고의 세 가지 · 밝은 색 제안, R-T02), `references/blocks.md`에 블록 플랫폼 · 화면 도우미 API 표(PlatformProvider props · Session · Role · User · usePlatform · setRole · useScreens · Page · Grid · useSiblings · josa · addDays 등, R-T06), 4절 검증은 `pnpm lint` · `pnpm check`(R-T41). 서비스 시작 템플릿에 `pnpm check`(전 화면 × 4폭 × 라이트 · 다크, axe · 가로 넘침 · 콘솔 오류, 본문 높이 스크린샷)와 eslint + Trellis 규칙 `pnpm lint`가 들어가고(R-T03), `pnpm ds:update`가 theme.css를 지금 생성기로 다시 만든다. 가이드 서비스 시작하기가 이 명령을 적는다.
- 읽어 주기 전용 글(`tl-sr-only`)이 숨은 스크롤을 만들지 않는다. AppShell 본문(`tl-app-shell__main`)을 기준 블록(`position: relative`)으로 두어 본문 안의 그 글이 틀(overflow: hidden) 아래로 나가 틀에 숨은 스크롤 높이를 만들던 것을 막는다(ErrorSummary처럼 포커스를 옮기는 동작이 틀을 밀어 바를 가렸다). `tl-sr-only`에 `margin: -1px`(border.width.1)를 더해 화면 높이를 다 쓰는 틀 뒤의 알림 영역이 모든 화면을 1px 늘리던 것도 막는다(고정 스크롤바 환경에서는 늘 세로 스크롤바가 생겼다)
- Tabs · SideNav가 강제 상태(`data-force-state` hover · active · focus)를 받아 States 스토리가 생긴다. Tabs 탭 · SideNav 항목은 누름(:active)도 가리킴과 같은 모양. FormSection contract 상태는 default 하나(묶음은 상호작용이 없고 접는 단추는 단추 문법).
- TeamSchedule: 좁은 화면에서 AppShell 본문에 숨은 가로 스크롤이 생기던 것을 고쳤다. 표 칸 안의 읽어 주기 전용 글이 표 스크롤 칸이 아니라 본문을 기준으로 놓여, 390 폭에서 본문이 331px 넓어졌다. 스크롤 칸을 기준 블록으로 둔다.
- 넓은 화면의 오른쪽 서랍도 footer 위로 토스트를 올린다. 토스트가 같은 오른쪽 아래에 떠서, 서랍을 연 채 하는 동작(다시 내려받기 · 정정 같은 footer 단추)을 몇 초씩 가렸다. D-76("토스트는 결과를 알리는 것이지 다음 동작을 막는 것이 아니다")을 오른쪽 서랍까지 넓힌다. footer가 없는 서랍은 세지 않는다
- Toast(서비스 요청 R-29): 열린 아래 서랍 · 휴대폰 서랍 footer · 시트 footer · 휴대폰 탭바 · sticky ActionBar가 있으면 그 위에 뜬다(--tl-toast-offset-bottom). 층 순서는 그대로.
- 함께 올라간 패키지
  - @terracelab/trellis-contracts@1.0.0
  - @terracelab/trellis-tokens@1.0.0
  - @terracelab/trellis-icons@1.0.0
