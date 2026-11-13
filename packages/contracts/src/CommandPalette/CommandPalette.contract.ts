import type { IconName } from '@terracelab/trellis-icons';
import { defineContract, type ContractBase } from '../_base.js';

/** 결과 한 줄(화면 · 할 일 · 거래처 · 명령) */
export interface CommandPaletteItem {
  id: string;
  /** 보이는 이름(명사구). 걸러 찾기 대상 */
  label: string;
  /** 이름 뒤 보조 설명(흐리게). 걸러 찾기 대상 */
  description?: string;
  icon?: IconName;
  /** 오른쪽 끝 짧은 글자(속한 메뉴 · 단축키 · 건수) */
  meta?: string;
  /** 보이지 않는 찾기 낱말(옛 이름 · 줄임말 · 영문) */
  keywords?: readonly string[];
  disabled?: boolean;
}

/** 결과 묶음(최근 · 화면 · 할 일). 묶음 이름이 목록 머리로 보인다 */
export interface CommandPaletteGroup {
  id: string;
  label: string;
  items: readonly CommandPaletteItem[];
}

export interface CommandPaletteProps extends ContractBase {
  /** 열림(inline이면 무시) */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 접근성 이름(보이지 않는다). 기본 "검색 · 이동" */
  title?: string;
  placeholder?: string;
  /** 찾는 글자(제어) */
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  groups: readonly CommandPaletteGroup[];
  /** 결과를 고를 때(Enter · 누르기). 기본으로 닫힌다 */
  onSelect?: (item: CommandPaletteItem, group: CommandPaletteGroup) => void;
  /** 고른 뒤 닫기(기본 true) */
  closeOnSelect?: boolean;
  /** true = 이름 · 설명 · keywords에서 찾는 글자를 포함하는 결과만(대소문자 무시). false = 앱이 이미 걸렀다 */
  filter?: boolean;
  /** 입력 아래 빠른 질문 · 자주 찾는 글자. 누르면 그 글자로 찾는다 */
  suggestions?: readonly string[];
  /** 결과 불러오는 중(스켈레톤 줄) */
  loading?: boolean;
  /** 결과가 없을 때 보이는 것(무엇이 없는지 + 다음 행동) */
  empty?: unknown;
  /** 결과 목록 위 자리(질문에 대한 답 · 안내) */
  children?: unknown;
  /** 대화상자 없이 제자리에 그린다(홈 빠른 이동 · 문서 예시) */
  inline?: boolean;
}

export const CommandPaletteContract = defineContract<CommandPaletteProps>({
  name: 'CommandPalette',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    open: { type: 'boolean', description: '열림(제어)' },
    defaultOpen: { type: 'boolean', default: false, description: '처음 열림' },
    onOpenChange: { type: '(open: boolean) => void', description: '열림이 바뀔 때' },
    title: { type: 'string', default: '검색 · 이동', description: '접근성 이름(보이지 않음)' },
    placeholder: { type: 'string', description: '입력 칸 안내' },
    query: { type: 'string', description: '찾는 글자(제어)' },
    defaultQuery: { type: 'string', default: '', description: '처음 찾는 글자' },
    onQueryChange: { type: '(query: string) => void', description: '찾는 글자가 바뀔 때' },
    groups: { type: 'CommandPaletteGroup[]', required: true, description: '결과 묶음' },
    onSelect: { type: '(item, group) => void', description: '결과를 고를 때' },
    closeOnSelect: { type: 'boolean', default: true, description: '고른 뒤 닫기' },
    filter: {
      type: 'boolean',
      default: true,
      description: '찾는 글자로 거르기(false = 앱이 거름)',
    },
    suggestions: { type: 'string[]', description: '입력 아래 빠른 질문' },
    loading: { type: 'boolean', default: false, description: '불러오는 중(스켈레톤)' },
    empty: { type: 'ReactNode', description: '결과가 없을 때' },
    children: { type: 'ReactNode', description: '결과 위 자리(답 · 안내)' },
    inline: { type: 'boolean', default: false, description: '대화상자 없이 제자리에' },
  },
  states: ['default'],
  a11y: {
    role: 'combobox',
    keyboard: [
      'ArrowDown · ArrowUp(결과 옮기기, 끝에서 처음으로)',
      'Home · End',
      'Tab(다음 묶음 첫 결과)',
      'Enter(고르기)',
      'Escape(닫기)',
    ],
    labelling: 'label-prop',
  },
  slots: ['children', 'empty'],
  platforms: { web: true, native: false },
});
