import { defineContract, type ContractBase } from '../_base.js';

export interface SuggestionChipsProps extends ContractBase {
  /** 추천 질문 · 자주 찾는 글자(짧은 문장 하나씩) */
  items: readonly string[];
  /** 고를 때. 입력 칸에 넣을지 바로 보낼지는 쓰는 쪽이 정한다(Composer · CommandPalette는 넣기만 한다) */
  onSelect: (text: string) => void;
  /** 묶음 이름(접근성). 기본 "추천 질문" */
  label?: string;
  /** 지금 입력과 같은 항목(눌린 모양 · aria-pressed). 주면 모든 칩이 누름 단추가 된다 */
  selected?: string;
  disabled?: boolean;
}

export const SuggestionChipsContract = defineContract<SuggestionChipsProps>({
  name: 'SuggestionChips',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    items: { type: 'string[]', required: true, description: '추천 질문' },
    onSelect: { type: '(text: string) => void', required: true, description: '고를 때' },
    label: { type: 'string', description: '묶음 이름(기본 추천 질문)' },
    selected: { type: 'string', description: '지금 입력과 같은 항목(눌린 모양)' },
    disabled: { type: 'boolean', default: false, description: '비활성' },
  },
  states: ['default', 'hover', 'focus', 'disabled'],
  a11y: { role: 'group', keyboard: ['Tab', 'Enter · Space(고르기)'], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
