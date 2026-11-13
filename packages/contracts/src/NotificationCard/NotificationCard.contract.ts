import { defineContract, type ContractBase, type ModuleId } from '../_base.js';

export interface NotificationCardProps extends ContractBase {
  /** 모듈 id. 모듈 타일이 카드 왼쪽에 온다 */
  module: ModuleId;
  /** 상태 한 줄(읽지 않은 메일 · 3일 넘은 결재) */
  title: string;
  /** 보조 한 줄 */
  description?: string;
  /** 숫자 하나. 99를 넘으면 99+ */
  count?: number;
  /** 발생 시각(이미 서식을 맞춘 글자: 09:12 · 3일 전) */
  time?: string;
  /** danger = 지연 · 오류만(D-35). 기본은 중립 회색 배지 */
  tone?: 'neutral' | 'danger';
  /** 읽지 않음 점 */
  unread?: boolean;
  /** 눌렀을 때(모듈 화면으로 이동) */
  onPress?: () => void;
}

export const NotificationCardContract = defineContract<NotificationCardProps>({
  name: 'NotificationCard',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    module: { type: 'ModuleId', required: true, description: '모듈 id' },
    title: { type: 'string', required: true, description: '상태 한 줄' },
    description: { type: 'string', description: '보조 한 줄' },
    count: { type: 'number', description: '카운트(99+)' },
    time: { type: 'string', description: '발생 시각 글자' },
    tone: {
      type: "'neutral' | 'danger'",
      default: 'neutral',
      values: ['neutral', 'danger'],
      description: '카운트 배지 색',
    },
    unread: { type: 'boolean', default: false, description: '읽지 않음 점' },
    onPress: { type: '() => void', description: '눌렀을 때(카드 전체가 버튼)' },
  },
  states: ['default', 'hover', 'active', 'focus'],
  a11y: { role: 'button', keyboard: ['Enter', 'Space'], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
