import { Button } from '../Button/Button.js';
import { ReasonDialog } from './ReasonDialog.js';

/** 결재 반려 — 사유가 다섯 글자가 될 때까지 반려 단추가 꺼져 있다. 바깥을 눌러도 닫히지 않는다 */
export function Reject() {
  return (
    <ReasonDialog
      trigger={
        <Button variant="danger" icon="x">
          반려
        </Button>
      }
      tone="danger"
      title="지출결의서 EX-2611-0018을 반려합니다"
      description="반려하면 기안자에게 돌아가고 결재선이 처음부터 다시 시작됩니다."
      label="반려 사유"
      placeholder="영수증 2건이 빠졌습니다"
      minLength={5}
      maxLength={200}
      confirmLabel="반려"
      note="반려 사유는 기안자와 결재선 전원에게 보입니다."
      onConfirm={() => {}}
    />
  );
}

/** 결재 회수 — 확인하면 요청이 끝날 때까지 진행 중이고, 끝나면 닫힌다 */
export function Withdraw() {
  return (
    <ReasonDialog
      trigger={<Button icon="undo-2">회수</Button>}
      title="결재 요청을 회수합니다"
      description="회수하면 문서가 기안 상태로 돌아갑니다. 다음 결재자의 결재함에서 빠집니다."
      label="회수 사유"
      confirmLabel="회수"
      onConfirm={() => new Promise((resolve) => setTimeout(resolve, 800))}
    />
  );
}

/** 상태 — 확인 꺼짐 · 진행 중 · 오류 문구를 각각 단추로 연다 */
export function States() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--tl-space-8)' }}>
      <ReasonDialog
        trigger={<Button>확인 꺼짐</Button>}
        title="거래처를 삭제합니다"
        minLength={10}
        tone="danger"
        confirmLabel="삭제"
      />
      <ReasonDialog
        trigger={<Button>진행 중</Button>}
        title="결재 요청을 회수합니다"
        confirmLabel="회수"
        loading
      />
      <ReasonDialog
        trigger={<Button>오류</Button>}
        title="결재 요청을 회수합니다"
        confirmLabel="회수"
        error="다음 결재자가 이미 승인해 회수할 수 없습니다"
      />
    </div>
  );
}
