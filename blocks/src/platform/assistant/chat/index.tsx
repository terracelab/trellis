// 업무 도우미 · 전체 화면 대화(ConversationalWork 화면 1, PG-34): 대화 목록(SelectableList) → 대화(MessageThread 답변:
// 실행 단계 RunSteps · 본문 RichText · 출처 Citation · 변경 제안 ProposalCard) → 아래 고정 입력(Composer: 추천 질문 · /범위).
// 출처를 누르면 결과 칸(넓은 화면 셋째 칸, 좁으면 Drawer)에 그 근거와 화면 링크가 보인다.
// 답은 _data/assistant.ts의 정해진 답이다(네트워크 · 모델 호출 없음). 서비스는 useAssistantRuns를 API 호출로 바꾼다
import { formatDate, type SelectableListItem } from '@terracelab/trellis-contracts';
import {
  BREAKPOINTS,
  Button,
  Composer,
  DescriptionList,
  Drawer,
  EmptyState,
  IconButton,
  MessageThread,
  PageHeader,
  ProposalCard,
  RunSteps,
  SelectableList,
  useBreakpoint,
  useToast,
  type MessageThreadWebItem,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  ASSISTANT_COMMANDS,
  ASSISTANT_CONVERSATIONS,
  ASSISTANT_NAME,
  ASSISTANT_SUGGESTIONS,
  runLabel,
  useAssistantRuns,
  type AssistantConversation,
  type AssistantSource,
  type AssistantTurn,
} from '../../../_data/assistant.js';
import { TODAY } from '../../../_data/index.js';
import { usePlatform, useScreens } from '../../../_platform/index.js';
import { Lines, Page } from '../../../_ui/index.js';
import './style.css';

const AGENT = { id: 'agent', name: ASSISTANT_NAME };
/** 제안 승인 · 반려를 서버에 보내는 시간(흉내) */
const SAVE_MS = 500;

/** 대화 목록 한 줄의 보조 글자: 확인 대기 · 실패 · 쓰는 중이 먼저, 아니면 마지막 질문 */
function statusOf(c: AssistantConversation): string {
  const last = c.turns[c.turns.length - 1];
  if (!last) return '질문을 기다립니다';
  if (last.streaming) return '답변을 쓰는 중';
  if (last.failed) return `${runLabel('failed')} · 다시 생성하세요`;
  if (last.proposal?.status === 'waiting') return `${runLabel('waiting')} · 변경 제안 1건`;
  return last.question;
}

