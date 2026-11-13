# ConversationalWork
## 용도
사용자가 에이전트에게 업무를 묻고(전표 · 재고 · 규정 · 문서), 에이전트가 실행 단계 · 서식 답변 · 근거 · 변경 제안으로 답하고, 사람이 제안을 승인 · 반려하는 화면의 구성이다. 화면은 두 가지다. (1) 전체 화면 대화: 대화 목록 + 대화 + 결과. (2) 업무 화면 옆 칸 대화: 지금 보는 목록 · 문서 옆에 붙는 대화. 사람끼리의 메신저는 MessageThread + Composer만 쓰고(블록 groupware/messenger/chat), 검색 · 이동만 할 때는 CommandPalette.
## 해부(Anatomy)
### 화면 1 · 전체 화면 대화(블록 `platform/assistant/chat`, PG-34)

```
┌ AppShell(글로벌 바 · 사이드바) ─────────────────────────────────────────────────────┐
│ 대화 목록           │ 대화                                    │ 결과(고른 때만)       │
│ 폭 240(사이드바 폭) │ PageHeader(대화 제목 · 새 대화)          │ 폭 layout.aside.width │
│                     │ MessageThread height="fill"             │ (제안 400)            │
│ ─ 새 대화(Button)   │  ├ 질문: own 말풍선                      │ Card 제목 + 결과      │
│ ─ 방 목록           │  ├ 답변: kind="answer"                   │  DataGrid(표 결과)    │
│   (SelectableList,  │  │   steps = RunSteps collapsible        │  · Attachment(파일)   │
│    PG-35 전에는     │  │   본문 = RichText(표 · 목록 · [1])     │  · ProposalCard(제안) │
│    블록 목록)       │  │   출처 = Citation list                │                      │
│                     │  │   동작 줄 = 복사 · 다시 생성 · 좋음 · 나쁨                       │
│                     │  └ extra = ProposalCard(확인 대기)       │                      │
│                     │ SuggestionChips + Composer(아래 고정)    │                      │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### 화면 2 · 업무 화면 옆 칸 대화(블록 `ecm/my-docs/ask`, PG-34)

```
┌ AppShell ─────────────────────────────────────────────────────────────────┐
│ 업무 화면(그대로)                          │ aside(옆 칸, AppShell PG-33)   │
│ PageHeader · FilterBar · DataGrid · 서랍   │ 머리: "업무 도우미" · 닫기      │
│                                            │ 맥락 줄: 보고 있는 것(문서 3건)  │
│                                            │ MessageThread height="fill"    │
│                                            │  답변 = 화면 1과 같은 모양       │
│                                            │ SuggestionChips + Composer     │
└───────────────────────────────────────────────────────────────────────────┘
```

부품: AppShell(옆 칸 `aside`, PG-33) · PageHeader · SelectableList(PG-35) · MessageThread(`kind: 'answer'`) · RichText · Citation · RunSteps · ProposalCard · ChangeDiff · ReasonDialog · SuggestionChips · Composer · Attachment · DataGrid · CommandPalette(⌘K 빠른 질문).
## Props
패턴은 contract가 없다. 쓰는 부품의 contract를 따른다. 이 패턴을 위해 새로 만들거나 더한 부품과 핵심 props:

| 부품 | 구분 | 핵심 props | 작업 |
|---|---|---|---|
| RichText | 새 부품 | `text` · `streaming` · `citations` · `onCitationOpen` · `onLinkPress` · `headingLevel` | PG-31 |
| Citation | 새 부품 | `sources`(index · title · location · href) · `layout`(list · inline) · `onOpen` · `label` | PG-31 |
| SuggestionChips | 새 부품 | `items` · `onSelect` · `label` · `selected` · `disabled` | PG-31 |
| RunSteps | 새 부품 | `steps`(state = AgentRunState) · `label` · `defaultExpanded` · `collapsible` · `defaultOpen` | PG-32 |
| ProposalCard | 새 부품 | `title` · `summary` · `changes` · `status`(waiting · approved · rejected) · `onApprove` · `onReject` · `reason` · `resolvedBy` | PG-32 |
| MessageThread | 더함 | 항목 `kind: 'answer'` · `streaming` · `citations` · `steps` · `feedback`, 목록 `onCopy` · `onRegenerate` · `onFeedback` · `onCitationOpen` | PG-31 |
| Composer | 더함 | `suggestions`(PG-31), `mentions` · `commands`(PG-33) | PG-31 · PG-33 |
| AppShell | 더함 | `aside` · `asideTitle` · `asideOpen` · `onAsideOpenChange`, 블록은 `AppShellAside`(본문 안에서 틀의 옆 칸을 채운다), 폭 `space.40` × 10(토큰 제안 `layout.aside.width`) | PG-33 |
| MessageThread | 더함 | 항목 `reactions` · `replyTo` · `mentions` · 그림 `files[].thumb`, 목록 `onReact` · `reactionOptions` · `onReply` · `typing`(메신저) | PG-36 |

실행 상태 어휘는 `AGENT_RUN_STATES`(D-116) 6개: queued 대기(neutral) · running 실행 중(info) · waiting 확인 대기(warning) · succeeded 완료(success) · failed 실패(danger) · canceled 중단(neutral).
## 구성 규칙
1. 답변은 MessageThread의 `kind: 'answer'`로만 그린다. 본문은 RichText(마크다운 일부)이고, 표 · 파일 · 변경 같은 결과는 카드 부품(DataGrid · Attachment · ProposalCard)을 `extra`에 둔다. 답변 안에 입력 칸 · 폼을 두지 않는다.
2. 데이터를 바꾸는 일은 ProposalCard로만 한다. 사람이 승인하기 전에는 바꾸지 않는다. 반려는 사유가 있어야 확인이 켜진다(ReasonDialog, ApprovalFlow와 같은 규칙).
3. 실행 단계는 RunSteps이고 상태는 AGENT_RUN_STATES 6개뿐이다. 답변 위에는 `collapsible`로 접어 두고, 확인 대기 · 실패가 있으면 펼쳐서 보인다. 새 실행 상태 이름을 만들지 않는다.
4. 근거는 Citation이다. 본문의 `[n]`과 출처 목록 번호가 같다. 근거가 없는 답변은 출처 목록을 두지 않는다.
5. 입력은 Composer이고 대화 칸 아래에 고정한다(fill 칸 아래, 휴대폰은 `sticky`). 추천 질문은 SuggestionChips이고 입력 칸에 넣기만 한다. 사람이 고치지 않은 질문을 바로 보내지 않는다.
6. 파일은 Attachment로만 보인다(받기 · 크기 · 종류 아이콘).
7. 상태 어휘를 섞지 않는다. 쓰는 중은 컴포넌트 상태 loading(RichText `streaming`, `aria-busy`), 답변 실패는 error 글자("답변하지 못했습니다")다. 실행 상태는 AGENT_RUN_STATES, 제안 처리는 확인 대기 · 승인 · 반려다. 결재 5어휘 배지(Badge `approval`)는 전자결재에만 쓴다.
8. 대화는 왼쪽 띠 · 말풍선 색 칠하기로 구분하지 않는다(D-57). 질문은 내 쪽 말풍선, 답변은 말풍선 없는 본문이다.
9. CommandPalette의 빠른 질문(SuggestionChips 같은 부품)에서 고른 질문을 대화로 넘기는 것은 앱이 한다.
## 반응형
| 폭 | 화면 1 · 전체 화면 | 화면 2 · 옆 칸 |
|---|---|---|
| 1440 | 대화 목록 · 대화 · 결과 세 칸. 결과 칸은 고른 결과가 있을 때만 | 업무 화면 + 옆 칸(`layout.aside.width`). 업무 화면 폭이 줄고 겹치지 않는다 |
| 1024 | 대화 목록 · 대화 두 칸. 결과는 Drawer(오른쪽) | 옆 칸이 시트(겹침)가 된다(PG-33) |
| 390 | 대화 목록 → 대화가 화면 이동(뒤로). 결과 · 제안은 아래 시트, ProposalCard 단추는 폭을 나눈다 | 옆 칸이 아래 시트. Composer `sticky` |

모든 폭에서 가로 넘침이 없다. 넓은 표 · 코드 블록은 RichText 칸 안에서 가로로 스크롤한다.
## 동작
- 보내기: Composer `onSend` → 앱이 질문(own)과 쓰는 중 답변(`kind: 'answer'`, `streaming: true`)을 messages에 더한다. 답변 글이 오는 대로 `text`를 바꾸고, 다 쓰면 `streaming`을 뗀다. 쓰는 중에는 Composer `loading`이다.
- 실행 단계: 앱이 `steps`의 RunSteps에 단계와 상태를 넘긴다. 사람 확인이 필요한 단계는 waiting이고, 같은 답변 `extra`에 ProposalCard가 확인 대기로 붙는다. 승인 · 반려가 끝나면 그 단계를 succeeded · canceled로 바꾼다.
- 다시 생성 · 평가: 동작 줄의 다시 생성은 같은 질문으로 새 답변을 만들고, 좋음 · 나쁨은 `feedback`으로 눌린 모양을 지킨다.
- 출처: 본문 번호 · 출처 목록을 누르면 `onCitationOpen`. 화면 1은 결과 칸, 화면 2는 업무 화면의 서랍 · 미리보기로 문서를 연다.
- 옆 칸(화면 2): 지금 보는 업무 화면이 맥락이다(고른 행 · 열린 문서). 옆 칸을 닫아도 대화는 남고 다시 열면 이어진다.
- 대화를 바꾸면 MessageThread `key`를 바꿔 새로 그린다(스크롤 규칙 MessageThread).
## 접근성
대화는 MessageThread `role="log"`(새 메시지 · 답변을 차례로 읽는다). 쓰는 중 답변은 본문 `aria-busy`라 글이 붙는 동안 읽기를 미룬다. 실행 상태 · 제안 상태는 색만이 아니라 글자로 읽힌다. ProposalCard를 처리하면 결과 줄로 포커스가 옮겨 간다. 옆 칸은 랜드마크(`complementary`, 이름 "업무 도우미")이고 열고 닫는 단추가 `aria-expanded`다(PG-33). 키보드만으로 질문 → 답변 읽기 → 출처 열기 → 제안 승인 · 반려가 된다. 대비 · 포커스 링은 각 부품 규격을 따른다.
## 밀도
각 부품의 밀도 토큰을 따른다. 대화 칸 안쪽 `space.16`(휴대폰 `space.12`), 답변 최대 폭 `space.64` × 12, 옆 칸은 compact가 기본이다.
## 플랫폼 차이
네이티브는 화면 1만 둔다(목록 → 대화 스택, 결과는 아래 시트). 옆 칸(화면 2)은 웹 전용이다. 부품 props는 같다.
## 금지 사항
답변 안 입력 칸 · 폼 · 사람 확인 없이 데이터 바꾸기 · 사유 없는 반려 · 실행 상태 이름 새로 만들기 · 결재 5어휘를 에이전트 제안에 쓰기 · 출처 번호와 목록이 다른 답변 · 추천 질문을 누르자마자 보내기 · 왼쪽 띠로 답변 구분(D-57) · 답변 본문에 HTML 문자열 넣기. 리뷰와 블록 검사(PG-34 `check-blocks.mjs`)로 막는다.
## 스토리
부품 스토리: RichText · Citation · SuggestionChips · RunSteps · ProposalCard · MessageThread AgentAnswer · Composer Suggestions. 화면은 블록 `platform/assistant/chat` · `ecm/my-docs/ask`와 데모 검사(1440 · 390, PG-34)가 대신한다(D-104 제안).
## 참고
components.md §10 표의 ConversationalWork 줄, D-114(1.0에 에이전트 대화), D-116(AGENT_RUN_STATES), 10-figma-showcase-coverage.md SY-1~SY-6 · PG-30~PG-34.

마크다운 해석 결정(PG-30, decisions.md §2 제안): 라이브러리를 쓰지 않고 contracts `_shared/richtext.ts`의 작은 해석기(`parseRichText`)를 쓴다. 필요한 문법이 일곱 가지(제목 · 문단 · 목록 · 표 · 코드 · 링크 · 굵게)이고, 의존성이 0이며(설치형 오프라인 · 번들 크기), HTML 문자열을 만들지 않아 주입 경로가 없고, 웹 · 네이티브가 같은 해석기를 쓰며, 쓰는 중 규칙(닫히지 않은 블록은 글자 그대로)을 직접 정한다.

토큰 제안(사람 확인): `layout.aside.width` = 400(옆 칸 폭, 1440에서 사이드바 240 + 업무 화면 800 + 옆 칸 400). PG-33은 새 토큰 값을 넣지 않고 AppShell CSS에서 `space.40` × 10으로 같은 400을 만든다. 승인되면 `--tl-app-shell-aside-width`를 토큰 변수로 바꾼다.
