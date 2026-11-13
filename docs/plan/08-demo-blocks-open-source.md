# 트랙 F · 데모 · 화면 블록 · 오픈소스 · 에이전트 구축

목표: 테라스원(맞춤 구축 서비스, D-49)의 영업과 구축을 Trellis 하나로 돌린다. 고객에게는 **계약 전에 완성될 화면을 데모로 보여 주고**, 개발자와 에이전트에게는 **미리 디자인된 화면 블록을 복사해 조립하게** 한다. Trellis는 오픈소스로 공개한다(D-50).
사람 작업(Patrick): 라이선스 결정, 공개 범위 결정, 구축 문의 창구, 블록 시각 승인, 고객 테마 규칙 승인.
산출물: 공개 레포 기본 파일, 공개 npm · PyPI 배포, 블록 규격과 블록 60여 종, `trellis add` CLI, 고객 테마 생성기, 데모 앱(`one.terracelab.co.kr/demo/`), 문서 사이트 블록 갤러리, 에이전트 구축 E2E.
규격: `docs/spec/components.md` §10(패턴) · §12(블록, PF-05에서 추가), `docs/spec/distribution.md` §4(스킬 CLI), `docs/spec/content.md`.
전제: PF-01~PF-03 · PF-05 · PF-07은 지금 시작할 수 있다. 블록과 데모는 P1 컴포넌트(AppShell · DataGrid · Form 계열)가 생긴 뒤.

## 0. 왜 블록인가

AI 에이전트에게 화면을 통째로 맡기면 배치와 위계가 무너진다. 토큰과 컴포넌트만으로는 부족하고, **화면 단위로 미리 디자인된 조합**이 있어야 에이전트가 고르는 일만 하게 된다. shadcn/ui의 blocks, Tailwind UI의 application UI가 같은 이유로 생겼다.

| 층 | 무엇 | 누가 정하나 | 소비 방식 |
|---|---|---|---|
| 토큰 | 색 · 글자 · 간격 · 밀도 | Trellis(사람 승인) | npm 의존 |
| 컴포넌트 | Button · DataGrid · TrendChart … | Trellis(contract) | npm 의존 |
| 패턴 | 목록·상세 · 폼·등록 · 전표 입력 … 구성 규칙 | Trellis(spec) | 블록이 따른다 |
| **블록** | 모듈 화면 하나(구매 발주 목록, 부가세 신고서 …) | Trellis(디자인 승인) | **소스 복사**(앱이 소유) |
| 앱 | 회사별 업무 로직 · API · 권한 | 구축 담당(사람 또는 에이전트) | — |

블록을 npm 의존이 아니라 **소스 복사**로 주는 이유: 맞춤 구축은 화면마다 업무 로직이 다르다. 복사한 코드는 앱이 소유하고 마음대로 고친다. 대신 블록이 쓰는 부품은 npm의 컴포넌트라 디자인 규칙은 그대로 따라온다. 업스트림 블록이 바뀌면 `doctor`가 차이를 알려 준다.

## 1. 구조

```
blocks/                        @terracelab/trellis-blocks (npm에는 메타 + 소스 동봉, 런타임 의존 아님)
  src/<group>/<module>/<screen>/
    <Screen>.tsx               블록 본체. Trellis 컴포넌트만 import
    <Screen>.mock.ts           결정적 샘플 데이터(날짜 고정)
    block.json                 메타
apps/demo/                     데모 앱(Vite + React) → one.terracelab.co.kr/demo/
packages/skill/                @terracelab/trellis-skill — install · doctor · docs · update · add · theme
```

`block.json`

```json
{
  "id": "erp/purchasing/order-list",
  "title": "발주 목록",
  "intent": "기간 · 거래처 · 상태로 발주를 찾고 일괄 승인 요청한다",
  "module": "purchasing",
  "pattern": "ListDetail",
  "industries": ["distribution"],
  "components": ["FilterBar", "DataGrid", "Badge", "Drawer", "ActionBar"],
  "sizes": [1440, 1024, 390],
  "density": ["compact", "comfortable"],
  "slots": ["columns", "filters", "rowActions", "detail"],
  "status": "preview"
}
```

