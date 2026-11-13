import { defineContract, type ContractBase } from '../_base.js';

/** 출처 하나(답변이 근거로 삼은 문서) */
export interface CitationSource {
  /** 출처 번호(1부터). 없으면 목록 순서 */
  index?: number;
  /** 문서 이름(2026 급여 규정 · 전표 EX-2611-0018) */
  title: string;
  /** 쪽 · 절(12쪽 · 3.2 지급 기준) */
  location?: string;
  /** 문서 주소. 있으면 링크(새 창) */
  href?: string;
}

export interface CitationProps extends ContractBase {
  sources: readonly CitationSource[];
  /** list = 답변 아래 번호 붙은 출처 칩 목록, inline = 글 안 번호 표시 */
  layout?: 'list' | 'inline';
  /** 출처를 열 때(앱 안 문서 보기). 있으면 href보다 먼저다 */
  onOpen?: (source: CitationSource) => void;
  /** 목록 이름(list). 기본 "출처" */
  label?: string;
}

/** 출처 번호: index가 없으면 목록 순서(1부터) */
export function citationIndex(source: CitationSource, position: number): number {
  return source.index ?? position + 1;
}

export const CitationContract = defineContract<CitationProps>({
  name: 'Citation',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    sources: {
      type: '{ index?: number; title: string; location?: string; href?: string }[]',
      required: true,
      description: '출처(번호 · 문서 이름 · 쪽 · 주소)',
    },
    layout: {
      type: "'list' | 'inline'",
      default: 'list',
      values: ['list', 'inline'],
      description: '모양(답변 아래 목록 · 글 안 번호)',
    },
    onOpen: { type: '(source: CitationSource) => void', description: '출처를 열 때' },
    label: { type: 'string', description: '목록 이름(기본 출처)' },
  },
  states: ['default', 'hover', 'focus'],
  a11y: { keyboard: ['Tab', 'Enter(열기)'], labelling: 'aria-label' },
  platforms: { web: true, native: true },
});
