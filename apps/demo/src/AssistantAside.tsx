// 데모 틀의 업무 도우미 옆 칸: AppShell aside에 대화(MessageThread) + 입력(Composer)을 넣는다.
// 어느 화면에서나 열고, 왼쪽 가장자리를 끌어 폭을 바꾼다(AppShell 옆 칸 폭, R-41).
// 답은 blocks/_data/assistant.ts의 정해진 답이다(네트워크 · 모델 호출 없음)
import {
  ASSISTANT_COMMANDS,
  ASSISTANT_NAME,
  ASSISTANT_SUGGESTIONS,
  type AssistantSource,
  type AssistantTurn,
  type useAssistantRuns,
} from '@terracelab/trellis-blocks/data/assistant';
import { TODAY } from '@terracelab/trellis-blocks/data';
import { useScreens } from '@terracelab/trellis-blocks/platform';
import {
  Composer,
  EmptyState,
  IconButton,
  MessageThread,
  ProposalCard,
  RunSteps,
  useAppShellAsideId,
  useToast,
  type MessageThreadWebItem,
} from '@terracelab/trellis-react';

const AGENT = { id: 'agent', name: ASSISTANT_NAME };
/** 제안 승인을 서버에 보내는 시간(흉내) */
const SAVE_MS = 500;

export type AssistantRuns = ReturnType<typeof useAssistantRuns>;

/** 바의 여는 단추. 옆 칸 id는 AppShell 안에서만 얻는다 */
export function AssistantToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const asideId = useAppShellAsideId();
  return (
    <IconButton
      icon="bot"
      label={ASSISTANT_NAME}
      aria-expanded={open}
      {...(asideId ? { 'aria-controls': asideId } : {})}
      onPress={onToggle}
    />
  );
}

export function AssistantAside({
  runs,
  convId,
  onConv,
  me,
}: {
  runs: AssistantRuns;
  convId: string | null;
  onConv: (id: string) => void;
  me: string;
}) {
  const toast = useToast();
  const screens = useScreens();
  const conv = runs.conversations.find((c) => c.id === convId) ?? null;
  const turns = conv?.turns ?? [];
  const last = turns[turns.length - 1];

  const answerOf = (id: string, t: AssistantTurn): MessageThreadWebItem => ({
    id: t.id,
    kind: 'answer',
    author: AGENT,
    at: t.askedAt,
    ...(t.text ? { text: t.text } : {}),
    streaming: t.streaming,
    ...(t.failed ? { status: 'failed' as const } : {}),
    ...(t.sources.length ? { citations: t.sources } : {}),
    ...(t.feedback ? { feedback: t.feedback } : {}),
    steps: (
      <RunSteps
        collapsible
        steps={t.steps.map((s) => ({
          id: s.id,
          name: s.name,
          state: s.state,
          ...(s.description ? { description: s.description } : {}),
          ...(s.durationMs ? { durationMs: s.durationMs } : {}),
          ...(s.detail ? { detail: s.detail } : {}),
        }))}
      />
    ),
    // 데이터를 바꾸는 일은 제안 카드로만(사람이 승인해야 바뀐다)
    ...(t.proposal && !t.streaming
      ? {
          extra: (
            <ProposalCard
              title={t.proposal.title}
              summary={t.proposal.summary}
              changes={t.proposal.changes}
              status={t.proposal.status}
              {...(t.proposal.approveLabel ? { approveLabel: t.proposal.approveLabel } : {})}
              {...(t.proposal.reason ? { reason: t.proposal.reason } : {})}
              {...(t.proposal.resolvedBy ? { resolvedBy: t.proposal.resolvedBy } : {})}
              onApprove={() =>
                new Promise((done) => setTimeout(done, SAVE_MS)).then(() => {
                  runs.resolve(id, t.id, 'approved');
                  toast.show({ title: '변경을 적용했습니다', description: t.proposal?.title });
                })
              }
              onReject={(reason) => {
                runs.resolve(id, t.id, 'rejected', reason);
                toast.show({ title: '제안을 반려했습니다', tone: 'neutral' });
              }}
            />
          ),
        }
      : {}),
  });

  const items: MessageThreadWebItem[] = conv
    ? turns.flatMap((t) => [
        {
          id: `${t.id}-q`,
          author: { id: 'me', name: me },
          own: true,
          at: t.askedAt,
          text: t.question,
        },
        answerOf(conv.id, t),
      ])
    : [];

  return (
    <>
      {turns.length === 0 ? (
        <div className="tl-demo-assistant__empty">
          <EmptyState
            size="sm"
            icon="bot"
            title="아직 질문이 없습니다"
            description="아래 추천 질문을 고르거나 직접 입력하세요. /를 치면 찾을 범위를 고릅니다"
          />
        </div>
      ) : (
        <MessageThread
          key={`thread-${conv?.id ?? 'new'}`}
          label={`${ASSISTANT_NAME} 대화`}
          messages={items}
          height="fill"
          today={TODAY}
          groupMinutes={30}
          onRegenerate={(id) => conv && runs.regenerate(conv.id, id)}
          onFeedback={(id, value) => conv && runs.setFeedback(conv.id, id, value)}
          onCitationOpen={(_id, source) => {
            const s = source as AssistantSource;
            if (s.screen && screens.has(s.screen))
              screens.go(s.screen, s.docId ? { id: s.docId } : undefined);
          }}
        />
      )}
      <Composer
        key={`composer-${conv?.id ?? 'new'}`}
        className="tl-demo-assistant__input"
        sticky
        attachable={false}
        label={`${ASSISTANT_NAME}에게 질문`}
        placeholder="문서 · 전표 · 재고를 묻습니다 · /로 범위"
        sendLabel="질문"
        loading={runs.running}
        commands={ASSISTANT_COMMANDS}
        {...(turns.length === 0 || last?.failed ? { suggestions: ASSISTANT_SUGGESTIONS } : {})}
        onSend={(text, _files, meta) => onConv(runs.ask(convId, text, meta?.command))}
      />
    </>
  );
}
