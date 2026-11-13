# 플랫폼 기본 기능 규격 (테라스원)

테라스원은 고객사마다 맞춰 구축하는 업무 플랫폼이다(D-49). 화면은 Trellis 블록으로 조립하고(D-51), 모든 구축에 들어가는 **기본 기능**(로그인 · 권한 · 알림 · 배치 · 감사 · 회사 설정)은 이 문서의 모양으로 고정한다. 화면 블록은 이 모양만 보고, 실제 백엔드는 `PlatformAdapter`를 구현해 같은 모양을 돌려준다. 데모(`apps/demo`)는 같은 모양을 샘플 데이터로 채운 것이다.

- 타입 원본: `blocks/src/_platform/types.ts`
- 데모 구현: `blocks/src/_platform/mock.ts` · `PlatformProvider.tsx`
- 화면: `blocks/src/platform/*`(로그인 · 사용자 · 권한 · 알림 센터 · 배치 작업 · 감사 로그)

## 1. 층

```
고객사 앱(테라스원 구축 1건)
  ├─ 화면 블록(복사해 소유, 업무 로직은 여기서 고친다)
  ├─ @terracelab/trellis-react · tokens · contracts(디자인 규칙, npm 의존)
  └─ PlatformAdapter 구현(API 클라이언트)
          │ HTTPS JSON
테라스원 백엔드(고객사별 배포 또는 다중 회사)
  ├─ 기본 기능: 인증 · 권한 · 알림 · 배치 · 감사 · 회사 설정
  ├─ 업무 모듈: 세무 · 회계 · 구매 · 입출고 · 재고 · 수출입 …
  └─ 외부 연동: 전자세금계산서 전송 사업자(ASP) · 국세청 사업자 상태 조회 · 환율 · 포워더 · 판매 채널
```

권한 검사는 **서버가 진실**이다. 화면의 `useCan`은 버튼을 숨기거나 막는 표시용이고, 같은 판정을 API가 다시 한다.

## 2. 인증

| 항목 | 규칙 |
|---|---|
| 로그인 | 회사 코드 + 아이디 + 비밀번호. 회사 코드가 테넌트를 고른다 |
| 2단계 인증 | 인증 앱 6자리(TOTP). 관리자 · 경영지원 역할은 필수, 나머지는 회사 설정 |
| SSO | 회사 계정(SAML · OIDC) 선택. 켜면 비밀번호 로그인을 막을 수 있다 |
| 세션 | 로그인 상태 유지 14일(기기별), 비활동 8시간이면 다시 인증 |
| 잠금 | 비밀번호 5회 실패 → 잠금, 관리자가 해제(감사 로그에 남는다) |
| 화면 | `platform/auth/login`(Auth 패턴, 틀 없이 전체 화면). 고객사 로고 자리는 brand 슬롯 |

`auth.signIn → { mfaRequired }`, `auth.verifyMfa(code) → Session`, `auth.signOut()`.

## 3. 권한(RBAC)

- **동작 6**: 조회(read) · 등록(create) · 수정(update) · 삭제(delete) · 승인 · 발행(approve) · 다운로드(export). 화면 버튼은 이 여섯으로만 막는다.
- **역할** = 모듈별 허용 동작 + **데이터 범위**(전사 · 본부 · 부서 · 본인). `*`는 모든 모듈.
- 사용자는 역할을 여럿 가질 수 있고 권한은 **합집합**이다.
- 기본 역할 5: 관리자 · 경영지원 · 구매 · 물류 · 감사(조회). 고객사마다 추가한다.
- 화면: `platform/admin/users`(계정 · 역할 · 2단계 인증 · 잠금), `platform/admin/roles`(역할 × 모듈 × 동작 매트릭스, 데이터 범위).

`permissions.can(session, module, action)`. 블록은 `useCan('tax', 'approve')`처럼 쓴다.

데이터 범위는 `useScope()`가 준다. `scope`는 역할 가운데 가장 넓은 범위이고, `canSee({ userId, name, department, division })`가 그 사람이 범위 안인지 답한다. 본인은 언제나 보인다. 본부를 모르면 부서로 비교한다. 사람 목록을 보이는 블록(구성원 · 인사 마스터 · 조직도 링크 · 팀 근태 · 인사 홈 보기)은 이것으로 거르고, 범위 밖 사람으로 가는 링크를 그리지 않는다. 판정 함수는 `scopeOf` · `inScope` · `scopeAtLeast`(types.ts)이고 서버가 같은 판정을 다시 한다.

