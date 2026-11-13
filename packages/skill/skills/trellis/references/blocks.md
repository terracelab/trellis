# 화면 블록 가져오기

블록은 복사해서 소유하는 화면 소스다. 복사한 뒤에는 서비스 코드이고, Trellis가 바뀌어도 저절로 바뀌지 않는다.

```bash
pnpm ds:add --list                       # 블록 목록(id · 제목)
pnpm ds:add erp/tax/invoice-list         # apps/web/src/blocks/erp/tax/invoice-list 로 복사
pnpm ds:add erp/tax/invoice-list --force # 다시 받기(서비스에서 고친 내용은 사라진다)
```

- 복사하면 `../../../_data` · `_platform` · `_ui` 상대 경로가 `@terracelab/trellis-blocks/...`로 바뀐다.
- 출처 커밋은 `.trellis/blocks.lock`에 남는다. 나중에 Trellis 블록과 비교할 때 쓴다.
- 블록은 샘플 데이터(`@terracelab/trellis-blocks/data`)로 돈다. 서비스 데이터로 바꿀 때는 import를 서비스 API 훅으로 바꾸고, 행 타입은 샘플 타입 모양을 따른다.
- 블록의 `block.json` slots가 고쳐도 되는 자리다. 배치 · 위계 · 컴포넌트 선택은 되도록 그대로 둔다.
- 블록이 쓰는 공용 코드는 아래 두 진입점이다. 표에 없는 이름은 내부용이라 쓰지 않는다.

## 플랫폼 API(`@terracelab/trellis-blocks/platform`)

로그인 사용자 · 회사 · 역할 · 권한 · 알림 · 앱의 화면 목록을 블록에 건넨다. 앱 루트에 `PlatformProvider` 하나를 두고, 화면은 훅으로 읽는다.

### PlatformProvider props

| 이름 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `children` | `ReactNode` | | 앱 |
| `session` | `Session` | 샘플 회사 · 사용자 | 로그인 뒤 받은 사용자 · 회사 · 역할. 없으면 샘플(테라트레이딩)로 돈다 |
| `notifications` | `readonly NotificationEvent[]` | session이 없으면 샘플, 있으면 `[]` | 알림 목록 |
| `onMarkRead` | `(ids: readonly string[]) => void` | | 읽음 처리를 서버에 보낸다. 화면의 읽음 표시는 Provider가 바로 바꾼다 |
| `initialRole` | `string` | `'admin'` | 처음 고른 역할 id. session을 주면 `session.roles` 안에서 고르고, 맞는 id가 없으면 모든 역할의 합집합 권한 |
| `screens` | `readonly string[] \| (id: string) => boolean` | 모든 화면이 있다고 본다 | 앱에 들어 있는 화면(블록 id). 블록은 여기 없는 화면으로 가는 단추 · 링크를 그리지 않는다 |
| `screenHref` | `(id, params?) => string` | 해시 주소 `#/<id>?k=v` | 블록 id → 앱 주소. 브라우저 라우터를 쓰면 바꾼다 |
| `navigate` | `(id, params?) => void` | 해시를 바꾼다 | 화면 이동. 브라우저 라우터를 쓰면 라우터의 navigate를 부른다 |
| `params` | `Record<string, string \| undefined> \| URLSearchParams` | 해시 쿼리 | 지금 화면 주소 값(블록의 `useScreenParams`). 라우터가 Provider 안에 있으면 레이아웃 경로에서 `ScreenParamsProvider params={search}`로 감싼다 |

`params`는 `Readonly<Record<string, string>>`이다(`{ id: 'LV-2611-0021' }`).

### 데이터 모양

