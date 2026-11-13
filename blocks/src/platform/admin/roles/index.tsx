// 플랫폼 기본 · 권한: 역할(탭) × 모듈 × 동작 표 + 데이터 범위(PermissionMatrix)
import {
  ActionBar,
  Banner,
  Button,
  Card,
  PageHeader,
  PermissionMatrix,
  Tabs,
  useToast,
} from '@terracelab/trellis-react';
import modules from '@terracelab/trellis-tokens/modules';
import { useState } from 'react';
import {
  ACTION_LABELS,
  ACTIONS,
  COMPANY,
  ROLES,
  SCOPE_LABELS,
  USERS,
  useCan,
  type Action,
  type DataScope,
} from '../../../_platform/index.js';
import { Page } from '../../../_ui/index.js';

type Matrix = Record<string, Action[]>;

const expand = (perms: Readonly<Record<string, readonly Action[]>>): Matrix =>
  Object.fromEntries(COMPANY.modules.map((m) => [m, [...(perms['*'] ?? perms[m] ?? [])]]));

/** 열: 동작 6개. 조회 밖의 동작은 조회가 있어야 한다(켜면 조회도, 조회를 끄면 나머지도) */
const ACTION_COLUMNS = ACTIONS.map((a) => ({
  id: a,
  label: ACTION_LABELS[a],
  ...(a === 'read' ? {} : { requires: ['read'] }),
}));
/** 줄: 켜진 모듈(구축 범위) */
const MODULE_ROWS = COMPANY.modules.map((mod) => ({
  id: mod,
  module: mod,
  label: modules.modules.find((x) => x.id === mod)?.label ?? mod,
}));
const SCOPES = (Object.keys(SCOPE_LABELS) as DataScope[]).map((k) => ({
  value: k,
  label: SCOPE_LABELS[k],
}));

export default function Roles() {
  const toast = useToast();
  const canEdit = useCan('platform', 'update');
  const [roleId, setRoleId] = useState('purchase');
  const role = ROLES.find((r) => r.id === roleId)!;
  const [matrix, setMatrix] = useState<Record<string, Matrix>>(() =>
    Object.fromEntries(ROLES.map((r) => [r.id, expand(r.permissions)])),
  );
  const [scope, setScope] = useState<Record<string, DataScope>>(() =>
    Object.fromEntries(ROLES.map((r) => [r.id, r.scope])),
  );
  const [dirty, setDirty] = useState(false);
  const m = matrix[roleId]!;
  const locked = roleId === 'admin';
  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: '관리' }, { label: '권한' }]}
          title="권한"
          description="역할마다 모듈별 동작과 데이터 범위를 정합니다. 사용자는 여러 역할을 가질 수 있고 권한은 합쳐집니다"
          actions={
            <Button icon="plus" disabled={!canEdit}>
              역할 추가
            </Button>
          }
          tabs={
            <Tabs
              label="역할"
              value={roleId}
              onChange={setRoleId}
              items={ROLES.map((r) => ({
                value: r.id,
                label: r.name,
                count: USERS.filter((u) => u.roleIds.includes(r.id)).length,
              }))}
            />
          }
        />
      }
    >
      {locked && (
        <Banner tone="info" title="관리자 역할은 바꿀 수 없습니다">
          모든 모듈의 모든 동작을 가집니다. 관리자는 2명 이상 두는 것을 권장합니다.
        </Banner>
      )}
      <Card title={role.name} subtitle={role.description}>
        <PermissionMatrix
          label={`${role.name} 모듈 권한`}
          resourceHeader="모듈"
          resources={MODULE_ROWS}
          actions={ACTION_COLUMNS}
          value={m}
          onChange={(next) => {
            setDirty(true);
            setMatrix((all) => ({ ...all, [roleId]: next as Matrix }));
          }}
          scopes={SCOPES}
          scope={scope[roleId] ?? null}
          onScopeChange={(v) => {
            setDirty(true);
            setScope((s) => ({ ...s, [roleId]: v as DataScope }));
          }}
          readOnly={!canEdit}
          disabled={locked}
        />
      </Card>
      {dirty && (
        <ActionBar sticky summary="저장하지 않은 변경이 있습니다">
          <Button onPress={() => window.location.reload()}>되돌리기</Button>
          <Button
            variant="primary"
            onPress={() => {
              setDirty(false);
              toast.show({
                title: `${role.name} 권한을 저장했습니다`,
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
