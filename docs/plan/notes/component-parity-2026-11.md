# 식자재 ERP · Trellis 컴포넌트 비교표

작성 2026-11-10. PR-30의 비교표 초안이다. 에이전트가 썼고 사람이 아직 보지 않았다.

식자재 ERP 디자인 시스템의 컴포넌트를 하나씩 Trellis 컴포넌트와 견준다. 식자재 ERP이 나은 곳은 Trellis의 어느 컴포넌트에서 무엇을 바꿀지 적는다. 원본은 식자재 ERP 리뉴얼 저장소이고 읽기만 했다. 읽은 곳은 `packages/ui/src`의 25개 모듈과 `hooks.ts` · `lib/*`, `packages/ui/styles/theme.css` · `tokens.css`, `apps/web/src/shared/ui`의 `status` · `Privacy` · `kit`, `apps/web/docs/components`다. Trellis 쪽은 `packages/contracts/src/<Name>`의 spec · contract, `packages/react/src/<Name>` 구현, `docs/spec/components.md` §8, `docs/plan/backlog.md`를 읽었다.

전제는 셋이다.

- 밀도 토큰은 병행 작업에서 바뀐다. 컨트롤은 xs 26 · sm 30 · md 36 · lg 42 · xl 48(compact · comfortable), touch는 44 · 48 · 56, 표 행은 compact 36 · comfortable 40이 된다. 그래서 xs · xl 크기나 48 손가락 크기가 없는 컴포넌트는 부족으로 센다.
- Trellis 규칙이 이기는 항목은 식자재 ERP에 있어도 들이지 않는다. 카드 · 행 · 메뉴의 왼쪽 띠(D-57), 사이드바 건수 알약(D-90), 꾸밈용 틴트 배너(D-56), 수입 빨강 · 지출 파랑, 결재 5상태, 상태 어휘 7개가 그렇다.
- 식자재 ERP 업무에 묶인 조각(`status.tsx`의 주문 상태 칩 같은 것)은 "가져오지 않음(업무 조각)"으로 둔다.

Trellis 칸은 커밋 `ee07146` 기준이다. 이 표를 쓰는 동안 병행 토큰 작업(D-97, 아직 커밋 전)이 작업 트리에서 밀도 값과 함께 글자 크기 `data-font-scale` 112 · 125, `data-contrast="high"`, `data-chart="cvd"`, 시스템 고정폭 `font.family.mono`를 더하고 있다. 그 작업이 들어오면 2절의 해당 줄과 5.1의 4 · 5 · 8 · 12번은 토큰 부분이 끝난다. 포커스 강조 · 링크 밑줄 · 손가락 입력 규칙은 그 작업에 없다.

토큰 값(색 · 크기)을 바꾸거나 새 토큰 이름을 더하는 항목은 제안이다. 사람이 승인해야 한다.

## 1. 읽는 법

| 표기 | 뜻 |
|---|---|
| 같음 | 두 쪽이 같은 수준이다 |
| T 우위 | Trellis가 낫다 |
| 식 우위 | 식자재 ERP이 낫다 |
| 공통 | 컴포넌트가 아니라 2절 공통 기반에서 정한다 |
| – | 해당 없음 |
| 식 · T | 식자재 ERP 값 · Trellis 값 순서 |

표가 넓어 둘로 나눴다. 3절 비교표 A는 크기 · 상태 · 밀도 · 모드 · 키보드이고, 4절 비교표 B는 손가락 입력 · 좁은 화면 · 로딩과 빈 상태 · 숫자 · 개인정보 · 판정이다. 두 표의 줄 이름은 같다. 줄 이름은 `모듈 · 컴포넌트`다.

## 2. 공통 기반

토큰 · CSS · 앱 설정 단계에서 정하는 것이다. 식자재 ERP은 `<html data-*>` 하나로 모든 앱의 모드를 바꾼다(`theme.css`).

| 항목 | 식자재 ERP | Trellis | 판정 |
|---|---|---|---|
| 컨트롤 높이 | xs 26 · sm 30 · md 36 · lg 42 · xl 48 | sm · md · lg만. compact 24 · 28 · 32, comfortable 28 · 32 · 40, touch 40 · 40 · 48 | 식자재 ERP이 낫다 → 토큰은 병행 작업이 바꾼다. `_base.ts`의 `Size`를 xs~xl로 넓히고 컴포넌트 CSS에 `data-size` xs · xl을 더한다 |
| 손가락 크기 | touch 44 · control-xl 48 · touch-main 56 | touch 밀도 lg 48. 56 없음 | 식자재 ERP이 낫다 → 병행 작업의 touch 44 · 48 · 56으로 맞춘다 |
| 누르는 영역 확장 | `(pointer: coarse)`에서 xs · sm 단추의 `::after`를 36(1024 이상) · 44(1024 미만)로 넓힌다. 보이는 크기는 그대로 | 없음. DateField 달력 단추 · MaskedInput 보기 단추만 테두리까지 넓힌다 | 식자재 ERP이 낫다 → 공통 CSS 규칙 |
| 입력 칸 16px | `(pointer: coarse)`면 폭과 관계없이 `input · select · textarea` 글자 16 | 640 미만 touch 밀도와 시트 안만 16. 태블릿 · 폴드는 13 · 14 | 식자재 ERP이 낫다 → `(pointer: coarse)`에서 `density.input.fontSize` 16 |
| 표 행 높이 | 40 · 밀집 36(사용자 설정) | compact 32 · comfortable 40 · touch 48. 36 · 40 · 48로 바꾸는 중 | Trellis가 낫다(밀도 3종) |
| 다크 | `data-theme="dark"`, 다크는 그림자 대신 1px 테두리 | `data-theme="dark"`, 다크는 그림자 없음 | 같다 |
| 고대비 | `data-contrast="high"`. 색 토큰을 덮고 포커스 색을 진하게, placeholder 불투명, 고른 글자 반전. 토큰 테스트가 7:1을 본다 | 없음. backlog에 `data-contrast="more"` + `prefers-contrast` 승인 대기 | 식자재 ERP이 낫다 → backlog 줄을 플랜 작업으로. 이름(`high` · `more`)을 정한다 |
| 글자 크기 | `data-font-scale="112"·"125"`. 20~24 제목은 절반만, 28 이상 큰 숫자는 그대로. 차트 축 글자도 따른다 | 없음. backlog에 `data-text-size="lg"·"xl"`(1.15 · 1.3배) 승인 대기 | 식자재 ERP이 낫다 → 배율(1.125 · 1.25 또는 1.15 · 1.3)과 이름을 정한다. 큰 제목 절반 규칙을 같이 들인다 |
| 포커스 강조 | `data-focus="strong"`. 링 3px · 간격 2, 입력 칸 감싸개 둘레 · 메뉴 · 옵션 항목 안쪽에도 링 | 2px 링 고정(`.tl-focusable`) | 식자재 ERP이 낫다 → `_internal/focus.css`에 모드 하나 |
| 링크 밑줄 | `data-links="underline"`. 링크 글자에 늘 밑줄(색만으로 구분하지 않기) | 없음. DataGrid link 열은 가리킬 때만 밑줄 | 식자재 ERP이 낫다 → 모드 하나 |
| 움직임 줄이기 | `data-motion="reduce"` + `prefers-reduced-motion`. 도는 스피너는 상태 표시라 남긴다 | `data-motion="reduce"` + `prefers-reduced-motion`. 모든 시간 토큰 0 | 같다. 다만 Trellis Spinner가 멈춘다(비교표 Spinner 줄) |
| 본문 너비 | `data-content-width` 1280 · 1440 · 1600 · 전체 | 없음 | 식자재 ERP이 낫다(작음) → 블록 `Page`에 모드 하나. 선택 작업 |
| 색각 친화 차트 | `data-chart="cvd"`로 차트 팔레트를 바꾼다 | 별도 팔레트 없음. 기본 팔레트가 CVD 인접쌍 검증을 통과했다(`chart-palette-2026-11.md`). D-97이 `data-chart="cvd"`를 더하는 중 | 같다(D-97 뒤). `charts/README.md` 문장은 5.1의 12번 |
| 고정폭 글꼴 | 고정폭 글꼴 토큰과 `t-mono-12` · `t-mono-11`. 코드 · 시각 · 축 글자 · Input `mono` | 없음 | 식자재 ERP이 낫다 → `font.family.mono` 토큰 + 글꼴 파일 패키지 동봉(외부 네트워크 0) |
| 한 글자 단축키 끄기 | `data-hotkeys="off"`면 j · k · / 같은 한 글자 키가 멈춘다(WCAG 2.1.4) | Trellis 컴포넌트는 한 글자 단축키를 쓰지 않는다 | 해당 없음. 새 키를 넣을 때 한 글자 키를 피한다 |
| 토스트 표시 시간 | `data-toast` 5 · 10 · 0초(WCAG 2.2.1) | 없음 | 식자재 ERP이 낫다 → 비교표 Toast 줄 |
| 안전 영역 | 화면 아래 줄 · 시트 · 드로어 · 아래 탭이 `env(safe-area-inset-*)`만큼 띄운다 | 시트 · AppShell · Composer · CommandPalette만. ActionBar sticky · Drawer footer는 없다 | 식자재 ERP이 낫다 → ActionBar · Drawer CSS |
| 설치 앱 창 제목 줄 | `data-titlebar`로 창 버튼 자리를 비운다 | 없음 | 가져오지 않음. 데스크톱은 Tauri가 창 틀을 정한다 |
| 화면 폭 구간 | 600 · 1024 · 1280 · 1920 | 640 · 768 · 1024 · 1280 · 1536 | 같다. 값은 Trellis 것을 쓴다 |

