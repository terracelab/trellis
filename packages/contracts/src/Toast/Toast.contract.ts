import { defineContract, type ContractBase } from '../_base.js';
import type { StatusTone } from '../_shared/vocab.js';

export interface ToastAction {
  /** 결과를 말하는 동사 어간(되돌리기 · 보기) */
  label: string;
  onPress: () => void;
}

export interface ToastProps extends ContractBase {
  /** 과거형 한 문장(저장했습니다 · 반려했습니다) */
  title: string;
  /** 보충 한 문장 */
  description?: string;
  /** 앞 아이콘과 왼쪽 띠 색. 글자는 중립 */
  tone?: StatusTone;
  /** 버튼 하나(되돌리기). 누르면 토스트도 닫힌다 */
  action?: ToastAction;
  /**
   * 자동으로 닫히기까지(ms). 0이면 직접 닫을 때까지.
   * 주지 않으면 4000, danger는 0, action이 있으면 10000. 앱 설정(길게 · 직접 닫기)이 그 위에 얹힌다
   */
  duration?: number;
  /** 닫힐 때. 정적 표현에서는 닫기 버튼을 보인다 */
  onClose?: () => void;
}

/** useToast().show의 인자. id를 다시 쓰면 새로 쌓지 않고 내용을 바꾼다 */
export type ToastOptions = Omit<ToastProps, 'testID'>;

export const ToastContract = defineContract<ToastProps>({
  name: 'Toast',
  props: {
    id: { type: 'string', description: '토스트 id(같은 id면 내용만 바꾼다)' },
    testID: { type: 'string', description: '테스트 식별자' },
    title: { type: 'string', required: true, description: '과거형 한 문장' },
    description: { type: 'string', description: '보충 한 문장' },
    tone: {
      type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'",
      default: 'neutral',
      values: ['neutral', 'info', 'success', 'warning', 'danger'],
      description: '상태 톤(아이콘 · 띠)',
    },
    action: { type: '{ label: string; onPress: () => void }', description: '버튼 하나' },
    duration: {
      type: 'number',
      default: 4000,
      description: '자동 닫힘(ms). 0이면 유지. 주지 않으면 danger 0 · action 있으면 10000',
    },
    onClose: { type: '() => void', description: '닫힐 때' },
  },
  states: ['default'],
  a11y: { role: 'status', keyboard: ['F6', 'Tab', 'Enter', 'Escape'], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
