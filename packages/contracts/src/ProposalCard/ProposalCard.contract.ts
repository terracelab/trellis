import { defineContract, type ContractBase } from '../_base.js';
import type { ChangeDiffRow } from '../_shared/diff.js';

/** 제안 처리 상태. waiting = 확인 대기(AGENT_RUN_STATES.waiting과 같은 말), 처리 뒤 approved 승인 · rejected 반려 */
export type ProposalStatus = 'waiting' | 'approved' | 'rejected';

export interface ProposalCardProps extends ContractBase {
  /** 무엇을 바꾸는지(명사구: 거래처 단가 변경) */
  title: string;
  /** 왜 바꾸는지 한두 문장(근거 · 영향) */
  summary?: string;
  /** 바뀌는 필드(contracts diffFields로 만든다) */
  changes: readonly ChangeDiffRow[];
  /** 처리 상태(제어) */
  status?: ProposalStatus;
  /** 처음 상태(비제어). 기본 waiting */
  defaultStatus?: ProposalStatus;
  /** 승인. Promise를 돌려주면 끝날 때까지 진행 중이고, 실패하면 오류 문구가 보인다 */
  onApprove?: () => void | Promise<unknown>;
  /** 반려. 사유 창(ReasonDialog)에서 사유를 받은 뒤 부른다. Promise면 사유 창이 진행 중 */
  onReject?: (reason: string) => void | Promise<unknown>;
  /** 반려 사유(처리 뒤 보인다). 없으면 사유 창에서 받은 글자 */
  reason?: string;
  /** 처리 뒤 한 줄(처리한 사람 · 시각: 김테라 팀장 · 11-10 14:20) */
  resolvedBy?: string;
  /** 반려 사유 최소 글자 수(앞뒤 공백 제외). 기본 1 */
  reasonMinLength?: number;
  /** 승인 단추 글자. 기본 "승인"(적용 · 등록처럼 결과를 말하는 말로 바꿀 수 있다) */
  approveLabel?: string;
  /** 반려 단추 글자. 기본 "반려" */
  rejectLabel?: string;
  /** 진행 중(승인 단추 처리 중, 반려 꺼짐) */
  loading?: boolean;
  /** 처리할 수 없다(권한 없음). 단추가 꺼진다 */
  disabled?: boolean;
  /** 오류 문구(처리하지 못했을 때, 단추 위) */
  error?: string;
  /** 제목 단계. 없으면 문맥(화면 바로 아래 h2, 카드 안 h3) */
  headingLevel?: 2 | 3 | 4;
  /** 변경 표 아래 자리(출처 · 실행 단계). 웹은 ReactNode */
  children?: unknown;
}

export const ProposalCardContract = defineContract<ProposalCardProps>({
  name: 'ProposalCard',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    title: { type: 'string', required: true, description: '무엇을 바꾸는지(명사구)' },
    summary: { type: 'string', description: '근거 · 영향 한두 문장' },
    changes: { type: 'ChangeDiffRow[]', required: true, description: '바뀌는 필드(diffFields)' },
    status: {
      type: "'waiting' | 'approved' | 'rejected'",
      values: ['waiting', 'approved', 'rejected'],
      description: '처리 상태(제어)',
    },
    defaultStatus: {
      type: "'waiting' | 'approved' | 'rejected'",
      default: 'waiting',
      description: '처음 상태(비제어)',
    },
    onApprove: { type: '() => void | Promise<unknown>', description: '승인' },
    onReject: {
      type: '(reason: string) => void | Promise<unknown>',
      description: '반려(사유 필수)',
    },
    reason: { type: 'string', description: '반려 사유(처리 뒤)' },
    resolvedBy: { type: 'string', description: '처리한 사람 · 시각' },
    reasonMinLength: { type: 'number', default: 1, description: '반려 사유 최소 글자 수' },
    approveLabel: { type: 'string', description: '승인 단추 글자(기본 승인)' },
    rejectLabel: { type: 'string', description: '반려 단추 글자(기본 반려)' },
    loading: { type: 'boolean', default: false, description: '진행 중' },
    disabled: { type: 'boolean', default: false, description: '처리할 수 없음(권한 없음)' },
    error: { type: 'string', description: '오류 문구' },
    headingLevel: { type: '2 | 3 | 4', description: '제목 단계(없으면 문맥)' },
    children: { type: 'ReactNode', description: '변경 표 아래 자리(출처 · 실행 단계)' },
  },
  states: ['default', 'disabled', 'loading', 'error'],
  a11y: {
    role: 'article',
    keyboard: ['Tab', 'Enter · Space(승인 · 반려)', 'Ctrl+Enter(사유 창 확인)'],
    labelling: 'children',
  },
  slots: ['children'],
  platforms: { web: true, native: true },
});
