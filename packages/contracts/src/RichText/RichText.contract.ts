import { defineContract, type ContractBase } from '../_base.js';
import type { CitationSource } from '../Citation/Citation.contract.js';

export interface RichTextProps extends ContractBase {
  /** 마크다운 일부(제목 · 문단 · 목록 · 표 · 코드 · 링크 · 굵게). 해석은 contracts parseRichText */
  text: string;
  /** 쓰는 중. 글이 이어 붙는 동안 끝에 커서를 보이고 aria-busy. 닫히지 않은 블록은 글자 그대로 보인다 */
  streaming?: boolean;
  /** 본문의 [1] 표시가 가리키는 출처(1부터). 있으면 [1]이 Citation 표시가 된다 */
  citations?: readonly CitationSource[];
  /** 출처 표시를 누를 때. 없으면 출처의 href로 새 창 */
  onCitationOpen?: (source: CitationSource) => void;
  /** 링크를 누를 때(앱 안 화면으로 이동). 없으면 http(s)는 새 창 */
  onLinkPress?: (href: string) => void;
  /** 가장 높은 제목의 단계. 기본 3(대화 · 카드 안) */
  headingLevel?: 2 | 3 | 4;
}

export const RichTextContract = defineContract<RichTextProps>({
  name: 'RichText',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    text: {
      type: 'string',
      required: true,
      description: '마크다운 일부(제목 · 목록 · 표 · 코드 · 링크 · 굵게)',
    },
    streaming: { type: 'boolean', default: false, description: '쓰는 중(끝 커서 · aria-busy)' },
    citations: { type: 'CitationSource[]', description: '본문 [1] 표시가 가리키는 출처' },
    onCitationOpen: {
      type: '(source: CitationSource) => void',
      description: '출처 표시를 누를 때',
    },
    onLinkPress: { type: '(href: string) => void', description: '링크를 누를 때(없으면 새 창)' },
    headingLevel: { type: '2 | 3 | 4', default: 3, description: '가장 높은 제목의 단계' },
  },
  states: ['default', 'loading'],
  a11y: { keyboard: ['Tab(링크 · 출처 · 표 스크롤)'], labelling: 'children' },
  platforms: { web: true, native: true },
});
