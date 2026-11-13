import { Button } from '../Button/Button.js';
import { Banner } from './Banner.js';

/** 톤 — 아이콘만 상태 색, 면과 글자는 중립 */
export function Tones() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-8)' }}>
      <Banner tone="info" title="11월 30일 02:00~04:00 시스템 점검">
        점검 중에는 전표 입력과 세금계산서 발행을 할 수 없습니다.
      </Banner>
      <Banner tone="success">10월 결산 마감을 끝냈습니다.</Banner>
      <Banner tone="warning" title="부가세 예정신고 마감 D-3">
        매입 세금계산서 4건이 아직 수취 확인 전입니다.
      </Banner>
      <Banner tone="neutral">이 거래처는 거래 중지 상태입니다. 발주를 등록할 수 없습니다.</Banner>
    </div>
  );
}

/** 동작 · 닫기 — 오류는 alert로 바로 읽히고 다음 행동 버튼 하나 */
export function WithAction() {
  return (
    <Banner
      tone="danger"
      title="세금계산서 3건 국세청 전송 실패"
      action={
        <Button size="sm" icon="refresh-cw">
          다시 전송
        </Button>
      }
      onClose={() => {}}
    >
      공급받는자 사업자등록번호를 확인한 뒤 다시 전송하세요.
    </Banner>
  );
}

/** 좁은 자리 — 폭이 560 미만이면 동작 단추가 글 아래 줄로 내려가고 닫기는 오른쪽 위에 남는다 */
export function Narrow() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 5.5)' }}>
      <Banner
        tone="warning"
        title="Employees 담당자가 없습니다"
        action={
          <Button size="sm" icon="user-plus">
            담당자 지정
          </Button>
        }
        onClose={() => {}}
      >
        지정하기 전까지 입사 · 퇴사 할 일은 모두 대표에게 갑니다.
      </Banner>
    </div>
  );
}
