# MessageThread
## 용도
메신저 · 상담처럼 사람끼리 주고받은 메시지를 날짜와 보낸 사람으로 묶어 보여 준다. 에이전트 대화에서는 답변(`kind: 'answer'`)을 말풍선 없이 서식 본문 · 출처 · 동작 줄로 보인다. 입력은 Composer와 함께 쓴다. 시간 순 처리 이력(결재 · 입고 단계)은 Timeline, 알림 목록은 NotificationCard.
## 해부(Anatomy)
root(`tl-message-thread`, `role="log"`) · older(맨 위 "이전 메시지" ghost Button) · divider(날짜 · 새 메시지, `type.caption` `fg.secondary` 글자 + 양쪽 `border.divider` 1px 선, 새 메시지는 글자만 `fg.link`) · system(가운데 알림 줄, `type.caption` `fg.secondary`, 바탕 없음) · run(보낸 사람 묶음: avatar 32 + author(name `type.label` 600 · meta `type.caption` `fg.secondary`)) · bubble(다른 사람 `bg.sunken`, 내 쪽 `brand.subtle`, `radius.lg`, 글자 `fg.primary`, 선 · 띠 없음) · files(Attachment chips) · extra(업무 카드) · aside(읽음 · 안 읽은 수 · 시각, `type.caption` `fg.secondary` tabular, 실패는 `status.danger.default` 글자 + "다시 보내기" 링크 단추) · answer(에이전트 답변, 말풍선 없음, 최대 폭 `space.64` × 12, 사이 `space.8`: steps(RunSteps collapsible 자리) → RichText 본문 → files · extra(결과 카드) → Citation list → answer-error(`status.danger.default`) → foot(actions: IconButton sm ghost 복사 · 다시 생성 · 좋음 · 나쁨 + 시각, `type.caption` `fg.secondary`)). PG-36에서 더한 것: quote(답글 인용, 말풍선 위 둘레 `border.divider` 1px · `radius.md` 상자, reply 아이콘 + 원문 보낸 사람 600 + 원문 한 줄 `type.caption` `fg.secondary`, 왼쪽 띠 없음) · mention(글 안 "@이름", `fg.link` 600) · images(그림 미리 보기, 하나는 `space.64` × 3.5 폭, 둘 이상은 두 열, 4:3 `radius.lg`, `border.divider`) · reactions(말풍선 아래 알약: 아이콘 16 + 수 `type.caption` tabular, 높이 `space.24`, `border.divider` · `bg.surface`, 내가 누른 것 `border.selected` · `brand.subtle`) · tools(메시지 동작: IconButton xs 반응 추가(Menu) · 답글, 가리키거나 안에 포커스가 오면 보인다) · typing(맨 아래 점 셋 + "이하은 과장 입력 중", `type.caption` `fg.secondary`).
## Props
contract 표.
## Variants
height auto(내용 높이, 상세 카드 안) · fill(부모 높이를 채우고 안에서 스크롤, 메신저 대화 칸). 메시지는 kind message · system · answer, own 여부, status 없음 · sending · failed. answer는 streaming(쓰는 중) · feedback(good · bad)이 더 있다. message는 reactions · replyTo · mentions · 그림 파일(`files[].thumb`)이 더 있고(PG-36), 목록은 typing이 더 있다. 새 props가 없으면 지금과 같다.
## States
default · loading(이전 메시지를 불러오는 중: 위 단추가 처리 중, root `aria-busy` · `data-state="loading"`). hover · active · focus는 안의 단추 · 링크가 가진다. disabled · error는 해당 없음(보내기 실패는 메시지마다 status로 보인다). 답변을 쓰는 중은 답변 본문(RichText)의 loading이다(`aria-busy`, 끝 커서).
## 동작
- 묶기: 날짜가 바뀌면 날짜 구분선(`11월 6일(금)`, today와 같으면 ` · 오늘`). 같은 사람(author.id · own 같음)이 `groupMinutes`(기본 5분) 안에 이어 보내면 이름 · 아바타를 첫 메시지에만 둔다. 알림 줄 · 날짜 구분선 · 새 메시지 구분선은 묶음을 끊는다.
- 정렬: 다른 사람은 왼쪽(아바타 + 이름 + 보조 글자), 내 쪽(`own`)은 오른쪽이고 이름 · 아바타가 없다. 시각은 같은 분에 이어 보낸 것 중 마지막 메시지 옆에만 둔다.
- 읽음: 내 메시지의 `unread`가 0이면 "읽음", 1 이상이면 "안 읽음 3"처럼 흐린 글자로 보인다. 알약 · 숫자 배지를 쓰지 않는다. `status`가 sending이면 "보내는 중", failed면 "보내지 못함"과 `onRetry`가 있을 때 "다시 보내기".
- 글자: 줄바꿈을 그대로 보이고 긴 글자는 칸 안에서 줄을 바꾼다. http · https 주소만 새 창 링크가 된다(끝의 마침표 · 괄호는 뺀다).
- 이전 메시지: `hasOlder`면 맨 위에 단추, 누르면 `onLoadOlder`. 무한 스크롤은 하지 않는다.
- 에이전트 답변(answer): 글은 마크다운 일부라 RichText로 그린다(제목 · 목록 · 표 · 코드 · 링크 · 굵게). `citations`가 있으면 본문 [1]이 출처 번호가 되고 다 쓴 뒤 본문 아래에 출처 목록이 붙는다. `steps`(RunSteps collapsible)는 본문 위, `extra`(결과 카드 · ProposalCard)는 본문 아래다. `streaming` 동안은 동작 줄과 출처 목록을 숨긴다. 동작 줄: 복사(늘 보인다. 글을 클립보드에 넣고 숨은 "복사했습니다"를 알린 뒤 `onCopy(id)`) · 다시 생성(`onRegenerate`가 있을 때) · 좋음 · 나쁨(`onFeedback`이 있을 때, `feedback`이 눌린 모양, 눌린 것을 다시 누르면 null). status failed면 "답변하지 못했습니다"와 다시 생성만 남는다. 출처를 누르면 `onCitationOpen(id, source)`, 없으면 출처 href.
- 반응(PG-36): 항목 `reactions`(key · label · icon · count · mine)를 말풍선 아래 알약으로 보인다. 수가 0인 반응은 그리지 않는다. 반응은 이모지가 아니라 아이콘이다(설치형 오프라인에서도 같은 모양). `onReact`가 있으면 알약이 누름 단추(`aria-pressed` = mine)이고 누르면 `onReact(id, key)`, 수와 mine은 앱이 바꿔 넘긴다. `reactionOptions`도 주면 메시지마다 "반응 추가" 메뉴가 생긴다.
- 답글(PG-36): 항목 `replyTo`(id · author · text)는 말풍선 위 인용이다. 원문 id가 대화에 있으면 인용이 단추가 되어 누르면 원문으로 스크롤하고 원문에 포커스를 두며 말풍선 둘레를 잠깐(1.6초) 보인다. `onReply`가 있으면 메시지마다 "답글" 단추가 생긴다. 입력 칸 위 "답글 대상" 줄은 앱이 그린다.
- 메시지 동작(PG-36): 반응 추가 · 답글 단추는 메시지를 가리키거나 그 안에 포커스가 오면 보인다. 숨어 있어도 Tab으로 닿고 닿으면 보인다. 보내는 중 · 보내지 못한 메시지에는 없다. 휴대폰은 가리키기가 없으므로 블록의 길게 누르기 메뉴(ContextMenu)에 같은 동작을 둔다.
- 멘션(PG-36): 항목 `mentions`(이름 목록)에 있는 "@이름"만 멘션으로 보인다. 이름은 Composer `onSend` meta.mentions의 사람에서 앱이 만든다.
- 그림(PG-36): `files`에서 `thumb`가 있는 파일은 칩 대신 미리 보기 단추로 보인다(이름 "파손-박스-01.jpg 크게 보기"). 누르면 대화상자에 크게(원본 `href`, 없으면 `thumb`) 보이고 `href`가 있으면 "원본 다운로드" 링크를 둔다. 나머지 파일은 지금처럼 칩이다.
- 입력 중(PG-36): `typing`에 이름이 있으면 맨 아래에 "이하은 과장 입력 중"(둘까지는 이름 둘, 셋부터는 "외 N명")을 보인다. 맨 아래를 보던 중이면 따라 내려간다.
- 스크롤(fill): 처음에는 "새 메시지" 구분선(없으면 맨 아래)으로 간다. 위에 이전 메시지가 붙으면 보던 자리를 지키고, 아래에 새 메시지가 오면 맨 아래를 보던 중이거나 내가 보낸 것일 때만 따라 내려간다. 대화를 바꿀 때는 앱이 `key`를 바꿔 새로 그린다.

