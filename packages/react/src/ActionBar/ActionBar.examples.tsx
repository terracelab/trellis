import { formatAmount } from '@terracelab/trellis-contracts';
import { Button } from '../Button/Button.js';
import { ActionBar } from './ActionBar.js';

/** 폼 아래 — 저장이 맨 오른쪽, 취소는 그 왼쪽 */
export function FormFooter() {
  return (
    <ActionBar>
      <Button variant="ghost">취소</Button>
      <Button icon="save">임시 저장</Button>
      <Button variant="primary">저장</Button>
    </ActionBar>
  );
}

/** 선택 요약 · 아래 고정 — 왼쪽에 선택 건수와 합계, 스크롤해도 아래에 붙는다 */
export function StickyWithSummary() {
  return (
    <ActionBar
      sticky
      summary={
        <>
          <span>3건 선택</span>
          <span className="tl-amount">합계 {formatAmount(12_480_000, { unit: '원' })}</span>
        </>
      }
    >
      <Button variant="ghost">선택 해제</Button>
      <Button variant="primary" icon="send">
        결재 요청
      </Button>
    </ActionBar>
  );
}
