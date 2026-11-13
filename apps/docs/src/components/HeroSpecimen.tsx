// 브랜드 페이지 히어로: 공개 패키지(@terracelab/trellis-react/charts)만으로 조립한 업무 대시보드 조각.
// 숫자는 미리보기(apps/preview/src/data.ts)와 같다. 영어 브랜드 페이지(lang="en")는 문구만 영어이고
// 금액 표기(원 · 억)는 한국 업무 관습 그대로다. 컴포넌트 문구는 TrellisProvider locale="en".
import { formatCompactWon } from '@terracelab/trellis-contracts';
import { TrellisProvider } from '@terracelab/trellis-react';
import {
  BulletBar,
  ChartCard,
  RadialMeter,
  SegmentedBar,
  TrendChart,
} from '@terracelab/trellis-react/charts';

const CASH = [
  781.4, 786.9, 779.2, 790.3, 795.8, 792.1, 801.6, 808.0, 804.3, 812.9, 818.4, 815.2, 822.7, 827.1,
  823.6, 830.9, 836.4, 832.0, 839.5, 845.2, 841.7, 848.3, 844.9, 851.6, 847.2, 850.1, 846.3, 844.0,
  842.15, 874.4795,
].map((n, i, a) => ({ day: `D-${a.length - 1 - i}`, cash: Math.round(n * 1_000_000) }));

const TEXT = {
  ko: {
    label: 'Trellis 컴포넌트로 만든 업무 대시보드 조각',
    cashTitle: '시재 추이',
    cashSubtitle: '원 · 최근 30일 · 음영은 운영 목표 범위',
    cashColumns: ['일', '시재(원)'],
    cashSeries: '시재',
    cashAria: '최근 30일 시재. 7.8억에서 8.7억으로',
    goalTitle: '목표 · 발주 소진',
    salesGoal: '월 매출 목표',
    bullets: ['식자재 발주', '포장재 발주', '카드 한도'],
    mixTitle: '채널 구성',
    mixMeta: '10월 · 원',
    channels: ['직판', '대리점', '온라인', '수출'],
    mixAria: '10월 채널 구성. 직판 47%, 대리점 31%, 온라인 15%, 수출 8%',
  },
  en: {
    label: 'Business dashboard built with Trellis components',
    cashTitle: 'Cash on hand',
    cashSubtitle: 'Won · last 30 days · shaded band is the target range',
    cashColumns: ['Day', 'Cash on hand (won)'],
    cashSeries: 'Cash on hand',
    cashAria: 'Cash on hand over the last 30 days. Up from 780 million to 870 million won',
    goalTitle: 'Targets and order budgets',
    salesGoal: 'Monthly sales target',
    bullets: ['Food orders', 'Packaging', 'Card limit'],
    mixTitle: 'Channel mix',
    mixMeta: 'October · won',
    channels: ['Direct', 'Dealers', 'Online', 'Export'],
    mixAria: 'October channel mix. Direct 47%, dealers 31%, online 15%, export 8%',
  },
} as const;

export default function HeroSpecimen({ lang = 'ko' }: { lang?: 'ko' | 'en' }) {
  const t = TEXT[lang];
  // 좁은 칸이라 영어 상태 칩(Warning · Reached · Over)이 들어가지 않는다. 영어는 칩 없이 막대 색 · 표식으로만
  const showState = lang === 'ko';
  const body = (
    <div className="tl-site-specimen" aria-label={t.label}>
      <ChartCard
        className="tl-site-specimen-main"
        title={t.cashTitle}
        subtitle={t.cashSubtitle}
        height={176}
        action={<span className="tl-site-specimen-figure">874,479,500원</span>}
        table={{ columns: [...t.cashColumns], rows: CASH.map((d) => [d.day, d.cash]) }}
      >
        <TrendChart
          data={CASH}
          x="day"
          series={[{ key: 'cash', label: t.cashSeries, type: 'area' }]}
          unit="원"
          height={176}
          yFormat={formatCompactWon}
          band={{ from: 800_000_000, to: 850_000_000 }}
          endLabel="cash"
          ariaLabel={t.cashAria}
        />
      </ChartCard>
      <section className="tl-site-specimen-card" aria-labelledby="spec-goal">
        <h3 id="spec-goal" className="tl-site-specimen-title">
          {t.goalTitle}
        </h3>
        <div className="tl-site-specimen-goal">
          <RadialMeter value={87.2} label={t.salesGoal} digits={1} size="sm" />
          <div className="tl-site-specimen-bullets">
            <BulletBar
              label={t.bullets[0]}
              value={92}
              target={100}
              unit="%"
              size="sm"
              showState={showState}
            />
            <BulletBar
              label={t.bullets[1]}
              value={100}
              target={100}
              unit="%"
              size="sm"
              showState={showState}
            />
            <BulletBar
              label={t.bullets[2]}
              value={104}
              target={100}
              unit="%"
              size="sm"
              polarity="up-bad"
              showState={showState}
            />
          </div>
        </div>
      </section>
      <section className="tl-site-specimen-card" aria-labelledby="spec-mix">
        <h3 id="spec-mix" className="tl-site-specimen-title">
          {t.mixTitle} <span className="tl-site-specimen-meta">{t.mixMeta}</span>
        </h3>
        <SegmentedBar
          data={[
            { label: t.channels[0], value: 742_000_000, color: 'series-1' },
            { label: t.channels[1], value: 486_000_000, color: 'series-2' },
            { label: t.channels[2], value: 238_000_000, color: 'series-3' },
            { label: t.channels[3], value: 122_000_000, color: 'series-4' },
          ]}
          unit="원"
          format={formatCompactWon}
          ariaLabel={t.mixAria}
        />
      </section>
    </div>
  );
  return lang === 'en' ? <TrellisProvider locale="en">{body}</TrellisProvider> : body;
}
