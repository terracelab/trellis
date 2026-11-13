// 히어로 양옆의 카드: 실제 컴포넌트를 샘플 값으로 그린다(근태 · 질문 입력 · 시재 · 연차 · 알림).
// 빌드 때 서버에서만 그리고 페이지에서는 inert로 둔다(보여 주기용이라 누를 수 없다).
// 숫자와 날짜는 컴포넌트 예시(packages/react/src/*/*.examples.tsx)와 같다.
import {
  Badge,
  Composer,
  KpiCard,
  LeaveBalance,
  NotificationCard,
  TimeClock,
} from '@terracelab/trellis-react';

const noop = () => {};

export function HeroLeft() {
  return (
    <>
      <div className="tl-site-float" data-slot="clock">
        <TimeClock
          status="working"
          now="2026-11-06T14:32"
          clockIn="09:04"
          place="office"
          workType="고정 근무"
          onClockOut={noop}
          onBreakStart={noop}
        />
      </div>
      <div className="tl-site-float" data-slot="ask">
        <Composer
          label="업무 도우미에게 질문"
          placeholder="전표 · 재고 · 규정을 묻습니다"
          attachable={false}
          sendLabel="질문"
          onSend={noop}
        />
      </div>
      <div className="tl-site-float" data-slot="badges">
        <Badge approval="pending" />
        <Badge approval="approved" />
      </div>
    </>
  );
}

export function HeroRight() {
  return (
    <>
      <div className="tl-site-float" data-slot="leave">
        <LeaveBalance
          granted={15}
          used={2.5}
          planned={1}
          basis="fiscal"
          period={{ from: '2026-01-01', to: '2026-12-31' }}
          expiresOn="2026-12-31"
        />
      </div>
      <div className="tl-site-float" data-slot="cash">
        <KpiCard
          label="당일 시재"
          icon="wallet"
          value={874479500}
          format="amount"
          delta={{ value: 12400000, label: '전일 대비', format: 'amount' }}
          caption="오늘 09:00 기준"
        />
      </div>
      <div className="tl-site-float" data-slot="notice">
        <NotificationCard
          module="approval"
          title="3일 넘은 결재"
          description="지출결의 2건 · 구매품의 2건"
          count={4}
          tone="danger"
          time="어제"
          onPress={noop}
        />
      </div>
    </>
  );
}
