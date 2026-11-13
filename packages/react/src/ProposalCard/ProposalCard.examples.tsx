import { Citation } from '../Citation/Citation.js';
import { ProposalCard } from './ProposalCard.js';

const BOX = { maxWidth: 'calc(var(--tl-space-64) * 10)' };

const PRICE = [
  { target: '냉동 가리비 관자 1KG', field: '단가', before: '17,000', after: '16,800' },
  { target: '냉동 새우 1KG', field: '단가', before: '12,400', after: '12,900' },
  { target: '냉동 새우 1KG', field: '적용 시작일', before: null, after: '2026-12-01' },
];

/** 확인 대기 — 에이전트가 바꾸려는 필드를 변경 표로 보이고, 사람이 승인하거나 사유를 적어 반려한다 */
export function Waiting() {
  return (
    <div style={BOX}>
      <ProposalCard
        title="한빛식품 단가 변경"
        summary="11월 견적서 기준으로 2품목 단가를 바꿉니다. 12월 발주부터 적용됩니다."
        changes={PRICE}
        onApprove={() => {}}
        onReject={() => {}}
      />
    </div>
  );
}

/** 승인 — 처리하면 단추 대신 결과와 처리한 사람 · 시각이 남는다 */
export function Approved() {
  return (
    <div style={BOX}>
      <ProposalCard
        title="한빛식품 단가 변경"
        changes={PRICE}
        defaultStatus="approved"
        resolvedBy="김테라 팀장 · 2026-11-06 14:20"
      />
    </div>
  );
}

/** 반려 — 사유 창에서 받은 반려 사유가 결과 아래에 보인다 */
export function Rejected() {
  return (
    <div style={BOX}>
      <ProposalCard
        title="대성물류 지급 예정일 변경"
        changes={[{ field: '지급 예정일', before: '2026-11-20', after: '2026-11-13' }]}
        defaultStatus="rejected"
        reason="계약서 지급 조건이 월말 지급입니다. 앞당기지 않습니다."
        resolvedBy="박회계 대리 · 2026-11-06 15:02"
      />
    </div>
  );
}

/** 근거와 함께 — 변경 표 아래 자리에 출처를 둔다. 승인 단추 글자는 결과를 말하는 말로 바꿀 수 있다 */
export function WithSources() {
  return (
    <div style={BOX}>
      <ProposalCard
        title="동해수산 거래처 계좌 변경"
        summary="거래처가 보낸 계좌 변경 요청 공문과 통장 사본의 계좌가 같습니다."
        changes={[
          { field: '은행', before: '가람은행', after: '테라은행' },
          { field: '계좌번호', before: '123-45-●●●●●', after: '987-65-●●●●●' },
        ]}
        approveLabel="변경 적용"
        reasonMinLength={5}
        onApprove={() => new Promise((resolve) => setTimeout(resolve, 800))}
        onReject={() => {}}
      >
        <Citation
          label="근거 문서"
          sources={[
            { title: '계좌 변경 요청 공문', location: '1쪽' },
            { title: '통장 사본.pdf', location: '1쪽' },
          ]}
          onOpen={() => {}}
        />
      </ProposalCard>
    </div>
  );
}
