// 서비스 플랫폼 연결 자리. 백엔드가 생기면 로그인 뒤 받은 session과 알림을 여기서 돌려준다.
// 지금은 undefined라 PlatformProvider가 Trellis 샘플 회사 · 사용자로 돈다.
// Session · NotificationEvent 모양과 PlatformProvider props(screens · screenHref · navigate · initialRole)는
// .claude/skills/trellis/references/blocks.md의 "플랫폼 API" 표에 있다.
import type { NotificationEvent, Session } from '@terracelab/trellis-blocks/platform';

export interface ServicePlatform {
  session?: Session;
  notifications?: readonly NotificationEvent[];
  onMarkRead?: (ids: readonly string[]) => void;
}

export function useServicePlatform(): ServicePlatform {
  return {};
}
