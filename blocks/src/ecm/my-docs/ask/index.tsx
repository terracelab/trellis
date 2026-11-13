// 문서 질의응답(ConversationalWork 화면 2, PG-34): 문서 목록(DataGrid, 고르면 맥락) 옆에 AppShell 옆 칸(AppShellAside)으로
// 업무 도우미 대화를 붙인다. 옆 칸은 모달이 아니라 목록 · 미리 보기를 계속 쓴다(1024 미만은 아래 시트).
// 답의 출처 번호 · 출처 목록을 누르면 그 문서 미리 보기가 열린다. 답은 _data/assistant.ts의 정해진 답이다
import { formatAttachmentSize, formatDate } from '@terracelab/trellis-contracts';
import {
  AppShellAside,
  Attachment,
  BREAKPOINTS,
  Button,
  Card,
  Composer,
  DataGrid,
  DataGridLines,
  DescriptionList,
  EmptyState,
  Icon,
  IconButton,
  Input,
  MessageThread,
  PageHeader,
  RunSteps,
  useAppShellAsideId,
  useBreakpoint,
  type MessageThreadWebItem,
} from '@terracelab/trellis-react';
import type { IconName } from '@terracelab/trellis-icons';
import { useRef, useState } from 'react';
import {
  ASSISTANT_NAME,
  DOC_CONVERSATION,
  DOC_SUGGESTIONS,
  useAssistantRuns,
  type AssistantSource,
} from '../../../_data/assistant.js';
import {
  extOf,
  MY_FILES,
  MY_FOLDERS,
  staffLabel,
  versionsOf,
  type DocFile,
} from '../../../_data/ecm-crm.js';
import { TODAY } from '../../../_data/index.js';
import { usePlatform, useScreens } from '../../../_platform/index.js';
import { Page } from '../../../_ui/index.js';
import './style.css';

const FILE_ICON: Record<string, IconName> = {
  xlsx: 'file-spreadsheet',
  pdf: 'file-text',
  docx: 'file-text',
  zip: 'archive',
  jpg: 'image',
};
const AGENT = { id: 'agent', name: ASSISTANT_NAME };
const folderName = (id: string) => MY_FOLDERS.find((f) => f.id === id)?.name ?? '';
/** 휴지통은 묻는 대상에서 뺀다 */
const DOCS = MY_FILES.filter((f) => f.folderId !== 'trash');

