---
name: trellis
description: 테라스랩 Trellis 디자인 시스템으로 화면 · 컴포넌트를 만들거나 고칠 때 쓴다. "Trellis로", "디자인 시스템 적용", "토큰 써서", "목록 · 폼 · 결재 · 대시보드 화면 만들어줘" 같은 요청, 또는 저장소에 trellis/ 하위 모듈이나 @terracelab/trellis-* 가 있고 UI를 건드리는 모든 작업에 쓴다. Trellis를 말하지 않아도 쓴다.
---

# Trellis로 화면 만들기

이 서비스는 Trellis를 git 하위 모듈(`trellis/`)로 쓴다. 문서는 그 하위 모듈의 커밋과 같은 버전만 믿는다.

## 0. 시작할 때(매번)

1. `pnpm ds:doctor`를 돌린다. CSS 순서 · 빌드 여부 · 토큰 밖 값을 본다. 실패가 있으면 먼저 고친다.
2. `trellis/packages/react/dist/docs/llms.txt`를 읽는다. 작업에 필요한 `components/<Name>.md` · `guides/*.md`만 더 연다. 없으면 `pnpm ds:build`부터.
3. 비슷한 화면이 블록에 있는지 본다: `pnpm ds:add --list`. 있으면 복사해서 시작한다(`references/blocks.md`).
4. 회사 색이 정해져 있고 `apps/web/src/theme.css` 첫 줄에 `trellis-theme`가 없으면 회사 테마부터 만든다: `pnpm ds:theme --brand "#RRGGBB"`(회색 톤은 `--neutral cool|neutral|warm`). `--tl-color-brand-*`를 직접 덮지 않는다. 생성기가 겹침 경고(`!`)를 내면 `guides/theme.md`의 "겹침 경고를 받았을 때" 세 가지 중 하나를 고른다.
   - 그대로 쓴다. 상태 · 금액은 글자 · 아이콘 · 부호와 함께 보인다. 고른 이유를 보고에 적는다.
   - 생성기가 낸 대안 색(`대안 색:`)으로 다시 만든다. 회사 색을 바꾸는 일이라 사람에게 묻는다.
   - `또는 --button-text input`이 나오면 그 옵션을 붙여 다시 만든다(주 버튼 바탕 = 입력 색).
   아주 밝은 색(노랑 · 하늘 · 연두)에서 생성기가 `? …` 줄과 `제안: --button-text input`을 내면 주 버튼 · 강조가 회사 색에서 멀어진 것이다. 제안대로 다시 만들면 입력 색 바탕 · 짙은 글자가 된다. 만든 뒤 `pnpm ds:doctor`를 다시 돌린다.

## 1. 요청을 Trellis 어휘로 바꾼다

- 화면 유형: 알림 카드 홈 · 목록과 상세 · 폼과 등록 · 결재 · 대화형 · 오류 화면. 맞는 블록을 고르고 slots만 고친다(유형별 블록은 `references/blocks.md`의 "블록 패턴과 고르는 법").
- 대시보드는 `guides/dashboards.md`의 순서로 조립한다: PageHeader → FilterBar · PeriodPicker(`compare`) → KpiCard 줄 → DashboardGrid의 ChartCard 위젯 → DataGrid + 내보내기. 불러오기 · 빈 상태 · 오류는 카드마다 보인다.
- 숫자 · 추이 · 구성 · 비교는 `guides/charts.md`의 표로 차트를 고른다. 예측은 TrendChart `forecast`, 단계 전환은 FunnelChart, 구성 추이는 ComboChart `stacked`, 목표 대비는 BulletBar. 축은 하나, 표 대체 필수.
- 에이전트에게 묻는 화면은 `guides/conversation.md`를 따른다. 답은 MessageThread `kind: 'answer'`(RichText · Citation · RunSteps), 데이터 변경은 ProposalCard 승인 뒤에만, 입력은 Composer. 업무 화면 옆에 붙일 때는 AppShell `aside`(폭 손잡이 · 사이드바 저절로 접힘), 에이전트가 화면을 조작하는 모습은 AgentReplay(클릭을 막지 않는 맨 위 층).
- 부품은 `manifest.json`의 components에 있는 것만 쓴다. 없는 컴포넌트를 서비스에서 새로 만들지 않는다. `references/request.md` 절차로 Trellis 보강 요청을 남기고, 그동안은 가장 가까운 기존 컴포넌트 조합으로 둔다.

