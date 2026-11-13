import { defineContract, type ContractBase } from '../_base.js';
import type { PresenceState } from '../_shared/hr.js';
import type { AvatarStatus } from '../Avatar/Avatar.contract.js';

export interface PersonLabelProps extends ContractBase {
  /** 사람 이름. 공석(vacant)이면 없어도 된다 */
  name?: string;
  /** 한 줄 보조 글자(직책 · 부서). 이름 아래(md) 또는 옆(sm) */
  meta?: string;
  /** 사진 주소 */
  src?: string;
  /** 오늘 근무 상태(근무 중 · 재택 · 외근 · 휴가 · 퇴근). md는 점 + 글자, sm은 점만(글자는 화면 읽기 · 툴팁) */
  presence?: PresenceState;
  /** 메신저 접속 상태(온라인 · 자리 비움 · 다른 용무 중 · 오프라인). 아바타 오른쪽 아래 점(Avatar status, R-T59). 근무 상태만 알면 presenceToStatus */
  status?: AvatarStatus;
  /** sm = 아바타 24 · 한 줄(표 칸), md = 아바타 32 · 두 줄(목록) */
  size?: 'sm' | 'md';
  /** 있으면 링크(구성원 상세) */
  href?: string;
  /** 있으면 단추(상세 서랍 열기). href와 함께 쓰지 않는다 */
  onPress?: () => void;
  /** 공석(PR-34): 점선 아바타 + vacantLabel. 사람 있는 줄과 같은 높이. href · onPress는 쓰지 않고 action을 둔다 */
  vacant?: boolean;
  /** 공석 글자. 기본 "담당자 없음" */
  vacantLabel?: string;
  /** 공석 줄 끝 동작(예: "담당자 지정" 단추). 표 칸(sm)은 Button xs, 목록(md)은 Button sm */
  action?: unknown;
}

export const PersonLabelContract = defineContract<PersonLabelProps>({
  name: 'PersonLabel',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    name: { type: 'string', description: '사람 이름(공석이면 없어도 된다)' },
    meta: { type: 'string', description: '보조 글자(직책 · 부서)' },
    src: { type: 'string', description: '사진 주소' },
    presence: {
      type: "'working' | 'remote' | 'fieldwork' | 'leave' | 'off'",
      values: ['working', 'remote', 'fieldwork', 'leave', 'off'],
      description: '오늘 근무 상태(md 점 + 글자, sm 점만)',
    },
    status: {
      type: "'online' | 'away' | 'busy' | 'offline'",
      values: ['online', 'away', 'busy', 'offline'],
      description: '메신저 접속 상태(아바타 점)',
    },
    size: {
      type: "'sm' | 'md'",
      default: 'md',
      values: ['sm', 'md'],
      description: 'sm = 한 줄(표 칸), md = 두 줄(목록)',
    },
    href: { type: 'string', description: '링크 주소(구성원 상세)' },
    onPress: { type: '() => void', description: '누를 때(상세 서랍)' },
    vacant: { type: 'boolean', default: false, description: '공석(점선 아바타 + 담당자 없음)' },
    vacantLabel: { type: 'string', description: '공석 글자(기본 "담당자 없음")' },
    action: { type: 'ReactNode', description: '공석 줄 끝 동작(담당자 지정)' },
  },
  states: ['default', 'hover', 'focus'],
  a11y: { keyboard: ['Tab', 'Enter'], labelling: 'children' },
  platforms: { web: true, native: true },
});