## 3. 비교표 A

열은 크기(xs~xl · 48 손가락) · 상태 7개 · 밀도 3종 · 모드(다크 · 고대비 · 글자 112 · 125 · 포커스 강조 · 움직임 줄이기) · 키보드다. 식자재 ERP 컴포넌트는 밀도 모드가 없고 대부분 px 높이가 고정이다.

| 식자재 ERP | Trellis 대응 | 크기 | 상태 7개 | 밀도 3종 | 모드 | 키보드 |
|---|---|---|---|---|---|---|
| Button · `Button` | Button | 식 우위 · 26~48 · T sm~lg | 같음 · 6개, 로딩 때 폭 유지 | T 우위 · 식 고정 px | 공통 | 같음 · Enter · Space |
| Button · `IconButton` | IconButton | 식 우위 · 정사각 26~48 | T 우위 · `pressed` | T 우위 | 공통 | 식 우위 · 포커스에 툴팁 · T `title`뿐 |
| Chip · `Chip` | Badge | 같음 · 20 · 24 / sm · md | – | 같음 | 공통 | – |
| Chip · `CountBadge` | IconButton · Tabs · SideNav `count` | 같음 · 99+ | – | – | 공통 | – |
| Choice · `Checkbox` | Checkbox | T 우위 · 누르는 자리 24 · 식 16 | T 우위 · error | T 우위 | 공통 | 같음 · Space |
| Choice · `RadioGroup` | RadioGroup | 같음 · 16 | T 우위 · error | T 우위 | 공통 | 같음 · 화살표 |
| Choice · `Toggle` | Switch | 식 우위 · lg 48×28 · T sm · md | 같음 | 같음 | 공통 | 같음 · Space |
| Field · `Input` | Input | 식 우위 · xl 48 | 같음 · 오류 문구는 T Field가 | T 우위 | 식 우위 · 강조 때 칸 둘레 3px | T 우위 · Esc 지우기 |
| Field · `SearchInput` | Input `type="search"` · `icon` | 식 우위 · xl | 같음 | T 우위 | 공통 | 같음 · "/" 포커스는 화면 몫 |
| Field · `NumberInput` | AmountInput · QuantityInput | 식 우위 · xl | 같음 | T 우위 | 공통 | T 우위 · ↑↓ · Shift×10 |
| Field · `Stepper` | QuantityInput `showStepper` | 식 우위 · 단추 48 · T 칸 높이 −8 | 같음 · 끝값에서 단추 꺼짐 | T 우위 | 공통 | T 우위 · ↑↓ · Home · End |
| Field · `Textarea` | Textarea | – | 같음 | T 우위 | 공통 | 같음 |
| Field · `FormField` | Field | – | T 우위 · 비활성 · 오류 연결 | T 우위 · 가로 배치 | 공통 | 같음 |
| Select · `Select` | Select | 식 우위 · xl | 같음 | T 우위 | 식 우위 · 강조 때 옵션 안쪽 링 | 같음 · 글자 찾기 |
| Filter · `FilterCard` | FilterBar `layout="grid"` | 같음 | 식 우위 · 검색 중 표시 | T 우위 | 공통 | 같음 · Enter 검색 |
| Filter · `FilterRow` | FilterBar grid 칸 | 같음 · 라벨 열 150 · 96 | – | T 우위 | 공통 | – |
| Filter · `DateInput` | DateField | 같음 | T 우위 · min · max 오류 | T 우위 | 공통 | T 우위 · 달력 화살표 · Alt+↓ |
| Filter · `DateRange` | PeriodPicker | 같음 · md · sm / sm~lg | 식 우위 · 기간 넘음 경고 | T 우위 | 공통 | T 우위 · 달력 화살표 |
| MobileFilter · `FilterBar` | FilterBar 좁은 화면 | 식 우위 · 칩 44 | 같음 | – | 공통 | 같음 |
| MobileFilter · `FilterChip` | FilterBar 칩 | 식 우위 · 44 + 해제 44 | 같음 · 기본값이 아니면 강조 | T 우위 | 공통 | 같음 |
| MobileFilter · `FilterSheet` | FilterBar "검색 조건" 시트 | 식 우위 · 선택지 44 · T 40 | 같음 | – | 공통 | 같음 |
| MobileFilter · `Calendar` | DateField · PeriodPicker 달력 · MonthCalendar | 같음 · 44 / touch 48 | 같음 | T 우위 | T 규칙 · 일요일 빨강 금지 | T 우위 · 식 화살표 없음 |
| MobileFilter · `DateSheet` | DateField 좁은 화면 시트 | 같음 | 같음 | – | 공통 | T 우위 |
| MobileFilter · `DateRangeSheet` | PeriodPicker 좁은 화면 시트 | 같음 | 식 우위 · 기간 넘음 경고 | – | 공통 | T 우위 |
| Data · `StatTile` | KpiCard | 같음 · sm · md · lg / md · lg | 식 우위 · 오류 · 다시 시도 | T 우위 | 공통 | 같음 · 누르면 단추 |
| Data · `BulkActionBar` | ActionBar `summary` | 같음 | – | – | 공통 | 같음 |
| Data · `Timeline` | Timeline | – | – | T 우위 · `dense` | 공통 | – |
| Data · `Steps` | Stepper | T 우위 · sm · md | T 우위 · 단계 상태 | – | 공통 | – |
| Data · `Avatar` | Avatar | T 우위 · 24 · 32 · 40 · 48 | T 우위 · 상태 점 | – | 공통 | – |
| Number · `Num` | `formatAmount` · `tl-amount` | – | – | – | 공통 | – |
| Number · `Trend` | KpiCard `delta` 안에만 | – | – | – | 공통 | – |
| Table · `DataTable` | DataGrid | 같음 · 40 · 36 / 밀도 행 | 식 우위 · T 오류 상태 없음 | T 우위 · 3종 | 공통 | 같음 · 행 Enter · 정렬 단추 |
| Table · `TotalCell` | DataGrid `summary` · `total` | – | – | T 우위 | 공통 | – |
| Table · `Cell2` | DataGridLines | – | – | T 우위 · 두 줄 행 높이 | 공통 | – |
| Table · `Pagination` | Pagination | 같음 · 32 / control md | T 우위 · disabled | T 우위 | 공통 | 같음 · Tab · Enter |
| Table · `Toolbar` | FilterBar 건수 · `actions` | – | – | T 우위 | 공통 | – |
| Grid · `EditGrid` | DataGrid 칸 편집 · LineItemsEditor | 같음 · 행 36 고정 / 밀도 | 식 우위 · 저장 전 칸 · 오류 상태 | T 우위 | 공통 | 식 우위 · 방향키 칸 이동 · PageUp · F2 |
| Grid · `NumberCell` | DataGrid `editor` number · amount | – | 같음 · 범위 오류 | T 우위 | 공통 | 같음 · Enter · Esc · Tab |
| Grid · `SelectCell` | DataGrid `editor="select"` | – | 같음 | T 우위 | 공통 | 같음 · ↑↓ · Enter · Esc |
| Grid · `DerivedAmount` | DataGrid amount 열 · `render` | – | – | – | 공통 | – |
| Ledger · `LedgerCard` | 없음. LineItemsEditor `totals` · Payslip이 가깝다 | – | 식 우위 · 계산 중 · 오류 | – | 공통 | – |
| Diff · `DiffTable` | 없음 | – | – | – | 공통 | – |
| Issues · `IssueList` | 없음. ErrorSummary가 가깝다 | – | 식 우위 · 오류 · 경고 두 단계 | – | 공통 | 같음 · 항목 단추 |
| Feedback · `Skeleton` | Skeleton | T 우위 · 모양 7종 | 같음 | T 우위 | 같음 · 움직임 줄이기 | – |
| Feedback · `EmptyState` | EmptyState | 같음 · compact / sm | 식 우위 · 종류 5 | – | 공통 | – |
| Feedback · `ErrorState` | 없음. ChartCard `error`만 | – | 식 우위 | – | 공통 | – |
| Feedback · `Banner` | Banner | – | – | – | T 규칙 · 틴트 바탕 금지 | 같음 |
| Feedback · `ProgressBar` | Progress | 같음 · 6 / sm · md | T 우위 · 값 없음 진행 | – | 공통 | – |
| Feedback · `Kbd` | 없음. Menu · CommandPalette 안 `kbd` | – | – | – | – | – |
| Toast · `toast` | Toast · `useToast` | – | 같음 | – | 식 우위 · 표시 시간 설정 | T 우위 · F6 · Esc |
| Tooltip · `Tooltip` | Tooltip | – | 같음 | – | 공통 | 같음 · 포커스에 열림 |
| Spinner · `Spinner` | Spinner | 같음 · px / 16 · 20 · 24 | 같음 | – | 식 우위 · 움직임 줄이기에도 돈다 | – |
| Overlay · `Modal` | Dialog | 같음 · 420 · 640 · 960 / sm · md · lg | 같음 | – | 공통 | 같음 · Esc · Tab 가둠 |
| Overlay · `ConfirmModal` | Dialog `tone="danger"` | – | 같음 · 확인 로딩 | – | 공통 | 같음 |
| Overlay · `ReasonModal` | 없음. Dialog + Textarea 조합 | – | 식 우위 · 사유 전 확인 꺼짐 | – | 공통 | 같음 |
| Overlay · `Drawer` | Drawer | 같음 · 560~780 / md · lg · xl | 같음 | – | 공통 | 식 우위 · ← → 이전 · 다음 건 |
| Overlay · `Sheet` | Drawer `side="bottom"` · 고르는 시트(`_internal/sheet`) | 식 우위 · 닫기 44 · T sm | – | – | 공통 | 같음 · Esc |
| Overlay · `Menu` | Menu | – | 식 우위 · 비활성 이유 | – | 식 우위 · 강조 때 항목 링 | 같음 · 화살표 · Home · End |
| Page · `Page` | 블록 `Page`(`blocks/src/_ui/layout.tsx`) | – | – | – | 식 우위 · 본문 너비 설정 | – |
| Page · `PageHeader` | PageHeader | – | – | – | 공통 | 같음 |
| Page · `Card` · `CardHeader` | Card | – | – | T 우위 · 카드 패딩 | 공통 | – |
| Page · `KV` | DescriptionList | – | T 우위 · 복사 | – | 공통 | T 우위 · 복사 단추 |
| Page · `Section` | FormSection · Card `headingLevel` | – | – | – | 공통 | – |
| App · `AppShell` | AppShell · SideNav | 식 우위 · 메뉴 줄 늘 44 · T 밀도 행(compact 32) | T 우위 · `busy` 진행 줄 | T 우위 | 공통 | T 우위 · 본문 건너뛰기 |
| App · `ScreenHeader` · `Screen` | PageHeader `onBack` · ActionBar `sticky` | 식 우위 · 머리 56 · 뒤로 48 | – | – | 공통 | 같음 |
| App · `SplitView` | 없음 | – | – | – | – | – |
| Tabs · `Tabs` | Tabs | 같음 · 40 · 36 / sm~lg | T 우위 · disabled | T 우위 | 공통 | T 우위 · 식 화살표 없음 |
| Tabs · `Segmented` | SegmentedControl | 같음 · md · sm | 같음 | T 우위 | 공통 | T 우위 · 식 화살표 없음 |
| Tabs · `PillTabs` | SegmentedControl `fullWidth` | 같음 · 40 | 같음 | T 우위 | 공통 | T 우위 |
| Charts · `ChartCard` | ChartCard | – | T 우위 · 빈 문구까지 | T 우위 · 카드 패딩 | 공통 | 같음 · 표로 보기 단추 |
| Charts · `Legend` | Legend | – | – | – | 공통 | – |
| Charts · `TrendChart` | TrendChart | – | 같음 · hover | – | 식 우위 · 축 글자가 글자 크기를 따른다 | 같음 · 표로 보기가 맡는다 |
| Charts · `ComboChart` | ComboChart | – | 같음 · hover | – | 식 우위 · 축 글자 배율 | 같음 |
| Charts · `WaterfallChart` | WaterfallChart | – | 같음 · hover | – | T 규칙 · 증가 빨강 · 감소 파랑 | 같음 |
| Charts · `BarList` | BarList | – | 같음 · hover | – | 공통 | 식 우위 · 막대가 단추 |
| Charts · `ShareList` | 없음. BarList 가로 | – | – | – | – | – |
| Charts · `Donut` | Donut | – | 같음 · hover | – | 공통 | 식 조금 우위 · 목록 Tab으로 조각 강조 |
| Charts · `AnimatedNumber` | 없음 | – | – | – | T 규칙 · 숫자를 세어 올리지 않는다 | – |
| Charts · `Sparkline` | Sparkline | 같음 | – | – | 공통 | – |
| Charts · `SegmentedBar` | SegmentedBar | 같음 · tall · thin | 같음 · hover | – | 공통 | 식 조금 우위 · 조각 Tab |
| Charts · `RadialMeter` | RadialMeter | T 우위 · sm · md · lg / px | – | – | 공통 | – |
| Charts · `CalendarHeatmap` | CalendarHeatmap | – | 같음 · hover | – | 공통 | – |
| Gauges · `BulletBar` | BulletBar | 같음 · sm · md | – | – | 공통 | – |
| Gauges · `DataBar` | DataBar | – | – | – | 공통 | – |
| Gauges · `HeatCell` | HeatCell | – | – | – | 공통 | – |
| ModuleIcon · `ModuleIcon` | ModuleIcon | 같음 · 48 기본 / 32 · 40 · 48 | – | – | – | – |
| Privacy · `MaskField` | HrRecord `revealed` · MaskedInput `secret` | 같음 · 단추 xs~md | 식 우위 · 남은 시간 · 권한 없음 | – | 공통 | 같음 |
| status · 톤 맵(`ORDER_TONE` 등) | `vocab.ts` 어휘 · Badge `tone` · `approval` | – | – | – | – | – |
| status · `OrderStatusChip` · `StatusChip` | Badge | – | – | – | – | – |
| kit · `GRID_TABLE` | DataGrid `dividers="all"` | – | – | – | – | – |
| kit · `useBranchMap` | 없음 | – | – | – | – | – |
| kit · `ActionBar` | ActionBar | 같음 · 56 · 64 / 밀도 | – | T 우위 | 공통 | 같음 |
| kit · `ApprovalPanel` | ApprovalLine · Badge `approval` · DueBadge | – | – | – | T 규칙 · 틴트 패널 금지 | – |
| kit · `ApprovalStatusLine` | Badge `approval` · ApprovalLine | – | – | – | – | – |
| kit · `WizardSteps` | Stepper | T 우위 | T 우위 · 단계 상태 | – | 공통 | – |
| kit · `AgingBar` | SegmentedBar `size="thin"` | – | – | – | – | – |
| kit · `FieldRows` | DescriptionList | – | T 우위 · 복사 | – | 공통 | T 우위 |
| kit · `MiniStat` | KpiCard | 식 우위 · 작은 지표 크기 | – | – | 공통 | – |
| kit · `When` | `formatDate` + Icon | – | – | – | – | – |
| kit · `DateField` | DateField | – | T 우위 | T 우위 | 공통 | T 우위 |

