import { type PermissionAction, type PermissionResource } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { PermissionMatrix } from './PermissionMatrix.js';

// 동작 6개. 조회 밖의 동작을 켜면 조회가 같이 켜지고, 조회를 끄면 나머지도 꺼진다
const ACTIONS: PermissionAction[] = [
  { id: 'read', label: '조회' },
  { id: 'create', label: '등록', requires: ['read'] },
  { id: 'update', label: '수정', requires: ['read'] },
  { id: 'delete', label: '삭제', requires: ['read'] },
  { id: 'approve', label: '승인 · 발행', requires: ['read'] },
  { id: 'export', label: '다운로드', requires: ['read'] },
];

const MODULES: PermissionResource[] = [
  { id: 'purchasing', module: 'purchasing', label: '구매' },
  { id: 'sales', module: 'sales', label: '영업' },
  { id: 'accounting', module: 'accounting', label: '회계' },
  { id: 'approval', module: 'approval', label: '전자결재' },
  { id: 'hr-payroll', module: 'hr-payroll', label: '인사 · 급여' },
];

const SCOPES = [
  { value: 'company', label: '전사' },
  { value: 'division', label: '본부' },
  { value: 'department', label: '부서' },
  { value: 'self', label: '본인' },
];

/** 역할 권한 — 모듈 × 동작 6개 + 데이터 범위 4개. 화살표로 칸을 옮기고 Space로 켜고 끈다 */
export function Role() {
  const [value, setValue] = useState<Record<string, string[]>>({
    purchasing: ['read', 'create', 'update', 'approve', 'export'],
    sales: ['read'],
    accounting: ['read', 'export'],
    approval: ['read', 'create'],
  });
  const [scope, setScope] = useState<string | null>('department');
  return (
    <PermissionMatrix
      label="구매 담당 모듈 권한"
      resourceHeader="모듈"
      resources={MODULES}
      actions={ACTIONS}
      value={value}
      onChange={setValue}
      scopes={SCOPES}
      scope={scope}
      onScopeChange={setScope}
    />
  );
}

/** 읽기 전용 — 권한을 바꿀 수 없는 사람이 볼 때. 칸은 체크 표시와 대시, 범위는 글자 */
export function ReadOnly() {
  return (
    <PermissionMatrix
      label="영업 담당 모듈 권한"
      resourceHeader="모듈"
      resources={MODULES}
      actions={ACTIONS}
      readOnly
      scopes={SCOPES}
      scope="division"
      defaultValue={{
        sales: ['read', 'create', 'update', 'export'],
        purchasing: ['read'],
        approval: ['read', 'create'],
      }}
    />
  );
}

/** 화면 단위 · 잠긴 줄 — 아이콘과 설명이 있는 화면 줄. 켜지지 않은 모듈의 화면은 줄을 잠근다 */
export function Screens() {
  return (
    <PermissionMatrix
      label="재무팀 화면 권한"
      resourceHeader="화면"
      actions={ACTIONS.slice(0, 4)}
      defaultValue={{ vouchers: ['read', 'create'], ledger: ['read'] }}
      resources={[
        {
          id: 'vouchers',
          icon: 'receipt',
          label: '전표 입력',
          description: '매입 · 매출 · 일반 전표',
        },
        { id: 'ledger', icon: 'file-spreadsheet', label: '원장 조회', description: '계정별 원장' },
        {
          id: 'payroll',
          icon: 'wallet',
          label: '급여 지급',
          description: '인사 · 급여 모듈이 꺼져 있습니다',
          disabled: true,
        },
      ]}
    />
  );
}
