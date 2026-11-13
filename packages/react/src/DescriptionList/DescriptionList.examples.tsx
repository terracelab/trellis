import { formatAmount, formatBizNo } from '@terracelab/trellis-contracts';
import { DescriptionList } from './DescriptionList.js';

const VENDOR = [
  { label: '거래처', value: '(주)한빛식자재' },
  { label: '사업자등록번호', value: formatBizNo('1248165307'), copyable: true },
  { label: '대표자', value: '한빛나' },
  { label: '담당자', value: '오수입 과장 · 031-778-2040' },
  { label: '결제 조건', value: '월말 마감 · 익월 25일 현금' },
  { label: '미수금', value: formatAmount(18420000, { unit: '원' }) },
  { label: '입금 계좌', value: '기업은행 482-019284-01-013', copyable: true, span: 2 as const },
  { label: '주소', value: '경기도 이천시 마장면 서이천로 512 물류센터 B동', span: 2 as const },
];

/** 거래처 상세 — 라벨 왼쪽 2열, 번호는 복사 버튼 */
export function Vendor() {
  return <DescriptionList items={VENDOR} />;
}

/** 서랍 안 — 좁은 폭은 1열 · 라벨 위 */
export function Vertical() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 5)' }}>
      <DescriptionList
        columns={1}
        layout="vertical"
        items={[
          { label: '수입 신고번호', value: '41270-26-110482M', copyable: true },
          { label: '선적항', value: '부산항 · 2026-11-03 입항' },
          { label: '통관 상태', value: '통관 완료' },
        ]}
      />
    </div>
  );
}