## 4. 알림

- **이벤트**는 모듈이 낸다(`receiving.arrived`, `invoice.failed` …). 이벤트마다 기본 문구 · 톤(지연 · 오류만 danger, D-35) · 이동할 화면(블록 id)을 정한다.
- **`NotificationEvent.link`는 블록 id 하나**다. 앱 경로를 넣지 않는다. 화면 값이 있으면 쿼리로 붙인다: `groupware/approval/document?id=AP-2611-014`. 블록과 알림 서랍은 `useOpenLink()(n.link)`(안에서 `linkTarget` → `screens.has` · `go`)로 열고, 앱 경로는 `screenHref`가 만든다.
- **채널 4**: 앱(항상) · 메일 · 문자 · 알림톡. 이벤트 × 채널 규칙을 회사가 정하고, 사용자는 끌 수만 있다.
- 문자 · 알림톡은 업무 시간(08:00~20:00)에만 보내고, 그 밖은 다음 업무 시간에 묶어 보낸다.
- 화면: 글로벌 바 알림 Drawer(`NotificationList`: 날짜 묶음 · 읽지 않은 것 먼저 · 모두 읽음, 줄은 `NotificationItem`, 시각은 `formatRelativeTime`), `platform/notifications/center`(목록 · 받는 방법), 대시보드의 "오늘 처리할 일".

`notifications.list({ unreadOnly, module })`, `markRead(ids)`, `rules()`, `saveRules(rules)`.

## 5. 배치

- 작업 = 이름 · 모듈 · cron · 사람이 읽는 주기 · 담당 · 사용 여부 · 실행 이력(상태 `JOB_STATES` · 처리 · 실패 · 로그).
- 실패하면 담당자에게 알림(`job.failed`), 자동 재시도 3회(5분 · 15분 · 60분).
- 수동 실행은 `approve` 권한이 있는 사람만, 감사 로그에 남긴다.
- 화면: `platform/jobs/batch`.

`jobs.list()`, `runNow(jobId)`, `setEnabled(jobId, enabled)`.

## 6. 감사

누가 · 언제 · 무엇을 · 어디서(IP). 로그인 · 권한 변경 · 발행 · 삭제 · 다운로드 · 배치 실행은 반드시 남긴다. 수정할 수 없고 5년 보관한다. 화면: `platform/audit/log`. `audit.list({ from, to, actor })`.

## 7. 회사 설정

회사 정보(상호 · 사업자등록번호 · 대표 · 주소) · 기능 통화와 거래 통화 · **켜진 모듈**(구축 범위) · 고객 테마(브랜드 색 · 로고, `trellis theme`, 트랙 F PF-07). 켜진 모듈이 사이드바 · 알림 · 권한 매트릭스의 범위가 된다.

## 7.1 회사 운영 정보(블록 문구 · 기준)

블록은 회사마다 다른 말과 기준을 코드에 쓰지 않고 `blocks/src/_data/profile.ts`의 `PROFILE`에서 읽는다(PR-11). 회사 하나 = 파일 하나다.

| 항목 | 내용 | 쓰는 블록 |
|---|---|---|
| `NOW` · `NOW_AT` | 데모 시계(TODAY와 함께 모든 블록이 쓰는 시각 하나) | 그룹웨어 · 현장 보드 · 채널 동기화 |
| `work` | 출근 · 퇴근 · 연장 시작 시각, 근무지 | 근태 |
| `cold` | 냉동 · 냉장 온도 기준. 콜드체인이 없는 회사는 `null` | 입고 · 배차 · 기사 앱 |
| `shipping` | 출고 마감 · 포장 문구 · 배송 방법(창고 지정) | 이커머스 주문 · 상품 등록 · 출고 |
| `approval` | 결재선 순서(사용자 id · 역할) · 대표 결재 금액 | 기안 · 발주 · 결재 |
| `people` | 대표 · 관리 · 재무 · 구매 · 물류 · 영업 담당자(사용자 id) | 알림 · 담당자 표시 |
| `claimRejectReasons` · `taxTypes` · `lotWarnDays` · `returnsWarehouseId` | 클레임 반려 사유 · 과세 구분 · 유통기한 주의 일수 · 반품 창고 | 클레임 · 세금계산서 · 로트 |

