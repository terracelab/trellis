// 문서함(ListDetail): 폴더 트리(FolderTree) · 파일 목록 · 미리 보기(FileViewer: 그림 · PDF · 파일 카드, 문서 정보 · 버전 · 공유 대상) ·
// 업로드 · 새 폴더 · 공유. 문서 행은 우클릭 · 길게 누르기 · Shift+F10으로 동작 메뉴(ContextMenu)를 연다. 같은 동작이 미리 보기 단추에도 있다.
// 미리 보기 주소는 _data/previews.ts(샘플은 브라우저에서 그린 blob 주소, 서비스는 파일 서버 주소)에서 받는다
import {
  formatAttachmentSize,
  formatDate,
  type FolderTreeNode,
  type MenuEntry,
} from '@terracelab/trellis-contracts';
import {
  Attachment,
  Badge,
  Button,
  Card,
  ContextMenu,
  DataGrid,
  DataGridLines,
  DateField,
  DescriptionList,
  Dialog,
  DialogClose,
  EmptyState,
  Field,
  FileUpload,
  FileViewer,
  FilterBar,
  FolderTree,
  Icon,
  Input,
  PageHeader,
  Progress,
  RadioGroup,
  SegmentedControl,
  Select,
  Timeline,
  useBreakpoint,
  useToast,
} from '@terracelab/trellis-react';
import type { IconName } from '@terracelab/trellis-icons';
import { useEffect, useState } from 'react';
import {
  extOf,
  FILE_KINDS,
  MY_FILES,
  MY_FOLDERS,
  SHARE_SCOPES,
  staffLabel,
  versionsOf,
  type DocFile,
  type DocFolder,
  type ShareScope,
} from '../../../_data/ecm-crm.js';
import { TODAY } from '../../../_data/index.js';
import { docPreview, SCANNED_FILES, type DocPreview } from '../../../_data/previews.js';
import { NOW_AT, PROFILE } from '../../../_data/profile.js';
import { useCan, usePlatform } from '../../../_platform/index.js';
import { addDays, monthEnd, monthLabel, Page } from '../../../_ui/index.js';
import './style.css';

const FILE_ICON: Record<string, IconName> = {
  xlsx: 'file-spreadsheet',
  pdf: 'file-text',
  docx: 'file-text',
  zip: 'archive',
  jpg: 'image',
  png: 'image',
};
const FOLDER_ICON: Record<string, IconName> = { root: 'folder', shared: 'users', trash: 'trash-2' };
const RETENTION = [
  { value: '3', label: '3년 · 내부 문서' },
  { value: '5', label: '5년 · 회계 · 세무 증빙' },
  { value: '10', label: '10년 · 계약서 · 결산 서류' },
];

