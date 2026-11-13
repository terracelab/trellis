# 토큰 규격

원본은 `packages/tokens/src/**/*.json`(W3C DTCG 형식: `$value` · `$type` · `$description`)이다. 이 파일들 밖에는 디자인 값이 존재하지 않는다.
3계층: **primitive → semantic → component**. 컴포넌트 코드는 semantic만 참조한다. component 계층 토큰은 Figma에 올리지 않는다.

## 1. 파일 배치

```
packages/tokens/
  src/
    primitive/
      color.json        color.base.{white,black} · color.{blue,neutral,graphite,red,green,amber,violet,teal}.{50,…,950} — gen-color-scale 생성물(고정 색)
      color-brand.json  color.brand.{50,…,950} · color.shell.{100,300,600,700,750,800,850,900,925,950} · color.alpha.brand.{8,16,24} — 테마 엔진 생성물(회사 색, gen:theme, D-98)
      color-alpha.json  color.alpha.{black,blue,neutral,red,green,amber,violet,teal}.* — 오버레이 · 다크 subtle
      color-cvd.json    color.cvd.{vermilion,blue,orange,sky,purple,gray} · color.cvd.dark.* — 색각 친화 차트 원색(D-97)
      space.json        space.{0,2,4,6,8,10,12,14,16,18,20,24,28,32,40,48,64}  (px 값이 키, D-13. 2 · 6 · 10 · 14 · 18 · 28은 식자재 ERP, D-97)
      radius.json       radius.{xs=4,sm=6,md=8,lg=12,xl=16,full=9999}
      border.json       border.width.{1,2,3}(3 = 포커스 강조, D-97)
      shadow.json       shadow.{sm,md,lg} = 식자재 ERP 0 1 3 · 0 4 12 · 0 8 24, 검정 6 · 8 · 10%(D-97) ($type shadow, 배열 허용)
      motion.json       duration.{100,150,200,300}(ms) · easing.{standard,decelerate,accelerate}(cubicBezier)
                        의미 이름(PR-26, 컴포넌트는 이것만): duration.{fast=100,normal=150,slow=200,slower=300}(alias) · duration.spin=900 · duration.pulse=1500 · duration.essential=900(움직임 줄이기에서도 0이 되지 않는다. 상태를 알리는 회전 Spinner만, D-97) · easing.{enter=decelerate,exit=accelerate}
      z.json            z.{base=0,sticky=100,overlay=300,modal=400,dropdown=450,toast=500} — 팝업(Select · Menu · DateField 달력 · Tooltip)은 시트 · 대화상자 · 사이드바 덮개 안에서도 열리므로 그 위(D-63)
      breakpoint.json   breakpoint.{sm=640,md=768,lg=1024,xl=1280,2xl=1536}
      layout.json       layout.globalBar.height=48 · layout.sidebar.width=240 · layout.sidebar.collapsedWidth=64 · layout.content.maxWidth=1440 · layout.content.maxWidthWide=1600 · layout.wide.minWidth=1920(식자재 ERP 와이드, D-97) · layout.gutter.default=24 · layout.gutter.compact=16 · layout.desktop.minWidth=1024
      size.json         size.icon.{16,20,24} · size.moduleIcon.{32,40,48} · size.avatar.{24,32,40,48} · size.touch.{min=44,control=48,main=56}(손가락, D-97)
      font.json         font.family.sans="Pretendard Variable" · font.family.mono(시스템 고정폭만, D-97) · font.weight.{400,500,600,700} · font.numeric="tabular-nums" · font.letterSpacing.{tight=-0.01em, normal=0}
    semantic/
      color.light.json  §2의 semantic 색 전부. 모든 $value는 primitive alias(`{color.neutral.50}`). 회사 색 · 회색 톤 토큰의 alias는 gen:theme 생성물
      color.dark.json   color.light.json과 키 집합 동일(테스트로 강제). raw 값 금지
      color.hc-light.json · color.hc-dark.json   고대비 덮어쓰기(data-contrast="high", D-97). 둘의 키 집합 동일
      chart.cvd-light.json · chart.cvd-dark.json 색각 친화 차트 덮어쓰기(data-chart="cvd", D-97)
    density/
      compact.json      density.row.height=36(식자재 ERP 밀집) · density.row.heightTall=48 · density.control.height.{xs=26,sm=30,md=36,lg=42,xl=48} · density.card.padding=16 · density.body.fontSize=13 · density.body.lineHeight=20 · density.input.fontSize=13 · density.gutter=16 (D-97)
      comfortable.json  동일 키: 40(식자재 ERP 기본) · 56 · 26/30/36/42/48 · 20 · 14/21 · 14 · 24
      touch.json        동일 키: 48 · 64 · 44/44/48/56/56(손가락 44 · 48 · 56) · 16 · 15/22 · 16 · 16 — 휴대폰(breakpoint.sm 미만)에서 루트에 자동 적용(D-61)
    typography.json     type.{display,h1,h2,h3,h4,body,label,caption,micro,mono,amount,amountLg}.{fontSize,lineHeight,fontWeight,letterSpacing}
    paper.json          paper.{bg,fg,muted,line,lineStrong,fill,shadow} · paper.size.{a4,a5}.{width,height} · paper.margin.{sm,md} — 종이 서식, 테마와 무관(§9, D-77)
    modules.json        모듈 레지스트리 — DTCG 아님, 스키마는 docs/spec/components.md §7
  fonts/                PretendardVariable.woff2 + LICENSE(OFL)
  sd/                   Style Dictionary 커스텀 transform · format · preprocessor
  scripts/
    gen-color-scale.mjs 7 hue × 11단계 생성(OKLCH). 결과를 primitive/color.json에 기록, 결정적
    lock-names.mjs      토큰 이름 전체 목록 → NAMES.lock (G1 이후 변경 감시)
  sd.config.mjs
  NAMES.lock
  test/                 vitest: 스키마 · 모드 패리티 · alias-only · 대비 · 산출물 스냅샷 · 이름 lock
  dist/                 빌드 산출물(§4), 커밋하지 않음
```

