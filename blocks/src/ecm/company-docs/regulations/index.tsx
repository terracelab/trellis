// 전사 규정 · 양식(ListDetail): 분류 탭 · 개정 예고 배너 · 목록 · 상세 Drawer(개정 이력 · 다운로드)
import { formatAttachmentSize, formatDate, formatDueDays } from '@terracelab/trellis-contracts';
import {
  Attachment,
  Badge,
  Banner,
  Button,
  DataGrid,
  DataGridLines,
  DescriptionList,
  Drawer,
  FilterBar,
  IconButton,
  Input,
  PageHeader,
  SegmentedControl,
  Select,
  Tabs,
  Timeline,
  useToast,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  REG_CATEGORIES,
  REG_STATES,
  REGULATIONS,
  revisionLabel,
  staffLabel,
  type RegCategory,
  type Regulation,
} from '../../../_data/ecm-crm.js';
import { TODAY } from '../../../_data/index.js';
import { useCan } from '../../../_platform/index.js';
import { ExportButton, Page, type CsvColumn } from '../../../_ui/index.js';
import './style.css';

const fileName = (r: Regulation) => `${r.no} ${r.title} ${revisionLabel(r.revision)}.${r.ext}`;
/** 엑셀 다운로드 열: 규정 목록(파일 자체는 행의 다운로드 단추) */
const CSV: CsvColumn<Regulation>[] = [
  { label: '문서 번호', value: 'no' },
  { label: '문서명', value: 'title' },
  { label: '분류', value: (r) => REG_CATEGORIES[r.category] },
  { label: '구분', value: 'kind' },
  { label: '개정 차수', value: (r) => revisionLabel(r.revision) },
  { label: '시행일', value: 'effectiveAt' },
  { label: '담당 부서', value: 'dept' },
  { label: '담당', value: (r) => staffLabel(r.owner) },
  { label: '상태', value: (r) => REG_STATES[r.state].label },
  { label: '파일 형식', value: (r) => r.ext.toUpperCase() },
];

