import { defineContract, type ContractBase } from '../_base.js';

/** 결재선에서 고르는 역할(기안은 첫 줄 고정, 참조는 아래 칩) */
export const APPROVAL_EDIT_ROLES = ['검토', '합의', '승인'] as const;
export type ApprovalEditRole = (typeof APPROVAL_EDIT_ROLES)[number];

/** 고를 수 있는 사람(사내 명부) */
export interface ApprovalPerson {
  /** 사람 id(사번 · 사용자 id) */
  id: string;
  name: string;
  /** 직함(팀장 · 대리) */
  title?: string;
  /** 보조 글자(부서 · 직무). 찾기 대상에 들어간다 */
  meta?: string;
  /** 사번 · 사용자 코드. 찾기 대상에 들어간다 */
  code?: string;
  /** 사진 주소 */
  src?: string;
}

/** 결재선 한 줄 */
export interface ApprovalLineStep {
  /** 사람 id(people에서 이름을 찾는다) */
  person: string;
  role: ApprovalEditRole;
}

export interface ApprovalLineEditorProps extends ContractBase {
  /** 사내 명부. 이름 · 직함을 찾고 결재자 · 참조자 추천에 쓴다 */
  people: readonly ApprovalPerson[];
  /** 기안자. 첫 줄(0번, 기안)에 고정된다 */
  drafter?: ApprovalPerson;
  /** 결재선(제어). 위에서 아래 순서로 결재한다 */
  value?: readonly ApprovalLineStep[];
  defaultValue?: readonly ApprovalLineStep[];
  onChange?: (value: ApprovalLineStep[]) => void;
  /** 참조자 id(제어). 결재하지 않고 문서를 본다 */
  cc?: readonly string[];
  defaultCc?: readonly string[];
  onCcChange?: (cc: string[]) => void;
  /** 참조 칸을 보인다. 기본 true */
  showCc?: boolean;
  /** 결재선 오류(결재자가 없음). 결재자 추가 칸 아래에 보인다 */
  error?: string;
  /** 결재자 최대 수 */
  max?: number;
  disabled?: boolean;
}

/** 새 결재자를 넣을 자리: 마지막이 승인이면 그 앞, 아니면 끝. 역할은 검토 */
export function insertApprover(
  line: readonly ApprovalLineStep[],
  person: string,
): ApprovalLineStep[] {
  if (line.some((s) => s.person === person)) return [...line];
  const at = line[line.length - 1]?.role === '승인' ? line.length - 1 : line.length;
  const next = [...line];
  next.splice(at, 0, { person, role: '검토' });
  return next;
}

/** 마지막 결재자가 승인 역할인지(아니면 편집기가 안내 글자를 보인다) */
export function endsWithApproval(line: readonly ApprovalLineStep[]): boolean {
  return line[line.length - 1]?.role === '승인';
}

/** i번째 줄을 d칸(−1 위 · +1 아래) 옮긴다. 끝을 넘으면 그대로 */
export function moveApprover(
  line: readonly ApprovalLineStep[],
  index: number,
  d: number,
): ApprovalLineStep[] {
  const to = index + d;
  if (index < 0 || index >= line.length || to < 0 || to >= line.length) return [...line];
  const next = [...line];
  const [x] = next.splice(index, 1);
  next.splice(to, 0, x!);
  return next;
}

export const ApprovalLineEditorContract = defineContract<ApprovalLineEditorProps>({
  name: 'ApprovalLineEditor',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    people: {
      type: 'ApprovalPerson[]',
      required: true,
      description: '사내 명부(id · name · title · meta · code · src)',
    },
    drafter: { type: 'ApprovalPerson', description: '기안자(첫 줄 고정)' },
    value: { type: 'ApprovalLineStep[]', description: '결재선(제어, person · role)' },
    defaultValue: { type: 'ApprovalLineStep[]', description: '처음 결재선' },
    onChange: { type: '(value: ApprovalLineStep[]) => void', description: '결재선이 바뀔 때' },
    cc: { type: 'string[]', description: '참조자 id(제어)' },
    defaultCc: { type: 'string[]', description: '처음 참조자' },
    onCcChange: { type: '(cc: string[]) => void', description: '참조자가 바뀔 때' },
    showCc: { type: 'boolean', default: true, description: '참조 칸 보이기' },
    error: { type: 'string', description: '결재선 오류 글자' },
    max: { type: 'number', description: '결재자 최대 수' },
    disabled: { type: 'boolean', default: false, description: '비활성' },
  },
  states: ['default', 'hover', 'focus', 'disabled', 'error'],
  a11y: {
    role: 'list',
    keyboard: ['Tab', 'Alt+ArrowUp', 'Alt+ArrowDown', 'Enter', 'Space'],
    labelling: 'aria-label',
  },
  platforms: { web: true, native: true },
});
