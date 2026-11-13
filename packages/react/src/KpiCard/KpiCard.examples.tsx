import { KpiCard } from './KpiCard.js';

/** 홈 첫 줄 — 금액은 원 단위를 작게 · 증감은 비교 대상 먼저 */
export function HomeRow() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(min(100%, calc(var(--tl-space-64) * 3)), 1fr))',
        gap: 'var(--tl-space-12)',
      }}
    >
      <KpiCard
        label="당일 시재"
        icon="wallet"
        value={874479500}
        format="amount"
        delta={{ value: 12400000, label: '전일 대비', format: 'amount' }}
        caption="오늘 09:00 기준"
        size="lg"
      />
      <KpiCard
        label="당월 매출"
        icon="chart-bar"
        value={1284000000}
        format="compactWon"
        delta={{ value: 12.4, label: '전월 대비' }}
        caption="11월 1일~8일 누계"
        size="lg"
      />
      <KpiCard
        label="당월 매입"
        icon="shopping-cart"
        value={642300000}
        format="compactWon"
        delta={{ value: -3.1, label: '전월 대비' }}
        caption="11월 1일~8일 누계"
        size="lg"
      />
    </div>
  );
}

/** 극성 — 좋고 나쁨이 분명한 지표는 상태 아이콘, 글자는 중립 */
export function Polarity() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(min(100%, calc(var(--tl-space-64) * 3)), 1fr))',
        gap: 'var(--tl-space-12)',
      }}
    >
      <KpiCard
        label="결재 대기"
        value={12}
        unit="건"
        delta={{ value: 4, label: '전일 대비', format: 'number', polarity: 'up-bad' }}
        caption="3일 넘은 결재 4건"
        onPress={() => {}}
      />
      <KpiCard
        label="출고 정시율"
        value={97.2}
        format="percent"
        delta={{ value: 1.3, label: '전주 대비', polarity: 'up-good' }}
        onPress={() => {}}
      />
      <KpiCard
        label="수출 미수금"
        value={184250}
        format="currency"
        currency="USD"
        caption="선적 기준 3건"
      />
    </div>
  );
}

/** 불러오는 중 — 값 자리만 스켈레톤, 라벨은 그대로 */
export function Loading() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 4)' }}>
      <KpiCard
        label="미수금"
        value={0}
        format="amount"
        delta={{ value: 0, label: '전월 대비' }}
        loading
      />
    </div>
  );
}

/** 오류와 가린 값 — 불러오지 못한 지표는 값 자리에서 다시 시도한다. 볼 권한이 없는 지표는 가림 글자와 이유 한 줄 */
export function ErrorAndMasked() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(min(100%, calc(var(--tl-space-64) * 3)), 1fr))',
        gap: 'var(--tl-space-12)',
      }}
    >
      <KpiCard
        label="당월 매출"
        icon="chart-bar"
        value={0}
        format="compactWon"
        delta={{ value: 12.4, label: '전월 대비' }}
        caption="11월 1일~8일 누계"
        error
        onRetry={() => {}}
      />
      <KpiCard
        label="당월 급여 총액"
        icon="banknote"
        value={0}
        format="amount"
        caption="11월 25일 지급 예정"
        masked="급여 정보는 인사팀만 봅니다"
      />
    </div>
  );
}

/** 작은 지표 — sm은 서랍 머리나 상세 위에 몇 개를 나란히 둔다 */
export function Small() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(min(100%, calc(var(--tl-space-64) * 2)), 1fr))',
        gap: 'var(--tl-space-8)',
      }}
    >
      <KpiCard size="sm" label="미수금" value={18420000} format="amount" />
      <KpiCard
        size="sm"
        label="당월 거래"
        value={42}
        unit="건"
        delta={{ value: 6, label: '전월 대비', format: 'number' }}
      />
      <KpiCard
        size="sm"
        label="평균 결제일"
        value={34}
        unit="일"
        delta={{ value: -2, label: '전월 대비', format: 'number', polarity: 'up-bad' }}
      />
    </div>
  );
}