export default function DocAsk() {
  const screens = useScreens();
  const { session } = usePlatform();
  const me = `${session.user.name} ${session.user.title}`;
  const narrow = BREAKPOINTS.indexOf(useBreakpoint()) < BREAKPOINTS.indexOf('lg');
  const asideId = useAppShellAsideId();
  const runs = useAssistantRuns([DOC_CONVERSATION], me);
  // 넓은 화면은 옆 칸을 연 채로 시작한다. 휴대폰은 시트(모달)라 단추로 연다
  const [open, setOpen] = useState(() => !narrow);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  // 넓은 화면은 처음 대화가 가리키는 문서를 미리 보기로 연다. 휴대폰은 목록부터
  const [previewId, setPreviewId] = useState<string | null>(() =>
    narrow ? null : (DOC_CONVERSATION.turns[0]?.sources[0]?.docId ?? null),
  );
  const previewRef = useRef<HTMLDivElement>(null);

  const conv = runs.conversations[0]!;
  const shown = DOCS.filter((f) => !q || f.name.includes(q) || folderName(f.folderId).includes(q));
  const picked = DOCS.filter((f) => selected.includes(f.id));
  const context: DocFile[] = picked.length ? picked : shown;
  const preview = DOCS.find((f) => f.id === previewId);

  const openDoc = (docId: string) => {
    setPreviewId(docId);
    // 휴대폰은 시트를 닫아야 문서가 보인다. 넓은 화면은 옆 칸을 연 채로 둔다
    if (narrow) setOpen(false);
    requestAnimationFrame(() => previewRef.current?.scrollIntoView({ block: 'nearest' }));
  };

  const items: MessageThreadWebItem[] = conv.turns.flatMap((t) => [
    { id: `${t.id}-q`, author: { id: 'me', name: me }, own: true, at: t.askedAt, text: t.question },
    {
      id: t.id,
      kind: 'answer' as const,
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
    },
  ]);

  const v = preview ? versionsOf(preview)[0] : undefined;

  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: 'ECM' }, { label: '문서함' }]}
          title="문서 질의응답"
          description={`내 문서 ${DOCS.length}건 · 문서를 고르고 ${ASSISTANT_NAME}에게 내용을 묻습니다`}
          actions={
            <>
              {screens.has('ecm/my-docs/browser') && (
                <Button
                  variant="ghost"
                  icon="folder"
                  onPress={() => screens.go('ecm/my-docs/browser')}
                >
                  문서함
                </Button>
              )}
              <Button
                icon="panel-right-open"
                aria-expanded={open}
                {...(asideId ? { 'aria-controls': asideId } : {})}
                onPress={() => setOpen(!open)}
              >
                {ASSISTANT_NAME}
              </Button>
            </>
          }
        />
      }
    >
      <div className="tl-block-ask">
        <div className="tl-block-ask-tools">
          <Input
            type="search"
            icon="search"
            size="sm"
            label="문서 검색"
            placeholder="문서 이름 · 폴더"
            value={q}
            onChange={setQ}
            clearable
          />
          <span className="tl-block-ask-tools__count" role="status">
            {picked.length ? `${picked.length}건 고름` : `${shown.length}건`}
          </span>
        </div>

        {/* slot: preview */}
        {preview && v && (
          <div ref={previewRef} className="tl-block-ask-preview">
            <Card
              title={preview.name}
              subtitle={`${folderName(preview.folderId)} · ${preview.version}판 · ${formatAttachmentSize(preview.size)}`}
              action={
                <IconButton
                  icon="x"
                  size="sm"
                  label="미리 보기 닫기"
                  onPress={() => setPreviewId(null)}
                />
              }
              footer={
                screens.has('ecm/my-docs/browser') ? (
                  <Button
                    size="sm"
                    icon="external-link"
                    onPress={() => screens.go('ecm/my-docs/browser', { id: preview.id })}
                  >
                    문서함에서 열기
                  </Button>
                ) : null
              }
            >
              <div className="tl-block-ask-preview__body">
                <DescriptionList
                  columns={narrow ? 1 : 2}
                  layout="vertical"
                  items={[
                    { label: '최근 판', value: `${v.version}판 · ${v.note}` },
                    { label: '수정', value: `${staffLabel(v.by)} · ${v.at}` },
                    { label: '보존 기한', value: `${preview.retainUntil} · ${preview.retention}` },
                    { label: '공유', value: preview.sharedWith.join(' · ') || '나만' },
                  ]}
                />
                {preview.attachments && preview.attachments.length > 0 && (
                  <Attachment files={preview.attachments} />
                )}
              </div>
            </Card>
          </div>
        )}
        {/* slot: preview end */}

        {/* slot: columns */}
        <DataGrid
          caption="내 문서"
          height="fill"
          rows={shown}
          rowKey="id"
          selectable
          selected={selected}
          onSelectedChange={setSelected}
          onRowPress={(r) => openDoc(r.id)}
          activeRowKey={previewId}
          defaultSort={{ key: 'modifiedAt', direction: 'desc' }}
          empty="찾는 문서가 없습니다. 이름을 다시 확인하세요"
          columns={[
            {
              key: 'name',
              header: '이름',
              sticky: true,
              wrap: true,
              sortable: true,
              render: (r) => (
                <span className="tl-block-ask-file">
                  <Icon name={FILE_ICON[extOf(r.name)] ?? 'file'} size={16} />
                  <DataGridLines primary={r.name} secondary={folderName(r.folderId)} />
                </span>
              ),
            },
            {
              key: 'version',
              header: '판',
              width: 'xs',
              align: 'right',
              render: (r) => `${r.version}판`,
            },
            {
              key: 'modifiedAt',
              header: '수정일 · 사람',
              width: 'sm',
              sortable: true,
              render: (r) => (
                <DataGridLines
                  primary={formatDate(r.modifiedAt.slice(0, 10))}
                  secondary={staffLabel(r.modifiedBy)}
                />
              ),
            },
          ]}
        />
        {/* slot: columns end */}
      </div>

      <AppShellAside
        title={ASSISTANT_NAME}
        open={open}
        onOpenChange={setOpen}
        actions={
          <IconButton icon="plus" size="sm" label="새 대화" onPress={() => runs.clear(conv.id)} />
        }
      >
        <p className="tl-block-ask-context">
          <Icon name="file-text" size={16} className="tl-block-ask-context__icon" />
          <span>
            {picked.length ? '고른 문서' : '목록의 문서'} {context.length}건
            {context[0]
              ? ` · ${context[0].name}${context.length > 1 ? ` 외 ${context.length - 1}건` : ''}`
              : ''}
          </span>
        </p>
        {conv.turns.length === 0 ? (
          <div className="tl-block-ask-empty">
            <EmptyState
              size="sm"
              icon="bot"
              title="아직 질문이 없습니다"
              description="문서를 고르고 아래 추천 질문을 누르거나 직접 입력하세요"
            />
          </div>
        ) : (
          <MessageThread
            label={`${ASSISTANT_NAME} 대화`}
            messages={items}
            height="fill"
            today={TODAY}
            groupMinutes={30}
            onRegenerate={(id) => runs.regenerate(conv.id, id, context)}
            onFeedback={(id, value) => runs.setFeedback(conv.id, id, value)}
            onCitationOpen={(_id, source) => {
              const docId = (source as AssistantSource).docId;
              if (docId) openDoc(docId);
            }}
          />
        )}
        <Composer
          className="tl-block-ask-input"
          sticky
          attachable={false}
          label={`${ASSISTANT_NAME}에게 질문`}
          placeholder="문서 내용을 묻습니다"
          sendLabel="질문"
          loading={runs.running}
          suggestions={DOC_SUGGESTIONS.filter((s) => !conv.turns.some((t) => t.question === s))}
          onSend={(text) => {
            runs.ask(conv.id, text, undefined, context);
          }}
        />
      </AppShellAside>
    </Page>
  );
}
