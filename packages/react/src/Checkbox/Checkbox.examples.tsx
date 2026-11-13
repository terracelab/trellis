import { Checkbox } from './Checkbox.js';

/** 전체 선택 — 일부만 고르면 머리 칸이 일부 선택으로 보인다 */
export function SelectAll() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-8)' }}>
      <Checkbox indeterminate>세금계산서 전체</Checkbox>
      <Checkbox defaultChecked>(주)한빛무역 · TI-2611-0012</Checkbox>
      <Checkbox>대양상사 · TI-2611-0013</Checkbox>
      <Checkbox>누리식품 · TI-2611-0014</Checkbox>
    </div>
  );
}

/** 설명 · 오류 · 비활성 — 설명은 라벨 아래 한 줄 */
export function States() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-12)' }}>
      <Checkbox defaultChecked description="발행 즉시 거래처 담당자 메일로 보냅니다">
        세금계산서 메일 발송
      </Checkbox>
      <Checkbox invalid>개인정보 수집 · 이용 동의</Checkbox>
      <Checkbox disabled defaultChecked>
        마감된 전표
      </Checkbox>
    </div>
  );
}