| 타입 | 칸 |
|---|---|
| `Session` | `user: User` · `company: Company` · `roles: readonly Role[]` |
| `User` | `id` · `name` · `title`(직위) · `department` · `email` · `roleIds: readonly string[]` · `status: 'active' \| 'invited' \| 'locked'` · `mfa: boolean` · `lastLoginAt?` |
| `Company` | `id` · `name` · `bizNo`(숫자 10자리) · `ceo` · `address` · `currency: CurrencyCode` · `tradeCurrencies: readonly CurrencyCode[]` · `modules: readonly ModuleId[]`(켜진 모듈) |
| `Role` | `id` · `name` · `description` · `scope: DataScope` · `permissions: Record<ModuleId, readonly Action[]>`(`'*'`은 모든 모듈) |
| `DataScope` | `'company' \| 'division' \| 'department' \| 'self'`(라벨 `SCOPE_LABELS`: 전사 · 본부 · 부서 · 본인) |
| `Action` | `'read' \| 'create' \| 'update' \| 'delete' \| 'approve' \| 'export'`(목록 `ACTIONS`, 라벨 `ACTION_LABELS`) |
| `ModuleId` | `string`. `@terracelab/trellis-tokens/modules`의 모듈 id(`approval` · `tax` · `attendance` …) |
| `NotificationEvent` | `id` · `module` · `event` · `title` · `body?` · `createdAt`(ISO) · `read` · `tone: 'neutral' \| 'danger'`(지연 · 오류만 danger) · `count?` · `link?`(누르면 갈 화면의 블록 id) |
| `ScreenLinks` | `has(id)` · `href(id, params?)` · `go(id, params?)`(없는 화면이면 아무것도 하지 않는다) |
| `PlatformAdapter` | 백엔드가 구현할 경계: `auth` · `permissions` · `notifications` · `jobs` · `audit`. 서비스 API 클라이언트의 모양을 맞출 때 본다 |

알림 받는 방법 · 배치 작업 · 감사 로그 타입(`NotificationRule` · `NotificationChannel` · `BatchJob` · `JobRun` · `AuditEntry`)은 플랫폼 블록(`platform/*`)이 쓴다.

### 훅과 함수

| 이름 | 돌려주는 것 | 쓰는 곳 |
|---|---|---|
| `usePlatform()` | `{ session, setRole, can, notifications, markRead, screens }` | Provider 안 어디서나. 밖에서 부르면 오류 |
| `usePlatform().setRole(roleId)` | | 역할 바꾸기. session의 역할이 여럿이면(겸직 · 데모) 그 안에서 하나를 고른다. 이후 `session.roles`는 고른 역할 하나 |
| `usePlatform().can(module, action)` | `boolean` | 권한 판단 |
| `usePlatform().markRead(ids)` | | 읽음 표시 + `onMarkRead` 호출 |
| `useCan(module, action)` | `boolean` | 버튼 막기: `const canApprove = useCan('approval', 'approve')` |
| `useScreens()` | `ScreenLinks` | 다른 화면으로 가는 단추 · 링크. `screens.has(id) && <Button onPress={() => screens.go(id, { id: doc.id })}>` |
| `useScreenExists(id)` | `boolean` | 그 화면이 앱에 있는지 |
| `useScreenParams()` | `Record<string, string>` | 지금 화면 주소 값: `const { id } = useScreenParams()`. 블록은 `window.location`을 읽지 않는다 |
| `useOpenLink()` | `(link?: string) => (() => void) \| undefined` | 링크 규칙 `'블록 id'` · `'블록 id?k=v'`를 누르는 함수로. 화면이 앱에 없으면 undefined라 단추를 그리지 않는다: `const open = useOpenLink()('platform/import/excel'); open && <Button onPress={open}>…` |
| `linkTarget(link)` | `{ id, params? }` | 링크 글자를 블록 id와 값으로 나눈다. 로그인 `?next=`처럼 링크를 값으로 받을 때 |
| `useScope()` | `{ scope, label, canSee }` | 데이터 범위. 목록은 `canSee(사람)`으로 거르고 범위 밖 사람으로 가는 링크는 그리지 않는다 |
| `can(session, module, action)` | `boolean` | 훅 밖(서버 응답 처리 등)에서 같은 계산. 역할 여럿이면 합집합 |