## 4. 비교표 B

열은 손가락 입력(누르는 영역 확장 · 입력 칸 16px) · 좁은 화면 변형(시트 · 카드) · 로딩과 빈 상태와 오류(스켈레톤 모양) · 숫자(고정폭 · 오른쪽 정렬 · 단위) · 개인정보 가림 · 판정이다.

| 식자재 ERP | 손가락 입력 | 좁은 화면 | 로딩 · 빈 · 오류 | 숫자 | 개인정보 | 판정 |
|---|---|---|---|---|---|---|
| Button · `Button` | 식 우위 · xs · sm 영역 36 · 44 | 같음 · `block` / `fullWidth` | 같음 · 로딩 스피너 | – | – | 식자재 ERP이 낫다 → Button `size` xs · xl, 손가락 입력 영역 확장(공통 CSS), `disabledReason`(권한 없음 이유를 툴팁 · 설명으로). variant dark · link · brand-outline은 들이지 않는다(역할 4개로 충분) |
| Button · `IconButton` | 식 우위 · 영역 확장 | 같음 | – | T 우위 · `count` 99+ · 식 점만 | – | 식자재 ERP이 낫다 → IconButton `size` xs · xl, 이름을 `title` 대신 Tooltip으로 보여 키보드 포커스에도 뜨게 |
| Chip · `Chip` | – | – | – | – | – | 같다. 톤 7종(pending · brand 포함) 대신 Badge `tone` 5종 + `approval` 5상태를 쓴다 |
| Chip · `CountBadge` | – | – | – | 같음 · 99+ | – | Trellis가 낫다. 사이드바 건수는 알약 없이 숫자 글자(D-90) |
| Choice · `Checkbox` | T 우위 · 24 · 식 16 | – | – | – | – | Trellis가 낫다 |
| Choice · `RadioGroup` | 같음 · 16 | – | – | – | – | 같다. 누르는 자리 24는 backlog 요청에 이미 있다 |
| Choice · `Toggle` | 식 우위 · lg 48×28 | – | – | – | – | 식자재 ERP이 낫다 → Switch `size`에 `lg`(48×28)를 더하고 touch 밀도에서 기본으로 |
| Field · `Input` | 식 우위 · 손가락 입력이면 늘 16 | 같음 | – | 같음 · 숫자 입력 오른쪽 · tabular, 식 `mono` | – | 식자재 ERP이 낫다 → Input `size` xs · xl, 입력 글자 16을 `(pointer: coarse)`에도(공통), `mono`(코드 · 주문번호)는 mono 토큰 뒤 |
| Field · `SearchInput` | 식 우위 · 16 | 같음 · T 필터 바 검색 칸 | – | – | – | 같다. 크기 · 16px은 공통 항목으로 |
| Field · `NumberInput` | 식 우위 · 16 | 같음 | – | T 우위 · 한글 금액 · 통화 · 단위 | – | Trellis가 낫다 |
| Field · `Stepper` | 식 우위 · 단추 48, 값 바뀜을 `aria-live`로 읽음 | 같음 | – | 같음 · tabular · 단위 | – | 식자재 ERP이 낫다 → QuantityInput 단추를 touch 밀도 · 손가락 입력에서 칸 높이 정사각(44 이상)으로, ± 단추로 바뀐 값을 `aria-live`로 읽힌다 |
| Field · `Textarea` | 식 우위 · 16 | – | – | 같음 · 글자 수 | – | 같다. 식 `minLength` "N자 이상" 안내는 ReasonDialog에서 쓴다 |
| Field · `FormField` | – | 같음 | – | – | – | Trellis가 낫다 |
| Select · `Select` | 식 우위 · 16 | T 우위 · 아래 시트(D-60) | 식 우위 · 옵션 0개 문구 | – | – | 식자재 ERP이 낫다(작음) → Select `size` xs · xl, 옵션 0개 문구(messages `select.empty`). 나머지는 Trellis가 낫다 |
| Filter · `FilterCard` | – | T 우위 · 640 미만 시트 · 식 1열 | 식 우위 · 검색 단추 스피너 · 접힘 요약 칩 | – | – | 식자재 ERP이 낫다(작음) → FilterBar grid에 `searching`(검색 단추 로딩), `collapsible`(접으면 적용 조건을 칩으로 요약) |
| Filter · `FilterRow` | – | 같음 · 1024 미만 한 줄에 한 칸 | – | – | – | 같다 |
| Filter · `DateInput` | 식 우위 · 16 | T 우위 · 시트 | T 우위 · 범위 밖 문구 | 같음 · tabular | – | Trellis가 낫다 |
| Filter · `DateRange` | – | T 우위 · 시트 | 식 우위 · `maxDays` 경고 · `noFuture` | 같음 | – | 식자재 ERP이 낫다(작음) → PeriodPicker `maxDays`(넘으면 경고만, 적용은 막지 않음) · `max`(미래일 막기). 부가세 기수 같은 프리셋은 Trellis가 낫다 |
| MobileFilter · `FilterBar` | 식 우위 · 칩 44 | 식 우위 · 조건마다 칩이 가로로 흐르고 값이 보인다 · T "필터 N" 단추 하나 | – | 같음 · 바뀐 조건 수 | – | 식자재 ERP이 낫다 → FilterBar 좁은 화면에서도 label 칩 줄을 가로 스크롤로 남기고(칩마다 그 조건 시트), 앞에 "필터 N" 단추를 둔다 |
| MobileFilter · `FilterChip` | 식 우위 · 해제 단추 44 | 식 우위 | – | – | – | 식자재 ERP이 낫다 → 기본값이 아닌 칩에 해제 단추(그 조건만 기본값으로, 이름 "<이름> 해제") |
| MobileFilter · `FilterSheet` | 식 우위 · 선택지 칩 44 | 식 우위 · 선택지를 칩 묶음으로 바로 펼친다 · T 시트 안 Select가 시트를 하나 더 연다 | 같음 · "N건 보기" | 같음 · 선택지 옆 건수 | – | 식자재 ERP이 낫다 → 시트 안 Select · MultiSelect는 옵션이 적으면 칩 묶음(radio · checkbox 역할, 손가락 크기)으로 바로 펼친다 |
| MobileFilter · `Calendar` | 같음 · 칸 44 / 48 | 같음 · 시트 | – | 같음 · tabular | – | Trellis가 낫다. 일 빨강 · 토 파랑은 들이지 않는다(MonthCalendar 금지 사항). 식 `marks`(일정 있는 날 점)는 필요하면 요청 |
| MobileFilter · `DateSheet` | 같음 | 같음 · 시트(D-60) | – | – | – | 같다 |
| MobileFilter · `DateRangeSheet` | 같음 | 같음 · 시트 | 식 우위 · "N일 적용" · 기간 경고 | – | – | 같다. 기간 경고는 PeriodPicker `maxDays`로 |
| Data · `StatTile` | – | T 우위 · 휴대폰 두 열(D-61) | 식 우위 · 오류 · 다시 시도 | T 우위 · 서식 5종 · %p · 금융 색 | 식 우위 · `masked` 자물쇠 · 가림 글자 · 이유 | 식자재 ERP이 낫다 → KpiCard `error` · `onRetry` · `masked`. 작은 크기 `size="sm"`은 선택(kit `MiniStat` 대체) |
| Data · `BulkActionBar` | – | 같음 | – | 같음 · 선택 수 · 합계 | – | 같다. 블록이 ActionBar `summary`로 "N건 선택 · 합계"를 보인다 |
| Data · `Timeline` | – | – | – | 식 시각 고정폭 | – | Trellis가 낫다(tone · actor · description). 고정폭 시각은 mono 토큰 뒤 |
| Data · `Steps` | – | T 우위 · 세로 | – | – | – | Trellis가 낫다 |
| Data · `Avatar` | – | – | – | – | – | Trellis가 낫다 |
| Number · `Num` | – | – | – | 같음 · 천 단위 · U+2212 · tabular · 단위는 머리에 | – | Trellis가 낫다. 음수 주황 대신 금융 색 규칙 |
| Number · `Trend` | – | – | – | 식 우위 · 표 칸 · 카드 어디서나 쓰는 증감 | – | 식자재 ERP이 낫다 → 새 컴포넌트 `Delta`(contract · spec 먼저). KpiCard 증감을 꺼내 DataGrid 칸 · Card에서 같이 쓴다. 색은 KpiCard `polarity` 규칙 그대로 |
| Table · `DataTable` | T 우위 · 휴대폰 카드 | T 우위 · 카드(D-61) · 식 가로 스크롤 + 낮은 우선순위 열 숨김 | 식 우위 · 오류(요청 ID · 다시 시도) · 권한 없음 · 오프라인 · 빈 상태 2종 | 같음 · 오른쪽 · tabular · 머리 "(원)" | – | 식자재 ERP이 낫다 → DataGrid `error`(메시지 · 요청 ID · 다시 시도), 빈 상태는 EmptyState `kind`(검색 결과 없음 · 데이터 없음). 1024~1279 낮은 우선순위 열 숨김(`column.priority`)은 선택 |
| Table · `TotalCell` | – | T 우위 · 카드 합계 | – | T 우위 · 자동 합계, 잎 행만 | – | Trellis가 낫다 |
| Table · `Cell2` | – | 같음 | – | – | – | 같다 |
| Table · `Pagination` | – | T 우위 · 휴대폰 "3 / 12" | – | 같음 · 건수 tabular | – | Trellis가 낫다 |
| Table · `Toolbar` | – | 같음 | – | 같음 · 건수 | – | 같다 |
| Grid · `EditGrid` | – | T 우위 · 카드 · 식 고정 블록 줄임 | 식 우위 · 스켈레톤 · 빈 · 오류 · 다시 시도 | 같음 · 오른쪽 · tabular | – | 식자재 ERP이 낫다 → DataGrid 키보드 칸 이동(방향키 · Home · End · PageUp · PageDown · F2, 한 글자 j · k는 넣지 않음), 열 묶음 머리(`groups` + `column.group`), 저장 전 칸 표시(`isDirty`), 행 찾아가기(`scrollToKey` · `flashKey`). 왼쪽 2px 막대 · 행 바탕 `rowTone`은 들이지 않는다(D-57) |
| Grid · `NumberCell` | – | – | 같음 · 범위 밖 오류 | 같음 · 원 · % | – | 같다. 식은 범위 밖 값도 받아 두고 표시하고 Trellis는 `validate`가 막는다. 물려받은 값 회색 표시(`inheritedHint`)는 필요하면 요청 |
| Grid · `SelectCell` | – | – | – | – | – | 같다 |
| Grid · `DerivedAmount` | – | – | – | 같음 · 부호 · 산식 툴팁 | – | 가져오지 않음. DataGrid `render` + Tooltip 조합으로 충분하다 |
| Ledger · `LedgerCard` | – | – | 식 우위 · 금액 자리 스켈레톤 · 계산 중 · 최신 시각 · 오류 + 다시 계산 | 식 우위 · + · − · = 기호 줄 · 합계 줄 · 단위 | – | 없음 → 새 컴포넌트 `AmountBreakdown`(contract · spec 먼저). 견적 · 정산 · 급여 합계가 어디서 왔는지 보인다. 지금 고치는 줄은 바탕 한 단계(왼쪽 띠 없음) |
| Diff · `DiffTable` | – | – | 식 우위 · 0건 문구 · "외 N건" | 같음 · 숫자 콤마 | – | 없음 → 새 컴포넌트 `ChangeDiff`(contract · spec 먼저). 마스터 · 결재 문서 수정 이력 · 저장 확인에서 "이전 → 이후"를 보인다. 목록 모양은 mono 토큰 뒤 |
| Issues · `IssueList` | – | – | 식 우위 · 스켈레톤 · 0건 문구 | 같음 · 항목별 건수 | – | 없음 → 새 컴포넌트 `IssueList`(contract · spec 먼저). 저장 전 검증의 오류 · 경고 목록이다. 폼 제출 오류 모음인 ErrorSummary와 역할을 나눈다 |
| Feedback · `Skeleton` | – | 같음 | T 우위 · list · table · kpi · card 모양, 늦게 나타남 | – | – | Trellis가 낫다 |
| Feedback · `EmptyState` | – | 같음 | 식 우위 · 데이터 없음 · 검색 결과 없음 · 오류 · 권한 없음 · 오프라인 기본 문구, 오류는 `role="alert"` + 요청 ID | – | – | 식자재 ERP이 낫다 → EmptyState `kind`(empty · noResult · error · forbidden · offline) · `requestId`. 기본 문구는 messages 사전. spec의 "오류는 Banner" 문장도 고친다 |
| Feedback · `ErrorState` | – | – | 식 우위 · 오류 객체 → 상태 블록 | – | – | 없음 → 새 컴포넌트를 만들지 않고 EmptyState `kind`에 흡수한다. DataGrid · KpiCard · ChartCard가 같은 블록을 쓴다 |
| Feedback · `Banner` | – | – | – | – | – | Trellis가 낫다. 틴트 바탕 · 상태색 테두리는 들이지 않는다(D-56 · D-90) |
| Feedback · `ProgressBar` | – | – | – | 같음 · % tabular | – | 같다 |
| Feedback · `Kbd` | – | – | – | 식 고정폭 | – | 가져오지 않음. 키 글자는 Menu · CommandPalette가 그린다. 문장 안 키 표기가 필요해지면 요청 |
| Toast · `toast` | T 우위 · 밀어서 닫기 | T 우위 · 아래 고정 줄 위로 올림 | 식 우위 · 오류는 직접 닫을 때까지 · 동작 있으면 10초 · 같은 제목은 ×N | – | – | 식자재 ERP이 낫다 → danger 기본은 직접 닫을 때까지(지금 4초), action이 있으면 10초, 앱 설정 표시 시간, 같은 제목은 ×N으로 센다 |
| Tooltip · `Tooltip` | 같음 · 터치에서 안 뜬다 | – | – | – | – | 같다 |
| Spinner · `Spinner` | – | – | 식 우위 · 움직임 줄이기에도 진행이 보인다 · T 멈춘 고리 | – | – | 식자재 ERP이 낫다 → 움직임 줄이기에서 Spinner의 대체 깜빡임이 `duration.pulse`(0ms)를 써서 멈춘다. 0이 되지 않는 시간 토큰을 더하거나 Spinner만 회전을 남긴다 |
| Overlay · `Modal` | – | 같음 | – | – | – | 같다. 식 `footerNote`(하단 왼쪽 안내)는 Dialog `footer`로 조립한다 |
| Overlay · `ConfirmModal` | – | 같음 | 같음 · 확인 로딩 | – | – | 같다 |
| Overlay · `ReasonModal` | – | – | 식 우위 · 사유 최소 글자 전 확인 꺼짐 | 같음 · 글자 수 | – | 식자재 ERP이 낫다 → 새 컴포넌트 `ReasonDialog`(contract · spec 먼저). 앞뒤 공백을 뺀 사유가 `minLength`에 닿기 전엔 확인이 꺼지고 버튼으로만 닫힌다. 반려 · 회수 · 삭제 · 가림 풀기가 같이 쓴다 |
| Overlay · `Drawer` | 식 우위 · footer 안전 영역 | 같음 · 휴대폰 전폭 | – | – | – | 식자재 ERP이 낫다 → Drawer `onPrev` · `onNext`(머리 단추 + ← → 키, 입력 칸 안에선 무시), footer 아래 `env(safe-area-inset-bottom)` |
| Overlay · `Sheet` | 식 우위 · 닫기 44 · 끌어내려 닫기 · T 고르는 시트 닫기 sm | 같음 | – | – | – | 식자재 ERP이 낫다 → Drawer `side="bottom"`을 `_internal/sheet` 모양(손잡이 · 쓸어 닫기 · 높이 auto · full)으로 맞추고 닫기 단추를 손가락 크기로. 공개 Sheet는 새로 만들지 않는다 |
| Overlay · `Menu` | 같음 | T 우위 · 시트(PR-10) | – | – | – | 식자재 ERP이 낫다(작음) → Menu 항목 `disabledReason`(Button과 같은 규칙). 나머지는 Trellis가 낫다 |
| Page · `Page` | – | 같음 · 여백이 구간마다 바뀐다 | – | – | – | 같다. 본문 너비 설정은 2절 공통 항목으로 |
| Page · `PageHeader` | 식 우위 · 뒤로 48 · T IconButton md | T 우위 · 1024 미만 actions 내림 | – | – | – | Trellis가 낫다(siblings · tabs · meta). 휴대폰 뒤로 단추 크기는 ScreenHeader 줄에서 |
| Page · `Card` · `CardHeader` | – | 같음 | – | 식 제목 옆 건수 | – | 같다 |
| Page · `KV` | – | T 우위 · 640 미만 1열 | – | – | – | Trellis가 낫다 |
| Page · `Section` | – | – | – | – | – | 같다 |
| App · `AppShell` | 식 우위 · 메뉴 줄 44 · T 손가락 태블릿에서 32 | 같음 · 식 탭 · 레일 · 메뉴 / T 탭바 · 덮개 · 접힘 64 | T 우위 · `busy` 진행 줄 · 틀 스켈레톤 | T 우위 · 건수는 숫자 글자 | – | Trellis가 낫다. 600~1023 레일은 `sidebarCollapsed`로 화면이 고른다. 손가락 태블릿의 메뉴 줄 높이는 5.1의 2번에서 |
| App · `ScreenHeader` · `Screen` | 식 우위 · 뒤로 48 · 아래 고정 줄 안전 영역 · 꼭 누를 실행 56 | 같음 | – | – | – | 식자재 ERP이 낫다 → 휴대폰 PageHeader 뒤로 단추를 손가락 크기로, ActionBar `sticky`에 안전 영역, touch 주요 실행은 lg(56) + `fullWidth` |
| App · `SplitView` | – | 식 폰 한 칸 · 넓으면 두 칸 | – | – | – | 가져오지 않음. Trellis 상세는 Drawer(넓은 화면) · 아래 시트(휴대폰)로 연다(ListDetail 패턴) |
| Tabs · `Tabs` | – | T 우위 · 넘치는 쪽 흐림 | – | 같음 · 건수 · 99+ | – | Trellis가 낫다 |
| Tabs · `Segmented` | – | 같음 | – | T 우위 · 건수 | – | Trellis가 낫다 |
| Tabs · `PillTabs` | – | 같음 · 칸 똑같이 나눔 | – | 같음 · 건수 | – | 같다 |
| Charts · `ChartCard` | – | 같음 | 같음 · 스켈레톤 · 흐리게 다시 불러오기 · 오류 + 다시 시도 · T 빈 문구 | 같음 · 표 숫자 오른쪽 | – | Trellis가 낫다 |
| Charts · `Legend` | – | – | – | – | – | 같다 |
| Charts · `TrendChart` | – | 같음 · 폭 100% | – | 같음 · 천 단위 · 축 글자 | – | 같다. 축 글자 배율은 글자 크기 모드에서 |
| Charts · `ComboChart` | – | 같음 | – | 같음 | – | 같다. 둘 다 이중 축을 쓰지 않는다 |
| Charts · `WaterfallChart` | – | 같음 | – | 같음 · 증감 부호 | – | 같다. 색은 Trellis 규칙. 식 `from`(축 시작 올림 + 물결 표시)은 요청 후보 |
| Charts · `BarList` | – | 같음 | – | 같음 · 끝 값 | – | 식자재 ERP이 낫다(작음) → BarList `onBarPress`(막대가 단추, Tab · Enter) · `extremes`(최고 · 최저만 값) |
| Charts · `ShareList` | – | – | – | 같음 | – | 가져오지 않음. BarList `layout="horizontal"` + `showValues`로 같은 질문에 답한다 |
| Charts · `Donut` | – | 같음 | – | 같음 · 가운데 비율 | – | 같다. 숫자 확인은 표로 보기가 맡는다 |
| Charts · `AnimatedNumber` | – | – | – | 식 세어 올림 | – | Trellis가 낫다. 숫자를 세어 올리지 않는다(components.md §8). 가져오지 않음 |
| Charts · `Sparkline` | – | – | – | – | – | 같다 |
| Charts · `SegmentedBar` | – | 같음 | – | 같음 · 비율 | – | 같다. 범례 잘림은 backlog 요청에 있다 |
| Charts · `RadialMeter` | – | – | – | 같음 · 가운데 값 | – | 같다 |
| Charts · `CalendarHeatmap` | – | 같음 · 달력 · 연간 | – | – | – | 같다 |
| Gauges · `BulletBar` | – | – | – | 식 우위 · `targetLabel` · `showRatio` | – | 식자재 ERP이 낫다(작음) → BulletBar `targetLabel`(평균과 견줄 때) · `showRatio` |
| Gauges · `DataBar` | – | – | – | 같음 | – | 같다. sm 열 값 잘림은 backlog 요청에 있다 |
| Gauges · `HeatCell` | – | – | – | 같음 | – | 같다 |
| ModuleIcon · `ModuleIcon` | – | – | – | – | – | 가져오지 않음. 식자재 ERP 그림은 외부 아이콘팩 원본을 고친 것이라 타사 자산 금지 규칙에 걸린다. Trellis ModuleIcon(`modules.json`)을 쓴다 |
| Privacy · `MaskField` | – | 같음 · 시트에선 sm 단추 | 같음 · 해제 로딩 | 같음 · 연락처 하이픈 | 식 우위 · 사유 → 60초 원문 → 저절로 다시 가림, 남은 시간, 복사, 권한 없음 자물쇠 · T `revealed` 켜고 끄기만 | 식자재 ERP이 낫다 → 새 컴포넌트 `MaskedValue`(contract · spec 먼저). 가린 값 + 보기 단추, `onReveal`(Promise), `revealSeconds`, 복사, `canReveal=false`면 자물쇠 + 이유. 사유 입력은 ReasonDialog. 가림 함수 `maskPhone` · `maskName` · `maskAddress`를 `_shared/format.ts`에 더한다 |
| status · 톤 맵(`ORDER_TONE` 등) | – | – | – | – | – | 가져오지 않음(업무 조각). 상태 → 톤은 `vocab.ts` 어휘가 정한다 |
| status · `OrderStatusChip` · `StatusChip` | – | – | – | – | – | 가져오지 않음(업무 조각). 결재 상태는 Trellis 5개(기안 · 진행 · 승인 · 반려 · 회수) |
| kit · `GRID_TABLE` | – | – | – | – | – | 같다 |
| kit · `useBranchMap` | – | – | – | – | – | 가져오지 않음(업무 데이터) |
| kit · `ActionBar` | 같음 · 둘 다 안전 영역 없음 | 같음 | – | 같음 · 요약 | – | 같다. 안전 영역은 2절 공통 항목으로 |
| kit · `ApprovalPanel` | – | – | – | – | – | 가져오지 않음(업무 조각). 상태 어휘(요청 · 승인 · 반려 · 만료)와 틴트 패널은 결재 5상태 · D-56이 이긴다. ApprovalLine + Badge + DueBadge + ReasonDialog로 조립한다 |
| kit · `ApprovalStatusLine` | – | – | – | – | – | 가져오지 않음(업무 조각) |
| kit · `WizardSteps` | – | – | – | – | – | Trellis가 낫다 |
| kit · `AgingBar` | – | – | – | 같음 · 구간 비율 | – | 가져오지 않음(업무 조각). SegmentedBar thin + 범례로 조립한다. 크기 막대에 위험 색을 쓰지 않는다(차트 규칙) |
| kit · `FieldRows` | – | 같음 | – | – | – | Trellis가 낫다 |
| kit · `MiniStat` | – | – | – | 같음 · tabular · 음수 색 | – | 식자재 ERP이 낫다(작음) → KpiCard `size="sm"`(StatTile 줄과 같은 작업) |
| kit · `When` | – | – | – | 같음 · MM-DD HH:mm | – | 가져오지 않음. `formatDate`로 충분하다 |
| kit · `DateField` | 식 우위 · 16 | T 우위 · 시트 | – | 같음 · ISO | – | Trellis가 낫다 |

