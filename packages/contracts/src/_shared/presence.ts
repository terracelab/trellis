// 사람 상태 어휘 둘의 관계(R-T26, PG-35). 어휘는 바꾸지 않는다(이름 변경은 major).
//   근무 상태 PresenceState(hr.ts): 오늘 어디서 일하나. 근무 중 · 재택 · 외근 · 휴가 · 퇴근. 인사 · 근태 · 조직도 · PersonLabel presence
//   접속 상태 AvatarStatus(Avatar): 지금 메신저에 있나. 온라인 · 자리 비움 · 다른 용무 중 · 오프라인. 메신저 · Avatar status
// 둘은 다른 질문이라 한쪽으로 합치지 않는다. 근무 상태만 아는 화면이 아바타 점을 그릴 때 presenceToStatus로 바꾼다.
import type { AvatarStatus } from '../Avatar/Avatar.contract.js';
import type { PresenceState } from './hr.js';
import { formatMessage, type Locale } from './messages.js';
import type { StatusTone } from './vocab.js';

/** 접속 상태 → 점 색 톤. Avatar 점 색과 같다(온라인 초록 · 자리 비움 주황 · 다른 용무 중 빨강 · 오프라인 회색) */
export const AVATAR_STATUS_TONES: Record<AvatarStatus, StatusTone> = {
  online: 'success',
  away: 'warning',
  busy: 'danger',
  offline: 'neutral',
};

/** 근무 상태 → 접속 상태. 근무 중 · 재택 = 온라인, 외근 = 자리 비움, 휴가 · 퇴근 = 오프라인 */
export const PRESENCE_TO_STATUS: Record<PresenceState, AvatarStatus> = {
  working: 'online',
  remote: 'online',
  fieldwork: 'away',
  leave: 'offline',
  off: 'offline',
};

/** 근무 상태만 아는 화면이 아바타 점(Avatar status)을 그릴 때 */
export function presenceToStatus(presence: PresenceState): AvatarStatus {
  return PRESENCE_TO_STATUS[presence];
}

/** 근무 상태 라벨(근무 중 · 재택 · 외근 · 휴가 · 퇴근). 블록이 글자를 직접 고르지 않게 한다 */
export function presenceLabel(presence: PresenceState, locale: Locale = 'ko'): string {
  return formatMessage(locale, `hr.presence.${presence}`);
}

/** 접속 상태 라벨(온라인 · 자리 비움 · 다른 용무 중 · 오프라인) */
export function avatarStatusLabel(status: AvatarStatus, locale: Locale = 'ko'): string {
  return formatMessage(locale, `avatar.${status}`);
}
