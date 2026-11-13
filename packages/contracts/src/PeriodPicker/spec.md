# PeriodPicker
## 용도
조회 기간을 프리셋이나 시작일 · 종료일로 고른다(전표 조회 · 매출 현황 · 부가세 신고). 대시보드처럼 비교 기간이 필요하면 compare로 직전 기간 · 전년 동기 · 직접 선택을 함께 고른다. 날짜 하나는 DateField.
## 해부(Anatomy)
trigger(Select와 같은 테두리 · 높이, calendar 아이콘 + `formatPeriod` 값 + chevron) · popup(`bg.elevated`, `border.default`, `shadow.md`, `radius.md`, `z.dropdown`) · presets(왼쪽 목록, 항목 높이 `density.row-height`, 선택 `brand.subtle` 바탕) · dates(시작일 ~ 종료일 글자 칸, DateField와 같은 칸) · calendar(기간 모드: 첫날 · 끝날 `brand.default` 채움, 가운데 `bg.sunken` 띠) · error(`type.caption`, 아이콘 `status.danger.default`) · warning(maxDays를 넘을 때, `type.caption`, 아이콘 `status.warning.default`) · days(고른 일수 "30일", `type.caption` `fg.secondary`, 적용 왼쪽) · apply(primary Button 적용) · compare(compare를 줄 때만: 팝업 아래 줄, 위 `border.divider`. 이름 "비교" `type.caption` `fg.secondary` + 방식 단추 줄(안 함 · 직전 기간 · 전년 동기 · 직접 선택, 프리셋과 같은 선택 모양) + 비교 기간 글자 `fg.secondary` tabular, 직접 선택이면 비교 시작일 ~ 비교 종료일 글자 칸) · trigger compare(트리거 값 뒤 "비교 2026-10-01~10-31" `type.caption` `fg.secondary`, 좁으면 말줄임). 좁은 화면: sheet(제목 "기간 선택") · presets(감싸는 버튼 줄, 높이 `space.40`) · dates · calendar · footer(일수 "6일" + "2026-11-01~11-06 적용").
## Props
contract 표.
## Variants
size 5(xs · sm · md · lg · xl). presets로 목록 구성(당일 · 금주 · 당월 · 전월 · 당분기 · 부가세 1기 · 부가세 2기 · 금년).
## States
default · hover(`border.strong`) · focus(링) · disabled(`bg.sunken`) · error(Field 오류면 `status.danger.default` 테두리). active · loading은 해당 없음.
## 동작
Base UI Popover. 트리거를 누르면 열리고 Escape · 바깥 누름으로 닫힌다. 프리셋을 누르면 그 기간을 바로 적용하고 닫는다. 달력에서 날을 누르면 시작, 한 번 더 누르면 끝이 된다(앞날을 누르면 둘을 바꾼다). 기간이 다 찬 뒤 누르면 새 시작이다. 글자 칸에 쳐도 되고 달력이 그 달로 간다. 적용을 누르면 반영한다. 종료일이 시작일보다 앞이면 오류 문구를 보이고 적용을 막는다. 주는 월요일에 시작하고, 부가세 1기는 1월 1일~6월 30일, 2기는 7월 1일~12월 31일이다. today를 주면 그날 기준으로 프리셋을 계산하고 달력에 오늘로 표시한다. 폭이 `breakpoint.sm`보다 좁으면 화면 아래 시트로 연다.

일수: 시작일 · 종료일이 다 차면 둘을 모두 센 일수를 적용 단추 왼쪽에 보인다(11-01~11-30 = "30일", messages `periodPicker.days`). 좁은 화면 시트는 아래 줄(footer)에 보인다.

