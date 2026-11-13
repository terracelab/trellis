// 플랫폼 기본 · 배치 작업: 작업 목록 · 주기 · 마지막 실행 · 로그 · 수동 실행
import { JOB_STATES } from '@terracelab/trellis-contracts';
import {
  Badge,
  Button,
  DataGrid,
  DataGridLines,
  DescriptionList,
  Drawer,
  KpiCard,
  ModuleIcon,
  PageHeader,
  Progress,
  StatusDot,
  Switch,
  Timeline,
  useToast,
} from '@terracelab/trellis-react';
import modules from '@terracelab/trellis-tokens/modules';
import { useEffect, useState } from 'react';
import { JOBS, useCan, type BatchJob, type JobRun } from '../../../_platform/index.js';
import { NOW, NOW_AT } from '../../../_data/profile.js';
import { TODAY } from '../../../_data/trade.js';
import { Col, Grid, Page } from '../../../_ui/index.js';

const moduleLabel = (id: string) => modules.modules.find((m) => m.id === id)?.label ?? '플랫폼';

export default function Batch() {
  const toast = useToast();
  const canRun = useCan('platform', 'update');
  const [jobs, setJobs] = useState<BatchJob[]>(() => JOBS.map((j) => ({ ...j })));
  const [openId, setOpenId] = useState<string | null>(null);
  const [running, setRunning] = useState<{ id: string; pct: number } | null>(null);
  const open = jobs.find((j) => j.id === openId) ?? null;
  useEffect(() => {
    if (!running) return;
    if (running.pct >= 100) {
      const run: JobRun = {
        id: `m${Date.now()}`,
        jobId: running.id,
        state: 'succeeded',
        startedAt: NOW_AT,
        finishedAt: NOW_AT,
        durationSec: 6,
        processed: 2,
        failed: 0,
        trigger: 'manual',
        log: [{ time: `${NOW}:01`, level: 'info', message: '수동 실행 · 2건 처리' }],
      };
      setJobs((js) => js.map((j) => (j.id === running.id ? { ...j, runs: [run, ...j.runs] } : j)));
      toast.show({
        title: '배치 작업을 실행했습니다',
        description: `${jobs.find((j) => j.id === running.id)?.name} · 2건 처리`,
        tone: 'success',
      });
      setRunning(null);
      return;
    }
    const t = setTimeout(() => setRunning({ ...running, pct: running.pct + 20 }), 300);
    return () => clearTimeout(t);
  }, [running, jobs, toast]);
  const last = (j: BatchJob) => j.runs[0];
  const failed = jobs.filter((j) => last(j)?.state === 'failed');
  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: '관리' }, { label: '배치 작업' }]}
          title="배치 작업"
          description="정해진 시각에 자동으로 도는 작업. 실패하면 담당자에게 알림이 갑니다"
          actions={
            <Button icon="plus" disabled={!canRun}>
              작업 추가
            </Button>
          }
        />
      }
    >
      <Grid>
        <Col span={4}>
          <KpiCard
            label="켜진 작업"
            value={jobs.filter((j) => j.enabled).length}
            unit="개"
            caption={`전체 ${jobs.length}개`}
            icon="timer"
          />
        </Col>
        <Col span={4}>
          <KpiCard
            label="오늘 실행"
            value={jobs.reduce(
              (a, j) => a + j.runs.filter((r) => r.startedAt.startsWith(TODAY)).length,
              0,
            )}
            unit="회"
            caption="수동 실행 포함"
            icon="activity"
          />
        </Col>
        <Col span={4}>
          <KpiCard
            label="마지막 실행 실패"
            value={failed.length}
            unit="개"
            caption={failed[0]?.name ?? '실패 없음'}
            icon="circle-alert"
            onPress={failed[0] ? () => setOpenId(failed[0]!.id) : undefined}
          />
        </Col>
      </Grid>
      <DataGrid
        caption="배치 작업"
        height="fill"
        rows={jobs}
        rowKey="id"
        onRowPress={(j) => setOpenId(j.id)}
        activeRowKey={openId}
        rowTone={(j) => (last(j)?.state === 'failed' ? 'danger' : undefined)}
        columns={[
          {
            key: 'name',
            header: '작업',
            width: 'xl',
            render: (j) => (
              <span className="tl-block-row" data-justify="start">
                {j.module !== 'platform' && <ModuleIcon module={j.module} size={32} decorative />}
                <DataGridLines
                  primary={j.name}
                  secondary={
                    <>
                      {moduleLabel(j.module)} · 담당 {j.owner}
                    </>
                  }
                />
              </span>
            ),
          },
          { key: 'scheduleLabel', header: '주기', width: 'md' },
          {
            key: 'last',
            header: '마지막 실행',
            width: 'lg',
            render: (j) =>
              last(j) ? (
                <StatusDot tone={JOB_STATES[last(j)!.state].tone}>
                  {JOB_STATES[last(j)!.state].label} · {last(j)!.startedAt.slice(5)}
                </StatusDot>
              ) : (
                '–'
              ),
          },
          {
            key: 'nextRunAt',
            header: '다음 실행',
            width: 'md',
            render: (j) => (j.enabled ? (j.nextRunAt?.slice(5) ?? '–') : '꺼짐'),
          },
          {
            key: 'enabled',
            header: '사용',
            width: 'sm',
            align: 'center',
            render: (j) => (
              <Switch
                size="sm"
                checked={j.enabled}
                disabled={!canRun}
                onChange={(v) =>
                  setJobs((js) => js.map((x) => (x.id === j.id ? { ...x, enabled: v } : x)))
                }
              >
                <span className="tl-sr-only">{j.name} 사용</span>
              </Switch>
            ),
          },
        ]}
      />
      <Drawer
        open={open !== null}
        onOpenChange={(o) => !o && setOpenId(null)}
        title={open?.name ?? ''}
        description={
          open ? `${moduleLabel(open.module)} · ${open.scheduleLabel} · cron ${open.schedule}` : ''
        }
        width="lg"
        actions={
          open && (
            <Badge tone={open.enabled ? 'success' : 'neutral'}>
              {open.enabled ? '켜짐' : '꺼짐'}
            </Badge>
          )
        }
        footer={
          open && (
            <Button
              variant="primary"
              icon="play"
              disabled={!canRun || running !== null}
              onPress={() => setRunning({ id: open.id, pct: 0 })}
            >
              지금 실행
            </Button>
          )
        }
      >
        {open && (
          <div className="tl-block-drawer-stack">
            <p className="tl-block-muted">{open.description}</p>
            {running?.id === open.id && <Progress label="실행 중" value={running.pct} />}
            <DescriptionList
              columns={2}
              items={[
                { label: '다음 실행', value: open.nextRunAt ?? '–' },
                { label: '담당', value: open.owner },
                { label: '최근 처리', value: `${open.runs[0]?.processed ?? 0}건` },
                { label: '최근 소요', value: `${open.runs[0]?.durationSec ?? 0}초` },
              ]}
            />
            {open.runs.map((r) => (
              <section key={r.id} className="tl-block-run">
                <StatusDot tone={JOB_STATES[r.state].tone} pulse={r.state === 'running'}>
                  {r.startedAt} · {JOB_STATES[r.state].label} ·{' '}
                  {r.trigger === 'manual' ? '수동' : r.trigger === 'retry' ? '재시도' : '예약'}
                </StatusDot>
                <Timeline
                  dense
                  ariaLabel={`${r.startedAt} 실행 로그`}
                  items={r.log.map((l, i) => ({
                    id: `${r.id}-${i}`,
                    title: l.message,
                    time: l.time,
                    tone:
                      l.level === 'error' ? 'danger' : l.level === 'warn' ? 'warning' : 'neutral',
                  }))}
                />
              </section>
            ))}
          </div>
        )}
      </Drawer>
    </Page>
  );
}
