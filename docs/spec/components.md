# 컴포넌트 규격

spec.md와 contract.ts가 공유 진실이고, 웹·네이티브 구현은 그것의 두 가지 표현이다. 이 문서의 절 번호는 플랜·DoD에서 참조한다.

## 1. 폴더 규격 (D-2)

```
packages/contracts/src/
  _base.ts                       공통 타입 · defineContract (§2)
  _shared/format.ts              formatAmount 등 웹·네이티브 공용 순수 함수
  index.ts
  <Name>/
    spec.md                      §3 템플릿 — 모든 절 필수
    <Name>.contract.ts           §4
  patterns/<PatternName>/spec.md 패턴 spec (§10)

packages/react/src/
  _headless/                     Base UI 어댑터. 레포에서 @base-ui-components/react 를 import하는 유일한 폴더
  _internal/                     cx · useControllableState · portal · focus.css · breakpoint(useBreakpoint 공개)
  provider/TrellisProvider.tsx   data-theme · data-density 설정, Toast 큐, 포털 루트
  <Name>/
    <Name>.tsx  <Name>.css  <Name>.examples.tsx  <Name>.stories.tsx  <Name>.test.tsx  index.ts
                                 examples = 문서·사이트 예시의 원본(타입 검사, 빌드 제외, D-46)
  patterns/<PatternName>/        §10
  styles.css                     모든 컴포넌트 CSS @import 집합
  index.ts

packages/native/src/
  _internal/                     useTheme · makeStyles · pressable 상태
  provider/TrellisProvider.tsx
  <Name>/
    <Name>.tsx  <Name>.test.tsx  <Name>.gallery.tsx  index.ts
  index.ts

apps/storybook/vrt/__snapshots__/<Name>/*.png
```

원문이 `Checkbox·Radio·Switch`처럼 묶은 것은 **각각** 폴더·contract를 가진다(플랜 작업만 하나). `scripts/check-spec-parity.mjs`가 (spec.md, contract.ts, react 구현, 스토리, Phase 범위 내 native 구현)의 존재와 spec 필수 절을 검사한다.

## 2. 공통 타입 (`_base.ts`)

```ts
export const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;   // xs 26 · sm 30 · md 36 · lg 42 · xl 48(손가락), D-97
export type Size = (typeof SIZES)[number];
export type Density = 'compact' | 'comfortable' | 'touch';
export type ThemeMode = 'light' | 'dark';
export const STATES = ['default', 'hover', 'active', 'focus', 'disabled', 'loading', 'error'] as const;
export type State = (typeof STATES)[number];
export const APPROVAL_STATES = ['draft', 'pending', 'approved', 'rejected', 'withdrawn'] as const;
export type ApprovalState = (typeof APPROVAL_STATES)[number];
export const APPROVAL_LABELS: Record<ApprovalState, string> = { draft: '기안', pending: '진행', approved: '승인', rejected: '반려', withdrawn: '회수' };
export type StatusKind = 'info' | 'success' | 'warning' | 'danger';
export type FinanceKind = 'income' | 'expense' | 'neutral';
export type ModuleGroup = 'erp' | 'groupware' | 'ecm' | 'crm';
export type ModuleId = /* modules.json에서 생성 */ string;

export interface ContractBase { id?: string; testID?: string }   // 플랫폼 공통 최소 props

export interface PropMeta { type: string; default?: unknown; required?: boolean; values?: readonly string[]; description: string }
export interface Contract<P> {
  name: string;                                   // = 폴더 이름 = displayName = Figma 컴포넌트 이름
  props: { [K in keyof P]-?: PropMeta };
  states: readonly State[];                       // 7개 중 지원하는 것
  a11y: { role?: string; keyboard: readonly string[]; labelling: 'children' | 'aria-label' | 'label-prop' };
  slots?: readonly string[];
  platforms: { web: true; native: boolean };      // native=false면 네이티브 parity 검사 제외
}
export function defineContract<P>(c: Contract<P>): Contract<P> { return c }
```

플랫폼 전용 props는 contract에 넣지 않고 구현에서 확장한다. 허용되는 확장은 웹 `className · style · 이벤트 핸들러 타입`, 네이티브 `style · 이벤트 핸들러 타입`만이다.

## 3. spec.md 템플릿 — 모든 절이 있어야 parity 통과

