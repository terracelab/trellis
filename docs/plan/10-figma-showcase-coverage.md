# 트랙 G · Figma 연결 · 쇼케이스 리뉴얼 · 범용 보완

상태: 확정 2026-11-10. Patrick이 추천안 그대로, 범위는 전체로 진행하라고 했다(D-110~D-117). 진행 기록은 `notes/track-g-log.md`에 있다.

목표는 셋이다.

1. Figma 파일 셋(Foundations · Components · Screens)을 라이브러리로 연결한다. 지금은 같은 내용을 파일마다 사본으로 갖고 있다.
2. 2026-11-07 파일에 있던 쇼케이스(히어로 · 기기 콜라주 · 알림 카드 월)를 지금 토큰과 컴포넌트로 다시 만든다.
3. 인사 · 회계 · 재고 · 메신저 · 에이전트 대화 · 대시보드까지 쓰는 시스템으로 보고 빈 곳을 채운다.

사람 작업(Patrick): 1절 결정 7개 확인, 라이브러리 게시 2회, 쇼케이스 문구와 시안 확인, 모듈 타일 그림, 새 고정 어휘 승인.
규격: `docs/figma/README.md`, `.claude/skills/ds/figma-sync/SKILL.md`, `docs/spec/components.md`, `docs/spec/content.md`, `docs/spec/pipeline.md` §7.
근거: 2026-11-10 감사. Figma는 MCP 읽기 전용 호출로 세 파일과 2026-11-07 파일을 읽었고, 코드는 contracts 96종 · 블록 64개 · `apps/preview`를 읽었다. 그림은 `docs/plan/notes/figma-audit-2026-11/`에 있다.

## 0. 감사 결과

### 0.1 숫자

| 항목 | 지금 | 기준 | 차이 |
|---|---|---|---|
| 라이브러리 게시 | 0 | Foundations · Components 게시 | 세 파일 모두 추가된 Trellis 라이브러리 없음 |
| 변수 | 6컬렉션 474개가 세 파일에 사본 | Foundations 한 곳 | 사본 2벌 |
| Components 세트 | contract 44종 + `SideNav / Item` | contract 96종 | 50종 없음(Icon · TrellisProvider 제외) |
| 차트 세트 | 0 | 14종 | 2026-11-07 파일의 Charts 보드를 옮기지 않았다 |
| 아이콘 · 모듈 타일 | 156 · 21 | 코드와 같다 | 모듈 35개 중 15개는 타일 그림이 없다(0.3절) |
| 에이전트 대화 | contract 0 · 블록 0 | 패턴 `ConversationalWork` | 표 한 줄만 있다 |
| Screens 화면 | 17화면 48프레임(인사 · 그룹웨어 · 홈) | 블록 64개 | 회계 · 세무 · 자금 · 구매 · 영업 · 재고 · 물류 · CRM · 메신저 · 문서 · 이커머스 · 제조 · 플랫폼 화면 0 |
| Screens 폭 | 1440(휴대폰 홈만 390) | P2-20 완료 조건 1440 · 390 | G2 화면 6종의 390 없음, 1024 없음 |
| Screens 인스턴스 | 2,942개, 전부 Screens 안 사본 세트 | Components 라이브러리 인스턴스 | 100% 사본 |
| 프로토타입 연결 | 0 | — | 화면 사이 흐름 없음 |
| 쇼케이스 | 새 파일 셋에 없음 | 1440 3판 + 390 | 2026-11-07 파일에만 있다(HTML 캡처, 옛 파랑) |

### 0.2 보완 목록

번호는 작업의 "근거" 칸에서 쓴다.

**연결(L)**

| 번호 | 내용 |
|---|---|
| L-1 | 세 파일이 팀 프로젝트에 있지만 게시되지 않았다. 변수 474 · 글자 스타일 12 · 그림자 3이 세 파일에 사본으로 있어 Foundations를 고쳐도 다른 파일이 따라오지 않는다 |
| L-2 | Screens의 인스턴스는 Screens 안 사본 세트 22개와 `AppShell / Phone`을 가리킨다. Components에서 세트를 고쳐도 화면이 바뀌지 않는다 |
| L-3 | 아이콘 156은 Components · Screens 두 곳, 모듈 타일 21은 세 파일 모두에 사본이 있다 |
| L-4 | 게시 뒤 다른 파일에서 가져올 때 쓰는 key 목록이 저장소에 없다. MCP의 `use_figma`는 `figma.teamLibrary.*`를 지원하지 않아 key를 원본 파일에서 읽어 저장해 두어야 한다 |

**Foundations(FD)**

| 번호 | 내용 |
|---|---|
| FD-1 | 표지 색인의 Color 줄이 오른쪽에서 잘린다(`foundations-cover-clipped.jpg`). 파일 섬네일이 지정되지 않았다 |
| FD-2 | 문서 페이지가 Color · Typography · Space · Radius · Density · Module icons뿐이다. 2026-11-07 파일의 Guidelines(절대 규칙 · 원칙 · 고정 어휘 · 이름 규칙 · 접근성) · 수정 메모 · Chart Palette 페이지가 없다 |
| FD-3 | 토큰에는 있고 Figma 변수에는 없다: `layout.*`(글로벌 바 48 · 사이드바 240 · 64 · 본문 최대 폭) · `breakpoint.*` 5 · `z.*` 6. 화면의 AppShell 치수는 변수에 묶이지 않은 숫자다 |
| FD-4 | 변수는 있고 문서가 없다: `duration/*` 11 · `paper/*` 26 · `color/cvd/*` 12 · `color/chart/*` 15 |
| FD-5 | 글자 스타일 `mono`가 Pretendard Regular다. 코드의 `font.family.mono`는 시스템 고정폭이다 |
| FD-6 | 상태 · 결재 · 금융 색이 견본만 있고 쓰임 설명이 없다. 수입 빨강 · 지출 파랑, 결재 5색, 상태 = 점 · 글자 규칙이 Figma에 적혀 있지 않다 |

**Components(CP)**

| 번호 | 내용 |
|---|---|
| CP-1 | 없는 세트 50종. 입력 14: Field · FormSection · Textarea · AmountInput · QuantityInput · MaskedInput · SegmentedControl · DateField · PeriodPicker · MultiSelect · CodeSearch · ScanField · FileUpload · Attachment. 화면 뼈대 6: PageHeader · FilterBar · ActionBar · Pagination · KpiCard · SideNav(전체). 표 편집 1: LineItemsEditor. 상태 9: Banner · EmptyState · ErrorSummary · Skeleton · Spinner · Progress · StatusDot · DueBadge · Tooltip. 탐색 · 기록 6: Menu · CommandPalette · Stepper · Timeline · DescriptionList · Paper. 차트 14: Legend · Sparkline · SegmentedBar · HeatCell · DataBar · BulletBar · RadialMeter · TrendChart · ComboChart · BarList · WaterfallChart · Donut · CalendarHeatmap · ChartCard |
| CP-2 | 표를 조립할 부품이 없다. DataGrid 세트는 견본 행이 박힌 48변형이고 칸 글자 속성이 없다. 2026-11-07 파일에는 `DataGrid / Header Cell` · `DataGrid / Cell`이 있었다 |
| CP-3 | 내용 개수가 고정된 세트: Tabs 3칸 · SelectableCard 3개 · RadioGroup 3개 · Payslip 지급 3줄 · OrgChart 3단. 화면에서 탭과 항목이 빠졌다(`docs/figma/README.md` "기준 화면과 다른 곳") |
| CP-4 | 모양을 바꾸지 않는 prop이 변형 축에 있다: Popover `initialFocus`(144변형), ProfileHeader · Card · HrRecord `headingLevel`(ProfileHeader 360변형). 값이 `default` 하나뿐인 `state` 축이 10세트에 있다 |
| CP-5 | 페이지 문서가 설명 두세 줄과 변형 격자뿐이다. spec.md에 있는 해부 · 쓰임 예 · 하지 말 것 · 키보드가 Figma에 없다 |
| CP-6 | 사이드바 조각이 `SideNav / Item` 하나다. 묶음 머리 접힘 · 카운트 · 접힌 폭 64 모양이 없다 |

**Screens(SC)**

