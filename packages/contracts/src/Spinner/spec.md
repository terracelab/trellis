# Spinner
## 용도
짧은 기다림(1초 안팎)을 버튼 · 칸 안에서 알린다. 화면 전체나 표의 첫 로딩은 Skeleton을 쓴다.
## 해부(Anatomy)
원 테두리(`border.default`) 위에 4분의 1 호(`currentColor`)가 돈다.
## Props
contract 표.
## Variants
size 16 · 20 · 24.
## States
loading.
## 동작
reduced-motion이면 회전 대신 천천히 깜박인다.
## 접근성
`role="status"`와 숨긴 문구.
## 밀도
크기는 밀도와 무관.
## 플랫폼 차이
네이티브는 ActivityIndicator.
## 금지 사항
1초 넘게 걸리는 화면 전체 로딩에 쓰기.
## 스토리
Sizes · InButton.
## 참고
—
