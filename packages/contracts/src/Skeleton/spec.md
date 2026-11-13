# Skeleton
## 용도
내용을 불러오는 동안 올 자리의 모양을 보여 줄 때 쓴다. 1초 안에 끝나는 동작은 Spinner, 끝을 아는 긴 작업은 Progress.
## 해부(Anatomy)
root · line(text일 때 줄마다, 높이 `space.12`, 줄 간격 `density.body-line-height`) · block(`bg.sunken` 바탕, 반경 text `radius.xs` · rect `radius.md` · circle full). 반짝임은 `bg.sunken`과 `bg.surface` 사이를 지나는 띠.
## Props
contract 표.
## Variants
낱개 shape 3(text · rect · circle): text는 lines로 줄 수, 마지막 줄은 60%. 묶음 shape 4(PR-27): list(둥근 사각 아바타 + 두 줄, 행 높이 `density.row.heightTall`) · table(머리 + lines행 × columns열, 첫 열 넓게) · kpi(이름 · 큰 숫자 · 비교 줄, 카드 테두리) · card(제목 + lines 글줄, 카드 테두리). 화면은 내용과 같은 묶음을 고른다(표 화면 = table, 사람 목록 = list, 숫자 줄 = kpi).
## States
loading(이 컴포넌트 자체가 불러오는 중의 표현이다).
## 동작
처음 `duration.normal`(150ms) 동안은 보이지 않다가 나타난다. 앱은 불러오기 시작과 함께 바로 그리고, 빠른 응답에는 깜빡이지 않는다. immediate면 지연 없이 보인다(스토리 · 문서). width · height는 CSS 길이 글자(100% · 40% · var(--tl-space-64))로 받는다. 값은 토큰 변수나 퍼센트로 넘긴다. 기본은 text · rect 폭 100%, rect 높이 64, circle 32. circle은 height가 없으면 width와 같다. 실제 내용과 같은 크기로 두어 다 불러온 뒤 화면이 밀리지 않게 한다.
## 접근성
`aria-hidden`. 불러오는 영역의 부모가 `aria-busy="true"`를 갖고, 다 불러오면 지운다. `prefers-reduced-motion`이면 반짝임을 멈추고 고정된 바탕만 보인다.
## 밀도
text 줄 간격은 `density.body-line-height`를 따른다.
## 플랫폼 차이
네이티브 반짝임은 Animated, 접근성 설정의 동작 줄이기를 따른다.
## 금지 사항
불러오기가 끝난 뒤에도 남겨 두기 · 실제 내용과 다른 모양 · 오류를 스켈레톤으로 숨기기 → 리뷰.
## 스토리
Shapes · ListPlaceholder · ListShape · TableShape · CardShapes.
## 참고
KpiCard loading, ChartCard loading.
