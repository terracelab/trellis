# Checkbox
## 용도
켜고 끄는 선택 하나 또는 목록의 여러 항목 선택. 즉시 적용되는 설정은 Switch, 여럿 중 하나는 RadioGroup.
## 해부(Anatomy)
root · box(16, `radius.xs`, `fg.tertiary` 테두리, `bg.surface`) · indicator(check 또는 minus, `fg.inverse`) · label(`density.body-font-size`, `fg.primary`) · description(`type.caption`, `fg.tertiary`).
선택 · 일부 선택이면 box가 `brand.default` 바탕.
## Props
contract 표.
## Variants
라벨만 · 라벨 + 설명 · 라벨 없음(표 행 선택, 이때는 aria-label).
## States
default · hover(box `border.focus`) · focus(box 링) · disabled(box `bg.sunken`, 라벨 `fg.disabled`) · error(box `status.danger.default` 테두리). 일부 선택은 minus 표시. active · loading은 해당 없음.
## 동작
box와 라벨 어디를 눌러도 바뀐다. Space로 바꾼다(Enter는 폼 제출). checked를 주면 제어, defaultChecked면 비제어. indeterminate는 표시만 바꾸고 다음 클릭은 선택이 된다.
## 접근성
Base UI Checkbox. `role="checkbox"` + `aria-checked`(일부 선택은 mixed). 라벨은 감싼 `<label>`이 이름이 되고, 설명은 `aria-describedby`로 읽는다. box 테두리 `fg.tertiary`는 바탕 대비 3:1 이상. 포커스 링은 box에 항상 보인다. 누르는 자리는 24(WCAG 2.5.8), 보이는 상자는 16이다. 상자는 ::before로 그리고 바깥 여백을 음수로 맞춰 줄 높이 · 글자 자리는 그대로다(R-33).
## 밀도
box 16 고정. 행 높이는 내용에 따른다. box와 라벨 사이 `space.8`.
## 플랫폼 차이
네이티브는 Pressable + 체크 아이콘, 라벨 전체가 누를 수 있는 영역.
## 금지 사항
누르는 즉시 저장되는 설정 하나에 Checkbox(Switch. 선택지 묶음을 바로 저장하면 CheckboxGroup pending) · 라벨 없는 Checkbox에 aria-label도 없음 · 부정형 라벨("알림 받지 않기") → 리뷰.
## 스토리
Default · Indeterminate · Description · Error · Disabled.
## 참고
Base UI Checkbox.