샘플 데이터 `COMPANY` · `ROLES` · `USERS` · `NOTIFICATIONS` · `NOTIFICATION_RULES` · `JOBS` · `AUDIT`도 같은 진입점에 있다. 화면 개발 중 자리 채우기로만 쓴다.

### 블록 패턴과 고르는 법

`block.json`의 `pattern`이 화면 유형이다. 요청을 유형으로 바꾼 뒤 같은 유형 블록을 `pnpm ds:add --list`에서 고른다.

| 패턴 | 화면 | 블록 예 |
|---|---|---|
| `Dashboard` · `NotificationHome` | 대시보드 · 홈. 순서는 `guides/dashboards.md` | `home/dashboard/trade` · `home/dashboard/people` · `erp/sales/analysis` · `home/dashboard/forecast`(수요 예측 · 발주 추천) · `home/dashboard/franchise`(가맹점 현황) |
| `ConversationalWork` | 에이전트 대화 · 메신저. 순서는 `guides/conversation.md` | `platform/assistant/chat`(전체 화면) · `ecm/my-docs/ask`(업무 화면 옆 칸) · `groupware/messenger/chat` |
| `ErrorPage` | 주소 없음 · 권한 없음. 메뉴에 넣지 않고 틀 안 · 밖에서 그린다 | `platform/errors/not-found` · `platform/errors/forbidden` |
| `Auth` | 로그인 · 로그인 만료. 만료 화면은 `?next=<블록 id>`를 로그인에 넘기고 로그인은 그 화면으로 돌려보낸다 | `platform/auth/login` · `platform/errors/expired` |
| `LedgerEntry` · `WarehouseScan` | 전표 · 대사 입력, 휴대폰 스캔 작업 | `erp/accounting/journal` · `erp/treasury/reconcile` · `scm/inventory/count` · `scm/warehouse/picking` |
| `FormRegister` | 등록 · 업로드 | `platform/import/excel`(CSV 업로드 · 줄 검증 · 반영) |

그 밖의 유형(`ListDetail` · `ApprovalFlow` · `Settings` · `TaxFiling` · `OrderDetail` · `FloorBoard` · `InventoryMatrix`)은 `guides/patterns.md`의 표를 본다.

### 브라우저 라우터에 잇기

블록 id와 앱 경로를 표 하나로 잇는다. `navigate`가 라우터 훅을 쓰므로 Provider를 라우터 안(레이아웃 라우트)에 둔다.

```tsx
import { PlatformProvider, type Session } from '@terracelab/trellis-blocks/platform';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';

// 블록 id → 앱 경로. 여기 있는 화면만 블록이 링크한다
const ROUTES: Record<string, string> = {
  'groupware/approval/inbox': '/approval',
  'groupware/approval/document': '/approval/doc',
};
const href = (id: string, params?: Readonly<Record<string, string>>) =>
  `${ROUTES[id] ?? '/'}${params ? `?${new URLSearchParams(params)}` : ''}`;

export function Platform({ session, children }: { session: Session; children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <PlatformProvider
      session={session}
      screens={Object.keys(ROUTES)}
      screenHref={href}
      navigate={(id, params) => navigate(href(id, params))}
    >
      {children}
    </PlatformProvider>
  );
}
```

## 화면 도우미(`@terracelab/trellis-blocks/ui`)

블록의 배치와 문구 · 날짜 계산을 맡는다. 클래스는 `@terracelab/trellis-blocks/ui.css`(진입 파일에서 `styles.css` 뒤)에 있다.

### 배치

