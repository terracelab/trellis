# 공개 배포 전 — 2026-11-09 →

목표: npm 첫 배포(PF-04) 바로 앞까지. 안전망(스토리 · VRT · 린트 · CI 초록불)을 먼저 깔고, ERP 핵심 컴포넌트 · 블록 범용화 · 영어를 채운다(Patrick, 2026-11-09: "npm 전까지 다 작업해줘").
범위: 웹만. 네이티브(Phase 3) · Figma 동기화는 다음 단계. 공개 저장소 생성 · 푸시 · npm publish는 사람 확인 뒤(PF-04).
결정: D-64(결재 글자 토큰) · D-65(locale) · D-66(공개 기록은 새로 만든다).

---

### PR-01 결재 글자 토큰 · 대비 테스트 초록불
상태: ☑ 완료 2026-11-09 — approval.*.text(D-64), 토큰 테스트 192개 통과, 미리보기 승인 대기 표시 0, pnpm test 14/14
목표: 라이트 결재 4색 대비 실패(P0-05 막힘)를 푼다. `approval.*.text`를 더해 글자만 진하게, 배지 점은 지금 색(Patrick 2026-11-09).
완료 조건: `pnpm --filter @terracelab/trellis-tokens test` 전부 통과. 미리보기 · 문서 · 데모 검사의 "승인 대기 대비"가 0.

### PR-02 TrellisProvider · locale(ko · en)
상태: ☑ 완료 2026-11-09 — 사전 150여 키(ko · en), TrellisProvider(contract · spec · 예시), 컴포넌트 47개 파일 전환, strings · locale 테스트, react 113개 · 문서 · 데모 검사 통과
목표: 컴포넌트 안 문구("달력 열기" · "필터" · "선택 해제" · "닫기" …)를 사전으로 빼고 `TrellisProvider locale`로 고른다. 기본 ko, Provider 없이도 ko로 동작.
완료 조건: 컴포넌트 소스에 한국어 문자열 리터럴 0(검사 스크립트), en 렌더 테스트, 문서 동봉.

### PR-03 Storybook · VRT 인프라(P1-04)
상태: ☑ 완료 2026-11-09 — Storybook 10.6.3(a11y), 생성 스토리 168(예시 111 · Matrix 33 · States 24, 컴포넌트 67 = 파일 67 검사), VRT 268장(Docker playwright v1.64.1 amd64, 두 번째 실행 통과). CI 잡은 PR-05. P1-04의 Foundations 스토리 · ContractProps 문서 블록 · test-runner a11y는 남음
목표: `apps/storybook`에 모든 컴포넌트 스토리(예시 · variant × size 격자 · States), Playwright VRT(Docker 고정 이미지) 라이트 · 다크 × compact · comfortable.
완료 조건: `pnpm storybook` · `pnpm vrt` 통과, 스냅샷 커밋, 컴포넌트 수 = 스토리 파일 수 검사.

### PR-04 린트 플러그인(P1-03 린트 부분)
상태: ☑ 완료 2026-11-09 — `packages/eslint-plugin-trellis` 5규칙(no-raw-color · no-px · no-font-family · no-primitive-token · dependency-direction), 픽스처 테스트 69개 통과, stylelint primitive 색 변수 규칙 추가, 레포 전체 0건(d274fed 기준). headless-boundary · event-naming은 남음
목표: `eslint-plugin-trellis` — raw hex · px · font-family 리터럴, primitive 토큰 직접 참조, 의존 방향(tokens ← icons ← contracts ← react ← apps).
완료 조건: 규칙별 valid/invalid 픽스처, 레포 전체 0건.

### PR-05 CI 게이트 v1(P1-16)
상태: ☑ 완료 2026-11-09 — .github/workflows/ci.yml: verify(금칙어 · build · lint · typecheck · test · 블록 검사) · checks(문서 한 · 영 · 소개 · 데모 · 미리보기) · vrt(Playwright 컨테이너) · changeset. 2d48e11에서 네 잡 모두 초록불(D-68). 처음 돌린 게이트가 리눅스 390 가로 넘침(입력 기본 폭)과 VRT 브라우저 경로를 잡아 고쳤다. 남은 것: 저장소 비밀 값 TRELLIS_FORBIDDEN_WORDS 등록(사람)
목표: lint · typecheck · test · build · 문서 · 소개 · 데모 검사 · VRT · 금칙어를 PR마다. main이 초록불.
완료 조건: GitHub Actions 초록불 한 번.

### PR-06 DataGrid 업무 기능
상태: ☑ 완료 2026-11-09 — model.ts(필터 → 정렬 → 트리 · 묶음 → 화면 줄) · EditCell · HeaderFilter · ColumnsMenu · VirtualRows(@tanstack/react-virtual 3.14.21). 예시 5개(Editable · FiltersAndColumns · Grouped · Tree · ThousandRows), test/datagrid.test.tsx 16개, react 테스트 129 · lint · typecheck · build · 데모 검사(59화면 × 2폭 × 2테마, axe 0) 통과. 영어 spec은 PR-12 병합 때 맞췄다
목표: 가상 스크롤(1000행) · 칸 편집(Enter 저장 · Esc 취소) · 열 필터 · 열 설정(숨김 · 순서 · 저장 키) · 그룹 소계 행 · 트리 행.
완료 조건: contract · spec · 예시 · 테스트, 데모 검사 통과.

### PR-07 LineItemsEditor(편집형 품목 표)
상태: ☑ 완료 2026-11-09 — contract · spec(한 · 영) · 구현 · 예시 2(PurchaseLines · JournalLines) · test/lineitems.test.tsx 6 · VRT 4장. 전표(journal) · 세금계산서(invoice-issue) · 발주(po-form) · 견적(quotes/editor) 4블록이 컴포넌트를 쓰고 블록 안 줄 표 CSS · Enter 이동 코드를 지웠다. 데모 검사 59화면 × 2폭 × 2테마 axe 0
목표: 전표 · 세금계산서 · 발주 · 견적 4곳의 블록 안 임시 구현을 컴포넌트로. Enter로 다음 칸, 행 추가 · 삭제, 합계.
완료 조건: 4블록이 컴포넌트를 쓴다, 데모 검사 통과.

