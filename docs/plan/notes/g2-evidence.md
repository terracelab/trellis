# G2 증거 — 2026-11-10

작성: P2-12 · P2-13 밤 작업 세션(에이전트). 승인: Patrick(아직 아무것도 승인되지 않았다). G2 체크리스트(`03-phase-2-patterns-theme-a.md` 끝)의 에이전트 항목마다 증거를 모은다. 사람 항목과 토큰 값 승인은 5절에 있다.

재현 명령:

```bash
pnpm install --frozen-lockfile && pnpm build
pnpm --filter @terracelab/demo build
pnpm --filter @terracelab/demo check                                   # 데모 전 화면 · 1440 · 390 · 라이트 · 다크
node apps/demo/scripts/g2-capture.mjs --states                          # 7화면 × 회사 색 3 × 모드 3 × 폭 3 + 상호작용 상태
node apps/demo/scripts/g2-capture.mjs --skip-matrix --extras            # 표 확대 · 색각 · 알림 카드 홈 · 포커스 순회
```

캡처 한 장 한 장은 `apps/demo/.shots/g2/`(커밋하지 않는다)에 남고, axe 건수는 같은 폴더의 `results.json` · `extras.json`에 있다. 대조표만 `notes/g2-2026-11/`에 커밋한다.

## 1. 검토 7화면

원문 P2-12는 `apps/playground`에 화면 7종을 두는 안이었다. 이번에는 2026-11-10 요청대로 인사 SaaS 결의 7화면을 복사형 블록으로 만들고 데모(`apps/demo`)에서 띄운다. 회사 색은 `createTheme({ brand })` 결과를 `<style>`로 덧입혔다(기본 주황은 tokens.css 그대로).

| # | 화면 | 블록 id | 구분 | 보는 것 |
|---|---|---|---|---|
| 1 | 역할별 홈 | `home/dashboard/people` | 새 블록 | 제목 줄 보기 스위치(대표 · 인사 담당 · 팀장 · 구성원). 대표 = 재직 인원 · 퇴사율 · 인건비 · 평균 근속 + 부서별 인원 · 인원 변동 · 주 52시간 주의, 인사 담당 = 처리할 일 · 계약 · 휴직 만료 · 입사 준비, 팀장 = 오늘 팀 근태 · 결재할 문서 · 팀 일정(TeamSchedule), 구성원 = TimeClock · WorkHoursMeter · LeaveBalance · 내 신청. 보기를 바꾸는 동안 같은 모양 Skeleton |
| 2 | 구성원 목록 | `erp/hr-payroll/employees` | 기존 그대로 | 재직 상태 탭 · 부서 필터 · PersonLabel(오늘 근무 상태) · 연차 잔여 막대 · 인사 서랍 |
| 3 | 휴가 신청 | `groupware/attendance/leave-request` | 새 블록 | 휴가 종류 카드 · 종일 · 오전 반차 · 오후 반차 · 기간(근무일 수, 주말 · 공휴일 뺌) · 사유 · 업무 대행 · LeaveBalance · 결재선 미리보기 · 같은 기간 팀 일정 · ActionBar(취소 · 신청). 제출하면 ErrorSummary + 칸 오류, 통과하면 토스트와 상태 진행 |
| 4 | 결재 상세 | `groupware/approval/document` | 기존 + 바꿈 | 반려 · 회수 사유를 ReasonDialog로(반려 5자 · 회수 2자 이상이어야 확인이 켜지고, 바깥 누름으로 닫히지 않는다) |
| 5 | 급여 명세 | `erp/hr-payroll/payslip` | 기존(문구 하나) | 지급 · 공제 항목과 계산 방법 · 실지급액. 단추 "PDF 내려받기" → "PDF 다운로드"(content.md 용어 사전) |
| 6 | 모듈 런처 | `home/launcher/modules` | 새 블록 | modules.json 묶음별 ModuleIcon 타일 · 즐겨찾기 줄 · 별 단추 · 이름 · 묶음 · 초성 검색 · `/` 키 · 타일은 링크(Tab · Enter) |
| 7 | 휴대폰 홈 | `home/dashboard/mobile` | 새 블록(sizes [390]) | touch 밀도 한 열: TimeClock · 바로 가기 넷(엄지 크기) · 오늘 할 일 · LeaveBalance. 1440에서는 같은 열을 가운데에 둔다 |

