# MessageThread

> `@terracelab/trellis-react` · CSS `.tl-message-thread` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { MessageThread } from '@terracelab/trellis-react';
```

## 용도

메신저 · 상담처럼 사람끼리 주고받은 메시지를 날짜와 보낸 사람으로 묶어 보여 준다. 에이전트 대화에서는 답변(`kind: 'answer'`)을 말풍선 없이 서식 본문 · 출처 · 동작 줄로 보인다. 입력은 Composer와 함께 쓴다. 시간 순 처리 이력(결재 · 입고 단계)은 Timeline, 알림 목록은 NotificationCard.

## 해부(Anatomy)

root(`tl-message-thread`, `role="log"`) · older(맨 위 "이전 메시지" ghost Button) · divider(날짜 · 새 메시지, `type.caption` `fg.secondary` 글자 + 양쪽 `border.divider` 1px 선, 새 메시지는 글자만 `fg.link`) · system(가운데 알림 줄, `type.caption` `fg.secondary`, 바탕 없음) · run(보낸 사람 묶음: avatar 32 + author(name `type.label` 600 · meta `type.caption` `fg.secondary`)) · bubble(다른 사람 `bg.sunken`, 내 쪽 `brand.subtle`, `radius.lg`, 글자 `fg.primary`, 선 · 띠 없음) · files(Attachment chips) · extra(업무 카드) · aside(읽음 · 안 읽은 수 · 시각, `type.caption` `fg.secondary` tabular, 실패는 `status.danger.default` 글자 + "다시 보내기" 링크 단추) · answer(에이전트 답변, 말풍선 없음, 최대 폭 `space.64` × 12, 사이 `space.8`: steps(RunSteps collapsible 자리) → RichText 본문 → files · extra(결과 카드) → Citation list → answer-error(`status.danger.default`) → foot(actions: IconButton sm ghost 복사 · 다시 생성 · 좋음 · 나쁨 + 시각, `type.caption` `fg.secondary`)). PG-36에서 더한 것: quote(답글 인용, 말풍선 위 둘레 `border.divider` 1px · `radius.md` 상자, reply 아이콘 + 원문 보낸 사람 600 + 원문 한 줄 `type.caption` `fg.secondary`, 왼쪽 띠 없음) · mention(글 안 "@이름", `fg.link` 600) · images(그림 미리 보기, 하나는 `space.64` × 3.5 폭, 둘 이상은 두 열, 4:3 `radius.lg`, `border.divider`) · reactions(말풍선 아래 알약: 아이콘 16 + 수 `type.caption` tabular, 높이 `space.24`, `border.divider` · `bg.surface`, 내가 누른 것 `border.selected` · `brand.subtle`) · tools(메시지 동작: IconButton xs 반응 추가(Menu) · 답글, 가리키거나 안에 포커스가 오면 보인다) · typing(맨 아래 점 셋 + "이하은 과장 입력 중", `type.caption` `fg.secondary`).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `messages` | `MessageThreadItem[]` |  | 필수 | 메시지(오래된 것부터) |
| `label` | `string` |  | 필수 | 대화 이름(접근성 이름) |
| `unreadFrom` | `string` |  |  | "새 메시지" 구분선을 둘 메시지 id |
| `hasOlder` | `boolean` | `false` |  | "이전 메시지" 단추 |
| `onLoadOlder` | `() => void` |  |  | 이전 메시지 불러오기 |
| `loading` | `boolean` | `false` |  | 이전 메시지 불러오는 중 |
| `onRetry` | `(id: string) => void` |  |  | 실패 메시지 다시 보내기 |
| `today` | `string` |  |  | "오늘" 기준 날짜(YYYY-MM-DD) |
| `groupMinutes` | `number` | `5` |  | 같은 사람 메시지를 묶는 간격(분) |
| `height` | `'auto' \| 'fill'` | `"auto"` |  | 내용 높이 · 부모 높이를 채우고 안에서 스크롤 |
| `empty` | `string` |  |  | 메시지가 없을 때 문구 |
| `onCopy` | `(id: string) => void` |  |  | 답변을 복사한 뒤 |
| `onRegenerate` | `(id: string) => void` |  |  | 답변 다시 생성(있으면 단추) |
| `onFeedback` | `(id: string, value: 'good' \| 'bad' \| null) => void` |  |  | 답변 평가(있으면 좋음 · 나쁨 단추) |
| `onCitationOpen` | `(id: string, source: CitationSource) => void` |  |  | 답변의 출처를 열 때 |
| `onReact` | `(id: string, key: string) => void` |  |  | 반응 켜고 끄기(있으면 반응이 누름 단추) |
| `reactionOptions` | `MessageThreadReactionOption[]` |  |  | 고를 수 있는 반응(onReact와 함께면 "반응 추가") |
| `onReply` | `(id: string) => void` |  |  | 답글 쓰기(있으면 "답글" 단추) |
| `typing` | `string[]` |  |  | 입력 중인 사람 이름(맨 아래 한 줄) |

## Variants

height auto(내용 높이, 상세 카드 안) · fill(부모 높이를 채우고 안에서 스크롤, 메신저 대화 칸). 메시지는 kind message · system · answer, own 여부, status 없음 · sending · failed. answer는 streaming(쓰는 중) · feedback(good · bad)이 더 있다. message는 reactions · replyTo · mentions · 그림 파일(`files[].thumb`)이 더 있고(PG-36), 목록은 typing이 더 있다. 새 props가 없으면 지금과 같다.

## States

지원 상태: `default` · `loading`

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

## 예시

### 대화

날짜와 보낸 사람으로 묶는다. 다른 사람은 왼쪽에 이름과 함께, 내 메시지는 오른쪽에 읽음 · 안 읽은 수와 함께 보인다

```tsx
import { MessageThread, type MessageThreadWebItem } from '@terracelab/trellis-react';

