import {
  AmountInputContract,
  CheckboxContract,
  CodeSearchContract,
  DateFieldContract,
  FileUploadContract,
  MaskedInputContract,
  MultiSelectContract,
  PeriodPickerContract,
  QuantityInputContract,
  RadioGroupContract,
  SegmentedControlContract,
  SwitchContract,
  TextareaContract,
  applyMask,
  resolvePeriodPreset,
  type AmountInputProps,
  type CheckboxProps,
  type MaskedInputProps,
} from '@terracelab/trellis-contracts';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
  AmountInput,
  Checkbox,
  CodeSearch,
  DateField,
  Field,
  FileUpload,
  MaskedInput,
  MultiSelect,
  PeriodPicker,
  QuantityInput,
  RadioGroup,
  SegmentedControl,
  Switch,
  Textarea,
} from '../src/core/index.js';

const PAIRS: [{ displayName?: string }, { name: string; props: Record<string, unknown> }][] = [
  [Textarea, TextareaContract],
  [Checkbox, CheckboxContract],
  [RadioGroup, RadioGroupContract],
  [Switch, SwitchContract],
  [SegmentedControl, SegmentedControlContract],
  [DateField, DateFieldContract],
  [MultiSelect, MultiSelectContract],
  [PeriodPicker, PeriodPickerContract],
  [AmountInput, AmountInputContract],
  [QuantityInput, QuantityInputContract],
  [MaskedInput, MaskedInputContract],
  [CodeSearch, CodeSearchContract],
  [FileUpload, FileUploadContract],
];

describe('contract parity', () => {
  it('displayName === contract.name', () => {
    for (const [c, k] of PAIRS) expect(c.displayName).toBe(k.name);
  });

  it('모든 contract props에 id · testID가 있다', () => {
    for (const [, k] of PAIRS) {
      expect(Object.keys(k.props), k.name).toContain('id');
      expect(Object.keys(k.props), k.name).toContain('testID');
    }
  });

  it('웹 props는 contract props를 포함한다(타입)', () => {
    expectTypeOf<Omit<CheckboxProps, 'children'>>().toMatchTypeOf<
      ComponentProps<typeof Checkbox>
    >();
    expectTypeOf<AmountInputProps>().toMatchTypeOf<ComponentProps<typeof AmountInput>>();
    expectTypeOf<MaskedInputProps>().toMatchTypeOf<ComponentProps<typeof MaskedInput>>();
  });
});

describe('공용 함수', () => {
  it('applyMask: 프리셋 · 전화 · 패턴', () => {
    expect(applyMask('2148812345', 'bizNo')).toEqual({
      raw: '2148812345',
      formatted: '214-88-12345',
      complete: true,
    });
    expect(applyMask('123', 'bizNo').formatted).toBe('123');
    expect(applyMask('01012345678', 'phone').formatted).toBe('010-1234-5678');
    expect(applyMask('021234567', 'phone').formatted).toBe('02-123-4567');
    expect(applyMask('0212345678999', 'phone').raw).toBe('0212345678');
    expect(applyMask('15881234', 'phone').formatted).toBe('1588-1234');
    expect(applyMask('123456', '####-##').formatted).toBe('1234-56');
  });

  it('resolvePeriodPreset: 월요일 시작 주 · 분기 · 부가세 기수', () => {
    // 2026-11-08은 일요일
    expect(resolvePeriodPreset('thisWeek', '2026-11-08')).toEqual({
      from: '2026-11-02',
      to: '2026-11-08',
    });
    expect(resolvePeriodPreset('lastMonth', '2026-01-15')).toEqual({
      from: '2025-12-01',
      to: '2025-12-31',
    });
    expect(resolvePeriodPreset('thisQuarter', '2026-11-08')).toEqual({
      from: '2026-10-01',
      to: '2026-12-31',
    });
    expect(resolvePeriodPreset('vatPeriod1', '2026-11-08')).toEqual({
      from: '2026-01-01',
      to: '2026-06-30',
    });
  });
});

describe('Textarea', () => {
  it('Field 라벨이 이름이 되고 글자 수를 보인다', () => {
    render(
      <Field label="적요">
        <Textarea defaultValue="운송료" maxLength={200} testID="memo" />
      </Field>,
    );
    const box = screen.getByRole('textbox', { name: '적요' });
    expect(box).toHaveAttribute('data-testid', 'memo');
    expect(screen.getByText('3 / 200')).toBeInTheDocument();
    fireEvent.change(box, { target: { value: '11월 운송료' } });
    expect(screen.getByText('7 / 200')).toBeInTheDocument();
  });
});

