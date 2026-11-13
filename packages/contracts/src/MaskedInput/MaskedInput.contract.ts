import { defineContract, SIZES, type ContractBase, type Size } from '../_base.js';

/** 번호 프리셋. 그 밖에는 '#'(숫자 한 자리)과 구분 글자로 된 패턴 문자열('####-##').
 * rrn = 주민등록번호(외국인등록번호도 같은 6-7 형식), bankAccount = 은행 계좌번호(은행마다 자리 수 · 구분이 다르다, bank) */
export type MaskPreset = 'bizNo' | 'corpNo' | 'phone' | 'zip' | 'rrn' | 'bankAccount';
/** 프리셋 자동 완성을 살린 string */
export type MaskKind = MaskPreset | (string & {});

/** 고정 프리셋 패턴. phone은 앞자리에 따라 바뀐다(maskPattern) */
export const MASK_PATTERNS = {
  bizNo: '###-##-#####',
  corpNo: '######-#######',
  zip: '#####',
  rrn: '######-#######',
} as const;

/** 프리셋 예시 값(placeholder 기본값) */
export const MASK_EXAMPLES: Record<MaskPreset, string> = {
  bizNo: '123-45-67890',
  corpNo: '110111-1234567',
  phone: '010-1234-5678',
  zip: '06236',
  rrn: '900101-1234567',
  bankAccount: '110123456789',
};

/** 은행 계좌번호 형식 한 줄: 금융결제원 은행 코드 3자리 · 이름 · 새로 여는 계좌의 패턴 · 예시 */
export interface BankAccountFormat {
  code: string;
  name: string;
  pattern: string;
  example: string;
}

/**
 * 은행별 계좌번호 형식(PG-37). 은행이 지금 새로 여는 계좌 기준이다. 옛 형식(자리 수가 다르다) · 표에 없는 은행은
 * bank 없이 숫자만 받거나 mask에 패턴을 직접 준다. 은행 고르기 Select의 선택지로도 쓴다
 */
export const BANK_ACCOUNT_FORMATS: readonly BankAccountFormat[] = [
  { code: '003', name: '기업은행', pattern: '###-######-##-###', example: '024-118420-01-011' },
  { code: '004', name: '국민은행', pattern: '######-##-######', example: '421701-01-284519' },
  { code: '011', name: '농협은행', pattern: '###-####-####-##', example: '302-1234-5678-91' },
  { code: '012', name: '지역 농축협', pattern: '######-##-######', example: '351012-52-123456' },
  { code: '020', name: '우리은행', pattern: '####-###-######', example: '1002-123-456789' },
  { code: '023', name: 'SC제일은행', pattern: '###-##-######', example: '123-45-678901' },
  { code: '071', name: '우체국', pattern: '######-##-######', example: '012345-02-123456' },
  { code: '081', name: '하나은행', pattern: '###-######-#####', example: '391-910123-45678' },
  { code: '088', name: '신한은행', pattern: '###-###-######', example: '110-123-456789' },
  { code: '089', name: '케이뱅크', pattern: '###-###-######', example: '100-123-456789' },
  { code: '090', name: '카카오뱅크', pattern: '####-##-#######', example: '3333-01-1234567' },
  { code: '092', name: '토스뱅크', pattern: '####-####-####', example: '1000-1234-5678' },
];

/** 은행 코드의 계좌번호 형식. 표에 없으면 undefined(숫자만 받는다) */
export const bankAccountFormat = (bank?: string | null): BankAccountFormat | undefined =>
  bank ? BANK_ACCOUNT_FORMATS.find((b) => b.code === bank) : undefined;

/** 은행을 모를 때: 구분 글자 없이 숫자만 16자리까지, 10자리부터 다 친 것으로 본다 */
const BANK_ANY = '################';
const BANK_ANY_MIN = 10;

/** 마스크 부가 정보. bank = bankAccount의 은행 코드 */
export interface MaskOptions {
  bank?: string | null | undefined;
}

const onlyDigits = (s: string) => s.replace(/\D/g, '');

/** 전화번호 패턴: 02 지역번호 2-3-4 · 2-4-4, 010 3-4-4, 대표번호(15xx) 4-4, 그 밖 3-3-4 · 3-4-4 */
function phonePattern(d: string): { pattern: string; min: number } {
  if (d.startsWith('02'))
    return { pattern: d.length <= 9 ? '##-###-####' : '##-####-####', min: 9 };
  if (d.startsWith('1')) return { pattern: '####-####', min: 8 };
  if (d.startsWith('010')) return { pattern: '###-####-####', min: 11 };
  return { pattern: d.length <= 10 ? '###-###-####' : '###-####-####', min: 10 };
}

/** 마스크와 지금까지의 숫자로 패턴을 정한다 */
export function maskPattern(mask: MaskKind, digits = '', options?: MaskOptions): string {
  if (mask === 'phone') return phonePattern(onlyDigits(digits)).pattern;
  if (mask === 'bankAccount') return bankAccountFormat(options?.bank)?.pattern ?? BANK_ANY;
  if (mask in MASK_PATTERNS) return MASK_PATTERNS[mask as keyof typeof MASK_PATTERNS];
  return mask;
}