export default function DocBrowser() {
  const toast = useToast();
  const { session } = usePlatform();
  const canCreate = useCan('my-docs', 'create');
  const canUpdate = useCan('my-docs', 'update');
  const [folders, setFolders] = useState<DocFolder[]>(() => [...MY_FOLDERS]);
  const [files, setFiles] = useState<DocFile[]>(() => [...MY_FILES, ...SCANNED_FILES]);
  const [folderId, setFolderId] = useState('root');
  const [expanded, setExpanded] = useState<string[]>(['root', 'close', 'tax']);
  const [q, setQ] = useState('');
  const [scope, setScope] = useState('all');
  const [activeId, setActiveId] = useState<string | null>('d04');
  const [upload, setUpload] = useState(false);
  const [queue, setQueue] = useState<{ name: string; size: number }[]>([]);
  const [retention, setRetention] = useState<string | null>('5');
  const [newFolder, setNewFolder] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [share, setShare] = useState(false);
  const [shareDraft, setShareDraft] = useState<ShareScope>('people');
  const [linkUntil, setLinkUntil] = useState<string | null>(() => monthEnd(TODAY));
  const [menuId, setMenuId] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ id: string; data: DocPreview | null } | null>(null);
  const [expand, setExpand] = useState(false);
  const bp = useBreakpoint();
  // 1280 이상은 목록 옆 좁은 칸, 그 아래는 목록 밑 넓은 칸
  const besideList = bp === 'xl' || bp === '2xl';

  const childrenOf = (id: string | null) => folders.filter((f) => f.parentId === id);
  const subtree = (id: string): string[] => [id, ...childrenOf(id).flatMap((c) => subtree(c.id))];
  const pathOf = (id: string): string[] => {
    const f = folders.find((x) => x.id === id);
    if (!f) return [];
    return f.parentId ? [...pathOf(f.parentId), f.name] : [f.name];
  };
  const folder = folders.find((f) => f.id === folderId)!;
  const folderIds = subtree(folderId);
  const inFolder = files.filter((f) => folderIds.includes(f.folderId));
  const shown = inFolder.filter(
    (f) =>
      (scope === 'all' || (scope === 'private' ? f.share === 'private' : f.share !== 'private')) &&
      (!q || f.name.includes(q)),
  );
  const active = files.find((f) => f.id === activeId) ?? null;
  // 미리 보기 주소: 고른 문서가 바뀌면 받는다(받는 동안 FileViewer가 Skeleton)
  useEffect(() => {
    const f = files.find((x) => x.id === activeId);
    if (!f) return;
    let alive = true;
    void docPreview(f).then((data) => {
      if (alive) setPreview({ id: f.id, data });
    });
    return () => {
      alive = false;
    };
  }, [activeId, files]);
  const shownPreview = active && preview?.id === active.id ? preview.data : null;
  const previewLoading = Boolean(active) && preview?.id !== active?.id;
  const download = (f: DocFile) => {
    const src = preview?.id === f.id ? preview.data?.src : undefined;
    if (src) {
      const a = document.createElement('a');
      a.href = src;
      a.download = f.name;
      a.click();
    }
    toast.show({ title: '다운로드를 시작했습니다', description: f.name });
  };
  const countOf = (id: string) => {
    const ids = subtree(id);
    return files.filter((f) => ids.includes(f.folderId)).length;
  };
  const uploadTarget = folderId === 'shared' || folderId === 'trash' ? 'root' : folderId;
  const relPath = (f: DocFile) => {
    const p = pathOf(f.folderId);
    const base = pathOf(folderId).length;
    return p.slice(Math.max(base, 1)).join(' / ') || p[p.length - 1] || '';
  };

  const toNodes = (parentId: string | null): FolderTreeNode[] =>
    childrenOf(parentId).map((f) => {
      const kids = toNodes(f.id);
      return {
        id: f.id,
        label: f.name,
        icon: FOLDER_ICON[f.id] ?? 'folder',
        count: countOf(f.id),
        ...(kids.length ? { children: kids } : {}),
      };
    });
  const pickFolder = (id: string) => {
    setFolderId(id);
    // 하위 폴더가 있으면 고를 때 펼쳐 보인다
    if (childrenOf(id).length && !expanded.includes(id)) setExpanded((e) => [...e, id]);
  };

  const moveToTrash = (f: DocFile) => {
    setFiles((fs) => fs.map((x) => (x.id === f.id ? { ...x, folderId: 'trash' } : x)));
    toast.show({
      title: '휴지통으로 옮겼습니다',
      description: `${f.name} · 30일 뒤 영구 삭제`,
      tone: 'neutral',
    });
  };
  const openShare = (f: DocFile) => {
    setActiveId(f.id);
    setShareDraft(f.share);
    setShare(true);
  };

  // 문서 행 메뉴. 보이는 단추(미리 보기 카드 · 머리의 공유)와 같은 동작을 행에서 바로 연다
  const menuFile = files.find((f) => f.id === menuId);
  const fileMenu: MenuEntry[] = menuFile
    ? [
        {
          id: 'preview',
          label: '미리 보기',
          icon: 'eye',
          onSelect: () => {
            setActiveId(menuFile.id);
            setExpand(true);
          },
        },
        {
          id: 'download',
          label: '다운로드',
          icon: 'download',
          onSelect: () => download(menuFile),
        },
        {
          id: 'share',
          label: '공유',
          icon: 'users',
          disabled: !canUpdate,
          onSelect: () => openShare(menuFile),
        },
        { type: 'separator' },
        {
          id: 'trash',
          label: '휴지통으로 이동',
          icon: 'trash-2',
          danger: true,
          disabled: !canUpdate || menuFile.folderId === 'trash',
          onSelect: () => moveToTrash(menuFile),
        },
      ]
    : [];

  const doUpload = () => {
    if (queue.length === 0) return;
    const added: DocFile[] = queue.map((u, i) => ({
      id: `u${Date.now()}${i}`,
      name: u.name,
      folderId: uploadTarget,
      size: u.size,
      modifiedBy: session.user.name,
      modifiedAt: NOW_AT,
      version: 1,
      retainUntil: `${Number(TODAY.slice(0, 4)) + Number(retention ?? 5)}-12-31`,
      retention: RETENTION.find((r) => r.value === retention)?.label.split(' · ')[1] ?? '',
      share: 'private',
      sharedWith: [],
    }));
    setFiles((fs) => [...added, ...fs]);
    setActiveId(added[0]!.id);
    setQueue([]);
    toast.show({
      title: `문서 ${added.length}건을 올렸습니다`,
      description: `${pathOf(uploadTarget).join(' / ')} · 비공개`,
      tone: 'success',
    });
  };

  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: 'ECM' }, { label: '문서함' }]}
          title="문서함"
          description={`${pathOf(folderId).join(' / ')} · 문서 ${inFolder.length}건 · 공유 중 ${inFolder.filter((f) => f.share !== 'private').length}건`}
          actions={
            <>
              <Button icon="folder" disabled={!canCreate} onPress={() => setNewFolder(true)}>
                새 폴더
              </Button>
              <Button
                icon="users"
                disabled={!active || !canUpdate}
                onPress={() => active && openShare(active)}
              >
                공유
              </Button>
              <Button
                variant="primary"
                icon="upload"
                disabled={!canCreate}
                onPress={() => setUpload(true)}
              >
                업로드
              </Button>
            </>
          }
        />
      }
    >
      <div className="tl-block-ecm-browser">
        <div className="tl-block-ecm-tree">
          <div className="tl-block-ecm-tree__scroll">
            <FolderTree
              label="폴더"
              nodes={toNodes(null)}
              selected={folderId}
              onSelect={pickFolder}
              expanded={expanded}
              onExpandedChange={setExpanded}
            />
          </div>
          <div className="tl-block-ecm-tree__foot">
            <Progress label="저장 공간" value={18} max={50} unit="GB" size="sm" />
          </div>
        </div>

        <section className="tl-block-ecm-files" aria-label="문서 목록">
          <FilterBar
            search={
              <Input
                type="search"
                icon="search"
                placeholder="문서 이름"
                label="문서 검색"
                value={q}
                onChange={setQ}
                clearable
                size="sm"
              />
            }
            onReset={() => {
              setQ('');
              setScope('all');
            }}
            resultCount={shown.length}
          >
            <SegmentedControl
              size="sm"
              label="공유 범위"
              value={scope}
              onChange={setScope}
              options={[
                { value: 'all', label: '전체' },
                { value: 'shared', label: '공유 중' },
                { value: 'private', label: '비공개' },
              ]}
            />
          </FilterBar>
          <ContextMenu
            title={menuFile?.name ?? '문서'}
            items={fileMenu}
            onOpenChange={(open, el) => {
              if (!open) return;
              // 표 행(tr) · 카드(li) 안에서 이름 칸이 단 data-file-id로 문서를 찾는다
              const row = el?.closest('tr, li');
              const id = row?.querySelector<HTMLElement>('[data-file-id]')?.dataset['fileId'];
              setMenuId(id ?? null);
              if (id) setActiveId(id);
            }}
          >
            <DataGrid
              caption={`${folder.name} 문서`}
              height="fill"
              rows={shown}
              rowKey="id"
              onRowPress={(r) => {
                setActiveId(r.id);
                // 휴대폰은 미리 보기가 목록 아래 멀리 있어 크게 보기로 바로 연다
                if (bp === 'base') setExpand(true);
              }}
              activeRowKey={activeId}
              defaultSort={{ key: 'modifiedAt', direction: 'desc' }}
              empty={
                folderId === 'trash'
                  ? '휴지통이 비어 있습니다. 삭제한 문서는 30일 동안 여기에 남습니다'
                  : '이 폴더에 문서가 없습니다. 업로드로 추가하세요'
              }
              columns={[
                {
                  key: 'name',
                  header: '이름',
                  sticky: true,
                  wrap: true,
                  sortable: true,
                  render: (r) => (
                    <span className="tl-block-ecm-file" data-file-id={r.id}>
                      <Icon
                        name={FILE_ICON[extOf(r.name)] ?? 'file'}
                        size={20}
                        className="tl-block-ecm-file__icon"
                      />
                      <DataGridLines primary={r.name} secondary={relPath(r)} />
                    </span>
                  ),
                },
                {
                  key: 'size',
                  header: '크기',
                  width: 'sm',
                  align: 'right',
                  sortable: true,
                  render: (r) => formatAttachmentSize(r.size),
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
                {
                  key: 'share',
                  header: '공유',
                  width: 'sm',
                  render: (r) => (
                    <Badge tone={SHARE_SCOPES[r.share].tone}>{SHARE_SCOPES[r.share].label}</Badge>
                  ),
                },
              ]}
            />
          </ContextMenu>
        </section>

        <aside className="tl-block-ecm-preview" aria-label="미리 보기">
          {active ? (
            <>
              {/* slot: preview — 미리 보기 높이 · 다운로드 동작. 주소는 _data/previews.ts docPreview */}
              <FileViewer
                key={active.id}
                name={active.name}
                size={active.size}
                src={shownPreview?.src}
                mimeType={shownPreview?.mimeType}
                pageCount={shownPreview?.pageCount}
                loading={previewLoading}
                height={besideList ? 'sm' : 'md'}
                onDownload={() => download(active)}
              />
              {/* slot: preview end */}
              <Card
                title="문서 정보"
                subtitle={`${FILE_KINDS[extOf(active.name)] ?? '파일'} · v${active.version}`}
                action={
                  <Badge tone={SHARE_SCOPES[active.share].tone}>
                    {SHARE_SCOPES[active.share].label}
                  </Badge>
                }
                footer={
                  <div className="tl-block-ecm-preview__foot">
                    <Button icon="maximize-2" onPress={() => setExpand(true)}>
                      크게 보기
                    </Button>
                    <Button icon="download" onPress={() => download(active)}>
                      다운로드
                    </Button>
                    <Button
                      variant="ghost"
                      icon="trash-2"
                      disabled={!canUpdate || active.folderId === 'trash'}
                      onPress={() => moveToTrash(active)}
                    >
                      휴지통으로 이동
                    </Button>
                  </div>
                }
              >
                <div className="tl-block-drawer-stack">
                  <DescriptionList
                    columns={1}
                    items={[
                      {
                        label: '버전',
                        value: `v${active.version} · ${active.modifiedAt}`,
                      },
                      {
                        label: '보존 기한',
                        value: `${active.retainUntil} · ${active.retention}`,
                      },
                      {
                        label: '공유 대상',
                        value: active.sharedWith.length ? active.sharedWith.join(' · ') : '나만 봄',
                      },
                      { label: '수정한 사람', value: staffLabel(active.modifiedBy) },
                      { label: '위치', value: pathOf(active.folderId).join(' / ') },
                    ]}
                  />
                  <section className="tl-block-ecm-section" aria-label="파일 · 붙임">
                    <h3 className="tl-block-ecm-section__title">
                      파일 · 붙임 {1 + (active.attachments?.length ?? 0)}건
                    </h3>
                    <Attachment
                      files={[
                        { name: active.name, size: active.size },
                        ...(active.attachments ?? []),
                      ]}
                    />
                  </section>
                  <section className="tl-block-ecm-section" aria-label="버전 이력">
                    <h3 className="tl-block-ecm-section__title">버전 이력</h3>
                    <Timeline
                      dense
                      ariaLabel="버전 이력"
                      items={versionsOf(active).map((v, i) => ({
                        id: `v${v.version}`,
                        title: `v${v.version} · ${v.note}`,
                        time: v.at,
                        actor: staffLabel(v.by),
                        tone: i === 0 ? ('info' as const) : ('neutral' as const),
                      }))}
                    />
                  </section>
                </div>
              </Card>
            </>
          ) : (
            <Card>
              <EmptyState
                icon="file-text"
                title="문서를 고르세요"
                description="목록에서 문서를 누르면 내용과 버전 · 보존 기한 · 공유 대상이 보입니다"
              />
            </Card>
          )}
        </aside>
      </div>

      {active && (
        <Dialog open={expand} onOpenChange={setExpand} size="lg" title={active.name}>
          <FileViewer
            key={active.id}
            name={active.name}
            size={active.size}
            src={shownPreview?.src}
            mimeType={shownPreview?.mimeType}
            pageCount={shownPreview?.pageCount}
            loading={previewLoading}
            height={bp === 'base' ? 'md' : 'lg'}
            onDownload={() => download(active)}
          />
        </Dialog>
      )}

      <Dialog
        open={upload}
        onOpenChange={(o) => {
          setUpload(o);
          if (!o) setQueue([]);
        }}
        title="문서 업로드"
        description={`${pathOf(uploadTarget).join(' / ')}에 올립니다. 같은 이름이 있으면 새 버전으로 올라갑니다.`}
        footer={
          <>
            <DialogClose render={<Button>취소</Button>} />
            <DialogClose
              render={
                <Button
                  variant="primary"
                  icon="upload"
                  disabled={queue.length === 0}
                  onPress={doUpload}
                >
                  {queue.length ? `${queue.length}건 업로드` : '업로드'}
                </Button>
              }
            />
          </>
        }
      >
        <div className="tl-block-drawer-stack">
          <Field label="파일" help="여러 파일을 한 번에 끌어 놓을 수 있습니다">
            <FileUpload
              accept=".pdf,.xlsx,.docx,.zip,.jpg,.png"
              multiple
              maxSize={52_428_800}
              hint="PDF · XLSX · DOCX · ZIP · JPG, 50MB 이하"
              files={queue.map((f) => ({ ...f, status: 'done' as const }))}
              onFilesChange={(picked) =>
                setQueue((qs) => [...qs, ...picked.map((f) => ({ name: f.name, size: f.size }))])
              }
              onRemove={(name) => setQueue((qs) => qs.filter((f) => f.name !== name))}
            />
          </Field>
          <Field label="보존 기한" help="기한이 지나면 문서 관리자에게 폐기 알림이 갑니다">
            <Select value={retention} onChange={setRetention} options={RETENTION} />
          </Field>
        </div>
      </Dialog>

      <Dialog
        open={newFolder}
        onOpenChange={(o) => {
          setNewFolder(o);
          if (!o) setFolderName('');
        }}
        size="sm"
        title="새 폴더"
        description={`${pathOf(uploadTarget).join(' / ')} 아래에 추가합니다.`}
        footer={
          <>
            <DialogClose render={<Button>취소</Button>} />
            <DialogClose
              render={
                <Button
                  variant="primary"
                  disabled={!folderName.trim()}
                  onPress={() => {
                    const id = `f${Date.now()}`;
                    setFolders((fs) => [
                      ...fs,
                      { id, name: folderName.trim(), parentId: uploadTarget },
                    ]);
                    setExpanded((e) => [...e, uploadTarget]);
                    setFolderId(id);
                    toast.show({ title: '폴더를 추가했습니다', description: folderName.trim() });
                  }}
                >
                  추가
                </Button>
              }
            />
          </>
        }
      >
        <Field label="폴더 이름" required>
          <Input
            value={folderName}
            onChange={setFolderName}
            placeholder={`${monthLabel(TODAY, 1)} 마감`}
          />
        </Field>
      </Dialog>

      <Dialog
        open={share}
        onOpenChange={setShare}
        title={`${active?.name ?? ''} 공유`}
        description="공유 범위를 바꾸면 감사 로그에 남습니다."
        footer={
          <>
            <DialogClose render={<Button>취소</Button>} />
            <DialogClose
              render={
                <Button
                  variant="primary"
                  onPress={() => {
                    if (!active) return;
                    setFiles((fs) =>
                      fs.map((f) =>
                        f.id === active.id
                          ? {
                              ...f,
                              share: shareDraft,
                              sharedWith:
                                shareDraft === 'private'
                                  ? []
                                  : shareDraft === 'dept'
                                    ? [session.user.department]
                                    : shareDraft === 'link'
                                      ? [`외부 링크(${linkUntil ?? TODAY}까지)`]
                                      : f.sharedWith.length
                                        ? f.sharedWith
                                        : [PROFILE.people.ceo],
                            }
                          : f,
                      ),
                    );
                    toast.show({
                      title: '공유 설정을 저장했습니다',
                      description: `${active.name} · ${SHARE_SCOPES[shareDraft].label}`,
                      tone: 'success',
                    });
                  }}
                >
                  저장
                </Button>
              }
            />
          </>
        }
      >
        <div className="tl-block-drawer-stack">
          <RadioGroup
            label="공유 범위"
            value={shareDraft}
            onChange={(v) => setShareDraft(v as ShareScope)}
            options={(Object.keys(SHARE_SCOPES) as ShareScope[]).map((k) => ({
              value: k,
              label: SHARE_SCOPES[k].label,
              description: SHARE_SCOPES[k].description,
            }))}
          />
          {shareDraft === 'link' && (
            <Field label="링크 만료일" help="정보보안 규정에 따라 30일 안에서 고릅니다" required>
              <DateField
                today={TODAY}
                value={linkUntil}
                onChange={setLinkUntil}
                min={TODAY}
                max={addDays(TODAY, 30)}
              />
            </Field>
          )}
        </div>
      </Dialog>
    </Page>
  );
}
