# Trellis (트렐리스) — 테라스랩 디자인 시스템

테라스랩 B2B 제품(파일 관리 · 브랜드 운영 · 식자재 ERP · 그룹웨어 · CRM)이 공유하는 단일 디자인 시스템.
테라스원은 이 시스템으로 고객사마다 맞춰 구축하는 올인원 업무 플랫폼(맞춤 구축 서비스)이고, `one.terracelab.co.kr`은 그 소개와 데모다(D-49). Trellis는 오픈소스로 공개한다(D-50). 화면은 복사형 블록으로 조립한다(D-51, 트랙 F).
**Code-first.** `packages/tokens/src/**/*.json`이 유일한 원본이고, Figma · 웹(React) · 데스크톱(Tauri) · 모바일(Expo) · Django는 전부 그 생성물이다.

## 세션 시작 시 읽는 순서

1. 이 파일
2. `docs/plan/README.md` — 현재 Phase, 다음 작업을 고르는 법, 완료 정의
3. 그 작업이 속한 `docs/plan/0N-phase-*.md`
4. 작업이 건드리는 규격: `docs/spec/tokens.md` · `docs/spec/components.md` · `docs/spec/pipeline.md` · `docs/spec/distribution.md`(문서·스킬·배포) · `docs/spec/content.md`(문구 — 화면·사이트·문서의 말은 전부 이 규격을 따른다) · `docs/spec/platform.md`(테라스원 기본 기능 · 블록 · 데모)

결정의 근거는 `docs/plan/decisions.md`에 있다. 기획 원문(상세 기획안 v0)은 거기 링크되어 있고, 이 레포의 문서와 원문이 다르면 `decisions.md`의 "원문과 다른 점" 표가 우선한다.

## 절대 규칙 — 위반하면 CI가 실패한다

- **토큰 밖의 값은 없다.** 컴포넌트·앱 코드에 raw hex, px(`0` 제외), font-family 리터럴 금지. 값은 `--tl-*` CSS 변수 또는 `@terracelab/trellis-tokens`의 TS 객체로만 쓴다.
- **컴포넌트는 semantic 계층만 참조한다.** `color.brand.500` 같은 primitive 직접 참조 금지. semantic 토큰이 없으면 토큰 PR을 먼저 낸다.
- **spec 없는 컴포넌트는 없다.** `packages/contracts/src/<Name>/spec.md`와 `<Name>.contract.ts`가 먼저 존재해야 구현을 시작한다.
- **웹·네이티브 API는 동일하다.** 이름·props·상태 어휘는 contract가 정의하고, 두 구현은 모두 contract 타입을 `satisfies` 해야 한다.
- **의존 방향:** `tokens ← icons ← contracts ← react · native ← apps`. 역방향 import 금지.
- **상태 어휘 7개 고정:** `default · hover · active · focus · disabled · loading · error`
- **결재 상태 5개 고정:** `draft(기안) · pending(진행) · approved(승인) · rejected(반려) · withdrawn(회수)`
- **금융 색 고정:** 수입 `finance.income` = red, 지출 `finance.expense` = blue. 서양식 반전 금지.
- **타사 제품의 아이콘·일러스트·마스코트·문구 사용 금지.** 레퍼런스는 구조와 패턴만 참고한다. 타사 제품명은 저장소에 적지 않고, 금칙어 목록은 저장소 밖(`.forbidden-words` · CI 비밀 값 `TRELLIS_FORBIDDEN_WORDS`)에 둔다.
- **토큰 값(색·크기)은 에이전트가 제안만 한다.** 변경은 사람이 승인한다. 토큰 이름 변경·삭제는 major 버전 + codemod 동봉.

## 디자인 원칙 — 충돌하면 위에 있는 것이 이긴다

