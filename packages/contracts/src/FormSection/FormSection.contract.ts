import { defineContract, type ContractBase } from '../_base.js';

export interface FormSectionProps extends ContractBase {
  /** 묶음 제목(기본 정보 · 공급받는 자 · 품목) */
  title?: string;
  description?: string;
  /** 격자 열 수. 폼 · 등록 패턴은 2 */
  columns?: 1 | 2 | 3;
  /** 제목 오른쪽 동작 */
  action?: unknown;
  /** 접을 수 있는 묶음(선택 항목). 제목 줄이 펼침 단추가 된다 */
  collapsible?: boolean;
  /** 펼침(제어) */
  open?: boolean;
  /** 처음 펼침(비제어, 기본 접힘) */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: unknown;
}

export const FormSectionContract = defineContract<FormSectionProps>({
  name: 'FormSection',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    title: { type: 'string', description: '묶음 제목' },
    description: { type: 'string', description: '설명 한 문장' },
    columns: { type: '1 | 2 | 3', default: 2, values: ['1', '2', '3'], description: '격자 열 수' },
    action: { type: 'ReactNode', description: '제목 오른쪽 동작' },
    collapsible: { type: 'boolean', default: false, description: '접을 수 있는 묶음(선택 항목)' },
    open: { type: 'boolean', description: '펼침(제어)' },
    defaultOpen: { type: 'boolean', default: false, description: '처음 펼침(비제어)' },
    onOpenChange: { type: '(open: boolean) => void', description: '펼침이 바뀔 때' },
    children: { type: 'ReactNode', description: 'Field 목록' },
  },
  // 묶음 자체는 상호작용이 없다. 접는 단추(collapsible)는 단추 문법(가리킴 · 포커스 링)을 따른다
  states: ['default'],
  a11y: {
    role: 'group',
    keyboard: ['Tab', 'Enter · Space(접힌 묶음 펼치기)'],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
