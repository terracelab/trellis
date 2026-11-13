# Pagination
## 용도
표 · 목록의 페이지를 옮긴다. DataGrid 아래에 둔다. 끝없이 이어 붙이는 목록(알림 · 대화)에는 쓰지 않는다.
## 해부(Anatomy)
root(`tl-pagination`, `<nav>`) · total(`type.label` `fg.secondary`, 숫자 tabular) · first · prev · page(정사각 `density.control-height-md`, `radius.md`) · ellipsis(`fg.tertiary`) · next · last · size(Select sm, "20건씩"). 현재 페이지는 `brand.subtle` 바탕 + `fg.link` 글자 600.
## Props
contract 표.
## Variants
total 표시 · 페이지 크기 선택 유무. 페이지 번호는 최대 7칸이고 넘치면 생략(…)을 넣는다(1 … 4 5 6 … 62).
## States
default · hover(`bg.sunken`) · active(`bg.sunken`) · focus(포커스 링) · disabled(첫 · 끝에서 이전 · 다음, `disabled` prop이면 전부 `fg.disabled`). loading · error는 해당 없음.
## 동작
번호를 누르면 `onPageChange(n)`. 현재 페이지를 다시 누르면 부르지 않는다. pageCount가 없으면 `ceil(total ÷ pageSize)`. 페이지 크기를 바꾸면 `onPageSizeChange(size)`를 부르고 페이지를 1로 돌리는 것은 화면이 한다. 키보드는 Tab으로 버튼 사이를 옮긴다. 휴대폰(`breakpoint.sm` 미만)은 번호 단추와 첫 · 마지막 대신 이전 · "3 / 12" · 다음만 보인다(D-61).

| 키 | 동작 |
| --- | --- |
| Tab | 다음 버튼 |
| Enter · Space | 그 페이지로 |
## 접근성
`<nav aria-label="페이지">`, 현재 페이지에 `aria-current="page"`. 번호 버튼 이름은 "3페이지", 화살표는 첫 · 이전 · 다음 · 마지막 페이지. 총 건수는 글자로 읽힌다. 현재 표시는 색 + 굵기로 구분한다.
## 밀도
버튼 `density.control-height-md`(compact 28 · comfortable 32).
## 플랫폼 차이
네이티브는 이전 · 다음 + "3 / 62" 표기(번호 목록 없음). props는 같다.
## 금지 사항
페이지 번호 8칸 이상 · 총 건수를 문자열로 직접 만들기(formatQuantity) · 페이지를 0부터 세기 — 리뷰.
## 스토리
Default · Few · Many · PageSize · Disabled.
## 참고
components.md §10 ListDetail.
