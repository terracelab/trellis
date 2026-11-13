# 트랙 E · 업종 확장 — 세무·회계 · 유통·물류 · 이커머스 · 제조(스마트 팩토리)

목표: 테라스랩이 다음에 낼 제품(세무·회계 사무, 유통·물류, 이커머스 운영, 공장·설비)의 화면을 **토큰과 컴포넌트를 새로 발명하지 않고** Trellis로 그릴 수 있게 한다. 어휘 · 서식 · 입력 · 표 · 보드 · 패턴을 미리 넓히고, 업종 화면 4장으로 증명한다.
사람 작업(Patrick): 모듈 그룹 3종의 색 승인, `board` 밀도 값 승인, 업종 화면 4장 시각 승인, 용어 사전 확정.
산출물: contracts 어휘 · 서식 함수, modules.json 확장, `density.board`, 컴포넌트 13종(입력 7 · 표시 6), DataGrid 확장 spec, 차트 2종, 패턴 6종 spec, 업종 플레이그라운드 4화면, 문구 검사.
규격: `docs/spec/content.md`(새로), `docs/spec/components.md` §7 · §8 · §10 · §11, `docs/spec/tokens.md` §2 · §3.
전제: 시작은 지금 가능(spec · 어휘 · 서식). 구현은 해당 P0/P1 컴포넌트가 생긴 뒤. 토큰 값이 걸린 작업(PE-02 · PE-03)은 G2 승인 절차를 그대로 밟는다.

업종 확장의 원칙은 하나다. **새 업종은 새 색이 아니라 새 어휘와 매핑으로 들어온다.** 상태색 4종(info · success · warning · danger) · 금융 2색 · 결재 5색 위에 업종 어휘를 얹고, 토큰이 정말 늘어나는 곳은 모듈 그룹색과 보드 밀도 둘뿐이다.

---

## 0. 지금 덮는 범위(2026-11-07)

| 층 | 있음 | 업종 확장에 부족한 것 |
|---|---|---|
| 색 토큰 | bg 5 · fg 6 · border 4 · brand 5 · status 4×3 · finance 3 · approval 5×2 · module 4×4 · chart 16 | 중립 상태(대기 · 취소), 증감 별칭, 모듈 그룹 3종, 보드용 대비 |
| 글자 | display 28 · h1~h3 · body · label · caption · amount 16 · amountLg 20 | 시청 거리 3m용 48 · 64 · 96 |
| 밀도 | compact · comfortable | 현장 보드 · 키오스크 · 장갑 터치(`board`) |
| 모듈 | 4그룹 20종(ERP 6 · 그룹웨어 6 · ECM 4 · CRM 4) | 유통·물류 · 이커머스 · 제조 그룹, 세무 모듈 |
| 어휘 | 상태 7 · 결재 5 · 금융 2 | 처리 단계 · 설비 상태 · 품질 판정 · 재고 수준 · 주문 단계 |
| 서식 | `formatAmount` · `formatCount` · `formatCompactWon` · `formatPercent` | 수량+단위 · 사업자번호 · 기간 · 증감 · 한글 금액 |
| 컴포넌트 | 차트 14(미리보기) · P0 14 · P1 10(계획) | 금액 · 수량 · 마스크 입력, 코드 검색, 기간 선택, 스캔 입력, 가격 표시, 기한 배지, 보드 타일 |
| 패턴 | 알림 홈 · 목록·상세 · 폼·등록 · 결재 · 대화형 | 전표 입력 · 신고서 · 주문 상세 · 스캔 작업 · 현장 보드 · 재고 매트릭스 |
| 문구 | 결재 · 금융 어휘, 숫자 서식 | 업종 용어 사전, 금칙어 검사 → `docs/spec/content.md`로 채움 |

## 1. 업종별로 필요한 것

