# ScanField
## 용도
바코드 · QR 스캐너 입력(입고 검수 · 피킹 · 재고 실사). 키보드 웨지 스캐너는 글자를 치고 Enter로 끝낸다.
## 해부(Anatomy)
label · root(Input 모양, 높이 `density.control-height-lg`) · scan icon · control · 상태 줄(대기 점 · "스캔 대기 중") · recent(최근 스캔 칩).
## Props
contract 표.
## Variants
size 5(xs · sm · md · lg · xl), recent 유무.
## States
default · focus(대기 점이 움직인다, reduced-motion이면 멈춤) · disabled.
## 동작
Enter면 onScan(code)을 부르고 칸을 비운다. keepFocus면 포커스를 잃고 2초 안에 다른 입력을 시작하지 않을 때 다시 가져온다(트렌치 환경 · 장갑 손). 한글 입력 중 Enter는 무시한다.
## 접근성
`<label for>`, 스캔 결과는 `aria-live="polite"`로 읽는다.
## 밀도
스캔 칸은 같은 size의 다른 칸보다 한 단계 크다. xs `control-height-xs` · sm `control-height-sm` · md `control-height-lg` · lg `control-height-lg` + `space.8` · xl `control-height-xl` + `space.8`(compact 26 · 30 · 42 · 50 · 56). 현장 화면은 lg. board 밀도(트랙 E)에서는 56.
## 플랫폼 차이
네이티브는 카메라 스캔 버튼이 붙는다(expo-camera).
## 금지 사항
스캔 칸에 placeholder만 두고 라벨 생략 · 포커스를 다른 칸이 쓰는 중에 빼앗기.
## 스토리
Default · Recent · Disabled.
## 참고
트랙 E 2.5 · 2.9 스캐너 규칙.
