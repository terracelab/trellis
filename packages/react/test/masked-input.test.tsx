// MaskedInput rrn 가림(secret) · 편집 · 보기 버튼 · bizNo 검증(PR-17)
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { applyEdit, caretAfterSlots, hideDigits } from '../src/MaskedInput/edit.js';
import { Button, Field, MaskedInput } from '../src/core/index.js';

afterEach(() => {
  vi.useRealTimers();
});

/** 커서 자리에 글자를 친 것처럼(브라우저는 넣은 글자 끝에 커서를 둔다) */
function typeAt(input: HTMLInputElement, at: number, text: string) {
  const v = input.value;
  fireEvent.change(input, {
    target: {
      value: v.slice(0, at) + text + v.slice(at),
      selectionStart: at + text.length,
      selectionEnd: at + text.length,
    },
  });
}

/** 커서 앞 글자 하나를 지운 것처럼(Backspace) */
function backspaceAt(input: HTMLInputElement, at: number) {
  const v = input.value;
  fireEvent.change(input, {
    target: {
      value: v.slice(0, at - 1) + v.slice(at),
      selectionStart: at - 1,
      selectionEnd: at - 1,
    },
  });
}

describe('편집 계산(edit.ts)', () => {
  it('가린 칸이 이어져 있어도 커서 자리의 칸을 지운다', () => {
    // 900101-1●●●●●● 에서 셋째 ●(숫자 '4') 뒤 Backspace
    const r = applyEdit({
      before: '900101-1●●●●●●',
      raw: '9001011234567',
      after: '900101-1●●●●●',
      caret: 10,
    });
    expect(r.raw).toBe('900101123567');
    expect(r.caretSlots).toBe(9);
  });

  it('구분 글자만 지우면 Backspace는 앞 숫자, Delete는 뒤 숫자', () => {
    const back = applyEdit({ before: '123-45', raw: '12345', after: '12345', caret: 3 });
    expect(back.raw).toBe('1245');
    const forward = applyEdit({
      before: '123-45',
      raw: '12345',
      after: '12345',
      caret: 3,
      inputType: 'deleteContentForward',
    });
    expect(forward.raw).toBe('1235');
  });

  it('고른 구간에 붙여 넣기 · 숫자가 아닌 글자는 버린다', () => {
    const r = applyEdit({
      before: '900101-1●●●●●●',
      raw: '9001011234567',
      after: '900101-1 765 432',
      caret: 16,
    });
    expect(r.raw).toBe('9001011765432');
    expect(r.inserted).toBe(6);
  });

  it('가림 · 커서 자리', () => {
    expect(hideDigits('900101-1234567', 7)).toBe('900101-1●●●●●●');
    expect(hideDigits('900101-1234567', 7, 9)).toBe('900101-1●●4●●●');
    expect(caretAfterSlots('900101-1●●', 7)).toBe(8);
    expect(caretAfterSlots('900101-1●●', 6)).toBe(6);
  });
});