describe('Checkbox', () => {
  it('라벨을 이름으로 갖고 누르면 onChange(true)', () => {
    const onChange = vi.fn();
    render(
      <Checkbox onChange={onChange} description="발행 즉시 메일로 보냅니다">
        세금계산서 메일 발송
      </Checkbox>,
    );
    const box = screen.getByRole('checkbox', { name: '세금계산서 메일 발송' });
    expect(box).toHaveAttribute('aria-checked', 'false');
    expect(box).toHaveAccessibleDescription('발행 즉시 메일로 보냅니다');
    fireEvent.click(box);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(box).toHaveAttribute('aria-checked', 'true');
  });

  it('일부 선택은 aria-checked="mixed"', () => {
    render(<Checkbox indeterminate>전체</Checkbox>);
    expect(screen.getByRole('checkbox', { name: '전체' })).toHaveAttribute('aria-checked', 'mixed');
  });
});

describe('RadioGroup', () => {
  const options = [
    { value: 'cash', label: '현금' },
    { value: 'credit', label: '외상' },
    { value: 'bill', label: '어음', description: '만기 90일 이내' },
  ];

  it('label prop이 그룹 이름, 선택지는 radio', () => {
    render(<RadioGroup label="결제 조건" options={options} defaultValue="credit" />);
    expect(screen.getByRole('radiogroup', { name: '결제 조건' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: '외상' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: '어음' })).toHaveAccessibleDescription(
      '만기 90일 이내',
    );
  });

  it('Field 안에서는 Field 라벨이 그룹 이름', () => {
    const onChange = vi.fn();
    render(
      <Field label="과세 구분">
        <RadioGroup options={options} onChange={onChange} />
      </Field>,
    );
    expect(screen.getByRole('radiogroup', { name: '과세 구분' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: '현금' }));
    expect(onChange).toHaveBeenCalledWith('cash');
  });
});

describe('Switch', () => {
  it('role="switch" + 라벨 이름, 누르면 onChange(true)', () => {
    const onChange = vi.fn();
    render(<Switch onChange={onChange}>세금계산서 자동 발행</Switch>);
    const sw = screen.getByRole('switch', { name: '세금계산서 자동 발행' });
    expect(sw).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(sw);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(sw).toHaveAttribute('aria-checked', 'true');
  });
});