export interface MaskResult {
  /** 숫자만(패턴 자리 수까지) */
  raw: string;
  /** 구분 글자를 넣은 표시 값. 남은 숫자가 없으면 뒤 구분 글자는 붙이지 않는다 */
  formatted: string;
  /** 모든 자리를 채웠는지 */
  complete: boolean;
}

/** 숫자 문자열에 마스크를 씌운다(웹 · 네이티브 공용). bankAccount는 options.bank로 은행 형식을 고른다 */
export function applyMask(input: string, mask: MaskKind, options?: MaskOptions): MaskResult {
  const all = onlyDigits(input);
  const widest = mask === 'phone' ? '###-####-####' : maskPattern(mask, all, options);
  const pattern = maskPattern(mask, all.slice(0, widest.split('#').length - 1), options);
  const slots = pattern.split('#').length - 1;
  const raw = all.slice(0, slots);
  let out = '';
  let i = 0;
  for (const ch of pattern) {
    if (i >= raw.length) break;
    if (ch === '#') {
      out += raw[i];
      i += 1;
    } else out += ch;
  }
  const min =
    mask === 'phone'
      ? phonePattern(raw).min
      : mask === 'bankAccount' && !bankAccountFormat(options?.bank)
        ? BANK_ANY_MIN
        : slots;
  return { raw, formatted: out, complete: raw.length >= min && raw.length > 0 };
}

/**
 * 계좌번호 숫자 → 은행 형식 글자(024-118420-01-011). 은행을 모르면 숫자 그대로.
 * 표 · 상세에서 가릴 때는 maskAccount(formatBankAccount(raw, bank))로 끝 네 자리만 보인다
 */
export const formatBankAccount = (digits: string, bank?: string | null): string =>
  applyMask(digits, 'bankAccount', { bank }).formatted;

export interface MaskedInputProps extends ContractBase {
  /** Field 밖(표 칸 · 필터)에서 쓸 때의 접근성 이름 */
  label?: string;
  mask: MaskKind;
  /**
   * bankAccount의 은행 코드(금융결제원 3자리, BANK_ACCOUNT_FORMATS). 그 은행 형식으로 구분 글자를 넣는다.
   * 없거나 표에 없으면 구분 글자 없이 숫자만 받는다(10~16자리). 다른 마스크에서는 무시한다
   */
  bank?: string | null;
  /** 숫자만(구분 글자 없이) */
  value?: string;
  defaultValue?: string;
  /** raw = 숫자만, formatted = 화면에 보이는 값 */
  onChange?: (raw: string, formatted: string) => void;
  /** 예시 값. 없으면 프리셋 예시 */
  placeholder?: string;
  /**
   * rrn에서 뒷자리 첫 숫자만 보이고 나머지 여섯 자리는 ●로 가린다. 친 숫자는 1초쯤 보였다가 가려지고,
   * 눈 버튼으로 잠깐 펼친다. onChange의 raw는 늘 숫자 전부. 다른 마스크에서는 무시한다
   */
  secret?: boolean;
  /**
   * 검증 숫자가 있는 프리셋(bizNo)에서 다 친 번호가 검증에 실패하면 오류로 보이고 Field 오류 칸에 문구를 올린다.
   * 다른 마스크에서는 무시한다
   */
  validate?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  size?: Size;
  name?: string;
}

export const MaskedInputContract = defineContract<MaskedInputProps>({
  name: 'MaskedInput',
  props: {
    label: { type: 'string', description: 'Field 밖 접근성 이름' },
    id: { type: 'string', description: 'DOM id(Field 안이면 자동)' },
    testID: { type: 'string', description: '테스트 식별자' },
    mask: {
      type: "'bizNo' | 'corpNo' | 'phone' | 'zip' | 'rrn' | 'bankAccount' | string",
      required: true,
      description: '프리셋 또는 # 패턴',
    },
    bank: {
      type: 'string | null',
      description: 'bankAccount 은행 코드(3자리, 없으면 숫자만 · 다른 마스크는 무시)',
    },
    value: { type: 'string', description: '숫자만(제어)' },
    defaultValue: { type: 'string', description: '처음 숫자(비제어)' },
    onChange: {
      type: '(raw: string, formatted: string) => void',
      description: '값이 바뀔 때',
    },
    placeholder: { type: 'string', description: '예시 값(없으면 프리셋 예시)' },
    secret: {
      type: 'boolean',
      default: false,
      description: 'rrn 뒷자리 여섯 자리 가림 · 보기 버튼(다른 마스크는 무시)',
    },
    validate: {
      type: 'boolean',
      default: false,
      description: 'bizNo 검증 숫자 검사(다 친 번호가 틀리면 오류, 다른 마스크는 무시)',
    },
    disabled: { type: 'boolean', default: false, description: '비활성' },
    invalid: { type: 'boolean', default: false, description: '오류(Field error면 자동)' },
    required: { type: 'boolean', default: false, description: '필수' },
    size: {
      type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
      default: 'md',
      values: SIZES,
      description: '높이',
    },
    name: { type: 'string', description: '폼 이름(숫자만 제출)' },
  },
  states: ['default', 'hover', 'focus', 'disabled', 'error'],
  a11y: {
    role: 'textbox',
    keyboard: ['숫자 입력', 'Tab', 'Enter · Space(보기 버튼)'],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