const JUNG = { id: 'u05', name: '정우진 주임', meta: '물류팀' };

const MOON = { id: 'u04', name: '문채원 주임', meta: '구매팀' };

const CHANNEL: MessageThreadWebItem[] = [
  {
    id: 'c1',
    author: MOON,
    at: '2026-11-05 16:42',
    text: 'PO-2611-0043 견적 받았습니다. 단가 USD 17.00으로 전월보다 0.20 내려왔습니다.',
  },
  {
    id: 'c2',
    author: JUNG,
    at: '2026-11-05 17:05',
    text: '12월 첫 주 평택 냉동센터 랙 여유 확인했습니다. 1,000KG 들어갑니다.',
  },
  { id: 'c3', kind: 'system', at: '2026-11-06 09:30', text: '김테라 팀장이 대화에 들어왔습니다' },
  {
    id: 'c4',
    author: JUNG,
    at: '2026-11-06 09:42',
    text: '평택 냉동센터에 가리비 관자 도착했습니다. 검수 시작합니다.',
  },
  {
    id: 'c5',
    author: JUNG,
    at: '2026-11-06 10:05',
    text: '12KG 부족합니다. 박스 하나가 파손돼서 사진 올립니다.',
    files: [
      { name: '파손-박스-01.jpg', size: 1_929_216 },
      { name: '거래명세서-HK1101.pdf', size: 182_272 },
    ],
  },
  {
    id: 'c6',
    author: { id: 'me', name: '김테라 팀장' },
    own: true,
    at: '2026-11-06 10:12',
    text: '확인했습니다. 공급사에 클레임 메일 보내겠습니다.',
    unread: 0,
  },
  {
    id: 'c7',
    author: { id: 'me', name: '김테라 팀장' },
    own: true,
    at: '2026-11-06 10:13',
    text: '수량 차이는 입고 확정 때 반영해 주세요.\n검수 사진은 결재 문서에 붙여 두겠습니다.',
    unread: 2,
  },
];

function Conversation() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 10)' }}>
      <MessageThread
        label="구매 · 물류 채널 메시지"
        messages={CHANNEL}
        today="2026-11-06"
        unreadFrom="c4"
      />
    </div>
  );
}
```

### 이전 메시지

맨 위 단추로 더 불러온다. 부모 높이를 채우면 안에서 스크롤하고 보던 자리를 지킨다

```tsx
import { useState } from 'react';
import { MessageThread, type MessageThreadWebItem } from '@terracelab/trellis-react';

const JUNG = { id: 'u05', name: '정우진 주임', meta: '물류팀' };

const MOON = { id: 'u04', name: '문채원 주임', meta: '구매팀' };