```markdown
# <Name>
## 용도
한 문장. + 쓰지 말아야 할 경우(대신 쓸 컴포넌트).
## 해부(Anatomy)
파트 목록(root · label · icon · …). 파트마다 쓰는 semantic 토큰 이름.
## Props
| 이름 | 타입 | 기본값 | 필수 | 설명 |   ← contract.ts와 1:1. 다르면 parity 실패
## Variants
variant × size 표. 조합마다 bg/fg/border 토큰.
## States
7개 중 지원하는 것. 상태마다 시각 변화와 토큰. 비지원 상태는 "해당 없음"으로 명시.
## 동작
마우스·터치, 키보드(키 | 동작 표), 포커스 이동, 열림·닫힘 규칙, 컨트롤드/언컨트롤드.
## 접근성
role, aria-*, 라벨 규칙, 대비(≥ 4.5:1), 포커스 링, reduced-motion.
## 밀도
compact/comfortable에서 바뀌는 치수와 density 토큰 이름.
## 플랫폼 차이
웹 vs 네이티브 구현 차이. props는 같아야 하고, 차이는 동작·표현만.
## 금지 사항
항목마다 → 린트 룰 ID(§5) 또는 "리뷰".
## 스토리
필수: Default · AllVariants · Sizes · States · Density + 컴포넌트 고유 스토리.
## 참고
원문 §5의 행. 벤치마크는 구조만(타사 자산 사용 금지).
```

## 4. contract 예시와 contract 테스트

```ts
// packages/contracts/src/Button/Button.contract.ts
import { defineContract, type ContractBase, type Size } from '../_base';
export interface ButtonProps extends ContractBase {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  iconOnly?: boolean;           // true면 aria-label 필수, Tooltip 필수
  leadingIcon?: string;         // icons 패키지 이름
  trailingIcon?: string;
  children?: unknown;           // 플랫폼이 ReactNode로 좁힘
  onPress?: () => void;         // 웹 onClick과 네이티브 onPress를 모두 이 이름으로
}
export const ButtonContract = defineContract<ButtonProps>({
  name: 'Button',
  props: { variant: { type: "'primary'|'secondary'|'ghost'|'danger'", default: 'primary', values: ['primary','secondary','ghost','danger'], description: '시각 위계' }, /* … 모든 prop */ },
  states: ['default', 'hover', 'active', 'focus', 'disabled', 'loading'],
  a11y: { role: 'button', keyboard: ['Enter', 'Space'], labelling: 'children' },
  platforms: { web: true, native: true },
});
```

contract 테스트(`packages/contracts/src/_testing/contractTest.ts`, 두 플랫폼이 import):
- 타입: `expectTypeOf<ComponentProps<typeof Button>>().toMatchTypeOf<ButtonProps>()`
- `Component.displayName === contract.name`
- `props[*].values`가 있는 prop은 값마다 렌더가 성공하고 웹은 `data-<prop>` 속성, 네이티브는 `testID="<name>-<prop>-<value>"`가 붙는다
- `states`에 있는 disabled · loading · error는 prop으로 켤 수 있고 웹 `data-state`, 네이티브 `accessibilityState`에 반영된다
- 이벤트 이름은 `onPress` · `onChange` · `onOpenChange`로 통일. 웹에서 `onClick`을 노출하지 않는다

## 5. 린트 규칙