describe('MaskedInput rrn · secret', () => {
  it('뒷자리 여섯 자리를 가리고 onChange는 숫자 전부를 받는다', () => {
    const onChange = vi.fn();
    render(
      <Field label="주민등록번호">
        <MaskedInput mask="rrn" secret name="rrn" onChange={onChange} />
      </Field>,
    );
    const input = screen.getByRole<HTMLInputElement>('textbox', { name: '주민등록번호' });
    expect(input).toHaveAttribute('autocomplete', 'off');
    expect(input).toHaveAttribute('inputmode', 'numeric');
    expect(input).toHaveAttribute('placeholder', '900101-1●●●●●●');
    fireEvent.change(input, { target: { value: '9001011234567' } });
    expect(input).toHaveValue('900101-1●●●●●●');
    expect(onChange).toHaveBeenLastCalledWith('9001011234567', '900101-1●●●●●●');
    // 화면 글자에는 가린 숫자가 없고, 폼에는 숫자 전부가 간다
    expect(input.value).not.toContain('234567');
    expect(document.querySelector<HTMLInputElement>('input[name="rrn"]')?.value).toBe(
      '9001011234567',
    );
    expect(input.closest('.tl-masked-input')).toHaveAttribute('data-complete');
  });

  it('친 숫자는 1초쯤 보였다가 가려진다', () => {
    vi.useFakeTimers();
    render(<MaskedInput mask="rrn" secret label="주민등록번호" defaultValue="9001011" />);
    const input = screen.getByRole<HTMLInputElement>('textbox', { name: '주민등록번호' });
    input.focus();
    typeAt(input, 8, '2');
    expect(input).toHaveValue('900101-12');
    typeAt(input, 9, '3');
    // 앞에 친 숫자는 바로 가리고 방금 친 숫자만 보인다
    expect(input).toHaveValue('900101-1●3');
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(input).toHaveValue('900101-1●●');
    // 커서는 친 자리 그대로
    expect(input.selectionStart).toBe(10);
  });

  it('가린 칸 가운데서 지우기 · 넣기, 커서가 그 자리에 남는다', () => {
    const onChange = vi.fn();
    render(
      <MaskedInput
        mask="rrn"
        secret
        label="주민등록번호"
        defaultValue="9001011234567"
        onChange={onChange}
      />,
    );
    const input = screen.getByRole<HTMLInputElement>('textbox', { name: '주민등록번호' });
    input.focus();
    // 셋째 ●(숫자 4) 뒤에서 Backspace
    backspaceAt(input, 11);
    expect(onChange).toHaveBeenLastCalledWith('900101123567', '900101-1●●●●●');
    expect(input).toHaveValue('900101-1●●●●●');
    expect(input.selectionStart).toBe(10);
    // 같은 자리에 9를 넣으면 그 칸에 들어간다
    typeAt(input, 10, '9');
    expect(onChange).toHaveBeenLastCalledWith('9001011239567', '900101-1●●●●●●');
    expect(input.selectionStart).toBe(11);
  });

  it('붙여 넣기 · 전체 선택 뒤 치기', () => {
    const onChange = vi.fn();
    render(
      <MaskedInput
        mask="rrn"
        secret
        label="주민등록번호"
        defaultValue="9001011234567"
        onChange={onChange}
      />,
    );
    const input = screen.getByRole<HTMLInputElement>('textbox', { name: '주민등록번호' });
    input.focus();
    // 가린 여섯 자리를 고르고 붙여 넣기(붙여 넣은 숫자는 보이지 않는다)
    fireEvent.change(input, {
      target: { value: '900101-1765432', selectionStart: 14, selectionEnd: 14 },
    });
    expect(onChange).toHaveBeenLastCalledWith('9001011765432', '900101-1●●●●●●');
    expect(input).toHaveValue('900101-1●●●●●●');
    // 전체를 고르고 숫자 하나
    fireEvent.change(input, { target: { value: '8', selectionStart: 1, selectionEnd: 1 } });
    expect(onChange).toHaveBeenLastCalledWith('8', '8');
    expect(input).toHaveValue('8');
  });

  it('보기 버튼으로 펼치고, 칸 밖으로 나가면 다시 가린다', () => {
    render(
      <>
        <Field label="주민등록번호">
          <MaskedInput mask="rrn" secret defaultValue="9001011234567" />
        </Field>
        <Button>다음</Button>
      </>,
    );
    const input = screen.getByRole('textbox', { name: '주민등록번호' });
    const reveal = screen.getByRole('button', { name: '주민등록번호 보기' });
    expect(reveal).toHaveAttribute('aria-pressed', 'false');
    expect(reveal).toHaveAttribute('aria-controls', input.id);
    fireEvent.click(reveal);
    expect(reveal).toHaveAttribute('aria-pressed', 'true');
    expect(input).toHaveValue('900101-1234567');
    // 칸 안(버튼 → 칸) 이동은 펼친 채로
    fireEvent.blur(reveal, { relatedTarget: input });
    expect(input).toHaveValue('900101-1234567');
    fireEvent.blur(input, { relatedTarget: screen.getByRole('button', { name: '다음' }) });
    expect(input).toHaveValue('900101-1●●●●●●');
    expect(reveal).toHaveAttribute('aria-pressed', 'false');
  });

  it('Enter · Space로 보기 버튼을 누른다(버튼 요소)', () => {
    render(<MaskedInput mask="rrn" secret label="주민등록번호" defaultValue="9001011234567" />);
    const reveal = screen.getByRole('button', { name: '주민등록번호 보기' });
    expect(reveal.tagName).toBe('BUTTON');
    expect(reveal).toHaveAttribute('type', 'button');
    reveal.focus();
    fireEvent.click(reveal);
    expect(screen.getByRole('textbox')).toHaveValue('900101-1234567');
  });

  it('rrn이 아니면 secret을 무시한다', () => {
    render(<MaskedInput mask="phone" secret label="전화" defaultValue="01012345678" />);
    expect(screen.getByRole('textbox', { name: '전화' })).toHaveValue('010-1234-5678');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('secret 없이 rrn은 그대로 보인다', () => {
    render(<MaskedInput mask="rrn" label="외국인등록번호" defaultValue="9001015234567" />);
    expect(screen.getByRole('textbox', { name: '외국인등록번호' })).toHaveValue('900101-5234567');
  });

  it('비활성이면 보기 버튼도 비활성', () => {
    render(<MaskedInput mask="rrn" secret label="주민등록번호" disabled />);
    expect(screen.getByRole('button', { name: '주민등록번호 보기' })).toBeDisabled();
  });
});

describe('MaskedInput 편집(모든 마스크 공통)', () => {
  it('구분 글자 앞에서 Backspace는 그 앞 숫자를 지운다', () => {
    const onChange = vi.fn();
    render(
      <MaskedInput mask="bizNo" label="사업자등록번호" defaultValue="12345" onChange={onChange} />,
    );
    const input = screen.getByRole<HTMLInputElement>('textbox', { name: '사업자등록번호' });
    input.focus();
    expect(input).toHaveValue('123-45');
    backspaceAt(input, 4);
    expect(onChange).toHaveBeenLastCalledWith('1245', '124-5');
    expect(input.selectionStart).toBe(2);
  });

  it('Delete로 구분 글자를 지우면 그 뒤 숫자를 지운다', () => {
    const onChange = vi.fn();
    render(
      <MaskedInput mask="bizNo" label="사업자등록번호" defaultValue="12345" onChange={onChange} />,
    );
    const input = screen.getByRole<HTMLInputElement>('textbox', { name: '사업자등록번호' });
    input.focus();
    fireEvent.input(input, {
      target: { value: '12345', selectionStart: 3, selectionEnd: 3 },
      inputType: 'deleteContentForward',
    });
    expect(onChange).toHaveBeenLastCalledWith('1235', '123-5');
  });
});

describe('MaskedInput bizNo validate', () => {
  it('다 친 번호가 검증에 실패하면 Field 오류 칸에 문구', () => {
    render(
      <Field label="사업자등록번호">
        <MaskedInput mask="bizNo" validate />
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: '사업자등록번호' });
    fireEvent.change(input, { target: { value: '123456789' } });
    // 덜 쳤을 때는 검사하지 않는다
    expect(input).not.toHaveAttribute('aria-invalid');
    fireEvent.change(input, { target: { value: '1234567890' } });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(
      '사업자등록번호가 맞지 않습니다. 사업자등록증의 번호를 확인하세요',
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(input.closest('.tl-field')).toHaveAttribute('data-state', 'error');
    fireEvent.change(input, { target: { value: '1234567891' } });
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('Field error가 있으면 그것이 보인다', () => {
    render(
      <Field label="사업자등록번호" error="이미 등록된 거래처입니다">
        <MaskedInput mask="bizNo" validate defaultValue="1234567890" />
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: '사업자등록번호' });
    expect(input).toHaveAccessibleDescription('이미 등록된 거래처입니다');
    expect(screen.queryByText(/사업자등록증/)).toBeNull();
  });

  it('Field 밖이면 칸 아래에 문구를 그리고 설명으로 잇는다', () => {
    render(<MaskedInput mask="bizNo" validate label="사업자등록번호" defaultValue="1234567890" />);
    const input = screen.getByRole('textbox', { name: '사업자등록번호' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/사업자등록증/);
    expect(screen.getByRole('alert')).toHaveTextContent('사업자등록번호가 맞지 않습니다');
  });

  it('validate가 없으면 검사하지 않는다 · 다른 마스크는 무시', () => {
    render(
      <>
        <MaskedInput mask="bizNo" label="가" defaultValue="1234567890" />
        <MaskedInput mask="corpNo" validate label="나" defaultValue="1101111234567" />
      </>,
    );
    expect(screen.getByRole('textbox', { name: '가' })).not.toHaveAttribute('aria-invalid');
    expect(screen.getByRole('textbox', { name: '나' })).not.toHaveAttribute('aria-invalid');
  });

  it('en: 문구 사전', async () => {
    const { TrellisProvider } = await import('../src/core/index.js');
    render(
      <TrellisProvider locale="en">
        <MaskedInput mask="rrn" secret label="RRN" />
        <MaskedInput mask="bizNo" validate label="Biz" defaultValue="1234567890" />
      </TrellisProvider>,
    );
    expect(screen.getByRole('button', { name: 'Show registration number' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'This business registration number is not valid',
    );
  });
});