const CHANNEL: MessageThreadWebItem[] = [
  {
    id: 'c1',
    author: MOON,
    at: '2026-11-05 16:42',
    text: 'PO-2611-0043 견적 받았습니다. 단가 USD 17.00으로 전월보다 0.20 내려왔습니다.',
  },
  {
    id: 'c2',
    author: JUNG,
    at: '2026-11-05 17:05',
    text: '12월 첫 주 평택 냉동센터 랙 여유 확인했습니다. 1,000KG 들어갑니다.',
  },
  { id: 'c3', kind: 'system', at: '2026-11-06 09:30', text: '김테라 팀장이 대화에 들어왔습니다' },
  {
    id: 'c4',
    author: JUNG,
    at: '2026-11-06 09:42',
    text: '평택 냉동센터에 가리비 관자 도착했습니다. 검수 시작합니다.',
  },
  {
    id: 'c5',
    author: JUNG,
    at: '2026-11-06 10:05',
    text: '12KG 부족합니다. 박스 하나가 파손돼서 사진 올립니다.',
    files: [
      { name: '파손-박스-01.jpg', size: 1_929_216 },
      { name: '거래명세서-HK1101.pdf', size: 182_272 },
    ],
  },
  {
    id: 'c6',
    author: { id: 'me', name: '김테라 팀장' },
    own: true,
    at: '2026-11-06 10:12',
    text: '확인했습니다. 공급사에 클레임 메일 보내겠습니다.',
    unread: 0,
  },
  {
    id: 'c7',
    author: { id: 'me', name: '김테라 팀장' },
    own: true,
    at: '2026-11-06 10:13',
    text: '수량 차이는 입고 확정 때 반영해 주세요.\n검수 사진은 결재 문서에 붙여 두겠습니다.',
    unread: 2,
  },
];

const OLDER: MessageThreadWebItem[] = [
  {
    id: 'o1',
    author: MOON,
    at: '2026-11-04 15:10',
    text: '다음 주 입고 일정표 공유합니다.',
    files: [{ name: '11월 2주 입고 일정.xlsx', size: 48_128 }],
  },
  { id: 'o2', author: JUNG, at: '2026-11-04 15:22', text: '받았습니다. 랙 배치 다시 보겠습니다.' },
];

function LoadOlder() {
  const [messages, setMessages] = useState(CHANNEL.slice(3));
  const hasOlder = messages[0]?.id !== 'o1';
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(var(--tl-space-64) * 6)',
        maxWidth: 'calc(var(--tl-space-64) * 10)',
        border: 'var(--tl-border-width-1) solid var(--tl-color-border-divider)',
        borderRadius: 'var(--tl-radius-lg)',
      }}
    >
      <MessageThread
        label="구매 · 물류 채널 메시지"
        height="fill"
        today="2026-11-06"
        messages={messages}
        hasOlder={hasOlder}
        onLoadOlder={() =>
          setMessages((ms) =>
            ms[0]?.id === 'c4' ? [...CHANNEL.slice(0, 3), ...ms] : [...OLDER, ...ms],
          )
        }
      />
    </div>
  );
}
```

### 보내지 못함

내 메시지 옆에 실패를 글자로 알리고 다시 보내기 단추를 둔다

```tsx
import { useState } from 'react';
import { MessageThread } from '@terracelab/trellis-react';

const JUNG = { id: 'u05', name: '정우진 주임', meta: '물류팀' };

function Failed() {
  const [status, setStatus] = useState<'failed' | 'sending' | undefined>('failed');
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 10)' }}>
      <MessageThread
        label="정우진 주임과 대화"
        today="2026-11-06"
        onRetry={() => setStatus('sending')}
        messages={[
          {
            id: 'd1',
            author: JUNG,
            at: '2026-11-06 13:20',
            text: '반품 박스 회수는 내일 오전입니다.',
          },
          {
            id: 'd2',
            author: { id: 'me', name: '김테라 팀장' },
            own: true,
            at: '2026-11-06 13:24',
            text: '회수 기사 연락처를 보내 주세요.',
            ...(status ? { status } : {}),
          },
        ]}
      />
    </div>
  );
}
```

### 에이전트 답변

말풍선 없이 폭을 쓴다. 실행 단계 요약 · 본문(표 · 출처 번호) · 출처 목록 · 복사 · 다시 생성 · 좋음 · 나쁨 순서다. 다음 답변은 쓰는 중이다

```tsx
import { useState } from 'react';
import { RunSteps, MessageThread } from '@terracelab/trellis-react';