## 5. 고칠 목록

"식자재 ERP이 낫다"인 항목을 모았다. 토큰 · CSS 단계의 공통 항목을 먼저 두고, 그다음 컴포넌트별로 묶었다. 크기는 S(한 세션 안) · M(한 세션) · L(두 세션 이상)이다. 새 컴포넌트는 contract와 spec이 먼저다.

### 5.1 공통 항목

1. **컨트롤 크기 xs · xl.** `_base.ts`의 `Size`를 `'xs' | 'sm' | 'md' | 'lg' | 'xl'`로 넓히고 Size를 쓰는 contract의 `values`를 고친다. Button · IconButton · Input · AmountInput · QuantityInput · MaskedInput · CodeSearch · DateField · PeriodPicker · Select · MultiSelect · ScanField · Tabs가 대상이다. RadialMeter도 `Size`를 쓰지만 컨트롤 높이가 아니라 지름이라 자기 타입으로 뗀다. 컴포넌트 CSS에 `data-size` xs · xl을 더하고 VRT를 다시 찍는다. 밀도 토큰은 병행 작업이 바꾼다. contract 변경 있음. L.
2. **손가락 입력 누르는 영역 확장.** `@media (pointer: coarse)`에서 `data-size` xs · sm 단추의 `::after`를 넓힌다(1024 이상 36 · 미만 44). 대상은 Button · IconButton · Pagination 번호 · 시트 닫기 · 칩 해제 단추다. 44 · 36에 맞는 크기 토큰 이름이 필요하다(사람 승인). Trellis 밀도는 폭으로만 바뀌어 640 이상 손가락 태블릿은 compact(행 32)다. SideNav 줄 · DataGrid 행처럼 밀도 행 높이를 쓰는 것도 작아서, `(pointer: coarse)`에서 루트 밀도를 comfortable로 올리는 안을 같이 본다. contract 변경 없음. M.
3. **손가락 입력 입력 칸 16px.** `tokens/sd/formats/css.mjs`가 `@media (pointer: coarse)` 블록에 `--tl-density-input-font-size: 16px`(touch 값)을 낸다. 밀도와 관계없이 태블릿 · 폴드에서도 확대가 막힌다. contract 변경 없음. S.
4. **글자 크기 모드.** backlog `data-text-size` 줄을 플랜 작업으로 옮긴다. 배율(식자재 ERP 1.125 · 1.25, backlog 1.15 · 1.3)과 이름을 정한다. 20~24 제목은 절반만, 28 이상 큰 숫자는 그대로 두는 규칙을 같이 들인다. 차트 축 글자도 따른다. TrellisProvider `textSize` prop을 더한다. D-97이 `data-font-scale` 112 · 125 토큰을 맡으면 남는 것은 Provider prop · 차트 축 글자 · VRT다. contract 변경 있음. L.
5. **고대비 모드.** backlog `data-contrast` 줄을 플랜 작업으로 옮긴다. 식자재 ERP처럼 placeholder 불투명 · 고른 글자 반전 · 포커스 색 진하게를 넣고 토큰 테스트에 7:1을 더한다. 값은 사람이 승인한다. TrellisProvider `contrast` prop. D-97이 `data-contrast="high"` 색 토큰을 맡으면 남는 것은 컴포넌트 쪽 규칙과 Provider prop이다. contract 변경 있음. M.
6. **포커스 강조 모드.** `[data-focus="strong"]`에서 링 3px · 간격 2. 입력 칸은 감싸개 둘레(`:has(input:focus-visible)`), Menu · Select 옵션 하이라이트는 안쪽 링. `_internal/focus.css` 한 곳. TrellisProvider `focusRing` prop. contract 변경 있음. S.
7. **링크 밑줄 모드.** `[data-links="underline"]`에서 `fg.link` 글자(DataGrid link 열 · Toast action · 링크)를 늘 밑줄. TrellisProvider `linkUnderline` prop. contract 변경 있음. S.
8. **고정폭 글꼴 토큰.** `font.family.mono` + `type.mono-*`를 더한다. D-97은 시스템 고정폭만 쓰고 글꼴 파일을 번들하지 않아 외부 네트워크 0이 지켜진다. 남는 것은 `type.mono-*`와 쓰는 곳이다. Input `mono`(새 prop) · Timeline 시각 · ChangeDiff 목록 · 코드 열. 토큰 추가는 사람 승인. contract 변경 있음(Input). M.
9. **안전 영역.** ActionBar `sticky`와 Drawer footer(`side="bottom"` · 휴대폰 전폭)에 `env(safe-area-inset-bottom)`을 더한다. contract 변경 없음. S.
10. **Spinner 움직임 줄이기.** `Spinner.css`의 reduce 규칙은 깜빡임을 `duration.pulse`로 거는데 reduce에서 그 값이 0이라 고리가 멈춘다. `data-motion="reduce"`도 같다. 0이 되지 않는 시간 토큰(예: `duration.essential`)을 더하거나 Spinner 회전만 남긴다. 토큰 추가는 사람 승인. contract 변경 없음. S.
11. **본문 너비 설정(선택).** `[data-content-width]` 1280 · 1440 · 1600 · 전체를 블록 `Page`에 건다. contract 변경 없음. S.
12. **문서 한 줄.** `packages/contracts/src/charts/README.md`의 "다크 · 색각 친화 팔레트는 토큰이 처리" 문장은 지금 커밋에선 사실이 아니다. D-97의 `data-chart="cvd"`가 들어오면 그 모드를 가리키게 고치고, 들어오지 않으면 "기본 팔레트가 CVD 인접쌍 검증을 통과했다"로 고친다. S.