| 업종 | 대표 화면 | 핵심 데이터 | 꼭 있어야 하는 것 | Trellis 상태 |
|---|---|---|---|---|
| 세무·회계(기장 · 신고) | 전표 입력, 분개장, 부가세 신고서, 세금계산서 목록, 거래처 원장, 마감 달력 | 전표(차변 · 대변), 계정과목, 공급가액 · 세액, 신고 기한, 증빙 | 키보드 입력 흐름(Enter → 다음 칸), 금액 입력 자동 쉼표, 계정과목 코드 검색, 과세기간 선택, 대차 일치 표시, D-day 배지, 서식(국세청 양식) 그대로 보이는 폼 | 금융색 · 결재 ○ / 입력 · 표 확장 × |
| 유통·물류(식자재 · 창고) | 발주 · 입고 · 출고, 재고 현황(품목 × 창고), 로트 · 유통기한, 피킹 · 검수(모바일), 배차 | 품목 · 수량 · 단위 · 로트 · 유통기한 · 창고 · 거래처 | 수량+단위 서식, 안전재고 대비 색(HeatCell), 스캐너 입력(자동 포커스 · 엔터 제출), 한 손 모바일 레이아웃, 야외 대비, 오프라인 큐 표시 | 차트 · HeatCell ○ / 스캔 · 매트릭스 × |
| 이커머스(상품 · 주문 · 정산) | 상품 목록(이미지 · 옵션 · 가격), 주문 상세(단계 + 금액 요약 + 상품), 취소 · 반품 · 교환, 정산, 쿠폰, 채널 연동 상태 | 상품 · SKU · 주문 · 결제 · 배송 · 클레임 · 정산 | 주문 단계 8종 표시, 가격 표기(정가 · 할인가 · 할인율 · 부가세 포함), 이미지 셀, 채널 연동 상태 점, 금액 요약 표(상품 · 배송비 · 할인 · 결제) | 결재 어휘와 분리 필요, 단계 · 가격 × |
| 제조 · 공장(MES · 설비) | 현장 보드(TV), 작업지시 · 실적, 설비 상태(가동 · 비가동), 품질 검사(합격 · 불합격), 자재 · BOM, 교대 현황 | 작업지시 · 공정 · 설비 · 실적 · 불량 · 수율 · OEE | 큰 글자 · 높은 대비 · 다크 기본의 보드 밀도, 설비 상태 5종(업계 관습색), 합격 · 불합격 · 보류, 장갑 터치 48 이상, 자동 새로고침 표시, 간트(작업 일정) | RadialMeter · BulletBar ○ / 보드 · 간트 × |

업종 넷이 **공통으로** 요구하는 것부터 만든다. 처리 단계 어휘, 수량 서식, 금액 · 마스크 입력, 코드 검색, 기한 배지, DataGrid 합계 행 · 열 묶음이 그것이다.

## 2. 설계 결정(제안, 사람 승인 전)

### 2.1 어휘는 토큰에 매핑한다(새 색 없음)

contracts `_shared/vocab.ts`에 고정 어휘를 두고 각 값이 **어느 status 토큰으로 칠해지는지**를 함께 고정한다. 라벨은 `content.md` §6 용어 사전과 같다.

| 어휘 | 값 | 라벨 | 색 매핑 |
|---|---|---|---|
| `ProgressState` | `todo` · `doing` · `done` · `hold` · `cancel` | 대기 · 진행 · 완료 · 보류 · 취소 | neutral · info · success · warning · neutral(취소선) |
| `MachineState` | `running` · `idle` · `down` · `maintenance` · `setup` | 가동 · 대기 · 비가동 · 점검 · 준비 | success · warning · danger · info · neutral |
| `QualityResult` | `pass` · `fail` · `hold` | 합격 · 불합격 · 보류 | success · danger · warning |
| `StockLevel` | `ok` · `low` · `out` · `over` · `expiring` | 정상 · 부족 · 품절 · 과다 · 임박 | success · warning · danger · info · warning |
| `OrderStage` | `paid-pending` · `paid` · `preparing` · `shipping` · `delivered` · `cancelled` · `returning` · `exchanging` | 결제 대기 · 결제 완료 · 상품 준비 · 배송 중 · 배송 완료 · 취소 · 반품 · 교환 | neutral · info · info · info · success · neutral · warning · warning |
| `FilingState` | `drafting` · `review` · `filed` · `amended` | 작성 중 · 검토 · 신고 완료 · 수정신고 | neutral · info · success · warning |

