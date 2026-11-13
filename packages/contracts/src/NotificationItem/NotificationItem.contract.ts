import { defineContract, type ContractBase, type ModuleId } from '../_base.js';

export interface NotificationItemProps extends ContractBase {
  /** 무슨 일인지 한 줄(결재 요청 · 기한 지남) */
  title: string;
  /** 보조 글(누가 · 무엇을). 두 줄까지, 넘치면 말줄임 */
  body?: string;
  /** 발생 시각(ISO). 상대 시각("3분 전")으로 보이고 전체 시각은 time 요소에 남는다 */
  time: string;
  /** 상대 시각의 기준(없으면 지금). 시험 · 스토리에서 고정할 때 */
  now?: string;
  /** 읽지 않음: 앞 점 + 굵은 제목 + 숨은 글자 "읽지 않음" */
  unread?: boolean;
  /** 모듈 아이콘(32). 여러 모듈 알림이 섞이는 목록에서 */
  module?: ModuleId;
  /** danger · warning이면 제목 옆 배지(toneLabel). 나머지는 배지 없음 */
  tone?: 'neutral' | 'warning' | 'danger';
  /** 배지 글자. 기본 "확인 필요" */
  toneLabel?: string;
  /** 있으면 링크(알림이 가리키는 화면) */
  href?: string;
  /** 누를 때(읽음 처리 + 이동). href와 함께 쓰면 링크를 누를 때 함께 부른다 */
  onPress?: () => void;
}

export const NotificationItemContract = defineContract<NotificationItemProps>({
  name: 'NotificationItem',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    title: { type: 'string', required: true, description: '무슨 일인지 한 줄' },
    body: { type: 'string', description: '보조 글(두 줄까지)' },
    time: { type: 'string', required: true, description: '발생 시각(ISO)' },
    now: { type: 'string', description: '상대 시각 기준(없으면 지금)' },
    unread: { type: 'boolean', default: false, description: '읽지 않음' },
    module: { type: 'ModuleId', description: '모듈 아이콘' },
    tone: {
      type: "'neutral' | 'warning' | 'danger'",
      default: 'neutral',
      description: 'danger · warning이면 배지',
    },
    toneLabel: { type: 'string', description: '배지 글자(기본 "확인 필요")' },
    href: { type: 'string', description: '링크 주소' },
    onPress: { type: '() => void', description: '누를 때(읽음 + 이동)' },
  },
  states: ['default', 'hover', 'focus'],
  a11y: { keyboard: ['Tab', 'Enter'], labelling: 'children' },
  platforms: { web: true, native: true },
});