## 2. Semantic 색 토큰 — 전체 목록과 Light 가안

이 목록이 **G1에서 동결되는 이름**이다(추가만, 이름 변경 · 삭제 없음). 값은 PR-28(2026-11-10, Patrick 승인)에서 식자재 ERP 리뉴얼 값으로 옮겼다(대응표 `docs/plan/notes/token-port-2026-11.md`).
종이 서식 색(`paper.*`)은 테마와 무관해 이 표에 넣지 않고 §9에 둔다.

| 토큰 | Light(alias) | Dark(alias) | 회사 색 | 용도 |
|---|---|---|---|---|
| `color.bg.canvas` | neutral.100 | graphite.950 | 고정 | 앱 바탕 |
| `color.bg.surface` | base.white | graphite.900 | 고정 | 카드·패널 |
| `color.bg.elevated` | base.white | graphite.700 | 고정 | 드롭다운·팝오버 |
| `color.bg.sunken` | neutral.50 | graphite.800 | 고정 | 입력 배경·그리드 헤더 |
| `color.bg.nav` | shell.800 | shell.925 | 회사 색 | 사이드바 면. 브랜드 가장 짙은 단계(라이트 · 다크 같은 값). 위 글자 · 아이콘은 color.nav.*(PR-27) |
| `color.bg.overlay` | alpha.black.40 | alpha.black.60 | 고정 | 모달 뒤 |
| `color.bg.rowSelected` | alpha.brand.8 | alpha.brand.16 | 회사 색 | 표 · 목록의 선택 행 바탕(D-97) |
| `color.nav.fg` | shell.100 | shell.100 | 회사 색 | 사이드바 항목 글자(쉴 때) |
| `color.nav.fgMuted` | shell.300 | shell.300 | 회사 색 | 사이드바 묶음 이름 · 아이콘 · 펼침 표시 |
| `color.nav.fgActive` | base.white | base.white | 회사 색 | 사이드바 지금 화면 · 가리킨 항목 글자 |
| `color.nav.hover` | shell.750 | shell.900 | 회사 색 | 사이드바 항목을 가리켰을 때 면 |
| `color.nav.selected` | shell.700 | shell.800 | 회사 색 | 사이드바 지금 화면 항목 면 |
| `color.nav.border` | shell.750 | shell.900 | 회사 색 | 사이드바 안 구분선 |
| `color.nav.focus` | brand.500 | brand.500 | 회사 색 | 사이드바 위 포커스 링(nav 면 위 3:1) |
| `color.nav.sub` | shell.850 | shell.950 | 회사 색 | 사이드바 하위 메뉴 묶음 면(D-97) |
| `color.avatar.{1,2,3,4,5,6}.bg` | blue.100 · green.100 · violet.100 · teal.100 · amber.100 · red.100 | blue.900 · green.900 · violet.900 · teal.900 · amber.900 · red.900 | 고정 | 아바타 글자 바탕(파랑) |
| `color.avatar.{1,2,3,4,5,6}.fg` | blue.700 · green.700 · violet.700 · teal.700 · amber.800 · red.700 | blue.200 · green.200 · violet.200 · teal.200 · amber.200 · red.200 | 고정 | 아바타 글자(파랑) |
| `color.fg.primary` | neutral.800 | graphite.100 | 고정 | 본문. surface 대비 12:1 이상 |
| `color.fg.secondary` | neutral.700 | graphite.200 | 고정 | 보조 글자. 4.5:1 이상(PR-26: 600 → 700, 가독성) |
| `color.fg.tertiary` | neutral.500 | graphite.300 | 고정 | 힌트·타임스탬프. 4.5:1 이상(PR-26: 500 → 600, canvas 위 4.47:1이던 것) |
| `color.fg.disabled` | neutral.400 | graphite.400 | 고정 | 비활성 글자(대비 예외) |
| `color.fg.inverse` | base.white | neutral.900 | 고정 | 진한 배경 위 글자 |
| `color.fg.link` | brand.600 | brand.400 | 회사 색 | 링크 |
| `color.fg.strong` | neutral.900 | graphite.50 | 고정 | 제목 · 강조 값. fg.primary보다 한 단계 진하다(D-97) |
| `color.border.default` | neutral.200 | graphite.600 | 고정 | 입력·카드 테두리 |
| `color.border.strong` | neutral.300 | graphite.500 | 고정 | 강조 테두리, 다크에서 그림자 대체 |
| `color.border.focus` | brand.600 | brand.400 | 회사 색 | 포커스 링 2px |
| `color.border.selected` | brand.600 | brand.400 | 회사 색 | 선택 · 현재 표시 선(1px 테두리 · 탭 밑줄 · 진행 단계). surface 대비 3:1 이상(PR-26) |
| `color.border.divider` | neutral.200 | graphite.600 | 고정 | 구분선 |
| `color.border.focusStrong` | brand.700 | brand.300 | 회사 색 | 포커스 강조 모드(data-focus="strong") · 고대비의 포커스 링. 면 · 바탕 위 4.5:1(D-97) |
| `color.border.hover` | neutral.400 | graphite.400 | 고정 | 입력 칸을 가리켰을 때 테두리(식자재 ERP line-strong, D-97) |
| `color.brand.default` | brand.600 | brand.600 | 회사 색 | 주요 액션(D-10 주의) (2026-11-08 승인: 600. 흰 글자 대비 6.0:1) |
| `color.brand.hover` | brand.700 | brand.700 | 회사 색 | 주요 액션 hover. 라이트는 한 단계 진하게, 다크는 밝게 |
| `color.brand.active` | brand.800 | brand.800 | 회사 색 | 주요 액션 active |
| `color.brand.subtle` | brand.50 | alpha.brand.16 | 회사 색 | 선택 배경 |
| `color.brand.onBrand` | base.white | base.white | 회사 색 | 브랜드 위 글자 |
| `color.brand.tint` | brand.100 | alpha.brand.24 | 회사 색 | 옅은 강조 면(기간 사이 띠 · 지금 고치는 칸 · 끌어 놓을 자리 · 진행 막대 트랙). 위 글자는 fg.primary(D-97) |
| `color.brand.accent` | brand.500 | brand.500 | 회사 색 | 회사 색 그대로의 강조(진행 막대 · 로고 · 선택 표시 점). 글자가 아닌 표시라 면 위 3:1(D-97) |
| `color.status.{info,success,warning,danger}.default` | blue.600 · green.600 · amber.600 · red.600 | blue.400 · green.400 · amber.400 · red.400 | 고정 | 정보: 아이콘·테두리·글자 |
| `color.status.{info,success,warning,danger}.subtle` | blue.50 · green.50 · amber.50 · red.50 | alpha.blue.16 · alpha.green.16 · alpha.amber.16 · alpha.red.16 | 고정 | 정보: 배지·토스트 배경 |
| `color.status.{info,success,warning,danger}.on` | base.white · base.white · neutral.900 · base.white | neutral.950 · neutral.950 · neutral.950 · neutral.950 | 고정 | 정보: default 위 글자 |
| `color.finance.income` | red.600 | red.400 | 고정 | 수입·증가(빨강 고정) |
| `color.finance.expense` | blue.600 | blue.400 | 고정 | 지출·감소(파랑 고정) |
| `color.finance.neutral` | neutral.600 | graphite.200 | 고정 | 변동 없음 |
| `color.approval.{draft,pending,approved,rejected,withdrawn}.default` | neutral.500 · amber.600 · green.600 · red.600 · neutral.400 | graphite.200 · amber.400 · green.400 · red.400 · graphite.300 | 고정 | 결재 기안: 배지 점 · 결재선 표시(글자는 text) |
| `color.approval.{draft,pending,approved,rejected,withdrawn}.subtle` | neutral.100 · amber.50 · green.50 · red.50 · neutral.100 | graphite.700 · amber.950 · green.950 · red.950 · graphite.700 | 고정 | 결재 기안: 배지 배경 |
| `color.approval.{draft,pending,approved,rejected,withdrawn}.text` | neutral.700 · amber.800 · green.700 · red.600 · neutral.600 | graphite.100 · amber.400 · green.400 · red.400 · graphite.300 | 고정 | 결재 기안: 배지 글자(subtle 위 4.5:1, D-64) |
| `color.module.{erp,groupware,ecm,crm,scm,commerce,mes}.default` | blue.500 · green.500 · violet.500 · teal.500 · amber.500 · red.500 · neutral.600 | blue.400 · green.400 · violet.400 · teal.400 · amber.400 · red.400 · graphite.300 | 고정 | ERP: 사이드바 활성·배지 |
| `color.module.{erp,groupware,ecm,crm,scm,commerce,mes}.subtle` | blue.50 · green.50 · violet.50 · teal.50 · amber.50 · red.50 · neutral.50 | alpha.blue.16 · alpha.green.16 · alpha.violet.16 · alpha.teal.16 · alpha.amber.16 · alpha.red.16 · alpha.neutral.16 | 고정 | ERP: 모듈 카드 배경 |
| `color.module.{erp,groupware,ecm,crm,scm,commerce,mes}.gradientFrom` | blue.400 · green.400 · violet.400 · teal.400 · amber.400 · red.400 · neutral.400 | blue.400 · green.400 · violet.400 · teal.400 · amber.400 · red.400 · neutral.400 | 고정 | ERP: 앱 아이콘 그라데이션 위(밝게) |
| `color.module.{erp,groupware,ecm,crm,scm,commerce,mes}.gradientTo` | blue.600 · green.600 · violet.600 · teal.600 · amber.600 · red.600 · neutral.700 | blue.600 · green.600 · violet.600 · teal.600 · amber.600 · red.600 · neutral.700 | 고정 | ERP: 앱 아이콘 그라데이션 아래(진하게) |
| `color.module.onTile` | base.white | base.white | 고정 | 모듈 앱 아이콘(생성형 폴백) 위 라인 · 글자. 라이트 · 다크 모두 흰색(D-36, 가안) |
| `color.chart.series.{1,2,3,4,5}` | blue.500 · green.500 · violet.500 · teal.500 · amber.600 | blue.400 · green.500 · violet.400 · teal.500 · amber.500 | 고정 | 차트 계열 1: 단일·이번 기간(ERP 색) |
| `color.chart.compare` | neutral.400 | graphite.300 | 고정 | 비교·직전 기간(점선·회색) |
| `color.chart.grid` | neutral.200 | graphite.600 | 고정 | 차트 격자선 |
| `color.chart.axis` | neutral.500 | graphite.300 | 고정 | 차트 축 글자·눈금 |
| `color.chart.track` | neutral.100 | graphite.700 | 고정 | 막대 트랙·빈 칸·도넛 바탕 |
| `color.chart.heat.{1,2,3,4,5}` | blue.100 · blue.200 · blue.300 · blue.600 · blue.800 | blue.950 · blue.900 · blue.800 · blue.700 · blue.600 | 고정 | 순차(히트맵) 1단계: 가장 옅음 |
| `color.chart.heatInk` | base.white | graphite.50 | 고정 | 순차 4~5단계 위 글자(흰색) |