### PR-08 블록에서 나온 컴포넌트
상태: ☑ 완료 2026-11-09 — 10종(MonthCalendar · KanbanBoard(+KanbanCard) · FolderTree · MessageThread · Composer · ContextMenu · Popover · SelectableCard · CheckboxGroup(서비스 요청 R-27 API) · AddressInput), 각각 contract · spec(한 · 영) · 구현 · 예시 · 테스트 · VRT. 블록: 일정 · 영업기회 · 문서함 · 메일 · 메신저 · 상담 · 채널 · 작업지시 · 입고 · BOM · 상품 등록 · 쿠폰 · 부가세 · 주문 상세(배송지 수정). 컴포넌트 79개, 데모 검사 · check:i18n 79/79 통과(D-75)
목표: SelectableCard · CheckboxGroup · Popover · ContextMenu · AddressInput · MonthCalendar · KanbanBoard · FolderTree · MessageThread · Composer(PF-15 · PE-05).
완료 조건: 후보마다 contract · spec · 구현 · 예시 · 테스트, 쓰던 블록이 컴포넌트로 바뀐다.

### PR-09 폼 어댑터
상태: ☑ 완료 2026-11-09 — @terracelab/trellis-react/form(useTrellisForm: field · bind · bindChecked · submit · summary, schemaResolver), ErrorSummary(contract · spec · 구현 · 예시). react-hook-form 7.91.0 선택 peer, zod 4.6.7은 테스트만. test/form.test.tsx 5개, 가이드 docs/guides/forms.md
목표: `useTrellisForm`(react-hook-form · zod 선택) + ErrorSummary. Field 오류 연결 자동.
완료 조건: `@terracelab/trellis-react/form` 엔트리, 예시 · 테스트.

### PR-10 Menu · CodeSearch 좁은 화면 시트
상태: ☑ 완료 2026-11-09 — Menu(같은 트리거 → 시트, title prop · 트리거 이름) · CodeSearch(칸 = 시트 여는 단추, 찾기 칸 + 목록, 지우기 40). 390 시트 라이트 · 다크 axe 0(데모 po-list 상세 Drawer 위 Menu 시트 · po-form 거래처 CodeSearch 시트, 포커스 시트 안), 테스트 3개(test/mobile.test.tsx). 다크 elevated 위 코드 글자 대비 실패를 찾아 코드 · 설명 · 보조 정보를 fg.secondary로
목표: D-60 시트 문법을 Menu(행 더 보기) · CodeSearch(검색해서 고르기)에도.
완료 조건: 390 시트 axe 0, 테스트.

### PR-11 블록 범용화
상태: ☑ 완료 2026-11-09 — _data/profile.ts(회사 하나 = 파일 하나: 시각 · 근무 · 콜드체인 · 출고 · 결재선 · 담당자), 산업 문구 · 기본 레코드를 데이터에서, 타입을 string + 데이터 목록으로 넓힘, 화면 링크 능력(PlatformProvider screens · useScreens), check-blocks 샘플 고유명사 검사(176개 0곳), trellis-demos 피드백 버그(재고 부족 계산 · 면세 계산서 · 매입 미수 aging 등). trellis-demos는 dasom 4파일이 넓힌 타입 때문에 다시 복사해야 한다(PR-14)
목표: 블록 코드의 업종 문구 · 값을 샘플 데이터로 빼고, 샘플 타입을 업종 값에서 풀고, 없는 화면으로는 링크하지 않는다(trellis-demos 피드백).
완료 조건: 블록 코드에 업종 고유명사 0(검사), 데모 · trellis-demos 검사 통과.

### PR-12 문서 사이트 영어판
상태: ☑ 완료 2026-11-09 — Starlight en 로케일(/en/…, 한국어 84 · 영어 85쪽), spec.en.md 68개(형식 distribution.md §3.2), 영어 가이드 13개 · README.en.md, check:i18n --strict 68/68 · 13/13 · 토큰 117/117. 사이트 검사 두 언어 × 라이트 · 다크 axe 0, 내부 링크 176 깨짐 0. 병합 때 DataGrid · Menu · CodeSearch · ErrorSummary · forms 영어판을 맞추고, 번역하며 찾은 원문 모순(Banner 띠 · DataGrid 예시 · DateField 달력 언어 · SegmentedControl 칸 수)과 TrellisProvider 예시가 페이지 lang을 바꾸던 문제를 고쳤다
목표: Starlight locale `en` — 시작하기 · 가이드 · 토큰 · 컴포넌트 전 페이지 영어, 영어 README.
완료 조건: `/en/` 전 페이지 빌드 · 검사(axe · 링크) 통과.

### PR-13 공개 저장소용 새 기록
상태: ☑ 완료 2026-11-09 — scripts/make-public-snapshot.mjs(git archive → 금칙어 검사 → .publicignore 제외 → 커밋 하나, 원격 없음). d274fed 기준 파일 882 · 금칙어 0(비공개 기록 73곳), 새 기록에서 install · build 11/11 · test 14/14 통과. 남은 것: .publicignore에 무엇을 뺄지(PF-02), 공개 저장소 생성 · 푸시(PF-04). 2026-11-13 추가(D-153): `--onto <주소>`로 공개 저장소 위에 커밋 하나를 얹고, 작성자 · 커밋한 사람은 공개용 계정으로 적는다. 2f3e2ca 기준 파일 2775 · 금칙어 0 · LICENSE 유지, 푸시 전
목표: 비공개 저장소는 그대로 두고, 금칙어 없는 새 기록(한 커밋)을 로컬에 만든다. 푸시는 npm 때(PF-04).
완료 조건: 만든 기록 전체에서 금칙어 0, 빌드 · 테스트 통과.

### PR-14 따라가기 · 검토
상태: ☑ 완료 2026-11-09 — trellis-demos 하위 모듈 adca858, 회사 profile.ts · 새 블록 export 채움(08d2a4a · 4c3f7d6, 로컬 커밋), check 3곳 53화면 문제 0. 데모가 찾은 것 중 버그 2건(기안 기본 결재선 · 근태 신청 중 0일)은 고치고, 데이터 모양 제안 5건 · 부가세 샘플 확인 1건은 backlog로. 서비스는 그쪽 세션이 5442aba로 올려 임시 구현을 걷어 내고, R-33 · R-34는 1cd1cb7로 돌려줌. 검토 페이지는 라운드 끝 보고에 링크
목표: trellis-demos · 서비스를 올리고 검토 페이지로 보인다.

## 서비스 등록 화면 요청(2026-11-09, TRELLIS_REQUESTS R-24 ~ R-32)

서비스(테라스랩 법인 백오피스) 등록 화면에서 막힌 것들이다. 들어오면 서비스가 앱 임시 구현을 걷어 낸다(PR-14에서 갱신).