export default function Regulations() {
  const toast = useToast();
  const canCreate = useCan('company-docs', 'create');
  const canExport = useCan('company-docs', 'export');
  const [tab, setTab] = useState('all');
  const [kind, setKind] = useState<string | null>('all');
  const [state, setState] = useState('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Regulation | null>(null);

  const inTab = REGULATIONS.filter((r) => tab === 'all' || r.category === tab);
  const shown = inTab.filter(
    (r) =>
      (kind === 'all' || !kind || r.kind === kind) &&
      (state === 'all' || r.state === state) &&
      (!q || `${r.no}${r.title}`.includes(q)),
  );
  const upcoming = REGULATIONS.filter((r) => r.state === 'upcoming');
  const download = (r: Regulation) =>
    toast.show({ title: '다운로드를 시작했습니다', description: fileName(r) });

  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: 'ECM' }, { label: '전사문서' }]}
          title="전사 규정 · 양식"
          description={`규정 · 지침 ${REGULATIONS.filter((r) => r.kind !== '양식').length}건 · 양식 ${REGULATIONS.filter((r) => r.kind === '양식').length}건 · 경영지원팀 관리`}
          actions={
            <>
              <ExportButton
                module="company-docs"
                name="전사 규정 · 양식"
                rows={shown}
                columns={CSV}
              >
                엑셀 다운로드
              </ExportButton>
              <Button variant="primary" icon="plus" disabled={!canCreate}>
                규정 등록
              </Button>
            </>
          }
          tabs={
            <Tabs
              label="분류"
              value={tab}
              onChange={setTab}
              items={[
                { value: 'all', label: '전체', count: REGULATIONS.length },
                ...(Object.keys(REG_CATEGORIES) as RegCategory[]).map((c) => ({
                  value: c,
                  label: REG_CATEGORIES[c],
                  count: REGULATIONS.filter((r) => r.category === c).length,
                })),
              ]}
            />
          }
        />
      }
    >
      {upcoming.length > 0 && (
        <Banner
          tone="warning"
          title={`개정 예고 ${upcoming.length}건 · ${formatDate(upcoming[0]!.effectiveAt, 'md')} 시행`}
          action={
            <Button
              size="sm"
              onPress={() => {
                setTab('all');
                setState('upcoming');
              }}
            >
              개정 예고 보기
            </Button>
          }
        >
          {upcoming.map((r) => `${r.title} ${revisionLabel(r.revision)}`).join(' · ')}가 시행
          전입니다. 시행일 전에 부서별로 공지하세요.
        </Banner>
      )}
      <FilterBar
        search={
          <Input
            type="search"
            icon="search"
            placeholder="문서 번호 · 문서명"
            label="규정 검색"
            value={q}
            onChange={setQ}
            clearable
            size="sm"
          />
        }
        onReset={() => {
          setQ('');
          setKind('all');
          setState('all');
          setTab('all');
        }}
        resultCount={shown.length}
      >
        <Select
          size="sm"
          width="auto"
          label="구분"
          value={kind}
          onChange={setKind}
          options={[
            { value: 'all', label: '구분 전체' },
            { value: '규정', label: '규정' },
            { value: '지침', label: '지침' },
            { value: '양식', label: '양식' },
          ]}
        />
        <SegmentedControl
          size="sm"
          label="시행 상태"
          value={state}
          onChange={setState}
          options={[
            { value: 'all', label: '전체' },
            { value: 'active', label: '시행' },
            { value: 'upcoming', label: '개정 예고', count: upcoming.length },
          ]}
        />
      </FilterBar>
      <DataGrid
        caption="전사 규정 · 양식"
        className="tl-block-reg-grid"
        height="fill"
        rows={shown}
        rowKey="id"
        onRowPress={setOpen}
        activeRowKey={open?.id ?? null}
        defaultSort={{ key: 'no', direction: 'asc' }}
        rowTone={(r) => (r.state === 'upcoming' ? 'warning' : undefined)}
        empty="이 조건의 규정 · 양식이 없습니다. 분류나 검색어를 바꿔 보세요"
        columns={[
          {
            key: 'no',
            header: '문서 번호',
            width: 'md',
            sticky: true,
            sortable: true,
            render: (r) => <span className="tl-block-code">{r.no}</span>,
          },
          {
            key: 'title',
            header: '문서명',
            sortable: true,
            render: (r) => (
              <DataGridLines
                primary={r.title}
                secondary={
                  <>
                    {REG_CATEGORIES[r.category]} · {r.kind} · {r.ext.toUpperCase()}{' '}
                    {formatAttachmentSize(r.size)}
                  </>
                }
              />
            ),
          },
          {
            key: 'revision',
            header: '개정 차수',
            width: 'sm',
            align: 'right',
            sortable: true,
            render: (r) => revisionLabel(r.revision),
          },
          {
            key: 'effectiveAt',
            header: '시행일',
            width: 'sm',
            sortable: true,
            render: (r) => (
              <DataGridLines
                primary={formatDate(r.effectiveAt)}
                secondary={r.effectiveAt > TODAY ? formatDueDays(r.effectiveAt, TODAY) : '시행 중'}
              />
            ),
          },
          {
            key: 'dept',
            header: '담당 부서',
            width: 'md',
            sortable: true,
            render: (r) => <DataGridLines primary={r.dept} secondary={staffLabel(r.owner)} />,
          },
          {
            key: 'state',
            header: '상태',
            width: 'sm',
            render: (r) => (
              <Badge tone={REG_STATES[r.state].tone}>{REG_STATES[r.state].label}</Badge>
            ),
          },
          {
            key: 'download',
            header: '파일',
            width: 'xs',
            align: 'center',
            render: (r) => (
              <IconButton
                icon="download"
                size="sm"
                label={`${r.title} 다운로드`}
                disabled={!canExport}
                onPress={() => download(r)}
              />
            ),
          },
        ]}
      />
      <Drawer
        open={open !== null}
        onOpenChange={(o) => !o && setOpen(null)}
        title={open?.title ?? ''}
        description={
          open
            ? `${open.no} · ${revisionLabel(open.revision)} · ${formatDate(open.effectiveAt)} 시행`
            : ''
        }
        width="lg"
        actions={
          open && <Badge tone={REG_STATES[open.state].tone}>{REG_STATES[open.state].label}</Badge>
        }
        footer={
          open && (
            <>
              <Button icon="printer">인쇄</Button>
              <Button disabled={!canCreate} icon="file-pen">
                개정 요청
              </Button>
              <Button
                variant="primary"
                icon="download"
                disabled={!canExport}
                onPress={() => download(open)}
              >
                다운로드
              </Button>
            </>
          )
        }
      >
        {open && (
          <div className="tl-block-drawer-stack">
            {open.state === 'upcoming' && (
              <Banner
                tone="warning"
                title={`${revisionLabel(open.revision)} 개정은 ${formatDate(open.effectiveAt, 'md')}부터 시행합니다`}
              >
                시행일 전날까지는 {revisionLabel(open.history[1]?.revision ?? 0)}을 적용합니다.
              </Banner>
            )}
            <DescriptionList
              columns={2}
              items={[
                { label: '문서 번호', value: open.no, copyable: true },
                {
                  label: '분류',
                  value: `${REG_CATEGORIES[open.category]} · ${open.kind}`,
                },
                { label: '개정 차수', value: revisionLabel(open.revision) },
                { label: '시행일', value: formatDate(open.effectiveAt) },
                { label: '담당 부서', value: open.dept },
                { label: '관리자', value: staffLabel(open.owner) },
                { label: '최종 승인', value: open.history[0]?.approvedBy ?? '–' },
                {
                  label: '제정일',
                  value: formatDate(open.history[open.history.length - 1]!.date),
                },
              ]}
            />
            <Attachment
              files={[
                { name: fileName(open), size: open.size },
                ...(open.kind !== '양식' && open.revision > 0
                  ? [
                      {
                        name: `${open.title} 신구 조문 대비표.pdf`,
                        size: Math.round(open.size * 0.32),
                      },
                    ]
                  : []),
              ]}
            />
            <section className="tl-block-reg-history" aria-label="개정 이력">
              <h3 className="tl-block-reg-history__title">개정 이력 {open.history.length}건</h3>
              <Timeline
                ariaLabel="개정 이력"
                items={open.history.map((h, i) => ({
                  id: `${open.id}-${h.revision}`,
                  title: h.revision === 0 ? '제정' : `${revisionLabel(h.revision)} 개정`,
                  time: formatDate(h.date),
                  description: h.summary,
                  actor: `승인 ${h.approvedBy}`,
                  tone:
                    h.date > TODAY
                      ? ('warning' as const)
                      : i === 0 || (i === 1 && open.state === 'upcoming')
                        ? ('success' as const)
                        : ('neutral' as const),
                  icon: h.revision === 0 ? ('file-plus' as const) : ('file-pen' as const),
                }))}
              />
            </section>
          </div>
        )}
      </Drawer>
    </Page>
  );
}
