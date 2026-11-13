// 플랫폼 기본 · 감사 로그
import {
  Badge,
  DataGrid,
  FilterBar,
  Input,
  PageHeader,
  Pagination,
  PeriodPicker,
  Select,
} from '@terracelab/trellis-react';
import modules from '@terracelab/trellis-tokens/modules';
import { useState } from 'react';
import { TODAY } from '../../../_data/index.js';
import { AUDIT, USERS, type AuditEntry } from '../../../_platform/index.js';
import { ExportButton, monthStart, Page, type CsvColumn } from '../../../_ui/index.js';

const label = (id: string) => modules.modules.find((m) => m.id === id)?.label ?? '플랫폼';
const risky = (a: string) => /권한|실패|잠금|삭제/.test(a);

/** 엑셀 다운로드 열(표와 같은 순서) */
const CSV: CsvColumn<AuditEntry>[] = [
  { label: '일시', value: 'at' },
  { label: '사용자', value: 'actor' },
  { label: '동작', value: 'action' },
  { label: '대상', value: 'target' },
  { label: '모듈', value: (a) => label(a.module) },
  { label: 'IP', value: 'ip' },
];

export default function Audit() {
  const [q, setQ] = useState('');
  const [actor, setActor] = useState<string | null>('all');
  const [period, setPeriod] = useState({ from: monthStart(TODAY), to: TODAY });
  const [page, setPage] = useState(1);
  const rows = AUDIT.filter(
    (a) =>
      (actor === 'all' || !actor || a.actor === actor) &&
      (!q || `${a.action}${a.target}`.includes(q)) &&
      a.at.slice(0, 10) >= period.from &&
      a.at.slice(0, 10) <= period.to,
  );
  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: '관리' }, { label: '감사 로그' }]}
          title="감사 로그"
          description="5년 보관 · 수정할 수 없습니다"
          actions={
            <ExportButton module="platform" name="감사 로그" rows={rows} columns={CSV}>
              엑셀 다운로드
            </ExportButton>
          }
        />
      }
    >
      <FilterBar
        search={
          <Input
            type="search"
            icon="search"
            placeholder="동작 · 대상"
            value={q}
            onChange={setQ}
            clearable
            size="sm"
          />
        }
        resultCount={rows.length}
        onReset={() => {
          setQ('');
          setActor('all');
        }}
      >
        <PeriodPicker label="기간" value={period} onChange={setPeriod} today={TODAY} size="sm" />
        <Select
          size="sm"
          width="auto"
          label="사용자"
          value={actor}
          onChange={setActor}
          options={[
            { value: 'all', label: '사용자 전체' },
            { value: '시스템', label: '시스템' },
            ...USERS.map((u) => ({ value: u.name, label: `${u.name} ${u.title}` })),
          ]}
        />
      </FilterBar>
      <DataGrid
        caption="감사 로그"
        height="fill"
        rows={rows}
        rowKey="id"
        rowTone={(a) => (risky(a.action) ? 'warning' : undefined)}
        columns={[
          { key: 'at', header: '일시', width: 'md' },
          { key: 'actor', header: '사용자', width: 'sm' },
          {
            key: 'action',
            header: '동작',
            width: 'lg',
            render: (a) => (risky(a.action) ? <Badge tone="warning">{a.action}</Badge> : a.action),
          },
          { key: 'target', header: '대상' },
          { key: 'module', header: '모듈', width: 'sm', render: (a) => label(a.module) },
          {
            key: 'ip',
            header: 'IP',
            width: 'md',
            render: (a) => <span className="tl-block-code">{a.ip}</span>,
          },
        ]}
      />
      <Pagination page={page} total={1_284} pageSize={20} onPageChange={setPage} />
    </Page>
  );
}
