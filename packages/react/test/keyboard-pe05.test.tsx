// PE-05 완료 조건: ScanField · CodeSearch를 키보드만으로 끝내고, AmountInput은 한글 입력기 조합 중에 글자를 고치지 않는다
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AmountInput, CodeSearch, Field, ScanField } from '../src/core/index.js';

const flush = () => act(async () => {});

describe('ScanField — 키보드만으로', () => {
  it('글자를 치고 Enter면 onScan, 칸을 비우고 읽은 코드를 알린다', () => {
    const onScan = vi.fn();
    render(<ScanField label="바코드" onScan={onScan} />);
    const input = screen.getByRole('textbox', { name: '바코드' });
    input.focus();
    fireEvent.change(input, { target: { value: ' 8801234567890 ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onScan).toHaveBeenCalledWith('8801234567890');
    expect(input).toHaveValue('');
    expect(document.activeElement).toBe(input);
  });

  it('한글 조합 중 Enter는 무시하고, Esc는 칸을 비운다', () => {
    const onScan = vi.fn();
    render(<ScanField label="입고 바코드" onScan={onScan} />);
    const input = screen.getByRole('textbox', { name: '입고 바코드' });
    fireEvent.change(input, { target: { value: '가나' } });
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(onScan).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input).toHaveValue('');
  });
});

describe('AmountInput — 한글 입력기(IME)', () => {
  it('조합 중에는 글자를 고치지 않고, 조합이 끝나면 천 단위로 정리해 값을 알린다', () => {
    const onChange = vi.fn();
    render(
      <Field label="금액">
        <AmountInput onChange={onChange} />
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: '금액' });
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: '12345' } });
    expect(input).toHaveValue('12345');
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.compositionEnd(input, { target: { value: '12345' } });
    expect(input).toHaveValue('12,345');
    expect(onChange).toHaveBeenLastCalledWith(12345);
  });
});

describe('CodeSearch — 키보드만으로 고르기(넓은 화면)', () => {
  it('글자를 치고 ↓ · Enter로 고르면 onChange(코드)와 "코드 이름"', async () => {
    const onChange = vi.fn();
    render(
      <Field label="계정과목">
        <CodeSearch
          onChange={onChange}
          options={[
            { value: '1010', label: '현금' },
            { value: '1080', label: '외상매출금' },
          ]}
        />
      </Field>,
    );
    const input = screen.getByRole('combobox', { name: '계정과목' });
    input.focus();
    fireEvent.change(input, { target: { value: '외상' } });
    await flush();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await flush();
    fireEvent.keyDown(input, { key: 'Enter' });
    await flush();
    expect(onChange).toHaveBeenLastCalledWith('1080');
    expect(input).toHaveValue('1080 외상매출금');
  });
});