| 키 | 동작 |
| --- | --- |
| Tab | 목록(fill) → 안의 단추 · 링크 · 파일 |
| ArrowUp · ArrowDown | 목록에 포커스가 있으면 스크롤 |
## 접근성
root는 `role="log"` + `aria-live="polite"` + `aria-label`(label)이라 새 메시지를 차례로 읽는다. 날짜 구분선은 글자로 읽힌다(장식 선은 가상 요소). 이름이 보이지 않는 메시지(묶음 안 · 내 쪽)는 숨은 글자로 보낸 사람을 앞에 붙인다. 아바타는 장식(이름이 옆에 있다). 시각은 `<time dateTime>`. 읽음 · 실패는 색이 아니라 글자로 알린다. 말풍선 글자 대비는 `bg.sunken` · `brand.subtle` 위 `fg.primary`로 4.5:1 이상. fill이면 목록이 포커스를 받아 키보드로 스크롤한다(안쪽 포커스 링). 답변 동작 줄은 `role="group"` "답변 동작"이고 아이콘 단추마다 이름 · Tooltip이 있다. 좋음 · 나쁨은 `aria-pressed`다. 쓰는 중인 답변은 본문이 `aria-busy`라 글이 붙는 동안 읽기를 미룬다. 반응 묶음은 `role="group"` "반응", 알약 이름은 "확인 2명"이고 아이콘 · 숫자는 이름에 들어 있어 따로 읽지 않는다. 메시지 동작은 `role="group"` "메시지 동작". 답글 인용은 숨은 "이하은 과장의 메시지에 답글"이 먼저 읽히고, 단추면 끝에 "원문으로 이동". 그림 미리 보기의 img는 꾸밈(alt="")이고 단추 이름이 파일 이름이다. 큰 그림은 alt = 파일 이름. 입력 중 줄은 `aria-live="off"`라 바뀔 때마다 읽지 않는다(목록을 훑으면 읽힌다).
## 밀도
글자 `density.body-font-size` · `density.body-line-height`. 묶음 사이 `space.12`, 묶음 안 메시지 사이 `space.4`, 말풍선 안쪽 `space.4` × `space.12`. 휴대폰(touch)은 본문 15/22가 그대로 적용되고 말풍선 최대 폭이 넓어진다.
## 플랫폼 차이
네이티브는 FlatList(뒤집힌 목록)로 그리고 위로 당기면 이전 메시지를 부른다. 링크는 OS 브라우저로 연다. props는 같다.
## 금지 사항
안 읽은 수를 알약 · 색 배지로 · 보낸 사람마다 다른 바탕색 · 말풍선 왼쪽 색 띠 · 알림 줄에 색 바탕 · 메시지 안 입력창 · 답글 인용을 왼쪽 띠로(D-57) · 이모지 반응(글꼴마다 모양이 다르다) · 멘션 바탕 칠하기. 리뷰로 막는다.
## 스토리
Conversation · LoadOlder · Failed · AgentAnswer · Reactions.
## 참고
components.md §10 ConversationalWork, patterns/ConversationalWork(PG-30), RichText · Citation · RunSteps(PG-31 · PG-32), 반응 · 답글 · 멘션 · 그림 · 입력 중(PG-36, SY-8). 블록 groupware/messenger/chat · crm/support/tickets에서 올렸다(PF-15 · PR-08).
