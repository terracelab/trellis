# 에이전트 대화 화면 만들기

사용자가 에이전트에게 업무를 묻고 답을 받는 화면입니다. 답에는 실행 단계와 출처가 붙습니다. 데이터를 바꾸는 일은 사람이 승인해야 적용됩니다. 화면 구성은 패턴 `ConversationalWork`이고 맞는 블록을 복사해서 시작합니다(아래 "시작할 블록"). 사람끼리 주고받는 메신저는 MessageThread와 Composer만 씁니다.

## 두 가지 배치

| 배치 | 언제 | 구성 |
| --- | --- | --- |
| 전체 화면 | 대화가 일의 중심일 때 | 대화 목록(SelectableList) · 대화(MessageThread + Composer) · 결과 칸(고른 출처 · 표). 1024에서는 결과가 Drawer, 휴대폰은 목록과 대화를 오간다 |
| 업무 화면 옆 칸 | 보고 있는 목록 · 문서에 대해 물을 때 | 업무 화면은 그대로 두고 [AppShell](../components/AppShell.md) `aside`에 대화를 붙인다. 블록 안에서는 `AppShellAside`로 채운다 |

옆 칸의 모양은 폭에 따라 바뀝니다. 1280 이상은 본문 폭을 줄이며 옆에 붙습니다. 1024~1280은 본문 위에 겹칩니다. 1024 미만은 아래 시트입니다. 닫아도 대화는 남습니다. 지금 고른 행 · 열린 문서가 질문의 맥락입니다.

## 부품

| 부품 | 쓰는 곳 |
| --- | --- |
| [MessageThread](../components/MessageThread.md) | 대화 기록. 질문은 내 쪽 말풍선, 답은 `kind: 'answer'` 항목(말풍선 없는 본문 · 출처 · 동작 줄) |
| [RichText](../components/RichText.md) | 답 본문. 마크다운 일부(제목 · 목록 · 표 등)만 읽고 HTML을 만들지 않는다. 답 항목이 안에서 쓴다 |
| [Citation](../components/Citation.md) | 출처. 본문 `[1]`과 목록 번호가 같다. 누르면 `onCitationOpen` |
| [RunSteps](../components/RunSteps.md) | 실행 단계. 답 위에 `collapsible`로 접어 둔다. 확인 대기 · 실패가 있으면 펼쳐 보인다 |
| [ProposalCard](../components/ProposalCard.md) | 데이터 변경 제안. 바뀌는 칸(`changes`)과 승인 · 반려. 반려는 사유를 받는다 |
| [Composer](../components/Composer.md) | 아래 고정 입력. `suggestions`(추천 질문, 입력 칸에 넣기만 한다) · `mentions`(@사람) · `commands`(/범위) |
| [SuggestionChips](../components/SuggestionChips.md) | Composer 밖에서 추천 질문을 보일 때(빈 대화 · 명령 팔레트) |

실행 상태는 `AGENT_RUN_STATES` 여섯 개만 씁니다.

| 상태 | 글자 | 뜻 |
| --- | --- | --- |
| `queued` | 대기 | 아직 시작하지 않았다 |
| `running` | 실행 중 | 지금 하고 있다 |
| `waiting` | 확인 대기 | 사람의 승인을 기다린다(같은 답에 ProposalCard) |
| `succeeded` | 완료 | 끝났다 |
| `failed` | 실패 | 멈췄다. 답에 "답변하지 못했습니다"와 다시 생성 |
| `canceled` | 중단 | 사람이 멈추거나 제안을 반려했다 |

```tsx
const answer: MessageThreadWebItem = {
  id: 'a1',
  kind: 'answer',
  author: { id: 'agent', name: '업무 도우미' },
  at: '2026-11-06 10:40',
  text: run.text,
  streaming: run.streaming,
  citations: run.sources,
  steps: <RunSteps collapsible steps={run.steps} />,
  extra: run.proposal && (
    <ProposalCard {...run.proposal} onApprove={() => api.apply(run.proposal.id)} onReject={(reason) => api.reject(run.proposal.id, reason)} />
  ),
};
<MessageThread label="재고 대화" messages={[question, answer]} height="fill" onCitationOpen={(_id, source) => openSource(source)} onRegenerate={regenerate} />
<Composer label="업무 도우미에게 질문" sendLabel="질문" suggestions={suggestions} commands={commands} loading={run.streaming} onSend={ask} />
```

## 앱이 넘기는 것

Trellis는 화면 부품만 제공합니다. 모델 호출과 데이터 변경은 앱이 합니다.

- **실행 상태.** 단계 목록과 상태를 RunSteps `steps`로 넘깁니다. 답 글이 오는 대로 `text`를 바꾸고 다 쓰면 `streaming`을 뗍니다. 쓰는 동안 Composer는 `loading`입니다.
- **출처.** 사실을 말한 답마다 `citations`(번호 · 문서 이름 · 위치 · 주소)를 넘깁니다. 출처를 누르면 앱이 그 문서나 화면을 엽니다(블록은 `useOpenLink`).
- **승인 처리.** ProposalCard `onApprove`에서 변경을 적용하고 `onReject(reason)`에서 사유를 남깁니다. 끝나면 `status`를 `approved` · `rejected`로, 그 단계를 `succeeded` · `canceled`로 바꿉니다.
- **다시 생성 · 평가.** `onRegenerate`와 `onFeedback`을 넘기면 동작 줄에 단추가 생깁니다. 복사는 늘 있습니다.

## 규칙

- ProposalCard 승인 없이 데이터를 바꾸지 않습니다. 답 안에 입력 칸이나 폼을 두지 않습니다.
- 사실을 말하는 답에는 출처를 보입니다. 출처가 없는 답은 출처 목록을 두지 않습니다.
- 화면 문구에 모델 이름이나 공급사 이름을 쓰지 않습니다. 에이전트 이름은 서비스가 정한 이름(예: 업무 도우미)입니다.
- 추천 질문은 입력 칸에 넣기만 하고 바로 보내지 않습니다.
- 대화는 말풍선 색이나 왼쪽 띠로 나누지 않습니다. 결재 배지(`Badge approval`)는 전자결재에만 씁니다.

## 휴대폰

전체 화면은 대화 목록에서 대화로 화면을 옮기고 뒤로 단추로 돌아옵니다. 결과와 제안은 아래 시트로 열리고 ProposalCard 단추는 폭을 나눠 씁니다. 옆 칸은 아래 시트가 되고 Composer는 `sticky`로 화면 아래에 붙습니다.

## 시작할 블록

| 블록 id | 화면 | 볼 것 |
| --- | --- | --- |
| `platform/assistant/chat` | 업무 도우미(전체 화면) | 대화 목록 · 답 항목 · 결과 칸 · ProposalCard 승인과 반려 |
| `ecm/my-docs/ask` | 문서 질의응답(옆 칸) | AppShell `aside` · 출처를 눌러 문서 미리 보기 |

블록의 답은 정해진 샘플이라 네트워크를 쓰지 않습니다. 서비스는 샘플 훅을 에이전트 API 호출로 바꿉니다.
