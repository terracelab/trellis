# 식자재 ERP 토큰 → Trellis 대응표 — 2026-11-10

작성: PR-28 세션(에이전트). 승인: Patrick(2026-11-10, 이 작업 범위의 원본 값 · 테마 계산 규칙). 결정: D-97 · D-98 · D-99.
원본(읽기만): 식자재 ERP 리뉴얼 저장소의 `packages/ui/styles/tokens.css` · `theme.css`. 생성기(`packages/ui/scripts/tokens.mjs`)는 가져오지 않았다. 값만 옮기고 빌드는 Trellis Style Dictionary가 한다.

## 읽는 법

- **(a)** 같은 뜻의 Trellis 토큰이 있다 → 값을 바꿨다(또는 이미 같은 값).
- **(b)** Trellis에 없다 → 새 semantic · primitive 토큰을 더했다(이름 lock은 추가만, NAMES.lock 82개 추가 · 0개 삭제).
- **(c)** 가져오지 않았다 → 이유를 적었다.
- **회사 색**: 회사 메인 색 하나로 엔진(`packages/tokens/theme`)이 다시 계산한다. **고정**: 회사 색과 무관하다.
- Trellis 값 열은 라이트 / 다크. 회사 색 토큰은 기본 테마(createTheme('#FE5C2B'))의 값이다.

semantic 색 69개: (a) 47 · (b) 6 · (c) 16.

## 1. Primitive 색