| 번호 | 내용 |
|---|---|
| SC-1 | Cover 페이지가 비어 있다(노드 0) |
| SC-2 | 화면이 인사 · 그룹웨어 · 홈뿐이다. 0.1절 표의 영역이 통째로 없다 |
| SC-3 | 인스턴스 밖 노드가 많다. 구성원 목록은 프레임 196 · 글자 152, 팀 근태 달력은 프레임 471, 역할별 홈은 프레임 88 · 글자 76이다. 표 · 숫자 카드 · 카드 틀 · 머리줄 · 거름 줄 · 막대그래프 · 달력 격자를 세트 없이 그렸다 |
| SC-4 | G2 화면 6종의 390 프레임이 없다(P2-20 완료 조건). 1024 프레임이 없다 |
| SC-5 | Comfortable · Touch 밀도, 고대비 프레임이 없다. 회사 색은 프리셋 8개 중 4개(주황 · 파랑 · 노랑 · 초록)만 보인다 |
| SC-6 | 빈 · 로딩 · 오류 · 권한 없음 상태 화면이 없다 |
| SC-7 | 보이는 결함. 팀 근태 달력이 24일에서 잘리고 배지 글자가 잘린다(`screens-team-calendar-clipped.jpg`). 시험 홈의 "이번 주 휴가 · 외근" 표 오른쪽이 비고 맨 아래 표가 프레임 끝에서 잘린다. 시험 화면 사이드바의 홈 아이콘이 바탕에 묻힌다 |

**쇼케이스(SH)**

| 번호 | 내용 |
|---|---|
| SH-1 | 새 파일 셋에 쇼케이스가 없다. 2026-11-07 파일의 5프레임(SC-01 히어로 · SC-02 기기 콜라주 · SC-03 알림 카드 월 · 390 2장)은 미리보기 HTML 캡처라 변수에 묶여 있지 않고 옛 파란 브랜드다(`showcase-figma-2026-11-07.jpg`) |
| SH-2 | 원본인 코드 쇼케이스(`apps/preview/src/sections/showcase.ts`)가 리뉴얼을 절반만 따라왔다(`showcase-code-2026-11-10.jpg`). 모듈 지도가 4묶음 20모듈이다(지금 7묶음 35모듈). 히어로 문구가 "다섯 제품이 같은 토큰과 같은 부품을 씁니다"로 D-49 뒤 소개와 다르다. 강조 구절이 옛 파랑 → 보라 그라데이션이다. 콜라주의 홈 창이 사이드바 메뉴 길이만큼 세로로 늘어나 깨진다. 인사 화면이 없다 |
| SH-3 | 회사 색 · 다크 · 밀도처럼 리뉴얼에서 바뀐 것이 쇼케이스에 없다 |

**시스템(SY) — 코드까지 본 범용 보완**

"있다 · 일부 · 없다"는 contract가 있는지로 갈랐다. 블록 안에서 직접 그린 것은 "일부"다.

| 번호 | 영역 | 내용 |
|---|---|---|
| SY-1 | 에이전트 대화 | 화면이 없다. 블록 0개이고 패턴 `ConversationalWork`는 `components.md` §10 표 한 줄뿐이다 |
| SY-2 | 에이전트 대화 | 답변을 그릴 부품이 없다. MessageThread의 글은 줄바꿈과 링크만 되는 평문이다. 쓰는 중 상태, 표 · 목록 · 코드 서식, 출처 표시, 답변 평가(복사 · 다시 생성 · 좋음 · 나쁨)가 없다 |
| SY-3 | 에이전트 대화 | 실행 단계 · 도구 실행 줄이 없다. 실행 상태 어휘는 배치용 `JOB_STATES` 5개뿐이고 "확인 대기"가 없다 |
| SY-4 | 에이전트 대화 | 에이전트가 제안한 변경을 사람이 승인 · 반려하는 카드가 없다. ChangeDiff · ReasonDialog는 있고 묶은 것이 없다. ChangeDiff를 쓰는 블록이 0개다 |
| SY-5 | 에이전트 대화 | AppShell에 옆 칸이 없어 업무 화면 옆에 대화를 붙일 수 없다. Drawer는 모달이다 |
| SY-6 | 에이전트 대화 | Composer에 멘션 · 명령(/) · 추천 질문이 없다. 추천 질문은 CommandPalette 안에만 있다 |
| SY-7 | 메신저 | 방 목록(안 읽음 수)을 블록이 직접 그린다(R-T22와 같은 요청). presence 어휘가 둘이다(R-T26) |
| SY-8 | 메신저 | 반응 · 멘션 · 답글 · 입력 중 표시가 없다. 고정 공지와 대화 검색은 단추만 있고 동작이 없다. 첨부는 파일 종류 아이콘뿐이고 그림 미리보기가 없다 |
| SY-9 | 회계 | 전표의 차변 · 대변 일치 검사, 시산표 소계 행, 마감 점검 목록을 블록이 직접 만든다. DataGrid `preset="ledger"`는 PE-07 ☐다. 트리 합계와 묶음(groupBy)을 함께 못 쓴다 |
| SY-10 | 회계 | MaskedInput에 계좌번호 프리셋이 없다. 은행 대사 화면이 없다. 채권 연령은 3구간 막대뿐이고 표가 없다. 예산 대비 표와 diverging 팔레트는 PE-08 ☐다 |
| SY-11 | 재고 | 재고 실사 · 피킹 목록 · 라벨 인쇄(Paper는 a4 · a5) · 창고 위치 고르기가 없다. QuantityInput은 단위만 고르고 환산 계수가 없다 |
| SY-12 | 대시보드 | 위젯 배치 편집이 없다(`blocks/src/_ui`의 Grid는 고정 12열). 간트(PE-08 ☐) · 깔때기 · 3계열 이상 누적 막대 · 분산형이 없다. PeriodPicker에 비교 기간이 없다. "엑셀 다운로드" 단추가 블록 25개에 있고 동작을 잇는 도우미가 없다 |
| SY-13 | 범용 | 없는 기본 부품: Link(R-T34) · 지울 수 있는 Tag · TagInput(사람 칩, R-T25) · AvatarGroup · Divider · TreeSelect |
| SY-14 | 범용 | 일정 부품: 달력은 월 보기뿐이다. 주 · 일 보기, 시간 고르기(블록이 30분 Select를 직접 만든다), 주간 근무 막대(R-T23), 회의실 시간 띠가 없다 |
| SY-15 | 범용 | 블록이 직접 그린 것: 권한 표(`platform/admin/roles`) · 서식 도구 줄(`ecm/doc-editor`) · 고르는 세로 목록(R-T22) · 결재 단계 점(R-T24) · 결재선 편집(R-T25) |
| SY-16 | 범용 | EmptyState에 404 · 세션 만료가 없고 전체 화면 오류 블록이 없다. 그림 · PDF 미리보기가 없다. 엑셀 올리기(행 검증) 흐름이 없다. 부품(FileUpload · IssueList · Progress · Stepper)은 있다 |
| SY-17 | 대시보드   | 예측선(실적 뒤에 예측 점선과 구간)과 지도(지역별 값)가 없다. Patrick이 든 세 제품(수요예측 추천 · 업무용 에이전트 · 프랜차이즈 대시보드) 중 둘이 쓴다 |

이미 있는 것도 적어 둔다. 계정과목 고르기(CodeSearch), 사업자등록번호(MaskedInput `bizNo`), 한글 금액(`formatKoreanAmount` · AmountInput `showKorean`), 안전재고 대비(DataBar `marker` · `warnBelow`), 유통기한(DueBadge), 바코드(ScanField), 기간 고르기(PeriodPicker), 인쇄 미리보기와 도장 · 서명(Paper), 메시지 묶기 · 날짜 줄 · 안 읽음 선 · 읽음 수(MessageThread), 목표 대비(BulletBar · RadialMeter), 변경 비교(ChangeDiff).

### 0.3 모듈 타일

감사 때는 모듈 35개 중 15개(세무와 유통 · 물류 · 이커머스 · 제조 전부)에 타일 그림이 없었다. 2026-11-10에 Patrick이 15종을 주어 `packages/icons/src/module-tiles/`에 넣었다(149175c). 지금은 모듈 35개 전부 타일이 있다(타일 36개, 지출결의 포함). Figma에는 PG-01이 넣는다.

## 1. 결정(확정 2026-11-10)

Patrick이 추천안 그대로 받았다. `decisions.md` "원문과 다른 점" 표에 D-110~D-117로 옮겼다. D-117은 진행 방식이다: 사람 확인 줄에서 멈추지 않고 추천안으로 진행하며 "확인 대기"를 적는다.