## 2. 대조표

장마다 행 = 회사 색(주황 `#FE5C2B` · 파랑 `#1F56E2` · 노랑 `#FFD400`), 열 = 모드(라이트 · 다크 · 고대비 `data-contrast="high"`), 첫 화면(뷰포트). TODAY 2026-11-06.

| 화면 | 블록 | 1440 | 1024 | 390 |
|---|---|---|---|---|
| 역할별 홈 | `home/dashboard/people` | [role-home-1440.jpg](g2-2026-11/role-home-1440.jpg) · 229KB | [role-home-1024.jpg](g2-2026-11/role-home-1024.jpg) · 197KB | [role-home-390.jpg](g2-2026-11/role-home-390.jpg) · 198KB |
| 구성원 목록 | `erp/hr-payroll/employees` | [employees-1440.jpg](g2-2026-11/employees-1440.jpg) · 279KB | [employees-1024.jpg](g2-2026-11/employees-1024.jpg) · 283KB | [employees-390.jpg](g2-2026-11/employees-390.jpg) · 206KB |
| 휴가 신청 | `groupware/attendance/leave-request` | [leave-request-1440.jpg](g2-2026-11/leave-request-1440.jpg) · 195KB | [leave-request-1024.jpg](g2-2026-11/leave-request-1024.jpg) · 182KB | [leave-request-390.jpg](g2-2026-11/leave-request-390.jpg) · 201KB |
| 결재 상세 | `groupware/approval/document` | [approval-document-1440.jpg](g2-2026-11/approval-document-1440.jpg) · 268KB | [approval-document-1024.jpg](g2-2026-11/approval-document-1024.jpg) · 274KB | [approval-document-390.jpg](g2-2026-11/approval-document-390.jpg) · 238KB |
| 급여 명세 | `erp/hr-payroll/payslip` | [payslip-1440.jpg](g2-2026-11/payslip-1440.jpg) · 187KB | [payslip-1024.jpg](g2-2026-11/payslip-1024.jpg) · 203KB | [payslip-390.jpg](g2-2026-11/payslip-390.jpg) · 212KB |
| 모듈 런처 | `home/launcher/modules` | [launcher-1440.jpg](g2-2026-11/launcher-1440.jpg) · 194KB | [launcher-1024.jpg](g2-2026-11/launcher-1024.jpg) · 206KB | [launcher-390.jpg](g2-2026-11/launcher-390.jpg) · 202KB |
| 휴대폰 홈 | `home/dashboard/mobile` | [mobile-home-1440.jpg](g2-2026-11/mobile-home-1440.jpg) · 167KB | [mobile-home-1024.jpg](g2-2026-11/mobile-home-1024.jpg) · 193KB | [mobile-home-390.jpg](g2-2026-11/mobile-home-390.jpg) · 249KB |

보조 대조표:

- 상호작용 상태(라이트 · 주황): [states-1440.jpg](g2-2026-11/states-1440.jpg) · 184KB, [states-390.jpg](g2-2026-11/states-390.jpg) · 168KB. 역할별 홈 넷(대표 · 인사 담당 · 팀장 · 구성원) · 보기 바꾸는 중(Skeleton) · 휴가 신청 검사 오류(ErrorSummary + 칸 오류) · 신청 뒤(진행 · 토스트) · 결재 상세 반려 사유 창(2자라 반려 꺼짐) · 모듈 런처 초성 검색(ㅈㄱ → 전자결재 · 자금 · 재고)
- 표 · 금액 칸 확대(2배): [zoom-grid-amount.jpg](g2-2026-11/zoom-grid-amount.jpg) · 127KB
- 색각 시뮬레이션(모듈 런처 · 자금 일보 × 라이트 · 다크 × 일반 · 적색맹 · 녹색맹 · 청색맹): [cvd-1440.jpg](g2-2026-11/cvd-1440.jpg) · 278KB
- 알림 카드 홈 3폭(`home/dashboard/trade`): [notification-home.jpg](g2-2026-11/notification-home.jpg) · 124KB
- 포커스 링 순회(휴가 신청, Tab 6단계 × 라이트 · 다크): [focus-leave-request.jpg](g2-2026-11/focus-leave-request.jpg) · 50KB