- 결재 5어휘는 **전자결재에만** 쓴다. 주문 · 신고 · 작업지시의 단계에 결재 색을 빌려 쓰지 않는다.
- `neutral`은 지금 `finance.neutral`뿐이다. `status.neutral.{default,subtle,on}` 3종을 **추가 제안**한다(값은 neutral 600 / 100 / white 가안). 이것이 트랙 E가 새로 요청하는 유일한 상태 토큰이다.
- 증감은 `finance.up` · `finance.down` **별칭**을 둔다. 값은 `finance.income` · `finance.expense`와 같다(새 값 없음). 의도를 이름으로 남기기 위한 것이다.

### 2.2 모듈 그룹 +3, 모듈 +14

| 그룹 | 라벨 | 모듈(id → 라벨, Lucide) |
|---|---|---|
| `erp`(기존) | ERP | + `tax` 세무(`landmark`) |
| `scm` | 유통·물류 | `inventory` 재고(`boxes`) · `warehouse` 입출고(`warehouse`) · `delivery` 배송·배차(`truck`) |
| `commerce` | 이커머스 | `products` 상품(`package`) · `orders` 주문(`shopping-bag`) · `claims` 취소·반품(`undo-2`) · `settlement` 정산(`banknote`) · `promotions` 쿠폰·프로모션(`ticket-percent`) · `channels` 판매 채널(`store`) |
| `mes` | 제조 | `shop-floor` 현장 실적(`gauge`) · `equipment` 설비(`cog`) · `quality` 품질(`badge-check`) · `materials` 자재(`layers`) |

- ERP의 `production`(생산)은 계획 · 지시로 남고, `mes`는 현장 실행이다.
- 그룹색 `color.module.{scm,commerce,mes}.{default,subtle,gradientFrom,gradientTo}` 12종이 **새 값**이다. 가안은 `notes/module-colors-2026-11.md`에 dataviz 검증기 결과와 함께 두고, 승인 전에는 사이드바에서 `module.erp` 색을 빌려 그린다(런타임 폴백 아님, 미리보기 한정).
- 일러스트 타일은 없으면 생성형 폴백(D-36). 타일 14종은 Patrick의 일러스트 공급 뒤.
- modules.json 변경은 minor. `ModuleId` 타입 · 사이드바 · 알림 카드 아이콘이 자동으로 따라온다.

### 2.3 `board` 밀도와 `type.board`

세 번째 밀도 `board`는 **TV · 키오스크 · 장갑 터치**용이다. 원칙 1(compact 기본)은 그대로이고 `board`는 `data-density="board"`를 명시한 화면에서만 켜진다.

| 토큰 | compact | comfortable | board(가안) |
|---|---|---|---|
| `density.row.height` | 32 | 40 | 64 |
| `density.control.height.md` | 32 | 36 | 56 |
| `density.card.padding` | 12 | 16 | 24 |
| `density.body.fontSize` | 13 | 14 | 20 |
| `density.gutter` | 16 | 24 | 32 |
| `type.board.sm / md / lg` | — | — | 48 / 64 / 96(KPI · 설비 상태 · 카운트다운) |

- 터치 목표 최소 48(장갑은 56). 대비는 본문 7:1 이상(야외 · 형광등 아래 TV).
- 보드는 다크가 기본이다. `prefers-color-scheme`와 무관하게 `data-theme="dark"`를 패턴이 지정한다.
- 값은 전부 가안이고 G2 절차(미리보기 승인)를 거친다.

### 2.4 서식 함수(contracts `_shared/format.ts`)