| 번호 | 무엇 | 추천 | 다른 안 | 이유 |
|---|---|---|---|---|
| D-110 | 라이브러리 연결 시점과 주인 | G2 전에 지금 연결한다. Foundations가 변수 · 글자 · 그림자 스타일의 주인, Components가 세트 · 아이콘 · 모듈 타일의 주인, Screens는 두 라이브러리를 쓰기만 한다. Foundations의 Module icons 페이지는 타일 사본을 게시하지 않는 이름(`_tile/<id>`)으로 바꾼다 | D-106 그대로 G2 뒤에 연결 | 파일이 팀 프로젝트로 옮겨졌다. 연결해 두면 G2 뒤 P2-22는 Foundations 한 번만 고치고 다시 게시하면 된다. 코드의 의존 방향 `tokens ← contracts ← apps`와 같다 |
| D-111 | 쇼케이스 위치와 만드는 법 | Screens 파일 맨 앞 페이지 `Showcase · 1440` · `Showcase · 390`. 원본은 코드(`apps/preview`)이고 Figma는 캡처가 아니라 컴포넌트 인스턴스와 화면 프레임 복제로 조립한다 | 네 번째 파일 "Trellis · Showcase" | 콜라주는 화면 프레임을 복제해 줄여 쓴다. 플러그인 API는 다른 파일의 노드를 복제하지 못한다. 변수에 묶어 두면 Company 모드만 바꿔 회사 색 판을 만든다 |
| D-112 | Figma 컴포넌트 범위 | contract 96종 전부(Icon · TrellisProvider 제외)와 화면 조립용 하위 부품. 하위 부품 이름은 `<Name> / <부품>`이고 CSS 요소 클래스(`tl-<name>__<부품>`)가 있는 것만 만든다 | P2-16 그대로(P0 + G2 화면이 쓰는 것, 나머지는 1.0 뒤) | 1.0 정의의 9개 영역 화면을 Figma에서 조립하려면 입력 · 표 · 차트가 있어야 한다 |
| D-113 | 세트 규칙 보완 | (1) CSS에서 모양을 바꾸지 않는 prop은 변형 축에서 뺀다. (2) 값이 하나뿐인 `state` 축은 두지 않는다. (3) 항목 수가 바뀌는 세트는 항목 부품 + 최대 개수까지 숨김 속성으로 만든다(Tabs 8 · SelectableCard 6 · RadioGroup 6) | 지금 규칙(contract `values` 전부를 축으로) | ProfileHeader 360 → 120, Popover 144 → 72. 화면에서 탭과 항목이 빠지지 않는다 |
| D-114 | 메신저 · 에이전트 대화를 1.0에 넣을지 | 넣는다. 1.0 정의 문장에 "메신저 · 에이전트 대화"를 더하고 범위는 묶음 G의 "1.0" 표시 작업까지다 | 1.0 뒤 | 기획 원문 §7.2의 Theme A 7화면에 파일 관리 제품 질의응답이 있었고 D-104에서 빠졌다. 다섯 제품 중 하나가 질의응답 제품이다 |
| D-115 | 새 화면의 모드 수 | 새로 넣는 화면은 Light · 주황과 Dark · 주황 2벌. 회사 색 4벌은 G2 화면 7종과 쇼케이스 회사 색 판에만 둔다 | 모든 화면 4벌 | 프레임 수가 4배가 되면 다시 맞추는 시간이 4배다 |
| D-116 | 에이전트 실행 상태 어휘 | 6개로 고정한다: `queued` 대기 · `running` 실행 중 · `waiting` 확인 대기 · `succeeded` 완료 · `failed` 실패 · `canceled` 중단. 색은 있는 상태 토큰을 쓴다(중립 · info · warning · success · danger · 중립) | 배치용 `JOB_STATES` 5개를 그대로 쓴다 | 사람 확인을 기다리는 상태가 배치 어휘에 없다. 앞 네 이름은 `JOB_STATES`와 같게 둔다. 새 토큰 값은 없다 |

## 2. 범위를 줄일 때

저녁 · 주말 작업 기준으로 전체는 45세션 안팎이다. 1.0까지 남은 다른 작업과 겹치므로 줄일 때는 아래 순서로 자른다.

| 단계 | 작업 | 세션 | 남는 것 |
|---|---|---|---|
| 최소 | PG-00~04 · PG-06 · PG-07 · PG-13 · PG-20~22 | 11 | 연결된 파일 셋, 쇼케이스 1440 · 390 · 다크 · 회사 색 |
| 1.0 | 최소 + PG-05 · PG-08~12 · PG-14~17 · PG-19 · 묶음 G의 "1.0" 작업 | 약 36 | Figma에서 9개 영역 화면을 조립한다. 메신저와 에이전트 대화 화면이 코드와 Figma에 있다 |
| 전체 | 1.0 + PG-18 · PG-23 · 묶음 G의 나머지 | 약 45 | 이커머스 · 제조 화면, 업무 영역 판, 범용 보완 전부 |

## 3. 실행 순서

게시를 두 번으로 줄이려고 연결(PG-02 · PG-03) 앞에 만들 수 있는 것을 다 만든다(D-110). 세트는 먼저 파일의 지역 변수로 만들고 PG-02가 한꺼번에 라이브러리 변수로 바꾼다.

| 순번 | 작업 | 의존 | 누가 |
|---|---|---|---|
| 0 | PG-00 결정 반영 | — | ☑ |
| 1 | PG-01 key 목록 · 감사 스크립트, PG-05 Foundations 보완 | PG-00 | 에이전트 |
| 1 | PG-04 코드 쇼케이스 리뉴얼 | PG-00 | 에이전트(문구 · 시안은 확인 대기) |
| 1 | PG-06~11 Components 세트 50종 | PG-00 | 에이전트 |
| 1 | 묶음 G 코드 보완(PG-30~44) | 작업마다 | 에이전트(새 토큰 값은 제안만) |
| 2 | 묶음 G의 새 세트를 Components에 추가, PG-12 세트 규칙 정리 | PG-06~11 · 묶음 G | 에이전트 |
| 3 | Foundations 게시 | PG-01 · PG-05 | 사람 |
| 4 | PG-02 Components 연결 | Foundations 게시 | 에이전트 |
| 5 | Components 게시 | PG-02 | 사람 |
| 6 | PG-03 Screens 연결 | Components 게시 | 에이전트 |
| 7 | PG-13 기존 화면 정리 → PG-14~19 화면 확장 | PG-03 | 에이전트 |
| 8 | PG-20~23 쇼케이스(Figma) | PG-04 · PG-13 | 에이전트 → 사람(시각 확인) |

5번 뒤에 Components를 고치면 다시 게시해야 Screens에 보인다. 작업 끝 메시지에 "게시 필요"를 쓴다.

## 4. 공통 규칙

- Figma 작업은 `.claude/skills/ds/figma-sync/SKILL.md`를 먼저 읽는다. 스킬 `figma:figma-use`를 읽고 `use_figma`를 부른다. 세트를 만들면 `figma:figma-generate-library`, 화면을 만들면 `figma:figma-generate-design`을 함께 읽는다.
- 페이지를 읽기만 할 때는 `await page.loadAsync()`로 전환 없이 읽는다. 쓰는 호출은 한 호출에 페이지 전환 한 번이다.
- 코드가 원본이다. 모양의 기준은 `packages/react/src/<Name>/<Name>.css`와 spec.md, 화면의 기준은 데모 캡처다(`pnpm --filter @terracelab/demo build && (cd apps/demo && node scripts/check.mjs <폴더> --only <블록 id 앞부분>)`).
- 토큰 값은 바꾸지 않는다. 변수 이름이 더 필요하면 토큰 PR을 먼저 내고 값은 사람이 승인한다.
- 타사 제품 이름 · 자산 · 문구를 Figma 레이어 이름과 글자에도 쓰지 않는다. 문구는 `docs/spec/content.md`를 따른다.
- 완료 증명은 PG-01이 만드는 `scripts/figma-audit.mjs`로 한다. `--emit <종류>`가 읽기 전용 감사 스크립트를 내고, 그 결과 JSON을 `docs/figma/audit/<작업>.json`에 저장한 뒤 `--check`가 기대값과 비교한다. 다르면 종료 코드 1이다.
- 눈에 보이는 결과가 나오는 작업은 `get_screenshot`으로 대표 프레임을 받아 `docs/plan/notes/figma-2026-11/`에 저장하고, 세션 끝에 Artifact 페이지로 보여 준다.
- 작업이 끝나면 `docs/figma/README.md`의 해당 절과 이 파일의 상태 줄을 고친다.

## 5. 작업

### PG-00 결정 반영
상태: ☑ 완료 2026-11-10 — D-110~D-117, README 1.0 정의 · 실행 순서 표 · 문서 지도, 3절 순서를 게시 2회에 맞게 고침
의존: Patrick 확인(1절)
목표: 확인된 결정을 `decisions.md`와 `README.md`에 반영해 다음 세션이 이 트랙을 실행 순서 표에서 고르게 한다.
산출물: `decisions.md` D-110~D-116 행, `README.md` 문서 지도 · 실행 순서 표 · 1.0 정의(D-114를 받으면), P2-16 · P2-20 · P2-22 상태 줄의 범위 문장.
작업: 1절 표를 Patrick이 고친 대로 옮긴다. 3절 순서를 `README.md` 실행 순서 표에 넣는다. P2-22는 "G2 값으로 Foundations를 다시 맞추고 다시 게시"로 줄인다.
완료 조건:
- `grep -c "^| D-11[0-7]" docs/plan/decisions.md` = 8
- `README.md` 실행 순서 표에 PG 작업이 있다
- `pnpm build:docs`와 `node scripts/check-forbidden.mjs` 통과
사람 확인: 1절 표와 2절 단계 선택

