// 현장 보드(FloorBoard): 공장 벽 TV용. 다크 고정 · 큰 숫자 · 라인별 설비 상태 · 지금 작업지시 · 불량 Top 3. 누를 것이 없다
import {
  formatAmount,
  formatDate,
  formatPercent,
  formatQuantity,
  MACHINE_STATES,
  PROGRESS_STATES,
  type MachineState,
} from '@terracelab/trellis-contracts';
import {
  BarList,
  Badge,
  Card,
  ComboChart,
  KpiCard,
  Legend,
  PageHeader,
  Progress,
  RadialMeter,
  Sparkline,
  StatusDot,
} from '@terracelab/trellis-react';
import {
  addMinutes,
  durationLabel,
  EQUIPMENT,
  FLOOR_KPI,
  HOURLY,
  LINES,
  lineAvailability,
  PLANT,
  productByCode,
  sensorNow,
  TODAY_DEFECT,
  TODAY_DEFECTS,
  TODAY_GOOD,
  TODAY_PLAN,
  WORK_ORDERS,
  type Line,
} from '../../../_data/mes-delivery.js';
import { coldRuleLabel, PROFILE } from '../../../_data/profile.js';
import { TODAY } from '../../../_data/trade.js';
import { Figure, Lines, Page } from '../../../_ui/index.js';
import './style.css';

/** 공장 전체 가동률 = 두 라인 가동 시간 합 / 계획 시간 합 */
const AVAILABILITY =
  Math.round(
    (LINES.reduce((a, l) => a + PLANT.plannedMin - l.downMin, 0) /
      (PLANT.plannedMin * LINES.length)) *
      1000,
  ) / 10;
const YIELD = Math.round((TODAY_GOOD / (TODAY_GOOD + TODAY_DEFECT)) * 1000) / 10;
const ACHIEVED = Math.round((TODAY_GOOD / TODAY_PLAN) * 1000) / 10;
/** 지금 시각까지 계획 비율: 교대 하루 계획 가동 시간 중 지금까지 */
const TIME_TARGET = Math.round((PLANT.plannedMin / PLANT.dayMin) * 1000) / 10;
const TARGET = { availability: FLOOR_KPI.availabilityTarget, yield: FLOOR_KPI.yieldTarget };
const PREV_YIELD = FLOOR_KPI.prevYield;
const PER_HOUR = Math.round(TODAY_GOOD / (PLANT.plannedMin / 60));
const TOP3 = [...TODAY_DEFECTS].sort((a, b) => b.value - a.value).slice(0, 3);
/** 라인에 속하지 않은 설비(보관 창고 등) */
const STORAGE = EQUIPMENT.filter((e) => !LINES.some((l) => l.id === e.lineId));
const NEXT = WORK_ORDERS.filter((w) => w.state === 'todo' || w.state === 'hold');
/** 시간대별 양품 합(라인 전체) */
const hourTotal = (h: (typeof HOURLY)[number]) =>
  LINES.reduce((a, l) => a + Number(h[l.id] ?? 0), 0);
const PEAK = HOURLY.reduce<(typeof HOURLY)[number] | undefined>(
  (best, h) => (!best || hourTotal(h) > hourTotal(best) ? h : best),
  undefined,
);
const SERIES_COLORS = ['series-1', 'series-2', 'series-3', 'series-4', 'series-5'] as const;
const SERIES = LINES.map((l, i) => ({
  key: l.id,
  label: l.name,
  color: SERIES_COLORS[i % SERIES_COLORS.length]!,
}));
const RANK: readonly MachineState[] = ['down', 'maintenance', 'setup', 'idle', 'running'];

/** 라인 상태: 데이터에 있으면 그대로, 없으면 라인 설비 중 가장 나쁜 상태 */
const lineState = (l: Line): MachineState =>
  l.state ?? RANK.find((s) => EQUIPMENT.some((e) => e.lineId === l.id && e.state === s)) ?? 'idle';

