import { defineContract, type ContractBase } from '../_base.js';

/** "@"로 부르는 사람(멘션 후보) */
export interface ComposerMention {
  /** 사람 id(보낼 때 mentions로 돌려준다) */
  id: string;
  /** 넣는 이름(@ 뒤 글자: 김테라). 띄어쓰기 없이 */
  name: string;
  /** 목록 보조 글자(팀 · 직책). 찾기 대상에 들어간다 */
  meta?: string;
  /** 사진 주소. 없으면 이름 앞 두 글자 */
  avatarSrc?: string;
}

/** "/"로 부르는 명령 */
export interface ComposerCommand {
  id: string;
  /** 명령 이름(/ 뒤 글자: 전표 · 공지). 띄어쓰기 없이 */
  name: string;
  /** 무엇을 하는지 한 줄(목록 보조 글자) */
  description?: string;
}

/** 보낼 때 글과 함께 넘기는 것 */
export interface ComposerSendMeta {
  /** 글에 남아 있는 멘션의 사람 id(넣은 순서, 중복 없음). 넣었다가 지운 이름은 빠진다 */
  mentions: string[];
  /** 글이 명령(/이름)으로 시작하면 그 명령 id */
  command?: string;
}

export interface ComposerProps extends ContractBase {
  /** 입력 칸 이름. Field 안이면 Field 라벨을 쓴다 */
  label?: string;
  /** 예시 문구. 없으면 "메시지 입력" */
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (text: string) => void;
  /**
   * 보내기. 글자는 앞뒤 공백을 뺀 값, 파일은 붙인 것(웹 File).
   * meta(멘션한 사람 id · 명령)는 mentions · commands가 있을 때만 넘긴다
   */
  onSend: (text: string, files: unknown[], meta?: ComposerSendMeta) => void;
  /** 파일 첨부 단추 */
  attachable?: boolean;
  /** 받을 형식(.pdf,.xlsx · image/*) */
  accept?: string;
  /** 글자 수 제한. 있으면 글자 수를 보인다 */
  maxLength?: number;
  /** 늘어나는 최대 줄 수. 넘으면 칸 안에서 스크롤 */
  maxRows?: number;
  /** Enter로 보내고 Shift+Enter로 줄을 바꾼다. false면 Enter가 줄바꿈이고 Ctrl+Enter로 보낸다 */
  enterToSend?: boolean;
  /** 보내는 중. 보내기 단추가 처리 중이 되고 입력은 그대로 */
  loading?: boolean;
  disabled?: boolean;
  /** 보내기 단추 글자. 없으면 "보내기" */
  sendLabel?: string;
  /** 휴대폰에서 화면 아래에 붙인다(안전 영역 여백 포함) */
  sticky?: boolean;
  /** 입력 위 추천 질문(SuggestionChips). 누르면 그 글을 입력 칸에 넣는다. 보내기는 사용자가 한다 */
  suggestions?: readonly string[];
  /** "@"를 치면 보이는 사람 목록(PG-33). 고르면 "@이름 "을 넣고, 보낼 때 meta.mentions로 id를 돌려준다 */
  mentions?: readonly ComposerMention[];
  /** 글 맨 앞에서 "/"를 치면 보이는 명령 목록(PG-33). 고르면 "/이름 "을 넣고 onCommand를 부른다 */
  commands?: readonly ComposerCommand[];
  /** 명령을 골랐을 때(넣은 직후) */
  onCommand?: (id: string) => void;
}

export const ComposerContract = defineContract<ComposerProps>({
  name: 'Composer',
  props: {
    id: { type: 'string', description: '입력 칸 id(Field 안이면 자동)' },
    testID: { type: 'string', description: '테스트 식별자' },
    label: { type: 'string', description: '입력 칸 이름(Field 밖이면 필요)' },
    placeholder: { type: 'string', description: '예시 문구' },
    value: { type: 'string', description: '글자(제어)' },
    defaultValue: { type: 'string', description: '처음 글자' },
    onChange: { type: '(text: string) => void', description: '글자가 바뀔 때' },
    onSend: {
      type: '(text: string, files: File[], meta?: ComposerSendMeta) => void',
      required: true,
      description: '보내기(글자 · 붙인 파일, 멘션 · 명령이 있으면 사람 id와 명령)',
    },
    attachable: { type: 'boolean', default: true, description: '파일 첨부 단추' },
    accept: { type: 'string', description: '받을 파일 형식' },
    maxLength: { type: 'number', description: '글자 수 제한(글자 수 표시)' },
    maxRows: { type: 'number', default: 6, description: '늘어나는 최대 줄 수' },
    enterToSend: {
      type: 'boolean',
      default: true,
      description: 'Enter로 보내기(false면 Ctrl+Enter)',
    },
    loading: { type: 'boolean', default: false, description: '보내는 중' },
    disabled: { type: 'boolean', default: false, description: '비활성' },
    sendLabel: { type: 'string', description: '보내기 단추 글자' },
    sticky: { type: 'boolean', default: false, description: '휴대폰에서 화면 아래에 붙임' },
    suggestions: { type: 'string[]', description: '입력 위 추천 질문(누르면 입력 칸에 넣는다)' },
    mentions: { type: 'ComposerMention[]', description: '"@" 사람 목록(멘션)' },
    commands: { type: 'ComposerCommand[]', description: '글 맨 앞 "/" 명령 목록' },
    onCommand: { type: '(id: string) => void', description: '명령을 골랐을 때' },
  },
  states: ['default', 'hover', 'focus', 'disabled', 'loading'],
  a11y: {
    keyboard: [
      'Enter(보내기)',
      'Shift+Enter(줄바꿈)',
      'Ctrl+Enter',
      'Tab',
      'ArrowUp · ArrowDown(멘션 · 명령 목록)',
      'Enter · Tab(목록에서 고르기)',
      'Escape(목록 닫기)',
    ],
    labelling: 'label-prop',
  },
  slots: ['files'],
  platforms: { web: true, native: true },
});
