# Textarea
## 용도
여러 줄 글자 입력(적요 · 반려 사유 · 비고). 한 줄이면 Input.
## 해부(Anatomy)
root(Input과 같은 `bg.surface` · `border.default` · `radius.md`) · control(`density.body-font-size` · `density.body-line-height`) · count(`type.caption`, `fg.tertiary`, 오른쪽 아래).
## Props
contract 표.
## Variants
resize vertical · none. maxLength가 있으면 글자 수 표시.
## States
default · hover(`border.strong`) · focus(`border.focus` + 링) · disabled(`bg.sunken`, `fg.disabled`) · error(`status.danger.default` 테두리). 읽기 전용은 disabled와 같은 바탕에 글자는 `fg.primary`. 글자 수가 한도에 닿으면 count가 `fg.secondary`. active · loading은 해당 없음.
## 동작
Enter는 줄바꿈이다(폼 제출 아님). maxLength를 넘겨 입력할 수 없다. 높이는 rows로 시작하고 resize vertical이면 사용자가 늘린다. value를 주면 제어, defaultValue면 비제어.
## 접근성
`<textarea>`. Field 안에서는 라벨 · 설명 · 오류가 자동 연결되고, 글자 수도 `aria-describedby`에 이어 읽는다. 대비는 `fg.primary` / `bg.surface` 4.5:1 이상. 포커스 링은 root에 항상 보인다.
## 밀도
글자 `density.body-font-size`, 줄 높이 `density.body-line-height`, 안쪽 여백 `space.4`(세로) · `space.8`(가로).
## 플랫폼 차이
네이티브는 multiline TextInput, resize 없음(내용에 따라 늘어남).
## 금지 사항
한 줄 값(거래처명 · 금액)을 Textarea로 · placeholder를 라벨 대신 · 글자 수 한도를 오류 문구 없이 자르기 → 리뷰.
## 스토리
Default · Count · Error · Disabled · ReadOnly.
## 참고
content.md §5 도움말 · 오류 문구.