### PG-01 key 목록 · 게시 준비 · 감사 스크립트
상태: ☑ 완료 2026-11-10 — `scripts/figma-audit.mjs`, `docs/figma/keys.json`(Foundations · Components), 표지 정리, 타일 `_tile/` 36. `figma-audit --check docs/figma/audit/PG-01.json` 통과
의존: PG-00
근거: L-1 · L-3 · L-4 · FD-1
목표: 게시 뒤 다른 파일에서 가져올 key를 저장소에 두고, 사람이 Foundations를 게시할 수 있게 정리한다.
산출물: `scripts/figma-audit.mjs`(`--emit keys|links|sets|screens` · `--check <json>` · `--help`, 테스트 포함), `docs/figma/keys.json`(파일별 변수 · 글자 스타일 · 효과 스타일 · 세트 · 낱개 컴포넌트 · 아이콘 · 타일의 이름 → key), `docs/figma/audit/PG-01.json`.
작업:
1. `figma-audit.mjs --emit keys` 스크립트를 세 파일에 돌려 `variable.key` · `style.key` · `componentSet.key` · `component.key`를 읽는다.
2. Foundations 표지의 잘린 줄을 고치고 섬네일을 지정한다(`figma.setFileThumbnailNodeAsync`).
3. Foundations Module icons 페이지의 `tile/<id>`를 `_tile/<id>`로 바꾸고 새 타일 15개를 더한다(D-110). Components의 Module tiles 페이지에도 `tile/<id>` 15개를 더한다.
4. 게시 절차를 `docs/figma/README.md`에 적는다: 어느 파일에서 무엇을 게시하는지, 게시 뒤 확인할 것.
완료 조건:
- `node scripts/figma-audit.mjs --check docs/figma/audit/PG-01.json` 통과: Foundations 변수 474 · 글자 스타일 12 · 효과 스타일 3, Components 세트 45 · 아이콘 156 · 타일 21의 key가 모두 있다
- `keys.json`의 변수 이름 집합 = `packages/tokens/dist/figma/variables.json`의 변수 이름 집합
- `pnpm test`에서 `figma-audit` 테스트 통과
사람 확인: Foundations 파일에서 라이브러리 게시(변수 6컬렉션 · 글자 스타일 12 · 효과 스타일 3)

### PG-02 Components를 Foundations에 연결
상태: ☑ 완료 2026-11-10 — 지역 컬렉션 · 스타일 0, 바인딩 전부 라이브러리, 세트 117 · 변형 2,109 그대로, 세트 10개 앞뒤 캡처 차이 0픽셀. `figma-audit --check docs/figma/audit/PG-02.json` 통과. Components 게시 대기
의존: Foundations 게시, PG-06~12와 묶음 G의 새 세트(있는 만큼)
근거: L-1
목표: Components의 모든 변수 · 스타일 바인딩을 Foundations 라이브러리로 옮기고 사본을 지운다.
산출물: 연결된 Components 파일, 키트 v2(스킬 문서 3절: `V()`가 `importVariableByKeyAsync`로 가져온 변수를 돌려준다), `docs/figma/audit/PG-02.json`.
작업:
1. 바꾸기 전에 세트 5개(Button · Badge · DataGrid · AppShell · Payslip)를 `get_screenshot`으로 저장한다.
2. `keys.json`으로 변수 474개와 스타일 15개를 가져온다.
3. 페이지마다 한 호출로 노드를 돌며 `boundVariables`의 지역 변수를 이름이 같은 라이브러리 변수로 다시 묶는다. 칠 · 선은 `setBoundVariableForPaint`(불투명도는 다시 넣는다), 글자 · 효과 스타일은 `textStyleId` · `effectStyleId`를 가져온 스타일로 바꾼다. 명시 모드(`explicitVariableModes`)는 라이브러리 컬렉션으로 다시 건다.
4. 지역 변수를 가리키는 곳이 0인지 확인한 뒤 지역 컬렉션 6개와 지역 스타일을 지운다.
5. 1번 세트를 다시 받아 픽셀을 비교한다.
완료 조건:
- `figma-audit --check docs/figma/audit/PG-02.json` 통과: 지역 컬렉션 0, 지역 글자 · 효과 스타일 0, 변수에 묶이지 않은 SOLID 칠 · 선 0, 바인딩 수 = 바꾸기 전 수, 세트 수와 세트마다 변형 수가 바꾸기 전과 같다
- 세트 5개의 앞뒤 캡처 차이 0픽셀
사람 확인: Components 파일에서 라이브러리 게시

### PG-03 Screens를 라이브러리에 연결
상태: ◐ 진행 2026-11-10 — 변수 · 스타일 · 인스턴스 2,928개 연결, 사본 페이지 3개 삭제, 표지 · 키트 v2. 남은 것: PersonLabel 12 · ProfileHeader 2(두 세트가 게시에서 빠짐, 속성 이름 충돌을 고친 뒤 다시 게시하면 교체)
의존: Components 게시
근거: L-2 · L-3 · SC-1
목표: Screens의 변수와 인스턴스를 라이브러리로 옮기고 사본 페이지를 지운다.
산출물: 연결된 Screens 파일(사본 페이지 4개 삭제), `screen-kit.js` v2(세트를 `importComponentSetByKeyAsync`로 가져온다), 표지, `docs/figma/audit/PG-03.json`.
작업:
1. 바꾸기 전에 프레임 6개(G2 4 · 시험 2)를 캡처한다.
2. 변수 · 스타일은 PG-02와 같은 방법으로 다시 묶는다.
3. 인스턴스마다 본체의 세트 이름 · 변형 이름으로 라이브러리 변형을 찾아 `swapComponent`로 바꾼다. 덮어쓴 글자와 속성이 남았는지 인스턴스 수와 글자 표본으로 확인한다.
4. "라이브러리 사본 · 컴포넌트 사본 · Icons · Module tiles" 페이지와 지역 컬렉션 · 스타일을 지운다.
5. Cover 페이지를 채우고 섬네일을 지정한다. 문서에 저장한 키트(shared plugin data)를 v2로 바꾼다.
완료 조건:
- `figma-audit --check docs/figma/audit/PG-03.json` 통과: 지역 컴포넌트 0, 지역 컬렉션 0, 인스턴스 수 2,942, 본체가 지역인 인스턴스 0, 프레임 48개의 Semantic · Company 모드 명시
- 프레임 6개의 앞뒤 캡처 차이 0픽셀
- Cover 페이지 노드 수 1 이상
사람 확인: 없음

### PG-04 코드 쇼케이스 리뉴얼
상태: ☑ 완료 2026-11-10 — 판 5개, 지도 7묶음 35모듈, preview check 통과. 히어로 제목은 안 2 "Trellis는 테라스랩의 디자인 시스템입니다"로 확정(Patrick 2026-11-10). 지도 배치와 판 구성은 확인 대기. 에이전트 대화 줄은 PG-34 뒤에 더한다
의존: PG-00
근거: SH-2 · SH-3
목표: `apps/preview`의 쇼케이스를 지금 토큰 · 모듈 · 화면으로 다시 그린다. Figma 쇼케이스의 원본이다.
산출물: `apps/preview/src/sections/showcase.ts`(판 5개), `apps/preview/scripts/export-showcase.mjs`(모듈 지도 좌표 · 간선 · 라벨 · 색 토큰 이름을 `dist/showcase/molecule.json`으로), 테스트, Artifact 페이지.
작업:
1. SC-01 히어로. 구성은 그대로다(왼쪽 세 줄 제목 + 한 구절 강조 + 한 문단 + 글자 링크, 오른쪽 모듈 지도). 모듈 지도는 `modules.json`의 7묶음 35모듈을 육각 격자에서 생성한다. 간선이 격자에 맞지 않으면 빌드가 던지는 검사를 유지한다. 강조 구절은 `color.brand.default` 한 색이다.
2. SC-02 기기 콜라주. 가운데 제목은 그대로 두고 조각을 지금 화면으로 바꾼다: 1440 역할별 홈 창, 1024 구성원 목록, 390 휴대폰 홈(출퇴근), 다크 모듈 런처, 결재선, 급여 명세 한 귀퉁이, 달력. 홈 창은 고정 비율 틀 안에서 자른다.
3. SC-03 알림 카드 월. 구성은 그대로다. 카드는 실제 `NotificationCard`, 근태 막대와 자금 일보는 실제 차트 컴포넌트를 쓴다.
4. SC-04 회사 색. 같은 화면 한 장을 프리셋 8개로 나란히 놓는다.
5. SC-05 업무 영역. 인사 · 회계 · 재고 · 메신저 · 에이전트 대화 화면을 한 줄씩 놓는다. 에이전트 화면은 묶음 G 뒤에 넣고 그때까지 4장이다.
6. `apps/one`이 `heroPanel` · `collagePanel` · `cardsPanel`을 문구 옵션과 함께 가져다 쓴다. 내보내는 함수 이름과 옵션 모양을 유지하고 새 판은 함수를 더한다.
7. 문구는 `content.md` §3 점검표를 통과시킨다. 히어로 제목 안 두 개를 Artifact에 나란히 보인다. 안 1 "회사 색 하나로 / 업무 화면 전체를 / 맞춥니다", 안 2 "Trellis는 / 테라스랩의 / 디자인 시스템입니다". 한 문단에는 실제 숫자(컴포넌트 96종 · 화면 블록 64개 · 모듈 35개)를 쓴다.
완료 조건:
- `pnpm --filter preview build && pnpm --filter preview check` 통과(크기 · 외부 요청 0 · axe 4조합)
- `pnpm --filter @terracelab/one build` 통과(소개 사이트가 같은 조각을 쓴다)
- `molecule.json`의 묶음 7 · 모듈 35 = `modules.json`(테스트)
- 1440 · 390에서 가로 넘침 0(`check`)
- `node scripts/check-forbidden.mjs` 통과
사람 확인: Artifact에서 히어로 제목 안, 모듈 지도 배치, 판 5개 구성

