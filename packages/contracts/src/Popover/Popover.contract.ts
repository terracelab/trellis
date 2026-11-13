import { defineContract, type ContractBase } from '../_base.js';

export interface PopoverProps extends ContractBase {
  /** 여는 요소 하나(Button · IconButton) */
  trigger: unknown;
  /** 패널 제목(명사구). 접근성 이름이고 좁은 화면 시트의 제목이다 */
  title: string;
  /** 패널 내용 */
  children?: unknown;
  /** 아래 동작(적용 · 초기화) */
  footer?: unknown;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 트리거의 어느 쪽에 열지. 자리가 없으면 반대쪽 */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** side 축 위에서의 정렬 */
  align?: 'start' | 'center' | 'end';
  /** 오른쪽 위 닫기 버튼 */
  closable?: boolean;
  /** 열 때 포커스. first = 내용의 첫 조작 요소(없으면 패널), panel = 패널 자체(읽기만 하는 내용) */
  initialFocus?: 'first' | 'panel';
  /** 폭 */
  width?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const PopoverContract = defineContract<PopoverProps>({
  name: 'Popover',
  props: {
    id: { type: 'string', description: '패널 id' },
    testID: { type: 'string', description: '테스트 식별자(패널)' },
    trigger: { type: 'ReactElement', required: true, description: '여는 요소' },
    title: { type: 'string', required: true, description: '패널 제목(접근성 이름 · 시트 제목)' },
    children: { type: 'ReactNode', description: '내용' },
    footer: { type: 'ReactNode', description: '아래 동작' },
    open: { type: 'boolean', description: '열림(제어)' },
    defaultOpen: { type: 'boolean', default: false, description: '처음 열림' },
    onOpenChange: { type: '(open: boolean) => void', description: '열림이 바뀔 때' },
    side: {
      type: "'top' | 'bottom' | 'left' | 'right'",
      default: 'bottom',
      values: ['top', 'bottom', 'left', 'right'],
      description: '트리거의 어느 쪽',
    },
    align: {
      type: "'start' | 'center' | 'end'",
      default: 'start',
      values: ['start', 'center', 'end'],
      description: 'side 축 위 정렬',
    },
    closable: { type: 'boolean', default: true, description: '닫기 버튼' },
    initialFocus: {
      type: "'first' | 'panel'",
      default: 'first',
      values: ['first', 'panel'],
      description: '열 때 포커스(첫 조작 요소 · 패널)',
    },
    width: {
      type: "'sm' | 'md' | 'lg'",
      default: 'md',
      values: ['sm', 'md', 'lg'],
      description: '폭(240 · 320 · 400)',
    },
    disabled: { type: 'boolean', default: false, description: '열리지 않음' },
  },
  states: ['default', 'disabled'],
  a11y: {
    role: 'dialog',
    keyboard: ['Enter', 'Space', 'Escape', 'Tab'],
    labelling: 'label-prop',
  },
  slots: ['footer'],
  platforms: { web: true, native: true },
});
