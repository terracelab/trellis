# Composer
## 용도
대화 · 상담에서 메시지를 쓰고 파일을 붙여 보낸다. 늘어나는 입력 칸 · 첨부 · 보내기를 한 줄에 둔다. 저장하는 긴 글(비고 · 사유)은 Textarea, 파일만 올리는 영역은 FileUpload.
## 해부(Anatomy)
root(`tl-composer`, 둘레 없음: 여백 · 위 선은 놓는 곳이 정한다) · suggestions(추천 질문 SuggestionChips, 입력 위) · files(붙인 파일, Attachment chips + 삭제) · row · attach(IconButton paperclip, 숨은 `<input type="file" multiple>`) · input(`<textarea>`, `bg.surface` · `border.default` · `radius.md`, 글자 `density.input-font-size`, 한 줄 높이 `density.control-height-md`) · count(제한의 80%부터, `type.caption` `fg.tertiary`) · send(primary Button, send 아이콘) · menu(멘션 · 명령 목록, PG-33: 입력 칸 위에 뜨는 `role="listbox"`, Menu 팝업과 같은 모양 `bg.elevated` · `border.default` · `radius.md` · `shadow.md`, 폭 `space.64` × 5, 줄 = `density.row-height`(휴대폰 `space.48`), 고른 줄 `bg.sunken`, 멘션 줄 = Avatar 24 + 이름 + 보조 글자, 명령 줄 = "/이름" + 설명 `type.caption` `fg.secondary`).
## Props
contract 표.
## Variants
attachable 있음 · 없음 × enterToSend(Enter 보내기 · Ctrl+Enter 보내기) × sticky(휴대폰 아래 고정) × mentions · commands 있음 · 없음(없으면 지금과 같다: 목록 · 라이브 영역 · 감싼 칸이 없고 onSend는 글 · 파일 둘만 받는다).
## States
default · hover(입력 칸 `border.strong`) · focus(입력 칸 `border.focus` 테두리 + 1px 선, Textarea와 같다) · disabled(입력 칸 `bg.sunken` · `fg.disabled`, 첨부 · 보내기 비활성, `data-state="disabled"`) · loading(보내기 단추 처리 중, 입력은 그대로, `aria-busy` · `data-state="loading"`). active · error는 해당 없음(글자 수는 maxLength로 막는다).
## 동작
- 보내기: 글자(앞뒤 공백 제거)나 붙인 파일이 있을 때만 보내기 단추가 켜진다. 보내면 `onSend(text, files)`를 부르고 칸 · 파일을 비운 뒤 입력 칸에 포커스를 둔다. 제어(value)면 onChange('')로 비우기를 알린다.
- 줄: 한 줄에서 시작해 글자에 맞춰 `maxRows`(기본 6)줄까지 늘어나고, 넘으면 칸 안에서 스크롤한다.
- 한글 입력: 조합 중 Enter(`isComposing`, Safari의 keyCode 229 포함)는 글자 확정이라 보내지 않는다.
- 첨부: 단추가 파일 고르기 창을 연다(`accept`, 여러 개). 고른 파일은 칩으로 보이고 칩의 삭제로 뺀다.
- 추천 질문(`suggestions`): 입력 위 SuggestionChips. 누르면 그 글을 입력 칸에 넣고(제어면 onChange) 포커스를 입력 칸에 둔다. 보내지는 않는다(고쳐서 보낼 수 있게). Composer가 비활성이면 칩도 꺼진다. 언제 보일지(대화 시작 · 답변 뒤)는 앱이 `suggestions`로 정한다.
- 휴대폰(`sticky`): 폭이 `breakpoint.sm` 미만이면 화면 아래에 붙고(`position: sticky`) 홈 표시줄만큼 아래 여백(`env(safe-area-inset-bottom)`)을 둔다. 입력 글자는 16(touch 밀도의 입력 글자 토큰)이라 iOS가 확대하지 않는다.
- 멘션(`mentions`, PG-33): 글 처음이나 띄어쓰기 뒤에 "@"를 치면 사람 목록이 입력 칸 위에 뜬다(메일 주소의 @는 부르지 않는다). "@" 뒤 글자로 이름 · 보조 글자를 걸러 8명까지 보인다. 고르면 "@이름 "을 넣고 커서를 그 뒤에 둔다. 보낼 때 글에 남은 "@이름"의 사람 id를 `onSend`의 셋째 값 `meta.mentions`로 돌려준다(넣었다가 지운 이름은 빠진다).
- 명령(`commands`, PG-33): 글 맨 앞에서 "/"를 치면 명령 목록(이름 + 설명)이 뜬다. 고르면 "/이름 "을 넣고 `onCommand(id)`를 부른다. 글이 "/이름"으로 시작한 채 보내면 `meta.command`가 그 id다. 명령을 실행하는 일(카드 붙이기 · 공지 올리기)은 앱이 한다.
- 목록이 열린 동안 위아래 화살표는 고를 줄을 옮기고, Enter · Tab은 고르고, Escape는 목록만 닫는다(바깥 옆 칸 · 시트로 번지지 않는다). 글자를 더 치면 다시 열린다. 한글 조합 중 키(Enter 포함)는 글자 확정이라 고르지 않는다. 누르기로 골라도 입력 칸이 포커스를 잃지 않는다. 맞는 사람 · 명령이 없으면 목록을 닫는다.