### PR-15 LineItemsEditor 서비스 요구(R-24)
상태: ☑ 완료 2026-11-09 — cellError · required · totals · footnote · empty · mobile title · 상자 폭 줄 모양, 칸 이름 "{표 이름} {행} {열}", 줄 칸 Select 예외 문서(RadioGroup · Select spec · 스킬 do-dont), 예시 4개 더(세금계산서 품목 · 비목 예산 · 참여 인력 · 빈 상태), 테스트 10, 블록 4곳 title 열 · invoice-issue 합계를 totals로(D-69)
목표: PR-07 위에 칸 오류(cellError → 칸 아래 글자 + aria-invalid), required 머리 표시, totals · footnote 묶음, empty(minLines 0), 칸 이름 "{표 이름} {n} {열}", 폭 단계(표 · 머리 없는 줄 · 카드, 칸 위 작은 머리 글자), 행 칸 안 고르기는 Select(RadioGroup 규칙 예외) 문서화.
완료 조건: 컴포넌트 작업 공통 DoD, 블록 4곳 그대로 통과, 예시(세금계산서 품목 · 비목 예산 오류 · 참여 인력 · 빈 상태).

### PR-16 CodeSearch 새로 등록 · 자유 입력 · 코드 숨김(R-25)
상태: ☑ 완료 2026-11-09 — onCreate · createLabel · allowCustomValue · onCustomValue · showCode, 넓은 화면(목록 마지막 option) · 시트(목록 아래 단추) 둘 다. 시트 테스트 3개(test/mobile.test.tsx), 넓은 화면은 Storybook 빌드에서 Playwright로 새로 등록 · 고르기 · 자유 입력 유지 · 지우기 확인. 예시 CreateNew · FreeText(D-70)
목표: onCreate · createLabel · allowCustomValue · onCustomValue · showCode. 좁은 화면 시트(PR-10)에도 같은 줄.
완료 조건: 컴포넌트 작업 공통 DoD, Enter · 클릭 · 인자 테스트.

### PR-17 MaskedInput rrn · secret, formatRrn · isValidBizNo(R-26)
상태: ☑ 완료 2026-11-09 — rrn 프리셋(외국인등록번호 같은 형식), secret(뒷자리 첫 숫자만 · 방금 친 글자 1초 · 보기 단추 aria-pressed), bizNo validate(선택), contracts formatRrn · isValidBizNo(_shared/validate.ts), 커서 기준 편집(edit.ts), Field 오류 자리 내부 통로 useFieldMessage(D-72). 남은 확인: 가림 글자 ●가 Pretendard에서 숫자보다 굵다(• 로 바꾸면 상수 하나)
목표: rrn 프리셋, 뒷자리 가림(secret), contracts 서식 · 검증 함수.
완료 조건: 컴포넌트 작업 공통 DoD, 함수 테스트.

### PR-18 FormSection 접기(R-28)
상태: ☑ 완료 2026-11-09 — collapsible · open · defaultOpen · onOpenChange, 접힌 제목 옆 "입력 N개", 오류가 생기면 펼침, inert, 높이 전환(reduced-motion 없음). fieldset 이름이 비어 있던 것을 aria-labelledby로 고쳤다. 테스트 4, 예시 OptionalCollapsed(D-71)
목표: collapsible · defaultOpen · open/onOpenChange, 안에 오류가 있으면 펼침, reduced-motion.
완료 조건: 컴포넌트 작업 공통 DoD, 키보드 · 오류 시 펼침 테스트.

### PR-19 Toast가 아래 시트 · 고정 ActionBar · 탭바를 가리지 않게(R-29)
상태: ☑ 완료 2026-11-09 — _internal/bottom-inset.ts(차지한 높이 → --tl-toast-offset-bottom), Drawer(아래 · 휴대폰) footer · Sheet footer · AppShell 탭바 · sticky ActionBar가 등록. 데모 발주서 작성에서 1440 · 390 모두 토스트가 동작 줄 · 탭바 위(브라우저 확인), 테스트 4, 예시 AboveBottomActions(D-76)
목표: 열린 아래 시트 · 탭바 · sticky ActionBar 높이만큼 토스트를 올린다(--tl-toast-offset-bottom). 층 순서는 D-63 그대로.
완료 조건: 컴포넌트 작업 공통 DoD, 예시(시트 + 토스트 · 탭바 + 토스트).

### PR-20 Select 선택지 앞 표시 · note(R-30)
상태: ☑ 완료 2026-11-09 — SelectOption leading(dot = SelectMarkTone: 차트 11색 · info · neutral · 결재 5 · icon), note, 닫힌 칸 · MultiSelect · 시트 같은 모양(D-73)
목표: SelectOption leading(dot = 토큰 이름 · icon), note. MultiSelect · 좁은 화면 시트 같은 모양, 닫힌 칸에도 앞 표시.
완료 조건: 컴포넌트 작업 공통 DoD.

### PR-21 DateField min · max 밖 입력 안내(R-31)
상태: ☑ 완료 2026-11-09 — 범위 밖 글자는 onChange 없이 invalid + "{min} 이후 날짜를 넣으세요" · "{max}까지 넣을 수 있습니다", outOfRangeText, Field error 우선, 바른 날 · 지움 · 달력 고르기 · 바깥 value 변경에서 지움(D-74). PeriodPicker는 min · max가 없어 해당 없음
목표: 범위 밖 글자 입력은 값을 바꾸지 않고 invalid + 안내 문구(outOfRangeText), Field error가 우선.
완료 조건: 컴포넌트 작업 공통 DoD, 글자 입력 · blur 테스트.

### PR-22 Paper(A4 종이 서식) · 종이 토큰 · 인쇄(R-32)
상태: ◐ 진행 — 구현 완료 2026-11-09, 토큰 값 승인 대기(D-77). 종이 토큰(paper.bg · fg · muted · line · lineStrong · fill · shadow · size a4 · a5 · margin sm · md, 테마와 무관, CSS · TS · native · Figma · Tailwind), Paper(size · orientation · margin · density) · 서식 조각(PaperTitle · Fields · MoneyTable · Text · Signature · SignPair · Seal) · PaperPreview · printPapers · usePrintPapers, 테스트 17, VRT, 세금계산서 발행 블록 미리 보기 · 인쇄. 넘김: paper.fg 순검정 vs neutral.950, paper.fill neutral.100 vs 50, 여백 12 · 18mm 승인
목표: 종이 토큰(값은 가안, 사람 승인), Paper · PaperPreview · 인쇄 도우미, 서식 조각. 테마와 무관한 흰 종이.
완료 조건: 컴포넌트 작업 공통 DoD, 토큰 값 승인 전까지 가안 표시.

