import { Progress } from './Progress.js';

/** 진행 — 단위가 없으면 퍼센트, 있으면 값과 최댓값 */
export function Default() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 5)',
      }}
    >
      <Progress label="거래처 엑셀 업로드" value={62} />
      <Progress label="11월 마감 체크리스트" value={18} max={24} unit="건" tone="success" />
      <Progress label="재고 실사 입력" value={340} max={1200} unit="품목" size="sm" />
    </div>
  );
}

/** 끝을 모르는 진행 — 처리 건수를 아직 모를 때 */
export function Indeterminate() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 5)' }}>
      <Progress label="국세청 전송 결과 확인" value={null} />
    </div>
  );
}