export default function FloorBoard() {
  return (
    <div className="tl-block-board" data-theme="dark" data-density="comfortable">
      <Page
        header={
          <PageHeader
            title="현장 보드"
            description={`${PLANT.name} · ${formatDate(TODAY, 'mdw')} ${PLANT.shift} ${PLANT.shiftTime}`}
            actions={
              <div className="tl-block-board__clock">
                <StatusDot tone="success" pulse>
                  실시간
                </StatusDot>
                <span className="tl-block-board__time">{PLANT.updatedAt}</span>
                <span className="tl-block-muted">갱신 · 자동 새로고침 30초</span>
              </div>
            }
          />
        }
      >
        <section className="tl-block-board__kpis" aria-label="오늘 지표">
          <Card>
            <div className="tl-block-board__meter">
              <RadialMeter
                value={AVAILABILITY}
                digits={1}
                size="md"
                label="가동률"
                caption={`목표 ${formatPercent(TARGET.availability)}`}
                tone={AVAILABILITY < TARGET.availability ? 'warning' : 'success'}
              />
              <div className="tl-block-board__figures">
                {LINES.map((l) => (
                  <Figure key={l.id} label={l.name} value={formatPercent(lineAvailability(l))} />
                ))}
                <Figure
                  label="비가동 누계"
                  value={durationLabel(LINES.reduce((a, l) => a + l.downMin, 0))}
                />
              </div>
            </div>
          </Card>
          <Card>
            <div className="tl-block-board__meter">
              <RadialMeter
                value={YIELD}
                digits={1}
                size="md"
                label="수율"
                caption={`목표 ${formatPercent(TARGET.yield)}`}
                tone={YIELD < TARGET.yield ? 'warning' : 'success'}
              />
              <div className="tl-block-board__figures">
                <Figure
                  label="불량률"
                  value={formatPercent((TODAY_DEFECT / (TODAY_GOOD + TODAY_DEFECT)) * 100)}
                />
                <Figure label="불량" value={formatQuantity(TODAY_DEFECT, 'EA')} />
                <Figure label="전일 수율" value={formatPercent(PREV_YIELD)} />
              </div>
            </div>
          </Card>
          <Card>
            <div className="tl-block-board__meter">
              <RadialMeter
                value={ACHIEVED}
                digits={1}
                size="md"
                label="일 계획 달성률"
                caption={`${PLANT.now} 기준 ${formatPercent(TIME_TARGET)}`}
                tone={ACHIEVED < TIME_TARGET ? 'warning' : 'success'}
              />
              <div className="tl-block-board__figures">
                <Figure label="계획" value={formatQuantity(TODAY_PLAN, 'EA')} />
                <Figure label="남은 수량" value={formatQuantity(TODAY_PLAN - TODAY_GOOD, 'EA')} />
                <Figure label="시간당 양품" value={formatQuantity(PER_HOUR, 'EA')} />
              </div>
            </div>
          </Card>
          <KpiCard
            label="오늘 양품"
            value={TODAY_GOOD}
            unit="EA"
            size="lg"
            icon="package-check"
            delta={{
              value: FLOOR_KPI.goodDelta,
              label: '전일 같은 시각 대비',
              polarity: 'up-good',
            }}
            caption={`불량 ${formatQuantity(TODAY_DEFECT, 'EA')} · 전일보다 ${formatQuantity(Math.abs(FLOOR_KPI.defectDiff), 'EA')} ${FLOOR_KPI.defectDiff <= 0 ? '적음' : '많음'}`}
          />
        </section>

        <section className="tl-block-board__main" aria-label="라인 현황">
          {LINES.map((l) => {
            const wo =
              WORK_ORDERS.find((w) => w.lineId === l.id && w.state === 'doing') ??
              WORK_ORDERS.find((w) => w.lineId === l.id && w.state === 'todo')!;
            const prev = WORK_ORDERS.find((w) => w.lineId === l.id && w.state === 'done');
            const product = productByCode(wo.productCode);
            const remain = wo.planned - wo.good;
            const state = lineState(l);
            return (
              <Card
                key={l.id}
                title={`${l.name} · ${l.role}`}
                subtitle={`${l.leader} · 가동률 ${formatPercent(lineAvailability(l))}`}
                action={
                  <Badge tone={MACHINE_STATES[state].tone} size="md">
                    {MACHINE_STATES[state].label}
                  </Badge>
                }
              >
                <div className="tl-block-board__line">
                  <div className="tl-block-board__wo">
                    <div className="tl-block-board__wo-head">
                      <span className="tl-block-code">{wo.id}</span>
                      <Badge tone={PROGRESS_STATES[wo.state].tone}>
                        {PROGRESS_STATES[wo.state].label}
                      </Badge>
                    </div>
                    <strong className="tl-block-board__product">{product.name}</strong>
                    <Progress
                      label="양품 / 계획"
                      value={wo.good}
                      max={wo.planned}
                      unit="EA"
                      tone={wo.state === 'doing' ? 'success' : 'neutral'}
                    />
                    <div className="tl-block-board__wo-meta">
                      {wo.state === 'doing' ? (
                        <>
                          <Figure label="불량" value={formatQuantity(wo.defect, 'EA')} />
                          <Figure label="시작" value={wo.start ?? '–'} />
                          <Figure
                            label="예상 완료"
                            value={addMinutes(
                              PLANT.now,
                              Math.ceil((remain / product.stdPerHour) * 60),
                            )}
                          />
                        </>
                      ) : (
                        <>
                          <Figure label="시작 예정" value={wo.planStart} />
                          <Figure label="계획" value={formatQuantity(wo.planned, 'EA')} />
                          <Figure
                            label="직전 작업"
                            value={prev ? formatQuantity(prev.good, 'EA') : '–'}
                          />
                        </>
                      )}
                    </div>
                  </div>
                  <ul className="tl-block-board__machines" aria-label={`${l.name} 설비`}>
                    {EQUIPMENT.filter((e) => e.lineId === l.id).map((e) => (
                      <li key={e.id} className="tl-block-board__machine" data-state={e.state}>
                        <span className="tl-block-board__machine-head">
                          <StatusDot tone={MACHINE_STATES[e.state].tone}>
                            {e.name} · {MACHINE_STATES[e.state].label}
                          </StatusDot>
                          <span className="tl-block-board__since">{e.since}부터</span>
                        </span>
                        <span className="tl-block-board__machine-note">
                          {e.state === 'running'
                            ? `오늘 가동 ${durationLabel(e.runMin)}`
                            : (e.reason ?? '')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
          <Card title="불량 Top 3" subtitle={`오늘 ${formatQuantity(TODAY_DEFECT, 'EA')} · 유형별`}>
            <div className="tl-block-board__defects">
              <BarList
                data={TOP3.map((d) => ({ label: d.label, value: d.value }))}
                layout="horizontal"
                unit="EA"
                height={TOP3.length * 44 + 16}
                showValues
                color="series-3"
                ariaLabel={`오늘 불량 유형 상위 3개. ${TOP3.map((d) => `${d.label} ${d.value}EA`).join(', ')}`}
              />
              <ul className="tl-block-board__rest">
                {[...TODAY_DEFECTS]
                  .sort((a, b) => b.value - a.value)
                  .slice(3)
                  .map((d) => (
                    <li key={d.type}>
                      <span>{d.label}</span>
                      <span className="tl-block-code">{formatQuantity(d.value, 'EA')}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </Card>
        </section>

        <section
          className="tl-block-board__bottom"
          aria-label="시간대별 생산 · 보관 온도 · 다음 작업"
        >
          <Card
            title="시간대별 양품"
            subtitle="EA · 1라인 · 2라인 합계 · 점심 12시 제외"
            action={
              <Legend
                items={SERIES.map((s) => ({ label: s.label, color: s.color, shape: 'square' }))}
              />
            }
          >
            <div className="tl-block-board__hourly">
              <ComboChart
                data={HOURLY}
                x="hour"
                bars={SERIES}
                stacked
                unit="EA"
                height={150}
                ariaLabel={`오늘 시간대별 양품. ${PEAK ? `${PEAK.hour}가 ${formatQuantity(hourTotal(PEAK), 'EA')}로 가장 많다` : ''}`}
              />
            </div>
          </Card>
          <Card
            title={`${PROFILE.cold?.storage ?? '보관 설비'} 온도`}
            subtitle={`${PROFILE.cold ? `허용 ${coldRuleLabel()} · ` : ''}최근 24시간`}
          >
            <ul className="tl-block-board__temps">
              {STORAGE.map((e) => {
                const now = sensorNow(e);
                const warn = now > e.sensor.range[1] - 1;
                return (
                  <li key={e.id} className="tl-block-board__temp">
                    <StatusDot tone={warn ? 'warning' : 'success'}>
                      {e.name} · {warn ? '상한 근접' : '정상'}
                    </StatusDot>
                    <Sparkline
                      data={[...e.sensor.values]}
                      width={96}
                      height={32}
                      color={warn ? 'warning' : 'series-1'}
                      ariaLabel={`${e.name} 24시간 온도. ${formatAmount(e.sensor.values[0]!, { digits: 1 })}°C에서 ${formatAmount(now, { digits: 1 })}°C`}
                    />
                    <span className="tl-block-board__temp-value">
                      {formatAmount(now, { digits: 1 })}
                      <span className="tl-block-figure__unit">°C</span>
                    </span>
                    <span className="tl-block-board__temp-note">
                      {e.reason ??
                        `24시간 평균 ${formatAmount(e.sensor.values.reduce((a, v) => a + v, 0) / e.sensor.values.length, { digits: 1 })}°C`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card title="다음 작업지시" subtitle={`대기 · 보류 ${NEXT.length}건`}>
            <ul className="tl-block-board__next">
              {NEXT.map((w) => (
                <li key={w.id} className="tl-block-board__next-row">
                  <Lines
                    primary={productByCode(w.productCode).name}
                    secondary={
                      <>
                        {w.planStart} 시작 · {LINES.find((l) => l.id === w.lineId)!.name} ·{' '}
                        {formatQuantity(w.planned, 'EA')}
                      </>
                    }
                  />
                  <Badge tone={PROGRESS_STATES[w.state].tone}>
                    {PROGRESS_STATES[w.state].label}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      </Page>
    </div>
  );
}
