# CheckboxGroup
## 용도
한 라벨 아래 선택지 여러 개를 켜고 끈다(4대보험 취득 대상 · 법인 범위 · 퇴사 처리 목록 · 판매 채널 · 캘린더 표시). 하나만 고르면 RadioGroup, 목록 필터처럼 자리가 좁으면 MultiSelect, 설명이 긴 선택지는 SelectableCard.
## 해부(Anatomy)
root(group) · all(선택. 맨 위 한 줄 전체 선택 Checkbox, 일부만 고르면 indeterminate) · options(Checkbox 목록. 상자 · 라벨 · 설명은 Checkbox 그대로) · dot(선택. 라벨 앞 색 점 8, `color.chart.*` · `status.*` 슬롯, 꾸밈. 캘린더 · 범주 범례, R-T58) · meta(선택. 줄 끝 보조 정보, `fg.secondary`, 숫자는 `font.numeric`, 링크는 `fg.link`. 라벨 밖) · spinner(저장 중인 선택지의 라벨 오른쪽 Spinner 16, `fg.secondary`) · more("n개 더 보기" · "접기" 글자 단추, `fg.link`, `type.label`).
## Props
contract 표.
## Variants
orientation vertical(설명이 있을 때) · horizontal(짧은 라벨, 좁으면 줄을 넘긴다). selectAll 유무(라벨 글자 또는 true = "전체"). maxVisible 유무. meta 유무(vertical이면 줄이 묶음 폭을 채우고 meta가 줄 끝에, horizontal이면 라벨 바로 뒤). pending(바로 저장).
## States
default · hover(상자 `border.focus`) · focus(상자 링) · disabled(묶음 전체 또는 선택지 하나, `fg.disabled`) · loading(pending의 선택지 하나씩: 라벨 오른쪽 Spinner, `aria-busy`, 읽기 전용, 줄에 `data-state="loading"`) · error(Field 오류면 상자마다 `status.danger.default` 테두리 + `aria-invalid`). active는 해당 없음.
## 동작
선택지는 Checkbox다. 라벨이나 상자를 누르거나 Space로 켜고 끈다. Tab은 상자마다 멈춘다. onChange는 옵션 순서로 정렬한 배열을 넘긴다. 옵션에 없는 값이 value에 있으면 뒤에 그대로 둔다.

| 키 | 동작 |
| --- | --- |
| Tab | 다음 상자(더 보기 단추 포함) |
| Space | 포커스한 상자를 켜고 끈다 |
| Enter | 더 보기 단추를 펼치고 접는다 |

selectAll을 주면 배치와 관계없이 맨 위 한 줄에 전체 선택이 생긴다. 라벨은 selectAll 글자("법인 전체"), true면 "전체"다. 고를 수 있는 선택지가 모두 켜졌으면 체크, 일부면 가운데 줄이다. 누르면 고를 수 있는 선택지를 모두 켜거나 끈다. 비활성 선택지의 값은 바꾸지 않는다.

maxVisible보다 선택지가 많으면 처음 maxVisible개만 보이고 "n개 더 보기"로 펼친다. 숨은 선택지도 폼 제출 값은 그대로 낸다.

onChange 둘째 인자 change는 이번에 바뀐 것이다. `values`는 바뀐 선택지 값(옵션 순서)이고 `checked`는 바뀐 뒤 상태다. 하나를 누르면 그 하나, 전체 선택을 누르면 상태가 바뀐 선택지 전부다. 첫 인자(전체 배열)만 받는 기존 코드는 그대로 동작한다.

바로 저장: 바꾸면 바로 서버에 저장하는 화면은 change로 무엇을 보낼지 알고, 저장하는 동안 그 값을 pending에 넣는다. pending의 선택지는 loading이다. 라벨 오른쪽에 Spinner(숨은 글자 "저장 중")가 서고, 상자는 `aria-busy="true"`와 읽기 전용(`aria-readonly`)이 되어 끝날 때까지 누르거나 Space로 바꿀 수 없다. disabled와 달리 포커스는 그 자리에 남는다. 고를 수 있는 선택지 중 하나라도 저장 중이면 전체 선택도 loading이다(누르면 저장 중인 값과 부딪친다). 실패하면 앱이 value를 되돌리고 Toast로 알린다. 혼자 있는 설정 하나를 바로 저장하는 것은 Switch다(Checkbox 금지 사항 그대로). 바로 저장은 선택지 묶음에만 둔다.

meta는 줄 끝 보조 정보(건수 · 배지 · 링크)다. 라벨 밖에 놓여 링크를 눌러도 상자가 바뀌지 않고, 상자의 `aria-describedby`로 읽힌다. vertical이면 줄이 묶음 폭을 채우고 meta가 줄 끝에 서며, horizontal이면 라벨 바로 뒤에 붙는다. 첫 줄 글자 높이에 맞춘다.

value를 주면 제어, defaultValue면 비제어다. name을 주면 켜진 선택지마다 같은 이름으로 값을 제출한다. `useTrellisForm`의 `form.bind(name)`을 그대로 넘긴다(값은 배열).
## 접근성
`role="group"`. Field 안이면 Field 라벨이 `aria-labelledby`로 묶음 이름이 되고, 밖이면 label prop이 `aria-label`이 된다. Field의 도움말 · 오류가 묶음의 `aria-describedby`다. 필수(required prop 또는 Field required)는 묶음의 뜻(하나 이상)이라 상자마다 `required`를 걸지 않는다. `role="group"`에는 `aria-required`가 없으므로 Field 안이면 Field 라벨의 "(필수)", 밖이면 label 뒤에 붙인 "(필수)"가 이름에 들어간다. 루트에는 `data-required`가 붙는다. 하나 이상 골랐는지는 앱(스키마)이 검사한다. 안의 Checkbox는 Field id를 가져가지 않고 자기 id를 갖는다. 오류 요약에서 묶음으로 오면 첫 상자로 포커스를 넘긴다. 저장 중인 상자는 `aria-busy="true"` · `aria-readonly="true"`이고, Spinner의 `role="status"`가 "저장 중"을 읽는다. 상자를 끄지 않아서(disabled 아님) 누른 뒤에도 포커스가 그 상자에 남는다. meta는 상자의 설명으로 읽힌다. 더 보기 단추는 `aria-expanded` · `aria-controls`.
## 밀도
상자 16 고정. vertical 줄 사이 `space.8`, horizontal 항목 사이 `space.16`. 휴대폰 폭(touch)은 줄 높이 `density.control-height-md`(40).
## 플랫폼 차이
네이티브는 Pressable 목록이다. 더 보기는 같은 단추다. props는 같다.
## 금지 사항
선택지 하나짜리 묶음(Checkbox) · 표의 행 × 열 권한 매트릭스를 CheckboxGroup으로(표 안 Checkbox) · 전체 선택을 options에 넣기(selectAll) · 라벨 없는 묶음 · div 안에 Checkbox를 쌓아 묶음 이름 없이 쓰기 → 리뷰.
## 스토리
Vertical · Horizontal · ColorDots(색 점 범례, R-T58) · SelectAll · Descriptions · WithError · MaxVisible · WithMeta(줄 끝 정보) · ImmediateSave(바로 저장 · pending) · States.
## 참고
PR-08 · 서비스 요청 R-27(4대보험 취득 대상 · 사용자 초대 법인 범위 · 퇴사 처리 목록) · R-35(줄 끝 정보 · 바로 저장). 블록의 Checkbox 묶음(캘린더 표시 · 쿠폰 채널 · 상품 옵션 값 · 판매 채널 · 신고 전 확인)을 대신한다.
