---
name: trellis
description: 테라스랩 Trellis 디자인 시스템으로 화면 · 컴포넌트를 만들거나 고칠 때 쓴다. "Trellis로", "디자인 시스템 적용", "토큰 써서", "대시보드 · 목록 · 폼 · 결재 화면 만들어줘" 같은 요청, 또는 저장소에 @terracelab/trellis-* 가 설치돼 있고 UI를 건드리는 모든 작업에 쓴다. Trellis를 말하지 않아도 쓴다.
---

# Trellis로 화면 만들기

이 서비스는 Trellis를 npm 패키지(`@terracelab/trellis-*`)로 쓴다. 문서는 설치된 버전에 든 것만 믿는다. 명령은 서비스 저장소 루트에서 돌린다.

## 0. 시작할 때(매번)

1. `npx @terracelab/trellis-skill doctor`를 돌린다. 설치 · CSS import 순서 · 글꼴 · 토큰 밖 값을 본다. 실패(`✗`)가 있으면 먼저 고친다. 고칠 명령과 줄은 출력에 나온다. 패키지나 CSS import가 없다고 나오면 `references/setup.md` 순서대로 넣는다.
2. `npx @terracelab/trellis-skill docs llms`로 규칙과 문서 목록을 읽는다. 작업에 필요한 문서만 더 연다.
   - `docs <컴포넌트 이름>`은 용도 · Props 표 · 상태 · 예시 코드다. 이름은 `docs list`에 있다.
   - `docs guide <이름>`은 가이드, `docs tokens`는 토큰 표다.
   - `docs path`는 문서 폴더 경로를 낸다. 파일을 직접 읽거나 찾을 때 쓴다.
3. 앱이 저장소 루트가 아니면 명령에 `--app <앱 폴더>`를 붙인다. `install`에 한 번 주면 다음 명령이 그대로 쓴다.

## 1. 요청을 Trellis 어휘로 바꾼다

- 대시보드는 `references/dashboard.md`를 따른다. `npx @terracelab/trellis-skill add dashboard`로 돌아가는 화면을 복사해서 시작하고, 요청받은 기능을 그 문서의 표로 부품에 맞춘다.
- 그 밖의 화면 유형(알림 카드 홈 · 목록과 상세 · 폼과 등록 · 결재 · 대화형)은 `docs guide patterns`를 따른다. 폼은 `docs guide forms`, 에이전트 대화 화면은 `docs guide conversation`이다.
- 숫자 · 추이 · 구성 · 비교는 `docs guide charts`의 표로 차트를 고른다. 축은 하나이고 표 대체는 필수다.
- 부품은 `docs list`에 있는 것만 쓴다. 없는 컴포넌트를 서비스에서 새로 만들지 않는다. 가장 가까운 기존 컴포넌트 조합으로 두고 `references/request.md`대로 요청을 남긴다.
- 가이드에 나오는 `@terracelab/trellis-blocks`(화면 블록 · `Page` · `ExportButton`)와 `pnpm ds:*` 명령은 Trellis 저장소를 git 하위 모듈로 넣은 서비스의 것이다. 이 서비스에는 없다. 화면 바깥 여백은 시작 화면의 CSS처럼 토큰으로 잡고, 내보내기는 `downloadCsv`를 쓴다.

## 2. 구현 규칙

- 값은 `--tl-*` 변수나 `@terracelab/trellis-tokens`의 TS 객체만 쓴다. raw hex · px(0 제외) · font-family 리터럴은 쓰지 않는다. doctor가 대신 쓸 토큰 후보를 알려 준다.
- semantic 토큰만 쓴다(`--tl-color-bg-surface`). primitive(`--tl-color-brand-500`)를 직접 참조하지 않는다.
- props는 문서의 Props 표 그대로 쓴다. 이벤트는 `onPress` · `onChange` · `onOpenChange`다. `className` · `style`로 컴포넌트 안쪽을 덮지 않는다.
- 상태 어휘 7개(default · hover · active · focus · disabled · loading · error), 결재 5개(기안 · 진행 · 승인 · 반려 · 회수), 수입 빨강 · 지출 파랑은 고정이다. 금액은 원 단위 · 천 단위 구분 · 오른쪽 정렬이고 `formatAmount`로 만든다.
- 왼쪽 강조 띠, 카운트 알약, 색 바탕 배너, 줄마다 색 알약을 만들지 않는다. Trellis에 있는 부품을 손으로 다시 짜지 않는다. 둘 다 `references/do-dont.md`의 표에 대응이 있다.
- 회사 색은 `TrellisProvider theme={{ brand: '#RRGGBB' }}`로 입힌다. `--tl-color-brand-*`를 직접 덮지 않는다.
- 화면 문구는 `docs guide content`를 따른다. 느낌표 · 과장 · 비유 없이 무엇을 하는지 쓴다. 에이전트 화면 문구에 모델 · 공급사 이름을 쓰지 않는다.

## 3. 검증

- `npx @terracelab/trellis-skill doctor` 통과. `!` 경고도 읽고 처리한다.
- 서비스의 타입 검사 · 린트 · 빌드를 돌린다. 명령은 서비스 package.json의 scripts에 있다.
- 화면이 보이는 작업이면 개발 서버를 띄워 1440 · 390 두 폭에서 라이트 · 다크로 본다. 다크는 `<html data-theme="dark">`다. 가로 넘침과 콘솔 오류가 없어야 한다. 불러오는 중 · 빈 상태 · 오류도 한 번씩 본다.

## 4. 보고

무엇을 어떤 컴포넌트로 만들었나, 새로 드러난 요구(없는 컴포넌트 · 토큰)와 `.trellis/requests.md`에 남긴 요청, doctor 결과, 스크린샷. 추측한 데이터 · 문구는 따로 적는다.
