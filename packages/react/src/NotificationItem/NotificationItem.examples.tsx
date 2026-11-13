import { NotificationItem } from './NotificationItem.js';

// 스토리 · VRT 기준 시각(샘플 회사의 오늘)
const NOW = '2026-11-06T09:00:00+09:00';

/** 줄 모양 — 읽지 않음 점 · 굵은 제목, 상대 시각(가리키면 전체 시각), 확인 필요 배지, 본문 두 줄 */
export function Default() {
  return (
    <div style={{ display: 'grid', maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <NotificationItem
        unread
        title="결재 요청: 11월 법인카드 정산"
        body="한서연 매니저가 결재를 요청했습니다. 금액 1,284,000원"
        time="2026-11-06T08:56:00+09:00"
        now={NOW}
        onPress={() => {}}
      />
      <NotificationItem
        unread
        tone="danger"
        title="원천세 신고 기한이 지났습니다"
        body="10월 귀속 · 테라스파트너스. 오늘 안에 신고하면 가산세가 줄어듭니다"
        time="2026-11-06T06:10:00+09:00"
        now={NOW}
        onPress={() => {}}
      />
      <NotificationItem
        title="입사 서류가 모두 들어왔습니다"
        body="이서연 · 11월 10일 입사"
        time="2026-11-04T17:20:00+09:00"
        now={NOW}
        onPress={() => {}}
      />
    </div>
  );
}

/** 모듈 아이콘 — 여러 모듈 알림이 섞이는 목록은 앞에 모듈 아이콘(32)을 둔다 */
export function WithModule() {
  return (
    <div style={{ display: 'grid', maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <NotificationItem
        unread
        module="approval"
        title="결재 요청: 출장비 정산"
        body="정민호 책임 · 342,000원"
        time="2026-11-06T08:30:00+09:00"
        now={NOW}
        href="#approval"
      />
      <NotificationItem
        module="mail"
        tone="warning"
        toneLabel="회신 기한 D-1"
        title="거래처 회신 대기 3건"
        time="2026-10-27T10:00:00+09:00"
        now={NOW}
        href="#mail"
      />
    </div>
  );
}
