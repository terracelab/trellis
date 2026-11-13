import { Attachment } from './Attachment.js';

const PURCHASE_FILES = [
  { name: '견적서_한빛상사_2611.pdf', size: 186_368, href: '/files/quote-2611.pdf' },
  { name: '단가비교표_11월.xlsx', size: 2_516_582, href: '/files/compare-11.xlsx' },
  { name: '샘플_포장사진.jpg', size: 845_312, href: '/files/sample.jpg' },
  { name: '수입신고필증_2026-1104.zip', size: 12_058_624, href: '/files/customs.zip' },
] as const;

const DRAFT_FILES = [
  { name: '거래명세서_대성푸드.pdf', size: 92_160 },
  { name: '입고 검수 사진.png', size: 1_363_148 },
] as const;

/** 결재 문서 아래 — 종류 아이콘 · 이름 · 크기 · 다운로드 */
export function DocumentFiles() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 7)' }}>
      <Attachment files={PURCHASE_FILES} />
    </div>
  );
}

/** 작성 중 칩 — 입력창 아래에 칩으로, 삭제 버튼이 파일 이름을 넘긴다 */
export function DraftChips() {
  return <Attachment files={DRAFT_FILES} layout="chips" onRemove={() => {}} />;
}