### PG-05 Foundations 문서 · 변수 보완
상태: ☑ 완료 2026-11-10 — 결과와 감사 수치는 `notes/track-g-log.md`
의존: PG-00(지역 변수로 만들고 PG-02가 연결한다)
근거: FD-2~FD-6
목표: 토큰에 있는 것이 Figma 변수와 문서에 다 있게 한다.
산출물: `packages/tokens/sd/formats/figma.mjs`(layout 9개를 Primitives에 추가, D-118), Foundations 페이지 Guidelines · Chart palette · Motion · Layout · Paper · 수정 메모, changeset.
작업:
1. `figma.mjs`가 `layout/*` 9개를 내보내게 한다(D-118, 이름은 토큰 경로 그대로, 값 변경 없음). `z` · `breakpoint`는 Figma에 대응이 없어 Layout 문서 페이지에만 적는다. `figma-diff --emit upsert`로 Foundations에 반영한다(변수 483, 해시 d0377fa9).
2. Guidelines 페이지: CLAUDE.md의 절대 규칙 · 원칙 6 · 고정 어휘(상태 7 · 결재 5 · 금융 색) · 이름 규칙, 상태 표시 규칙(점 · 글자 · 배지), Figma 사용 규칙. 2026-11-07 파일의 `37:2` 구성을 따른다.
3. Chart palette(계열 5 · 비교 · 격자 · 축 · 열 5, 색각 보정 12), Motion(duration 11 · 쓰임), Layout(글로벌 바 · 사이드바 · 본문 폭 · breakpoint · z 순서 그림), Paper(종이 크기 4 · 여백 · 글자 14) 페이지.
4. 글자 스타일 `mono`를 Figma에 있는 고정폭 글꼴로 바꾼다. 후보를 `listAvailableFontsAsync`로 확인하고 README에 적는다.
5. 수정 메모 페이지: G2 승인 대기 값 목록.
완료 조건:
- `node scripts/figma-diff.mjs <Foundations 스냅샷>` 차이 0, 해시가 `--hash`와 같다
- `pnpm --filter @terracelab/trellis-tokens test` 통과(figma 출력 스냅샷 갱신)
- `figma-audit --check docs/figma/audit/PG-05.json` 통과: 페이지 12개, 묶이지 않은 칠 0, 글자 스타일 없는 글자 0
사람 확인: Foundations 다시 게시. mono 글꼴 선택

### PG-06 Components — 화면 뼈대 · 표 부품
상태: ☑ 완료 2026-11-10 — 결과와 감사 수치는 `notes/track-g-log.md`
의존: PG-00(지역 변수로 만들고 PG-02가 연결한다)
근거: CP-1 · CP-2 · CP-6 · SC-3
목표: 화면을 세트만으로 조립할 수 있게 뼈대 세트와 표 부품을 만든다.
산출물: 세트 PageHeader · FilterBar · ActionBar · Pagination · KpiCard · SideNav(묶음 머리 · 접힘 · 폭 64) · LineItemsEditor, 부품 `DataGrid / Header cell` · `DataGrid / Cell` · `DataGrid / Row` · `DataGrid / Summary row`.
작업: 키트 v2 + 빌더. `DataGrid / Cell`의 종류는 DataGrid CSS의 칸 종류 그대로다(글자 · 금액 수입 · 지출 · 중립 · 상태 점 · 사람 · 막대 · 단추). 글자는 TEXT 속성, 정렬과 종류는 변형이다. DataGrid 세트 안의 행을 새 부품 인스턴스로 바꾼다.
완료 조건:
- `figma-audit --check docs/figma/audit/PG-06.json` 통과: 새 세트 7 · 부품 4, 변형 수 = 축 값의 곱, 묶이지 않은 칠 0, 페이지 이름 = 세트 이름, 설명에 contract 경로
- DataGrid 세트 안 표 영역에서 인스턴스 밖 TEXT 0
사람 확인: Components 다시 게시

### PG-07 Components — 차트 14
상태: ☑ 완료 2026-11-10 — 결과와 감사 수치는 `notes/track-g-log.md`
의존: PG-00(지역 변수로 만들고 PG-02가 연결한다)
근거: CP-1
목표: 차트 계열을 Components에 만든다.
산출물: 세트 Legend · Sparkline · SegmentedBar · HeatCell · DataBar · BulletBar · RadialMeter · TrendChart · ComboChart · BarList · WaterfallChart · Donut · CalendarHeatmap · ChartCard.
작업: 기하는 `apps/preview/src/data.ts`와 같은 숫자에서 계산한다. 색은 `color/chart/*`만 쓴다. 금액 막대의 수입 · 지출은 `color/finance/*`다. ChartCard는 "표로 보기" 자리를 포함한다. 2026-11-07 파일 Charts 보드(`83:155`)의 구성을 참고한다.
완료 조건:
- `figma-audit --check docs/figma/audit/PG-07.json` 통과: 세트 14, 묶이지 않은 칠 · 선 0, 차트 색이 `color/chart/*` · `color/finance/*` · `color/fg/*` · `color/border/*`만
- 라이트 · 다크 캡처를 Artifact에 놓는다
사람 확인: Components 다시 게시

### PG-08 Components — 입력 1
상태: ☑ 완료 2026-11-10 — 결과와 감사 수치는 `notes/track-g-log.md`
의존: PG-00(지역 변수로 만들고 PG-02가 연결한다)
근거: CP-1
산출물: 세트 Field · FormSection · Textarea · AmountInput · QuantityInput · MaskedInput · SegmentedControl.
작업: 키트 v2 + 빌더. Field는 라벨 · 필수 표시 · 도움말 · 오류 글과 입력 자리(INSTANCE_SWAP)를 가진다. AmountInput은 오른쪽 정렬과 단위 자리를 가진다.
완료 조건: `figma-audit --check docs/figma/audit/PG-08.json` 통과(세트 7, 변형 수 = 축 값의 곱, 묶이지 않은 칠 0)
사람 확인: 없음(PG-09 뒤 함께 게시)

### PG-09 Components — 입력 2
상태: ☑ 완료 2026-11-10 — 결과와 감사 수치는 `notes/track-g-log.md`
의존: PG-08
근거: CP-1
산출물: 세트 DateField · PeriodPicker · MultiSelect · CodeSearch · ScanField · FileUpload · Attachment. 열린 모양(달력 · 목록 · 휴대폰 시트)은 같은 페이지의 낱개 컴포넌트로 둔다.
완료 조건: `figma-audit --check docs/figma/audit/PG-09.json` 통과(세트 7)
사람 확인: Components 다시 게시

### PG-10 Components — 상태 · 피드백
상태: ☑ 완료 2026-11-10 — 결과와 감사 수치는 `notes/track-g-log.md`
의존: PG-00(지역 변수로 만들고 PG-02가 연결한다)
근거: CP-1
산출물: 세트 Banner · EmptyState · ErrorSummary · Skeleton · Spinner · Progress · StatusDot · DueBadge · Tooltip.
작업: Banner는 바탕 surface + 가는 선이다(색 바탕 · 왼쪽 굵은 선 없음, D-56 · D-57). Skeleton은 표 · 카드 · 글 모양 변형을 둔다.
완료 조건: `figma-audit --check docs/figma/audit/PG-10.json` 통과(세트 9)
사람 확인: 없음(PG-11 뒤 함께 게시)

### PG-11 Components — 탐색 · 기록 · 서식
상태: ☑ 완료 2026-11-10 — 결과와 감사 수치는 `notes/track-g-log.md`
의존: PG-10
근거: CP-1
산출물: 세트 Menu · CommandPalette · Stepper · Timeline · DescriptionList · Paper(A4 세로 · 가로 틀과 서식 조각).
완료 조건: `figma-audit --check docs/figma/audit/PG-11.json` 통과(세트 6). Components의 contract 세트 수 94
사람 확인: Components 다시 게시