describe('SegmentedControl', () => {
  it('radiogroup + 칸 이름은 라벨 + 건수, 기본은 첫 칸', () => {
    render(
      <SegmentedControl
        label="결재 상태"
        options={[
          { value: 'all', label: '전체', count: 48 },
          { value: 'pending', label: '진행', count: 120 },
        ]}
      />,
    );
    expect(screen.getByRole('radiogroup', { name: '결재 상태' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '전체 48건' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('radio', { name: '진행 99+건' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });
});

describe('DateField', () => {
  it('ISO 글자로 주고받는다(브라우저 형식을 쓰지 않는다)', () => {
    const onChange = vi.fn();
    render(
      <Field label="전표일">
        <DateField defaultValue="2026-11-07" onChange={onChange} />
      </Field>,
    );
    const input = screen.getByLabelText('전표일');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('inputmode', 'numeric');
    expect(input).toHaveValue('2026-11-07');
    fireEvent.change(input, { target: { value: '20261110' } });
    expect(input).toHaveValue('2026-11-10');
    expect(onChange).toHaveBeenCalledWith('2026-11-10');
    fireEvent.change(input, { target: { value: '' } });
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('덜 친 날짜 · 없는 날은 값을 바꾸지 않고, 칸을 떠나면 돌아간다', () => {
    const onChange = vi.fn();
    render(<DateField label="납기일" defaultValue="2026-11-07" onChange={onChange} />);
    const input = screen.getByLabelText('납기일');
    fireEvent.change(input, { target: { value: '2026-02-3' } });
    expect(input).toHaveValue('2026-02-3');
    fireEvent.change(input, { target: { value: '2026-02-30' } });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.blur(input);
    expect(input).toHaveValue('2026-11-07');
  });
});

describe('PeriodPicker', () => {
  it('트리거에 기간을 보이고 프리셋을 누르면 바로 적용한다', async () => {
    const onChange = vi.fn();
    render(
      <Field label="조회 기간">
        <PeriodPicker
          today="2026-11-07"
          defaultValue={{ from: '2026-11-01', to: '2026-11-30' }}
          onChange={onChange}
        />
      </Field>,
    );
    const trigger = screen.getByRole('button', { name: '조회 기간' });
    expect(trigger).toHaveTextContent('2026-11-01~11-30');
    fireEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: '기간 선택' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^당월/ })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: /^전월/ }));
    expect(onChange).toHaveBeenCalledWith({ from: '2026-10-01', to: '2026-10-31' });
    await waitFor(() => expect(trigger).toHaveTextContent('2026-10-01~10-31'));
  });
});

describe('AmountInput', () => {
  it('"1234567"을 치면 1,234,567과 숫자 값', () => {
    const onChange = vi.fn();
    render(
      <Field label="공급가액">
        <AmountInput onChange={onChange} showKorean />
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: '공급가액' });
    fireEvent.change(input, { target: { value: '1234567' } });
    expect(input).toHaveValue('1,234,567');
    expect(onChange).toHaveBeenLastCalledWith(1234567);
    expect(screen.getByText('일금 일백이십삼만사천오백육십칠원정')).toBeInTheDocument();
    expect(screen.getByText('원')).toBeInTheDocument();
  });

  it('붙여 넣은 글자 정리 · 음수 · 외화 소수', () => {
    const { rerender } = render(<AmountInput testID="amt" allowNegative />);
    const input = screen.getByTestId('amt');
    fireEvent.change(input, { target: { value: '-1,234,000원' } });
    expect(input).toHaveValue('−1,234,000');
    rerender(<AmountInput testID="amt" currency="USD" defaultValue={1250.5} />);
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('max를 넘으면 오류 상태', () => {
    render(<AmountInput testID="amt" defaultValue={5400000} max={5000000} />);
    expect(screen.getByTestId('amt')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('QuantityInput', () => {
  it('Field 라벨 이름 · 천 단위 · 단위 · 증감 버튼', () => {
    render(
      <Field label="입고 수량">
        <QuantityInput defaultValue={1240} units={['EA', 'BOX']} />
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: '입고 수량' });
    expect(input).toHaveValue('1,240');
    expect(screen.getByRole('combobox', { name: '단위' })).toHaveValue('EA');
    fireEvent.click(screen.getByRole('button', { name: '수량 늘리기' }));
    expect(input).toHaveValue('1,241');
  });
});

describe('MaskedInput', () => {
  it('사업자등록번호를 3-2-5로 나누고 다 채우면 data-complete', () => {
    const onChange = vi.fn();
    render(
      <Field label="사업자등록번호">
        <MaskedInput mask="bizNo" onChange={onChange} />
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: '사업자등록번호' });
    expect(input).toHaveAttribute('placeholder', '123-45-67890');
    fireEvent.change(input, { target: { value: '12345' } });
    expect(input).toHaveValue('123-45');
    fireEvent.change(input, { target: { value: '1234567890' } });
    expect(input).toHaveValue('123-45-67890');
    expect(onChange).toHaveBeenLastCalledWith('1234567890', '123-45-67890');
    expect(input.closest('.tl-masked-input')).toHaveAttribute('data-complete');
  });
});

describe('CodeSearch', () => {
  it('combobox + Field 라벨 이름, 고른 값은 "코드 이름"', () => {
    render(
      <Field label="계정과목">
        <CodeSearch
          defaultValue="1080"
          options={[
            { value: '1010', label: '현금' },
            { value: '1080', label: '외상매출금' },
          ]}
        />
      </Field>,
    );
    const input = screen.getByRole('combobox', { name: '계정과목' });
    expect(input).toHaveValue('1080 외상매출금');
  });
});

describe('FileUpload', () => {
  it('안내 문구가 이름, 파일 목록 · 진행률 · 삭제 버튼', () => {
    const onRemove = vi.fn();
    render(
      <FileUpload
        hint="PDF, 10MB 이하"
        files={[
          { name: '견적서.pdf', size: 248320, status: 'done' },
          { name: '거래명세서.xlsx', size: 1572864, status: 'uploading', progress: 40 },
        ]}
        onRemove={onRemove}
      />,
    );
    const input = screen.getByLabelText('파일을 끌어 놓거나 선택하세요');
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAccessibleDescription('PDF, 10MB 이하');
    expect(screen.getByRole('list', { name: '첨부 파일' })).toBeInTheDocument();
    expect(screen.getByText('242.5KB · 완료')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: '거래명세서.xlsx 업로드' })).toHaveAttribute(
      'aria-valuenow',
      '40',
    );
    fireEvent.click(screen.getByRole('button', { name: '견적서.pdf 삭제' }));
    expect(onRemove).toHaveBeenCalledWith('견적서.pdf');
  });

  it('형식 · 크기를 벗어난 파일은 거르고 알린다', () => {
    const onFilesChange = vi.fn();
    render(
      <FileUpload
        accept=".pdf"
        multiple
        maxSize={1024}
        onFilesChange={onFilesChange}
        testID="up"
      />,
    );
    const input = screen.getByLabelText('파일을 끌어 놓거나 선택하세요');
    const ok = new File(['a'], '견적서.pdf', { type: 'application/pdf' });
    const big = new File(['a'.repeat(2048)], '계약서.pdf', { type: 'application/pdf' });
    const img = new File(['a'], '사진.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [ok, big, img] } });
    expect(onFilesChange).toHaveBeenCalledWith([ok]);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('계약서.pdf: 1.0KB 이하 파일만 올릴 수 있습니다');
    expect(alert).toHaveTextContent('사진.png: 받을 수 있는 형식이 아닙니다');
  });
});