CheckboxGroup(R-27)은 PR-08에서 만들었다(서비스 API 그대로 + selectAll true · maxVisible).

### PR-23 LineItemsEditor 후속(R-34)
상태: ☑ 완료 2026-11-09 — Enter 칸 선택자가 tabindex=-1 · aria-hidden · 숨은 요소를 빼고(QuantityInput · CodeSearch · Select 칸), 읽기 칸 column.tone(앞 아이콘 + 숨은 상태 글자), addIcon. 빈 상태는 PR-15에서 이미. 테스트 2(D-79)

### PR-24 접근성 묶음(R-33)
상태: ◐ 진행 — 2026-11-09 Card headingLevel · landmark, Dialog · Drawer · 시트 Tab 순환(keydown) + aria-modal(빠른 Tab에서 새던 것을 브라우저로 재현 · 확인), Checkbox 누르는 자리 24, data-motion="reduce" 토큰 모드(D-78). 남은 것(토큰 값 승인 필요): 글자 크기 모드 data-text-size lg · xl, 고대비 모드, 상태 글자 색 status.*.fg, Radio 누르는 자리 점검

### PR-25 서비스 반영 후속(R-35)
상태: ◐ 진행 — 구현 완료 2026-11-09, 종이 글자 토큰 값 승인 대기(D-80). CodeSearch 넓은 화면 목록이 열려도 바깥 aria-hidden을 걷음(axe aria-hidden-focus 0, Storybook 4개 스토리에서 확인) · 자유 입력 글자 지우기 단추 · 시트 모드 data-filled로 FormSection 세기(D-83). DateField onOutOfRangeChange · setCustomValidity · form.bindDate(D-81). LineItemsEditor 줄 위 정렬(오류 줄에서 입력이 20px 어긋나던 것) · 0줄이면 합계 숨김, CheckboxGroup meta · pending · onChange 두 번째 인자(D-82). Paper paper.type.*(pt, 지금 px와 같은 값) · onOverflowChange · 미리보기 1장 끝 선 · paginateMoneyRows + carryIn · carryOut · printPapers onOpen · onClose(D-80). 빈 값 기호는 '–'(en dash)로 이미 통일
목표: 서비스가 1cd1cb7을 반영하며 남긴 R-35(CodeSearch 3 · DateField 1 · LineItemsEditor 2 · Paper 4 · CheckboxGroup 2).
완료 조건: 컴포넌트 작업 공통 DoD, 종이 글자 토큰은 가안 표시.

### PR-26 완성도 점검 24항목(서비스와 식자재 ERP 비교)
상태: ☑ 완료 2026-11-09 — lint · typecheck(20) · test(react 346 · tokens 215) 통과, 데모 59화면 × 2폭 × 2테마 · 문서 · 미리보기 · 소개 사이트 axe 0, 블록 57 통과, VRT 324장 통과(바뀐 기준 36 + 새 4). 서비스 pnpm check 통과, 344 ~ 1440 가로 넘침 0. 검사 중 잡은 것: 다크 brand 600에서 브랜드색 글자(미리보기 로고 · 문서 사이드바 지금 쪽)가 3:1 아래 → fg.link · fg.inverse로
목표: Patrick 2026-11-09 "직관성 · 트랜지션 · 가독성 보완, 다 수정해줘(토큰 수정해도 된다)". 점검 페이지(Claude 아티팩트 "Trellis 완성도 점검")의 24항목을 한 번에. 한 세션 한 작업 규칙의 예외(사람이 한꺼번에 요청).
산출물: 토큰(bg.nav · border.selected · 움직임 의미 이름 · row.heightTall · fg · 다크 brand · divider, D-84 · D-85 · D-86 · D-89), AppShell scope · user · busy(D-84), SideNav(D-90), DataGrid 행동 칸 · 세로선 · 머리 단위 · 결과 열 · 링크 열 · DataGridLines(D-86), FilterBar grid(D-87), CommandPalette(D-88), PageHeader 행동 lg(D-90), hover 전환 28곳 + stylelint 규칙 2개 · reduce 중복 27곳 삭제 · 화면 진입 · 차트 첫 그리기(D-85), 데모 검사 열 높이 경고(D-90). 서비스 반영: 상단바 법인 · 사용자 · 진행 줄, 할 일 건수, 홈 오른쪽 열, 새로고침 라벨, 검색 · 이동 → CommandPalette, 두 줄 칸 높이, 급여 단위 · 실지급 강조.
완료 조건: `pnpm lint && pnpm typecheck && pnpm test`, 토큰 대비 테스트(nav · selected 쌍 포함), 데모 검사(59화면 × 2폭 × 2테마 axe 0), 블록 검사, `pnpm vrt` 통과.
사람 확인: 토큰 값(사이드바 neutral.100 · 다크 brand 600 · 글자 700/600)은 승인됨. 화면 모양은 점검 페이지의 이후 캡처로 확인

### PR-27 브랜드 짙은 사이드바 · 차분한 HR 결 · 스켈레톤 · HR 컴포넌트 9종
상태: ☑ 완료 2026-11-09 — lint · typecheck(20) · test(react 383 · tokens 238) 통과, VRT 360장(새 36 · 바뀐 30), 데모 62화면 × 2폭 × 2테마 axe 0, 문서 216쪽 × 2테마 axe 0 · 링크 깨짐 0, 미리보기 · 소개 사이트 axe 0, 블록 60 통과. 서비스 pnpm check 통과, 390 · 1024 · 1440 가로 넘침 0
목표: Patrick 2026-11-09 "스켈레톤도 안 되어 있고 사이드바 배경이 어색하다, 브랜드 색에 맞게 대비되게. 국내 HR SaaS 대시보드와 비슷한 결로 전면 수정(토큰 수정 허락), 인사 관리 컴포넌트와 한국형 HR 마스터도". 한 세션 한 작업 규칙의 예외(사람이 한꺼번에 요청).
산출물: 토큰 bg.nav · nav.* · avatar.* · 흰 canvas · sunken · 굵은 제목(D-91 · D-92), AppShell 화면 높이 사이드바 · SideNav nav 토큰 · 테마 생성기 동기화(D-91), PageHeader siblings · Tabs · FilterBar 칩 · Avatar 모양 · 색(D-92), Skeleton 묶음 모양 · 지연(D-93), PersonLabel · ProfileHeader · OrgChart · HrRecord(D-94), TimeClock · WorkHoursMeter · LeaveBalance · TeamSchedule · Payslip(D-95), manifest 압축(D-96), 블록(인사 마스터 · 조직도 · 임금명세서 새로, 직원 · 내 근태 · 팀 근태 갱신). 서비스 반영: 남색 틀 · 로딩 모양 46곳 · 첫 진입 틀 스켈레톤 · 제목 줄 탭(묶음 2~4개) · 직원 이름 칸 · 연차 현황 · 팀 일정표 · 임금명세서.
완료 조건: `pnpm lint && pnpm typecheck && pnpm test`, 토큰 대비 테스트(nav · avatar 쌍), 데모 검사(전 화면 × 2폭 × 2테마 axe 0), 블록 검사, `pnpm vrt` 통과, 서비스 `pnpm check`.
사람 확인: 토큰 값(사이드바 brand.950 · 흰 canvas · 아바타 6색 · 제목 700)은 이번 요청으로 승인됨. 화면 모양은 점검 페이지의 캡처로 확인