| 함수 | 결과 | 쓰는 곳 |
|---|---|---|
| `formatQuantity(v, unit, { digits })` | `12건` · `3.5kg` · `240EA` | 재고 · 발주 · 실적 |
| `formatBizNo(v)` | `123-45-67890` | 거래처 · 세금계산서 |
| `formatPeriod(from, to)` | `2026-11-01~11-30` · `2026년 2기 예정` | 신고 · 마감 · 정산 |
| `formatDelta(v, { unit, base })` | `전월 대비 +12.4%` | KPI |
| `formatKoreanAmount(v)` | `일금 팔억칠천사백사십칠만구천오백원정` | 세금계산서 · 영수증 · 지출결의 |
| `formatDueDays(date, today)` | `D-3` · `D-day` · `3일 경과` | 신고 기한 · 유통기한 · 결재 지연 |

린트 `trellis/no-manual-number-format`: 템플릿 문자열에서 `toLocaleString()` · 정규식 쉼표 삽입을 막는다.

### 2.5 컴포넌트

입력 7

| 이름 | 역할 | 바탕 |
|---|---|---|
| `AmountInput` | 금액. 입력 중 천 단위 쉼표, 원 접미, 음수, 한글 금액 보조 표시 | Input |
| `QuantityInput` | 수량 + 단위 선택, 증감 버튼, 소수 자릿수 | Input |
| `MaskedInput` | 사업자등록번호 · 전화 · 계좌 · 우편번호 프리셋 | Input |
| `CodeSearch` | 코드 + 이름으로 검색하는 콤보박스(계정과목 · 거래처 · 품목 · SKU). 키보드만으로 완료 | Select + 검색 |
| `PeriodPicker` | 월 · 분기 · 반기(1기 · 2기) · 연 · 임의 기간 프리셋 | DateRangePicker |
| `AddressInput` | 도로명 주소 검색 어댑터 슬롯 + 상세 주소. 검색 제공자는 앱이 주입 | Input + Dialog |
| `ScanField` | 바코드 · QR 스캐너 입력. 자동 포커스 유지, Enter 제출, 수동 입력 전환, 최근 스캔 목록 | Input |

표시 6

| 이름 | 역할 | 바탕 |
|---|---|---|
| `Price` | 정가 · 할인가 · 할인율 · 부가세 포함/별도 표기 한 벌 | 텍스트 |
| `DueBadge` | `formatDueDays` 결과. 임박 warning, 경과 danger | Badge |
| `StatusDot` | 어휘(2.1) 값 하나를 점 + 라벨로. 깜박임은 reduced-motion 준수 | Badge |
| `ProgressSteps` | `ProgressState` · `OrderStage` · `FilingState`를 가로 단계로 | Stepper |
| `BoardTile` | 보드 밀도의 큰 타일. 제목 · `type.board` 숫자 · 상태 · 갱신 시각 | Card |
| `ProductCell` | DataGrid 셀. 썸네일 · 상품명 · 옵션 · SKU | 셀 |

### 2.6 DataGrid 확장(spec만, 구현은 P1-15에 포함)

합계 행(고정, tabular) · 열 묶음 머리(공급가액 · 세액 · 합계) · 좌측 고정 열 · 단위 열(숫자 우측 + 단위 흐리게) · 행 상태색(어휘 2.1의 subtle) · `preset="ledger"`(차변 · 대변 두 열, 대차 일치 표시, Enter로 다음 칸) · 키보드 편집 흐름(Enter · Tab · Esc 고정).

### 2.7 차트 추가

- `TimelineChart`: 작업지시 · 배차 · 신고 일정의 가로 막대(간트). 자체 SVG, 행 ≤ 20, 오늘 선, 범위 확대 없음(표 대체 필수).
- `RadialMeter`에 `rings` 옵션(≤ 3): OEE 가동률 · 성능 · 품질.
- `color.chart.diverging.{neg3..pos3}` 7종 **제안**: 예산 대비 · 전년 대비 ±. 가운데는 중립 회색, 양쪽은 finance 빨강 · 파랑 계열. 값은 dataviz 검증기로 고르고 승인받는다.

### 2.8 패턴 6종