- `intent`는 에이전트가 블록을 고르는 근거다. `content.md` 문체(합니다체 아님, 한 문장 평서)로 쓴다.
- `slots`는 맞춤 구축에서 바꾸는 자리다. 블록 코드 안에서 `// slot: columns` 주석으로 표시해 에이전트가 고칠 곳만 고친다.
- 동봉 문서 `manifest.blocks`에 전부 들어간다. 에이전트는 manifest에서 블록을 고르고 `trellis add`로 가져온다.

## 2. 고객 테마

맞춤 구축의 "회사에 맞게"는 업무 로직과 **브랜드**다. 브랜드는 범위를 묶는다.

| 바꿀 수 있다 | 바꿀 수 없다 |
|---|---|
| `brand.*` 5종 · `fg.link` · `border.focus`(고객 브랜드 색 하나에서 생성), 회색 톤 3종(차가운 · 중립 · 따뜻한, 명도는 그대로) → `bg · fg · border`, 로고(AppShell 슬롯), 기본 밀도 | status · finance · approval · module · chart, 번호 붙은 primitive, 글꼴(Pretendard 고정, 오프라인), 간격 · 반경 · 글자 크기 |

- D-58로 회색 톤까지 열었다(Patrick 2026-11-08). 생성기는 `@terracelab/trellis-tokens/theme`, 명령은 서비스 루트의 `pnpm ds:theme`(가이드 `docs/guides/theme.md`).
- `npx @terracelab/trellis-skill theme --brand "#0B7A5C"` → OKLCH로 brand 단계를 만들고 대비 검사(on-brand 4.5:1, subtle 위 링크 4.5:1, 다크 포함)를 통과한 값만 `theme.css`로 낸다. 통과하지 못하면 가장 가까운 통과 값을 제안한다.
- `theme.css`는 `--tl-color-brand-*`만 덮는다. 다른 변수를 덮으면 `trellis/theme-scope` 린트가 실패한다.
- Trellis 기본 토큰 값의 승인 규칙(CLAUDE.md)은 그대로다. 고객 테마는 생성기와 검사를 통과한 고객 값이다.

## 3. 오픈소스 공개 점검(2026-11-07 기준)

| 항목 | 현재 | 공개 전 할 일 | 판단 |
|---|---|---|---|
| 코드 라이선스 | 패키지 6개 전부 `UNLICENSED` | LICENSE 파일 · `license` 필드 | 사람. **MIT 추천**(Primer · Radix · shadcn/ui와 같다. Carbon은 Apache-2.0) |
| 글꼴 | Pretendard Variable 동봉, `LICENSE-OFL.txt` 있음 | NOTICE에 표기 | OFL은 동봉 · 재배포 허용 |
| 아이콘 | Lucide(빌드 시 사용) | NOTICE에 ISC 표기 | 문제 없음 |
| 모듈 타일 일러스트 21종 | Patrick 제공 자산 | 제작 출처와 권리 확인. 코드와 다른 라이선스로 분리할지 결정 | 사람 |
| 테라스랩 · 테라스원 · 제품 이름 · 로고 | 문서 곳곳 | `TRADEMARKS.md`로 코드 라이선스와 분리 | 사람(문구는 에이전트) |
| 경쟁사 이름 | 내부 문서 14파일, `build-docs` 금칙어 목록 | 공개 레포에는 "타사 자산 금지" 일반 규칙만 남기고 구체 이름은 비공개 설정으로. 또는 `docs/plan`을 내부 레포로 분리 | 사람. **일반화 추천** |
| 비밀 · 개인정보 | 검색 결과 없음(메일 주소 · npm · GitHub 토큰 패턴 0건) | 공개 직전 같은 검사를 CI로 | — |
| 레지스트리 | 사설 레지스트리 계획(D5 · P3-11) | 공개 npm(`--provenance`) · PyPI(trusted publishing)로 대체 | D-50 |
| Figma 파일 | 팀 접근 | 커뮤니티 공개 여부 | 사람 |
| 기여 절차 | 없음 | CONTRIBUTING(spec → contract → 구현, 토큰 값은 승인) · 이슈 템플릿(컴포넌트 요청 · 블록 요청) | 에이전트 |

---

## 4. 작업

