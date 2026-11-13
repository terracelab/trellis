// 플랫폼 기본 · 알림 센터: 알림 목록 + 이벤트 × 채널 설정
import {
  Button,
  Card,
  Checkbox,
  EmptyState,
  FilterBar,
  ModuleIcon,
  NotificationCard,
  PageHeader,
  Select,
  Switch,
  Tabs,
  useToast,
} from '@terracelab/trellis-react';
import modules from '@terracelab/trellis-tokens/modules';
import { useState } from 'react';
import {
  CHANNEL_LABELS,
  NOTIFICATION_RULES,
  useOpenLink,
  usePlatform,
  type NotificationChannel,
} from '../../../_platform/index.js';
import { Lines, Page, Stack } from '../../../_ui/index.js';
import '../../admin/roles/style.css';

const label = (id: string) => modules.modules.find((m) => m.id === id)?.label ?? '플랫폼';

export default function NotificationCenter() {
  const toast = useToast();
  const { notifications, markRead } = usePlatform();
  const openLink = useOpenLink();
  const [tab, setTab] = useState('inbox');
  const [mod, setMod] = useState<string | null>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [rules, setRules] = useState(() =>
    NOTIFICATION_RULES.map((r) => ({ ...r, channels: { ...r.channels } })),
  );
  const shown = notifications.filter(
    (n) => (mod === 'all' || !mod || n.module === mod) && (!unreadOnly || !n.read),
  );
  const mods = [...new Set(notifications.map((n) => n.module))];
  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: '관리' }, { label: '알림 센터' }]}
          title="알림 센터"
          description={`읽지 않은 알림 ${notifications.filter((n) => !n.read).length}건`}
          actions={
            tab === 'inbox' && (
              <Button onPress={() => markRead(notifications.map((n) => n.id))}>모두 읽음</Button>
            )
          }
          tabs={
            <Tabs
              label="알림"
              value={tab}
              onChange={setTab}
              items={[
                { value: 'inbox', label: '알림', count: notifications.length },
                { value: 'rules', label: '받는 방법' },
              ]}
            />
          }
        />
      }
    >
      {tab === 'inbox' ? (
        <>
          <FilterBar resultCount={shown.length}>
            <Select
              size="sm"
              width="auto"
              label="모듈"
              value={mod}
              onChange={setMod}
              options={[
                { value: 'all', label: '모듈 전체' },
                ...mods.map((m) => ({ value: m, label: label(m) })),
              ]}
            />
            <Switch checked={unreadOnly} onChange={setUnreadOnly} size="sm">
              읽지 않은 것만
            </Switch>
          </FilterBar>
          {shown.length === 0 ? (
            <Card>
              <EmptyState
                icon="bell-off"
                title="알림이 없습니다"
                description="조건을 바꾸거나 나중에 다시 보세요"
              />
            </Card>
          ) : (
            <div className="tl-block-notes">
              {shown.map((n) => (
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
                    // link = 블록 id(?k=v). 그 화면이 앱에 없으면 읽음 처리만 한다
                    openLink(n.link)?.();
                  }}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <Card
          title="이벤트별 받는 방법"
          subtitle="앱 알림은 항상 남습니다. 문자 · 알림톡은 업무 시간(08:00~20:00)에만 보냅니다"
        >
          <Stack gap="lg">
            <div className="tl-block-matrix" role="table" aria-label="이벤트별 채널">
              <div className="tl-block-matrix__row tl-block-matrix__head tl-block-rules" role="row">
                <span role="columnheader">이벤트</span>
                {(Object.keys(CHANNEL_LABELS) as NotificationChannel[]).map((c) => (
                  <span key={c} role="columnheader">
                    {CHANNEL_LABELS[c]}
                  </span>
                ))}
              </div>
              {rules.map((r, i) => (
                <div key={r.event} className="tl-block-matrix__row tl-block-rules" role="row">
                  <span role="rowheader" className="tl-block-matrix__module">
                    <ModuleIcon module={r.module} size={32} decorative />
                    <Lines primary={r.label} secondary={r.description} />
                  </span>
                  {(Object.keys(CHANNEL_LABELS) as NotificationChannel[]).map((c) => (
                    <span key={c} role="cell" className="tl-block-matrix__cell">
                      <Checkbox
                        aria-label={`${r.label} ${CHANNEL_LABELS[c]}`}
                        checked={r.channels[c]}
                        disabled={c === 'app'}
                        onChange={(v) =>
                          setRules((rs) =>
                            rs.map((x, j) =>
                              j === i ? { ...x, channels: { ...x.channels, [c]: v } } : x,
                            ),
                          )
                        }
                      />
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <div>
              <Button
                variant="primary"
                onPress={() => toast.show({ title: '받는 방법을 저장했습니다', tone: 'success' })}
              >
                저장
              </Button>
            </div>
          </Stack>
        </Card>
      )}
    </Page>
  );
}