max: 고를 수 있는 마지막 날 'YYYY-MM-DD'. 그 뒤 날은 달력에서 막힌다. 글자 칸에 그 뒤 날을 다 치면 값에 넣지 않고 DateField와 같은 "{max}까지 넣을 수 있습니다" 안내를 보인다. 프리셋 끝은 max로 줄어든다(max가 오늘이면 당월 = 1일~오늘). 시작부터 max 뒤인 프리셋은 비활성이다.

비교 기간(compare · defaultCompare · onCompareChange · compareModes): compare나 defaultCompare를 주면(null 포함) 팝업 아래에 비교 줄이 생긴다. 주지 않으면 지금과 같다. 직전 기간은 같은 길이만큼 바로 앞이고, 1일~달 끝 기간이면 달 수만큼 앞 달들이다(11월 → 10월, 1분기 → 전년 4분기). 전년 동기는 같은 날짜의 1년 전이고 달 끝은 달 끝으로, 2월 29일은 28일로 맞춘다(`resolvePeriodCompare`). 직접 선택은 비교 시작일 · 종료일을 친다. 비교 방식은 적용과 함께 반영한다. 기간을 바꾸면(프리셋 · 적용) 직전 · 전년 동기 비교도 새 기간으로 다시 계산해 onChange 뒤 onCompareChange로 알린다. 직접 고른 비교 기간은 그대로 둔다. 비교 종료일이 시작일보다 앞이면 오류 문구를 보이고 적용을 막는다.

maxDays: 권장 최대 일수(시작일 · 종료일 포함). 넘으면 "{max}일이 넘는 기간입니다. 조회가 오래 걸릴 수 있습니다"(messages `periodPicker.overMaxDays`) 경고 한 줄을 보인다. 적용은 막지 않는다. 막아야 하면 앱이 onChange에서 검사한다.
## 접근성
트리거는 `<button>`이고 Field 라벨이 이름이 된다. Field 밖(필터 바)에서는 label을 주면 "주문일 2026-11-01~11-06"처럼 이름과 기간을 함께 읽는다. popup은 `role="dialog"` + `aria-label="기간 선택"`, 열리면 첫 프리셋에 포커스, 닫히면 트리거로 돌아간다. 현재 기간과 같은 프리셋은 `aria-pressed="true"`. 날짜 칸 이름은 시작일 · 종료일, 달력은 `role="grid"`(DateField와 같다). 좁은 화면 시트도 `role="dialog"` + 제목 "기간 선택". 포커스 링은 항상 보인다. 종료일 역전 · max 뒤 날짜 안내는 `role="alert"`이고 해당 칸에 `aria-describedby`로 잇는다. maxDays 경고는 적용을 막지 않으므로 `role="status"`(polite)다. max 뒤 날 버튼은 `disabled`. 비교 줄은 `role="group"` + 이름 "비교"이고 방식 단추는 `aria-pressed`, 비교 날짜 칸 이름은 비교 시작일 · 비교 종료일이다. Field 밖 트리거 이름에는 비교 기간도 붙는다("주문일 2026-11-01~11-30 비교 2026-10-01~10-31").
## 밀도
트리거 `density.control-height-*`(compact · comfortable 26 · 30 · 36 · 42 · 48, touch 44 · 44 · 48 · 56 · 56, 트리거 글자는 Select와 같다), 프리셋 항목 `density.row-height`, popup 안쪽 여백 `space.12`.
## 플랫폼 차이
네이티브는 바텀시트에 같은 프리셋 목록과 날짜 칸 두 개.
## 금지 사항
기간을 DateField 두 개로 따로 받기(시작 · 끝 검증이 흩어진다) · 프리셋 라벨을 "오늘 · 이번 달"로 바꾸기(content.md §6) · 기간 표기를 직접 만들기(`formatPeriod`) → 리뷰.
## 스토리
Default · VatPeriod · Limits(max · maxDays · 일수) · Compare(비교 기간) · Empty · Disabled.
## 참고
content.md §4 기간 표기, §6 당일 · 당월 · 전월. 부가세 과세 기간(1기 · 2기).