### 5.2 컴포넌트별

**Button · Menu**

13. `disabledReason`을 더한다. 권한 없음 같은 비활성 이유를 포인터에는 툴팁, 화면 낭독기에는 `aria-describedby`로 알린다. 비활성인 동안에도 포커스가 닿게 `aria-disabled`를 쓴다. Menu 항목에도 같은 이름으로. contract 변경 있음(`ButtonProps.disabledReason` · `MenuActionItem.disabledReason`). S.

**IconButton**

14. 이름을 `title` 대신 Tooltip으로 보인다. 키보드 포커스에도 뜬다. contract 변경 없음. S.

**Switch**

15. `size`에 `lg`(48×28)를 더하고 touch 밀도에서 기본으로 쓴다. contract 변경 있음(values). S.

**QuantityInput**

16. touch 밀도 · 손가락 입력에서 ± 단추를 칸 높이 정사각(44 이상)으로 키운다. ± 단추로 바뀐 값을 `aria-live="polite"`로 읽힌다. contract 변경 없음. S.

**Select**

17. 옵션이 0개면 "선택할 항목이 없습니다"를 보인다(messages `select.empty`, ko · en). MultiSelect도 같다. contract 변경 없음. S.

**FilterBar**

18. 좁은 화면에서도 label 칩 줄을 가로 스크롤로 남긴다. 칩마다 그 조건 시트를 열고 앞에 "필터 N" 단추를 둔다. 칩 높이는 touch 손가락 크기. contract 변경 없음(spec 동작 절). M.
19. 기본값이 아닌 칩에 해제 단추를 둔다. 해제 방식을 정해야 한다. 안은 칩 컨트롤이 `onChange(null)`을 받는 규약이나 FilterBar `onClearFilter(name)`다. contract 변경 있음. M.
20. 시트 안 Select · MultiSelect는 옵션이 적으면(기준 값은 spec에서 정한다) 칩 묶음(radio · checkbox 역할, 손가락 크기)으로 바로 펼친다. 시트 위에 시트를 하나 더 열지 않는다. contract 변경 없음. M.
21. grid 모양에 `searching`(검색 단추 로딩)과 `collapsible`(접으면 적용 조건을 칩으로 요약)을 더한다. contract 변경 있음. S.

