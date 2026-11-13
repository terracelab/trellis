// 부서 공유 문서(Settings): 부서 탭 · 문서 목록 · 구성원별 권한(보기 · 편집 · 관리) · 외부 공유 링크(만료일 · 사용)
import { formatAttachmentSize, formatDate, formatQuantity } from '@terracelab/trellis-contracts';
import {
  ActionBar,
  Badge,
  Banner,
  Button,
  Card,
  Checkbox,
  DataGrid,
  DataGridLines,
  DateField,
  DueBadge,
  Icon,
  IconButton,
  PageHeader,
  PersonLabel,
  RadioGroup,
  Select,
  Switch,
  Tabs,
  useToast,
} from '@terracelab/trellis-react';
import type { IconName } from '@terracelab/trellis-icons';
import { useState } from 'react';
import {
  DEPT_FILES,
  DEPT_MEMBERS,
  DEPTS,
  extOf,
  PERMISSION_LABELS,
  SHARE_LINKS,
  staffLabel,
  type Dept,
  type DeptMember,
  type DocPermission,
  type ShareLink,
} from '../../../_data/ecm-crm.js';
import { TODAY } from '../../../_data/index.js';
import { useCan } from '../../../_platform/index.js';
import { Col, Grid, Page } from '../../../_ui/index.js';
import './style.css';

const FILE_ICON: Record<string, IconName> = {
  xlsx: 'file-spreadsheet',
  pdf: 'file-text',
  docx: 'file-text',
  zip: 'archive',
};

type Policy = { external: boolean; days: string | null; password: boolean };
const DEFAULT_POLICY: Policy = { external: true, days: '14', password: false };
/** 첫 부서(경영지원 같은 관리 부서)만 외부 링크에 비밀번호를 건다 */
const initialPolicy = () =>
  Object.fromEntries(DEPTS.map((d, i) => [d, { ...DEFAULT_POLICY, password: i === 0 }])) as Record<
    Dept,
    Policy
  >;