Primitive 500 기준값: brand = 회사 색(기본 #FE5C2B, 테마 엔진 생성물, D-98) · blue #2F6BFF(PR-28 전 brand 단계 그대로, 지출 · 정보 · 차트 첫 계열 · 모듈 erp · 아바타 1) · neutral #646B78(식자재 ERP 회색 앵커 50~950) · graphite #4A4A4E(식자재 ERP 다크 무채색 앵커) · red #E5484D · green #1F9D55 · amber #F5A524 · violet #7C5CFF · teal #1BA3A3. 사이드바 톤 shell(회사 색상 · 저채도, L은 식자재 ERP 코코아 단계)도 엔진 생성물이다.

"회사 색" 열이 "회사 색"인 토큰은 `packages/tokens/theme`(createTheme)이 회사 메인 색 하나로 다시 계산한다(D-97). 값은 손으로 적지 않는다. `pnpm --filter @terracelab/trellis-tokens gen:theme`이 기본 테마 = createTheme('#FE5C2B')의 결과를 alias로 쓰고 `test/default-theme.test.ts`가 대조한다(D-98). 고대비(`data-contrast="high"`)는 `semantic/color.hc-{light,dark}.json`이 회사 색 토큰 21개 · 글자 · 선 · 상태 · 금융 · 결재 글자 · 차트 격자를 덮고, 색각 친화 차트(`data-chart="cvd"`)는 `semantic/chart.cvd-{light,dark}.json`이 차트 계열 5색 · 비교색을 덮는다. 글자 크기 112 · 125(`data-font-scale`)는 tokens.css가 `type.*` · 밀도 본문 글자를 곱해 낸다(20~24px 제목은 절반, 28px 이상은 그대로).

## 3. 타이포그래피 토큰

| 스타일 | fontSize/lineHeight | fontWeight | letterSpacing | 비고(식자재 ERP 글자 스타일, D-97) |
|---|---|---|---|---|
| display | 28/34 | 600 | tight | 홈 인사말, KPI 큰 숫자(display-28. 여러 줄을 위해 행간 34) |
| h1 | 24/31 | 600 | tight | 화면 제목(title-24) |
| h2 | 18/24 | 600 | tight | 대화상자 · 서랍 · 큰 묶음 제목(heading-18) |
| h3 | 16/21 | 600 | normal | 섹션 · 카드 제목(heading-16) |
| h4 | 15/20 | 600 | normal | 작은 카드 · 패널 제목(heading-15) |
| body | 14/21 | 400 | normal | 본문(body-14). compact에서는 density.body.* 13/20, comfortable 14/21, touch 15/22. 입력 칸 글자는 density.input.fontSize(13 · 14 · 16) |
| label | 13/20 | 500 | normal | 폼 라벨 · 탭(body-13) |
| caption | 12/18 | 400 | normal | 보조 설명(caption-12) |
| micro | 11/16 | 400 | normal | 배지 숫자 · 축 눈금(micro-11) |
| mono | 12/16 | 400 | normal | 코드 · 번호(mono-12). 글꼴 font.family.mono |
| amount | 16/24 | 600 | normal | 금액, tabular-nums, 우측 정렬 |
| amountLg | 20/24 | 600 | normal | KPI 금액(display-20) |

규칙: 숫자는 항상 `font-variant-numeric: tabular-nums`. 한글 제목 letter-spacing −0.01em(식자재 ERP −0.02em은 가져오지 않는다, D-55), 본문 0. 본문 행간 ≥ 1.45(제목은 식자재 ERP 행간). 화면 글자는 600이 상한이다.

글자 크기 모드(D-97): `<html data-font-scale="112|125">`가 type.* · density 본문 · 입력 글자를 1.125 · 1.25배로 키운다. 20~24px 제목(h1 · amountLg)은 절반(1.0625 · 1.125), 28px 이상(display)은 그대로. 종이(paper.type.*)는 바뀌지 않는다.

종이 서식(Paper)은 이 표를 쓰지 않는다. 앱이 글자 크기 모드로 `type.*`를 덮어써도 인쇄물이 바뀌지 않도록 §9의 `paper.type.*`(pt)를 따로 쓴다.

## 4. 빌드 산출물 — Style Dictionary (`sd.config.mjs`)

| 산출물 | 경로 | 내용 | 소비처 |
|---|---|---|---|
| CSS 변수 | `dist/css/tokens.css` | §5 구조 | react, django, preview, tailwind |
| 폰트 | `dist/css/fonts.css` + `dist/fonts/*.woff2` | `@font-face` Pretendard Variable, `font-display: swap` | 모든 웹 |
| TS(웹) | `dist/web/index.{js,d.ts}` | `tokens` = CSS 변수 참조 문자열 중첩 객체(`tokens.color.bg.surface === 'var(--tl-color-bg-surface)'`), `primitives` = raw 값, `tokenNames: readonly string[]` | react |
| TS(네이티브) | `dist/native/index.{js,d.ts}` | `themes.light/dark`(semantic 해석값), `density.compact/comfortable/touch`, `primitives`, `typography`(RN 형식: 숫자 unitless, fontWeight 문자열, shadow → RN shadow* + elevation) | native |
| Tailwind preset | `dist/tailwind/theme.css` | `@theme inline { --color-bg-surface: var(--tl-color-bg-surface); --spacing-4: var(--tl-space-4); … }` | 소비 앱(`@terracelab/trellis-tailwind`가 재배포) |
| Figma | `dist/figma/variables.json` | §6 스키마 | `/ds-figma-sync` 스킬 |
| flat | `dist/json/flat.json` | `{"--tl-color-bg-surface":{"light":"#FFFFFF","dark":"#111827"},…}` | 린트(허용 값 목록), 드리프트 스캔 |
| 문서 | `dist/docs/tokens.md` | 이름·값·대비율 표 | Storybook 문서 페이지 |

이름 변환: `color.bg.surface` → CSS `--tl-color-bg-surface`, TS `tokens.color.bg.surface`, 숫자 키는 그대로(`--tl-space-16`, `tokens.space[16]`, `--tl-color-brand-500`), Figma `color/bg/surface`.

종이 토큰(§9)도 모든 산출물에 들어간다. CSS는 테마 블록 밖 `:root` 한 곳, 웹 TS는 `tokens.paper`, 네이티브는 `paper`(mm · pt를 CSS 기준 픽셀 96dpi로 바꾼 숫자, 1mm = 96 / 25.4, 1pt = 96 / 72), Figma는 `Paper` 컬렉션(크기 · 여백 · 글자는 같은 px, 그림자는 제외), flat은 `value` 하나, Tailwind는 색만 `--color-paper-*`.

## 5. CSS 변수 파일 구조

```css
/* dist/css/tokens.css — 생성물, 수정 금지 */
:root { /* primitives */ --tl-color-brand-500: #2F6BFF; --tl-space-16: 16px; … }
:root, [data-theme="light"] { /* semantic light */ --tl-color-bg-surface: var(--tl-color-base-white); … }
[data-theme="dark"] { /* semantic dark */ … }
:root, [data-density="compact"] { --tl-density-row-height: 32px; --tl-density-body-font-size: 13px; … }
[data-density="comfortable"] { … }
[data-density="touch"] { … }
@media (max-width: 639px) { :root { /* touch: 휴대폰은 루트 밀도가 touch. 안쪽 요소의 data-density는 그대로 */ } }
:root { /* typography */ --tl-type-body-font-size: 14px; … }
:root { /* paper · 테마와 무관 */ --tl-paper-bg: var(--tl-color-base-white); --tl-paper-size-a4-width: 210mm; --tl-paper-type-body-font-size: 10.5pt; … }
@media (pointer: coarse) { :root, [data-density], [data-font-scale] { --tl-density-input-font-size: 16px } }   /* 손가락 입력: 입력 칸 글자 16(iOS 확대 방지, D-97) */
@media (prefers-reduced-motion: reduce) { :root { --tl-duration-*: 0ms; } }   /* 숫자 · 의미 이름 · spin · pulse 전부(essential 제외) */

앱 설정으로 움직임을 줄이면 `<html data-motion="reduce">`가 같은 값(모든 duration 0ms)을 준다(R-33). 기기 설정(prefers-reduced-motion)과 둘 중 하나만 켜져도 멈춘다.
```

- 기본값(속성 없음) = Light + compact(D3). 앱은 `<html data-theme="light|dark" data-density="compact|comfortable|touch">`로 전환하고, 네이티브는 `TrellisProvider`의 같은 키로 전환한다. 휴대폰(breakpoint.sm 미만)은 루트 속성과 관계없이 touch다(D-61). 미리보기처럼 안쪽 요소에 건 `data-density`는 그대로 남는다.
- semantic 값은 primitive 변수를 `var()`로 참조해 생성한다(디버깅 시 추적 가능). 네이티브 산출물만 해석값을 쓴다.
- `data-theme="system"`은 지원하지 않는다. 시스템 선호 반영은 앱이 JS로 속성을 바꾼다.

## 6. Figma variables.json 스키마

```json
{
  "version": "0.1.0",
  "collections": [
    { "name": "Primitives", "modes": ["Value"],
      "variables": [ { "name": "color/brand/500", "type": "COLOR", "values": { "Value": "#2F6BFF" } },
                     { "name": "space/16", "type": "FLOAT", "values": { "Value": 16 } } ] },
    { "name": "Semantic", "modes": ["Light", "Dark"],
      "variables": [ { "name": "color/bg/surface", "type": "COLOR",
                       "values": { "Light": { "alias": "Primitives/color/base/white" }, "Dark": { "alias": "Primitives/color/neutral/900" } } } ] },
    { "name": "Density", "modes": ["Compact", "Comfortable"], "variables": [ … ] },
    { "name": "Typography", "modes": ["Value"], "variables": [ … ] },
    { "name": "Paper", "modes": ["Value"],
      "variables": [ { "name": "paper/bg", "type": "COLOR", "values": { "Value": { "alias": "Primitives/color/base/white" } } },
                     { "name": "paper/size/a4/width", "type": "FLOAT", "values": { "Value": 793.7 } } ] }
  ],
  "textStyles": [ { "name": "body", "fontFamily": "Pretendard Variable", "fontSize": 14, "lineHeight": 20, "fontWeight": 400, "letterSpacing": 0 } ]
}
```

`type`은 COLOR · FLOAT · STRING. 단위는 뺀 숫자. alias는 `<컬렉션>/<경로>`. 컴포넌트 계층 토큰과 `z.*`·`breakpoint.*`는 Figma에 올리지 않는다. `layout.*` 9개는 AppShell 치수(글로벌 바 · 사이드바 · 본문 폭 · 거터)를 Figma에서 변수에 묶으려고 Primitives에 올린다(D-118).

## 7. 검증 (packages/tokens/test, vitest) — 모두 CI 게이트

| 테스트 | 실패 조건 |
|---|---|
| schema | 리프에 `$value`·`$type`이 없거나 `$type`이 허용 목록(color, dimension, fontFamily, fontWeight, number, duration, cubicBezier, shadow, string) 밖 |
| mode-parity | `color.light` ≠ `color.dark` 키 집합, `compact` ≠ `comfortable` 키 집합 |
| alias-only | semantic 파일에 `{…}` alias가 아닌 raw 값 |
| contrast | Light·Dark 모두: fg.primary · fg.strong/bg.surface < 12:1, fg.secondary · tertiary/bg.surface · canvas · elevated < 4.5:1, fg.link/bg.surface · canvas · brand.subtle · bg.rowSelected < 4.5:1, fg.primary/brand.tint < 4.5:1, brand.onBrand/brand.default · hover · active < 4.5:1, brand.accent · border.focus · border.selected/bg.surface(· canvas) < 3:1, border.focusStrong < 4.5:1, nav 쌍, status.*.on/status.*.default < 4.5:1, approval.*.text/approval.*.subtle < 4.5:1, finance.income vs expense 색차(ΔE OKLCH) < 20. 고대비(hc-light · hc-dark): 글자 4.5 → 7, 그래픽 3 → 4.5(상태 · 결재 · 아바타 · 본문은 그대로), 포커스 강조 7. 종이: paper.fg · paper.muted / paper.bg · paper.fill < 4.5:1, paper.line · lineStrong / paper.bg < 3:1, 두 모드 값이 다름 |
| default-theme | 회사 색 토큰 21개 · 회색 톤 토큰이 4모드에서 createTheme('#FE5C2B') 결과와 다르거나 gen:theme 생성물이 최신이 아님(D-98) |
| theme | 검증 색 10개 · 극단 20색 × 회색 톤 3 · 컬러칩에서 못 넘는 대비 쌍이 있음, 겹침 경고가 정해 둔 색 밖에서 뜨거나 안에서 안 뜸(D-99) |
| scale | primitive 색 각 hue에서 L이 50→950 단조 감소하지 않음, 500이 입력 기준값과 다름 |
| outputs | `dist/**` 스냅샷과 다름(의도된 변경이면 스냅샷 갱신을 같은 PR에) |
| names-lock | `NAMES.lock`에 있던 이름이 사라졌거나 바뀌었는데 `major` changeset이 없음 (G1 이후 활성) |

대비 실패는 에이전트가 **값 변경을 제안하는 보고서**(`docs/plan/notes/contrast-<date>.md`)를 쓰고 사람이 승인한다. 에이전트가 직접 값을 바꾸지 않는다. 회사 색 토큰은 예외다: 엔진이 대비 규칙으로 단계를 고르고 결과에 이유를 남긴다(규칙은 PR-29에서 승인, D-97).

## 8. 사용 예

```css
/* 컴포넌트 CSS */
.tl-card { background: var(--tl-color-bg-surface); border: var(--tl-border-width-1) solid var(--tl-color-border-default); border-radius: var(--tl-radius-lg); padding: var(--tl-density-card-padding); }
```
```ts
// 웹 TS (인라인 스타일이 꼭 필요할 때만)
import { tokens } from '@terracelab/trellis-tokens/web'; style={{ gap: tokens.space[8] }}
// 네이티브
import { themes, density } from '@terracelab/trellis-tokens/native'; const t = themes[mode]; { backgroundColor: t.color.bg.surface, height: density[d].control.height.md }
```

## 9. 종이(Paper) 토큰

A4 · A5 종이 서식(증명서 · 명세서 · 계약서 · 세금계산서 · 견적서 · 발주서)을 화면에서 미리 보고 브라우저 인쇄(PDF로 저장)로 내보낼 때 쓴다. 종이는 테마와 관계없이 흰 바탕에 검은 글자라서 라이트 · 다크 값이 같고, 파일은 `paper.json` 한 벌이다. 색은 primitive alias, 크기 · 여백은 인쇄 규격이라 mm, 글자는 인쇄 단위 pt다(토큰 원본에서만 mm · pt를 쓴다, 테스트로 강제). 값은 **전부 가안(승인 대기, D-77 · 글자는 R-35)** 이다. 쓰는 곳은 `Paper` 컴포넌트(contracts `Paper/spec.md`)다.

| 토큰 | 가안 | CSS | 용도 |
|---|---|---|---|
| `paper.bg` | base.white (#FFFFFF) | `--tl-paper-bg` | 종이 바탕 |
| `paper.fg` | base.black (#000000) | `--tl-paper-fg` | 본문 글자. bg 위 21:1, 인쇄에서 단색 검정 |
| `paper.muted` | neutral.600 (#59606D) | `--tl-paper-muted` | 머리 · 꼬리 · 주석 글자. bg 위 6.33:1, fill 위 5.11:1 |
| `paper.line` | neutral.400 (#8A909C) | `--tl-paper-line` | 표 안쪽 칸 선 · 꼬리 위 구분선. bg 위 3.21:1 |
| `paper.lineStrong` | neutral.950 (#13161B) | `--tl-paper-line-strong` | 표 바깥 테두리 · 합계 행 위 선 |
| `paper.fill` | neutral.100 (#E5E7EA) | `--tl-paper-fill` | 표 머리 · 라벨 칸 바탕. 그 위 fg 16.95:1 |
| `paper.shadow` | shadow.md | `--tl-paper-shadow` | 화면 미리보기의 종이 그림자. 인쇄에는 없다 |
| `paper.size.a4.width` | 210mm | `--tl-paper-size-a4-width` | A4 세로 폭(ISO 216). 가로 방향은 폭 · 높이를 바꿔 쓴다 |
| `paper.size.a4.height` | 297mm | `--tl-paper-size-a4-height` | A4 세로 높이 |
| `paper.size.a5.width` | 148mm | `--tl-paper-size-a5-width` | A5 세로 폭 |
| `paper.size.a5.height` | 210mm | `--tl-paper-size-a5-height` | A5 세로 높이 |
| `paper.margin.sm` | 12mm | `--tl-paper-margin-sm` | 좁은 여백. 칸이 많은 국세청 서식 · A5 |
| `paper.margin.md` | 18mm | `--tl-paper-margin-md` | 기본 여백 |
| `paper.type.display.fontSize` | 21pt (28px) | `--tl-paper-type-display-font-size` | 문서 제목(PaperTitle) |
| `paper.type.display.lineHeight` | 27pt (36px) | `--tl-paper-type-display-line-height` | display 행간 |
| `paper.type.h1.fontSize` | 18pt (24px) | `--tl-paper-type-h1-font-size` | compact 문서 제목 |
| `paper.type.h1.lineHeight` | 24pt (32px) | `--tl-paper-type-h1-line-height` | h1 행간 |
| `paper.type.h2.fontSize` | 15pt (20px) | `--tl-paper-type-h2-font-size` | 서명 줄(회사 · 직함 · 이름) |
| `paper.type.h2.lineHeight` | 21pt (28px) | `--tl-paper-type-h2-line-height` | h2 행간 |
| `paper.type.h3.fontSize` | 12pt (16px) | `--tl-paper-type-h3-font-size` | 묶음 제목 · 확인 문장 · 서명 날짜. compact에서는 서명 줄 |
| `paper.type.h3.lineHeight` | 18pt (24px) | `--tl-paper-type-h3-line-height` | h3 행간 |
| `paper.type.body.fontSize` | 10.5pt (14px) | `--tl-paper-type-body-font-size` | 종이 본문 · 표 칸. compact에서는 묶음 제목 · 확인 문장 |
| `paper.type.body.lineHeight` | 15pt (20px) | `--tl-paper-type-body-line-height` | body 행간 |
| `paper.type.label.fontSize` | 9.75pt (13px) | `--tl-paper-type-label-font-size` | compact 본문 · 표 칸 |
| `paper.type.label.lineHeight` | 13.5pt (18px) | `--tl-paper-type-label-line-height` | label 행간 |
| `paper.type.caption.fontSize` | 9pt (12px) | `--tl-paper-type-caption-font-size` | 머리 · 꼬리 · 주석 · 표 위 설명 |
| `paper.type.caption.lineHeight` | 12pt (16px) | `--tl-paper-type-caption-line-height` | caption 행간 |

- 종이 안 글자 크기 · 행간은 `paper.type.*`, 간격은 고정 토큰 `space.*`를 쓴다. 앱 밀도(`density.*`)와 앱 글자 크기 모드(앱이 `type.*`를 덮어쓰는 것)는 종이에 닿지 않는다. 휴대폰 touch 밀도에서도 종이는 같은 모양으로 줄어 보인다.
- `paper.type.*`는 `type.*`를 가리키지 않는 값이다. 처음 값은 지금 화면 `type.*`와 같은 크기다(pt × 4/3 = px, 예: 10.5pt = 14px). 그래서 이 토큰을 들여도 종이 모양은 바뀌지 않는다. 이름은 화면 글자 단계(display · h1 · h2 · h3 · body · label · caption)를 따르고, 종이 `density="compact"`는 한 단계씩 작은 값을 쓴다.
- pt를 고른 까닭: 종이 서식(공문 · 국세청 서식 · 워드프로세서)은 글자를 pt로 적는다. 사람이 값을 고칠 때 인쇄물 기준(본문 10pt · 10.5pt)으로 바로 읽힌다. CSS의 pt는 1/72in이라 화면 · 인쇄에서 px과 같은 비율로 그려진다.
- 인쇄 쪽 크기는 CSS `@page`의 `A4` · `A5` 키워드로 정한다(`@page`에는 CSS 변수가 닿지 않는다). 쪽 여백은 0이고 종이 안쪽 여백이 `paper.margin.*`이다.
