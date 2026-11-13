# MaskedValue
## 용도
가린 개인정보(주민등록번호 · 계좌번호 · 전화번호 · 주소)를 보이고, 사유를 받은 뒤 잠깐 원문을 보여 줄 때 쓴다. 가린 글자는 contracts `formatRrn` · `maskAccount` · `maskPhone` · `maskName` · `maskAddress`로 만든다. 권한 확인과 열람 기록은 앱이 `onReveal` 안에서 한다. 입력하면서 가리는 칸은 MaskedInput, 항목 전체를 한 번에 여닫는 것은 HrRecord `onRevealChange`.
## 해부(Anatomy)
root(`span`, 글줄 안에 놓인다) · text(가린 글자 · 원문, tabular, `fg.primary`) · toggle(IconButton ghost sm: eye "보기" · eye-off "다시 가리기") · timer(timer 아이콘 + "58초 뒤 가림", `type.caption` `fg.tertiary`) · copy(IconButton copy, 원문이 보일 때만) · lock(자물쇠 아이콘 `fg.tertiary` + 이유 `type.caption` `fg.tertiary`. 이유는 좁은 칸 · 큰 글자에서 줄을 바꾸고 아이콘은 첫 줄에 남는다) · ReasonDialog(사유 입력) · 숨은 알림 영역(`aria-live`).
## Props
contract 표.
## Variants
보기 가능(onReveal 있음 · canReveal) · 잠김(canReveal false: 자물쇠 + 이유) · 읽기 전용(onReveal 없음: 가린 글자만). 원문이 보이는 동안은 남은 시간과 copyable이면 복사 단추가 붙는다.
## States
default · focus(보기 · 복사 단추의 포커스 링) · disabled(canReveal false, 단추 대신 자물쇠). 원문을 불러오는 동안의 loading과 실패한 error는 ReasonDialog 안에 보인다(확인 단추 스피너 · "원문을 불러오지 못했습니다"). hover · active는 IconButton을 따른다.
## 동작
보기 단추를 누르면 ReasonDialog(제목 "{label} 보기", 확인 "원문 보기")가 열린다. 사유를 넣고 확인하면 `onReveal(사유)`를 부르고, 돌려받은 원문을 revealSeconds(기본 60초) 동안 보인다. 남은 시간은 1초마다 줄고 0이 되면 다시 가린다. 다시 가리기 단추로 먼저 가릴 수 있다. 다시 가리면 원문을 메모리에서도 지운다. 컴포넌트가 사라져도 지운다. onReveal이 실패하면 대화 상자가 열린 채 오류 문구가 보인다. 복사는 원문이 보일 때만 되고 "복사했습니다"를 알린다. 보기 · 다시 가리기는 같은 단추라 포커스가 그 자리에 남는다.
## 접근성
보기 단추 이름 "{label} 보기", 다시 가리기 "{label} 다시 가리기", 복사 "{label} 복사". 원문을 보이면 숨은 알림 영역이 "원문을 보입니다. 60초 뒤 다시 가립니다"를, 다시 가리면 "다시 가렸습니다"를 읽는다(`aria-live="polite"`). 1초마다 바뀌는 남은 시간 글자는 알림 영역 밖이라 계속 읽히지 않는다. 가린 글자 ●는 읽히는 그대로다. 잠김 이유는 화면 글자로 보인다.
## 밀도
단추는 IconButton sm(`density.control-height-sm`). 글자는 부모 글줄을 따른다. 표 칸에 넣어도 행 높이가 바뀌지 않는다.
## 플랫폼 차이
네이티브는 같은 단추 구성. 복사는 Clipboard, 알림은 AccessibilityInfo.announceForAccessibility.
## 금지 사항
원문을 props로 받아 화면 안에서만 가리기(가린 글자를 넘긴다) · 사유 없이 원문 보이기 · 원문을 시간 제한 없이 두기 · 권한 확인 · 기록을 컴포넌트에 맡기기 · 가린 글자를 문자열 템플릿으로 직접 만들기 → 리뷰.
## 스토리
Resident · Locked · InRecord · States.
## 참고
ReasonDialog, MaskedInput, HrRecord, content.md §4(주민등록번호 표기), `_shared/format.ts` 가림 함수.