| 규칙 ID | 도구 | 검사 | 예외 |
|---|---|---|---|
| `trellis/no-raw-color` | eslint | 문자열·템플릿의 `#hex`, `rgb(`, `hsl(`, `oklch(` 계열. 색 이름(white 등)은 색 속성 자리(style 객체 · JSX `fill`/`stroke` · 템플릿 속 CSS 선언)에서 | `packages/tokens`, 테스트, `href`·`id` 같은 앵커 자리 |
| `trellis/no-px` | eslint | 스타일 자리(style 객체 · `el.style` · 템플릿 속 CSS 선언)와 CSS 값 하나뿐인 문자열(`'12px'`)의 `\d+px`(0 제외), style 객체의 치수 속성 숫자(0 · 단위 없는 속성 제외), matchMedia 문자열의 raw px(`primitives.breakpoint.*`를 끼운다). 네이티브는 값이 `tokens`/`themes`/`density` 식별자에서 오면 허용 | `packages/tokens`, 테스트, 사람이 읽는 문구 |
| `trellis/no-font-family` | eslint | `fontFamily` · `font-family` · style의 `font` 리터럴(`var(--tl-*)` · `inherit`만 허용) | `packages/tokens` |
| `trellis/no-primitive-token` | eslint | `tokens.color.<hue>[<step>]`, `primitives.*`(`primitives.breakpoint`는 matchMedia용으로 허용), `--tl-color-<hue>-<step>` · `alpha-*` · `base-*` 참조 in react·native·contracts·icons·blocks·apps | `packages/tokens`, `apps/preview`(D-33) |
| `trellis/headless-boundary` | eslint | `@base-ui-components/*` import가 `packages/react/src/_headless/` 밖 | — |
| `trellis/event-naming` | eslint | 공개 컴포넌트 props에 `onClick` 노출 | `_internal` |
| `declaration-property-value-disallowed-list` | stylelint | 색·치수 속성 값에 `#`, 색 이름, `px`(0 제외), `rgb(`. `@media` 쿼리 안의 px만 허용(CSS 변수 불가). primitive 색 변수(`--tl-color-<hue>-<step>` · `alpha-*` · `base-*`) 참조 | `dist/**/tokens.css`, primitive는 `apps/preview`(D-33) |
| `selector-class-pattern` | stylelint | `^tl-[a-z0-9]+(__[a-z0-9-]+)?$` | — |
| `font-family-name-quotes` 등 | stylelint | `font-family` 선언 자체 금지(상속). 루트는 Provider가 `--tl-font-family-sans` 적용 | `fonts.css` |
| `trellis/dependency-direction` | eslint | `tokens ← icons ← contracts ← react · native ← blocks ← apps` 역방향, react↔native 상호 import, 패키지 간 상대경로(`../../packages`), tokens · contracts의 `react` · `react-native` · Base UI import | 저장소 루트 `scripts/` |
| `trellis/hover-transition` | stylelint(`scripts/stylelint/hover-transition.mjs`) | react 컴포넌트 CSS에서 `:hover` 규칙이 색 · 배경 · 테두리 · 그림자를 바꾸는데 같은 파일에 대상 요소(선택자 마지막 조각 클래스)의 transition이 없음(PR-26) | `stylelint-disable-next-line` + 이유 |
| 숫자 움직임 변수 | stylelint `declaration-property-value-disallowed-list` | `--tl-duration-<숫자>` · `--tl-easing-decelerate|accelerate` 참조(의미 이름 `duration.fast …` · `easing.enter · exit`를 쓴다, PR-26) | `apps/preview`(D-33) |
| `spec-parity` | script | §1 셋의 존재, spec 필수 절, 스토리 존재, contract.props ↔ spec Props 표 이름 일치 | `platforms.native=false`면 native 제외 |

규칙 구현은 `packages/eslint-plugin-trellis/`(private)에 두고 각 규칙에 valid/invalid 픽스처 테스트를 둔다.

## 6. 스토리 · a11y · VRT

- Storybook 제목: `Foundations/*`(토큰·타이포·아이콘), `Components/<Name>`, `Patterns/<Name>`, `Templates/<Name>`.
- 필수 스토리: `Default`, `AllVariants`(variant × size 매트릭스 한 화면), `Sizes`, `States`(7 상태. hover·focus·active는 `data-force-state` 속성으로 강제, 컴포넌트 CSS는 `:hover, [data-force-state="hover"]`처럼 둘 다 받는다), `Density`(compact·comfortable 나란히), `Playground`(controls, `parameters.vrt=false`).
- 툴바 글로벌 `theme`·`density` → 데코레이터가 `<html data-theme data-density>`를 바꾼다. VRT는 4조합을 자동 순회한다.
- autodocs의 props 표는 contract의 `props` 메타에서 생성한다(커스텀 Docs 블록). react-docgen 결과와 불일치하면 경고.
- a11y: addon-a11y 활성, `States` 스토리의 disabled 포함 전부 violation 0. 아이콘 전용 버튼은 `aria-label` 없으면 스토리 렌더 시 throw(개발 모드).
- 예시 주소(`<Name>.examples.tsx`의 href): 문서 사이트 검사(`apps/docs/scripts/check.mjs`)가 페이지의 `/` 링크를 모두 열어 본다. 예시 링크가 사이트 안에서 404가 되면 실패다. 앱 안 화면은 `#orders`처럼 같은 쪽 안 주소로 대신하고, 바깥 주소는 예약 도메인 `https://….example`이나 실제로 열리는 공개 주소를 쓴다. 앱 경로(`/erp/sales/orders`)는 라우터 연결을 보여 주는 예시에서만 쓰고, 그 예시는 TrellisProvider `navigate`(RichText는 `onLinkPress`)로 누름을 받는다. 검사는 예시 안에서 누름을 앱 라우터가 받는 링크를 예시 앱 경로로 따로 세고, 받지 않는 `/` 링크는 사이트 링크로 연다.
- 문서 사이트 본문 표: 마크다운 표는 가로 스크롤 칸으로 감싸지고(`apps/docs/src/markdown/table-scroll.js`), 칸이 넘칠 때만 키보드로 갈 수 있는 영역(`tabindex="0"` · `role="region"` · 표 머리 이름)이 된다(axe `scrollable-region-focusable`).
- VRT 상세는 `docs/spec/pipeline.md` §3.