**PeriodPicker**

22. `maxDays`(넘으면 경고 문구, 적용은 막지 않음) · `max`(이 날 뒤는 못 고름)를 더한다. 시트 footer에 "N일"을 보인다. contract 변경 있음. S.

**KpiCard**

23. `error` + `onRetry`(값 자리에 "불러오지 못함" · 다시 시도), `masked`(값 대신 가림 글자 + 이유 한 줄), `size="sm"`(드로어 머리 작은 지표)을 더한다. 오류 블록 문구는 EmptyState `kind="error"`와 같은 사전을 쓴다. contract 변경 있음. M.

**Delta (새 컴포넌트)**

24. KpiCard 안 증감을 `Delta`로 꺼낸다. props는 `value` · `format`(percent · point · amount · number) · `polarity`(finance · up-good · up-bad) · `label`(비교 대상)이다. KpiCard는 이것을 쓰고 DataGrid 칸 · Card에서도 쓴다. contract · spec 먼저. M.

**DataGrid**

25. `error`(메시지 · 요청 ID · `onRetry`)를 더하고 빈 상태를 EmptyState `kind`로 그린다(검색 결과 없음 · 데이터 없음). 카드 모양에도 같은 블록. contract 변경 있음. M.
26. 키보드 칸 이동. 편집 칸이 있는 표는 방향키 · Home · End · PageUp · PageDown으로 칸을 옮기고 Enter · F2로 편집, Tab으로 다음 편집 칸에 간다. 한 글자 키(j · k)는 넣지 않는다. roving tabindex + `aria-rowindex` · `aria-colindex`. contract 변경 있음(keyboard 목록). L.
27. 열 묶음 머리 `groups`(key · header · sticky) + `column.group`. contract 변경 있음. M.
28. 저장 전 칸 표시 `isDirty(row, key)` + `dirtyHint`. 왼쪽 띠는 쓰지 않는다(D-57). 표시 모양(칸 모서리 점 또는 글자 굵기)은 spec에서 정한다. 행 찾아가기 `scrollToKey` · `flashKey`(1초 바탕 한 단계). contract 변경 있음. S.
29. 선택. `column.priority: 'low'`면 1024~1279에서 숨긴다. contract 변경 있음. S.