## 식자재 ERP 토큰 · 컴포넌트 품질 이식(Patrick 2026-11-10)

식자재 ERP 리뉴얼 디자인 시스템의 토큰 값과 컴포넌트 품질을 Trellis로 옮긴다. 회사마다 메인 색 하나만 넣으면 모든 컴포넌트가 그 색에 맞게 바뀌는 구조로 만든다. 범위: 디자인 토큰 · 테마 엔진 · 컴포넌트. 블록 · 데모 · 네이티브 · Django는 깨지지 않는지만 본다. 사람이 한꺼번에 요청한 작업이라 한 세션 한 작업 규칙의 예외다(PR-26과 같은 방식). 문맥이 모자라 끊기면 다음 세션은 남은 PR부터 잇는다.
사람 승인(Patrick, 2026-11-10): 이 범위에서는 "토큰 값은 에이전트가 제안만" 대신 원본 값과 테마 계산 규칙을 승인, 이 작업의 `pnpm vrt:update`도 승인. 그대로 이기는 것: 텍스트 대비 4.5:1(큰 글자 · UI 경계 3:1), 금융색, 결재 5상태, 상태 어휘 7개, 토큰 밖 값 금지, semantic만 참조, 이름 lock(추가만). 결정: D-97 · D-98 · D-99.

### PR-28 토큰 이식
상태: ☑ 완료 2026-11-10 — 대응표(semantic 69개: (a) 47 · (b) 5 · (c) 17 + primitive · 크기 · 글자 · 접근성 모드), 토큰 테스트 429(대비 라이트 · 다크 · 고대비 2 · 기본 테마 = 엔진 · 이름 lock 82개 추가 0개 삭제), pnpm build 11/11 · lint 22/22 · typecheck 20/20 · test 16/16(react 389 · tokens 429). 확인 질문 4개 전부 추천안(2026-11-10)
목표: 식자재 ERP 원본의 색 · 크기 · 레이아웃 · 글자 · 접근성 모드를 Trellis 토큰으로 옮긴다. 회사 색을 따라가는 토큰과 고정 토큰을 나눈다.
산출물: 대응표 `docs/plan/notes/token-port-2026-11.md`, primitive(blue · graphite · neutral 앵커 · shell · cvd · alpha), semantic(라이트 · 다크 · 고대비 2 · 색각 친화 2), density(xs · xl · 36/40), typography(600 · h4 · micro · mono), space · shadow · size.touch · layout 와이드 · border 3, 글자 크기 112 · 125, `docs/spec/tokens.md` §1 · §2 · §3 · §7, NAMES.lock(추가만).
완료 조건: `pnpm --filter @terracelab/trellis-tokens test`(대비 4모드 · 기본 테마 = 엔진 · 이름 lock), `pnpm build · lint · typecheck · test`.
사람 확인: 대비로 바꾼 쌍 · (c) · 고정 토큰 값 · 경고 기준 — 2026-11-10 확인(전부 추천안).

### PR-29 회사 테마 엔진
상태: ☑ 완료 2026-11-10 — 검증 색 10 × 회색 톤 3 × 버튼 규칙 2 · 극단 20 × 회색 톤 3 · 컬러칩 9에서 대비 못 넘는 쌍 0(4모드 156개 검사), 겹침 경고는 주황 · 파랑 · 초록 · 빨강 · 노랑에서만(기준 ΔEOK 9), 기본 테마 = createTheme('#FE5C2B') 테스트, Chromium 180개 입력 Node와 같음(WebKit · Firefox는 이 Playwright 버전용 미설치), Provider 런타임 · 범위 지정 테스트 5, 가이드 한 · 영, 미리보기 https://claude.ai/artifact/XNitUu75AFRcjgm7PfPJSh
의존: PR-28
목표: 회사 메인 색 하나(+ 회색 톤 · 주 버튼 글자 규칙)로 회사 색 토큰 21개 × 라이트 · 다크 · 고대비 라이트 · 고대비 다크를 계산한다. 기본 테마 = createTheme('#fe5c2b').
산출물: `packages/tokens/theme`(OKLCH 스케일 · 역할별 대비 선택 · 이유 · 겹침 경고 · 범위 지정 CSS), `scripts/gen-default-theme.mjs`(gen:theme), `gen-theme`(4모드 · --button-text), `TrellisProvider theme={{ brand }}` · `scope`, `test/theme.test.ts` · `test/default-theme.test.ts` · react `company-theme.test.tsx`, 브라우저 대조 검사, `docs/guides/theme.md`.
완료 조건: 검증 색 10개 + 테스트 20색 × 회색 톤 3 + 컬러칩 대비 못 넘는 쌍 0, 겹침 경고가 정한 색에서만, 기본 테마 = 엔진 테스트, Node = 브라우저.
사람 확인: 없음(규칙 승인됨)