## 7. 모듈 레지스트리 — `packages/tokens/src/modules.json`

```json
{
  "groups": {
    "erp":       { "label": "ERP",      "color": "color.module.erp" },
    "groupware": { "label": "그룹웨어",  "color": "color.module.groupware" },
    "ecm":       { "label": "ECM",      "color": "color.module.ecm" },
    "crm":       { "label": "CRM",      "color": "color.module.crm" }
  },
  "modules": [
    { "id": "accounting",    "group": "erp",       "label": "회계",      "icon": "calculator",     "badge": "count" },
    { "id": "treasury",      "group": "erp",       "label": "자금",      "icon": "wallet",         "badge": "count" },
    { "id": "purchasing",    "group": "erp",       "label": "구매",      "icon": "shopping-cart",  "badge": "count" },
    { "id": "sales",         "group": "erp",       "label": "영업",      "icon": "chart-bar",      "badge": "count" },
    { "id": "production",    "group": "erp",       "label": "생산",      "icon": "factory",        "badge": "count" },
    { "id": "hr-payroll",    "group": "erp",       "label": "인사·급여", "icon": "users",          "badge": "count" },
    { "id": "mail",          "group": "groupware", "label": "메일",      "icon": "mail",           "badge": "count" },
    { "id": "approval",      "group": "groupware", "label": "전자결재",  "icon": "pen-line",       "badge": "approval" },
    { "id": "attendance",    "group": "groupware", "label": "근태",      "icon": "clock",          "badge": "status" },
    { "id": "calendar",      "group": "groupware", "label": "일정",      "icon": "calendar",       "badge": "count" },
    { "id": "board",         "group": "groupware", "label": "게시판",    "icon": "pin",            "badge": "count" },
    { "id": "messenger",     "group": "groupware", "label": "메신저",    "icon": "message-circle", "badge": "count" },
    { "id": "my-docs",       "group": "ecm",       "label": "문서함",    "icon": "folder",         "badge": "count" },
    { "id": "company-docs",  "group": "ecm",       "label": "전사문서",  "icon": "file-text",      "badge": "count" },
    { "id": "dept-docs",     "group": "ecm",       "label": "부서문서",  "icon": "inbox",          "badge": "count" },
    { "id": "doc-editor",    "group": "ecm",       "label": "문서작성",  "icon": "file-pen",       "badge": "none" },
    { "id": "customers",     "group": "crm",       "label": "고객",      "icon": "contact",        "badge": "count" },
    { "id": "opportunities", "group": "crm",       "label": "영업기회",  "icon": "filter",         "badge": "count" },
    { "id": "quotes",        "group": "crm",       "label": "견적",      "icon": "receipt",        "badge": "count" },
    { "id": "support",       "group": "crm",       "label": "상담",      "icon": "headset",        "badge": "count" }
  ]
}
```

- `icon`은 Lucide 이름(없는 이름이면 icons 빌드가 실패한다. 업무 전용 자체 아이콘은 `custom:<name>`). `badge`는 `count`(99+) · `approval`(결재 5상태) · `status`(status 4종) · `none`.
- 이 파일에서 생성되는 것: `ModuleId` 타입(contracts), 사이드바·런처 메뉴 데이터, `NotificationCard` 아이콘, 모듈 앱 아이콘 svg/react/rn/png(32·40·48, radius 22%; `packages/icons/src/module-tiles/<id>.svg` 일러스트 타일이 있는 모듈은 그것, 없는 모듈은 `gradientFrom → gradientTo` 세로 그라데이션 + 흰 라인 아이콘 — D-36), Figma Module Icons 페이지.
- 모듈 추가·삭제는 minor, `id` 변경은 major.

