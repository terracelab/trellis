# ModuleIcon
## 용도
업무 모듈(회계 · 메일 · 재고 …) 하나를 앱 아이콘 타일로 보여 줄 때 쓴다. 런처 · 즐겨찾기 · 알림 카드 · 사이드바 머리에 쓰고, 일반 UI 아이콘은 Icon.
## 해부(Anatomy)
root(정사각, `size.module-icon-32/40/48`, 반경 22%) · tile(일러스트 SVG, `@terracelab/trellis-icons/module-tiles`) 또는 fallback(`color.module.<group>.gradient-from → gradient-to` 세로 그라데이션 + 모듈 Lucide 아이콘 `fg.inverse`, 타일의 56%).
## Props
contract 표.
## Variants
size 3 × 그림 2(일러스트 타일 · 생성형 폴백). 어떤 그림을 쓸지는 모듈 id가 정한다.
## States
default.
## 동작
`moduleTileByModule[module]`이 있으면 그 일러스트를, 없으면 modules.json의 그룹 색과 아이콘으로 폴백을 그린다(D-36). 일러스트의 SVG id는 인스턴스마다 접두를 붙여 한 화면에 같은 모듈이 여러 번 있어도 그라데이션이 겹치지 않는다. 모르는 모듈 id면 회색 격자 아이콘을 그리고 개발 모드에서 경고한다.
## 접근성
`role="img"` + `aria-label`(기본 modules.json 라벨). 옆에 모듈 이름 글자가 있으면 `decorative`로 숨긴다. 일러스트 안의 `<title>`은 지우고 바깥 라벨 하나만 읽힌다.
## 밀도
크기는 밀도와 무관하다. 사이드바 즐겨찾기 32, 알림 카드 40, 런처 48.
## 플랫폼 차이
네이티브는 react-native-svg로 같은 타일을 그린다. props는 같다.
## 금지 사항
타일 안에 카운트 넣기(카운트는 카드 · 배지 쪽) · 그룹 색 대신 임의 색 · 타사 앱 아이콘 → 리뷰.
## 스토리
Tiles · Fallback · Sizes.
## 참고
D-36(모듈 앱 아이콘), components.md §7 모듈 레지스트리.