1. 밀도 우선: compact가 기본, comfortable은 옵션
2. 상태가 먼저 보인다: 카운트 배지·상태색·결재 단계는 모든 모듈에서 같은 문법
3. 한국 업무 관습: 수입 빨강·지출 파랑, 결재 어휘 5개, 금액은 원 단위·천 단위 구분·우측 정렬, 단위는 칸마다가 아니라 표 머리나 표 위에 한 번
4. 토큰 밖의 값은 없다
5. 플랫폼 간 API는 같고 구현만 다르다
6. 접근성은 기본값: 텍스트 대비 4.5:1 이상, 키보드로 모든 조작, 포커스 링 항상 표시, reduced-motion 준수

## 이름 규칙

| 대상 | 규칙 | 예 |
|---|---|---|
| 토큰 | JSON 점 경로 → CSS `--tl-` + 케밥 → TS 중첩 객체 → Figma 슬래시 | `color.bg.surface` → `--tl-color-bg-surface` → `tokens.color.bg.surface` → `color/bg/surface` |
| npm 패키지 | `@terracelab/trellis-<pkg>` | `@terracelab/trellis-react` |
| PyPI 패키지 | `terracelab-trellis` | — |
| CSS 클래스 | `tl-` 접두, 컴포넌트 루트 = `tl-<kebab>`, variant·size·state는 `data-*` 속성 | `<button class="tl-button" data-variant="primary" data-size="md">` |
| 컴포넌트 | 폴더·파일·Figma 컴포넌트·Storybook 제목이 모두 같은 PascalCase | `NotificationCard` |

## 자주 쓰는 명령

```bash
pnpm install                 # 워크스페이스 설치
pnpm build                   # turbo: tokens → icons → contracts → react/native → apps
pnpm lint                    # eslint(trellis 규칙 포함) + stylelint + 의존 방향
pnpm typecheck
pnpm test                    # vitest(웹·토큰) + jest-expo(네이티브)
pnpm storybook               # apps/storybook 개발 서버
pnpm vrt                     # Playwright 비주얼 회귀 (Docker 고정 이미지)
pnpm vrt:update              # 스냅샷 갱신 — PR에 `vrt-update` 라벨 + 사람 승인 필수
pnpm changeset               # 변경 세트 작성 (모든 패키지 fixed group)
pnpm --filter @terracelab/trellis-tokens build
pnpm build:docs              # 동봉 문서(react dist/docs: manifest · llms.txt · 컴포넌트 md)
pnpm --filter @terracelab/docs dev    # 문서 사이트 trellis.terracelab.co.kr (Starlight)
pnpm --filter @terracelab/site dev    # Trellis 소개 사이트(문서 · 데모와 묶어 GitHub Pages로, D-148)
pnpm --filter @terracelab/one dev     # 테라스원 소개 one.terracelab.co.kr
pnpm --filter @terracelab/demo dev    # 테라스원 데모(블록 조립) · build 뒤 check로 전 화면 검사
node blocks/scripts/check-blocks.mjs  # 화면 블록 block.json · 토큰 밖 값 · 금칙어 검사
```

## 작업 방식

- **한 세션 = 플랜의 작업 1개**(`P1-05` 같은 ID). 시작할 때 작업 ID와 목표를 말하고, 끝날 때 완료 조건을 **명령 실행 결과로 증명**한 뒤 해당 작업의 `상태:` 줄을 갱신한다.
- 완료 조건이 하나라도 안 맞으면 완료라고 하지 않는다. 막히면 `docs/plan/README.md`의 "사람에게 넘기기" 절차를 따른다.
- 생성물에는 스토리 1개 이상과 VRT 스냅샷이 반드시 들어간다.
- 커밋은 Conventional Commits, scope는 패키지 이름(`feat(react): Button`). 공개 패키지를 바꾸는 커밋은 changeset을 동봉한다.
- 에이전트용 스킬은 `.claude/skills/ds/`에 두고 버전 관리한다(Phase 1에서 생성).
- 외부 네트워크 의존 0: 폰트(Pretendard Variable woff2)·아이콘은 패키지에 포함한다. 설치형 앱은 오프라인에서 동일하게 렌더되어야 한다.