## 8. 웹 구현 규칙

- 루트 요소: `tl-<kebab>` 클래스 + `data-variant · data-size · data-state` 속성. 하위 파트는 `tl-<kebab>__<part>`.
- 상태: hover·focus·active는 CSS 의사 클래스(`:hover`, `:focus-visible`, `:active`) **그리고** `[data-force-state=…]`(스토리·VRT용). disabled·loading·error는 `data-state`와 `aria-disabled`/`aria-busy`/`aria-invalid`.
- 상태 전환(PR-26, D-85): hover · active · 선택이 배경 · 글자색 · 테두리 · 그림자를 바꾸면 그 요소의 기본 규칙에 `transition: <속성> var(--tl-duration-fast) var(--tl-easing-standard)`를 둔다(stylelint `trellis/hover-transition`). 움직임 변수는 의미 이름만 쓴다: `duration.fast`(hover · 작은 팝업) · `normal`(대화 상자 · 화면 들어오기) · `slow`(서랍 · 탭 밑줄) · `slower`(아래 시트 · 토스트) · `spin`(도는 것) · `pulse`(반복 표시), `easing.standard · enter · exit`. 숫자 이름(`--tl-duration-100`)은 stylelint가 막는다. 움직임 줄이기는 토큰이 모든 시간을 0으로 두므로 컴포넌트에 `transition: none` 규칙을 따로 쓰지 않는다. 시간이 0이 되어도 모양이 남는 경우(지나가는 진행 줄 → 선 줄, 미끄러지는 토스트 → 제자리)만 reduce 규칙을 둔다. 화면이 바뀌면 블록 `Page`가 흐림 → 선명 + 4px 위로 한 단계(`duration.normal`), 차트는 첫 그리기만 선이 드러나고 막대가 자란다. 숫자를 세어 올리지 않는다.
- 화면 행동(PR-26, D-90): PageHeader actions는 라벨 단추가 기본이고 크기를 정하지 않은 단추는 `control-height-lg`로 한 단계 크다. 아이콘 전용 단추는 3차 행동(보기 설정 · 더보기)에만. 목록 행 안 행동은 sm.
- 불러오는 중(PR-27, D-93): 내용을 불러오는 동안 실제 내용과 같은 모양의 Skeleton을 바로 그린다(표 화면 = `shape="table"`, 사람 목록 = `list`, 숫자 줄 = `kpi`, 카드 = `card`). Skeleton이 `duration.normal` 뒤에 나타나므로 앱이 따로 지연을 두지 않는다. 화면 가운데 Spinner 하나 · 빈 화면 · 글줄 몇 개로 때우지 않는다. 앱 첫 진입은 틀(사이드바 · 바) 모양부터.
- 사이드바 위(PR-27, D-91): 사이드바 안 요소는 `color.nav.*`만 쓴다(짙은 면 위 대비). 짙은 면 위 포커스 링은 `nav.focus`.
- 포커스 링: `_internal/focus.css`의 `.tl-focusable:focus-visible { outline: var(--tl-border-width-2) solid var(--tl-color-border-focus); outline-offset: 2px }`. 모든 인터랙티브 루트가 이 클래스를 가진다.
- 치수: 컨트롤 높이는 `--tl-density-control-height-{xs,sm,md,lg,xl}`(xs 26 · sm 30 · md 36 · lg 42 · xl 48, touch 44 · 44 · 48 · 56 · 56, D-97), 행 높이 `--tl-density-row-height`(compact 36 · comfortable 40), 카드 패딩 `--tl-density-card-padding`. 본문 `--tl-density-body-font-size`. 손가락 크기는 `--tl-size-touch-{min,control,main}`(44 · 48 · 56).
- 회사 색(D-97 · D-98): 회사 색을 따라가는 토큰(brand.* · fg.link · border.focus · focusStrong · selected · bg.rowSelected · bg.nav · nav.*)은 엔진이 회사 색마다 대비를 맞춘다. 컴포넌트는 브랜드 글자에 fg.link, 글자 아닌 강조(진행 막대 · 로고 · 선택 점)에 brand.accent, 선택 · 현재 표시 선에 border.selected를 쓴다. brand.default는 흰 글자를 얹는 바탕과 채움(단추 · 체크박스)에만.
- 접근성 모드(D-97): `data-focus="strong"` · `data-links="underline"` · `data-contrast="high"`의 모양 규칙과 손가락 입력(xs · sm 단추 누르는 영역 36 · 44)은 `_internal/a11y-modes.css` 한 곳. 컴포넌트가 따로 두지 않는다.
- 숫자·금액: `formatAmount(value, { unit: '원' | false, sign: 'auto' | 'always' })`(contracts `_shared/format.ts`) → `1,234,567`, 음수는 `−`(U+2212). 금액 셀은 `tl-amount` 클래스(우측 정렬, tabular-nums, `--tl-type-amount-*`).
- 무게 · 점(PR-38, D-140 · D-142): 한 화면의 카드 무게는 세 단계까지다. Card `emphasis="strong"`(진한 테두리 + 한 단계 큰 제목)은 "지금 해야 할 것" 한 구역에만 두고 화면에 하나, 참고 정보 · 카드 안 카드는 `quiet`(테두리 · 면 없음). 그림자 · 색 면 · 왼쪽 띠로 올리지 않는다. 점은 두 뜻에만 쓴다: 상태(StatusDot · Badge 점)와 범주 식별(범주 태그, PR-33). neutral Badge · DueBadge의 먼 단계는 기본 점이 없다. 표 한 장 안에서는 StatusDot을 한 크기로 쓴다(표 칸은 sm, 크기를 섞으면 줄마다 들쭉날쭉하다).
- 구역 제목(PR-38, D-143): 카드 밖 구역 제목(카드 묶음 · 표 위)은 `SectionHeader` 하나로 한다. 크기 단계는 화면 제목(PageHeader h1) > 구역 제목(`type.h2`) > 카드 제목(`type.h3`).
- 왼쪽 강조 띠 금지(D-57): 상태 · 선택 · 인용을 카드나 행 왼쪽의 굵은 색 선으로 표시하지 않는다. 상태는 점 · 아이콘 · 배지 · 글자, 선택은 바탕 한 단계나 1px 테두리 전체로 보인다. 트리 연결선 · 패널 가장자리 같은 구조 선은 예외. 블록은 `check-blocks.mjs`가 막는다.
- 문구(D-65): 컴포넌트가 직접 그리는 글자 · 접근성 이름 · 기본 placeholder는 contracts `_shared/messages.ts` 사전에서 `useMessages()`로 꺼낸다(ko · en 키가 같아야 한다, 테스트). 소스에 한국어 리터럴을 쓰지 않는다(`test/strings.test.ts`, 개발 경고는 예외). 숫자 · 금액 · 날짜 서식은 locale과 관계없이 한국 업무 관습. locale은 `TrellisProvider`가 정하고 기본은 ko.
- 휴대폰 규칙(D-61): 폭이 `breakpoint.sm` 미만이면 루트 밀도가 `touch`(행 48 · 컨트롤 32/40/48 · 본문 15/22 · 입력 글자 16)가 된다. 입력 칸 글자는 `--tl-density-input-font-size`를 쓴다(본문 토큰이 아니다). DataGrid는 행마다 카드(`mobile="scroll"`은 비교용 매트릭스만), AppShell은 `tabs`로 아래 탭바, KpiCard는 두 열, Tabs는 넘치는 쪽을 흐리게. 데모 검사는 1440과 390 두 폭에서 돌고 390에서 가로 넘침은 실패다. JS에서 폭으로 모양을 바꿔야 하면 공개 훅 `useBreakpoint()`(`_internal/breakpoint.ts`, 토큰 `breakpoint.*`, `base` = sm 미만)를 쓴다. matchMedia 문자열을 컴포넌트 · 블록마다 다시 만들지 않는다(R-T13). AppShell은 sm 미만에서 `userName`이 있으면 user 칸을 아바타 단추 하나로 줄인다(R-T12).
- 좁은 화면 고르기(D-60): 폭이 `breakpoint.sm`보다 좁으면 고르는 팝업(Select · MultiSelect · DateField 달력 · PeriodPicker · FilterBar 필터 · Menu · CodeSearch)은 `_internal/sheet.tsx`의 아래 시트(Base UI Drawer, 아래로 쓸어 닫기)로 연다. props는 같고 모양만 바뀐다. 시트 행은 밀도와 관계없이 `space.48`, 시트 안 입력 칸 글자는 16(iOS 확대 방지). 달력은 `_internal/calendar.tsx`(react-day-picker, D-11) 하나를 쓴다.
- 아이콘: `@terracelab/trellis-icons`의 `<Icon name size={16|20|24} />`만. Lucide 직접 import 금지(어댑터 1곳).
- headless 어댑터: `_headless/<primitive>.ts`가 `{ Root, Trigger, Portal, Backdrop, Popup, … }`처럼 중립 이름으로 재export한다. D1이 바뀌면 이 폴더만 바뀐다.
- Provider: `<TrellisProvider theme density locale>`가 `<html>` 속성을 설정하고, `tokens.css`·`fonts.css`·`styles.css` import 안내를 README에 둔다. Provider 없이도 CSS만으로 동작해야 한다(Django 호환).
- 빌드: Vite lib 모드, 컴포넌트별 엔트리 + `preserveModules`, 외부화 `react · react-dom · @base-ui-components/react`, CSS는 컴포넌트별 파일 + `styles.css`, `package.json` `exports`에 `./<Name>`, `./styles.css`, `./tokens.css`, `sideEffects: ["**/*.css"]`.

