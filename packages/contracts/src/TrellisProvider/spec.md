# TrellisProvider
## 용도
앱 맨 바깥에 한 번 둔다. 컴포넌트 문구 언어(locale)를 고르고, 원하면 `<html>`의 테마 · 밀도 속성을 맞추고, 회사 메인 색 하나로 회사 테마를 입힌다(D-98). 없어도 모든 컴포넌트가 한국어 · 기본 테마(#FE5C2B) 그대로 동작한다(D-65).
## 해부(Anatomy)
감싸는 요소가 없다. locale 컨텍스트만 내려 준다. 범위 지정(`scope` 또는 안쪽 Provider)이고 theme · density가 있으면 `div.tl-theme-scope[data-tl-theme]`(display: contents) 하나로 감싼다. 회사 테마는 `<head>`의 `style[data-tl-theme-style]` 하나다.
## Props
contract 표.
## Variants
locale ko · en. theme: 모드 문자열(`'light' | 'dark'`) 또는 회사 테마 객체(`{ mode, brand, neutral, buttonText }`).
## States
default. 나머지는 해당 없음.
## 동작
locale을 바꾸면 버튼 · 접근성 이름 · 빈 상태 · 오류 문구와 달력 요일이 그 언어로 바뀐다. 숫자 · 금액 · 날짜 서식(원 · 만 · 억 · ISO)은 한국 업무 관습 그대로다. theme · density를 주면 `<html data-theme · data-density>`를 맞추고, 안 주면 앱이 건 속성을 건드리지 않는다. `<html lang>`도 locale에 맞춘다. 바꾼 속성은 Provider가 내려갈 때 원래 값으로 돌린다. Provider 안의 Provider(문서 예시처럼 페이지 일부만 다른 언어)는 문구 언어만 바꾸고 `<html>`은 건드리지 않는다.

회사 테마(D-98): `theme={{ brand: '#hex' }}`를 주면 `@terracelab/trellis-tokens/theme`의 createTheme이 회사 색 토큰 21개를 라이트 · 다크 · 고대비 라이트 · 고대비 다크로 계산해 `<head>`에 넣는다. 색을 바꾸면 새로 고침 없이 바로 바뀌고(회사 설정에서 색을 고르는 쓰임새), Provider가 내려가면 지운다. 같은 입력이면 빌드(`pnpm ds:theme`)가 만든 theme.css와 같은 값이다. 기본 테마(#FE5C2B · cool · white)와 같거나 형식이 틀린 색(입력 중인 글자)이면 아무것도 넣지 않는다. `scope`(또는 안쪽 Provider)면 그 안에만 입히고 `<html>`의 테마 · 밀도는 그대로 둔다(미리보기 · 한 화면). 범위 선택자는 전역 테마보다 우선도가 한 단계 높다.

접근성 모드(D-97, 식자재 ERP 화면 설정과 같은 이름): `fontScale`(글자 112 · 125%) · `contrast`(고대비) · `focusRing`(포커스 강조) · `linkUnderline`(링크 밑줄) · `chartPalette`(색각 친화 차트) · `motion`(움직임 줄이기) · `contentWidth`(본문 최대 너비)는 각각 `data-font-scale` · `data-contrast` · `data-focus` · `data-links` · `data-chart` · `data-motion` · `data-content-width`를 `<html>`(범위 지정이면 감싼 요소)에 건다. 기본값이면 속성을 걸지 않는다. Provider 없이 앱이 속성을 직접 걸어도 같다(Django 호환). `toastDuration`(기본 · 길게 · 직접 닫기)은 그 아래 ToastProvider의 자동 닫힘 시간을 바꾼다(WCAG 2.2.1). 그 부분의 언어는 감싼 요소에 `lang`으로 적는다. 앱 문구(블록 · 화면)는 앱이 정한다.

`navigate`(R-T34)는 앱 라우터의 이동 함수다. 있으면 Link와 PersonLabel `href`의 앱 안 주소(스킴이 없고 `#id`가 아닌 주소)를 a 태그 기본 이동(전체 다시 불러오기) 대신 이 함수로 연다. 왼쪽 단추 누름일 때만이고 Ctrl · Cmd · Shift · Alt · 가운데 단추(새 탭) · `target`이 있는 링크 · 바깥 주소는 브라우저에 맡긴다. 안쪽 Provider가 `navigate`를 주지 않으면 바깥 것을 물려받는다. 없으면 a 태그 그대로라 Provider 없이도 동작한다.
## 접근성
`<html lang>`이 화면 낭독기 발음을 정하므로 locale과 같게 둔다. 컴포넌트가 만드는 aria 이름도 같은 언어가 된다.
## 밀도
해당 없음(density를 주면 html 속성만 바꾼다).
## 플랫폼 차이
네이티브는 같은 props로 테마 · 밀도 객체(`@terracelab/trellis-tokens/native`)와 문구 사전을 내려 준다.
## 금지 사항
문서 전체 Provider를 여러 겹 두기(문서 전체 테마는 하나, 미리보기 · 한 화면은 `scope`) · 회사 색을 CSS 변수로 직접 덮기(엔진을 거치지 않으면 대비 검사가 없다) · 앱 문구를 Trellis 사전에 넣기(사전은 컴포넌트 문구만) → 리뷰.
## 스토리
Korean · English · CompanyTheme(컬러칩을 고르면 범위 안만 바뀜).
## 참고
contracts `_shared/messages.ts`, D-65, 회사 테마 D-97 · D-98, `docs/guides/theme.md`, Link(R-T34).
