import type { IconName } from '@terracelab/trellis-icons';
import { defineContract, type ContractBase } from '../_base.js';

/** 사람 칩의 아바타(Avatar 규칙: 사진이 없으면 이름 두 글자) */
export interface TagPerson {
  name: string;
  src?: string;
}

export interface TagProps extends ContractBase {
  /** 라벨(분류 · 키워드 · 사람 이름) */
  children?: unknown;
  /** subtle = 옅은 면(기본), outline = 테두리만. 상태 색은 없다(상태는 Badge · StatusDot) */
  variant?: 'subtle' | 'outline';
  /** sm = 높이 20(표 칸 · 카드), md = 높이 24(입력 칸 · 필터) */
  size?: 'sm' | 'md';
  /** 앞 아이콘(16) */
  icon?: IconName;
  /** 앞 사람 아바타(원 24). 있으면 높이 24 */
  person?: TagPerson;
  /** 있으면 × 단추(빼기). 단추 이름은 "<라벨> 삭제" */
  onRemove?: () => void;
  /** × 단추 이름에 쓰는 라벨 글자. 라벨이 글자가 아닐 때(기본 children 글자 · person 이름) */
  label?: string;
  /** 비활성: 흐린 글자, × 단추 없음 */
  disabled?: boolean;
}

export const TagContract = defineContract<TagProps>({
  name: 'Tag',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    children: { type: 'ReactNode', description: '라벨' },
    variant: {
      type: "'subtle' | 'outline'",
      default: 'subtle',
      values: ['subtle', 'outline'],
      description: '모양(subtle 옅은 면 · outline 테두리만). 상태 색 없음',
    },
    size: {
      type: "'sm' | 'md'",
      default: 'md',
      values: ['sm', 'md'],
      description: '높이(sm 20 · md 24)',
    },
    icon: { type: 'IconName', description: '앞 아이콘' },
    person: { type: '{ name, src? }', description: '앞 사람 아바타(원 24)' },
    onRemove: { type: '() => void', description: '× 단추를 누를 때(있으면 단추가 생긴다)' },
    label: { type: 'string', description: '× 단추 이름의 라벨(기본 children 글자 · person 이름)' },
    disabled: { type: 'boolean', default: false, description: '비활성(× 단추 없음)' },
  },
  states: ['default', 'hover', 'focus', 'disabled'],
  a11y: { keyboard: ['Tab', 'Enter', 'Space'], labelling: 'children' },
  platforms: { web: true, native: true },
});