## 9. 네이티브 구현 규칙

- `TrellisProvider`가 `{ mode, density }` 컨텍스트 제공. `useTheme()` → `themes[mode]`, `useDensity()` → `density[d]`. `makeStyles((t, d) => StyleSheet.create(...))`는 (mode, density)별 메모.
- props는 contract와 동일. 플랫폼 매핑: Select → 바텀시트, Dialog → `Modal`, Drawer → 바텀시트, Toast → 자체 오버레이, DataGrid → `ListTable`(FlatList, 고정 열, 인라인 편집 없음), AppShell → 탭바 + 스택(네비게이션 라이브러리 비의존: 화면을 props로 받는다), Tooltip → `platforms.native=false`, Popover → 자체.
- 상태: `Pressable`의 `pressed`·`focused`를 hover/active/focus 토큰에 매핑. `accessibilityState={{ disabled, busy }}`.
- 서체: 패키지 자산의 Pretendard Variable을 `expo-font`로 로드하는 `useTrellisFonts()` 제공. 숫자는 `fontVariant: ['tabular-nums']`.
- 테스트: jest-expo + RNTL, contract 테스트 공유. 스냅샷은 렌더 트리.
- 빌드: react-native-builder-bob(commonjs + module + typescript). `react-native-svg` peer.