대조표 27장, 모두 400KB 이하(가장 큰 것 employees-1024 283KB), 합계 5.4MB.

## 3. axe 결과

캡처 189장(7화면 × 회사 색 3 × 모드 3 × 폭 3)마다 axe(`@axe-core/playwright`)를 돌렸다.

| 묶음 | 실행 | critical · serious | moderate · minor | 승인 대기 대비 | 390 가로 넘침 | 외부 요청 · 콘솔 오류 |
|---|---:|---:|---:|---:|---:|---:|
| 7화면 × 3색 × 3모드 × 3폭 | 189 | 0 | 0 · 0 | 0 | 0 | 0 · 0 |
| 상호작용 상태(1440 · 390) | 16 | 0 | — | — | — | — |
| 알림 카드 홈(1440 · 1024 · 390) | 3 | 0 | — | — | — | — |
| 데모 검사 `pnpm --filter @terracelab/demo check`(전 화면 66개 × 1440 · 390 × 라이트 · 다크) | 264 | 0 | — | 0 | 0 | 0 · 0 |

화면별(189장):

| 화면 | 장 | critical · serious | moderate | minor | 390 가로 넘침 |
|---|---:|---:|---:|---:|---:|
| 역할별 홈 | 27 | 0 | 0 | 0 | 0 |
| 구성원 목록 | 27 | 0 | 0 | 0 | 0 |
| 휴가 신청 | 27 | 0 | 0 | 0 | 0 |
| 결재 상세 | 27 | 0 | 0 | 0 | 0 |
| 급여 명세 | 27 | 0 | 0 | 0 | 0 |
| 모듈 런처 | 27 | 0 | 0 | 0 | 0 |
| 휴대폰 홈 | 27 | 0 | 0 | 0 | 0 |

데모 검사는 나란한 열 높이 차 240px 경고 0. 휴대폰 40px 미만 누르는 요소 보고는 13개(10화면, 실패 아님)이고 새 화면에서는 휴가 신청의 이동 경로 링크 하나다.

## 4. G2 에이전트 항목별 증거

