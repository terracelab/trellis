import { defineContract, type ContractBase } from '../_base.js';

export interface PaginationProps extends ContractBase {
  /** 현재 페이지(1부터) */
  page: number;
  /** 전체 페이지 수. 없으면 total ÷ pageSize */
  pageCount?: number;
  /** 전체 건수. showTotal이면 "총 1,240건" */
  total?: number;
  /** 한 페이지 건수 */
  pageSize?: number;
  onPageChange: (page: number) => void;
  /** 페이지 크기 선택지(20 · 50 · 100). 있으면 오른쪽에 선택 상자 */
  pageSizeOptions?: readonly number[];
  onPageSizeChange?: (pageSize: number) => void;
  showTotal?: boolean;
  disabled?: boolean;
}

export const PaginationContract = defineContract<PaginationProps>({
  name: 'Pagination',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    page: { type: 'number', required: true, description: '현재 페이지(1부터)' },
    pageCount: { type: 'number', description: '전체 페이지 수(없으면 total ÷ pageSize)' },
    total: { type: 'number', description: '전체 건수' },
    pageSize: { type: 'number', default: 20, description: '한 페이지 건수' },
    onPageChange: {
      type: '(page: number) => void',
      required: true,
      description: '페이지를 고를 때',
    },
    pageSizeOptions: { type: 'number[]', description: '페이지 크기 선택지' },
    onPageSizeChange: { type: '(pageSize: number) => void', description: '페이지 크기를 바꿀 때' },
    showTotal: { type: 'boolean', default: true, description: '총 건수 표시' },
    disabled: { type: 'boolean', default: false, description: '비활성(불러오는 중)' },
  },
  states: ['default', 'hover', 'active', 'focus', 'disabled'],
  a11y: { role: 'navigation', keyboard: ['Tab', 'Enter', 'Space'], labelling: 'aria-label' },
  platforms: { web: true, native: true },
});