**AmountBreakdown (새 컴포넌트)**

30. "항목 + 항목 − 항목 = 합계" 줄 목록. rows(`key` · `label` · `value` · `op` · `hint`) · `activeKey`(바탕 한 단계) · `loading`(금액 자리 Skeleton) · `status`(계산 중 · 최신 시각 · 오류 + 다시 계산) · `unit`. 금액은 `formatAmount`(U+2212), 합계 줄은 위 선 + 큰 글자, 기호는 숨은 글자 "더하기 · 빼기"로 읽힌다. contract · spec 먼저. M.

**ChangeDiff (새 컴포넌트)**

31. 필드별 "이전 → 이후" 비교. `rows`(target · field · before · after) · `layout`(table · list) · `maxRows`("외 N건") · `empty`. 이전 값은 취소선 + `fg.tertiary`, 화살표는 숨은 글자 "에서". list 모양은 mono 토큰(5.1의 8번) 뒤. 값을 만드는 `diffFields`는 contracts `_shared`에. contract · spec 먼저. M.

**IssueList (새 컴포넌트)**

32. 저장 전 검증의 오류 · 경고 목록. 항목은 `id` · `level`(error · warning) · `tag` · `title` · `message`. 오류가 먼저이고 단계는 아이콘 모양 + 숨은 글자로도 구분한다. `onSelect`(그 행으로) · `onDetail` · `loading`(Skeleton) · `empty` 문구 · `maxHeight`. 항목별 걸러 보기는 화면이 SegmentedControl로 붙인다. ErrorSummary는 폼 제출 오류용으로 남긴다. contract · spec 먼저. M.

