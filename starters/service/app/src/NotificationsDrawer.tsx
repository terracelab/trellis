// 알림: 읽지 않은 것부터 보고, 누르면 읽음 처리 후 연결된 화면으로 간다.
// link가 '/'로 시작하면 앱 경로, 아니면 화면 블록 id(usePlatform().screens)로 본다
import { usePlatform } from '@terracelab/trellis-blocks/platform';
import { Stack } from '@terracelab/trellis-blocks/ui';
import { Button, Drawer, EmptyState, NotificationCard } from '@terracelab/trellis-react';
import { useNavigate } from 'react-router';

export function NotificationsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { notifications, markRead, screens } = usePlatform();
  const navigate = useNavigate();
  const unread = notifications.filter((n) => !n.read);
  const sorted = [...unread, ...notifications.filter((n) => n.read)];
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
    >
      {notifications.length === 0 ? (
        <EmptyState icon="bell" title="알림이 없습니다" />
      ) : (
        <Stack gap="sm">
          {sorted.map((n) => (
            <NotificationCard
              key={n.id}
              module={n.module}
              title={n.title}
              description={n.body}
              count={n.count}
              time={n.createdAt.slice(5).replace('-', '.')}
              tone={n.tone}
              unread={!n.read}
              onPress={() => {
                markRead([n.id]);
                if (n.link?.startsWith('/')) {
                  onOpenChange(false);
                  navigate(n.link);
                } else if (n.link && screens.has(n.link)) {
                  onOpenChange(false);
                  screens.go(n.link);
                }
              }}
            />
          ))}
        </Stack>
      )}
    </Drawer>
  );
}