### PR-30 컴포넌트 품질 맞추기
상태: ☑ 완료 2026-11-10 — 대조표 42항목 전부(새 컴포넌트 6: Delta · AmountBreakdown · ChangeDiff · IssueList · ReasonDialog · MaskedValue, D-100). pnpm build 11/11 · lint 22/22 · typecheck 20/20 · test 16/16(react 521 · tokens 429 · contracts 40), Storybook axe 323스토리 × 라이트 · 다크(+ 대표 14 × 파랑 · 노랑) 760회 위반 0, `pnpm vrt:update` → `pnpm vrt` 440 통과(기존 360 중 335 바뀜, 회사 색 변형 56 · 새 컴포넌트 24 새로), i18n strict 96/96 · 토큰 234/234, `pnpm build:docs`(컴포넌트 96 · 예시 246), 데모 62화면 × 2폭 × 2테마 axe 0(390 가로 넘침 2건을 잡아 고침: 좁은 FilterBar · BulletBar 비율 열), 블록 60 통과, 서비스 하위 모듈 1efac26 + `pnpm check` 통과(서비스는 커밋하지 않음), 테마 Node = Chromium 180입력. 미리보기 https://claude.ai/artifact/XNitUu75AFRcjgm7PfPJSh
의존: PR-28, PR-29
목표: 식자재 ERP 컴포넌트 28모듈 + 업무 조각과 대조해 "식자재 ERP이 낫다"를 전부 고친다. 회사 색을 바꿔도 깨지지 않는지 본다.
산출물: 대조표 `docs/plan/notes/component-parity-2026-11.md`, contract · spec → 구현 · 스토리 · VRT, Storybook 테마 전환 툴바(주황 · 파랑 · 노랑 · 거의 검정), VRT(기본 주황 전체 + 파랑 · 노랑 대표 14).
완료 조건: 컴포넌트 작업 공통 DoD, primitive · 원색 참조 0(린트), Storybook a11y 0, `pnpm vrt:update` → `pnpm vrt`, `pnpm build:docs`, 데모 검사(전 화면 × 2폭 × 2테마 axe 0), `node blocks/scripts/check-blocks.mjs`, 서비스 하위 모듈 `pnpm check`.
사람 확인: 화면 모양은 미리보기 아티팩트로

### PR-31 Figma 변수 · 컴포넌트 갱신
상태: ⛔ 대체 — 2026-11-10 P2-15 · P2-16 · P2-20(Figma 새 파일 셋, G2 전 초안)이 대신한다(D-103). 넘김 세 가지는 이렇게 정했다. (1) 고대비는 Semantic 컬렉션의 모드(HC Light · HC Dark, 86e320c `variables.json`), 색각 친화는 모드로 두지 않았다(Primitives에 `color/cvd/*` 12색만 있다). (2) Company 컬렉션을 둔다(회사 색 프리셋 8모드 × 84변수). (3) 새 컴포넌트 · 크기 xs · xl은 Components 초안 범위(P2-16)
의존: PR-28, PR-29, PR-30
목표: Figma 파일의 변수 · 컴포넌트를 PR-28~30 토큰과 맞춘다.
넘김: Figma 파일(`docs/guides/figma.md`)에 쓰려면 Patrick 계정의 Figma 세션이 필요하다. 결정할 것: (1) 고대비 · 색각 친화를 Semantic 컬렉션의 모드(Light HC · Dark HC · CVD)로 둘지, 별도 컬렉션으로 둘지 — 추천: 모드(코드의 data-* 모드와 같은 구조) (2) 회사 색 토큰 21개를 Figma에서 바꿔 볼 "Brand" 컬렉션(모드 = 컬러칩)을 둘지 — 추천: 둔다(주황 · 파랑 · 노랑 · 거의 검정 4모드, 값은 `createTheme` 결과) (3) 새 컴포넌트 6개 · 크기 xs · xl 변형을 Figma 컴포넌트에 더할 시점 — 추천: G2 승인 뒤 P2-15와 함께. 산출물 `dist/figma/variables.json`은 이미 새 토큰을 담고 있다(Light · Dark).

## 서비스 요청 R-37 ~ R-43(서비스 전수 점검 · 서비스, 2026-11-11)

원문은 서비스 쪽 `docs/TRELLIS_REQUESTS.md` R-37 ~ R-43이다(R-36은 R-37 3번에 합쳤다). 토큰 **값**(색 · 크기)은 제안까지만 하고 Patrick이 승인한다. 결정 번호는 묶음마다 미리 나눴다: 틀 · 내비 D-130~134, 표 · 달력 D-135~139, 면 · 머리 D-140~144, 색 제안 D-145~149.

### PR-32 컴포넌트 전수 점검(R-37)
상태: ◐ 진행
표 · 달력 가지(2026-11-11): 4 DataGrid sticky 'end' · 여러 고정 열 자리 · 가로 넘침 안쪽 그림자(data-overflow-start · end) · 잘린 칸 title(D-136), 5 FilterBar 초기화는 md 그대로(PR-30부터 줄이 md, D-135), 8 MonthCalendar colors · icon · state · 잘린 칩 title(D-137), 9 TeamSchedule 날짜 머리 숨은 글자(D-135). 남은 것: 다크 그림자 단서(shadow 토큰 다크 값 · shadow.edge 제안, 승인 필요)
면 · 머리 가지(2026-11-11): 6 형제 가리킴 밑줄 · Siblings VRT(1280 + 390) · 7 NotificationItem · NotificationList · formatRelativeTime · relativeDayGroup · 10 Drawer 첫 초점 = 제목(data-autofocus 예외) · StatusDot 한 크기 지침(D-141 · D-144). 1 · 2 · 3 · 4 · 5 · 8 · 9는 다른 가지
- 1 · 3번(틀 가지) 구현 끝 2026-11-11(D-132 · D-133): tokens.css 테마마다 color-scheme, `_internal/scrollbar.css`(border.strong thin, 펼친 사이드바 nav.hover → nav.fgMuted · gutter stable), Icon `data-size` + `size.icon.*`(기본 값 VRT 차이 0), IconButton 배지 = caption 글자 + space.4, 바 높이 max(globalBar 48, control md), 휴대폰 탭 최소 56. VRT 524 중 바뀐 것은 DataGrid invoices 다크 4장뿐(행 고르기 네이티브 체크박스가 color-scheme dark로 어두워짐, 의도). 남은 것: Trellis 글자 크기 모드(data-font-scale)가 아이콘 · 컨트롤을 키울지 토큰 값 결정(제안만), 네이티브 Icon은 1.0 뒤
의존: 없음
목표: 서비스 화면 39개 점검에서 나온 컴포넌트 · 토큰 보강 10항목. 6번(PageHeader siblings 구분)은 d95bc37에서 했고 가리킴 밑줄 · Siblings VRT가 남았다.
작업: 1 color-scheme · 스크롤바 문법(틀) · 2 SideNav 가리킴 · 선택 대비(값 제안, PR-33 묶음) · 3 Icon 크기 토큰 · IconButton 개수 배지 · 상단 바 높이(틀) · 4 DataGrid 넘침 그림자 · 오른쪽 고정 · 잘린 칸 툴팁(표) · 5 FilterBar 초기화 sm(표) · 6 siblings 남은 것 · 7 NotificationItem · NotificationList · formatRelativeTime(면) · 8 MonthCalendar 점 여러 개 · 아이콘 · 상태 · 잘린 제목(표) · 9 TeamSchedule 날짜 머리 sr-only(표) · 10 Drawer 첫 초점 · StatusDot 크기 지침(면)
완료 조건: 컴포넌트 작업 공통 DoD + `pnpm lint · typecheck · test · build`. 기본 값에서 바뀌면 안 되는 것(3번)은 VRT 차이 0.
2번 제안 2026-11-11(D-147, 승인 대기): 후보 3개(N1 밝은 중립 선택 면 · N2 회사 색 면 · N3 반전 면)를 데모 실제 틀에 입혀 라이트 · 다크로 비교, 추천 N1 + 초점 링 brand.400 + 넘침 흐림. 측정 표 `notes/color-proposals-2026-11-11.md` §3. SideNav 코드는 고치지 않았다.

