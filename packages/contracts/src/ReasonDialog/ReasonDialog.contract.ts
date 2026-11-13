import { defineContract, type ContractBase } from '../_base.js';

export interface ReasonDialogProps extends ContractBase {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 여는 단추(웹: ReactElement). 없으면 open으로 제어 */
  trigger?: unknown;
  /** 무엇을 하는지(반려합니다 · 결재를 회수합니다) */
  title: string;
  description?: string;
  /** 사유 칸 라벨. 기본 "사유"(반려 사유 · 회수 사유) */
  label?: string;
  /** 예시 사유 */
  placeholder?: string;
  /** 확인 단추. 결과를 말한다(반려 · 회수 · 삭제). "확인"은 쓰지 않는다 */
  confirmLabel: string;
  /** 앞뒤 공백을 뺀 최소 글자 수. 모자라면 확인이 꺼진다. 기본 1 */
  minLength?: number;
  /** 최대 글자 수(글자 수 표시) */
  maxLength?: number;
  /** danger = 되돌릴 수 없는 동작(삭제). 확인 단추가 위험 색 */
  tone?: 'default' | 'danger';
  /** 아래 안내 한 줄(사유는 기안자에게 보입니다) */
  note?: string;
  /** 확인. Promise를 돌려주면 끝날 때까지 진행 중이고, 성공하면 닫힌다. 실패하면 열린 채 오류 문구 */
  onConfirm?: (reason: string) => void | Promise<unknown>;
  /** 진행 중(확인 단추 스피너 · 취소 · Esc 막힘) */
  loading?: boolean;
  /** 사유 칸 아래 오류 문구(서버가 거절한 이유) */
  error?: string;
}

export const ReasonDialogContract = defineContract<ReasonDialogProps>({
  name: 'ReasonDialog',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    open: { type: 'boolean', description: '열림(제어)' },
    defaultOpen: { type: 'boolean', default: false, description: '처음 열림' },
    onOpenChange: { type: '(open: boolean) => void', description: '열림이 바뀔 때' },
    trigger: { type: 'ReactElement', description: '여는 단추' },
    title: { type: 'string', required: true, description: '제목' },
    description: { type: 'string', description: '설명 한 문장' },
    label: { type: 'string', description: '사유 칸 라벨(기본 사유)' },
    placeholder: { type: 'string', description: '예시 사유' },
    confirmLabel: { type: 'string', required: true, description: '확인 단추(결과를 말한다)' },
    minLength: { type: 'number', default: 1, description: '최소 글자 수(앞뒤 공백 제외)' },
    maxLength: { type: 'number', description: '최대 글자 수' },
    tone: {
      type: "'default' | 'danger'",
      default: 'default',
      values: ['default', 'danger'],
      description: '확인의 무게',
    },
    note: { type: 'string', description: '아래 안내 한 줄' },
    onConfirm: {
      type: '(reason: string) => void | Promise<unknown>',
      description: '확인(사유는 앞뒤 공백을 뺀 글자)',
    },
    loading: { type: 'boolean', default: false, description: '진행 중' },
    error: { type: 'string', description: '오류 문구' },
  },
  states: ['default', 'disabled', 'loading', 'error'],
  a11y: {
    role: 'dialog',
    keyboard: ['Tab(안에서 순환)', 'Ctrl+Enter(확인)', 'Escape(사유가 비었을 때만 닫기)'],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
