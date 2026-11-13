import type { IconName } from '@terracelab/trellis-icons';
import { defineContract, type ContractBase } from '../_base.js';

/** 단추 하나. pressed가 있으면 켜고 끄는 단추(aria-pressed) */
export interface ToolbarItem {
  id: string;
  /** 접근성 이름 · 툴팁(굵게 · 목록 · 표) */
  label: string;
  /** 아이콘. 없으면 text를 그린다 */
  icon?: IconName;
  /** 아이콘이 없는 서식 글자(굵게 "가"). 짧게 한두 자 */
  text?: string;
  /** text 글자 모양(굵게 · 기울임 · 밑줄 · 취소선) */
  textStyle?: 'bold' | 'italic' | 'underline' | 'strike';
  /** 아이콘 옆에 label을 글자로도 보인다 */
  showLabel?: boolean;
  /** 켜고 끄는 단추의 지금 상태. undefined면 누르는 단추 */
  pressed?: boolean;
  /** 잠금. 화살표 이동에는 남는다(aria-disabled) */
  disabled?: boolean;
  /** 단축키 표시(Ctrl+B). 툴팁 · aria-keyshortcuts */
  shortcut?: string;
}

/** 묶음. 묶음 사이에 세로 구분선이 들어간다 */
export interface ToolbarGroup {
  id: string;
  /** 묶음 이름(접근성, 글자 서식 · 넣기) */
  label?: string;
  items?: readonly ToolbarItem[];
  /** 단추 대신 넣는 부품(문단 서식 Select). 안의 첫 초점 요소가 화살표 이동에 들어간다. 웹: ReactNode */
  content?: unknown;
}

export interface ToolbarProps extends ContractBase {
  /** 도구 줄 이름(접근성, 서식) */
  label: string;
  groups: readonly ToolbarGroup[];
  /** 단추를 누를 때(id). 켜고 끄는 단추는 부르는 쪽이 pressed를 뒤집는다 */
  onPress?: (id: string) => void;
  /** 끝 자리(글자 수 · 저장 시각). 초점을 받지 않는 글자. 웹: ReactNode */
  end?: unknown;
  /** 단추 크기: sm 30(기본) · md 36 */
  size?: 'sm' | 'md';
  orientation?: 'horizontal' | 'vertical';
  /** 전부 잠금(결재 중 문서). 단추는 화살표 이동에 남는다 */
  disabled?: boolean;
}

export const ToolbarContract = defineContract<ToolbarProps>({
  name: 'Toolbar',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    label: { type: 'string', required: true, description: '도구 줄 이름(접근성)' },
    groups: {
      type: 'ToolbarGroup[]',
      required: true,
      description: '묶음(id · label · items · content). 묶음 사이 구분선',
    },
    onPress: { type: '(id: string) => void', description: '단추를 누를 때' },
    end: { type: 'ReactNode', description: '끝 자리 글자(초점 없음)' },
    size: {
      type: "'sm' | 'md'",
      default: 'sm',
      values: ['sm', 'md'],
      description: '단추 크기(sm 30 · md 36)',
    },
    orientation: {
      type: "'horizontal' | 'vertical'",
      default: 'horizontal',
      values: ['horizontal', 'vertical'],
      description: '방향(화살표 키도 따라간다)',
    },
    disabled: { type: 'boolean', default: false, description: '전부 잠금' },
  },
  states: ['default', 'hover', 'active', 'focus', 'disabled'],
  a11y: {
    role: 'toolbar',
    keyboard: [
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      'Enter',
      'Space',
    ],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
