import { Button } from '../Button/Button.js';
import { Dialog, DialogClose } from './Dialog.js';

/** 발행 확인 — 버튼은 결과를 말한다 */
export function Confirm() {
  return (
    <Dialog
      trigger={
        <Button variant="primary" icon="send">
          발행
        </Button>
      }
      title="세금계산서 3건을 발행합니다"
      description="발행하면 국세청 전송 대기열에 올라갑니다. 전송 전까지는 발행 취소할 수 있습니다."
      footer={
        <>
          <DialogClose render={<Button>취소</Button>} />
          <DialogClose render={<Button variant="primary">3건 발행</Button>} />
        </>
      }
    />
  );
}

/** 위험 — 바깥을 눌러도 닫히지 않는다 */
export function Danger() {
  return (
    <Dialog
      tone="danger"
      size="sm"
      trigger={
        <Button variant="danger" icon="trash-2">
          삭제
        </Button>
      }
      title="발주서 PO-2611-0042를 삭제합니다"
      description="삭제하면 되돌릴 수 없습니다. 입고 예정 2건도 함께 지워집니다."
      footer={
        <>
          <DialogClose render={<Button>취소</Button>} />
          <DialogClose render={<Button variant="danger">삭제</Button>} />
        </>
      }
    />
  );
}
