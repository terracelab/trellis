// 플랫폼 기본 · 사용자: 계정 목록(역할 · 2단계 인증 · 상태)과 상세(역할 바꾸기 · 잠금 해제)
import {
  Badge,
  Button,
  DataGrid,
  DataGridLines,
  Drawer,
  Field,
  Input,
  PageHeader,
  Select,
} from '@terracelab/trellis-react';
import { useMemo, useState } from 'react';
import { ROLES, SCOPE_LABELS, USERS, useCan, type User } from '../../../_platform/index.js';
import { ExportButton, Page, Row, type CsvColumn } from '../../../_ui/index.js';

const STATUS = {
  active: { label: '사용 중', tone: 'success' },
  invited: { label: '초대됨', tone: 'info' },
  locked: { label: '잠김', tone: 'danger' },
} as const;

const roleName = (id: string) => ROLES.find((r) => r.id === id)?.name ?? id;

/** 엑셀 다운로드 열(표와 같은 순서) */
const CSV: CsvColumn<User>[] = [
  { label: '이름', value: 'name' },
  { label: '직위', value: 'title' },
  { label: '메일', value: 'email' },
  { label: '부서', value: 'department' },
  { label: '역할', value: (u) => u.roleIds.map(roleName).join(' · ') },
  { label: '2단계 인증', value: (u) => (u.mfa ? '사용' : '미사용') },
  { label: '상태', value: (u) => STATUS[u.status].label },
  { label: '마지막 로그인', value: 'lastLoginAt' },
];

export default function Users() {
  const canEdit = useCan('platform', 'update');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string | null>('all');
  const [open, setOpen] = useState<User | null>(null);
  const rows = useMemo(
    () =>
      USERS.filter(
        (u) =>
          (!q || `${u.name}${u.email}${u.department}`.includes(q)) &&
          (status === 'all' || !status || u.status === status),
      ),
    [q, status],
  );
  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: '관리' }, { label: '사용자' }]}
          title="사용자"
          description={`계정 ${USERS.length}개 · 2단계 인증 ${USERS.filter((u) => u.mfa).length}명`}
          actions={
            <>
              <ExportButton module="platform" name="사용자" rows={rows} columns={CSV}>
                엑셀 다운로드
              </ExportButton>
              <Button variant="primary" icon="user-plus" disabled={!canEdit}>
                사용자 초대
              </Button>
            </>
          }
        />
      }
    >
      <Row justify="start">
        <div style={{ width: 'calc(var(--tl-space-64) * 4)' }}>
          <Input
            type="search"
            icon="search"
            placeholder="이름 · 메일 · 부서"
            value={q}
            onChange={setQ}
            clearable
            size="sm"
          />
        </div>
        <Select
          size="sm"
          width="auto"
          value={status}
          onChange={setStatus}
          label="상태"
          options={[
            { value: 'all', label: '상태 전체' },
            { value: 'active', label: '사용 중' },
            { value: 'invited', label: '초대됨' },
            { value: 'locked', label: '잠김' },
          ]}
        />
      </Row>
      <DataGrid
        caption="사용자"
        height="fill"
        rows={rows}
        rowKey="id"
        activeRowKey={open?.id ?? null}
        onRowPress={setOpen}
        rowTone={(u) => (u.status === 'locked' ? 'danger' : undefined)}
        columns={[
          {
            key: 'name',
            header: '이름',
            width: 'lg',
            sortable: true,
            render: (u) => (
              <DataGridLines
                primary={
                  <>
                    {u.name} {u.title}
                  </>
                }
                secondary={u.email}
              />
            ),
          },
          { key: 'department', header: '부서', width: 'md', sortable: true },
          { key: 'roles', header: '역할', render: (u) => u.roleIds.map(roleName).join(' · ') },
          {
            key: 'mfa',
            header: '2단계 인증',
            width: 'sm',
            align: 'center',
            render: (u) =>
              u.mfa ? <Badge tone="success">사용</Badge> : <Badge tone="warning">미사용</Badge>,
          },
          {
            key: 'status',
            header: '상태',
            width: 'sm',
            render: (u) => <Badge tone={STATUS[u.status].tone}>{STATUS[u.status].label}</Badge>,
          },
          { key: 'lastLoginAt', header: '마지막 로그인', width: 'md', sortable: true },
        ]}
      />
      <Drawer
        open={open !== null}
        onOpenChange={(o) => !o && setOpen(null)}
        title={open ? `${open.name} ${open.title}` : ''}
        description={open ? `${open.department} · ${open.email}` : ''}
        width="md"
        footer={
          <>
            {open?.status === 'locked' && <Button disabled={!canEdit}>잠금 해제</Button>}
            <Button variant="primary" disabled={!canEdit} onPress={() => setOpen(null)}>
              저장
            </Button>
          </>
        }
      >
        {open && (
          <div style={{ display: 'grid', gap: 'var(--tl-space-16)' }}>
            <Field
              label="역할"
              help={`데이터 범위: ${SCOPE_LABELS[ROLES.find((r) => r.id === open.roleIds[0])?.scope ?? 'self']}`}
            >
              <Select
                options={ROLES.map((r) => ({ value: r.id, label: r.name }))}
                defaultValue={open.roleIds[0]}
                disabled={!canEdit}
              />
            </Field>
            <Field label="메일">
              <Input defaultValue={open.email} readOnly />
            </Field>
            <Field label="2단계 인증" help="관리자 · 경영지원 역할은 2단계 인증이 필수입니다">
              <Input defaultValue={open.mfa ? '사용 중 · 인증 앱' : '미사용'} readOnly />
            </Field>
          </div>
        )}
      </Drawer>
    </Page>
  );
}