| G2 에이전트 항목 | 판정 | 증거 |
|---|---|---|
| 본문 · 보조 텍스트 대비 4.5:1 이상, 라이트 · 다크 | ☑ (PR-28) | 토큰 대비 테스트(라이트 · 다크 · 고대비 2, 회사 색 검증 10색 × 4모드 못 넘는 쌍 0). 이번 캡처 189장(회사 색 3 × 라이트 · 다크 · 고대비)에서 axe `color-contrast` 포함 critical · serious 0건 |
| compact DataGrid 행 32px에서 13px 본문 가독 | 증거 모음, 사람 판단 | [zoom-grid-amount.jpg](g2-2026-11/zoom-grid-amount.jpg): 인사 기록 표 2배 확대, 잰 값 행 36px · 본문 13px. 체크리스트의 32px는 D-97 전 값이고 지금 compact 행은 36px(D-97 승인) |
| 수입 · 지출 색이 라이트 · 다크에서 혼동 없음 | 증거 모음, 사람 판단 | ΔE 테스트 4모드 통과(2026-11-10). [cvd-1440.jpg](g2-2026-11/cvd-1440.jpg) 아래 두 줄: 자금 일보(수입 빨강 · 지출 파랑) 라이트 · 다크 × 일반 · 적색맹 · 녹색맹 · 청색맹(Chromium 시뮬레이션). 숫자 위에 수입 · 지출 이름이 함께 있어 색만으로 가르지 않는다 |
| 모듈 아이콘 4그룹 색 구분(색각 3종) | 증거 모음, 사람 판단 | [cvd-1440.jpg](g2-2026-11/cvd-1440.jpg) 위 두 줄: 모듈 런처 첫 화면(즐겨찾기 · 그룹웨어 · ERP 타일 + 사이드바 묶음 점)을 같은 4가지로 본다. 타일 일러스트는 고유색이고(D-36) 묶음 색은 사이드바 점 · 팀 일정 칸에 쓰인다. 묶음은 이름 머리로도 갈린다 |
| 알림 카드 홈이 1440 · 1024 · 390에서 깨지지 않음 | ☑ 증거 | [notification-home.jpg](g2-2026-11/notification-home.jpg)(`home/dashboard/trade` 3폭, axe 0 · 0 · 0) + 2절 역할별 홈 · 모듈 런처 · 휴대폰 홈 3폭 대조표. 데모 검사 390 가로 넘침 0 |
| 금액 열 우측 정렬 · 천 단위 구분 · tabular-nums | ☑ 증거 | [zoom-grid-amount.jpg](g2-2026-11/zoom-grid-amount.jpg) 임금명세서 금액 칸: 잰 값 `text-align: right` · `font-variant-numeric: tabular-nums` · 예 4,850,000. `formatAmount` 테스트(contracts) |
| 포커스 링이 모든 컨트롤에서 보임 | 일부 | [focus-leave-request.jpg](g2-2026-11/focus-leave-request.jpg): 휴가 신청에서 Tab 순회 6단계 × 라이트 · 다크(고르는 카드 · SegmentedControl · 날짜 칸 · 달력 단추). Storybook States focus VRT 전수 확인은 남았다 |
| Theme A 7화면 axe 0, 린트 0 | ☑ | 3절. 캡처 189장 axe critical · serious 0, 상호작용 상태 16장 0, 데모 검사 전 화면 0. 블록 typecheck · eslint · stylelint · prettier 통과, check-blocks 64개 통과 |
| Storybook · 플레이그라운드 Artifact 링크 | 남음 | 이 세션은 게시하지 않았다 |

## 5. 사람에게 남은 것(승인 안 됨)

- **G2 토큰 값 승인(P2-14)**: 태그 `g2-approved` 전이다. 대조표는 승인 판단의 입력이다. 승인 뒤 값 변경은 minor + 체인지로그 + VRT 갱신.
- **D-53 그룹색 12종**: scm 호박 · commerce 빨강 · mes 회색 가안. commerce 빨강이 위험 · 수입 색과 겹쳐 승인 때 재검토하기로 했다. 이번 화면에서 묶음 색은 사이드바 점 · 팀 일정 칸에 보인다.
- **D-77 · D-80 종이 토큰**: `paper.*`(색 · A4 · A5 · 여백) · `paper.type.*`(pt) 값 승인 대기. 이번 7화면에는 종이 화면이 없다(임금명세서는 화면 서식이고 종이 미리보기는 세금계산서 발행 블록).
- **Theme A 7화면 인상 승인(라이트)** · **레퍼런스 제품 자산과 유사성 없음 확인**: 2절 대조표로 본다.
- **Storybook · 데모 Artifact 링크**: 이 세션은 게시하지 않았다.

## 6. 이 세션에서 정한 것(아침 확인)

