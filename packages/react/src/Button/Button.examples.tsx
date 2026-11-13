import { Button } from './Button.js';

/** 역할 — 화면의 주 동작은 primary 하나, 되돌릴 수 없는 동작은 danger */
export function Variants() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-8)', flexWrap: 'wrap' }}>
      <Button variant="primary" icon="send">
        발행
      </Button>
      <Button icon="save">임시 저장</Button>
      <Button variant="ghost" icon="printer">
        인쇄
      </Button>
      <Button variant="danger" icon="trash-2">
        삭제
      </Button>
    </div>
  );
}

/** 상태 — 진행 중 · 비활성 · 크기 */
export function States() {
  return (
    <div
      style={{ display: 'flex', gap: 'var(--tl-space-8)', alignItems: 'center', flexWrap: 'wrap' }}
    >
      <Button variant="primary" loading>
        발행
      </Button>
      <Button disabled>엑셀 다운로드</Button>
      <Button size="sm">작게</Button>
      <Button size="lg" iconEnd="chevron-down">
        더 보기
      </Button>
    </div>
  );
}

/** 비활성 이유 — 권한이 없거나 마감이 지난 동작. 포커스가 닿고 이유를 툴팁으로 알린다 */
export function DisabledReason() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-8)', flexWrap: 'wrap' }}>
      <Button variant="primary" disabled disabledReason="결재 권한이 없습니다">
        승인
      </Button>
      <Button disabled disabledReason="11월 마감이 끝나 수정할 수 없습니다" icon="pencil">
        전표 수정
      </Button>
    </div>
  );
}