## 2. 구현 규칙

- 값은 `--tl-*` 변수나 `@terracelab/trellis-tokens`의 TS 객체만. raw hex · px(0 제외) · font-family 리터럴 금지. `theme.css`는 생성기가 만든 파일이라 예외.
- semantic 토큰만 쓴다(`--tl-color-bg-surface`). primitive(`--tl-color-brand-500`) 직접 참조 금지.
- props는 문서의 Props 표 그대로. 이벤트는 `onPress` · `onChange` · `onOpenChange`. `className` · `style`로 컴포넌트 안쪽을 덮지 않는다.
- 상태 어휘 7개(default · hover · active · focus · disabled · loading · error), 결재 5개(기안 · 진행 · 승인 · 반려 · 회수), 수입 빨강 · 지출 파랑, 금액은 원 단위 · 천 단위 구분 · 오른쪽 정렬(`formatAmount`).
- 왼쪽 강조 띠, 카운트 알약, 색 바탕 배너, 줄마다 색 알약을 만들지 않는다(`references/do-dont.md`). 새 부품(DashboardGrid · FunnelChart · SelectableList · TagInput · Link · Checklist · TimeField · PermissionMatrix · FileViewer · ProposalCard 등)이 있는 일을 손으로 짜지 않는다. 같은 표에 대응이 있다.
- 에이전트 화면 문구에 모델 · 공급사 이름을 쓰지 않는다. 사실을 말하는 답에는 출처(`citations`)를 붙인다.
- 화면 문구는 `guides/content.md`를 따른다. 느낌표 · 과장 · 비유 없이 무엇을 하는지 쓴다.
- 로그인 사용자 · 권한 · 알림은 `PlatformProvider`에 session · notifications로 넘기고, 화면은 `usePlatform` · `useCan`으로 읽는다. 블록 id와 앱 경로는 `screens` · `screenHref` · `navigate`로 잇는다. props · 타입 · 화면 도우미(`Page` · `Grid` · `useSiblings` · `josa` …)는 `references/blocks.md`의 표.

## 3. Trellis를 고쳐야 할 때

작은 수정(버그 · 문구 · 스타일 한 곳)은 하위 모듈에서 바로 고친다. 큰 것(새 컴포넌트 · 토큰 값 · 이름 변경)은 요청만 남긴다. 절차는 `references/request.md`.

## 4. 검증

- `pnpm ds:doctor` 통과. `!` 경고(블록 원본에서 온 줄 · 오래된 theme.css · 스킬 버전)도 읽고 처리한다.
- 서비스의 `pnpm lint` · `pnpm typecheck` · `pnpm build`.
- 화면이 보이는 작업이면 `pnpm check`. 메뉴(`apps/web/src/nav.ts`)의 화면과 `scripts/check.mjs`의 `EXTRA_ROUTES` × 폭 344 · 720 · 1024 · 1440 × 라이트 · 다크에서 axe critical · serious 0, 가로 넘침 0, 콘솔 오류 0이어야 한다. 메뉴에 없는 화면(상세 · `?id=`)은 `EXTRA_ROUTES`에 더한다. 개발 서버는 스크립트가 띄운다(이미 켠 서버는 `BASE=http://localhost:5173 pnpm check`).
- 스크린샷은 `check-results/<테마>-<폭>-<화면>.png`에 본문 높이만큼 길게 남는다. 1440 · 344의 라이트 · 다크를 열어 본다.

## 5. 보고

무엇을 어떤 블록 · 컴포넌트로 만들었나, 새로 드러난 요구(없는 컴포넌트 · 토큰)와 `.trellis/requests.md`에 남긴 요청, doctor · check 결과, 스크린샷. 추측한 데이터 · 문구는 따로 적는다.
