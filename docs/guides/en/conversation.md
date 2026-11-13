# Building agent conversation screens

This is the screen where a user asks an agent about their work and gets an answer. Answers come with run steps and sources. A change to data is applied only after a person approves it. The composition is the `ConversationalWork` pattern, and you start by copying the matching block (see "Blocks to start from" below). A messenger between people uses only MessageThread and Composer.

## Two layouts

| Layout | When | Composition |
| --- | --- | --- |
| Full page | The conversation is the main work | Conversation list (SelectableList) · conversation (MessageThread + Composer) · result pane (the chosen source or table). At 1024 the result opens in a Drawer, and phones move between the list and the conversation |
| Side panel of a business screen | Asking about the list or document in view | Keep the business screen as it is and put the conversation in [AppShell](../components/AppShell.md) `aside`. Inside a block, fill it with `AppShellAside` |

The side panel changes with the width. From 1280 it sits beside the body and narrows it. Between 1024 and 1280 it overlays the body. Below 1024 it is a bottom sheet. Closing it keeps the conversation. The selected row or the open document is the context of the question.

## Parts

| Part | Where it goes |
| --- | --- |
| [MessageThread](../components/MessageThread.md) | The conversation log. Questions are your own bubbles, and answers are `kind: 'answer'` items (body without a bubble, sources and an action row) |
| [RichText](../components/RichText.md) | The answer body. It reads a subset of markdown (headings, lists, tables and a few more) and never builds HTML. The answer item uses it inside |
| [Citation](../components/Citation.md) | Sources. `[1]` in the body matches the list number. Pressing one calls `onCitationOpen` |
| [RunSteps](../components/RunSteps.md) | Run steps. Folded above the answer with `collapsible`, and opened when a step waits for approval or failed |
| [ProposalCard](../components/ProposalCard.md) | A proposed data change. The changed fields (`changes`) with approve and reject. Rejecting asks for a reason |
| [Composer](../components/Composer.md) | The input pinned at the bottom. `suggestions` (suggested questions, only placed in the input) · `mentions` (@people) · `commands` (/scope) |
| [SuggestionChips](../components/SuggestionChips.md) | Suggested questions outside Composer (an empty conversation, the command palette) |

Run states use only the six `AGENT_RUN_STATES`.

| State | Text | Meaning |
| --- | --- | --- |
| `queued` | `대기` | Not started yet |
| `running` | `실행 중` | In progress |
| `waiting` | `확인 대기` | Waiting for a person to approve (a ProposalCard in the same answer) |
| `succeeded` | `완료` | Done |
| `failed` | `실패` | Stopped. The answer shows that it could not answer, with regenerate |
| `canceled` | `중단` | A person stopped it or rejected the proposal |

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

## What the app supplies

Trellis provides the screen parts only. The app calls the model and changes the data.

- **Run state.** Pass the steps and their states to RunSteps `steps`. Update `text` as the answer arrives and drop `streaming` when it is done. Composer is `loading` while the answer is written.
- **Sources.** Pass `citations` (number, document name, location, address) with every answer that states facts. When a source is pressed, the app opens that document or screen (blocks use `useOpenLink`).
- **Approval handler.** Apply the change in ProposalCard `onApprove` and record the reason in `onReject(reason)`. When done, set `status` to `approved` or `rejected`, and the step to `succeeded` or `canceled`.
- **Regenerate and rating.** Passing `onRegenerate` and `onFeedback` adds their buttons to the action row. Copy is always there.

## Rules

- Do not change data without ProposalCard approval. Do not put inputs or forms inside an answer.
- Show sources for every answer that states facts. An answer without sources has no source list.
- Do not write model names or vendor names in screen text. The agent's name is the one the service chose (for example `업무 도우미`).
- Suggested questions only fill the input. They are never sent right away.
- Do not tell messages apart with bubble colors or left stripes. The approval badge (`Badge approval`) is for electronic approval only.

## Phones

The full page moves from the conversation list to the conversation and back with a back button. Results and proposals open in a bottom sheet, and ProposalCard buttons share the width. The side panel becomes a bottom sheet, and Composer sticks to the bottom of the screen with `sticky`.

## Blocks to start from

| Block id | Screen | What to look at |
| --- | --- | --- |
| `platform/assistant/chat` | Assistant (full page) | Conversation list · answer items · result pane · approving and rejecting a ProposalCard |
| `ecm/my-docs/ask` | Ask about documents (side panel) | AppShell `aside` · pressing a source to preview the document |

The block answers are fixed samples and use no network. A service replaces the sample hook with calls to its agent API.