### PG-12 Components — 세트 규칙 정리 · 페이지 문서
상태: ☑ 완료 2026-11-10 — 세트 16개 제자리 정리(key 그대로), Usage 프레임 25. `figma-audit --check docs/figma/audit/PG-12.json` 통과. Components 다시 게시 필요
의존: PG-11
근거: CP-3 · CP-4 · CP-5
목표: D-113을 기존 세트에 적용하고 페이지마다 쓰임을 보인다.
산출물: 고친 세트(ProfileHeader · Popover · Card · HrRecord의 축, 값이 하나뿐인 `state` 축 10세트, Tabs · SelectableCard · RadioGroup · Payslip의 항목 부품), 페이지마다 `Usage · <Name>` 프레임, 스킬 문서 3절 규칙 갱신.
작업: 세트를 지우지 않고 그 자리에서 고친다(화면 인스턴스가 이어진다). 지울 수밖에 없으면 스킬 문서의 "같이 다시 만들 세트" 표를 따른다. `Usage` 프레임은 spec.md의 해부와 "쓰는 곳 · 쓰지 않는 곳"에서 만들고 실제 화면 조각 1개를 인스턴스로 놓는다. 먼저 P0 18종과 PG-06 세트에 하고 나머지는 같은 스크립트로 채운다.
완료 조건:
- `figma-audit --check docs/figma/audit/PG-12.json` 통과: ProfileHeader 120 · Popover 72, 값 하나짜리 `state` 축 0, Tabs 칸 8 · SelectableCard 6 · RadioGroup 6, `Usage` 프레임이 있는 페이지 25 이상
- Components 안에서 끊긴 인스턴스 0(Screens는 PG-03에서 라이브러리 세트로 바꾼다)
사람 확인: Components 다시 게시

### PG-13 Screens — 기존 화면 정리
상태: ☐ 대기
의존: PG-03 · PG-06
근거: SC-3 · SC-4 · SC-7
목표: 기존 17화면을 새 부품으로 다시 조립하고 결함을 고친다.
산출물: 다시 만든 기준 프레임 17개와 모드 복제, G2 화면 6종의 390 프레임(라이트 · 다크), `docs/figma/audit/PG-13.json`.
작업: `screen-kit.js`의 `TBL` · 카드 · 머리줄 도우미가 `DataGrid / *` · KpiCard · Card · PageHeader · FilterBar 인스턴스를 놓게 고친 뒤 화면을 다시 만든다. SC-7 세 가지를 고친다. 390은 데모의 390 캡처를 기준으로 한다.
완료 조건:
- `figma-audit --check docs/figma/audit/PG-13.json` 통과: 표 영역의 인스턴스 밖 TEXT 0, 기준 프레임마다 PageHeader 인스턴스 1, 프레임 밖으로 넘친 자식 0, 묶이지 않은 칠 0
- G2 화면 7종 × 1440 · 390 × 라이트 · 다크 프레임 28개가 있다(P2-20 완료 조건)
- 팀 근태 달력 · 시험 홈 캡처를 notes에 저장한다
사람 확인: 없음

### PG-14 Screens — 회계 · 세무 · 자금
상태: ☐ 대기
의존: PG-06 · PG-07 · PG-08
근거: SC-2
산출물: 페이지 `회계 · 세무 · 자금`에 `erp/accounting/journal` · `trial-balance` · `vendor-ledger` · `erp/tax/invoice-issue` · `vat-return` · `erp/treasury/daily-cash` 6화면 × 2모드.
작업: 블록마다 데모 1440 캡처를 받아 기준으로 삼는다. 금액은 오른쪽 정렬, 단위는 표 머리에 한 번, 수입 빨강 · 지출 파랑이다. 프레임 이름은 `<제목> · <블록 id> · <폭> · <모드>`다.
완료 조건: `figma-audit --check docs/figma/audit/PG-14.json` 통과(프레임 12, 표 영역 인스턴스 밖 TEXT 0, 묶이지 않은 칠 0, 모드 명시)
사람 확인: 없음

### PG-15 Screens — 구매 · 영업 · 재고 · 물류
상태: ☐ 대기
의존: PG-14
근거: SC-2
산출물: 페이지 `구매 · 영업 · 재고 · 물류`에 `erp/purchasing/po-form` · `po-list` · `erp/sales/orders` · `erp/sales/analysis` · `scm/inventory/stock` · `scm/inventory/lots` · `scm/warehouse/receiving` 7화면 × 2모드, `scm/delivery/driver` 390 × 2모드.
완료 조건: `figma-audit --check docs/figma/audit/PG-15.json` 통과(프레임 16)
사람 확인: 없음

### PG-16 Screens — 그룹웨어 · 메신저 · 문서
상태: ☐ 대기
의존: PG-09 · PG-11
근거: SC-2
산출물: 페이지 `그룹웨어 · 문서`에 `groupware/messenger/chat` · `mail/inbox` · `calendar/month` · `board/notices` · `approval/draft` · `ecm/my-docs/browser` 6화면 × 2모드.
완료 조건: `figma-audit --check docs/figma/audit/PG-16.json` 통과(프레임 12)
사람 확인: 없음

### PG-17 Screens — 대시보드 · 플랫폼 · CRM
상태: ☐ 대기
의존: PG-07 · PG-11
근거: SC-2
산출물: 페이지 `대시보드 · 플랫폼 · CRM`에 `home/dashboard/trade` · `platform/auth/login` · `platform/admin/roles` · `platform/audit/log` · `platform/notifications/center` · `crm/opportunities/pipeline` · `crm/customers/list` 7화면 × 2모드.
완료 조건: `figma-audit --check docs/figma/audit/PG-17.json` 통과(프레임 14)
사람 확인: 없음

### PG-18 Screens — 이커머스 · 제조
상태: ☐ 1.0 뒤(제안) — P2-23 기준으로 이커머스 · 제조 전용은 1.0 뒤가 기본이다
의존: PG-17
근거: SC-2
산출물: `commerce/orders/list` · `products/edit` · `settlement/list` · `mes/shop-floor/board` · `equipment/status` · `quality/inspections` 6화면 × 2모드.
완료 조건: `figma-audit --check docs/figma/audit/PG-18.json` 통과(프레임 12)
사람 확인: 없음

### PG-19 Screens — 폭 · 상태 · 밀도 · 고대비
상태: ☐ 대기
의존: PG-13 · PG-10
근거: SC-4 · SC-5 · SC-6
산출물: 구성원 목록 · 결재 상세 · 전표 입력 · 재고 현황의 1024 프레임, 구성원 목록 기준 상태 화면 4장(빈 · 로딩 · 오류 · 권한 없음), 역할별 홈의 Comfortable 1장과 HC Light 1장, 남은 회사 색 프리셋 4개(초록은 있음: 보라 · 분홍 · 하늘 · 거의 검정)를 역할별 홈 한 화면에.
완료 조건: `figma-audit --check docs/figma/audit/PG-19.json` 통과(프레임 14, Density · Semantic · Company 모드 명시)
사람 확인: 없음

### PG-20 쇼케이스 — 히어로 · 표지
상태: ☐ 대기
의존: PG-03 · PG-04
근거: SH-1 · FD-1 · SC-1
목표: Screens 파일 맨 앞에 쇼케이스 페이지를 만들고 SC-01을 넣는다.
산출물: 페이지 `Showcase · 1440`, 프레임 `SC-01 히어로 · 1440`, 세 파일의 표지(같은 틀: 파일 이름 · 한 문장 · 숫자 · 색인).
작업: 모듈 지도는 `molecule.json`의 좌표로 벡터를 그리고 선 색을 `color/module/<묶음>/default`에 묶는다. 라벨은 글자 스타일을 쓴다. 강조 구절은 `color/brand/default`다. 프레임에 Semantic · Company 모드를 명시한다. 구성 기준은 `showcase-figma-2026-11-07.jpg`와 PG-04 결과다.
완료 조건:
- `figma-audit --check docs/figma/audit/PG-20.json` 통과: 묶음 고리 7 · 모듈 라벨 35, 묶이지 않은 칠 · 선 0, 글자 스타일 없는 글자 0
- Company 모드를 파랑으로 바꾼 복제 캡처에서 강조 구절과 링크 색이 바뀐다(캡처 2장을 notes에)
사람 확인: Artifact에서 히어로 확인