## 10. 패턴·템플릿

| 패턴 | 코드 이름 | 구성 | 코드로 강제하는 규칙 |
|---|---|---|---|
| 알림 카드 홈 | `NotificationHome` | AppShell + DashboardGrid(12열, 컴포넌트 PG-39) + NotificationCard + KpiCard | 카드 span은 4·6·12만 허용(타입), 카운트 배지 우상단 고정, 카드 `onPress` 필수 |
| 목록·상세 | `ListDetail` | FilterBar + DataGrid + Pagination + Drawer | FilterBar 1행, DataGrid가 남은 높이 전부, Drawer 안에서 Drawer 열면 개발 모드 경고 |
| 폼·등록 | `FormRegister` | Form(2열) + FormRow + Field + 하단 고정 ActionBar | 라벨 좌 120px(compact), 필수 표시 점, 저장 우하단 · 취소 그 왼쪽(ActionBar가 순서 고정) |
| 결재·승인 | `ApprovalFlow` | ApprovalLine + 본문 + Attachment + 승인·반려·회수 액션 | 상태 배지는 `Badge variant="approval"`만, 반려 · 회수 사유는 ReasonDialog(사유가 모자라면 확인이 꺼지고 바깥 누름으로 닫히지 않는다), 결재선은 가로 Stepper |
| 대화형 작업 | `ConversationalWork` | MessageThread(answer: RunSteps · RichText · Citation) + 결과 카드(파일·그리드·ProposalCard) + Composer(SuggestionChips) + CommandPalette | 답변은 MessageThread answer와 카드 컴포넌트로만, 데이터 변경은 ProposalCard(사람 승인, 반려 사유 필수), 실행 상태는 AGENT_RUN_STATES 6개, 파일은 Attachment, 입력창 하단 고정. 화면 두 가지는 patterns/ConversationalWork/spec.md(PG-30) |
| 오류 화면 | `ErrorPage` | EmptyState(`notFound` · `forbidden` · `expired`, `headingLevel={1}`) + 홈으로 · 이전 화면 · 다시 로그인 Button | 블록 패턴(block.json `pattern`, D-127). 메뉴에 넣지 않고 틀 안 · 밖 어디서나 그린다. 로그인 만료는 보던 화면(`?next=` 블록 id)을 로그인에 넘기고 로그인은 그 화면으로 돌려보낸다(오류 · 로그인 화면으로는 돌아가지 않는다). 블록 `platform/errors/not-found` · `platform/errors/forbidden`(로그인 만료 `platform/errors/expired`는 로그인 흐름이라 `Auth` 패턴) |