| 패턴 | 코드 이름 | 구성 | 코드로 강제하는 규칙 |
|---|---|---|---|
| 전표 입력 | `LedgerEntry` | 머리(일자 · 전표 번호 · 거래처) + DataGrid ledger + 합계 · 대차 표시 + ActionBar | Enter 이동 순서 고정, 대차 불일치면 저장 비활성 + 이유 표시 |
| 신고서 | `TaxFiling` | 서식 그대로의 폼(칸 번호 유지) + 계산 칸 읽기 전용 + 첨부 + 제출 상태(`FilingState`) | 계산 칸은 수정 불가, 기한 `DueBadge` 상단 고정 |
| 주문 상세 | `OrderDetail` | `ProgressSteps`(OrderStage) + 금액 요약 표 + 상품 목록(`ProductCell`) + 배송 · 결제 · 클레임 탭 | 금액 요약 순서 고정(상품 · 배송비 · 할인 · 결제), 클레임은 Drawer |
| 스캔 작업 | `WarehouseScan` | 모바일 1열, `ScanField` 상단 고정, 작업 목록, 큰 수량 버튼, 오프라인 큐 표시 | 터치 48 이상, 한 손 하단 액션, 네트워크 상태 배지 |
| 현장 보드 | `FloorBoard` | `data-density="board"` + 다크, `BoardTile` 격자, 설비 `StatusDot`, 갱신 시각, 자동 새로고침 | 상호작용 없음, 글자 최소 `type.board.sm`, 깜박임 금지 |
| 재고 매트릭스 | `InventoryMatrix` | 품목 × 창고 `HeatCell`, `StockLevel` 범례, 필터 1행 | 색 5단계 + 숫자 병기, 표 대체 |

### 2.9 환경 규칙(components.md §8에 추가)

- 터치 목표: 기본 32(compact) · 40(comfortable) · 48(board, 장갑 56).
- 보드 · 야외: 본문 대비 7:1, 상태는 색 + 모양 + 글자(색만 금지).
- 스캐너: `ScanField`가 포커스를 잃으면 2초 안에 되찾는다. 키보드 웨지 입력은 Enter로 끝난다.
- 오프라인: 설치형(파일 관리 제품)과 창고 모바일은 네트워크 상태 배지와 대기 큐 건수를 AppShell에 표시한다.
- 자동 새로고침 화면은 마지막 갱신 시각을 항상 보여 준다.

---

## 3. 작업

### PE-01 업종 어휘 contract
상태: ◐ 진행 — 2026-11-08 어휘 10종(vocab.ts: 처리 · 설비 · 품질 · 재고 · 주문 · 신고 · 세금계산서 · 입고 · 선적 · 배치) + status 톤 매핑 + 테스트. 남은 것: `status.neutral` 토큰 제안 PR(지금은 fg.tertiary · bg.sunken으로 그림), content.md 라벨 비교 스크립트
의존: 없음
목표: 2.1의 어휘 6종을 contracts에 고정하고 status 매핑을 테스트로 묶는다.
산출물: `packages/contracts/src/_shared/vocab.ts`(타입 · 라벨 · 매핑), 테스트, `docs/spec/components.md` §2에 어휘 표, `content.md` §6과 라벨 일치 검사.
작업: 타입 · 라벨 · 매핑 작성 → 모든 값이 매핑을 갖는지 테스트 → `status.neutral` 3종 · `finance.up/down` 별칭을 tokens에 **제안 PR**(값 가안) → components.md 갱신.
완료 조건: `pnpm --filter @terracelab/trellis-contracts test` 통과, 어휘 라벨이 `content.md` §6 표와 글자까지 같다(스크립트 비교), tokens 대비 테스트에 neutral 조합 추가 후 통과.
사람 확인: `status.neutral` · 별칭 승인.

### PE-02 모듈 그룹 3종 · 모듈 14종
상태: ◐ 진행 — 2026-11-08 모듈 35종 · 7그룹, 그룹색 12종 가안(D-53), 아이콘 빌드 · 대비 테스트 통과, 사이드바 7그룹. 남은 것: 그룹색 승인(commerce 빨강 재검토), 업종 모듈 일러스트 타일
의존: 없음(값 승인은 사람)
목표: 2.2대로 modules.json을 넓히고 그룹색 가안을 검증과 함께 제안한다.
산출물: `modules.json` 34종, `color.module.{scm,commerce,mes}` 12종 가안, `notes/module-colors-2026-11.md`, 아이콘 빌드 통과, 사이드바 · 런처 · 모듈 격자판 반영.
완료 조건: `pnpm --filter @terracelab/trellis-icons build` 통과(Lucide 이름 전부 존재), tokens 대비 테스트 통과(subtle 위 default 3:1, default 위 white 4.5:1), 미리보기 사이드바에 7그룹이 보인다, changeset minor.
사람 확인: 그룹색 3종 승인, 모듈 라벨 확정.