const AGENT = { id: 'agent', name: '업무 도우미', meta: '에이전트' };

const ME = { id: 'me', name: '김테라 팀장' };

const ANSWER = `11월 6일 기준 미지급금은 **3개 거래처 16,555,500원**입니다. 금액 단위는 원입니다.

| 거래처 | 미지급금 | 지급 예정일 |
|---|---|---|
| 한빛식품 | 12,480,000 | 2026-11-10 |
| 동해수산 | 3,215,500 | 2026-11-15 |
| 대성물류 | 860,000 | 2026-11-20 |

한빛식품은 세금계산서를 아직 수취하지 않았습니다[1]. 지급 전에 수취 여부를 확인하세요[2].`;

function AgentAnswer() {
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 12)' }}>
      <MessageThread
        label="업무 도우미 대화"
        today="2026-11-06"
        onRegenerate={() => {}}
        onFeedback={(_id, value) => setFeedback(value)}
        messages={[
          {
            id: 'q1',
            author: ME,
            own: true,
            at: '2026-11-06 10:20',
            text: '이번 달 미지급금 거래처별로 보여 줘',
          },
          {
            id: 'a1',
            kind: 'answer',
            author: AGENT,
            at: '2026-11-06 10:20',
            text: ANSWER,
            steps: (
              <RunSteps
                collapsible
                steps={[
                  {
                    id: 's1',
                    name: '전표 조회',
                    description: '11월 · 미지급금',
                    state: 'succeeded',
                    durationMs: 1240,
                  },
                  { id: 's2', name: '세금계산서 수취 확인', state: 'succeeded', durationMs: 2050 },
                  { id: 's3', name: '답변 작성', state: 'succeeded', durationMs: 3100 },
                ]}
              />
            ),
            citations: [
              { title: '매입 세금계산서 목록', location: '11월' },
              {
                title: '경비 처리 규정',
                location: '4.2 지급 전 확인',
                href: 'https://intranet.terra-trading.example/policy/expense',
              },
            ],
            ...(feedback ? { feedback } : {}),
          },
          {
            id: 'q2',
            author: ME,
            own: true,
            at: '2026-11-06 10:22',
            text: '한빛식품 지급 예정일 하루 당겨 줘',
          },
          {
            id: 'a2',
            kind: 'answer',
            author: AGENT,
            at: '2026-11-06 10:22',
            streaming: true,
            text: '한빛식품 지급 예정일을 2026-11-09로 바꾸는 제안을 만들고 있습니다.',
          },
        ]}
      />
    </div>
  );
}
```

### 반응 · 답글 · 그림

말풍선 아래 반응(아이콘 + 수, 내가 누른 것은 눌린 모양), 답글은 말풍선 위 인용(누르면 원문으로), 그림 파일은 미리 보기(누르면 크게), 멘션은 링크 색 글자, 맨 아래는 입력 중인 사람이다. 반응 추가 · 답글 단추는 메시지를 가리키거나 포커스하면 보인다

```tsx
import { useState } from 'react';
import { MessageThread } from '@terracelab/trellis-react';

const JUNG = { id: 'u05', name: '정우진 주임', meta: '물류팀' };

