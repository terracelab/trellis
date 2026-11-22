# PermissionMatrix

> `@terracelab/trellis-react` · CSS `.tl-permission-matrix` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { PermissionMatrix } from '@terracelab/trellis-react';
```

## 용도

역할 하나의 권한을 대상(모듈 · 화면) × 동작(조회 · 등록 · 수정 · 삭제 · 승인 · 다운로드) 표와 데이터 범위(전사 · 본부 · 부서 · 본인)로 정하거나 보여 줄 때 쓴다(platform/admin/roles). 역할은 부르는 쪽이 탭 · 목록으로 고른다. 켜고 끄는 설정 몇 개는 Switch · CheckboxGroup, 사람마다 값을 고치는 표는 DataGrid.

## 해부(Anatomy)

root(`tl-permission-matrix`) · scope(데이터 범위: 라벨 `type.label` 600 `fg.secondary` + RadioGroup 가로, 읽기 전용은 글자) · scroll(`border.divider` 1px, `radius.md`, 넘치면 가로 스크롤) · grid(role=grid) · head(열 머리 `bg.sunken`, `type.label` 600 `fg.secondary`) · row(최소 높이 `density.row-height` + `space.8`, 줄 사이 `border.divider`, 가리키면 `bg.sunken`) · resource(첫 열, 가로로 넘길 때 붙어 있다: ModuleIcon 32 또는 아이콘 칸 `bg.sunken` · 이름 500 · 보조 `type.caption` `fg.secondary`, 켠 칸이 없으면 "권한 없음") · box(체크 상자: 누르는 자리 `space.32`, 보이는 상자 16 `fg.tertiary` 테두리, 켜면 `brand.default` + `brand.on-brand` 체크) · mark(읽기 전용: 체크 `fg.link` · 대시 `fg.tertiary`).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `label` | `string` |  | 필수 | 표 이름(접근성) |
| `resources` | `PermissionResource[]` |  | 필수 | 줄(id · label · module · icon · description · disabled) |
| `actions` | `PermissionAction[]` |  | 필수 | 열(id · label · requires) |
| `value` | `Record<string, string[]>` |  |  | 켠 칸(제어) |
| `defaultValue` | `Record<string, string[]>` |  |  | 처음 켠 칸 |
| `onChange` | `(value: Record<string, string[]>, change: PermissionChange) => void` |  |  | 칸을 바꿀 때(requires를 따른 값 + 누른 칸) |
| `resourceHeader` | `string` |  |  | 첫 열 머리 글자(기본 "항목") |
| `scopes` | `PermissionScope[]` |  |  | 데이터 범위 선택지(있으면 표 위에 범위 고르기) |
| `scope` | `string \| null` |  |  | 고른 범위(제어) |
| `defaultScope` | `string \| null` |  |  | 처음 범위 |
| `onScopeChange` | `(scope: string) => void` |  |  | 범위를 바꿀 때 |
| `readOnly` | `boolean` | `false` |  | 읽기 전용(체크 표시 · 대시) |
| `disabled` | `boolean` | `false` |  | 전부 잠금 |

## Variants

편집(기본) · 읽기 전용(readOnly) · 잠금(disabled, 칸은 초점을 받고 바뀌지 않는다). 줄마다 disabled(켜지지 않은 모듈 · 시스템 줄)를 둘 수 있다. scopes가 있으면 표 위에 범위 고르기가 생긴다.

## States

지원 상태: `default` · `hover` · `focus` · `disabled`

default · hover(줄 `bg.sunken`, 상자 테두리 `border.focus`) · focus(상자 둘레 링 `border.focus` 2px, 읽기 전용은 칸 안쪽 링) · disabled(상자 `bg.sunken` · `border.default`, 체크 `fg.disabled`, `aria-disabled`. 잠긴 줄의 이름 · 설명은 `fg.tertiary`(4.5:1 이상, 잠긴 까닭을 읽어야 하므로 비활성 글자색을 쓰지 않는다)). active · loading · error는 해당 없음.

## 동작

칸을 누르거나 Space · Enter를 치면 켜고 끈다. 켜면 그 동작의 requires(수정 → 조회)를 같이 켜고, 끄면 그 동작을 requires로 둔 동작도 같이 끈다(contracts `applyPermission`, 이어서 따른다). onChange는 따른 뒤의 값 전부와 누른 칸(resource · action · granted)을 받는다. 값의 동작 순서는 열 순서다. value를 주면 컨트롤드, defaultValue는 언컨트롤드다. scope도 같다.

| 키 | 동작 |
| --- | --- |
| Tab | 격자로 들어온다(마지막에 있던 칸). 다시 Tab이면 밖으로 |
| ← · → · ↑ · ↓ | 칸 옮기기(끝에서 멈춘다) |
| Home · End | 그 줄 첫 · 끝 칸 |
| Ctrl+Home · Ctrl+End | 첫 칸 · 끝 칸 |
| Space · Enter | 칸 켜고 끄기(읽기 전용 · 잠금은 바뀌지 않는다) |

## 접근성

`role="grid"` + `aria-label`(label), 읽기 전용은 `aria-readonly`. 머리는 `columnheader`, 첫 열은 `rowheader`. 칸 안 상자는 `role="checkbox"` + `aria-checked`, 이름은 "대상 동작"(구매 조회). 잠긴 칸은 `aria-disabled`라 초점은 받고 바뀌지 않는다. 읽기 전용 칸은 `gridcell`이 초점을 받고 숨은 글자 "허용 · 없음"을 읽는다. 범위 고르기는 RadioGroup(이름 "데이터 범위"). 탭 정류장은 하나다(roving tabindex). 대비: 이름 `fg.primary`, 보조 `fg.secondary`, 상자 테두리 `fg.tertiary`(3:1 이상, 비글자).

## 밀도

줄 최소 높이 `density.row-height` + `space.8`(compact 44 · comfortable 48), 열 폭 `space.64` ~ × 1.5, 첫 열 최소 `space.64` × 3. 누르는 자리 32는 밀도와 관계없다.

## 플랫폼 차이

네이티브는 대상마다 접히는 묶음 안에 동작 Switch 목록으로 그린다(좁은 화면에 6열이 들어가지 않는다). props와 requires 규칙은 같다.

## 금지 사항

role=table + Checkbox로 권한 표를 블록이 직접 → PermissionMatrix · 켠 칸 수를 회색 알약으로 · 권한 없음을 빨강으로(상태가 아니다) · requires를 화면마다 따로 짜기(`applyPermission`) → 리뷰.

## 예시

### 역할 권한

모듈 × 동작 6개 + 데이터 범위 4개. 화살표로 칸을 옮기고 Space로 켜고 끈다

```tsx
import type { PermissionAction, PermissionResource } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { PermissionMatrix } from '@terracelab/trellis-react';

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

function Role() {
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
```

### 읽기 전용

권한을 바꿀 수 없는 사람이 볼 때. 칸은 체크 표시와 대시, 범위는 글자

```tsx
import type { PermissionAction, PermissionResource } from '@terracelab/trellis-contracts';
import { PermissionMatrix } from '@terracelab/trellis-react';

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

function ReadOnly() {
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
```

### 화면 단위 · 잠긴 줄

아이콘과 설명이 있는 화면 줄. 켜지지 않은 모듈의 화면은 줄을 잠근다

```tsx
import type { PermissionAction } from '@terracelab/trellis-contracts';
import { PermissionMatrix } from '@terracelab/trellis-react';

const ACTIONS: PermissionAction[] = [
  { id: 'read', label: '조회' },
  { id: 'create', label: '등록', requires: ['read'] },
  { id: 'update', label: '수정', requires: ['read'] },
  { id: 'delete', label: '삭제', requires: ['read'] },
  { id: 'approve', label: '승인 · 발행', requires: ['read'] },
  { id: 'export', label: '다운로드', requires: ['read'] },
];

function Screens() {
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
```
