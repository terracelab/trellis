import { defineContract, type ContractBase } from '../_base.js';
import type { StatusTone } from '../_shared/vocab.js';

/** 카드 무게(PR-38): 화면에서 어디부터 볼지. strong은 화면에 하나, quiet는 참고 정보 */
export type CardEmphasis = 'default' | 'strong' | 'quiet';

export interface CardProps extends ContractBase {
  /** 블록 제목(사용자의 말로) */
  title?: unknown;
  /** 단위 · 기간 · 기준 */
  subtitle?: unknown;
  /** 우상단 동작(링크 · 버튼 · 기간 선택) */
  action?: unknown;
  /** 아래 고정 영역(합계 · 더 보기) */
  footer?: unknown;
  /** none = 표처럼 가장자리까지 채우는 내용 */
  padding?: 'default' | 'none';
  /**
   * 무게. default = 흰 면 + 얇은 테두리, strong = 진한 테두리 + 한 단계 큰 제목("지금 해야 할 것", 화면에 하나),
   * quiet = 테두리 · 면 없이 바탕 그대로(참고 정보 · 보조 목록, 카드 안 카드 대신)
   */
  emphasis?: CardEmphasis;
  /** 제목 앞 상태 아이콘(danger · warning 등). 면 색은 바꾸지 않는다. 뜻은 제목 글자로도 말한다 */
  tone?: StatusTone;
  /** 제목 단계. 없으면 화면 바로 아래 h2, 카드 안 카드는 한 단계 아래(제목 단계를 건너뛰지 않는다) */
  headingLevel?: 2 | 3 | 4;
  /** region 랜드마크(section + 제목 이름). 기본 false: 같은 제목 카드가 여러 개면 같은 이름 랜드마크가 겹친다 */
  landmark?: boolean;
  children?: unknown;
}

export const CardContract = defineContract<CardProps>({
  name: 'Card',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    title: { type: 'ReactNode', description: '제목' },
    subtitle: { type: 'ReactNode', description: '단위 · 기간' },
    action: { type: 'ReactNode', description: '우상단 동작' },
    footer: { type: 'ReactNode', description: '아래 영역' },
    padding: {
      type: "'default' | 'none'",
      default: 'default',
      values: ['default', 'none'],
      description: '안쪽 여백',
    },
    emphasis: {
      type: "'default' | 'strong' | 'quiet'",
      default: 'default',
      values: ['default', 'strong', 'quiet'],
      description: '무게(strong은 화면에 하나, quiet는 참고 정보)',
    },
    tone: {
      type: "'info' | 'success' | 'warning' | 'danger' | 'neutral'",
      description: '제목 앞 상태 아이콘(면 색은 그대로)',
    },
    headingLevel: {
      type: '2 | 3 | 4',
      values: ['2', '3', '4'],
      description: '제목 단계(없으면 문맥: 화면 h2, 카드 안 h3)',
    },
    landmark: { type: 'boolean', default: false, description: 'region 랜드마크로(section)' },
    children: { type: 'ReactNode', description: '내용' },
  },
  states: ['default'],
  a11y: { role: 'region', keyboard: [], labelling: 'children' },
  slots: ['title', 'action', 'footer'],
  platforms: { web: true, native: true },
});
