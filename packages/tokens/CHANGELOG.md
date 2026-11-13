# @terracelab/trellis-tokens

## 1.0.0

### Major Changes

- 1.0.0. 첫 공개 버전이다. 0.x 미리보기를 마친다. 이후 토큰 이름과 컴포넌트 props의 변경 · 삭제는 major 버전에서만 하고 자동 변환 스크립트를 함께 낸다

### Minor Changes

- 접근성 모드 · 손가락 입력(D-97, 식자재 ERP): TrellisProvider `fontScale` · `contrast` · `focusRing` · `linkUnderline` · `chartPalette` · `motion` · `contentWidth`가 `data-font-scale` · `data-contrast` · `data-focus` · `data-links` · `data-chart` · `data-motion` · `data-content-width`를 건다. 포커스 강조는 링 3px + border.focusStrong(입력 칸은 감싸개 둘레, 목록 줄은 안쪽 링), 링크 밑줄 항상, 고대비 자리 표시 · 고른 글자. 손가락 입력 기기에서 xs · sm 단추의 누르는 영역이 36(1024 이상) · 44로 넓어지고 입력 칸 글자는 폭과 관계없이 16px. Spinner는 움직임 줄이기에서도 돈다(새 토큰 `duration.essential`). 블록 Page는 와이드(1920 이상)에서 본문 1600 · 가운데, 본문 너비 설정을 따른다.
- 결재 배지 글자 전용 토큰 `approval.*.text`를 더했다(라이트 neutral.700 · amber.800 · green.700 · red.600 · neutral.600, 다크 각 400 · 기안 neutral.300 · 회수 neutral.400). 배지 점은 `approval.*.default` 그대로다(D-64). 대비 테스트가 전부 통과한다
- 승인된 토큰 값(2026-11-08, D-55): 라이트 `brand.default · hover · active`를 brand.600 · 700 · 800으로(주 버튼의 흰 글자 대비 4.49 → 6.0:1). `type.display · h1` 굵기 700 → 600, `type.h3` 자간 −0.01em → 0.
- 차트 전용 semantic 색 16종 추가(`color.chart.series.1~5` · `compare` · `grid` · `axis` · `track` · `heat.1~5` · `heatInk`). 전부 primitive alias, Light/Dark, dataviz 검증기 통과(`docs/plan/notes/chart-palette-2026-11.md`). 값은 가안.
- 컴포넌트가 회사 색 토큰을 따른다(D-97): 탭 밑줄 · 지금 탭 글자는 회사 색(border.selected · fg.link), 진행 막대 · 상단 진행 줄은 강조(brand.accent), 표 선택 행은 bg.rowSelected, 사이드바 하위 메뉴는 nav.sub 면 · nav.fgMuted 글자, 제목 · KPI 값은 fg.strong. 입력 칸 테두리는 쉴 때 border.strong · 가리킬 때 새 토큰 border.hover(식자재 ERP 입력 칸). 화면 글자 굵기는 600이 상한(종이 서식 제외).
- 식자재 ERP 리뉴얼 토큰 이식(D-97). 회사 색 `brand`는 테마 엔진이 만든다(기본 #FE5C2B, 주 버튼 #CC3A00). 파랑을 쓰던 지출 · 정보 · 차트 첫 계열 · 모듈 erp · 아바타 1은 새 primitive `blue`(값 그대로)로 옮겼다. 식자재 ERP 회색(neutral 앵커) · 다크 무채색 `graphite` · 사이드바 톤 `shell` · 색각 친화 `cvd`. 회색 canvas + 흰 surface, 제목 600(h1 24 · h2 18 · h3 16 · 새 h4 15 · micro 11 · mono 12), 컨트롤 xs 26 · sm 30 · md 36 · lg 42 · xl 48(새 xs · xl), 표 36 · 40, touch 44 · 48 · 56, 식자재 ERP 그림자 · 간격 2 · 6 · 10 · 14 · 18 · 28 · size.touch · border.width.3 · 와이드 레이아웃 · font.family.mono. 새 semantic brand.tint · brand.accent · bg.rowSelected · fg.strong · border.focusStrong · nav.sub. 새 모드: 고대비 `data-contrast="high"` · 색각 친화 차트 `data-chart="cvd"` · 글자 크기 `data-font-scale="112|125"`. 이름은 추가만(82개).

  회사 테마 엔진(D-98 · D-99): 회사 메인 색 하나 → 회사 색 토큰 21개 × 라이트 · 다크 · 고대비 2. 역할별 대비로 단계를 고르고 이유를 남기며, 위험 · 수입 · 성공 · 경고 · 지출 · 정보 · 차트 첫 계열과 ΔEOK 9 미만이면 경고와 대안을 준다. `buttonText: 'input'`(입력 색 바탕) 규칙, `themeCss(theme, { scope })` 범위 지정, `gen-theme --button-text`, 기본 테마 생성기 `gen:theme`.
- 다크 테마의 테두리를 한 단계 밝게 했고(border.default neutral.700 · border.strong neutral.600), 선택 · 배지 · 모듈 바탕(brand · status · module의 subtle)을 950 단계 대신 400 단계 16% 알파(새 primitive `color.alpha.<색>.16`)로 바꿨다(D-62). 다크 링크 · 선택 글자(fg.link)는 brand.300으로 밝아졌다. 회사 테마 생성기도 같은 규칙을 쓴다. touch 밀도의 컨트롤 sm 높이가 32에서 40이 됐다
- `dist/figma/variables.json`: Semantic 모드 4개(Light · Dark · HC Light · HC Dark), Company 컬렉션(회사 색 토큰 21개 × 엔진 모드 4, 모드 = 회사 색 프리셋 8개). Semantic의 회사 색 토큰은 Company 변수를 가리켜 Figma에서 Company 모드만 바꾸면 회사 색이 바뀐다.
- `dist/figma/variables.json`의 Primitives에 `layout/*` 9개(글로벌 바 · 사이드바 · 본문 폭 · 거터 · 최소 폭)를 더했다. Figma에서 AppShell 치수를 변수에 묶는다. 변수는 483개다. `z` · `breakpoint`는 그대로 올리지 않는다(D-118).
- SegmentedBar 범례는 좁으면 금액 · 비율을 다음 줄로(이름을 자르지 않는다), DataBar는 좁은 열에서 막대가 먼저 준다(값 글자는 남는다), Radio 누르는 자리 24 이상. 기기 설정 고대비(`prefers-contrast: more`)가 `data-contrast`가 없을 때 고대비 토큰을 켠다(tokens.css · 회사 테마 theme.css 둘 다).
- 새 컴포넌트 Paper: A4 · A5 종이 서식을 화면에서 미리 보고 브라우저 인쇄(PDF로 저장)로 내보낸다. 서식 조각 PaperTitle · PaperFields · PaperMoneyTable · PaperText · PaperSignature · PaperSignPair · PaperSeal, 부모 폭에 맞춰 줄이는 PaperPreview, 종이만 인쇄하는 printPapers · usePrintPapers(파일 이름 · 글꼴과 직인 이미지 대기 · 인쇄 뒤 정리). 새 토큰 `paper.*`(종이 색 · 그림자 · A4 · A5 크기 · 여백, 테마와 무관, 값은 승인 대기 D-67)가 CSS · TS · 네이티브 · Figma 산출물에 들어간다.
- 새 토큰 `paper.type.*`(display · h1 · h2 · h3 · body · label · caption의 글자 크기 · 행간, 단위 pt). 종이 서식 글자를 앱의 `type.*`와 떼어 놓는다. 앱이 글자 크기 모드로 `type.*`를 키워도 인쇄물은 그대로다(서비스 요청 R-35). 처음 값은 지금 화면 크기와 같다(10.5pt = 14px). 값은 승인 대기(D-77). CSS · 웹 TS는 pt 그대로, 네이티브 · Figma는 pt × 96 / 72의 px 숫자다.
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
- 접근성 · LineItemsEditor 후속(서비스 요청 R-33 · R-34): Card headingLevel(문맥 기본 h2 · 카드 안 h3) · landmark(기본 아님), Dialog · Drawer · 시트 Tab 순환을 keydown에서 바로 + aria-modal, Checkbox 누르는 자리 24, `<html data-motion="reduce">` 토큰 모드. LineItemsEditor Enter가 숨은 입력 · 보조 단추를 건너뛴다(마지막 칸 QuantityInput에서 줄 추가), 읽기 칸 column.tone, addIcon.
- 회사 테마 엔진: 아주 밝은 회사 색에서 흰 글자 규칙이 주 버튼 · 강조를 둘 다 입력 색에서 ΔEOK 15 이상 옮기고 입력 색 바탕 규칙(`buttonText: 'input'`)이 대비 검사를 모두 넘으며 겹침 경고를 늘리지 않으면 `theme.suggestions`로 그 규칙을 제안한다(R-T52, `#FFD400` → 주 버튼 `#856D00` 대신 `#F3CA00` · 짙은 글자). `gen-theme`이 `? …` · `제안: --button-text input`을 찍는다. `gen-theme --refresh --out theme.css`는 파일 첫 줄의 고른 값으로 지금 생성기를 다시 돌린다(R-T53). 기본 토큰 값은 그대로다.
- 토큰 스키마 v0. primitive·semantic(라이트·다크 61종)·density·typography 이름과 구조, 산출물 8종, `NAMES.lock`(251개)을 G1 동결 후보로 확정한다. 값은 가안이며 G2에서 확정한다.
- 휴대폰 밀도 `touch`를 추가했다(행 48 · 컨트롤 32/40/48 · 본문 15/22 · 입력 글자 16). 폭이 640보다 좁으면 루트에 자동으로 적용된다(D-61). 새 토큰 `density.input.fontSize`를 입력 칸이 쓴다. DataGrid는 휴대폰에서 행마다 카드가 되고(`mobile` · `column.mobile`), AppShell은 `tabs`로 아래 탭바를 그리며, KpiCard는 두 열, Tabs는 넘치는 쪽을 흐리게 한다

### Patch Changes

- primitive 색 스케일 생성기(`gen:colors`)와 `src/primitive/color.json` 추가. 7 hue × 11단계(50~950)를 OKLCH로 생성하고 `color.base.white/black`을 포함한다. 값은 가안이다.
- 대비 테스트(WCAG 2.x, 수입·지출 ΔEOK)와 토큰 이름 lock(`NAMES.lock`, 251개) 추가. 라이트 5쌍이 기준 미달이라 값 변경 제안서를 썼고, 값은 승인 전까지 그대로다.
- 린트(no-primitive-token · stylelint)가 PR-28에서 더한 primitive(blue · graphite · shell · cvd)도 막는다.
- G1 토큰 스키마 동결(2026-11-10, Patrick). 이름 lock 검사를 켠다 — 토큰 이름 변경 · 삭제는 major changeset + codemod.
- 문서 · 주석 · 설명 글에서 다른 제품과 서비스 이름을 일반 명칭으로 바꿨습니다. 회색 톤 "기본"의 설명 글이 바뀌었고 토큰 값과 동작은 그대로입니다.
- Pretendard Variable v1.3.9 woff2와 OFL 라이선스를 패키지에 포함(`fonts/`). `fonts.css`가 번들 서체를 가리켜 오프라인에서도 같은 서체로 렌더된다.
- tokens.css가 테마마다 `color-scheme`(light · dark)을 넣는다. 다크 테마에서 브라우저 기본 스크롤바 · 컨트롤도 어둡게 그린다. 스크롤바는 테마 색(손잡이 `border.strong`)과 thin 굵기를 따르고, 사이드바 스크롤바는 짙은 면에 맞춘 `nav.hover`(가리키면 `nav.fgMuted`)다. Safari는 기본 그대로다.

  Icon 크기를 `size.icon.16` · `20` · `24` 토큰이 정한다(`data-size`). 앱이 글자 크기 모드에서 이 토큰을 키우면 아이콘도 커진다. 기본 값에서는 화면이 바뀌지 않는다. IconButton 개수 배지는 숫자 글자 크기를 따라 커지고, AppShell 바는 안의 컨트롤이 더 크면 그 높이까지 커진다. 휴대폰 탭은 높이 56이 최소가 됐다.
- 회사별 테마 생성기 `@terracelab/trellis-tokens/theme`(D-58). 브랜드 색 하나와 회색 톤(차가운 · 중립 · 따뜻한)으로 semantic 변수를 덮는 theme.css를 만들고 대비를 잰다. 컬러칩 8개, `gen-theme` 명령. 아이콘에 `palette`를 더했다.
- Style Dictionary 빌드 추가. `tokens.css`(라이트·다크·compact·comfortable 한 파일), `fonts.css`, 웹 TS(`tokens`·`primitives`·`tokenNames`), 네이티브(`themes`·`density`·`primitives`·`typography`), Tailwind v4 preset, Figma `variables.json`, `flat.json`, 토큰 문서를 생성하고 `exports`로 노출한다.
- 토큰 원본 작성: primitive(간격·radius·테두리·그림자·모션·z·breakpoint·layout·size·font·오버레이 알파), semantic 라이트·다크 61종, density 2모드, typography 9스타일, 모듈 레지스트리(modules.json)와 스키마. 그림자·easing 값은 가안(D-21).
- `z.dropdown`을 200에서 450으로 올렸다. Select · Menu · DateField 달력 · Tooltip 팝업이 Drawer · Dialog · 사이드바 덮개 뒤로 깔리던 문제를 고친다(D-63). 토큰 이름은 그대로다