export default function AssistantChat() {
  const toast = useToast();
  const screens = useScreens();
  const { session } = usePlatform();
  const me = `${session.user.name} ${session.user.title}`;
  const runs = useAssistantRuns(ASSISTANT_CONVERSATIONS, me);
  const bp = BREAKPOINTS.indexOf(useBreakpoint());
  const narrow = bp < BREAKPOINTS.indexOf('lg');
  const wide = bp >= BREAKPOINTS.indexOf('xl');
  const [activeId, setActiveId] = useState<string | null>(ASSISTANT_CONVERSATIONS[0]?.id ?? null);
  // 결과 칸: 처음에는 넓은 화면에서 첫 대화의 첫 출처를 연다
  const [result, setResult] = useState<AssistantSource | null>(() =>
    wide ? (ASSISTANT_CONVERSATIONS[0]?.turns[0]?.sources[0] ?? null) : null,
  );
  // 휴대폰: 목록 ↔ 대화 화면 이동
  const [view, setView] = useState<'list' | 'thread'>('thread');

  const active = runs.conversations.find((c) => c.id === activeId) ?? null;
  const turns = active?.turns ?? [];
  const lastTurn = turns[turns.length - 1];

  // slot: conversations — 대화 목록 행: 제목 · 상태 한 줄 · 마지막 질문 시각. 오늘과 그 전으로 묶는다
  const rows: SelectableListItem[] = runs.conversations.map((c) => {
    const last = c.turns[c.turns.length - 1];
    const day = last?.askedAt.slice(0, 10) ?? TODAY;
    return {
      id: c.id,
      title: c.title,
      secondary: statusOf(c),
      icon: 'bot',
      group: day === TODAY ? '오늘' : formatDate(day, 'md'),
      ...(last ? { meta: last.askedAt.slice(11) } : {}),
    };
  });
  // slot: conversations end

  const open = (id: string) => {
    setActiveId(id);
    setView('thread');
    setResult(null);
  };
  const startNew = () => {
    setActiveId(null);
    setView('thread');
    setResult(null);
  };

  const answerOf = (convId: string, t: AssistantTurn): MessageThreadWebItem => ({
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
    // slot: proposal — 데이터를 바꾸는 일은 제안 카드로만(사람이 승인해야 바뀐다, 반려는 사유 필수)
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
                  runs.resolve(convId, t.id, 'approved');
                  toast.show({ title: '변경을 적용했습니다', description: t.proposal?.title });
                })
              }
              onReject={(reason) => {
                runs.resolve(convId, t.id, 'rejected', reason);
                toast.show({ title: '제안을 반려했습니다', tone: 'neutral' });
              }}
            />
          ),
        }
      : {}),
    // slot: proposal end
  });

  const items: MessageThreadWebItem[] = active
    ? turns.flatMap((t) => [
        {
          id: `${t.id}-q`,
          author: { id: 'me', name: me },
          own: true,
          at: t.askedAt,
          text: t.question,
        },
        answerOf(active.id, t),
      ])
    : [];

  const send = (text: string, _files: File[], meta?: { command?: string }) => {
    const id = runs.ask(activeId, text, meta?.command);
    setActiveId(id);
    setResult(null);
  };

  const resultBody = result && (
    <div className="tl-block-agent-result__body">
      {result.excerpt && <p className="tl-block-agent-result__excerpt">{result.excerpt}</p>}
      {result.facts && result.facts.length > 0 && (
        <DescriptionList
          layout="vertical"
          columns={1}
          items={result.facts.map((f) => ({ ...f }))}
        />
      )}
      {result.screen && screens.has(result.screen) && (
        <Button
          icon="external-link"
          onPress={() =>
            screens.go(result.screen!, result.docId ? { id: result.docId } : undefined)
          }
        >
          화면 열기
        </Button>
      )}
    </div>
  );

  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: '업무 도우미' }]}
          title={ASSISTANT_NAME}
          description="문서 · 전표 · 재고를 묻고 근거와 함께 답을 받습니다. 데이터를 바꾸는 일은 승인해야 적용됩니다"
          actions={
            <Button icon="plus" onPress={startNew}>
              새 대화
            </Button>
          }
        />
      }
    >
      <div className="tl-block-agent" data-view={view} data-result={(result && wide) || undefined}>
        <nav className="tl-block-agent-list" aria-label="대화 목록">
          <SelectableList
            label="대화"
            items={rows}
            selected={activeId}
            onSelect={open}
            size={narrow ? 'sm' : 'md'}
            emptyText="대화가 없습니다. 새 대화에서 질문하세요"
          />
        </nav>

        <section
          className="tl-block-agent-thread"
          aria-label={active ? `${active.title} 대화` : '새 대화'}
        >
          <header className="tl-block-agent-thread__head">
            {narrow && (
              <IconButton icon="arrow-left" label="대화 목록" onPress={() => setView('list')} />
            )}
            <Lines
              primary={
                <span className="tl-block-agent-thread__title">{active?.title ?? '새 대화'}</span>
              }
              secondary={
                active && turns.length
                  ? `질문 ${turns.length}개 · ${statusOf(active)}`
                  : '문서 · 전표 · 재고를 묻습니다'
              }
            />
          </header>
          {turns.length === 0 ? (
            <div className="tl-block-agent-empty">
              <EmptyState
                icon="bot"
                title="아직 질문이 없습니다"
                description="아래 추천 질문을 고르거나 직접 입력하세요. /를 치면 찾을 범위를 고릅니다"
              />
            </div>
          ) : (
            <MessageThread
              key={`thread-${active?.id ?? 'new'}`}
              label={`${active?.title ?? ''} 대화`}
              messages={items}
              height="fill"
              today={TODAY}
              groupMinutes={30}
              onRegenerate={(id) => active && runs.regenerate(active.id, id)}
              onFeedback={(id, value) => active && runs.setFeedback(active.id, id, value)}
              onCitationOpen={(_id, source) => setResult(source as AssistantSource)}
            />
          )}
          {/* slot: composer */}
          <Composer
            key={`composer-${active?.id ?? 'new'}`}
            className="tl-block-agent-input"
            sticky
            attachable={false}
            label={`${ASSISTANT_NAME}에게 질문`}
            placeholder="문서 · 전표 · 재고를 묻습니다 · /로 범위"
            sendLabel="질문"
            loading={runs.running}
            commands={ASSISTANT_COMMANDS}
            {...(turns.length === 0 || lastTurn?.failed
              ? { suggestions: ASSISTANT_SUGGESTIONS }
              : {})}
            onSend={send}
          />
          {/* slot: composer end */}
        </section>

        {result && wide && (
          <aside className="tl-block-agent-result" aria-label={`근거 · ${result.title}`}>
            <header className="tl-block-agent-result__head">
              <Lines
                primary={<span className="tl-block-agent-result__title">{result.title}</span>}
                secondary={result.location ?? ''}
              />
              <IconButton icon="x" size="sm" label="근거 닫기" onPress={() => setResult(null)} />
            </header>
            {resultBody}
          </aside>
        )}
      </div>
      {!wide && (
        <Drawer
          open={result != null}
          onOpenChange={(o) => !o && setResult(null)}
          title={result?.title ?? '근거'}
          {...(result?.location ? { description: result.location } : {})}
          side={narrow ? 'bottom' : 'right'}
          width="md"
        >
          {resultBody}
        </Drawer>
      )}
    </Page>
  );
}