이름은 `_platform/mock.ts`의 사용자 · `_data`의 창고에서 id로 가져오므로, 그 파일을 바꿔 끼우면 이름도 따라 바뀐다. `check-blocks.mjs`는 블록 코드에 샘플 고유명사(사람 · 거래처 · 품목 · 창고 이름)가 남으면 실패한다.

## 7.2 화면 링크

블록 사이 이동(행 누르기 · 알림 링크 · 이동 단추 · 경로 · 뒤로)은 `useScreens()`로만 한다. 앱이 그 화면을 켜지 않았으면 링크 · 단추를 그리지 않는다.

- `PlatformProvider screens`: 켜진 블록 id 목록 또는 `(id) => boolean`. 없으면 모든 화면이 있는 것으로 본다(데모).
- `screenHref(id, params?)`: 기본은 `#/<id>?k=v`. 앱 라우터 주소로 바꿔 끼운다.
- `navigate(id, params?)`: 기본은 `screenHref` 주소로 해시를 바꾼다.
- 블록 안에서는 `const screens = useScreens()` → `screens.has(id)` · `screens.href(id, params)` · `screens.go(id, params)`. 없는 화면으로 `go()`를 부르면 아무 일도 하지 않는다. `useScreenExists(id)`는 하나만 볼 때.

지금 화면의 값(`?id=` · `?tab=` · 경로 값)은 `useScreenParams()`로 읽는다. 블록은 `window.location`을 읽지 않는다(`check-blocks`가 막는다). 값이 바뀌면 블록이 다시 그려진다.

- 데모(해시 라우터): 아무것도 넘기지 않는다. PlatformProvider가 `#/<id>?k=v`의 쿼리를 읽는다.
- 서비스(브라우저 라우터): 라우터가 PlatformProvider 안에 있으면 레이아웃 경로에서 `<ScreenParamsProvider params={useSearchParams()[0]}><Outlet /></ScreenParamsProvider>`로 넘긴다. 경로 값도 같이 넘기려면 `params={{ ...Object.fromEntries(search), ...useParams() }}`. PlatformProvider가 라우터 안에 있으면 `params` prop으로 넘겨도 된다.

## 7.3 내용이 적은 화면

표가 2~4줄뿐인 화면(급여 · 구성원)은 아래가 빈 바탕으로 남는다(R-43 7번). 빈자리를 늘린 카드나 장식으로 메우지 않는다. 이 순서로 정한다(D-143).

1. 그 화면의 요약 숫자가 있으면 표 위에 KpiCard 줄(2~4개)을 둔다. 숫자가 없는 화면에 만들어 넣지 않는다.
2. 표 · 목록 하나뿐이면 본문 최대 폭을 둔다(AppShell 본문 폭 그대로, 표는 열 폭만큼만). 화면 높이를 채우려고 표를 늘리지 않는다.
3. 구역이 둘 이상이면 구역마다 `SectionHeader`를 두고 구역 사이는 `space.32`. 짧은 카드는 격자에서 늘이지 않는다(Card 본문이 비면 footer가 제목 바로 아래에 붙는다).
4. 한 화면에서 무게는 세 단계까지다. "지금 해야 할 것"이 있으면 그 구역 하나만 Card `strong`.

## 8. API 약속

- JSON, 날짜는 ISO(`2026-11-06`, 시각은 `2026-11-06T13:20:00+09:00`), 금액은 정수 원 · 외화는 소수 문자열 금지(숫자 + 통화 코드).
- 목록은 `?page=&size=&sort=field,desc&q=` → `{ items, total }`. 화면 DataGrid · Pagination과 1:1.
- 오류는 `{ code, message }`이고 `message`는 문구 규격(content.md §5) 그대로 화면에 보인다("사업자등록번호는 10자리입니다").
- 상태 값은 contracts 어휘의 키(`ready`, `inspecting` …)를 그대로 쓴다. 라벨 · 색은 화면이 정한다.