### PE-03 `board` 밀도 · `type.board`
상태: ☐ 대기
의존: 없음
목표: 2.3의 밀도와 글자 토큰을 가안으로 추가하고 미리보기에 보드 1장을 넣는다.
산출물: `density/board.json`, `typography.json` board 3종, `tokens.css` `[data-density="board"]`, 미리보기 `#board`(1920 × 1080 다크).
완료 조건: tokens 빌드 · 테스트 통과, 미리보기 검사(1920 다크)에서 본문 대비 7:1, `pnpm vrt`에 보드 스냅샷.
사람 확인: 값 승인(G2 절차).

### PE-04 서식 함수 · 숫자 린트
상태: ◐ 진행 — 2026-11-08 formatQuantity · formatCurrency · formatBizNo · formatDate · formatPeriod · formatDueDays · formatKoreanAmount + 테스트. 남은 것: 린트 no-manual-number-format
의존: PE-01
목표: 2.4의 함수 6종과 린트 규칙.
산출물: `format.ts` 확장 + 테스트(경계값 · 음수 · 0 · 소수), `eslint-plugin-trellis` `no-manual-number-format`, `content.md` §4 표의 함수 열 갱신.
완료 조건: contracts 테스트 통과, 린트가 미리보기의 수동 서식을 0건으로 만든다(`pnpm lint`), 동봉 문서 `guides/content.md`에 함수가 보인다.
사람 확인: 없음.

### PE-05 입력 컴포넌트 7종
상태: ☑ 완료 2026-11-11(웹) — AmountInput · QuantityInput · MaskedInput · CodeSearch · PeriodPicker · ScanField · AddressInput contract · spec · 구현 · 예시 · States 스토리 · VRT 각 4장, 완료 조건 테스트 셋(164288a `test/keyboard-pe05.test.tsx`: ScanField · CodeSearch 키보드만으로, AmountInput 한글 조합 — 조합 뒤 onChange가 빠지던 버그를 고쳤다) + 붙여넣기(`inputs.test.tsx`), react 525 통과. 사람 확인(AddressInput 검색 제공자)은 남음. 네이티브는 1.0 뒤(P3)
의존: P1-08 Input, P1-10 Select, P2-02 DateRangePicker, PE-04
목표: 2.5 입력 7종. 각각 spec · contract · 웹 구현 · 예시 · 스토리 · VRT.
완료 조건: 컴포넌트 DoD(README) + `CodeSearch` · `ScanField` 키보드만으로 완료되는 테스트, `AmountInput` IME · 붙여넣기 테스트.
사람 확인: `AddressInput` 검색 제공자(앱 주입 방식) 확인.

### PE-06 표시 컴포넌트 6종
상태: ◐ 진행 — 2026-11-08 DueBadge · StatusDot · Stepper(단계) 완료. 남은 것: Price · BoardTile · ProductCell(블록 안에서 토큰으로 조립 중)
의존: P1-06 Badge, P1-07 Card, P2-08 Stepper, PE-01, PE-03
완료 조건: 컴포넌트 DoD, `StatusDot` · `BoardTile` reduced-motion 테스트, 보드 밀도 VRT.
사람 확인: 없음.

### PE-07 DataGrid 확장 spec
상태: ☐ 대기
의존: 없음(구현은 P1-15)
목표: 2.6을 `packages/contracts/src/DataGrid/spec.md`에 쓴다. P1-15가 이 spec으로 구현한다.
완료 조건: spec parity 테스트 통과(§3 절 전부), `preset="ledger"` 키 흐름이 표로 적혀 있다.
사람 확인: 없음.

