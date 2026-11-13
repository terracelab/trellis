import type { IconName } from '@terracelab/trellis-icons';
import { defineContract, type ContractBase } from '../_base.js';
import type { AttachmentFile } from '../Attachment/Attachment.contract.js';
import type { CitationSource } from '../Citation/Citation.contract.js';

/** 답변 평가(좋음 · 나쁨) */
export type MessageThreadFeedback = 'good' | 'bad';

/** 보낸 사람 */
export interface MessageThreadAuthor {
  id: string;
  /** 이름(직함까지: 문채원 주임) */
  name: string;
  /** 이름 옆 보조 글자(팀 · 회사) */
  meta?: string;
  /** 사진 주소. 없으면 이름 앞 두 글자 */
  avatarSrc?: string;
}

/** 반응 종류(앱이 정한다: 확인 · 좋아요). 아이콘으로 그린다(이모지 글꼴에 기대지 않는다) */
export interface MessageThreadReactionOption {
  /** 종류 키(check · thumbs-up) */
  key: string;
  /** 접근성 이름 · 툴팁(확인 · 좋아요) */
  label: string;
  icon: IconName;
}

/** 메시지에 붙은 반응 하나 */
export interface MessageThreadReaction extends MessageThreadReactionOption {
  /** 누른 사람 수. 0이면 그리지 않는다 */
  count: number;
  /** 내가 누른 반응(눌린 모양 · aria-pressed) */
  mine?: boolean;
}

/** 답글이 가리키는 원문(말풍선 위 인용) */
export interface MessageThreadReply {
  /** 원문 메시지 id. 대화에 있으면 인용을 눌러 원문으로 간다 */
  id?: string;
  /** 원문 보낸 사람 이름 */
  author: string;
  /** 원문 글. 한 줄로 줄여 보인다 */
  text: string;
}

/** 대화의 메시지 하나 */
export interface MessageThreadItem {
  id: string;
  /** 보낸 시각 'YYYY-MM-DD HH:mm'(T로 이어도 된다) */
  at: string;
  /** 보낸 사람. system 메시지는 비워도 된다 */
  author?: MessageThreadAuthor;
  /** 내 쪽 메시지(오른쪽 정렬, 이름 · 아바타 없음) */
  own?: boolean;
  /**
   * message = 말풍선, system = 가운데 알림 줄(담당 변경 · 입장),
   * answer = 에이전트 답변(말풍선 없이 폭을 쓰는 RichText 본문 · 출처 · 실행 단계 · 동작 줄)
   */
  kind?: 'message' | 'system' | 'answer';
  /** message · system은 평문(줄바꿈 · 주소 링크), answer는 마크다운 일부(RichText) */
  text?: string;
  files?: readonly AttachmentFile[];
  /** 말풍선 아래 내용(업무 카드). 웹은 ReactNode */
  extra?: unknown;
  /** 내 메시지의 안 읽은 사람 수. 0이면 "읽음", 없으면 표시하지 않는다 */
  unread?: number;
  /** 보내는 중 · 보내지 못함(answer의 failed는 "답변하지 못했습니다" + 다시 생성) */
  status?: 'sending' | 'failed';
  /** answer: 쓰는 중. 본문 끝 커서 · aria-busy, 동작 줄은 다 쓴 뒤에 보인다 */
  streaming?: boolean;
  /** answer: 출처. 본문의 [1] 표시와 본문 아래 출처 목록 */
  citations?: readonly CitationSource[];
  /** answer: 본문 위 실행 단계(RunSteps collapsible). 웹은 ReactNode */
  steps?: unknown;
  /** answer: 내가 남긴 평가(좋음 · 나쁨 단추가 눌린 모양) */
  feedback?: MessageThreadFeedback;
  /** 반응(PG-36). 말풍선 아래 아이콘 + 수, onReact가 있으면 눌러 켜고 끈다 */
  reactions?: readonly MessageThreadReaction[];
  /** 답글이면 원문(PG-36). 말풍선 위 인용 */
  replyTo?: MessageThreadReply;
  /** 글 안 "@이름"을 멘션으로 보일 이름(PG-36). Composer onSend meta.mentions의 사람 이름 */
  mentions?: readonly string[];
}

