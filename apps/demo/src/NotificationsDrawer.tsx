// 알림 센터(플랫폼 기본): 모듈 알림을 한 곳에서 보고 누르면 그 화면으로 간다
import { useOpenLink, usePlatform } from '@terracelab/trellis-blocks/platform';
import { Badge, Button, Drawer } from '@terracelab/trellis-react';
import modules from '@terracelab/trellis-tokens/modules';
import { go } from './router.js';

export function NotificationsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { notifications, markRead } = usePlatform();
  // 알림 link = 블록 id(?k=v). 화면 주소는 PlatformProvider screenHref가 만든다
  const openLink = useOpenLink();
  const unread = notifications.filter((n) => !n.read);
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="알림"
      description={`읽지 않은 알림 ${unread.length}건`}
      width="md"
      actions={
        <Button
          size="sm"
          variant="ghost"
          disabled={unread.length === 0}
          onPress={() => markRead(unread.map((n) => n.id))}
        >
          모두 읽음
        </Button>
      }
      footer={
        <Button
          onPress={() => {
            onOpenChange(false);
            go('platform/notifications/center');
          }}
        >
          알림 센터 열기
        </Button>
      }
    >
      <ul className="tl-demo-notes">
        {notifications.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              className="tl-demo-note tl-focusable"
              data-unread={!n.read || undefined}
              onClick={() => {
                markRead([n.id]);
                const open = openLink(n.link);
                if (open) {
                  onOpenChange(false);
                  open();
                }
              }}
            >
              <span className="tl-demo-note__module">
                {modules.modules.find((m) => m.id === n.module)?.label ?? '플랫폼'}
              </span>
              <span className="tl-demo-note__title">{n.title}</span>
              {n.body && <span className="tl-demo-note__body">{n.body}</span>}
              <span className="tl-demo-note__meta">
                {n.createdAt.slice(5)}
                {n.tone === 'danger' && !n.read && (
                  <Badge size="sm" variant="solid" tone="danger">
                    확인 필요
                  </Badge>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Drawer>
  );
}