### PR-33 범주 식별색 토큰 · CategoryTag(R-38, R-01 · R-06)
상태: ◐ 진행 — 구현 완료 2026-11-11(색 가지), 토큰 값 승인 대기(D-145). `color.category.1~6`(+ subtle) · 새 primitive `color.magenta` · `alpha.magenta.16`, 대비 · 색차 테스트(점 3:1 × 바탕 3, pill 글자 4.5:1, 전체 쌍 정상 ≥ 10 · 색각 3종 ≥ 7), CategoryTag(contract · spec 한 · 영 · react · 스토리 Slots · InTable · CardHead · Matrix variant × slot × size · 테스트 6 · VRT 4 · Storybook axe 0). SideNav group · MonthCalendar color가 같은 슬롯을 받게 하는 것은 대응표(spec)까지 — 두 컴포넌트를 고치는 가지(PR-32 · PR-37)가 합쳐진 뒤
의존: 없음
목표: 상태색과 섞지 않는 범주 식별색 6슬롯과 점 태그. SideNav group · ChartColor · MonthCalendar color 대응표.
완료 조건: 컴포넌트 작업 공통 DoD. 토큰 값은 Patrick 승인 뒤 머지(그 전까지 가지에 둔다).

### PR-34 Avatar · PersonLabel 공석(R-39)
상태: ☑ 완료 2026-11-11 — Avatar · PersonLabel vacant(점선 border.strong + user 아이콘, "담당자 없음", vacantLabel · action, 같은 높이), 테스트 3, VRT Vacant 스토리 2(D-144)
의존: 없음
목표: 담당자 공석을 점선 원 + "담당자 없음" 글자 + 선택 단추로, 사람 있는 줄과 같은 높이로 보인다.
완료 조건: 컴포넌트 작업 공통 DoD.

### PR-35 기한 띠(R-40)
상태: ☑ 완료 2026-11-11 — 제안 B 새 DeadlineStrip(D-138): 날짜순 ol · 같은 날 숫자 묶음(띠 아래 목록) · 지남 n · 오늘 중립색 선 + 글자 · 로빙 ← → Home End · 640 미만 세로 목록. 344 · 390 · 720 · 1024 · 1440 가로 넘침 0, Storybook axe 위반 0, 테스트 5, VRT 새 4장. 점 색은 ChartColor(R-38 범주 슬롯은 그 가지가 들어온 뒤)
의존: 없음
목표: 기준일부터 N일의 기한을 가로 날짜 축에 점으로(폰은 세로 목록), 오늘 표시 · 지난 기한 · 같은 날 묶음.
완료 조건: 컴포넌트 작업 공통 DoD.

### PR-36 AppShell 옆 칸 폭 · 떠 있는 패널 · AgentReplay(R-41)
상태: ☑ 완료 2026-11-11 — 옆 칸 폭 손잡이(separator · 끌기 · ← → Home End Enter · 두 번 누르기, 320 ~ 720 · 본문 560 이상), 사이드바 접기 단추 · 틀 → SideNav 접힘 문맥 · 저절로 접힘(본문 < 1024) · brandCollapsed, AgentReplay 새 컴포넌트(D-130). 떠 있는 패널(1024 ~ 1279)은 PG-33에 이미 있었다. 시험 shell-r41 26개, Storybook axe 위반 0(AgentReplay · AppShell · SideNav · Icon · IconButton), VRT AgentReplay 새 4장 · 그 밖 기존 그대로, `pnpm lint · typecheck · test · build` · `pnpm build:docs` 통과
의존: PG-33(옆 칸 자리는 있다)
목표: 옆 칸 폭 끌기 · 1024~1279 떠 있는 패널 · 사이드바 접기 단추와 자동 접힘 · brandCollapsed, 화면 조작 재생 층 AgentReplay.
완료 조건: 컴포넌트 작업 공통 DoD.

### PR-37 SideNav 묶음 열림 제어(R-42)
상태: ☑ 완료 2026-11-11 — 묶음 open · onSectionOpenChange · revealActive(처음 열림 + activeId 이동 시 드러내기, 다시 그리지 않음) · 접힌 묶음 머리 지금 화면 표시(nav.fgActive 700 + 숨은 글) · data-section-id · 닫힌 동안 aria-controls 없음(D-131). 스토리 ControlledSections · ActiveInCollapsed, 시험 8개, VRT Trade 그대로
의존: 없음
목표: SideNavSection open · SideNav onSectionOpenChange · revealActive · 접힌 묶음 안 지금 위치 표시 · data-section-id.
완료 조건: 컴포넌트 작업 공통 DoD.

### PR-38 디자인 품질 점검 7항목(R-43)
상태: ◐ 진행
표 · 달력 가지(2026-11-11): 5 MonthCalendar size sm(칸 space.48, 점 + 건수) · onDayPress(D-137)
면 · 머리 가지(2026-11-11): 1 Card emphasis · tone · 빈 본문(D-140) · 3 형제 휴대폰 한 줄 스크롤 · meta 설명 줄(크기는 제안, D-141) · 4 neutral 배지 · DueBadge 먼 단계 점 없음(D-142) · 6 Banner 좁은 폭 · 7 SectionHeader · platform.md §7.3(D-143). 2 · 5는 다른 가지. 남은 것: strong 무게 · 형제 크기 Patrick 확인
의존: 없음
목표: 1 Card 무게 단계 · 2 링크와 위험색(값 제안) · 3 PageHeader siblings 무게(크기 제안) · 4 neutral 배지 점 · 6 Banner 좁은 폭 · 5 MonthCalendar sm · 7 SectionHeader.
완료 조건: 컴포넌트 작업 공통 DoD. 2 · 3의 토큰 값 · 크기는 제안 표까지만.
2번 반영 2026-11-11(D-146 확정, Patrick 승인): a 표 · 목록 안 링크 = fg.primary 500 + 가리키거나 초점이면 밑줄(Link variant="plain", DataGrid 링크 열 · 칸 안 Link · DescriptionList · Attachment · 블록 3곳), c 오늘 표시 = fg.strong 면 + fg.inverse 글자(MonthCalendar 오늘 원 · 주 머리 · 목록 날 · 지금 선, TeamSchedule 오늘 원 · 열, 그룹웨어 달력 블록). b 제외(지출 파랑과 ΔE 7.8). 토큰 값 변화 없음

