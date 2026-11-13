// 문서 작성(FormRegister): 서식 도구 · 제목 · 본문(문서 한 장) · 결재선과 결재 요청 · 공동 작업자 · 버전 · 붙임
import { formatDate, formatQuantity, type ApprovalState } from '@terracelab/trellis-contracts';
import {
  ApprovalLine,
  Attachment,
  Badge,
  Button,
  Card,
  Dialog,
  DialogClose,
  Field,
  FormSection,
  Input,
  PageHeader,
  PersonLabel,
  Select,
  Textarea,
  Timeline,
  Toolbar,
  useToast,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import { DRAFT_DOC, staffLabel } from '../../../_data/ecm-crm.js';
import { TODAY } from '../../../_data/index.js';
import { NOW, NOW_AT } from '../../../_data/profile.js';
import { useCan } from '../../../_platform/index.js';
import { Page, Split, Stack } from '../../../_ui/index.js';
import './style.css';

const D = DRAFT_DOC.drafter;
const DRAFTER = `${D.name} ${D.title}`;
const S = DRAFT_DOC.samples;
const FIRST_APPROVER = DRAFT_DOC.approvers[0];

type Version = { id: string; title: string; time: string; actor: string };

export default function DocEditor() {
  const toast = useToast();
  const canRequest = useCan('doc-editor', 'create');
  const [form, setForm] = useState<string | null>('proposal');
  const [retention, setRetention] = useState<string | null>('5');
  const [scope, setScope] = useState<string | null>('dept');
  const [title, setTitle] = useState(DRAFT_DOC.title);
  const [body, setBody] = useState(DRAFT_DOC.body);
  const [para, setPara] = useState<string | null>('body');
  const [bold, setBold] = useState(false);
  const [files, setFiles] = useState(() => [...DRAFT_DOC.attachments]);
  const [versions, setVersions] = useState<Version[]>(() => [...DRAFT_DOC.versions]);
  const [approval, setApproval] = useState<ApprovalState>('draft');
  const [requestedAt, setRequestedAt] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const locked = approval === 'pending';
  const append = (text: string) => setBody((b) => `${b.replace(/\n*$/, '')}\n${text}`);
  const addFile = (name: string, size: number) =>
    setFiles((fs) => (fs.some((f) => f.name === name) ? fs : [...fs, { name, size }]));
  const save = (label: string) => {
    setVersions((vs) => [
      { id: `v${vs.length + 1}`, title: label, time: NOW_AT, actor: DRAFTER },
      ...vs,
    ]);
    toast.show({ title: '임시 저장했습니다', description: `${DRAFT_DOC.no} · ${NOW}` });
  };

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: 'ECM' }, { label: '문서작성' }, { label: DRAFT_DOC.no }]}
          title="문서 작성"
          meta={<Badge approval={approval} />}
          description={`${DRAFT_DOC.no} · ${D.team} ${DRAFTER} · 마지막 저장 ${versions[0]!.time.slice(11)}`}
          actions={
            <>
              <Button icon="eye">미리 보기</Button>
              <Button icon="save" disabled={locked} onPress={() => save('임시 저장')}>
                임시 저장
              </Button>
            </>
          }
        />
      }
    >
      <Split
        main={
          <Card padding="none">
            <Toolbar
              className="tl-block-doc-toolbar"
              label="서식"
              disabled={locked}
              end={`${formatQuantity(body.length, '자')} · 붙임 ${files.length}건`}
              onPress={(id) => {
                if (id === 'bold') setBold((b) => !b);
                else if (id === 'list') append('- ');
                else if (id === 'table') {
                  append(S.table);
                  toast.show({ title: '표를 넣었습니다', description: '본문 끝에 3열 4행' });
                } else if (id === 'image') {
                  addFile(S.image.name, S.image.size);
                  append(`[이미지] ${S.image.name}`);
                } else if (id === 'file') {
                  addFile(S.file.name, S.file.size);
                  toast.show({ title: '파일을 붙였습니다', description: S.file.name });
                }
              }}
              groups={[
                {
                  id: 'para',
                  label: '문단',
                  content: (
                    <Select
                      size="sm"
                      width="auto"
                      label="문단 서식"
                      value={para}
                      onChange={setPara}
                      disabled={locked}
                      options={[
                        { value: 'body', label: '본문' },
                        { value: 'h1', label: '제목 1' },
                        { value: 'h2', label: '제목 2' },
                        { value: 'quote', label: '인용' },
                      ]}
                    />
                  ),
                },
                {
                  id: 'marks',
                  label: '글자 서식',
                  items: [
                    {
                      id: 'bold',
                      label: '굵게',
                      text: '가',
                      textStyle: 'bold',
                      shortcut: 'Ctrl+B',
                      pressed: bold,
                    },
                  ],
                },
                {
                  id: 'insert',
                  label: '넣기',
                  items: [
                    { id: 'list', label: '목록', icon: 'list' },
                    { id: 'table', label: '표', icon: 'table' },
                    { id: 'image', label: '이미지', icon: 'image' },
                    { id: 'file', label: '첨부', icon: 'paperclip' },
                  ],
                },
              ]}
            />

            <div className="tl-block-doc-form">
              <FormSection columns={3}>
                <Field label="문서 종류" required>
                  <Select
                    value={form}
                    onChange={setForm}
                    disabled={locked}
                    options={[
                      { value: 'proposal', label: '품의서' },
                      { value: 'report', label: '보고서' },
                      { value: 'letter', label: '공문' },
                    ]}
                  />
                </Field>
                <Field label="보존 기한">
                  <Select
                    value={retention}
                    onChange={setRetention}
                    disabled={locked}
                    options={[
                      { value: '3', label: '3년' },
                      { value: '5', label: '5년' },
                      { value: '10', label: '10년' },
                    ]}
                  />
                </Field>
                <Field label="공개 범위">
                  <Select
                    value={scope}
                    onChange={setScope}
                    disabled={locked}
                    options={[
                      { value: 'dept', label: '경영지원팀 · 결재선' },
                      { value: 'line', label: '결재선만' },
                      { value: 'all', label: '전사' },
                    ]}
                  />
                </Field>
                <Field label="제목" required span={3}>
                  <Input value={title} onChange={setTitle} readOnly={locked} maxLength={80} />
                </Field>
              </FormSection>
            </div>

            <div className="tl-block-doc-canvas">
              <article className="tl-block-doc-sheet" aria-label="문서">
                <header className="tl-block-doc-sheet__head">
                  <p className="tl-block-doc-sheet__form">{DRAFT_DOC.form}</p>
                  <h2 className="tl-block-doc-sheet__title">{title || '제목 없음'}</h2>
                  <dl className="tl-block-doc-sheet__meta">
                    <div>
                      <dt>문서 번호</dt>
                      <dd>{DRAFT_DOC.no}</dd>
                    </div>
                    <div>
                      <dt>기안</dt>
                      <dd>
                        {D.team} {DRAFTER}
                      </dd>
                    </div>
                    <div>
                      <dt>기안일</dt>
                      <dd>{formatDate(TODAY)}</dd>
                    </div>
                  </dl>
                </header>
                <Textarea
                  className="tl-block-doc-body"
                  aria-label="본문"
                  value={body}
                  onChange={setBody}
                  readOnly={locked}
                  rows={20}
                  resize="none"
                />
              </article>
            </div>
          </Card>
        }
        aside={
          <Stack gap="lg">
            <Card
              title="결재"
              subtitle={`결재선 ${DRAFT_DOC.approvers.length + 1}명 · 참조 ${DRAFT_DOC.cc.length}명(${DRAFT_DOC.cc.join(' · ')})`}
              footer={
                locked ? (
                  <Button
                    fullWidth
                    icon="undo-2"
                    onPress={() => {
                      setApproval('withdrawn');
                      setRequestedAt(null);
                      toast.show({
                        title: '결재를 회수했습니다',
                        description: '수정한 뒤 다시 결재 요청할 수 있습니다',
                        tone: 'neutral',
                      });
                    }}
                  >
                    회수
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    variant="primary"
                    icon="send"
                    disabled={!canRequest || !title.trim()}
                    onPress={() => setConfirm(true)}
                  >
                    결재 요청
                  </Button>
                )
              }
            >
              <ApprovalLine
                orientation="vertical"
                approvers={[
                  {
                    id: 'a1',
                    name: D.name,
                    title: D.title,
                    role: '기안',
                    state: 'draft',
                    ...(requestedAt ? { time: requestedAt } : {}),
                  },
                  ...DRAFT_DOC.approvers.map((a, i) => ({
                    id: `a${i + 2}`,
                    name: a.name,
                    title: a.title,
                    role: a.role,
                    state: locked && i === 0 ? ('pending' as const) : ('waiting' as const),
                  })),
                ]}
              />
            </Card>
            <Card
              title="공동 작업자"
              subtitle={`${DRAFT_DOC.collaborators.length}명 · 지금 ${DRAFT_DOC.collaborators.filter((c) => c.status === 'online').length}명 보는 중`}
              action={
                <Button size="sm" variant="ghost" icon="user-plus">
                  초대
                </Button>
              }
            >
              <ul className="tl-block-doc-people">
                {DRAFT_DOC.collaborators.map((c) => (
                  <li key={c.name} className="tl-block-doc-people__row">
                    <PersonLabel
                      name={`${c.name} ${c.title}`}
                      meta={c.status === 'online' ? '보는 중' : '자리 비움'}
                    />
                    <Badge tone={c.role === '작성자' ? 'info' : 'neutral'} size="sm">
                      {c.role}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Card>
            <Card title="붙임" subtitle={`${files.length}건 · 결재 문서와 함께 보관`}>
              <Attachment
                files={files}
                {...(locked
                  ? {}
                  : {
                      onRemove: (name: string) =>
                        setFiles((fs) => fs.filter((f) => f.name !== name)),
                    })}
              />
            </Card>
            <Card title="버전" subtitle={`${versions.length}개 · 자동 저장 5분마다`}>
              <Timeline
                dense
                ariaLabel="버전 기록"
                items={versions.map((v, i) => ({
                  id: v.id,
                  title: v.title,
                  time: v.time,
                  actor: v.actor,
                  tone: i === 0 ? ('info' as const) : ('neutral' as const),
                }))}
              />
            </Card>
          </Stack>
        }
      />
      <Dialog
        open={confirm}
        onOpenChange={setConfirm}
        title="결재를 요청합니다"
        description={`${title} · ${DRAFT_DOC.approvers.map((a) => `${a.role} ${a.name} ${a.title}`).join(' → ')}. 결재 중에는 본문을 고칠 수 없고 회수하면 다시 고칠 수 있습니다.`}
        footer={
          <>
            <DialogClose render={<Button>취소</Button>} />
            <DialogClose
              render={
                <Button
                  variant="primary"
                  icon="send"
                  onPress={() => {
                    setApproval('pending');
                    setRequestedAt(NOW_AT.slice(5));
                    setVersions((vs) => [
                      {
                        id: `v${vs.length + 1}`,
                        title: '결재 요청',
                        time: NOW_AT,
                        actor: staffLabel(D.name),
                      },
                      ...vs,
                    ]);
                    toast.show({
                      title: '결재를 요청했습니다',
                      description: FIRST_APPROVER
                        ? `${FIRST_APPROVER.name} ${FIRST_APPROVER.title}에게 ${FIRST_APPROVER.role} 알림을 보냈습니다`
                        : '',
                      tone: 'success',
                    });
                  }}
                >
                  결재 요청
                </Button>
              }
            />
          </>
        }
      />
    </Page>
  );
}
