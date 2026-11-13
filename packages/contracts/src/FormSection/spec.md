# FormSection
## 용도
폼의 묶음 하나(기본 정보 · 공급받는 자 · 결제 조건). Field를 격자로 놓는다.
## 해부(Anatomy)
`<fieldset>` · legend(title `type.h3`) · description(`type.caption`) · action · grid(열 1 · 2 · 3, 간격 `density.gutter`).
## Props
contract 표.
## Variants
columns 1 · 2 · 3. Field의 span으로 칸을 합친다.
## States
default만. 묶음 자체는 상호작용이 없다. `collapsible`의 접는 단추는 단추 문법(가리킴 · 포커스 링 `tl-focusable`)을 따르고, 접힌 동안 안은 `inert`다.
## 동작
1024 미만에서는 열 수와 무관하게 한 열. **접기**: collapsible이면 제목 줄이 펼침 단추(앞 chevron, 펼치면 90도)가 되고 기본은 접힘이다(defaultOpen · open/onOpenChange). 등록 시트의 선택 항목(메모 · 증빙 · 시리얼 · 업태 · 주소)을 접어 휴대폰에서 저장 단추까지 스크롤을 줄인다. 접혀 있으면 제목 옆에 채운 칸 수("입력 2개", 흐린 글자, 0이면 없음)를 보인다. Field마다 입력 글자 · 체크 · 숨은 입력 값 · `data-filled`(단추 모양 입력) 중 하나라도 있으면 채운 칸이다. 접어도 입력은 그대로 남고(inert로 포커스 · 낭독에서 뺀다) 펼치면 이어서 쓴다. 안에 Field 오류가 새로 생기면(검증 뒤) 저절로 펼쳐 숨은 오류를 남기지 않는다. 사람이 다시 접으면 같은 오류로 또 펼치지 않는다. 펼침은 높이 전환(`duration.200`), reduced-motion이면 바로.
## 접근성
`<fieldset>` + `<legend>`로 묶음 이름을 읽는다. fieldset 이름은 제목(aria-labelledby). 접는 묶음의 제목 단추는 aria-expanded · aria-controls를 갖고 Enter · Space로 펼친다.
## 밀도
격자 간격 `density.gutter`.
## 플랫폼 차이
네이티브는 항상 한 열. 접기는 네이티브 다음 Phase(같은 contract).
## 금지 사항
묶음 안에 묶음.
## 스토리
TwoColumns · WithAction.
## 참고
components.md §10 FormRegister.
