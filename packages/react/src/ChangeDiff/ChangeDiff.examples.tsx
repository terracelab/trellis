import { diffFields, formatAmount } from '@terracelab/trellis-contracts';
import { ChangeDiff } from './ChangeDiff.js';

const BEFORE = { price: 1200, qty: 240, due: '2026-11-14', warehouse: '평택 1창고', memo: '' };
const AFTER = {
  price: 1350,
  qty: 240,
  due: '2026-11-18',
  warehouse: '평택 2창고',
  memo: '분할 입고',
};

/** 저장 전 확인 — 대상 · 항목 · 변경 내용 표. 이전 값은 취소선 */
export function Confirm() {
  const rows = diffFields(
    BEFORE,
    AFTER,
    [
      { key: 'price', label: '단가', format: (v) => formatAmount(v, { unit: '원' }) },
      { key: 'qty', label: '수량' },
      { key: 'due', label: '납기' },
      { key: 'warehouse', label: '입고 창고' },
      { key: 'memo', label: '메모' },
    ],
    { target: 'PO-2611-0042' },
  );
  return <ChangeDiff rows={rows} caption="발주서 변경 내용" />;
}

/** 변경 이력 — 한 줄씩 고정폭 글자로, 처음에는 두 줄만 */
export function History() {
  return (
    <ChangeDiff
      layout="list"
      maxRows={2}
      caption="11월 7일 변경 이력"
      rows={[
        { target: '한서연', field: '소속', before: '인사팀', after: '경영지원팀' },
        { target: '한서연', field: '직책', before: null, after: '파트장' },
        { target: '정민호', field: '근무 형태', before: '고정', after: '시차출퇴근' },
        { target: '오하늘', field: '휴대전화', before: '010-●●●●-1203', after: '010-●●●●-7781' },
      ]}
    />
  );
}

/** 빈 상태와 접기 — 줄이 없으면 빈 문구 한 줄, maxRows를 넘으면 단추로 펼친다 */
export function States() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-24)' }}>
      <ChangeDiff rows={[]} />
      <ChangeDiff
        maxRows={1}
        rows={[
          { field: '결재선', before: '김과장 → 이부장', after: '김과장 → 박이사' },
          { field: '참조', before: '재무팀', after: null },
        ]}
      />
    </div>
  );
}