export interface MessageThreadProps extends ContractBase {
  /** 오래된 것부터 */
  messages: readonly MessageThreadItem[];
  /** 대화 이름(목록의 접근성 이름: 구매팀 메시지) */
  label: string;
  /** 이 메시지부터 "새 메시지" 구분선 */
  unreadFrom?: string;
  /** 더 이전 메시지가 있으면 맨 위에 "이전 메시지" 단추 */
  hasOlder?: boolean;
  onLoadOlder?: () => void;
  /** 이전 메시지를 불러오는 중 */
  loading?: boolean;
  /** 보내지 못한 메시지 다시 보내기. 있으면 실패 메시지 옆에 단추 */
  onRetry?: (id: string) => void;
  /** 날짜 구분선의 "오늘" 기준(YYYY-MM-DD). 없으면 기기 날짜 */
  today?: string;
  /** 같은 사람이 이 분 안에 이어 보내면 이름 · 아바타를 한 번만 */
  groupMinutes?: number;
  /** fill = 부모 높이를 채우고 안에서 스크롤(새 메시지에서 아래로), auto = 내용 높이 */
  height?: 'auto' | 'fill';
  /** 메시지가 없을 때 문구 */
  empty?: string;
  /** 답변 동작 줄 "복사"를 누른 뒤(글은 컴포넌트가 클립보드에 넣는다). 복사 단추는 늘 보인다 */
  onCopy?: (id: string) => void;
  /** 답변 다시 만들기. 있으면 동작 줄에 "다시 생성" */
  onRegenerate?: (id: string) => void;
  /** 답변 평가. 있으면 "좋음 · 나쁨". 눌린 것을 다시 누르면 null */
  onFeedback?: (id: string, value: MessageThreadFeedback | null) => void;
  /** 답변의 출처를 열 때(본문 [1] · 출처 목록). 없으면 출처 href로 새 창 */
  onCitationOpen?: (id: string, source: CitationSource) => void;
  /** 반응을 켜고 끌 때(PG-36). 있으면 반응이 누름 단추가 된다 */
  onReact?: (id: string, key: string) => void;
  /** 고를 수 있는 반응(PG-36). onReact와 함께 주면 메시지마다 "반응 추가" 메뉴 */
  reactionOptions?: readonly MessageThreadReactionOption[];
  /** 답글 쓰기(PG-36). 있으면 메시지마다 "답글" 단추. 입력 칸 위 원문 표시는 앱이 한다 */
  onReply?: (id: string) => void;
  /** 지금 입력 중인 사람 이름(PG-36). 맨 아래 "김테라 팀장 입력 중" */
  typing?: readonly string[];
}

export const MessageThreadContract = defineContract<MessageThreadProps>({
  name: 'MessageThread',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    messages: {
      type: 'MessageThreadItem[]',
      required: true,
      description: '메시지(오래된 것부터)',
    },
    label: { type: 'string', required: true, description: '대화 이름(접근성 이름)' },
    unreadFrom: { type: 'string', description: '"새 메시지" 구분선을 둘 메시지 id' },
    hasOlder: { type: 'boolean', default: false, description: '"이전 메시지" 단추' },
    onLoadOlder: { type: '() => void', description: '이전 메시지 불러오기' },
    loading: { type: 'boolean', default: false, description: '이전 메시지 불러오는 중' },
    onRetry: { type: '(id: string) => void', description: '실패 메시지 다시 보내기' },
    today: { type: 'string', description: '"오늘" 기준 날짜(YYYY-MM-DD)' },
    groupMinutes: {
      type: 'number',
      default: 5,
      description: '같은 사람 메시지를 묶는 간격(분)',
    },
    height: {
      type: "'auto' | 'fill'",
      default: 'auto',
      values: ['auto', 'fill'],
      description: '내용 높이 · 부모 높이를 채우고 안에서 스크롤',
    },
    empty: { type: 'string', description: '메시지가 없을 때 문구' },
    onCopy: { type: '(id: string) => void', description: '답변을 복사한 뒤' },
    onRegenerate: { type: '(id: string) => void', description: '답변 다시 생성(있으면 단추)' },
    onFeedback: {
      type: "(id: string, value: 'good' | 'bad' | null) => void",
      description: '답변 평가(있으면 좋음 · 나쁨 단추)',
    },
    onCitationOpen: {
      type: '(id: string, source: CitationSource) => void',
      description: '답변의 출처를 열 때',
    },
    onReact: {
      type: '(id: string, key: string) => void',
      description: '반응 켜고 끄기(있으면 반응이 누름 단추)',
    },
    reactionOptions: {
      type: 'MessageThreadReactionOption[]',
      description: '고를 수 있는 반응(onReact와 함께면 "반응 추가")',
    },
    onReply: { type: '(id: string) => void', description: '답글 쓰기(있으면 "답글" 단추)' },
    typing: { type: 'string[]', description: '입력 중인 사람 이름(맨 아래 한 줄)' },
  },
  states: ['default', 'loading'],
  a11y: { role: 'log', keyboard: ['Tab', 'ArrowUp', 'ArrowDown'], labelling: 'label-prop' },
  slots: ['extra', 'steps'],
  platforms: { web: true, native: true },
});