**EmptyState**

33. `kind`(empty · noResult · error · forbidden · offline)를 더한다. 종류마다 기본 아이콘 · 제목 · 설명을 messages 사전에 두고, error는 `role="alert"` + `requestId` 한 줄을 보인다. spec의 "오류는 Banner" 문장을 고친다. 식자재 ERP `ErrorState`(오류 객체 → 블록)는 따로 만들지 않고 이것으로 흡수한다. contract 변경 있음. M.

**Toast**

34. danger 기본 `duration`을 0(직접 닫을 때까지)으로, action이 있으면 10초로 바꾼다. 앱 설정 표시 시간 `TrellisProvider toastDuration`(기본 · 길게 · 직접 닫기)을 더한다(WCAG 2.2.1). 같은 제목 · 같은 tone이 다시 오면 새로 쌓지 않고 ×N으로 센다. contract 변경 있음(TrellisProvider). M.

**ReasonDialog (새 컴포넌트)**

35. 사유를 받는 확인 창. `title` · `description` · `confirmLabel` · `minLength`(앞뒤 공백 제외) · `maxLength` · `tone` · `note`(하단 안내 한 줄) · `onConfirm(reason)` · `loading`. 사유가 모자라면 확인이 꺼지고, Esc · 바깥 누름으로 닫히지 않는다. 결재 반려 · 회수, 삭제, 가림 풀기가 쓴다. ApprovalFlow 패턴 문서를 이것으로 고친다. contract · spec 먼저. M.

**Drawer**

36. `onPrev` · `onNext`(+ 이름)를 더한다. 머리에 이전 · 다음 단추를 두고 ← → 키를 잇는다. 입력 칸 안에서는 키를 무시한다. contract 변경 있음. M.
37. `side="bottom"`을 `_internal/sheet` 모양(손잡이 · 쓸어 닫기 · 높이 auto · full)으로 맞춘다. 시트 닫기 단추는 손가락 크기(touch sm이 44가 된 뒤 다시 확인). contract 변경 없음(spec 동작 절). M.

**PageHeader**

38. 휴대폰(touch)에서 뒤로 단추를 lg 손가락 크기로 키운다. ActionBar sticky 안전 영역은 5.1의 9번. contract 변경 없음. S.

**BarList**

39. `onBarPress`(막대가 단추가 되어 Tab · Enter로 그 목록에 간다, role이 바뀐다) · `extremes`(최고 · 최저 막대만 값 글자). contract 변경 있음. S.

**BulletBar**

40. `targetLabel`(목표가 아닌 기준과 견줄 때 "평균 9.1%") · `showRatio`(오른쪽 비율 끄기). contract 변경 있음. S.

**MaskedValue (새 컴포넌트) · 가림 함수**

41. 가린 값을 보이고 사유 확인 뒤 잠깐 원문을 보인다. props는 `value`(가린 글자) · `onReveal`(Promise로 원문) · `revealSeconds`(기본 60, 끝나면 다시 가림 · 남은 시간 글자) · `copyable` · `canReveal`(false면 자물쇠 + 이유) · `label`이다. 사유 입력은 ReasonDialog, 권한 확인 · 기록은 앱이 한다. HrRecord의 주민등록번호 · 계좌번호도 이것으로 바꾼다. contract · spec 먼저. M.
42. `maskPhone` · `maskName` · `maskAddress`를 contracts `_shared/format.ts`에 더한다(지금은 `formatRrn` · `maskAccount`뿐). 테스트 동봉. S.

## 6. 가져오지 않는 것

- 업무 조각은 `status.tsx` 톤 맵 · 상태 칩, kit `ApprovalPanel` · `ApprovalStatusLine` · `AgingBar` · `useBranchMap`이다.
- Trellis 규칙이 이기는 것은 사이드바 건수 알약 · 틴트 배너 · 틴트 승인 패널 · 편집 칸 왼쪽 2px 막대 · 행 바탕 tone(D-56 · D-57 · D-90)이다. 음수 주황 · 증감 초록 빨강 · 워터폴 positive negative 색 · 달력 일 빨강 토 파랑 · 숫자 세어 올리기도 들이지 않는다.
- 모양만 다른 것은 Button variant dark · link · brand-outline, ShareList, SplitView, DerivedAmount, Kbd, When이다.
- 자산 규칙에 걸리는 것은 식자재 ERP ModuleIcon 그림이다.

## 7. 처리 결과(2026-11-10, PR-30)

5절 42항목을 모두 처리했다. 결정은 D-100. 확인 명령은 `docs/plan/09-pre-release.md` PR-30 상태 줄.

| 항목 | 처리 |
|---|---|
| 1 크기 xs · xl | 완료. `SIZES` 5단계, 컨트롤 13종 contract · CSS, RadialMeter 자기 타입 |
| 2 손가락 누르는 영역 | 완료(`_internal/a11y-modes.css`). 손가락 태블릿 루트 밀도 comfortable 안은 들이지 않았다(D-100) |
| 3 입력 칸 16px | 완료. tokens.css `@media (pointer: coarse)` |
| 4 글자 크기 모드 | 완료. 토큰 `data-font-scale`(D-97) + Provider `fontScale`. 차트 축은 type.caption 토큰이라 같이 커진다 |
| 5 고대비 | 완료. 토큰 세트(D-97) + 자리 표시 · 고른 글자 규칙 + Provider `contrast` |
| 6 포커스 강조 | 완료. 링 3px + border.focusStrong, 입력 칸 감싸개 · 목록 줄 안쪽 링, Provider `focusRing` |
| 7 링크 밑줄 | 완료. Provider `linkUnderline` |
| 8 고정폭 | 완료. `font.family.mono` · `type.mono` + Input `mono` |
| 9 안전 영역 | 완료. ActionBar sticky · Drawer footer |
| 10 Spinner | 완료. `duration.essential` |
| 11 본문 너비 | 완료. 블록 Page 와이드 1600 + `data-content-width`, Provider `contentWidth` |
| 12 문서 한 줄 | 완료. 차트 README가 `data-chart="cvd"`를 가리킨다 |
| 13 disabledReason | 완료(Button · Menu) |
| 14 IconButton 이름 | 완료(Tooltip) |
| 15 Switch lg | 완료. touch에서 크기를 안 주면 lg |
| 16 QuantityInput | 완료 |
| 17 Select 빈 목록 | 완료(Select · MultiSelect) |
| 18~21 FilterBar | 완료. 좁은 화면 칩 줄 · `onClearFilter` · 시트 안 칩 묶음 · `searching` · `collapsible` |
| 22 PeriodPicker | 완료. `max` · `maxDays` |
| 23 KpiCard | 완료. `error` · `onRetry` · `masked` · `size="sm"` |
| 24 Delta | 완료(새 컴포넌트) |
| 25~29 DataGrid | 완료. `error` · `filtered` · 키보드 칸 이동 · `groups` · `isDirty` · `scrollToKey` · `flashKey` · `priority` |
| 30 AmountBreakdown | 완료(새 컴포넌트) |
| 31 ChangeDiff | 완료(새 컴포넌트, `diffFields`) |
| 32 IssueList | 완료(새 컴포넌트) |
| 33 EmptyState kind | 완료 |
| 34 Toast | 완료. Provider `toastDuration`까지 |
| 35 ReasonDialog | 완료(새 컴포넌트). ApprovalFlow 패턴 문서를 고쳤다. 블록 결재 문서 화면을 바꾸는 일은 범위 밖(블록은 깨지지 않는지만) |
| 36 · 37 Drawer | 완료 |
| 38 PageHeader | 완료 |
| 39 BarList | 완료 |
| 40 BulletBar | 완료. 좁은 칸에서 비율 열이 넘치던 것을 데모 검사가 잡아 고쳤다 |
| 41 MaskedValue | 완료(새 컴포넌트). HrRecord가 쓴다(`onRevealField`) |
| 42 가림 함수 | 완료. `maskPhone` · `maskName` · `maskAddress` |
