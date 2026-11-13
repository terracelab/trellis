import { NotificationCard } from './NotificationCard.js';

/** 알림 카드 홈 — 모듈 타일 · 상태 한 줄 · 숫자 하나, 지연만 위험 색 */
export function Home() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(min(100%, calc(var(--tl-space-64) * 4.5)), 1fr))',
        gap: 'var(--tl-space-12)',
      }}
    >
      <NotificationCard
        module="mail"
        title="읽지 않은 메일"
        description="(주)한빛식자재 발주 확인 외"
        count={8}
        time="09:12"
        unread
        onPress={() => {}}
      />
      <NotificationCard
        module="approval"
        title="3일 넘은 결재"
        description="지출결의 2건 · 구매품의 2건"
        count={4}
        tone="danger"
        time="어제"
        onPress={() => {}}
      />
      <NotificationCard
        module="purchasing"
        title="발주 승인 대기"
        count={12}
        time="08:40"
        onPress={() => {}}
      />
      <NotificationCard
        module="inventory"
        title="안전재고 미달 품목"
        description="냉동 새우 외 5개 품목"
        count={6}
        time="07:00"
        onPress={() => {}}
      />
    </div>
  );
}

/** 숫자 없음 — 처리할 일이 없으면 배지를 숨긴다 */
export function NoCount() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 5)' }}>
      <NotificationCard
        module="accounting"
        title="11월 부가세 신고서 검토 완료"
        description="담당 최회계"
        time="3일 전"
      />
    </div>
  );
}
