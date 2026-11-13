import type { IconName } from '@terracelab/trellis-icons';
import { defineContract, type ContractBase } from '../_base.js';

/** 실행 항목 */
export interface MenuActionItem {
  type?: 'item';
  id: string;
  /** 동사 어간 또는 명사(수정 · 복사 · 삭제) */
  label: string;
  icon?: IconName;
  /** 단축키 표기(Ctrl+D). 표시만 하고 키를 잇지는 않는다 */
  shortcut?: string;
  /** 되돌릴 수 없는 동작. 아이콘만 위험 색, 글자는 중립 */
  danger?: boolean;
  disabled?: boolean;
  /**
   * 비활성 이유(권한 없음 · 이미 처리됨). disabled와 함께 주면 항목에 포커스가 닿고,
   * 이유를 툴팁(가리킴 · 키보드)과 aria-describedby로 알린다. Button disabledReason과 같은 이름
   */
  disabledReason?: string;
  onSelect?: () => void;
}

/** 구분선 */
export interface MenuSeparatorItem {
  type: 'separator';
}

/** 묶음 이름. 다음 구분선 · 묶음 이름까지의 항목을 묶는다 */
export interface MenuLabelItem {
  type: 'label';
  label: string;
}

export type MenuEntry = MenuActionItem | MenuSeparatorItem | MenuLabelItem;

export interface MenuProps extends ContractBase {
  /** 여는 요소 하나(IconButton · Button) */
  trigger: unknown;
  items: readonly MenuEntry[];
  /** 트리거 기준 정렬. 행 끝 더 보기 버튼은 end */
  align?: 'start' | 'end';
  disabled?: boolean;
  /** 좁은 화면 시트 제목. 없으면 트리거 이름(IconButton label · Button 글자) */
  title?: string;
}

export const MenuContract = defineContract<MenuProps>({
  name: 'Menu',
  props: {
    id: { type: 'string', description: '메뉴(popup) id' },
    testID: { type: 'string', description: '테스트 식별자(메뉴)' },
    trigger: { type: 'ReactElement', required: true, description: '여는 요소' },
    items: { type: 'MenuEntry[]', required: true, description: '항목 · 구분선 · 묶음 이름' },
    align: {
      type: "'start' | 'end'",
      default: 'end',
      values: ['start', 'end'],
      description: '트리거 기준 정렬',
    },
    disabled: { type: 'boolean', default: false, description: '열리지 않음' },
    title: { type: 'string', description: '좁은 화면 시트 제목(없으면 트리거 이름)' },
  },
  states: ['default', 'hover', 'focus', 'disabled'],
  a11y: {
    role: 'menu',
    keyboard: [
      'Enter',
      'Space',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      'Escape',
      '글자 입력(찾기)',
    ],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
