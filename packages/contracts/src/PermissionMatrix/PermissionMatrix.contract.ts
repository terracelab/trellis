import type { IconName } from '@terracelab/trellis-icons';
import { defineContract, type ContractBase, type ModuleId } from '../_base.js';

/** 줄: 권한을 주는 대상(모듈 · 화면 · 메뉴) */
export interface PermissionResource {
  id: string;
  label: string;
  /** 모듈 레지스트리 id. 있으면 앞에 ModuleIcon */
  module?: ModuleId;
  /** module이 없을 때 앞 아이콘 */
  icon?: IconName;
  /** 보조 한 줄(무엇을 다루는 화면인지) */
  description?: string;
  /** 이 줄만 잠근다(켜진 모듈이 아님 · 시스템 줄) */
  disabled?: boolean;
}

/** 열: 동작(조회 · 등록 · 수정 · 삭제 · 승인 · 다운로드) */
export interface PermissionAction {
  id: string;
  label: string;
  /** 이 동작을 켜면 같이 켜지는 동작(수정 → 조회). 그 동작을 끄면 이 동작도 꺼진다 */
  requires?: readonly string[];
}

/** 데이터 범위 선택지(전사 · 본부 · 부서 · 본인) */
export interface PermissionScope {
  value: string;
  label: string;
}

/** 대상 id → 켠 동작 id 목록 */
export type PermissionValue = Readonly<Record<string, readonly string[]>>;

/** onChange 둘째 인자: 이번에 누른 칸 */
export interface PermissionChange {
  resource: string;
  action: string;
  granted: boolean;
}

export interface PermissionMatrixProps extends ContractBase {
  /** 표 이름(접근성). "구매 담당 모듈 권한" */
  label: string;
  resources: readonly PermissionResource[];
  actions: readonly PermissionAction[];
  /** 켠 칸(제어) */
  value?: PermissionValue;
  defaultValue?: PermissionValue;
  /** 칸을 바꿀 때(requires를 따른 뒤 값 전부 + 누른 칸) */
  onChange?: (value: Record<string, string[]>, change: PermissionChange) => void;
  /** 첫 열 머리 글자(모듈 · 화면). 기본 "항목" */
  resourceHeader?: string;
  /** 데이터 범위 선택지. 있으면 표 위에 범위 고르기 */
  scopes?: readonly PermissionScope[];
  /** 고른 범위(제어) */
  scope?: string | null;
  defaultScope?: string | null;
  onScopeChange?: (scope: string) => void;
  /** 읽기 전용: 칸은 체크 표시 · 대시, 범위는 글자. 화살표로 칸을 옮겨 다닌다 */
  readOnly?: boolean;
  /** 전부 잠금(권한이 없는 사람 · 바꿀 수 없는 역할). 칸은 초점을 받고 바뀌지 않는다 */
  disabled?: boolean;
}

/**
 * 칸 하나를 켜거나 끈다. 켜면 requires(이어서)를 같이 켜고, 끄면 그 동작을 requires로 둔 동작도 끈다.
 * 반환은 새 값(다른 대상은 그대로)
 */
export function applyPermission(
  value: PermissionValue,
  actions: readonly PermissionAction[],
  resource: string,
  action: string,
  granted: boolean,
): Record<string, string[]> {
  const next: Record<string, string[]> = Object.fromEntries(
    Object.entries(value).map(([k, v]) => [k, [...v]]),
  );
  const set = new Set(next[resource] ?? []);
  const byId = new Map(actions.map((a) => [a.id, a]));
  if (granted) {
    const add = (id: string) => {
      if (set.has(id)) return;
      set.add(id);
      for (const r of byId.get(id)?.requires ?? []) add(r);
    };
    add(action);
  } else {
    const drop = (id: string) => {
      if (!set.delete(id)) return;
      for (const a of actions) if (a.requires?.includes(id)) drop(a.id);
    };
    set.add(action);
    drop(action);
  }
  // 열 순서대로 둔다(저장 · 비교가 흔들리지 않게)
  next[resource] = actions.map((a) => a.id).filter((id) => set.has(id));
  return next;
}

export const PermissionMatrixContract = defineContract<PermissionMatrixProps>({
  name: 'PermissionMatrix',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    label: { type: 'string', required: true, description: '표 이름(접근성)' },
    resources: {
      type: 'PermissionResource[]',
      required: true,
      description: '줄(id · label · module · icon · description · disabled)',
    },
    actions: {
      type: 'PermissionAction[]',
      required: true,
      description: '열(id · label · requires)',
    },
    value: { type: 'Record<string, string[]>', description: '켠 칸(제어)' },
    defaultValue: { type: 'Record<string, string[]>', description: '처음 켠 칸' },
    onChange: {
      type: '(value: Record<string, string[]>, change: PermissionChange) => void',
      description: '칸을 바꿀 때(requires를 따른 값 + 누른 칸)',
    },
    resourceHeader: { type: 'string', description: '첫 열 머리 글자(기본 "항목")' },
    scopes: {
      type: 'PermissionScope[]',
      description: '데이터 범위 선택지(있으면 표 위에 범위 고르기)',
    },
    scope: { type: 'string | null', description: '고른 범위(제어)' },
    defaultScope: { type: 'string | null', description: '처음 범위' },
    onScopeChange: { type: '(scope: string) => void', description: '범위를 바꿀 때' },
    readOnly: { type: 'boolean', default: false, description: '읽기 전용(체크 표시 · 대시)' },
    disabled: { type: 'boolean', default: false, description: '전부 잠금' },
  },
  states: ['default', 'hover', 'focus', 'disabled'],
  a11y: {
    role: 'grid',
    keyboard: [
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      'Ctrl+Home',
      'Ctrl+End',
      'Space',
    ],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
