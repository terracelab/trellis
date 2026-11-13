// 사유 확인 · 가린 값(PR-30): ReasonDialog · MaskedValue · HrRecord 칸별 보기
import type { HrMasterRecord } from '@terracelab/trellis-contracts';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button, HrRecord, MaskedValue, ReasonDialog, reasonLength } from '../src/core/index.js';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/** 열림을 들고 있는 바깥 화면(제어 모드) */
function Controlled(props: {
  onConfirm?: (reason: string) => void | Promise<unknown>;
  onOpenChange?: (open: boolean) => void;
  minLength?: number;
  error?: string;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button onPress={() => setOpen(true)}>다시 열기</Button>
      <ReasonDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          props.onOpenChange?.(next);
        }}
        title="지출결의서를 반려합니다"
        label="반려 사유"
        confirmLabel="반려"
        note="사유는 기안자에게 보입니다"
        {...(props.minLength !== undefined ? { minLength: props.minLength } : {})}
        {...(props.onConfirm ? { onConfirm: props.onConfirm } : {})}
        {...(props.error ? { error: props.error } : {})}
        {...(props.loading ? { loading: true } : {})}
      />
    </>
  );
}

const reasonBox = () => screen.getByRole('textbox', { name: /반려 사유/ });
const confirmButton = () => screen.getByRole('button', { name: /^(처리 중 ?)?반려$/ });