### PR-39 1.0.0 공개 정리 — 넘침 점검 · Figma 4차 동기화 · 공개 기록 다시 시작
상태: ☑ 완료 2026-11-13 — 비공개 da54009 → 공개 `terracelab/trellis` `main` ba1e0d6("Trellis 1.0.0", 커밋 1개, 옛 머리 0ab61d8) · `gh-pages` afece45("site: Trellis 1.0.0", 커밋 1개, 옛 머리 51555c7). 작성자는 둘 다 공개용 계정. `https://trellis.terracelab.co.kr/`가 v1.0으로 열리고 manifest는 1.0.0 · 121종 stable이다. 아래 완료 조건의 명령은 모두 이 날 돌려 통과했다. 올리기 전 공개 저장소는 git bundle로 받아 두었다(저장소 밖). Figma Components 다시 게시와 사람 확인 항목은 남아 있다
의존: 없음
목표: 지금 코드로 데모 · Figma 파일 셋 · 소개 사이트를 맞추고, 문서에서 글자가 표 · 상자 밖으로 나가는 곳을 고친 뒤, 버전을 1.0.0으로 올려 공개 저장소와 사이트에 낸다(2026-11-13 Patrick 지시, D-154).
산출물:
- 넘침 고침(react): PermissionMatrix · LineItemsEditor 스크롤 칸 기준 블록, MessageThread 답글 인용, KpiCard 숫자, KanbanBoard 카드 금액 줄, MonthCalendar 7일 시간표 칸 폭 규칙. 블록 `erp/production/work-orders` 실적 칸.
- 문서 사이트: 본문 표(칸 옆 여백 12 · 한글 낱말 단위 줄바꿈 · 첫 열 최소 폭 · 표 안 코드 경로의 "/" 뒤 줄바꿈 · 넘치는 표 끝 그늘), 넘치는 예시는 상자 안 가로 스크롤(`LiveExample`), 모듈 표의 코드, DashboardGrid 예시 폭.
- 소개 사이트: 홈 테마 칸의 앱 창(칸이 좁으면 메뉴를 아이콘만), 테마 화면 입출금 표, 블록 그림 168장 다시 찍기, 1.0 문구.
- 동봉 문서: 컴포넌트 상태를 VRT 스냅샷 폴더 기준으로(121종 `stable`), 변경 이력은 `packages/react/CHANGELOG.md`.
- Figma: 4차 동기화(`docs/figma/README.md`, `docs/figma/audit/sync-4.json`, 캡처 `notes/figma-sync-4/`).
- 버전: 공개 패키지 7개 1.0.0 · 패키지별 `CHANGELOG.md` · `.changeset/changelog.cjs`.
- 공개: `make-public-snapshot.mjs --fresh` · `pnpm public:push --fresh` · `apps/site/scripts/deploy.mjs --fresh`.
- 넘침 점검 스크립트 `apps/site/scripts/overflow.mjs`(`pnpm --filter @terracelab/site check:overflow`). 공개 저장소에 올린 뒤에 넣었다. 다음 공개 때 나간다.
완료 조건:
- 넘침 점검: `pnpm --filter @terracelab/site check:overflow` 통과. 묶음의 문서 · 소개 사이트 287쪽 × 폭 7(1920 · 1440 · 1280 · 1024 · 768 · 600 · 390)과 데모 78화면 × 폭 4에서 넘침 0. 알려진 자리로 따로 세는 것은 소개 사이트 컴포넌트 목록의 줄인 미리보기(일부러 자르고 흐린다)와 AppShell 휴대폰 바 brand(backlog)다. 같은 점검을 고치기 전 빌드(e3e1d00)에 돌리면 알려진 자리 밖에서 페이지 가로 넘침 13곳(컴포넌트 문서 다섯 쪽. PermissionMatrix는 390 폭에서 485px) · 상자 밖 글자 17곳 · 말줄임 없이 잘린 글자 17곳 · 잘린 표 2곳 · 데모의 잘린 숫자 3곳이 나온다.
- 본문 표: 데스크톱 폭(1024 ~ 1920)에서 가로로 넘치는 표가 토큰 표 2개뿐이다(고치기 전 1440에서 4 · 1280에서 10).
- `pnpm lint` · `pnpm typecheck` · `pnpm test` 통과, `pnpm vrt` 558장 차이 0.
- `pnpm --filter @terracelab/site check` · `@terracelab/docs check`(4조각) · `@terracelab/demo check` 통과.
- `node scripts/figma-audit.mjs --check docs/figma/audit/sync-4.json` 통과.
- 공개 저장소 `terracelab/trellis`의 `main` · `gh-pages`가 커밋 하나씩이고 작성자가 공개용 계정이다. `https://trellis.terracelab.co.kr/`가 v1.0으로 열린다.
올린 뒤(공개 1.0.0에는 없다. 다음 공개 때 나간다): 넘침 점검 스크립트(0b0236c), doctor가 `inner-override:` 표시를 보게 한 고침(cb51a50, patch changeset). 고객사 데모 저장소 `trellis-demos`를 이 커밋으로 올렸다(복사한 블록 42개, 회사 3곳 · 53화면 check 문제 0, `ds:doctor` 통과, 로컬 커밋 d5ecf5e). 그쪽에서 찾은 Trellis 쪽 항목은 그 저장소 `docs/trellis-feedback.md` 2026-11-13 줄에 있다. 공개 저장소의 CI · Sites 워크플로는 ba1e0d6에서 통과했다.
사람 확인: Figma Components 라이브러리 다시 게시(새 13 · 바뀜 33), 패키지 `license` 칸(`UNLICENSED`)과 공개 저장소 LICENSE(Apache-2.0) 맞추기, `.publicignore`에 `docs/plan`을 넣을지, 저장소 `terracelab.github.io`의 `trellis/` 폴더와 커밋 기록 정리(옛 주소 `terracelab.github.io/trellis/`는 지금 새 주소로 301이다. 공개 저장소 `trellis`의 Pages가 그 경로를 가져간다).
