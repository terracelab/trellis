import { defineContract, type ContractBase } from '../_base.js';
import type { ChangeDiffRow } from '../_shared/diff.js';

export interface ChangeDiffProps extends ContractBase {
  /** 바뀐 필드 줄. 만들 때는 contracts diffFields(before, after, fields) */
  rows: readonly ChangeDiffRow[];
  /** table = 대상 · 항목 · 변경 내용 표, list = 한 줄씩(고정폭 글자, 변경 이력 · 확인 창) */
  layout?: 'table' | 'list';
  /** 넘으면 이만큼만 보이고 "외 N건" 단추로 펼친다 */
  maxRows?: number;
  /** 줄이 없을 때 문구. 기본 "바뀐 내용이 없습니다" */
  empty?: string;
  /** 표 제목(화면에는 숨김, 읽기 전용). 기본 "변경 내용" */
  caption?: string;
}

export const ChangeDiffContract = defineContract<ChangeDiffProps>({
  name: 'ChangeDiff',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    rows: {
      type: '{ target?: string; field: string; before?: string | null; after?: string | null }[]',
      required: true,
      description: '바뀐 필드 줄(diffFields로 만든다)',
    },
    layout: {
      type: "'table' | 'list'",
      default: 'table',
      values: ['table', 'list'],
      description: '모양(표 · 한 줄 목록)',
    },
    maxRows: { type: 'number', description: '처음 보일 줄 수(넘으면 "외 N건")' },
    empty: { type: 'string', description: '줄이 없을 때 문구' },
    caption: { type: 'string', description: '표 제목(숨김)' },
  },
  states: ['default', 'focus'],
  a11y: { keyboard: ['Tab', 'Enter'], labelling: 'aria-label' },
  platforms: { web: true, native: true },
});