- **7화면 구성**: 원문 P2-12의 플레이그라운드 7종 대신 요청된 인사 SaaS 7화면을 블록으로 만들었다. `apps/playground`는 만들지 않았다. P2-12 · P2-13 `상태:` 줄은 이 세션이 바꾸지 않았다(다른 plan 파일은 건드리지 않는다는 요청).
- **역할별 홈 스위치**: PageHeader 오른쪽 SegmentedControl(라벨 "보기"). 처음 보기는 로그인한 사람의 역할(대표 → 대표, 인사 권한 → 인사 담당, 팀장 → 팀장, 그 밖 → 구성원)이고, 보기마다 권한으로 거른다(대표 = hr-payroll 조회, 인사 담당 = hr-payroll 수정, 팀장 = 결재 승인). `?role=ceo|hr|lead|member`로 바로 연다. 데모 사용자(김테라 팀장, 관리자)는 인사 담당으로 시작한다.
- **불러오는 중**: 보기를 바꿀 때 450ms 불러오는 흉내를 내고 그동안 보기와 같은 칸 · 모양의 Skeleton(kpi · list · table · card)을 그린다. 실제 앱은 API 훅의 불러오는 중 값으로 바꾼다. 첫 진입은 바로 그린다.
- **데이터 두 벌**: 회사 숫자 · 인원 변동 · 계약 만료는 인사 기록(erp.ts 14명), 근태 · 팀 · 결재는 그룹웨어(24명) 데이터를 쓴다. 기존 블록이 이미 그렇게 나뉘어 있어 합치지 않았다.
- **새 샘플 데이터**(`_data/hr.ts`, TODAY 2026-11-06 고정): 입사 예정 2명 · 계약 · 휴직 만료 3건 · 인사 할 일 6건(아이콘 포함) · 공휴일 2개. 입사 예정자 이름은 check-blocks 샘플 고유명사에 넣었다(178개).
- **휴가 신청**: 종류 4(연차 · 보상 휴가 · 경조 휴가 · 병가) + 사용 단위(종일 · 오전 반차 · 오후 반차, 연차 · 보상 휴가만). 반차 시간은 근무제에서 계산(09:00~13:00 · 14:00~18:00). 기간은 DateField 둘(PeriodPicker 프리셋은 휴가와 맞지 않는다). 검사 = 잔여 초과(신청 중 1일을 뺀 4.5일) · 지난 날(병가 제외) · 이미 신청한 날 · 근무일 0 · 종료일 < 시작일 · 사유 2자 미만. 신청하면 전자결재 저장소에 휴가 신청서(LV-2611-0032)가 생겨 결재함 · 결재 상세에서 이어 보인다. 참조는 담당 업무에 "인사"가 있는 사람.
- **결재 상세 사유**: 반려 최소 5자 · 회수 최소 2자. 회수 사유는 기안 칸 의견으로 남긴다(`withdrawDoc` 둘째 인자, 없으면 예전 문구).
- **모듈 런처**: 화면 제목 "전체 메뉴". 모듈 → 첫 화면은 블록 안 `ENTRY` 표(slot)이고, 앱에 그 화면이 없으면 타일이 빠진다. 회사 켜진 모듈(`COMPANY.modules`)은 쓰지 않았다(데모 값이 12개라 35개 화면과 맞지 않는다). 즐겨찾기는 화면 상태만 기억한다(서버 저장은 앱). 묶음 순서 그룹웨어 → ERP → 유통·물류 → 이커머스 → 제조 → CRM → ECM. 타일 둘째 줄은 읽지 않은 알림 수를 글자로만(알약 없음).
- **휴대폰 홈**: 1440에서도 touch 밀도 한 열을 가운데에 둔다. 바로 가기 넷 = 휴가 신청 · 결재함 · 임금명세서 · 일정. 건수는 바로 가기가 아니라 오늘 할 일 카드 머리에 둔다.
- **캡처 방식**: 뷰포트 첫 화면만(전체 높이 아님). 390은 isMobile · hasTouch · 2배, 1440 · 1024는 1배. 고대비 열 = 라이트 + `data-contrast="high"`. 움직임 줄이기 켜고 찍는다.
- **곁가지 정리**: 내 근태의 "휴가 신청" 단추가 새 휴가 신청 화면을 연다(없으면 기안 작성).

발견했지만 고치지 않은 것(사람 판단):

- `Input type="search"`에 `clearable`을 함께 주면 Chromium에서 지우기 단추가 둘 보인다(브라우저 것 + 컴포넌트 것). 인사 기록 블록 검색 칸도 같다. 고치는 자리는 react `Input.css`(`::-webkit-search-cancel-button` 숨김)라 공개 패키지 변경 + changeset + VRT 확인이 필요해 이 세션에서는 런처에서 `clearable`만 뺐다.
- 휴대폰 40px 미만 누르는 요소 보고에 휴가 신청의 이동 경로 링크(내 근태)가 하나 잡힌다. 기안 작성 · 결재 상세와 같은 PageHeader 경로 링크다(실패 아님).