| 이름 | props | 하는 일 |
|---|---|---|
| `Page` | `header?: ReactNode` · `children` · `fill?: boolean`(false) · `width?: 'wide' \| 'form'`('wide') | 화면 한 장. 위에 PageHeader, 아래 본문. `fill`이면 본문이 남은 높이를 채운다(목록 · 상세). `form`은 폼 폭 |
| `Grid` | `children` · `gap?: 'gutter' \| 'tight'`('gutter') | 12열 격자. 1024 미만 한 열, 1280 미만에서는 3 · 4열 칸이 반으로 |
| `Col` | `span?: 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9 \| 12`(12) · `rows?: 1 \| 2` · `children` | Grid 안 칸 |
| `Row` | `children` · `justify?: 'between' \| 'start' \| 'end'`('between') · `wrap?: boolean`(true) | 가로 한 줄(툴바 · 요약 줄) |
| `Stack` | `children` · `gap?: 'sm' \| 'md' \| 'lg'`('md') | 세로 쌓기 |
| `Split` | `main: ReactNode` · `aside?: ReactNode` · `asideWidth?: 'md' \| 'lg'`('md') | 목록 + 오른쪽 상세(넓은 화면에서 Drawer 대신 나란히) |
| `Figure` | `label: string` · `value: ReactNode` · `unit?: string` · `tone?: 'income' \| 'expense' \| 'danger'` | 카드 안 숫자 한 줄(라벨 · 값 · 단위) |
| `Muted` | `children` | 작은 보조 글자(설명 · 메타) |

### 같은 묶음 화면(제목 줄 탭)

| 이름 | 모양 | 하는 일 |
|---|---|---|
| `SiblingScreen` | `{ id: string; label: string }` | 블록 id와 제목 글자 |
| `useSiblings(current, screens)` | `(string, readonly SiblingScreen[]) => { siblings?, onSiblingPress? }` | PageHeader에 펼쳐 넣는다: `<PageHeader title="…" {...useSiblings(ID, LIST)} />`. 앱에 없는 화면은 빼고, 남은 것이 하나면 빈 객체 |
| `HR_SCREENS` | 인사 기록 · 인사 마스터 · 조직도 | 샘플 목록. 서비스는 제 화면 이름으로 목록을 만들어 넘긴다 |
| `PAY_SCREENS` | 급여 대장 · 임금명세서 | 샘플 목록 |

### 문구 · 날짜

| 이름 | 모양 | 예 |
|---|---|---|
| `josa(word, pair)` | pair `'은/는' \| '이/가' \| '을/를' \| '과/와' \| '으로/로'` | `josa('평택 냉동센터', '으로/로')` → `'평택 냉동센터로'`. 데이터에서 온 이름에 조사를 붙일 때 |
| `addDays(date, n)` | ISO 날짜 → ISO 날짜 | `addDays('2026-11-06', -7)` → `'2026-10-30'` |
| `monthStart(date, n = 0)` · `monthEnd(date, n = 0)` | n달 뒤 1일 · 말일 | `monthEnd('2026-11-06')` → `'2026-11-30'` |
| `monthLabel(date, n = 0)` | `'11월'` | 기간 버튼 글자 |
| `weekStart(date)` | 그 주 월요일 | |
| `yymm(date)` | `'2611'` | 문서 번호의 연월 |

날짜는 `YYYY-MM-DD` 문자열이고 시간대 없이 계산한다. 화면에 날짜 글자를 고정하지 않고 기준일(서비스의 오늘)에서 계산한다.

### 테마 미리보기

| 이름 | 하는 일 |
|---|---|
| `ThemeChips` | 컬러칩 · 회색 톤 · 색 직접 입력. props `value: ThemeChoice` · `onChange` |
| `useThemeChoice(storageKey?, base?)` | 고른 테마를 화면 전체에 바로 입힌다. `{ choice, setChoice, reset, theme }` |
| `themeCommand(choice)` | 확정 명령 글자(`pnpm ds:theme --brand "#…" --neutral …`) |
| `ThemeChoice` · `DEFAULT_THEME` | `{ brand: string; neutral: 'cool' \| 'neutral' \| 'warm' }` · 기본 주황 |

시작 템플릿의 화면 설정(`pages/Settings.tsx`)이 이 셋을 쓴다. 확정은 `pnpm ds:theme`이 theme.css로 남긴다.
