import { defineContract, type ContractBase } from '../_base.js';
import type { MenuEntry } from '../Menu/Menu.contract.js';

export interface ContextMenuProps extends ContractBase {
  /** 우클릭 · 길게 누르기 · Shift+F10을 받는 영역(목록 · 행 · 메시지) */
  children: unknown;
  /** 항목 · 구분선 · 묶음 이름(Menu와 같은 모델) */
  items: readonly MenuEntry[];
  /**
   * 열리고 닫힐 때. 웹은 둘째 인자로 메뉴를 연 요소(누른 행 · 포커스한 행)를 준다.
   * 앱은 그 요소로 어느 항목의 메뉴인지 정하고 items를 바꾼다
   */
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  /** 좁은 화면 시트 제목. 없으면 "동작" */
  title?: string;
}

export const ContextMenuContract = defineContract<ContextMenuProps>({
  name: 'ContextMenu',
  props: {
    id: { type: 'string', description: '메뉴(popup) id' },
    testID: { type: 'string', description: '테스트 식별자(영역)' },
    children: { type: 'ReactNode', required: true, description: '메뉴를 받는 영역' },
    items: { type: 'MenuEntry[]', required: true, description: '항목 · 구분선 · 묶음 이름' },
    onOpenChange: {
      type: '(open: boolean, target: HTMLElement | null) => void',
      description: '열림이 바뀔 때(웹은 연 요소도)',
    },
    disabled: { type: 'boolean', default: false, description: '열리지 않음(브라우저 메뉴가 뜬다)' },
    title: { type: 'string', description: '좁은 화면 시트 제목(없으면 "동작")' },
  },
  states: ['default', 'hover', 'focus', 'disabled'],
  a11y: {
    role: 'menu',
    keyboard: [
      'Shift+F10',
      'ContextMenu',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      'Enter',
      'Escape',
    ],
    labelling: 'children',
  },
  platforms: { web: true, native: true },
});
