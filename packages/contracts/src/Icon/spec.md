# Icon
## 용도
버튼 · 메뉴 · 상태 옆의 라인 아이콘. 모듈 앱 아이콘(타일)은 ModuleIcon을 쓴다.
## 해부(Anatomy)
svg(24 viewBox, stroke `currentColor` 1.5, 채움 없음). 색은 글자 색을 따른다.
## Props
contract 표.
## Variants
size 16 · 20 · 24.
## States
default.
## 동작
이름은 `@terracelab/trellis-icons`의 `ICON_NAMES`(Lucide에서 생성)만. 없는 이름은 타입 오류.
## 접근성
label이 없으면 `aria-hidden`. 아이콘만 있는 버튼은 IconButton의 label이 이름이 된다.
## 밀도
크기는 밀도와 무관. compact에서도 16. 크기는 토큰 `size.icon.16` · `20` · `24`가 정한다(`data-size`, 우선도 0인 `:where` 규칙, R-37). 앱이 글자 크기 모드에서 이 토큰을 키우면 아이콘도 커진다. 컴포넌트가 따로 정한 크기(MultiSelect 상자 안 75% 등)는 그대로 이긴다. width · height 속성은 CSS가 없을 때를 위해 남긴다(기본 토큰 값과 같아 화면은 그대로).
## 플랫폼 차이
네이티브는 react-native-svg로 같은 데이터를 그린다.
## 금지 사항
Lucide를 직접 import(어댑터 1곳 원칙) · 아이콘에 상태 색 칠하기(상태는 Badge · StatusDot).
## 스토리
Sizes · InButton.
## 참고
Lucide(ISC).
