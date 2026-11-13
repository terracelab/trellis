# AmountBreakdown
## 용도
"항목 + 항목 − 항목 = 합계"처럼 금액이 어떻게 나왔는지 줄 단위로 보여 줄 때 쓴다(실지급액 · 공급가액 · 세액 · 합계 · 정산 금액). 입력 폼 옆에서 고치는 값이 결과에 어떻게 들어가는지 보일 때도 쓴다. 금액 표 여러 줄은 DataGrid, 단계별 막대 그림은 WaterfallChart, 숫자 하나는 KpiCard.
## 해부(Anatomy)
root(`bg.surface`) · head(제목 `type.label` 600 `fg.primary` · 단위 "단위 원" `type.caption` `fg.tertiary` · 상태) · row(기호 칸 · 라벨 · 근거 · 금액, 줄 사이 `space.4`) · op(+ · − · =, `fg.tertiary`, 고정폭 칸) · label(`density.body-font-size` `fg.primary`) · hint(`type.caption` `fg.tertiary`) · amount(오른쪽 정렬, tabular, `fg.strong`) · total(위 선 `border.default` 1px, 라벨 600 · 금액 `type.amount-lg`) · status(계산 중 Spinner · "14:32 기준" · 오류 아이콘 `status.danger.default` + 다시 계산).
## Props
contract 표.
## Variants
title · unit · status의 유무로 머리가 바뀐다. 셋 다 없으면 머리를 그리지 않는다. op '='인 줄이 합계 줄이다. activeKey 줄은 바탕이 `brand.tint`로 한 단계 올라간다(왼쪽 띠는 쓰지 않는다, D-57).
## States
default · loading(금액 자리마다 Skeleton, 라벨은 그대로, `aria-busy`) · error(status error: 머리에 "계산하지 못했습니다" + 다시 계산 단추, `data-state="error"`). calculating은 머리의 Spinner + "계산 중"이고 금액은 지난 값을 그대로 둔다. hover · active · focus · disabled는 해당 없음(다시 계산 단추는 Button 상태를 따른다).
## 동작
금액은 `formatAmount`로만 쓴다(천 단위, 음수 U+2212). 빼는 줄은 value를 크기(양수)로 넘기고 op '−'로 뺀다. 첫 줄은 기호를 비운다. 단위는 칸마다 붙이지 않고 머리에 한 번 "단위 원"으로 쓴다(원칙 3). 합계 줄의 값과 앞 줄을 더하고 뺀 값이 다르면 개발 모드에서 경고한다. status updated는 updatedAt을 "{시각} 기준"으로 보인다. 다시 계산 단추는 onRecalculate가 있을 때만 생긴다.
## 접근성
root는 `role="group"`, 이름은 title(없으면 "금액 계산"). 줄은 `dl`(라벨 = `dt`, 금액 = `dd`). 기호 글자는 꾸밈(aria-hidden)이고 숨은 글자 "더하기 · 빼기 · 계산 결과"가 대신 읽힌다. 상태 글자는 `aria-live="polite"`라 계산 중 · 기준 시각 · 오류가 바뀌면 읽힌다. 금액 대비는 `fg.strong` · `fg.primary`로 4.5:1 이상.
## 밀도
줄 높이는 글줄 높이 + `space.4` 위아래. 글자는 `density.body-font-size`를 따른다. 합계 금액은 `type.amount-lg`로 밀도와 관계없다. 휴대폰에서도 한 줄(라벨 왼쪽 · 금액 오른쪽)이고 근거는 라벨 아래로 내려간다.
## 플랫폼 차이
네이티브는 같은 줄 구성을 View 행으로 그리고 기호 숨은 글자는 accessibilityLabel로 붙인다.
## 금지 사항
금액 칸마다 "원" 붙이기 · 빼기를 음수 값과 '−' 기호로 두 번 빼기 · 합계 줄을 색 바탕 띠로 강조 · 활성 줄에 왼쪽 띠(D-57) · 문자열 템플릿으로 쉼표 찍기 → 리뷰.
## 스토리
Payroll · TaxInvoice · States.
## 참고
content.md §4(금액 · 단위), 원칙 3(단위는 표 머리에 한 번), Payslip, WaterfallChart.
