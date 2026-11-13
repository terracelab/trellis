import { ErrorSummary } from './ErrorSummary.js';

/** 제출 뒤 오류 요약 — 항목을 누르면 그 칸으로 간다. useTrellisForm의 form.summary를 그대로 넘긴다 */
export function Default() {
  return (
    <ErrorSummary
      errors={[
        { id: 'po-party', label: '거래처', message: '거래처를 고르세요' },
        { id: 'po-due', label: '납기', message: '오늘 이후 날짜를 입력하세요' },
        { id: 'po-lines-0-qty', label: '1행 수량', message: '1 이상 입력하세요' },
      ]}
    />
  );
}