### PF-01 테라스원 포지셔닝 반영
상태: ☑ 완료 2026-11-07 — 소개 사이트를 맞춤 구축 서비스로(히어로 · 구축 방식 4단계 · 고를 수 있는 모듈 · 업종별 화면 · 샘플 화면 · Trellis), 가이드 · 결정 · 플랜 문구 정리. 1440 · 1024 · 390 axe 0 · 외부 0
의존: 없음
목표: 테라스원을 완성품이 아니라 Trellis로 회사마다 맞춰 만드는 올인원 플랫폼으로 소개한다(D-49).
사람 확인: 문구 승인, 구축 문의 창구(메일 · 폼 · 채널 중 무엇을 공개할지).

### PF-02 오픈소스 공개 점검
상태: ☐ 대기
의존: 없음
목표: §3 표의 사람 판단을 받고 나머지를 정리한다.
산출물: `NOTICE`(Pretendard OFL · Lucide ISC · 기타), `TRADEMARKS.md`, 경쟁사 이름 일반화 PR, 비밀 스캔 CI 잡(gitleaks 등 고정 버전).
완료 조건: 공개 레포에 들어갈 파일에서 경쟁사 이름 0건(스크립트), 비밀 스캔 0건, NOTICE가 dist에 포함.
사람 확인: 라이선스, 타일 일러스트 권리, 경쟁사 이름 처리 방식, Figma 공개 여부.