export default function DeptShared() {
  const toast = useToast();
  const canManage = useCan('dept-docs', 'update');
  const [dept, setDept] = useState<Dept>(DEPTS[0] ?? '');
  const [members, setMembers] = useState<DeptMember[]>(() => DEPT_MEMBERS.map((m) => ({ ...m })));
  const [links, setLinks] = useState<ShareLink[]>(() => SHARE_LINKS.map((l) => ({ ...l })));
  const [policy, setPolicy] = useState<Record<Dept, Policy>>(initialPolicy);
  const [changes, setChanges] = useState(0);
  const files = DEPT_FILES.filter((f) => f.dept === dept).sort((a, b) =>
    b.modifiedAt.localeCompare(a.modifiedAt),
  );
  const team = members.filter((m) => m.dept === dept);
  const deptLinks = links.filter((l) => l.dept === dept);
  const live = deptLinks.filter((l) => l.enabled && l.expiresAt >= TODAY);
  const p = policy[dept] ?? DEFAULT_POLICY;
  const touch = () => setChanges((n) => n + 1);
  const setMember = (name: string, patch: Partial<DeptMember>) => {
    touch();
    setMembers((ms) =>
      ms.map((m) => (m.dept === dept && m.name === name ? { ...m, ...patch } : m)),
    );
  };
  const setLink = (id: string, patch: Partial<ShareLink>) => {
    touch();
    setLinks((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };
  const setPol = (patch: Partial<Policy>) => {
    touch();
    setPolicy((all) => ({ ...all, [dept]: { ...(all[dept] ?? DEFAULT_POLICY), ...patch } }));
  };

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: 'ECM' }, { label: '부서문서' }]}
          title="부서 공유 문서"
          description={`${dept} · 문서 ${files.length}건 · 구성원 ${team.length}명 · 외부 링크 ${live.length}건 사용 중`}
          actions={
            <>
              <Button icon="user-plus" disabled={!canManage}>
                구성원 추가
              </Button>
              <Button icon="upload" disabled={!canManage}>
                업로드
              </Button>
            </>
          }
          tabs={
            <Tabs
              label="부서"
              value={dept}
              onChange={(v) => setDept(v as Dept)}
              items={DEPTS.map((d) => ({
                value: d,
                label: d,
                count: DEPT_FILES.filter((f) => f.dept === d).length,
              }))}
            />
          }
        />
      }
    >
      <Grid>
        <Col span={7}>
          <Card title="문서" subtitle={`${files.length}건 · 수정일 순`} padding="none">
            <DataGrid
              caption={`${dept} 문서`}
              className="tl-block-dept-flat tl-block-dept-files"
              rows={files}
              rowKey="id"
              columns={[
                {
                  key: 'name',
                  header: '이름',
                  render: (r) => (
                    <span className="tl-block-dept-file">
                      <Icon
                        name={FILE_ICON[extOf(r.name)] ?? 'file'}
                        size={16}
                        className="tl-block-dept-file__icon"
                      />
                      <span className="tl-block-dept-file__name">{r.name}</span>
                    </span>
                  ),
                },
                {
                  key: 'size',
                  header: '크기',
                  width: 'sm',
                  align: 'right',
                  render: (r) => formatAttachmentSize(r.size),
                },
                {
                  key: 'modifiedAt',
                  header: '수정',
                  width: 'lg',
                  render: (r) => (
                    <DataGridLines
                      primary={formatDate(r.modifiedAt.slice(0, 10))}
                      secondary={staffLabel(r.modifiedBy)}
                    />
                  ),
                },
                {
                  key: 'download',
                  header: '받기',
                  width: 'xs',
                  align: 'center',
                  render: (r) => (
                    <IconButton
                      icon="download"
                      size="sm"
                      label={`${r.name} 다운로드`}
                      onPress={() =>
                        toast.show({ title: '다운로드를 시작했습니다', description: r.name })
                      }
                    />
                  ),
                },
              ]}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card
            title="구성원 권한"
            subtitle="관리 권한이 있으면 구성원과 외부 링크를 바꿀 수 있습니다"
            padding="none"
          >
            <div className="tl-block-perm" role="table" aria-label={`${dept} 구성원 권한`}>
              <div className="tl-block-perm__row tl-block-perm__head" role="row">
                <span role="columnheader">구성원</span>
                <span role="columnheader">권한</span>
                <span role="columnheader">다운로드</span>
              </div>
              {team.map((m) => (
                <div key={m.name} className="tl-block-perm__row" role="row">
                  <span role="rowheader" className="tl-block-perm__who">
                    <PersonLabel name={`${m.name} ${m.title}`} meta={m.org} />
                  </span>
                  <span role="cell">
                    <RadioGroup
                      orientation="horizontal"
                      label={`${m.name} 권한`}
                      value={m.permission}
                      onChange={(v) =>
                        setMember(m.name, {
                          permission: v as DocPermission,
                          ...(v === 'manage' ? { download: true } : {}),
                        })
                      }
                      disabled={!canManage}
                      options={(Object.keys(PERMISSION_LABELS) as DocPermission[]).map((k) => ({
                        value: k,
                        label: PERMISSION_LABELS[k],
                      }))}
                    />
                  </span>
                  <span role="cell" className="tl-block-perm__check">
                    <Checkbox
                      aria-label={`${m.name} 다운로드 허용`}
                      checked={m.download}
                      onChange={(c) => setMember(m.name, { download: c })}
                      disabled={!canManage || m.permission === 'manage'}
                    />
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title="외부 공유 링크"
            subtitle={`${deptLinks.length}건 · 사용 중 ${live.length}건 · 만료일이 지나면 링크가 자동으로 막힙니다`}
            padding="none"
            action={
              <Button size="sm" icon="link" disabled={!canManage || !p.external}>
                링크 추가
              </Button>
            }
          >
            <div className="tl-block-dept-policy">
              <Switch
                checked={p.external}
                onChange={(c) => setPol({ external: c })}
                disabled={!canManage}
                description="끄면 이 부서의 외부 링크가 모두 바로 막힙니다"
              >
                외부 공유 허용
              </Switch>
              <Switch
                checked={p.password}
                onChange={(c) => setPol({ password: c })}
                disabled={!canManage || !p.external}
                description="받는 사람에게 문자로 비밀번호를 보냅니다"
              >
                비밀번호 요구
              </Switch>
              <div className="tl-block-dept-policy__select">
                <Select
                  size="sm"
                  label="새 링크 기본 만료"
                  value={p.days}
                  onChange={(v) => setPol({ days: v })}
                  disabled={!canManage || !p.external}
                  options={[
                    { value: '7', label: '기본 만료 7일' },
                    { value: '14', label: '기본 만료 14일' },
                    { value: '30', label: '기본 만료 30일' },
                  ]}
                />
              </div>
            </div>
            {!p.external && (
              <div className="tl-block-dept-banner">
                <Banner tone="warning" title="외부 공유가 꺼져 있습니다">
                  저장하면 아래 링크 {live.length}건이 모두 막힙니다.
                </Banner>
              </div>
            )}
            <DataGrid
              caption={`${dept} 외부 공유 링크`}
              className="tl-block-dept-flat tl-block-dept-links"
              rows={deptLinks}
              rowKey="id"
              rowTone={(l) => (l.expiresAt < TODAY ? 'danger' : undefined)}
              empty="외부 공유 링크가 없습니다. 링크 추가에서 만료일과 받는 사람을 정하세요"
              columns={[
                {
                  key: 'enabled',
                  header: '사용',
                  width: 'xs',
                  render: (l) => (
                    <Switch
                      size="sm"
                      aria-label={`${l.fileName} 링크 사용`}
                      checked={l.enabled && p.external}
                      onChange={(c) => setLink(l.id, { enabled: c })}
                      disabled={!canManage || !p.external || l.expiresAt < TODAY}
                    />
                  ),
                },
                {
                  key: 'fileName',
                  header: '문서 · 받는 사람',
                  render: (l) => (
                    <DataGridLines
                      primary={l.fileName}
                      secondary={
                        <>
                          {l.recipient} · {l.org}
                        </>
                      }
                    />
                  ),
                },
                {
                  key: 'expiresAt',
                  header: '만료일',
                  width: 'lg',
                  render: (l) => (
                    <DateField
                      today={TODAY}
                      size="sm"
                      label={`${l.fileName} 만료일`}
                      value={l.expiresAt}
                      onChange={(v) => v && setLink(l.id, { expiresAt: v, enabled: true })}
                      min={TODAY}
                      disabled={!canManage || !p.external}
                    />
                  ),
                },
                {
                  key: 'due',
                  header: '남은 기간',
                  width: 'sm',
                  render: (l) =>
                    l.enabled || l.expiresAt < TODAY ? (
                      <DueBadge due={l.expiresAt} today={TODAY} warnDays={3} size="sm" />
                    ) : (
                      <Badge tone="neutral" size="sm">
                        사용 안 함
                      </Badge>
                    ),
                },
                {
                  key: 'downloads',
                  header: '다운로드',
                  width: 'sm',
                  align: 'right',
                  render: (l) => formatQuantity(l.downloads, '회'),
                },
                {
                  key: 'copy',
                  header: '링크',
                  width: 'xs',
                  align: 'center',
                  render: (l) => (
                    <IconButton
                      icon="copy"
                      size="sm"
                      label={`${l.fileName} 링크 복사`}
                      disabled={!l.enabled || !p.external || l.expiresAt < TODAY}
                      onPress={() =>
                        toast.show({
                          title: '링크를 복사했습니다',
                          description: `${l.recipient} · ${l.expiresAt}까지`,
                        })
                      }
                    />
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Grid>
      {changes > 0 && (
        <ActionBar sticky summary={`저장하지 않은 변경 ${changes}건`}>
          <Button
            onPress={() => {
              setMembers(DEPT_MEMBERS.map((m) => ({ ...m })));
              setLinks(SHARE_LINKS.map((l) => ({ ...l })));
              setPolicy(initialPolicy());
              setChanges(0);
            }}
          >
            되돌리기
          </Button>
          <Button
            variant="primary"
            onPress={() => {
              setChanges(0);
              toast.show({
                title: `${dept} 공유 설정을 저장했습니다`,
                description: '감사 로그에 남겼습니다',
                tone: 'success',
              });
            }}
          >
            저장
          </Button>
        </ActionBar>
      )}
    </Page>
  );
}