### PE-08 차트 2종 · diverging 팔레트
상태: ☐ 대기
의존: P1-19
완료 조건: 컴포넌트 DoD, `TimelineChart` 표 대체, diverging 7색 dataviz 검증기 통과 기록(`notes/`).
사람 확인: diverging 값 승인.

### PE-09 패턴 6종 spec · 템플릿
상태: ☐ 대기
의존: P2-11, PE-05, PE-06, PE-07
완료 조건: 패턴 spec 6 + 템플릿 6(`templates/src/`), Storybook `Templates/*` 1440 · 1024 · 390, `FloorBoard`는 1920 다크, mock 데이터는 `templates/src/mock/industries.ts` 한 곳.
사람 확인: 없음.

### PE-10 업종 플레이그라운드 4화면
상태: ◐ 진행 — 업종 화면 블록: 세무 3 · 유통·물류 6 · 이커머스 8 · 제조 5. 데모 프리셋(무역 · 이커머스 · 제조 · 사무). 남은 것: Figma Screens · Industries, 시각 승인(GE)
의존: PE-02, PE-03, PE-09
목표: 세무사무소 기장 홈 · 식자재 물류 입고(모바일) · 이커머스 주문 상세 · 공장 현장 보드. 미리보기 `#industries`, 문서 사이트 "업종" 절, Figma `Screens · Industries`.
완료 조건: 미리보기 · 사이트 검사 통과(axe 0 · 외부 0), Figma 캡처 4장, 사이트 "업종" 절이 4화면을 보여 준다.
사람 확인: 4화면 시각 승인(GE).

### PE-11 환경 규칙
상태: ☐ 대기
의존: 없음
목표: 2.9를 `components.md` §8 · §9에 넣고 린트 가능한 것(터치 목표 최소값)은 린트로.
완료 조건: 문서 갱신, `trellis/min-touch-target` 규칙이 board 밀도 스토리에서 통과.
사람 확인: 없음.

### PE-12 문구 검사 · 용어 사전 동봉
상태: ◐ 진행 — 2026-11-07 `docs/spec/content.md` · `docs/guides/content.md` 작성, 사이트 · 미리보기 · 가이드 문구 교체, `build-docs` 금칙어에 수식어 추가. 남은 것: `manifest.vocabulary`(용어 사전 기계 읽기), 사이트 check의 문구 필터.
의존: 없음
목표: `content.md` §8의 검사를 전부 자동화하고 용어 사전을 동봉 문서에 넣어 에이전트가 읽게 한다.
완료 조건: 동봉 문서 빌드가 수식어 포함 시 실패(테스트), `manifest.vocabulary`에 §6 사전 전부, 사이트 check가 본문 금칙어 0건을 출력.
사람 확인: 용어 사전 확정(특히 "결재 요청" vs "상신", "다운로드" vs "내려받기").

---

## GE 체크리스트 — 업종 확장 승인

**자동**
- [ ] 어휘 6종 전부 status 매핑 테스트 통과(PE-01)
- [ ] 모듈 34종 아이콘 빌드 · 그룹색 대비 테스트 통과(PE-02)
- [ ] `board` 밀도 대비 7:1, 터치 48 린트 통과(PE-03 · PE-11)
- [ ] 서식 함수 테스트 · 수동 서식 린트 0건(PE-04)
- [ ] 컴포넌트 13종 DoD(PE-05 · PE-06), 차트 2종 DoD(PE-08)
- [ ] 패턴 템플릿 6종 Storybook 1440 · 1024 · 390(+1920) VRT(PE-09)
- [ ] 금칙어 검사 · 용어 사전 동봉(PE-12)

**사람(Patrick)**
- [ ] 모듈 그룹색 3종 · `status.neutral` · diverging 7색 · `board` 값 승인
- [ ] 업종 화면 4장 시각 승인
- [ ] 용어 사전 확정

통과하면 태그 `ge-approved`. 트랙 E 산출물은 그다음 minor 릴리즈에 함께 나간다.