### PF-03 공개 레포 기본 파일
상태: ◐ 진행 — 2026-11-13 라이선스 Apache-2.0 확정(Patrick, D-155). `LICENSE` · `NOTICE`(Pretendard OFL · Lucide ISC), npm에 올리는 패키지 넷의 `LICENSE` · `NOTICE` 사본과 `README.md`, 모든 package.json `license`, 넷의 `repository` · `homepage` · `bugs` · `publishConfig`, 사본이 원본과 같은지 보는 `scripts/license-files.test.mjs`. 남은 것: `CONTRIBUTING.md` · `CODE_OF_CONDUCT.md` · `SECURITY.md` · 이슈 · PR 템플릿
의존: PF-02(라이선스 결정)
산출물: `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `.github/ISSUE_TEMPLATE/{component-request,block-request,bug}.yml`, PR 템플릿, 각 package.json `license · repository · homepage · bugs`, README 첫 문단에 영문 한 줄.
완료 조건: `pnpm -r exec npm pkg get license`가 전부 같은 값, `npm pack --dry-run`에 LICENSE · NOTICE 포함.
사람 확인: 없음.

### PF-04 공개 npm · PyPI 배포
상태: ☑ 완료 2026-11-13(npm) — `@terracelab/trellis-tokens` · `-icons` · `-contracts` · `-react` 1.0.0을 공개 npm에 올렸다(D-155, `pnpm release:npm`, Patrick이 2단계 인증을 켜고 돌렸다). 저장소 밖 새 프로젝트에서 `pnpm add`로 레지스트리 설치 · Node 불러오기 · tsc · vite build 통과. 남은 것: `release.yml`(`--provenance` · trusted publishing). PyPI는 Django 패키지가 1.0 뒤라 하지 않는다
의존: PF-03, P3-12(릴리즈 파이프라인)
목표: D5 사설 레지스트리를 공개 배포로 바꾼다. P3-11은 이 작업으로 대체한다.
산출물: `release.yml`(npm `--provenance`, PyPI trusted publishing), `publishConfig.access: public`, 설치 가이드 갱신.
완료 조건: dry-run publish 통과, 빈 디렉터리에서 `pnpm add @terracelab/trellis-react`가 공개 레지스트리에서 설치된다(첫 공개 뒤).
사람 확인: npm 조직 `@terracelab` · PyPI 계정 생성, 첫 publish 승인.

### PF-05 블록 규격
상태: ◐ 진행 — 2026-11-08 block.json 스키마(zod) · check-blocks(id = 경로 · 모듈 · 컴포넌트 · 금칙어 · 토큰 밖 값) · blocks 워크스페이스. 남은 것: components.md §12 · 동봉 문서 manifest.blocks
의존: 없음(구현은 P1 뒤)
목표: §1 구조를 `docs/spec/components.md` §12로 쓰고, `block.json` zod 스키마와 `manifest.blocks`를 동봉 문서 생성기에 넣는다.
완료 조건: 스키마 테스트, 빈 `blocks/` 워크스페이스 빌드, `manifest.blocks: []`가 동봉 문서에 있다.
사람 확인: 없음.

### PF-06 `trellis add` · `trellis theme`
상태: ◐ 진행 — 2026-11-08 git 하위 모듈 방식으로 먼저: `scripts/add-block.mjs`(복사 · import 경로 바꾸기 · `.trellis/blocks.lock`), `pnpm ds:theme`, `trellis-skill doctor`(CSS 순서 · 토큰 밖 값 · 테마 범위 · 스킬 버전). 남은 것: doctor의 업스트림 블록 차이 비교, npx 배포(PF-04 뒤)
의존: PD-02(스킬 패키지), PF-05, PF-07
목표: 블록 소스를 앱으로 복사하고(`.trellis/blocks.lock`에 버전 기록) import 경로를 앱 기준으로 바꾼다. `doctor`는 업스트림 블록과 차이를, `theme`은 고객 테마를 만든다.
완료 조건: 빈 Vite 앱에서 `add erp/purchasing/order-list` → 빌드 · 타입 검사 통과, `doctor`가 블록 차이와 테마 범위 위반을 잡는다(테스트 픽스처).
사람 확인: 없음.

### PF-07 고객 테마 생성기
상태: ☑ 완료 2026-11-08 — `packages/tokens/theme`(브라우저 · Node, 외부 라이브러리 없음): 기본 브랜드 단계 그대로 재현, 극단 색 20개 × 회색 톤 3종 + 컬러칩 8개 대비 전부 통과(못 넘으면 단계를 옮김), 빨강 · 초록 · 노랑 계열 경고, `gen-theme.mjs` · 데모 테마 색 Drawer · 시작 템플릿 미리보기, doctor 범위 검사(D-58)
의존: 없음
목표: §2. 브랜드 색 하나 → `brand.*` 라이트 · 다크 5종, 대비 검사, `theme.css`, `trellis/theme-scope` 린트.
완료 조건: 테스트 색 20개(채도 · 명도 극단 포함)에서 생성 값이 전부 대비 통과, 실패 입력은 대안 제안, 미리보기에 테마 전환 스위치.
사람 확인: 바꿀 수 있는 범위 승인(모듈 그룹 색 포함 여부).

### PF-08 데모 앱
상태: ◐ 진행 — 2026-11-08 apps/demo: 블록 자동 등록 · 업종 프리셋 · 역할 바꿔 보기 · 테마 · 밀도 · 알림 Drawer, one.terracelab.co.kr/demo/ 함께 배포, 검사 스크립트(블록 전체 × 라이트 · 다크). 남은 것: 고객 테마 미리보기(PF-07), 모듈 켜고 끄기 UI
의존: P1-14 AppShell, P1-15 DataGrid, P2-01 Form, PF-05, PF-07
목표: `apps/demo` — 고객 미팅에서 쓰는 데모. 모듈 켜고 끄기(사이드바 · 알림 · 홈이 따라 바뀜), 업종 프리셋, 브랜드 색 · 로고 바꾸기, 역할 전환(사원 · 팀장 · 관리자), 테마 · 밀도 전환, 결정적 샘플 데이터. 화면은 전부 블록.
완료 조건: 1440 · 1024 · 390 × 라이트 · 다크 axe 0 · 외부 요청 0, 모듈 20종 모두 홈과 첫 화면이 있다, `one.terracelab.co.kr/demo/`로 함께 배포.
사람 확인: 데모 흐름 시각 승인.

### PF-09 블록 1차 — ERP 6모듈
상태: ◐ 진행 — 2026-11-08 ERP 14블록(세금계산서 목록 · 발행 · 부가세 신고 · 발주 목록 · 발주서 작성 · 거래처 원장 · 전표 입력 · 합계잔액시산표 · 자금 일보 · 견적 · 수주 · 매출 분석 · 작업지시 · 급여 대장 · 인사 기록). 남은 것: VRT, 회계 · 자금 나머지 화면
의존: PF-05, P2-11(패턴 템플릿)
목표: 회계 · 자금 · 구매 · 영업 · 생산 · 인사급여 × 목록 · 상세 · 등록 · 현황(대시보드) = 24블록.
완료 조건: 블록마다 VRT 1440 · 1024 · 390 × 라이트 · 다크, 문구 검사 통과, `manifest.blocks` 24.
사람 확인: 블록 시각 승인(묶음 단위).

### PF-10 블록 2차 — 그룹웨어 · ECM · CRM
상태: ◐ 진행 — 2026-11-08 그룹웨어 9(결재함 · 결재 문서 · 기안 작성 · 메일 · 내 근태 · 팀 근태 · 일정 · 공지 · 메신저) · ECM 4 · CRM 4. 남은 것: VRT
의존: PF-09
목표: 14모듈 × 대표 화면 2~3 = 약 36블록. 전자결재는 `ApprovalFlow` 패턴 3화면(기안 작성 · 결재함 · 문서 보기).
완료 조건: PF-09와 같다.
사람 확인: 블록 시각 승인.

### PF-11 업종 블록
상태: ◐ 진행 — 2026-11-08 유통·물류 6(입고 · 재고 · 로트 · 선적 · 통관 · 배차 · 기사 앱) · 이커머스 8 · 제조 5(현장 보드 1920 포함). 남은 것: VRT, board 밀도 토큰(PE-03) 승인 뒤 보드 전환
의존: 트랙 E PE-09, PF-09
목표: 트랙 E 패턴 6종을 블록으로(전표 입력 · 부가세 신고서 · 주문 상세 · 모바일 스캔 검수 · 현장 보드 · 재고 매트릭스). PE-10(업종 플레이그라운드)은 이 블록으로 조립한다.
완료 조건: PF-09와 같고 현장 보드는 1920 다크 추가.
사람 확인: 블록 시각 승인.

### PF-12 블록 갤러리
상태: ☐ 대기
의존: PF-09
목표: 문서 사이트 `/blocks/` — 모듈 · 업종 · 패턴으로 거르는 썸네일 격자(VRT 스냅샷에서 자동), 블록 페이지(라이브 미리보기 · 크기 전환 · 코드 · `add` 명령 · slots 설명). 테라스원 사이트의 "업종별 화면"과 "샘플 화면"은 같은 썸네일로 바꾼다.
완료 조건: 사이트 검사 통과, 블록 수 = manifest 블록 수.
사람 확인: 갤러리 정렬 시각 승인.

### PF-13 에이전트 구축 E2E
상태: ⛔ 대체 — P2-19(인사 화면 시험 서비스)가 요구 한 장 · 회사 색 · 화면 5개 · 자동 검사로 같은 증명을 하고 G3에서 다시 돌린다(D-102 제안)
의존: PF-06, PF-09, PD-07
목표: 요구사항 한 장(예: 식자재 유통사 · 모듈 구매 · 재고 · 전자결재 · 브랜드 색 · 결재선 규칙 2개)에서 에이전트가 빈 앱에 블록 add · 테마 · 규칙 반영으로 화면 5개를 만든다.
완료 조건: 자동 검사(trellis 린트 0 · axe 0 · 토큰 밖 값 0 · 블록 밖 새 컴포넌트 0 · 문구 금칙어 0), 블록 원본과 시각 차이 리포트, 소요 시간 기록.
사람 확인: Patrick 디자인 리뷰. 통과 기준은 "블록 원본과 같은 품질로 보인다".

### PF-14 테라스원 사이트 2차
상태: ☐ 대기
의존: PF-08, PF-12
목표: 데모 링크, 블록 썸네일 기반 "샘플 화면", 구축 문의, 구축 사례(공개 가능한 것만).
완료 조건: 사이트 검사 통과, 문의 경로가 실제로 동작(사람이 받은 확인).
사람 확인: 문의 창구, 사례 공개 동의.

### PF-16 git 하위 모듈로 쓰기 · 서비스 시작 템플릿
상태: ☑ 완료 2026-11-08 — 비공개 저장소 terracelab/trellis, `scripts/create-service.mjs`(하위 모듈 · 워크스페이스 · 설치 · Trellis 빌드 · 스킬 · 점검 · 첫 커밋), `starters/service`(앱 틀 · 알림 · 테마 · 밀도 · 화면 설정 · React Router, Trellis CI가 함께 검사), react · contracts · icons의 `@terracelab/source` 조건(서비스 개발 서버가 소스를 바로 읽는다), PlatformProvider의 session · notifications props, `docs/guides/service.md`. 검증: GitHub 주소로 만든 서비스와 그 클론에서 설치 · 빌드 · 타입 검사 · 점검 통과, 블록 복사 화면 렌더(D-58)
의존: 없음
목표: npm 배포 전에 Patrick의 서비스가 Trellis를 git으로 받아 쓰면서 Trellis를 그 자리에서 보강한다.
사람 확인: 없음.

### PF-17 보강 요청 목록
상태: ◐ 진행 — 2026-11-08 `docs/plan/backlog.md`와 서비스 쪽 스킬의 요청 절차. 서비스 작업에서 쌓이는 대로 플랜 작업으로 옮긴다
의존: PF-16

### PF-18 고객사 데모 저장소
상태: ◐ 진행 — 2026-11-08 별도 저장소 `trellis-demos`(D-59): 가설 문서 · 가상 고객사 3곳(다솜코스텍 · 오름빈즈 · 포근펫) · 회사별 빌드와 데이터 바꿔 끼우기 · 복사한 블록 42개 · 검사(샘플 흔적 · 금지어 · axe · 콘솔) · 허브 · GitHub Actions(Cloudflare 키가 있으면 배포) · claude.ai Artifact 미리 보기. 남은 것: Cloudflare Pages 프로젝트 · 하위 모듈 읽기 토큰
의존: PF-16
목표: 업종이 다른 고객사 데모를 Trellis 밖에서 만들어 영업에 쓰고, 그 과정에서 Trellis가 막히는 곳을 찾는다.
사람 확인: 회사 · 데이터의 그럴듯함(화면으로), 배포 계정.

### PF-15 블록에서 나온 컴포넌트 후보
상태: ☐ 대기
의존: PF-09~PF-11
목표: 블록 57개를 만들며 블록 안에서 토큰으로 조립한 것 중 여러 번 나온 것을 contract로 올린다. 우선순위는 쓰인 블록 수 순.
후보(블록 안 임시 구현이 있다):
- 표: DataGrid 그룹 · 소계 행(시산표), 트리 행(BOM), 편집형 품목 표 LineItemsEditor(Enter로 다음 칸 — 전표 · 세금계산서 · 발주 · 견적 4곳), 좁은 화면 열 숨김
- 업무: MonthCalendar(일정), KanbanBoard · KanbanCard(영업기회), MessageThread · Composer(메신저 · 상담), MailList · ReadingPane, FolderTree(문서함), ApprovalLineEditor(기안), PersonChip, TimeRangeBar(근무 · 회의실), SignaturePad(기사 앱), TemperatureReading(냉동창고 · 배차), AmountSummary(주문 금액 고정 순서), EquationStrip(전일 + 수입 − 지출 = 당일)
- 일반: SelectableCard(눌러서 고르는 카드 목록 — 입고 · 작업지시 · BOM · 채널), ProductThumb, CheckboxGroup, DashboardGrid(TV 보드, 스크롤 없는 고정 배치), `useMediaQuery`
고칠 것(컴포넌트): Donut 범례가 좁은 카드에서 깨짐 · Progress 라벨 숨김 옵션(표 칸) · TrendChart 마지막 x 라벨 잘림 · WaterfallChart 시작 · 합계 막대가 지출 파랑과 비슷(차트 토큰 제안) · Sparkline 유동 폭 · IconButton title과 Tooltip 중복 · ~~DateField는 브라우저 날짜 형식을 따른다~~(P2-17에서 자체 ISO 칸 + 달력으로 해결)
완료 조건: 후보마다 spec · contract · 구현 · 예시, 해당 블록이 임시 구현 대신 컴포넌트를 쓴다, 데모 검사 통과.
사람 확인: 후보 우선순위.

---

## GF 체크리스트 — 데모 · 오픈소스 공개

**자동**
- [ ] 비밀 스캔 0, 공개 파일 경쟁사 이름 0, LICENSE · NOTICE 동봉(PF-02 · PF-03)
- [ ] 공개 npm · PyPI dry-run 통과(PF-04)
- [ ] 블록 스키마 · manifest.blocks · VRT 전부 통과(PF-05 · PF-09~PF-11)
- [ ] `add` · `theme` · `doctor` 테스트 통과(PF-06 · PF-07)
- [ ] 데모 앱 axe 0 · 외부 요청 0(PF-08)
- [ ] 에이전트 E2E 자동 검사 통과(PF-13)

**사람(Patrick)**
- [ ] 라이선스 · 타일 권리 · 경쟁사 이름 처리 · 공개 범위
- [ ] 블록 시각 승인, 데모 흐름 승인
- [ ] 에이전트 E2E 디자인 리뷰
- [ ] 구축 문의 창구

통과하면 태그 `gf-approved`, 공개 레포 전환.
