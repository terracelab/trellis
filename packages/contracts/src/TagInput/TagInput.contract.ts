import { defineContract, SIZES, type ContractBase, type Size } from '../_base.js';

/** 추천 항목 하나. person 모드는 사람(value = 사번 · 사용자 id, label = 이름, meta = 직책 · 부서) */
export interface TagSuggestion {
  /** 값(person 모드는 사람 id) */
  value: string;
  /** 칩 · 목록에 보이는 이름 */
  label: string;
  /** 목록 보조 글자(직책 · 부서 · 설명). 찾기 대상에 들어간다 */
  meta?: string;
  /** 사진 주소(person 모드) */
  src?: string;
  disabled?: boolean;
}

export interface TagInputProps extends ContractBase {
  /** 넣은 값들(제어). person 모드는 사람 id */
  value?: readonly string[];
  defaultValue?: readonly string[];
  onChange?: (value: string[]) => void;
  /** 입력하면 걸러 보이는 추천(이름 · 값 · 보조 글자에서 찾는다). 넣은 값은 빠진다 */
  suggestions?: readonly TagSuggestion[];
  /** text = 글자 칩(키워드 · 분류), person = 사람 칩(아바타 + 이름, 참조자 · 참석자) */
  mode?: 'text' | 'person';
  /** 추천에 없는 글자를 Enter · 쉼표로 넣는다. 기본 text = true, person = false */
  allowCustom?: boolean;
  /** 넣을 수 있는 최대 개수. 다 차면 입력 칸이 잠긴다 */
  max?: number;
  /** 아무것도 없을 때 보이는 예시 글자 */
  placeholder?: string;
  size?: Size;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  /** 폼 이름. 값마다 같은 이름의 숨은 입력을 둔다 */
  name?: string;
  /** Field 밖에서 쓸 때의 접근성 이름 */
  label?: string;
}

/** 추천 거르기: 이름 · 값 · 보조 글자 어디에 걸려도(대소문자 무시). 넣은 값 · 빈 글자는 뺀다 */
export function filterTagSuggestions(
  suggestions: readonly TagSuggestion[],
  query: string,
  picked: readonly string[] = [],
): TagSuggestion[] {
  const q = query.trim().toLocaleLowerCase('ko-KR');
  return suggestions.filter(
    (s) =>
      !picked.includes(s.value) &&
      (!q || `${s.label} ${s.value} ${s.meta ?? ''}`.toLocaleLowerCase('ko-KR').includes(q)),
  );
}

/** 붙여 넣은 글자를 칩으로 나눈다(쉼표 · 줄바꿈 · 탭). 앞뒤 공백 · 빈 칸 · 겹친 값은 뺀다 */
export function splitTagText(text: string): string[] {
  const out: string[] = [];
  for (const part of text.split(/[,\n\t]/)) {
    const v = part.trim();
    if (v && !out.includes(v)) out.push(v);
  }
  return out;
}

export const TagInputContract = defineContract<TagInputProps>({
  name: 'TagInput',
  props: {
    id: { type: 'string', description: '입력 칸 id(Field 안이면 자동)' },
    testID: { type: 'string', description: '테스트 식별자' },
    value: { type: 'string[]', description: '넣은 값들(제어). person은 사람 id' },
    defaultValue: { type: 'string[]', description: '처음 값' },
    onChange: { type: '(value: string[]) => void', description: '바뀔 때(값 전부)' },
    suggestions: {
      type: 'TagSuggestion[]',
      description: '추천(value · label · meta · src · disabled). 입력하면 거른다',
    },
    mode: {
      type: "'text' | 'person'",
      default: 'text',
      values: ['text', 'person'],
      description: 'text 글자 칩 · person 사람 칩(아바타 + 이름)',
    },
    allowCustom: {
      type: 'boolean',
      description: '추천에 없는 글자 넣기(기본 text = true · person = false)',
    },
    max: { type: 'number', description: '최대 개수(다 차면 입력 잠김)' },
    placeholder: { type: 'string', description: '비어 있을 때 예시 글자' },
    size: {
      type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
      default: 'md',
      values: SIZES,
      description: '최소 높이(칩이 넘치면 줄이 늘어난다)',
    },
    disabled: { type: 'boolean', default: false, description: '비활성' },
    invalid: { type: 'boolean', default: false, description: '오류 표시' },
    required: { type: 'boolean', default: false, description: '필수' },
    name: { type: 'string', description: '폼 이름(값마다 숨은 입력)' },
    label: { type: 'string', description: 'Field 밖 접근성 이름' },
  },
  states: ['default', 'hover', 'focus', 'disabled', 'error'],
  a11y: {
    role: 'combobox',
    keyboard: ['ArrowDown', 'ArrowUp', 'Enter', 'Comma', 'Backspace', 'Escape', 'Tab'],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