- 패턴은 `packages/react/src/patterns/<Name>/`, spec은 `packages/contracts/src/patterns/<Name>/spec.md`(§3 템플릿에서 Variants·States 대신 "구성 규칙"·"반응형" 절).
- 템플릿은 `templates/src/<Name>Page.tsx` + `templates/src/mock/`(결정적 mock 데이터, 날짜 고정). Storybook `Templates/*`가 1440·1024·390으로 렌더. 새 화면은 반드시 템플릿 복사에서 시작한다.
- 모바일: 모든 패턴이 휴대폰 폭에서 동작한다(D-61). 목록은 카드, 상세는 아래 시트(Drawer side=bottom), 폼은 한 열.

## 11. 차트 계열 (D-39)

15종: `ChartCard`(컨테이너) · `TrendChart` · `ComboChart` · `BarList` · `WaterfallChart` · `Donut` · `SegmentedBar` · `CalendarHeatmap` · `Sparkline` · `Legend`(Recharts 3 래퍼) · `RadialMeter` · `BulletBar` · `DataBar` · `HeatCell` · `FunnelChart`(순수 SVG/div, 표 칸 · 단계용). 공통 규칙은 `packages/contracts/src/charts/README.md`, 선택 규칙은 아래.

| 사용자의 질문 | 형식 | 컴포넌트 |
|---|---|---|
| 지금 얼마나? | 숫자 + 작은 추이 | StatCard + `Sparkline` |
| 시간에 따라 어떻게? | 선·영역 | `TrendChart` |
| 앞으로 얼마나? | 실적 실선 + 예측 점선 + 신뢰 구간 | `TrendChart` `forecast` |
| 양과 흐름을 같이? | 막대 + 선(다른 단위는 아래 차트) | `ComboChart` |
| 구성이 어떻게 바뀌나? | 쌓은 막대(3계열 이상, 6개부터 "기타") | `ComboChart` `stacked` |
| 범주별로 얼마나? | 막대(가로·세로, 한 색) | `BarList` |
| 전체에서 각각? | 한 줄 막대 · 도넛(≤ 5) | `SegmentedBar` · `Donut` |
| 날짜마다 얼마나? | 한 색 진하기 5단계 | `CalendarHeatmap` |
| 더하고 빼서? | 워터폴(증가 빨강 · 감소 파랑) | `WaterfallChart` |
| 단계마다 얼마나 남나? | 왼쪽 정렬 가로 막대(한 색) + 전환율 | `FunnelChart` |
| 목표·한도 대비? | 링 하나 · 목표 막대 목록 | `RadialMeter` · `BulletBar` |
| 표 안에서 비교? | 칸 안 막대 · 조건부 색 | `DataBar` · `HeatCell` |

- 색: props는 `ChartColor` 슬롯(`series-1`~`series-5` · `compare` · `income` · `expense` · `success` · `warning` · `danger`)만. 토큰은 `color.chart.*`(§tokens.md 2). 계열은 항목에 고정, 순위 재채색 금지, 5개 초과는 "기타"(`foldSeries`, 회색 `compare`를 다섯째 옆에).
- 축은 하나(이중 축 금지). 모든 차트는 `ChartCard.table`로 표 대체를 제공한다. 차트 루트 `role="img"` + `ariaLabel` 필수.
- Recharts를 import하는 곳은 `packages/react/src/<차트>/`뿐이다. 네이티브는 같은 contract로 `react-native-svg`(Phase 3).
- 숫자: `formatAmount`(천 단위, U+2212) · 큰 금액 축 `formatCompactWon`(만·억) · 비율 `formatPercent`(소수 1자리, 차이는 %p).