| 식자재 ERP | 값 | 분류 | Trellis | 회사 색 / 고정 | 메모 |
|---|---|---|---|---|---|
| `--cook-orange-50~700` | #fff7f3 · #fff2ed · #ffe5da · #ffb294 · #ff6a3d · #fe5c2b · #eb5020 · #c6370b | (a) | `color.brand.50~950` | 회사 색 | 500 = #FE5C2B 그대로. 나머지 단계는 엔진이 OKLCH로 만든다(50 #FFF2EE ≈ orange-100, 600 #CC3A00 ≈ orange-700 #C6370B와 ΔEOK 1.4). 600은 "흰 글자 5:1을 넘는 가장 밝은 같은 색상"(D-98) |
| `--cook-gray-50~900` · `gray-75` | #f7f7f8 · #fafafa · #f3f4f6 · #e5e7eb · #d1d5db · #9ca3af · #6b7280 · #4b5563 · #374151 · #1f2937 · #111827 | (a) | `color.neutral.50~950` | 고정 | 앵커로 그대로(scales.config.json). 500은 식자재 ERP fg-muted 보정값 #646B78, 950은 #030712. gray-75(#FAFAFA)는 50과 ΔEOK 0.9라 뺐다 |
| 다크 무채색(#141414 · #1c1c1e · #232326 · #2c2c2f · #3a3a3d · #4a4a4e · #6e6e73 · #8e8e93 · #9a9a9a · #a6a6a6 · #d4d4d4 · #f2f2f2) | semantic 다크 값 | (b) | `color.graphite.50~950` | 고정 | 새 hue. 식자재 ERP 다크는 무채색이라 Trellis neutral(푸른 기)로는 맞지 않는다. #8E8E93은 #9A9A9A로, #D4D4D4는 #DCDCDC(본문 12:1)로 합쳤다 |
| `--cook-cocoa-100~975` | #e7e2dd · #bdb5ae · #4a4341 · #3a3330 · #342e2b · #2a2522 · #241f1d | (b) | `color.shell.100~950` | 회사 색 | 새 그룹(엔진 생성물). L은 코코아 단계, 색상은 회사 색, 채도는 회사 색 채도 × 0.053. 주황이면 코코아와 ΔEOK 0.17(라이트 면) · 0.38(다크 면) |
| `--cook-blue-50~900` | #e8f0fb · #7aa7f5 · #2563eb · #1d4ed8 · #1e40af · #1c2840 | (c) | `color.blue.50~950` | 고정 | 지출 · 정보 · 차트 첫 계열은 지금 Trellis 파랑을 그대로 쓴다(PR-28 전 brand 단계를 blue로 옮김). 식자재 ERP 파랑과 600 기준 ΔEOK 2.4 |
| `--cook-red-50~900` · `green-*` · `amber-*` · `teal-*` · `violet-*` | 상태 · 차트 원색 | (c) | `color.red · green · amber · teal · violet` | 고정 | 상태 · 금융 · 결재 · 모듈 · 차트 색은 고정 토큰이라 Trellis 값(대비 · dataviz 검증 통과)을 유지. 새 값을 원하면 확인 질문 4 |

## 2. Semantic 색(라이트 · 다크)

| 식자재 ERP | 라이트 / 다크 | 분류 | Trellis | Trellis 값 | 회사 색 / 고정 | 메모 |
|---|---|---|---|---|---|---|
| `--cook-bg-canvas` | #f3f4f6 / #141414 | (a) | `color.bg.canvas` | #F3F4F6 / #141414 | 고정 | 정한 것 3 A: 회색 canvas(D-92 흰 canvas 대체) |
| `--cook-bg-surface` | #ffffff / #1c1c1e | (a) | `color.bg.surface` | #FFFFFF / #1C1C1E | 고정 |  |
| `--cook-bg-subtle` | #f7f7f8 / #232326 | (a) | `color.bg.sunken` | #F7F7F8 / #232326 | 고정 | 면 안 옅은 칸 · 행 가리킴 · 표 머리 |
| `--cook-bg-muted` | #f3f4f6 / #2c2c2f | (a) | `color.bg.canvas` | #F3F4F6 / #141414 | 고정 | 같은 값(#F3F4F6). 다크 #2C2C2F는 bg.elevated |
| `--cook-bg-total` | #fafafa / #232326 | (a) | `color.bg.sunken` | #F7F7F8 / #232326 | 고정 | 합계 행. #FAFAFA와 #F7F7F8은 ΔEOK 0.9라 sunken 하나로 |
| `--cook-bg-row-hover` | #f7f7f8 / #232326 | (a) | `color.bg.sunken` | #F7F7F8 / #232326 | 고정 |  |
| `--cook-bg-row-selected` | #fff7f3 / #3c2722 | (b) | `color.bg.rowSelected` | #FF886714 / #FF886729 | 회사 색 | 새 토큰. 라이트 alpha.brand.8, 다크 alpha.brand.16 |
| `--cook-bg-brand` | #fe5c2b / #ff6a3d | (a) | `color.brand.default` | #CC3A00 / #CC3A00 | 회사 색 | 정한 것 1 A: 흰 글자 4.5 미달이면 같은 색상에서 600(흰 글자 5:1)으로. 주황 → #CC3A00 |
| `--cook-bg-brand-pressed` | #eb5020 / #fe5c2b | (a) | `color.brand.hover · active` | #A22C00 / #A22C00 | 회사 색 | 가리킴 700 · 누름 800 |
| `--cook-bg-brand-tint` | #fff2ed / #3c2722 | (a) | `color.brand.subtle` | #FFF2EE / #FF886729 | 회사 색 | 선택 바탕(브랜드 글자를 얹는다). 50 단계 |
| `--cook-bg-neutral-button` | #6b7280 / #4b5563 | (c) | – |  | 고정 | 회색 단추 바탕. Trellis secondary 단추는 테두리형이라 쓰지 않는다 |
| `--cook-bg-danger` | #d03b3b / #d03b3b | (a) | `color.status.danger.default` | #C7313A / #F67270 | 고정 | Trellis red.600 유지(#C7313A) |
| `--cook-bg-sidebar` | #3a3330 / #2a2522 | (a) | `color.bg.nav` | #3A3331 / #2B2422 | 회사 색 | 정한 것 2 A: 회사 색상 저채도 짙은 톤(D-91 대체). 주황 → #3A3331(코코아와 ΔEOK 0.17) |
| `--cook-bg-sidebar-active` | #4a4341 / #3a3330 | (a) | `color.nav.selected` | #4A4341 / #3A3331 | 회사 색 | shell.700(L 0.389) |
| `--cook-bg-sidebar-sub` | #342e2b / #241f1d | (b) | `color.nav.sub` | #352E2C / #251E1D | 회사 색 | 새 토큰. 하위 메뉴 묶음 면 |
| `--cook-bg-inverse` | #111827 / #f3f4f6 | (c) | – |  | 고정 | 뒤집힌 면(툴팁). Trellis Tooltip은 fg.primary 바탕 + fg.inverse를 쓴다 |
| `--cook-bg-backdrop` | rgba(0, 0, 0, 0.4) / rgba(0, 0, 0, 0.6) | (a) | `color.bg.overlay` | #00000066 / #00000099 | 고정 | 검정 40% · 다크 60%(새 primitive alpha.black.40 · 60) |
| `--cook-bg-disabled` | #f3f4f6 / #2c2c2f | (c) | – |  | 고정 | Trellis는 비활성을 투명도 + fg.disabled로 표시한다(상태 어휘 7개) |
| `--cook-fg-strong` | #111827 / #f2f2f2 | (b) | `color.fg.strong` | #111827 / #F2F2F2 | 고정 | 새 토큰. 제목 · 강조 값 |
| `--cook-fg-default` | #1f2937 / #d4d4d4 | (a) | `color.fg.primary` | #1F2937 / #DCDCDC | 고정 | 본문. 다크 #D4D4D4는 12:1 미달(11.5)이라 #DCDCDC |
| `--cook-fg-body` | #374151 / #d4d4d4 | (a) | `color.fg.secondary` | #374151 / #A6A6A6 | 고정 | 보조 글자(D-89: 흐리지 않게) |
| `--cook-fg-subtle` | #4b5563 / #a6a6a6 | (a) | `color.fg.secondary` | #374151 / #A6A6A6 | 고정 | #4B5563. secondary(700)와 tertiary(500) 사이라 secondary로 모은다 |
| `--cook-fg-muted` | #646b78 / #9a9a9a | (a) | `color.fg.tertiary` | #646B78 / #9A9A9A | 고정 | #646B78 = neutral.500(식자재 ERP 보정값을 앵커로) |
| `--cook-fg-placeholder` | #6b7280 / #8e8e93 | (a) | `color.fg.tertiary` | #646B78 / #9A9A9A | 고정 | #6B7280 → #646B78(ΔEOK 2.5) |
| `--cook-fg-disabled` | #9ca3af / #6e6e73 | (a) | `color.fg.disabled` | #9CA3AF / #6E6E73 | 고정 |  |
| `--cook-fg-on-brand` | #ffffff / #ffffff | (a) | `color.brand.onBrand` | #FFFFFF / #FFFFFF | 회사 색 | 흰 글자(규칙 A). 규칙 B면 짙은 글자일 수 있다 |
| `--cook-fg-on-inverse` | #ffffff / #111827 | (a) | `color.fg.inverse` | #FFFFFF / #111827 | 고정 |  |
| `--cook-fg-brand` | #fe5c2b / #ff6a3d | (b) | `color.brand.accent` | #FE5C2B / #FE5C2B | 회사 색 | 새 토큰. 입력 색 그대로(진행 막대 · 로고 · 선택 점), 면 위 3:1 |
| `--cook-fg-brand-strong` | #c6370b / #ff6a3d | (a) | `color.fg.link` | #CC3A00 / #FF8867 | 회사 색 | 브랜드 글자 · 링크. 면 · 바탕 · 선택 바탕 위 4.5 |
| `--cook-fg-link` | #1d4ed8 / #7aa7f5 | (a) | `color.fg.link` | #CC3A00 / #FF8867 | 회사 색 | 식자재 ERP 링크는 파랑이지만 정한 것대로 회사 색을 따른다 |
| `--cook-fg-link-hover` | #1e40af / #7aa7f5 | (c) | – |  | 회사 색 | Trellis 링크 가리킴은 밑줄(색 변화 없음) |
| `--cook-fg-sidebar` | #e7e2dd / #e7e2dd | (a) | `color.nav.fg` | #EAE1DE / #EAE1DE | 회사 색 | shell.100 |
| `--cook-fg-sidebar-sub` | #bdb5ae / #bdb5ae | (a) | `color.nav.fgMuted` | #BDB4B2 / #BDB4B2 | 회사 색 | shell.300 |
| `--cook-fg-negative` | #c6370b / #ffb294 | (c) | – |  | 고정 | 음수 주황. 금융색 규칙(수입 빨강 · 지출 파랑)이 이긴다(정한 것) |
| `--cook-fg-positive` | #166534 / #4cd07a | (c) | – |  | 고정 | 양수 초록. 금융색 규칙이 이긴다. 성공 표시는 status.success |
| `--cook-fg-danger` | #b91c1c / #f26b6b | (a) | `color.status.danger.default` | #C7313A / #F67270 | 고정 | 글자 대비는 Trellis 값 유지 |
| `--cook-border-default` | #d1d5db / #4a4a4e | (a) | `color.border.strong` | #D1D5DB / #4A4A4E | 고정 | 입력 칸 테두리(#D1D5DB) |
| `--cook-border-subtle` | #e5e7eb / #3a3a3d | (a) | `color.border.default · divider` | #E5E7EB / #3A3A3D | 고정 | 카드 · 표 테두리 · 구분선(#E5E7EB) |
| `--cook-border-strong` | #9ca3af / #4a4a4e | (b) | `color.border.hover` |  | 고정 | 새 토큰(PR-30에서 (c) → (b)). 입력 칸을 가리켰을 때. 입력 칸 테두리를 border.strong(#D1D5DB)으로 올리면서 가리킴 단계가 따로 필요했다 |
| `--cook-border-brand` | #fe5c2b / #ff6a3d | (a) | `color.border.selected` | #CC3A00 / #FF8867 | 회사 색 | 선택 테두리 · 탭 밑줄. 면 · 바탕 위 3:1 |
| `--cook-border-focus` | #fe5c2b / #ff6a3d | (a) | `color.border.focus` | #CC3A00 / #FF8867 | 회사 색 | 포커스 링. 회색 canvas 위 #FE5C2B는 2.81이라 600 |
| `--cook-border-error` | #d03b3b / #f26b6b | (a) | `color.status.danger.default` | #C7313A / #F67270 | 고정 |  |
| `--cook-border-sidebar` | rgba(255, 255, 255, 0.06) / rgba(255, 255, 255, 0.06) | (a) | `color.nav.border` | #423A38 / #332C2A | 회사 색 | 흰 6% → 불투명 shell.750 |
| `--cook-border-focus-strong` | #c6370b / #ffb294 | (b) | `color.border.focusStrong` | #A22C00 / #FFB39D | 회사 색 | 새 토큰. 포커스 강조 · 고대비. 4.5:1 |
| `--cook-fg-logo` | #eb5020 / #ff6a3d | (a) | `color.brand.accent` | #FE5C2B / #FE5C2B | 회사 색 | 로고는 입력 색 그대로(큰 글자 3:1) |
| `--cook-status-success-bg` | #e6f6ea / #15301f | (a) | `color.status.success.subtle` | #EEF8F0 / #5AB57729 | 고정 | Trellis green.50 유지 |
| `--cook-status-success-fg` | #166534 / #4cd07a | (a) | `color.status.success.default` | #008543 / #5AB577 | 고정 | Trellis green.600 유지 |
| `--cook-status-warning-bg` | #fff2ed / #3c2722 | (c) | – |  | 고정 | 식자재 ERP 경고는 주황(브랜드와 같은 색). 회사 색과 섞이지 않게 Trellis 호박색(amber) 유지 |
| `--cook-status-warning-fg` | #c6370b / #ffb294 | (c) | – |  | 고정 | 같은 이유 |
| `--cook-status-error-bg` | #fde8e8 / #3a1f1f | (a) | `color.status.danger.subtle` | #FFF2F0 / #F6727029 | 고정 |  |
| `--cook-status-error-fg` | #b91c1c / #f26b6b | (a) | `color.status.danger.default` | #C7313A / #F67270 | 고정 |  |
| `--cook-status-info-bg` | #e8f0fb / #1c2840 | (a) | `color.status.info.subtle` | #F0F5FF / #5F91FF29 | 고정 | 고정 파랑(blue.50) |
| `--cook-status-info-fg` | #1e40af / #7aa7f5 | (a) | `color.status.info.default` | #1F56E2 / #5F91FF | 고정 | 고정 파랑(blue.600) |
| `--cook-status-neutral-bg` | #f3f4f6 / #2c2c2f | (a) | `color.approval.draft.subtle` | #F3F4F6 / #2C2C2F | 고정 | 회색 배지 = 기안 배지 바탕 |
| `--cook-status-neutral-fg` | #4b5563 / #a6a6a6 | (a) | `color.approval.draft.text` | #374151 / #DCDCDC | 고정 |  |
| `--cook-status-pending-bg` | #fdf0d5 / #3b2a10 | (a) | `color.approval.pending.subtle` | #FCF4EA / #221200 | 고정 |  |
| `--cook-status-pending-fg` | #92400e / #fbbf24 | (a) | `color.approval.pending.text` | #734A00 / #FBB85C | 고정 |  |
| `--cook-chart-series-1` | #fe5c2b / #ef5b2d | (c) | `color.chart.series.1` | #2F6BFF / #5F91FF | 고정 | 식자재 ERP 1계열은 주황(브랜드). 차트는 고정이라 Trellis 파랑(blue.500) 유지 — 회사 색과 차트 색이 섞이지 않게 |
| `--cook-chart-series-2` | #0e9f8e / #06a997 | (c) | `color.chart.series.2` | #1F9D55 / #1F9D55 | 고정 | Trellis dataviz 검증 팔레트 유지(notes/chart-palette-2026-11.md) |
| `--cook-chart-series-3` | #2563eb / #547fca | (c) | `color.chart.series.3` | #7C5CFF / #9486FF | 고정 | 같은 이유 |
| `--cook-chart-series-4` | #d97706 / #b88a05 | (c) | `color.chart.series.4` | #1BA3A3 / #1BA3A3 | 고정 | 같은 이유 |
| `--cook-chart-series-5` | #7c3aed / #987ce9 | (c) | `color.chart.series.5` | #CD8600 / #F5A524 | 고정 | 같은 이유 |
| `--cook-chart-series-6` | #9ca3af / #9a9a9a | (a) | `color.chart.compare` | #9CA3AF / #9A9A9A | 고정 | 회색 비교 계열 |
| `--cook-chart-muted` | #ffb294 / #c6370b | (c) | – |  | 고정 | 옅은 주황 막대. 차트는 회사 색을 쓰지 않는다 |
| `--cook-chart-track` | #ffe5da / #3c2722 | (a) | `color.chart.track` | #F3F4F6 / #2C2C2F | 고정 | 식자재 ERP은 옅은 주황. 고정 회색(neutral.100) |
| `--cook-chart-grid` | #e5e7eb / #3a3a3d | (a) | `color.chart.grid` | #E5E7EB / #3A3A3D | 고정 | #E5E7EB = neutral.200 |
| `--cook-chart-axis` | #6b7280 / #9a9a9a | (a) | `color.chart.axis` | #646B78 / #9A9A9A | 고정 |  |
| `--cook-chart-positive` | #166534 / #4cd07a | (c) | – |  | 고정 | 차트 증감은 finance.income · expense(금융색 규칙) |
| `--cook-chart-negative` | #b91c1c / #f26b6b | (c) | – |  | 고정 | 같은 이유 |

Trellis에만 있고 식자재 ERP에 없는 semantic(avatar.* · approval.* 5상태 · module.* · chart.heat · finance.*)은 그대로 둔다. 파랑을 쓰던 것(status.info · finance.expense · module.erp · chart.series.1 · chart.heat · avatar.1)은 primitive `brand` 대신 `blue`를 가리키게 옮겼다(값은 그대로). 다크에서 neutral을 가리키던 approval.draft · withdrawn · finance.neutral · module.mes · chart 회색은 graphite로 옮겼다.

## 3. 고대비 · 색각 친화 차트

| 식자재 ERP | 분류 | Trellis | 회사 색 / 고정 | 메모 |
|---|---|---|---|---|
| `:root[data-contrast="high"]`(34개) | (b) | `[data-contrast="high"]` + `semantic/color.hc-light.json`(42개) | 회사 색 21 · 고정 21 | 새 토큰 세트. 회사 색 토큰은 엔진이 글자 7:1 · 선 4.5:1로 다시 고른다(주 버튼 700, 링크 800). 회색 글자 · 선 한 단계 진하게, 상태 · 금융 · 결재 글자 · 차트 격자 한 단계 진하게 |
| `:root[data-theme="dark"][data-contrast="high"]`(41개) | (b) | `semantic/color.hc-dark.json`(42개) | 회사 색 21 · 고정 21 | 다크는 한 단계 밝게. 수입 빨강은 400 유지(300이면 지출 파랑과 색차 19로 20 미만) |
| `--cook-fg-sidebar` 고대비 #fff · `bg-sidebar-active` 고대비 = 브랜드 | (a) | `color.nav.fg` · `nav.selected` | 회사 색 | 고대비 사이드바: 글자 흰색, 지금 화면 = 고대비 주 버튼 색, 포커스 흰색 |
| `:root[data-chart="cvd"]` · 다크(Okabe–Ito 계열) | (b) | `[data-chart="cvd"]` + `semantic/chart.cvd-{light,dark}.json`, primitive `color.cvd.*` | 고정 | 계열 1~5 = 주홍 · 파랑 · 주황 · 하늘 · 자주, 비교 = 회색. 식자재 ERP 값 그대로. muted · track · positive · negative는 Trellis에 없어 뺐다 |

## 4. 간격 · 반경 · 크기 · 레이아웃 · 그림자 · 글꼴

| 식자재 ERP | 값 | 분류 | Trellis | 메모(전부 고정) |
|---|---|---|---|---|
| `--cook-space-0~48` | 0 2 4 6 8 10 12 14 16 18 20 24 28 32 40 48 | (a) · (b) | `space.*` | 0 4 8 12 16 20 24 32 40 48은 같다. 2 · 6 · 10 · 14 · 18 · 28을 더했다 |
| `--cook-radius-none · sm · md · lg · xl · pill` | 0 4 6 8 12 999 | (a) | `radius.xs 4 · sm 6 · md 8 · lg 12 · full` | 값이 같다(이름만 한 칸씩 다르다). 컴포넌트별 반경은 PR-30 대조표에서 본다 |
| `--cook-size-control-xs · sm · md · lg · xl` | 26 30 36 42 48 | (a) · (b) | `density.control.height.{xs,sm,md,lg,xl}` | 정한 것 5 A. xs · xl은 새 키. compact · comfortable 같은 값, touch 44 · 44 · 48 · 56 · 56 |
| `--cook-size-row` · `row-dense` | 40 · 36 | (a) | `density.row.height` | comfortable 40 · compact 36. 두 줄 행 heightTall 48 · 56 · 64 |
| `--cook-size-touch · control-xl · touch-main` | 44 · 48 · 56 | (b) | `size.touch.{min,control,main}` | 손가락 크기 |
| `--cook-size-header · sidebar · sidebar-rail · nav-item · nav-sub · filter-label · header-mobile · tabbar · rail · split-list* · modal-* · drawer` | 64 236 64 48 40 150 56 62 80 360/400 420/640/960 560 | (c) | – | 앱 틀 · 컴포넌트 치수는 Trellis 값을 쓴다(블록 · 서비스가 쓰는 화면 폭 구간과 묶여 있다). 컴포넌트 차이는 PR-30 대조표 |
| `--cook-breakpoint-fold · tablet · desktop · wide` | 600 1024 1280 1920 | (c) · (b) | `breakpoint.*` 유지 · `layout.wide.minWidth` 1920 | 정한 것: 화면 폭 구간은 Trellis 유지, 와이드만 더한다 |
| `--cook-layout-content-max`(와이드 1600) | 1140 · 1600 | (b) | `layout.content.maxWidthWide` 1600 | 와이드 본문 최대 폭 |
| `--cook-layout-content-padding · section-gap · card-gap · kpi-columns · filter-cols`(구간별) | 32/20/16 · 18 · 16 · 5/3/2 · 2/1 | (c) | `layout.gutter.*` · `density.gutter` 유지 | 화면 폭 구간과 함께 Trellis 유지(정한 것) |
| `--cook-shadow-sm · md · lg` | 0 1 3 · 0 4 12 · 0 8 24, 검정 6 · 8 · 10% | (a) | `shadow.sm · md · lg` | 두 겹 → 한 겹. 다크는 Trellis `_internal/elevation.css`가 선으로 바꾼다(식자재 ERP 다크 1px 테두리와 같은 방식) |
| `--cook-shadow-toast` | 0 8 24 12% | (c) | `shadow.lg` | lg(10%)와 거의 같다 |
| `--cook-font-sans` | Pretendard Variable … | (a) | `font.family.sans` | 같다(번들 서체) |
| `--cook-font-mono` | IBM Plex Mono, ui-monospace … | (b) | `font.family.mono` | 시스템 고정폭만. IBM Plex Mono는 번들하지 않는다(외부 네트워크 0) |

## 5. 글자 스타일(theme.css)

정한 것 4 A: 식자재 ERP 크기 · 굵기 600(D-92의 700 대체). 자간은 Trellis 값(−0.01em, D-55: 음수 자간 −0.02em은 AI 인상).

| 식자재 ERP | 크기/행간 · 굵기 | 분류 | Trellis | 메모 |
|---|---|---|---|---|
| `t-display-34` | 34/34 600 | (c) | – | KPI 큰 숫자 3곳. display(28)로 충분 |
| `t-display-28` | 28/28 600 | (a) | `type.display` 28/34 600 | 행간 34(홈 인사말이 두 줄이 되어도 겹치지 않게) |
| `t-display-20` | 20/24 600 | (a) | `type.amountLg` 20/24 600 | KPI 금액 |
| `t-title-24` | 24/31 600 | (a) | `type.h1` 24/31 600 | 화면 제목(28 · 700에서) |
| `t-title-22` | 22/28 600 | (c) | – | 모바일 화면 제목. h1과 2px 차이라 h1 하나로 |
| `t-heading-18` | 18/24 600 | (a) | `type.h2` 18/24 600 | 대화상자 · 서랍 제목(20 · 700에서) |
| `t-heading-16` | 16/21 600 | (a) | `type.h3` 16/21 600 | 섹션 · 카드 제목 |
| `t-heading-15` | 15/20 600 | (b) | `type.h4` | 작은 카드 · 패널 제목 |
| `t-body-14` | 14/21 | (a) | `type.body` · comfortable `density.body` | |
| `t-body-13` | 13/20 | (a) | `type.label`(500) · compact `density.body` | |
| `t-caption-12` | 12/18 | (a) | `type.caption` | |
| `t-micro-11` | 11/16 | (b) | `type.micro` | |
| `t-mono-12` · `t-mono-11` | 12/16 · 11/14 | (b) · (c) | `type.mono` 12/16 | 11은 mono 12로 |
| `t-wordmark-*` | 800 | (c) | – | 로고 글자는 회사 자산이라 토큰에 두지 않는다 |
| `num` | tabular-nums | (a) | `font.numeric` · `tl-amount` | 같다 |

## 6. 접근성 모드 · 손가락 입력(theme.css)

| 식자재 ERP | 분류 | Trellis | 메모 |
|---|---|---|---|
| `data-font-scale="112" · "125"` | (b) | tokens.css `[data-font-scale]` 블록 | type.* · 밀도 본문 · 입력 글자 × 1.125 · 1.25. 20~24px 제목은 절반, 28px 이상은 그대로. 종이는 그대로 |
| `data-contrast="high"` | (b) | 3절 | |
| `data-chart="cvd"` | (b) | 3절 | |
| `data-focus="strong"` | (b) | `border.width.3` · `border.focusStrong` + `_internal/focus.css` | 링 3px + 진한 색. CSS 규칙은 PR-30 |
| `data-motion="reduce"` | (a) | 이미 있다(R-33) | 토큰이 모든 시간을 0으로 |
| `data-links="underline"` | (b) | PR-30 | 링크 밑줄 항상 |
| `data-content-width` | (b) | PR-30 | 본문 최대 폭 설정 |
| 손가락 기기 xs · sm 단추 누르는 영역 36 · 44 | (b) | PR-30(`size.touch.min`) | |
| 손가락 기기 입력 칸 16px | (b) | PR-30 | 지금은 휴대폰(640 미만)에서만 16 |
| 창 제목 줄(Window Controls Overlay) | (c) | – | 설치 앱 전용, 디자인 시스템 범위 밖 |

## 7. 대비 때문에 값을 바꾼 쌍(확인 질문 2)

| 쌍 | 원본 값 | 대비 | 바꾼 값 | 대비 |
|---|---|---:|---|---:|
| 주 버튼 흰 글자 / 바탕 | #FE5C2B | 3.10 | brand.600 #CC3A00(정한 것 1 A) | 5.03 |
| 링크 · 브랜드 글자 / 회색 canvas | #C6370B(brand-strong) | 4.83 | brand.600 #CC3A00 | 4.57 |
| 포커스 링 · 선택 테두리 · 탭 밑줄 / 회색 canvas | #FE5C2B | 2.81 | brand.600 #CC3A00 | 4.57 |
| 다크 본문 / 면 | #D4D4D4 / #1C1C1E | 11.5 | graphite.100 #DCDCDC | 12.4 |
| 다크 흐린 글자 / 팝업 면 | #8E8E93 / #2C2C2F | 4.27 | graphite.300 #9A9A9A | 4.95 |
| 종이 표 안쪽 선 / 종이 | neutral.400 #9CA3AF(새 회색) | 2.54 | neutral.500 #646B78 | 5.30 |
| 고대비 다크 수입 · 지출 색차 | red.300 · blue.300 | ΔE 19 | 수입 red.400 · 지출 blue.300 | ΔE 24.8 |