### PG-21 쇼케이스 — 기기 콜라주 · 알림 카드 월
상태: ☐ 대기
의존: PG-20 · PG-07 · PG-13
근거: SH-1
산출물: 프레임 `SC-02 기기 콜라주 · 1440` · `SC-03 알림 카드 월 · 1440`.
작업:
1. SC-02는 같은 파일의 화면 프레임을 복제해 `rescale`로 줄이고 기기 틀(둥근 사각형 + 선) 안에 잘라 넣는다. 줄이면 숫자 변수 바인딩이 풀리므로 색 바인딩만 검사한다.
2. SC-03은 NotificationCard · 차트 세트 인스턴스로 조립한다. 카드는 어긋나게 놓고 가장자리에서 자른다.
3. 숫자와 문구는 PG-04의 데이터 그대로다.
완료 조건:
- `figma-audit --check docs/figma/audit/PG-21.json` 통과: SOLID 칠 · 선의 색 변수 바인딩 100%, SC-03의 카드가 전부 NotificationCard 인스턴스, 차트가 전부 차트 세트 인스턴스
- 1440 캡처 2장을 notes에 저장
사람 확인: Artifact에서 두 판 확인

### PG-22 쇼케이스 — 390 · 다크 · 회사 색
상태: ☐ 대기
의존: PG-21
근거: SH-1 · SH-3
산출물: 페이지 `Showcase · 390`(SC-01m · SC-03m), 1440 세 판의 Dark 복제, `SC-04 회사 색 · 1440`(같은 화면 × 프리셋 8), `docs/figma/README.md` 쇼케이스 절.
작업: 다크와 회사 색은 프레임을 복제해 모드만 바꾼다. 레이어를 고치지 않는다.
완료 조건:
- `figma-audit --check docs/figma/audit/PG-22.json` 통과: 쇼케이스 프레임 9개 이상, 복제 프레임의 레이어 수 = 기준 프레임, 모드만 다르다
- 2026-11-07 쇼케이스와 새 쇼케이스를 나란히 놓은 Artifact
사람 확인: 쇼케이스 전체 시각 승인

### PG-23 쇼케이스 — 업무 영역 판
상태: ☐ 대기
의존: PG-14 · PG-15 · PG-16 · 묶음 G의 에이전트 화면
근거: SH-3
산출물: `SC-05 업무 영역 · 1440`(인사 · 회계 · 재고 · 메신저 · 에이전트 대화 5장).
완료 조건: `figma-audit --check docs/figma/audit/PG-23.json` 통과(화면 5, 색 바인딩 100%)
사람 확인: Artifact 확인

### 묶음 G — 코드 보완

PG-24~29는 비워 둔다. 이 묶음의 컴포넌트 작업에는 `README.md`의 "컴포넌트 작업 공통" DoD 1~9가 완료 조건에 들어 있다. 각 작업은 끝에 Components 파일에 세트를 더하고(키트 v2) "게시 필요"를 알린다. R-T 번호가 붙은 요청은 P2-23이 1.0 안팎을 정하므로 여기서 다시 만들지 않고 그 결과를 따른다. PE-07 · PE-08 · PE-09에 이미 있는 것(DataGrid `preset="ledger"` · TimelineChart · diverging 팔레트 · 업종 패턴)은 그 작업에서 한다.

D-114가 확정되어 PG-30~36은 1.0 안이다. "1.0 뒤(제안)" 표시 작업도 D-117에 따라 이번에 이어서 한다.

### PG-30 에이전트 대화 규격
상태: ◐ 코드 완료 2026-11-10 — 규격 · 어휘(D-116) · 부품 spec. 남은 것: VRT 기준 이미지, Figma 세트
의존: PG-00(D-114 · D-116)
근거: SY-1~SY-6
목표: 에이전트 대화 화면의 구성과 새 부품의 이름 · props를 구현 전에 정한다.
산출물: `packages/contracts/src/patterns/ConversationalWork/spec.md`, 새 부품의 spec.md 초안, `_shared/vocab.ts`의 `AGENT_RUN_STATES`(D-116), `decisions.md`에 이름과 의존성 결정.
작업:
1. 화면 두 가지를 정한다. 전체 화면 대화(방 목록 + 대화 + 결과)와 업무 화면 옆 칸 대화다.
2. 부품을 정한다. 추천 이름이다: `RichText`(답변 본문의 제목 · 목록 · 표 · 코드 · 링크, 쓰는 중 표시), `Citation`(출처 번호 · 문서 이름 · 열기), `SuggestionChips`(추천 질문, Composer와 CommandPalette가 같이 쓴다), `RunSteps`(실행 단계 줄: 상태 점 · 이름 · 걸린 시간 · 펼친 상세), `ProposalCard`(제안 제목 · ChangeDiff · 승인 · 반려 사유 · 처리 뒤 상태), 답변 아래 동작 줄(복사 · 다시 생성 · 좋음 · 나쁨).
3. 기존 부품에 더할 것을 정한다: AppShell `aside` 칸, Composer `mentions` · `commands` · `suggestions`, MessageThread 항목의 에이전트 답변 모양.
4. 마크다운 해석에 라이브러리를 쓸지 정하고 `decisions.md` §2 기술 스택 표에 올린다.
5. 상태 어휘 7개와 겹치지 않게 쓴다. 쓰는 중은 `loading`, 실패는 `error`다.
완료 조건:
- 패턴 spec과 부품 spec 초안이 `components.md` §3 · §10 템플릿의 절을 다 채웠다(`node scripts/check-spec-parity.mjs`가 있으면 통과)
- `pnpm --filter @terracelab/trellis-contracts test` 통과(`AGENT_RUN_STATES` 6개 · 라벨 · 색조)
사람 확인: 부품 이름, 화면 두 가지의 구성 그림(Artifact), AppShell 옆 칸 폭 토큰 `layout.aside.width` 값 제안

### PG-31 에이전트 대화 부품 1 — 답변
상태: ◐ 코드 완료 2026-11-10 — RichText · Citation · SuggestionChips, 답변 모양과 동작 줄. 남은 것: VRT 기준 이미지, Figma 세트
의존: PG-30
근거: SY-2 · SY-6
산출물: `RichText` · `Citation` · `SuggestionChips`(contract · spec · 구현 · 스토리 · 테스트 · VRT), MessageThread의 에이전트 답변 모양과 답변 동작 줄, Composer `suggestions`.
완료 조건: 컴포넌트 DoD. `RichText`는 표 · 목록 · 코드 · 링크 · 쓰는 중 스토리가 있고 axe 0. `pnpm lint && pnpm typecheck && pnpm test` 통과
사람 확인: 스토리 캡처 Artifact

### PG-32 에이전트 대화 부품 2 — 실행 · 제안
상태: ◐ 코드 완료 2026-11-10 — RunSteps · ProposalCard. 남은 것: VRT 기준 이미지, Figma 세트
의존: PG-31
근거: SY-3 · SY-4
산출물: `RunSteps` · `ProposalCard`. ProposalCard는 ChangeDiff와 ReasonDialog를 쓴다.
완료 조건: 컴포넌트 DoD. RunSteps 스토리에 실행 상태 6개가 다 나온다. ProposalCard는 키보드로 승인 · 반려가 되고 반려는 사유가 있어야 확인이 켜진다(테스트)
사람 확인: 없음

### PG-33 AppShell 옆 칸 · Composer 확장
상태: ◐ 코드 완료 2026-11-10 — AppShell aside · Composer 멘션 · 명령. `layout.aside.width`는 제안만. 남은 것: VRT 기준 이미지, Figma 세트
의존: PG-30
근거: SY-5 · SY-6
산출물: AppShell `aside`(열고 닫기 · 폭 토큰 · 1024 미만에서는 시트), Composer `mentions` · `commands`, 토큰 PR(`layout.aside.width`).
완료 조건: 컴포넌트 DoD. `aside`가 없으면 지금 모양 그대로다(VRT 기존 스냅샷 변화 0). 390에서 가로 넘침 0
사람 확인: `layout.aside.width` 값 승인

### PG-34 에이전트 대화 블록 · Figma 화면
상태: ◐ 코드 완료 2026-11-10 — 블록 2개와 샘플 답변. Figma 화면은 PG-03 뒤. 남은 것: VRT 기준 이미지, Figma 세트
의존: PG-32 · PG-33
근거: SY-1
산출물: 블록 `platform/assistant/chat`(전체 화면 대화)와 `ecm/my-docs/ask`(문서 질의응답 옆 칸), 샘플 데이터(테라트레이딩 문서 · 전표 · 재고 질문 3개), Screens 페이지 `에이전트 대화`에 2화면 × 2모드.
완료 조건:
- `node blocks/scripts/check-blocks.mjs` 통과
- `pnpm --filter @terracelab/demo build && (cd apps/demo && node scripts/check.mjs <폴더> --only platform/assistant)` 통과(1440 · 390, axe 0, 가로 넘침 0)
- `figma-audit --check docs/figma/audit/PG-34.json` 통과(프레임 4)
사람 확인: 화면 Artifact