const PHOTO =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCABIAGADASIAAhEBAxEB/8QAGQABAQEBAQEAAAAAAAAAAAAAAAECAwQF/8QAFwEBAQEBAAAAAAAAAAAAAAAAAAIBA//aAAwDAQACEAMQAAAB+gjcqCoKgqCoIzDbCdutOd3nz55vS+P0VnoYvXn5UTt9Pl3Fd88bN6zeM7neN3GkdIjNGuO4vbjrN1y1WW4a6MauMgAAAAA//8QAIRAAAgICAgIDAQAAAAAAAAAAAAECERASAyAhMCIxQEH/2gAIAQEAAQUC/ZYsWOdEHaxZsi0RjKQuN4k/N4438dkX0jyaxXKbsfkf0L1SlWF22NjYbta9/wCiwhiGL3f/xAAdEQABBAIDAAAAAAAAAAAAAAAAAQIQERIhIDAx/9oACAEDAQE/AeaIaEQd5LSodN0ZFmuj/8QAHBEAAgIDAQEAAAAAAAAAAAAAAAECEBESISAw/9oACAECAQE/Afcng6OTIvtyG6jeGzU1MP4f/8QAGhAAAgIDAAAAAAAAAAAAAAAAABEhQDAxUP/aAAgBAQAGPwLjsnGjbtRe/8QAIBAAAgEEAwADAAAAAAAAAAAAAREAECExcSBRYUBBgf/aAAgBAQABPyH5bjQCcwoQ9J3LwrjVO56T2gVCIKbhQzhwkjQAJy5mJ3wdJ+y7l4YmiEzmSmNNcQ+hXGFzTDi5pNJpDosm1HxD1oBd4cRvuYWjAXjK0ZX5vn//2gAMAwEAAgADAAAAEPnvvnrvrXhlvhr3BvyqjPI7uwovoggv/8QAHBEBAQACAgMAAAAAAAAAAAAAAQARMRAgITBB/9oACAEDAQE/EO5O5+Ah3A0OQI5gWpeOQTCTmVPo/8QAGxEBAQACAwEAAAAAAAAAAAAAAQAQMREgIUH/2gAIAQIBAT8Q7r4I+1tDmbZy0RJW3D3LuQ2FxAEd/wD/xAAjEAADAAIBBAIDAQAAAAAAAAAAAREhMVEQQWGRgcFxofDR/9oACAEBAAE/EKUpS9KXpSlKXpcFhSlKUvSlKNUhseMGWaIRVeC7wiFLmuA/8sRcFPH9jS5JiUWvQ4pknMje2V4K+ROhEb9MDbbrdbK4mdFYk8f2Ovfo13+O5hYfpHMB2HodPzmT0iz0GtaJs/Q6Zc4zf3yJtbehPj2VJ43yWeWPWjKqheH1Rps34FXrYjXkWuPDG+79ovBcDdPofxT+KMmS+4oX+BOLAnpaXkpRLN3IwKs6k5Eym4Kl+5TdbdhfyIrbLeSCqqUpSlKQUpSlKf/Z';

const REACTIONS = [
  { key: 'check', label: '확인', icon: 'check' as const },
  { key: 'thumbs-up', label: '좋아요', icon: 'thumbs-up' as const },
  { key: 'heart', label: '감사', icon: 'heart' as const },
];

function Reactions() {
  const [mine, setMine] = useState<string[]>(['check']);
  const toggle = (key: string) =>
    setMine((m) => (m.includes(key) ? m.filter((k) => k !== key) : [...m, key]));
  const base: Record<string, number> = { check: 1, 'thumbs-up': 1, heart: 0 };
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 10)' }}>
      <MessageThread
        label="구매-물류 메시지"
        today="2026-11-06"
        reactionOptions={REACTIONS}
        onReact={(_id, key) => toggle(key)}
        onReply={() => {}}
        typing={['이하은 과장']}
        messages={[
          {
            id: 'r1',
            author: JUNG,
            at: '2026-11-06 10:05',
            text: '12KG 부족합니다. 박스 하나가 파손돼서 사진 올립니다. @김테라 확인 부탁드립니다.',
            mentions: ['김테라'],
            files: [
              { name: '파손-박스-01.jpg', size: 1_929_216, thumb: PHOTO, href: PHOTO },
              { name: '거래명세서-HK1101.pdf', size: 182_272 },
            ],
            reactions: REACTIONS.map((r) => ({
              ...r,
              count: (base[r.key] ?? 0) + (mine.includes(r.key) ? 1 : 0),
              mine: mine.includes(r.key),
            })),
          },
          {
            id: 'r2',
            author: { id: 'me', name: '김테라 팀장' },
            own: true,
            at: '2026-11-06 10:12',
            text: '확인했습니다. 공급사에 클레임 메일 보내겠습니다.',
            replyTo: {
              id: 'r1',
              author: '정우진 주임',
              text: '12KG 부족합니다. 박스 하나가 파손돼서 사진 올립니다.',
            },
            unread: 0,
          },
        ]}
      />
    </div>
  );
}
```