| 키 | 동작 |
| --- | --- |
| Enter | 보내기(enterToSend). false면 줄바꿈. 목록이 열려 있으면 고르기 |
| Shift+Enter | 줄바꿈 |
| Ctrl+Enter · Cmd+Enter | 보내기 |
| ArrowUp · ArrowDown | 멘션 · 명령 목록에서 고를 줄 옮기기 |
| Tab | 추천 질문 → 첨부 → 입력 칸 → 보내기. 목록이 열려 있으면 고르기 |
| Escape | 멘션 · 명령 목록 닫기 |
## 접근성
입력 칸은 Field 안이면 Field 라벨 · 도움말(`aria-describedby`)을 쓰고, 밖이면 `label`(없으면 "메시지")이 `aria-label`이다. placeholder는 예시이고 이름이 아니다. 첨부 단추 이름은 "파일 첨부", 칩 삭제는 "사진.jpg 삭제". 휴대폰 키보드의 Enter 표시는 `enterkeyhint="send"`. 글자 수가 보이면 입력 칸 설명에 잇는다. 포커스 링은 항상 보인다. 멘션 · 명령이 있으면 입력 칸이 `aria-autocomplete="list"`이고, 목록이 열리면 `aria-controls`(목록) · `aria-activedescendant`(고른 줄)를 가진다. 포커스는 입력 칸에 남는다. 목록은 `role="listbox"`(이름 "멘션할 사람" · "명령"), 줄은 `role="option"` · `aria-selected`. 숨은 라이브 영역이 "사람 3명. 위아래 화살표로 고르고 Enter로 넣습니다"와 고른 뒤 "@박서연 넣었습니다"를 읽는다.
## 밀도
한 줄 높이 = `density.control-height-md`(compact 28 · comfortable 32 · touch 40), 줄 높이 `density.body-line-height`, 단추 사이 `space.8`.
## 플랫폼 차이
네이티브는 TextInput multiline + 문서 고르기(같은 onSend). 키보드가 올라오면 입력 줄이 따라 올라간다(KeyboardAvoidingView). Enter 보내기는 하드웨어 키보드에서만. props는 같다.
## 금지 사항
보내기 단추를 아이콘만으로(글자 없이) · placeholder를 라벨 대신 · Enter로 보내는데 줄바꿈 방법을 감추기 · 조합 중 Enter 보내기 · 입력 칸 16 미만(휴대폰) · 명령을 고르자마자 실행하기(넣기만 하고 실행은 보낼 때 앱이) · 멘션을 글자 색만으로 구분하기(대화에서는 MessageThread `mentions`가 굵게 보인다). 리뷰로 막는다.
## 스토리
Chat · Suggestions · Reply · MentionsCommands.
## 참고
components.md §10 ConversationalWork(입력창 하단 고정), patterns/ConversationalWork(PG-30), SuggestionChips(PG-31), 멘션 · 명령(PG-33). 블록 groupware/messenger/chat · crm/support/tickets에서 올렸다(PF-15 · PR-08). 멘션 · 명령을 쓰는 블록: groupware/messenger/chat · platform/assistant/chat.