describe('ReasonDialog', () => {
  it('reasonLength: 앞뒤 공백을 빼고 센다', () => {
    expect(reasonLength('  영수증 누락  ')).toBe(6);
    expect(reasonLength('   ')).toBe(0);
  });

  it('사유가 minLength보다 짧으면 확인이 꺼지고 안내가 보인다. 확인하면 다듬은 사유로 부르고 닫힌다', async () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(<Controlled minLength={5} onConfirm={onConfirm} onOpenChange={onOpenChange} />);
    await act(async () => {});
    const dialog = screen.getByRole('dialog', { name: '지출결의서를 반려합니다' });
    expect(dialog).toHaveTextContent('5자 이상 입력하세요');
    expect(dialog).toHaveTextContent('사유는 기안자에게 보입니다');
    expect(confirmButton()).toBeDisabled();
    fireEvent.change(reasonBox(), { target: { value: '  누락  ' } });
    expect(confirmButton()).toBeDisabled();
    fireEvent.change(reasonBox(), { target: { value: '  영수증 누락  ' } });
    expect(confirmButton()).toBeEnabled();
    await act(async () => {
      fireEvent.click(confirmButton());
    });
    expect(onConfirm).toHaveBeenCalledWith('영수증 누락');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('Esc는 사유가 비었을 때만 닫는다. 글자가 있으면 그대로 연다', async () => {
    const onOpenChange = vi.fn();
    render(<Controlled onOpenChange={onOpenChange} />);
    await act(async () => {});
    fireEvent.change(reasonBox(), { target: { value: '첨부 누락' } });
    fireEvent.keyDown(reasonBox(), { key: 'Escape' });
    await act(async () => {});
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    fireEvent.change(reasonBox(), { target: { value: '   ' } });
    fireEvent.keyDown(reasonBox(), { key: 'Escape' });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('바깥을 눌러도 닫히지 않는다, 오른쪽 위 닫기 단추가 없다', async () => {
    const onOpenChange = vi.fn();
    render(<Controlled onOpenChange={onOpenChange} />);
    await act(async () => {});
    const backdrop = document.querySelector('.tl-dialog__backdrop') ?? document.body;
    fireEvent.pointerDown(backdrop);
    fireEvent.mouseDown(backdrop);
    fireEvent.click(backdrop);
    await act(async () => {});
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(screen.queryByRole('button', { name: '닫기' })).toBeNull();
  });

  it('취소는 닫고 사유를 비운다', async () => {
    render(<Controlled />);
    await act(async () => {});
    fireEvent.change(reasonBox(), { target: { value: '첨부 누락' } });
    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    fireEvent.click(screen.getByRole('button', { name: '다시 열기' }));
    await act(async () => {});
    expect(reasonBox()).toHaveValue('');
  });

  it('Ctrl+Enter로 확인한다', async () => {
    const onConfirm = vi.fn();
    render(<Controlled onConfirm={onConfirm} />);
    await act(async () => {});
    fireEvent.change(reasonBox(), { target: { value: '중복 기안' } });
    await act(async () => {
      fireEvent.keyDown(reasonBox(), { key: 'Enter', ctrlKey: true });
    });
    expect(onConfirm).toHaveBeenCalledWith('중복 기안');
  });

  it('Promise가 실패하면 열린 채 오류 문구, 진행 중에는 취소가 꺼진다', async () => {
    let reject!: (e: Error) => void;
    const onConfirm = vi.fn(
      () =>
        new Promise((_, r) => {
          reject = r;
        }),
    );
    render(<Controlled onConfirm={onConfirm} />);
    await act(async () => {});
    fireEvent.change(reasonBox(), { target: { value: '중복 기안' } });
    await act(async () => {
      fireEvent.click(confirmButton());
    });
    expect(confirmButton()).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
    await act(async () => {
      reject(new Error('409'));
    });
    expect(screen.getByRole('dialog')).toHaveTextContent('처리하지 못했습니다. 다시 시도하세요');
    expect(reasonBox()).toHaveAttribute('aria-invalid', 'true');
    expect(reasonBox()).toHaveValue('중복 기안');
  });

  it('error · loading prop', async () => {
    render(<Controlled error="이미 승인된 문서입니다" loading />);
    await act(async () => {});
    expect(screen.getByRole('dialog')).toHaveTextContent('이미 승인된 문서입니다');
    expect(reasonBox()).toHaveAttribute('readonly');
  });

  it('trigger로 연다(비제어)', async () => {
    render(
      <ReasonDialog
        trigger={<Button>회수</Button>}
        title="결재 요청을 회수합니다"
        confirmLabel="회수 확정"
      />,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '회수' }));
    await act(async () => {});
    expect(screen.getByRole('dialog', { name: '결재 요청을 회수합니다' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /사유/ })).toBeInTheDocument();
  });
});

describe('MaskedValue', () => {
  const RRN = '920415-2●●●●●●';

  async function revealWith(reason: string) {
    fireEvent.click(screen.getByRole('button', { name: '주민등록번호 보기' }));
    await act(async () => {});
    const dialog = screen.getByRole('dialog', { name: '주민등록번호 보기' });
    expect(dialog).toHaveTextContent('사유를 남기면 60초 동안 원문을 봅니다');
    fireEvent.change(screen.getByRole('textbox', { name: /사유/ }), {
      target: { value: reason },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '원문 보기' }));
    });
  }

  it('사유를 받아 원문을 보이고, 남은 시간이 지나면 다시 가린다', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    const onReveal = vi.fn(async () => '920415-2345678');
    render(<MaskedValue label="주민등록번호" value={RRN} onReveal={onReveal} testID="m" />);
    const root = screen.getByTestId('m');
    expect(root).toHaveTextContent(RRN);
    await revealWith('연말정산 확인');
    expect(onReveal).toHaveBeenCalledWith('연말정산 확인');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(root).toHaveAttribute('data-revealed', 'true');
    expect(root).toHaveTextContent('920415-2345678');
    expect(root).toHaveTextContent('60초 뒤 가림');
    expect(root.querySelector('[aria-live="polite"]')).toHaveTextContent(
      '원문을 보입니다. 60초 뒤 다시 가립니다',
    );
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(root).toHaveTextContent('59초 뒤 가림');
    act(() => {
      vi.advanceTimersByTime(59000);
    });
    expect(root).not.toHaveAttribute('data-revealed');
    expect(root).toHaveTextContent(RRN);
    expect(root).not.toHaveTextContent('920415-2345678');
    expect(root.querySelector('[aria-live="polite"]')).toHaveTextContent('다시 가렸습니다');
  });

  it('보기 · 다시 가리기는 같은 단추, 복사는 원문이 보일 때만', async () => {
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(
      <MaskedValue
        label="주민등록번호"
        value={RRN}
        onReveal={async () => '920415-2345678'}
        copyable
        testID="m"
      />,
    );
    const toggle = screen.getByRole('button', { name: '주민등록번호 보기' });
    expect(screen.queryByRole('button', { name: '주민등록번호 복사' })).toBeNull();
    await revealWith('급여 이체 확인');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('button', { name: '주민등록번호 다시 가리기' })).toBe(toggle);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '주민등록번호 복사' }));
    });
    expect(writeText).toHaveBeenCalledWith('920415-2345678');
    expect(screen.getByTestId('m').querySelector('[aria-live="polite"]')).toHaveTextContent(
      '복사했습니다',
    );
    fireEvent.click(toggle);
    expect(screen.getByTestId('m')).toHaveTextContent(RRN);
    expect(screen.queryByRole('button', { name: '주민등록번호 복사' })).toBeNull();
  });

  it('onReveal이 실패하면 대화 상자에 오류가 남고 가린 채다', async () => {
    render(
      <MaskedValue
        label="주민등록번호"
        value={RRN}
        onReveal={() => Promise.reject(new Error('403'))}
        testID="m"
      />,
    );
    await revealWith('확인');
    expect(screen.getByRole('dialog')).toHaveTextContent('원문을 불러오지 못했습니다');
    expect(screen.getByTestId('m')).not.toHaveAttribute('data-revealed');
  });

  it('canReveal false면 자물쇠 + 이유, onReveal이 없으면 가린 글자만', () => {
    render(
      <>
        <MaskedValue
          label="계좌번호"
          value="국민은행 ●●●-●●-●●●3-847"
          canReveal={false}
          onReveal={async () => ''}
          testID="locked"
        />
        <MaskedValue label="계좌번호" value="국민은행 ●●●-●●-●●●3-847" testID="plain" />
      </>,
    );
    expect(screen.getByTestId('locked')).toHaveAttribute('data-state', 'disabled');
    expect(screen.getByTestId('locked')).toHaveTextContent('볼 권한이 없습니다');
    expect(screen.getByTestId('plain')).toHaveTextContent('국민은행 ●●●-●●-●●●3-847');
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('HrRecord 칸별 보기(MaskedValue)', () => {
  const RECORD: HrMasterRecord = {
    personal: { name: '한서연', rrn: '9204152345678' },
    employment: { employeeNo: 'E-0012', hireDate: '2022-03-02' },
    pay: { bankAccount: { bank: '국민은행', number: '482-21-0193-847', holder: '한서연' } },
  };

  it('onRevealField가 없으면 가린 글자만(공개 API 그대로)', () => {
    render(<HrRecord record={RECORD} today="2026-11-06" nav={false} />);
    expect(screen.getByText('920415-2●●●●●●')).toBeInTheDocument();
    expect(screen.getByText('국민은행 ●●●-●●-●●●3-847 · 예금주 한서연')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '주민등록번호 보기' })).toBeNull();
  });

  it('onRevealField: 사유와 칸 이름으로 부르고, 돌려준 원문이 없으면 record의 값을 보인다', async () => {
    const onRevealField = vi.fn(async (field: string) =>
      field === 'bankAccount' ? '111-22-333' : undefined,
    );
    render(
      <HrRecord record={RECORD} today="2026-11-06" nav={false} onRevealField={onRevealField} />,
    );
    await revealIn('주민등록번호', '연말정산 확인');
    expect(onRevealField).toHaveBeenCalledWith('rrn', '연말정산 확인');
    await waitFor(() => expect(screen.getByText('920415-2345678')).toBeInTheDocument());
    await revealIn('급여 계좌', '급여 이체 확인');
    expect(onRevealField).toHaveBeenLastCalledWith('bankAccount', '급여 이체 확인');
    await waitFor(() =>
      expect(screen.getByText('국민은행 111-22-333 · 예금주 한서연')).toBeInTheDocument(),
    );
  });

  async function revealIn(label: string, reason: string) {
    fireEvent.click(screen.getByRole('button', { name: `${label} 보기` }));
    await act(async () => {});
    fireEvent.change(screen.getByRole('textbox', { name: /사유/ }), { target: { value: reason } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '원문 보기' }));
    });
  }
});
