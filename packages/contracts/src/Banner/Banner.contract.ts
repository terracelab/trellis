import { defineContract, type ContractBase } from '../_base.js';

export interface BannerProps extends ContractBase {
  /** 아이콘 색. 면과 글자는 항상 중립 */
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  /** 굵은 한 줄(명사구 또는 짧은 평서문) */
  title?: string;
  /** 본문(합니다체 한두 문장) */
  children?: unknown;
  /** 오른쪽 동작(Button sm 하나) */
  action?: unknown;
  /** 있으면 닫기 버튼 */
  onClose?: () => void;
}

export const BannerContract = defineContract<BannerProps>({
  name: 'Banner',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    tone: {
      type: "'info' | 'success' | 'warning' | 'danger' | 'neutral'",
      default: 'info',
      values: ['info', 'success', 'warning', 'danger', 'neutral'],
      description: '톤(아이콘 색)',
    },
    title: { type: 'string', description: '제목' },
    children: { type: 'ReactNode', description: '본문' },
    action: { type: 'ReactNode', description: '오른쪽 동작' },
    onClose: { type: '() => void', description: '닫기(있으면 버튼 표시)' },
  },
  states: ['default'],
  a11y: { role: 'status', keyboard: ['Tab', 'Enter'], labelling: 'children' },
  slots: ['action'],
  platforms: { web: true, native: true },
});