### PG-35 메신저 보강 1 — 목록 · 사람
상태: ◐ 코드 완료 2026-11-10 — SelectableList · AvatarGroup · presence 도우미. 남은 것: VRT 기준 이미지, Figma 세트
의존: PG-00, P2-23의 R-T22 · R-T26 판단
근거: SY-7 · SY-13
산출물: `SelectableList`(R-T22: 방 목록 · 사원 목록 · 지급 달 목록이 같이 쓴다), `AvatarGroup`, presence 어휘 하나로 정리(R-T26).
완료 조건: 컴포넌트 DoD. `groupware/messenger/chat` · `erp/hr-payroll/hr-master` · `erp/hr-payroll/payslip` 블록이 SelectableList를 쓴다(`grep`으로 직접 짠 목록 CSS 0)
사람 확인: 없음

### PG-36 메신저 보강 2 — 대화
상태: ◐ 코드 완료 2026-11-10 — 반응 · 답글 · 입력 중 · 사진, 메신저 블록. 남은 것: VRT 기준 이미지, Figma 세트
의존: PG-35 · PG-33
근거: SY-8
산출물: MessageThread `reactions` · `replyTo` · `typing` · 그림 미리보기, 고정 공지 줄, 대화 검색 동작, Composer 멘션 적용, 메신저 블록 갱신.
완료 조건: 컴포넌트 DoD. 메신저 블록에 동작 없는 단추 0. 데모 검사 통과(`--only groupware/messenger`)
사람 확인: 화면 Artifact

### PG-37 회계 보강
상태: ◐ 코드 완료 2026-11-10 — Checklist · 계좌번호 프리셋 · 채권 연령 · 은행 대사. 은행 형식 표는 사람 확인. 남은 것: VRT 기준 이미지, Figma 세트
의존: PE-07
근거: SY-9 · SY-10
산출물: MaskedInput `bankAccount` 프리셋, `Checklist`(마감 점검 목록), 블록 `erp/accounting/aging`(채권 연령 표)와 `erp/treasury/reconcile`(은행 대사: 두 목록 맞추기).
완료 조건: 컴포넌트 DoD. check-blocks와 데모 검사 통과. 시산표 블록의 직접 만든 소계 행과 점검 목록이 없어진다
사람 확인: 은행 대사 화면 Artifact

### PG-38 재고 보강
상태: ◐ 코드 완료 2026-11-10 — 재고 실사 · 피킹 · 단위 환산. 라벨 종이 크기는 제안만. 남은 것: VRT 기준 이미지, Figma 세트
의존: PG-00
근거: SY-11
산출물: 블록 `scm/inventory/count`(재고 실사)와 `scm/warehouse/picking`(피킹 목록), QuantityInput 환산(`units[].factor`), 창고 위치 고르기 예시(CodeSearch 묶음), Paper 라벨 크기(토큰 PR).
완료 조건: 컴포넌트 DoD. check-blocks와 데모 검사 통과(1440 · 390)
사람 확인: `paper.size.*` 라벨 크기 값 승인

### PG-39 대시보드 보강
상태: ◐ 코드 완료 2026-11-10 — DashboardGrid · PeriodPicker compare · CSV 내보내기. 남은 것: VRT 기준 이미지, Figma 세트
의존: PG-00
근거: SY-12
산출물: `DashboardGrid`(순서 바꾸기 · 숨기기 · 배치 저장, `_ui`의 Grid를 올린다), PeriodPicker `compare`, 내보내기 도우미(CSV)와 블록 25개의 "엑셀 다운로드" 연결.
완료 조건: 컴포넌트 DoD. 동작 없는 "엑셀 다운로드" 단추 0(`grep`)
사람 확인: 없음

### PG-40 차트 보강
상태: ◐ 코드 완료 2026-11-10 — FunnelChart · 누적 3계열 이상 · 예측 구간. 남은 것: VRT 기준 이미지, Figma 세트
의존: PE-08
근거: SY-12
산출물: ComboChart 누적 3계열 이상, `FunnelChart`, TrendChart 예측 구간(실적 뒤 예측 점선과 구간, SY-17). 계열 색이 5개를 넘으면 `color.chart.*` 추가를 제안만 한다.
완료 조건: 컴포넌트 DoD. 표 대체가 있다. dataviz 검증 기록을 notes에 남긴다
사람 확인: 색 제안 승인

### PG-41 범용 기본 부품
상태: ◐ 코드 완료 2026-11-10 — Link · Tag · TagInput · Divider. 남은 것: VRT 기준 이미지, Figma 세트
의존: PG-00, P2-23의 R-T34 · R-T25 판단
근거: SY-13
산출물: `Link`(R-T34) · `Tag` · `TagInput`(사람 칩 포함) · `Divider`.
완료 조건: 컴포넌트 DoD
사람 확인: 없음

### PG-42 일정 부품
상태: ◐ 코드 완료 2026-11-10 — 주 · 일 달력 · TimeField · WorkTimeline. 남은 것: VRT 기준 이미지, Figma 세트
의존: PG-00
근거: SY-14
산출물: MonthCalendar 주 · 일 보기, `TimeField`, `WorkTimeline`(R-T23).
완료 조건: 컴포넌트 DoD. `groupware/calendar/month`와 `groupware/attendance/my` 블록의 직접 그린 시간 Select · 근무 막대가 없어진다
사람 확인: 없음

### PG-43 블록이 직접 그린 것 올리기
상태: ◐ 코드 완료 2026-11-10 — PermissionMatrix · Toolbar · ApprovalLine compact · ApprovalLineEditor. 남은 것: VRT 기준 이미지, Figma 세트
의존: P2-23
근거: SY-15
산출물: `PermissionMatrix` · `Toolbar` · ApprovalLine 점 모양(R-T24) · `ApprovalLineEditor`(R-T25).
완료 조건: 컴포넌트 DoD. 해당 블록의 직접 짠 CSS가 없어진다
사람 확인: 없음

### PG-44 파일 · 오류 · 올리기
상태: ◐ 코드 완료 2026-11-10 — FileViewer · 오류 화면 3 · 엑셀 올리기(CSV). 남은 것: VRT 기준 이미지, Figma 세트
의존: PG-00
근거: SY-16
산출물: `FileViewer`(그림 · PDF), EmptyState `notFound` · `expired`, 블록 `platform/errors/not-found` · `forbidden` · `expired`, 블록 `platform/import/excel`(올리기 → 행 검증 → 반영).
완료 조건: 컴포넌트 DoD. check-blocks와 데모 검사 통과
사람 확인: 없음

### PG-45 지역 지도

상태: ☐ 대기 — 사람 결정 먼저
의존: 경계 데이터 결정
근거: SY-17
목표: 지역별 값을 색 단계로 보이는 지도(시도 · 시군구)를 차트 계열에 더한다. 프랜차이즈 상권 화면이 쓴다.
산출물: `RegionMap`(표 대체 포함), 색은 `color.chart.heat*`.
작업: 외부 네트워크 의존 0 규칙 때문에 경계 데이터를 패키지에 넣어야 한다. 데이터 출처와 라이선스, 용량(시도 17개만 넣을지 시군구까지 넣을지), 번들 예산(P3-14)을 먼저 정한다.
완료 조건: 컴포넌트 DoD. 번들 예산 안
사람 확인: 경계 데이터 출처 · 범위

## GG 체크리스트

**자동**
- [ ] 세 파일의 지역 변수 컬렉션: Foundations 6 · Components 0 · Screens 0(PG-02 · PG-03)
- [ ] Screens의 지역 컴포넌트 0, 본체가 지역인 인스턴스 0(PG-03)
- [ ] `node scripts/figma-diff.mjs <Foundations 스냅샷>` 차이 0(PG-05)
- [ ] Components의 contract 세트 94, 변형 수 = 축 값의 곱, 묶이지 않은 칠 0(PG-06~12)
- [ ] Screens 표 영역의 인스턴스 밖 TEXT 0(PG-13~19)
- [ ] 쇼케이스 프레임의 색 변수 바인딩 100%(PG-20~23)
- [ ] `pnpm --filter preview check` 통과(PG-04)
- [ ] `docs/figma/audit/PG-*.json` 전부 `--check` 통과

**사람(Patrick)**
- [ ] Foundations · Components 게시와 다시 게시
- [ ] 쇼케이스 문구 · 시안 승인(PG-04 · PG-22)
- [ ] mono 글꼴 선택(PG-05)
- [x] 모듈 타일 그림 15종(2026-11-10)
- [ ] 묶음 G의 새 어휘 · 토큰 제안 승인

## 시작 프롬프트(Opus용)

```
Trellis 레포다. CLAUDE.md, docs/plan/README.md, docs/plan/10-figma-showcase-coverage.md를 읽어.
10번 문서 3절 "실행 순서"에서 의존이 끝난 가장 위 작업 하나를 실행해. 4절 공통 규칙을 따라.
"사람" 줄을 만나면 멈추고 무엇을 해 달라는지 한 줄로 말해.
끝나면 완료 조건을 명령 실행 결과로 증명하고 상태 줄을 고친 뒤 커밋해. 토큰 값은 바꾸지 말고 제안만 해.
```
