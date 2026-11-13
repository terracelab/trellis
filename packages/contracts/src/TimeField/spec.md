# TimeField
## 용도
시각 하나(회의 시작 · 출근 시각 · 예약 끝)를 넣을 때 쓴다. 글자로 치거나(930 → 09:30) step 간격(기본 30분) 목록에서 고른다. 날짜는 DateField, 날짜와 기간은 PeriodPicker, 하루의 출퇴근 기록 보기는 TimeClock · WorkTimeline.
## 해부(Anatomy)
root(`tl-time-field`, DateField와 같은 칸: `bg.surface`, `border.strong` 1px, `radius.md`, 높이 `density.control-height-*`) · control(`input` role=combobox, 글자 `density.input-font-size`, tabular) · picker(시계 단추 `clock` 16, `fg.tertiary`, 가리키면 `bg.sunken`) · popup(칸 아래, `bg.elevated` · `border.default` · `shadow.md` · `z.dropdown`, 최대 높이 `space.64` × 4) · option(행 높이 `density.row-height`, 가리킨 행 `bg.sunken`, 지금 값 600 + check `fg.link`) · note(걸리는 시간 `type.caption` `fg.secondary`) · sheet(좁은 화면 아래 시트, `_internal/sheet.tsx`) · 오류 글자(Field 오류 칸 또는 칸 아래).
## Props
contract 표.
## Variants
size 5(xs 26 · sm 30 · md 36 · lg 42 · xl 48). 모양은 DateField와 같다. durationFrom이 있으면 목록 행 끝에 그 시각부터 걸리는 시간("1시간 30분")이 붙는다.
## States
default · hover(테두리 `border.hover`) · focus(테두리 · 1px 링 `border.focus`) · disabled(면 `bg.sunken`, 테두리 없음, 시계 단추 `fg.disabled`) · error(테두리 `status.danger.default`, `aria-invalid`. 형식 · 범위 오류는 컴포넌트가 스스로 찾는다). active · loading은 해당 없음.
## 동작
글자는 칸을 떠날 때(Enter · Tab · 바깥 누름) 읽는다. 9 → 09:00, 930 · 0930 → 09:30, 18:5 → 18:05, 9시 30분 → 09:30(contracts `parseTimeText`). 읽을 수 없으면 "시각은 09:30처럼 넣으세요", min · max 밖이면 "{min}~{max} 사이 시각을 넣으세요"를 보이고 값은 그대로 둔다. 비우면 null. 글자로는 간격 밖 시각(09:10)도 넣는다. 목록 · 화살표만 step을 따른다.

| 키 | 동작 |
| --- | --- |
| ↓ · ↑ | 목록을 열고 지금 값(없으면 친 글자) 가까운 시각을 가리킨다. 열려 있으면 다음 · 앞 시각 |
| Home · End | 목록이 열려 있으면 첫 · 끝 시각 |
| Enter | 가리킨 시각을 고른다. 가리킨 행이 없으면 친 글자를 읽는다 |
| Escape | 목록만 닫는다(대화 상자는 닫지 않는다) |
| Tab | 글자를 읽고 다음 칸으로 |

시계 단추를 누르면 목록이 열리고 초점은 입력 칸에 남는다. 목록을 누르는 동안 칸은 초점을 잃지 않는다. 좁은 화면(`breakpoint.sm` 미만)은 시계 단추가 아래 시트를 열고, 시트는 지금 값에 초점을 두고 연다(D-60). value를 주면 컨트롤드, defaultValue는 언컨트롤드다. 바깥에서 value가 바뀌면 칸 글자도 바뀐다.
## 접근성
입력 칸은 `role="combobox"` + `aria-expanded` · `aria-controls` · `aria-activedescendant`, 목록은 `role="listbox"`(이름 = Field 라벨), 행은 `role="option"` + `aria-selected`(가리킨 행). 시계 단추 이름은 "시각 목록 열기"이고 넓은 화면에서는 탭 순서에서 빠진다(입력 칸이 목록을 다룬다). 오류 글자는 Field 오류 칸이나 칸 아래 `role="alert"`로 읽힌다. 대비: 글자 `fg.primary`, 자리 글자 `fg.tertiary`, 보조 `fg.secondary`(elevated 위 4.5:1).
## 밀도
칸 높이 `density.control-height-*`(touch 44 · 48 · 56), 입력 글자 `density.input-font-size`(touch 16), 목록 행 `density.row-height`, 시트 행 `space.48`.
## 플랫폼 차이
네이티브는 칸을 누르면 아래 시트의 시각 목록(또는 OS 시각 고르기)이 열린다. 글자 입력과 props는 같다.
## 금지 사항
30분 간격 Select를 블록이 직접 만들기 → TimeField · 오전 · 오후 12시간 표기(24시간, content.md §4) · 시각을 Input 글자 그대로 저장하기(형식 검사 없음) → 리뷰.
## 스토리
Meeting · Steps · Typed.
## 참고
SY-14 · PG-42(groupware/calendar/month의 30분 Select). DateField(같은 칸 · 시트 규칙), TagInput(콤보박스 aria-activedescendant), WAI-ARIA APG Combobox(목록 고르기). 벤치마크는 구조만.
