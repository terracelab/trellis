import { defineContract, type ContractBase } from '../_base.js';

export interface DialogProps extends ContractBase {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 무엇을 하는 대화상자인지(명사구) */
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  /** 여는 버튼(웹: ReactElement). 없으면 open으로 제어 */
  trigger?: unknown;
  /** 아래 동작. 확인 대화상자의 버튼은 결과를 말한다(삭제 · 반려) */
  footer?: unknown;
  /** danger = 되돌릴 수 없는 동작의 확인 */
  tone?: 'default' | 'danger';
  /** 오른쪽 위 닫기 버튼 */
  closable?: boolean;
  children?: unknown;
}

export const DialogContract = defineContract<DialogProps>({
  name: 'Dialog',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    open: { type: 'boolean', description: '열림(제어)' },
    defaultOpen: { type: 'boolean', default: false, description: '처음 열림' },
    onOpenChange: { type: '(open: boolean) => void', description: '열림이 바뀔 때' },
    title: { type: 'string', required: true, description: '제목' },
    description: { type: 'string', description: '설명 한 문장' },
    size: {
      type: "'sm' | 'md' | 'lg'",
      default: 'md',
      values: ['sm', 'md', 'lg'],
      description: '폭(400 · 560 · 800)',
    },
    trigger: { type: 'ReactElement', description: '여는 버튼' },
    footer: { type: 'ReactNode', description: '아래 동작' },
    tone: {
      type: "'default' | 'danger'",
      default: 'default',
      values: ['default', 'danger'],
      description: '확인의 무게',
    },
    closable: { type: 'boolean', default: true, description: '닫기 버튼' },
    children: { type: 'ReactNode', description: '내용' },
  },
  states: ['default'],
  a11y: { role: 'dialog', keyboard: ['Escape(닫기)', 'Tab(안에서 순환)'], labelling: 'label-prop' },
  slots: ['footer'],
  platforms: { web: true, native: true },
});
