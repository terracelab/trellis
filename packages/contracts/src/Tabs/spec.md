# Tabs
## 용도
한 화면 안의 보기를 바꾼다(전체 · 발행 대기 · 전송 실패, 기본 정보 · 품목 · 이력). 화면 이동은 SideNav.
## 해부(Anatomy)
list(아래 `border.divider`) · tab(`type.h3` 16 600, 쉬는 탭 `fg.tertiary`, 높이 `control-height-lg` + 8, 탭 사이 16. 선택은 `fg.primary` 700 + 아래 2px `fg.primary`. 크기는 아래 밀도 절)(PR-27: 브랜드 색은 사이드바 · 1차 단추에 남기고 탭은 글자 색으로) · count(알약 없이 `type.caption` 500 `fg.secondary` tabular 숫자. 탭마다 회색 알약을 세우지 않는다) · panel.
## Props
contract 표.
## Variants
size 5(xs · sm · md · lg · xl), content 유무(필터형 · 패널형). md · lg는 화면 탭, xs · sm은 카드 · 패널 안 탭, xl은 큰 화면 머리 탭.
## States
default · hover · active · focus · disabled.
## 동작
Base UI Tabs. 화살표로 이동, 이동하면 바로 선택. 탭이 폭을 넘치면 가로로 스크롤되고 넘치는 쪽 끝이 흐려진다(`data-overflow`). 고른 탭이 가려져 있으면 보이게 민다.
## 접근성
`role="tablist" / "tab" / "tabpanel"`, `aria-selected`.
## 밀도
탭 높이 · 글자: xs `control-height-sm` · `type.caption`, sm `control-height-md` · `type.label`, md · lg `control-height-lg` + `space.8` · `type.h3`, xl `control-height-xl` + `space.8` · `type.h2`. 탭 사이 xs 8 · sm 12 · md · lg 16 · xl 20.
## 플랫폼 차이
네이티브는 가로 스크롤 탭.
## 금지 사항
탭 안의 탭 · 탭 7개 초과(Select로).
## 스토리
Filter · Panels · Count.
## 참고
Base UI Tabs.