## 9. 예: 무역 회사 대시보드

요청: "계산서 발행 · 발주서 · 입고 알림 처리 · 거래처 세무 회계 처리 · 재고 관리 + 기본 기능". 아래 블록 · 배치 · 이벤트를 켜면 구축 범위가 된다(데모 프리셋 "무역 회사").

| 기능 | 모듈 | 블록 | 배치 | 알림 이벤트 |
|---|---|---|---|---|
| 대시보드 | home | `home/dashboard/trade` | — | 아래 이벤트가 "오늘 처리할 일"로 |
| 계산서 발행 | tax | `erp/tax/invoice-list` · `erp/tax/invoice-issue` · `erp/tax/vat-return` | 세금계산서 일괄 발행(평일 18:00) · 국세청 전송 결과 수신(매시) | `invoice.ready` · `invoice.failed` |
| 발주서 | purchasing · approval | `erp/purchasing/po-list` · `erp/purchasing/po-form` | — | `po.approval` |
| 입고 알림 처리 | warehouse · trade | `scm/warehouse/receiving` · `scm/trade/shipments` | — | `receiving.arrived` · `receiving.discrepancy` · `shipment.customs` |
| 거래처 세무 회계 | accounting · treasury | `erp/accounting/vendor-ledger` · `erp/accounting/journal` · `erp/accounting/trial-balance` · `erp/treasury/daily-cash` | 거래처 사업자 상태 조회(매일 07:00) · 미수금 기한 알림(매주 월) · 환율 갱신(평일 09:00) | `receivable.overdue` · `fx.updated` |
| 재고 관리 | inventory | `scm/inventory/stock` · `scm/inventory/lots` | 재고 마감 · 안전재고 점검(매일 23:30) | `stock.low` · `stock.expiring` |
| 기본 기능 | platform | `platform/auth/login` · `platform/admin/users` · `platform/admin/roles` · `platform/notifications/center` · `platform/jobs/batch` · `platform/audit/log` | 데이터 백업(매일 02:00) | `job.failed` |

화면 조립 규칙(PR-26, D-90): 한 줄에 나란히 놓은 칸(`Grid` · `Col`)은 내용 끝 높이 차가 카드 1장(240px)을 넘지 않게 묶는다. 넘으면 짧은 쪽 열 아래가 빈 면으로 남아 첫 화면이 덜 된 것처럼 보인다. 짧은 쪽에 다음 카드를 올리거나(예: 홈 자금 타일 아래 이번 주 마감) 줄을 나눈다. 데모 검사(`apps/demo` check)가 1280 이상 폭에서 넘는 화면을 경고로 알린다. 범위 스위처(법인 · 지사)와 사용자는 사이드바가 아니라 AppShell 바(`scope` · `user`)에 둔다.

외부 연동(백엔드 책임): 전자세금계산서 발행 · 전송은 국세청 연계 전송 사업자(ASP) API, 거래처 휴업 · 폐업은 국세청 사업자등록 상태 조회 API, 환율은 한국수출입은행 환율 API, 선적 · 통관은 포워더 연동 또는 수기 입력.

## 10. 새 고객사 구축 순서

1. 회사 설정: 켜진 모듈 · 통화 · 역할 초안(이 문서 §3의 기본 5개에서 시작).
2. 데모 프리셋을 고객사 이름 · 샘플로 바꿔 계약 전 화면 확인(PF-01 "화면 확인").
3. 앱 생성 → 필요한 블록을 `trellis add`로 복사(PF-06) → slots(열 · 필터 · 규칙)만 고친다. 회사 운영 정보는 `_data/profile.ts`(§7.1), 켜진 화면은 `PlatformProvider screens`(§7.2)로 넘긴다.
4. `PlatformAdapter`를 백엔드 API로 구현하고, 블록의 샘플 데이터 import를 API 훅으로 바꾼다.
5. 고객 테마 적용, 배치 · 알림 규칙 입력, 권한 확정.
6. 검사: 데모 검사와 같은 스크립트(axe 0 · 외부 요청 0 · 콘솔 오류 0)를 고객사 앱에 돌린다.
