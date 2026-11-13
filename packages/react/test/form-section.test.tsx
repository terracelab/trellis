// FormSection 접기(PR-18 · R-28)
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Field, FormSection, Input } from '../src/core/index.js';

describe('FormSection 접기', () => {
  it('기본은 접힘(inert), 제목 단추로 펼치고, 접혀 있으면 채운 칸 수를 보인다', () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <FormSection title="선택 항목" collapsible onOpenChange={onOpenChange}>
        <Field label="메모">
          <Input defaultValue="11월 납품분" />
        </Field>
        <Field label="증빙 번호">
          <Input />
        </Field>
      </FormSection>,
    );
    const toggle = screen.getByRole('button', { name: /선택 항목/ });
    expect(toggle.tagName).toBe('BUTTON');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveTextContent('입력 1개');
    const content = container.querySelector(
      `#${CSS.escape(toggle.getAttribute('aria-controls')!)}`,
    );
    expect(content).toHaveAttribute('inert');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(content).not.toHaveAttribute('inert');
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    // 펼치면 채운 칸 수는 숨긴다
    expect(toggle).not.toHaveTextContent('입력 1개');
  });

  it('안에 오류가 생기면 저절로 펼친다', () => {
    function Form() {
      const [error, setError] = useState<string | undefined>();
      return (
        <>
          <button type="button" onClick={() => setError('증빙 번호를 확인하세요')}>
            검사
          </button>
          <FormSection title="선택 항목" collapsible>
            <Field label="증빙 번호" error={error}>
              <Input />
            </Field>
          </FormSection>
        </>
      );
    }
    render(<Form />);
    const toggle = screen.getByRole('button', { name: /선택 항목/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(screen.getByRole('button', { name: '검사' }));
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    // 사람이 다시 접으면 같은 오류로 또 펼치지 않는다
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('제어(open · onOpenChange)', () => {
    function Controlled() {
      const [open, setOpen] = useState(true);
      return (
        <FormSection title="추가 정보" collapsible open={open} onOpenChange={setOpen}>
          <Field label="업태">
            <Input />
          </Field>
        </FormSection>
      );
    }
    render(<Controlled />);
    const toggle = screen.getByRole('button', { name: /추가 정보/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('collapsible이 아니면 지금 모양 그대로(legend 글자, 단추 없음)', () => {
    render(
      <FormSection title="기본 정보">
        <Field label="상호">
          <Input />
        </Field>
      </FormSection>,
    );
    expect(screen.queryByRole('button', { name: /기본 정보/ })).toBeNull();
    expect(screen.getByRole('group', { name: '기본 정보' })).toBeInTheDocument();
  });
});
