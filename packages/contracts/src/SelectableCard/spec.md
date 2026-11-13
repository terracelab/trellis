# SelectableCard
## 용도
설명이 필요한 선택지를 큰 카드로 보여 주고 하나 또는 여러 개를 고른다(배송 방법 · 요금제 · 알림 받을 곳 · 목록에서 상세를 볼 항목). 짧은 라벨 2~5개는 RadioGroup · CheckboxGroup, 보기 전환은 SegmentedControl.
## 해부(Anatomy)
root(radiogroup 또는 group, 폭으로 열 수를 정하는 container) · grid(`space.12` 간격) · card(`bg.surface`, `border.default` 1px, `radius.lg`, 안쪽 여백 `density.card-padding`) · icon(20, `fg.secondary`. 색 견본 · 로고 요소도 된다) · title(`density.body-font-size`, 600) · meta(제목 줄 오른쪽, `type.label`, `fg.secondary`) · check(16 원. 고르면 `brand.default` 바탕 + `fg.inverse` 체크. multiple은 늘 보이는 네모 상자) · description(`type.label`, `fg.secondary`) · content(설명 아래 수치 · 진행률).
## Props
contract 표.
## Variants
mode single(radio) · multiple(checkbox). columns auto · 1 · 2 · 3 · 4. 아이콘 · meta · 설명 · content는 있을 때만 그린다.
## States
default(`border.default`) · hover(`border.strong`) · focus(카드에 포커스 링) · 고름(1px `brand.default` 테두리 전체 + 체크. 바탕은 바꾸지 않는다) · disabled(묶음 전체 또는 카드 하나, `bg.sunken` + `fg.disabled`) · error(Field 오류면 고르지 않은 카드 테두리 `status.danger.default`). active · loading은 해당 없음.
## 동작
single은 radio처럼 움직인다. Tab으로 묶음에 들어오면 고른 카드(없으면 첫 카드)에 포커스가 가고, 화살표 키로 옮기면서 바로 고른다. 끝에서 처음으로 돈다. 비활성 카드는 건너뛴다. 한 번 고르면 끌 수 없다.

multiple은 checkbox처럼 움직인다. 카드마다 Tab 순서에 있고 Space로 켜고 끈다. onChange는 옵션 순서로 정렬한 배열을 넘긴다.

| 키 | 동작 |
| --- | --- |
| Tab | 묶음 안팎으로 이동(multiple은 카드마다) |
| ArrowUp · ArrowLeft | single: 앞 카드로 옮기고 고른다 |
| ArrowDown · ArrowRight | single: 다음 카드로 옮기고 고른다 |
| Space · Enter | 포커스한 카드를 고른다(multiple은 켜고 끈다) |

카드 전체를 눌러 고른다. value를 주면 제어, defaultValue면 비제어다. name을 주면 숨은 input으로 고른 값을 제출한다(multiple은 값마다 하나). `useTrellisForm`의 `form.bind(name)`을 그대로 넘긴다.

열 수는 묶음 폭으로 줄어든다. 4열은 폭 880 미만에서 2열, 3열은 680 미만에서 2열, 420 미만이면 모두 한 열이다(휴대폰).
## 접근성
single은 `role="radiogroup"` + 카드마다 `role="radio"`, multiple은 `role="group"` + 카드마다 `role="checkbox"`. 카드 이름은 제목(`aria-labelledby`)이고 meta · 설명 · content가 `aria-describedby`가 된다. Field 안이면 Field 라벨이 묶음 이름이 되고, 밖이면 label prop이 `aria-label`이 된다. single은 필수 · 오류를 묶음의 `aria-required` · `aria-invalid`로, multiple은 오류를 카드마다 `aria-invalid`로 알린다. 오류 요약에서 묶음으로 오면 고른 카드(없으면 첫 카드)로 포커스를 넘긴다. 고른 상태는 테두리색만이 아니라 체크 모양과 `aria-checked`로도 알린다. 포커스 링은 카드에 항상 보인다.
## 밀도
안쪽 여백 `density.card-padding`, 제목 `density.body-font-size`. 카드 사이 `space.12`. 휴대폰 폭(touch)은 카드 높이 `density.control-height-lg` 이상.
## 플랫폼 차이
네이티브는 Pressable 카드 목록이다. 화살표 키 대신 카드를 누른다. props는 같다.
## 금지 사항
카드 왼쪽 굵은 색 띠나 칠한 바탕으로 고른 것 표시(D-57) · content 안에 단추 · 링크 같은 누르는 요소 · 짧은 라벨만 있는 선택지를 카드로(RadioGroup · CheckboxGroup) · 고를 수 없는 정보 카드를 SelectableCard로(Card) → 리뷰. 왼쪽 띠는 블록에서 `check-blocks.mjs`가 막는다.
## 스토리
Single · Multiple · WithContent · States.
## 참고
PR-08. 블록의 채널 카드 · 작업지시 카드 · 입고 카드 · 완제품 카드 · 컬러칩을 대신한다. 벤치마크는 구조만.
