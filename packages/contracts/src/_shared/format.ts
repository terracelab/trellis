// 웹·네이티브 공용 숫자 서식(components.md §8). 음수는 U+2212, 천 단위 구분, 단위는 옵션.
export interface FormatAmountOptions {
  /** '원'처럼 뒤에 붙는 단위. false면 숫자만 */
  unit?: string | false;
  /** always면 양수에도 +를 붙인다 */
  sign?: 'auto' | 'always';
  /** 소수 자릿수(기본 0) */
  digits?: number;
}

const MINUS = '−';

export function formatAmount(value: number, options: FormatAmountOptions = {}): string {
  const { unit = false, sign = 'auto', digits = 0 } = options;
  if (!Number.isFinite(value)) return '–';
  const abs = Math.abs(value).toLocaleString('ko-KR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  const negative = value < 0 && Number(abs.replace(/,/g, '')) !== 0;
  const prefix = negative ? MINUS : sign === 'always' && value > 0 ? '+' : '';
  return `${prefix}${abs}${unit ? unit : ''}`;
}

/** 카운트 배지: 99를 넘으면 99+ */
export function formatCount(value: number, max = 99): string {
  if (!Number.isFinite(value) || value <= 0) return '0';
  return value > max ? `${max}+` : String(Math.floor(value));
}

/** 큰 금액 축 라벨: 억·만 단위로 줄인다(1.2억, 3,400만). 0은 "0" */
export function formatCompactWon(value: number): string {
  const abs = Math.abs(value);
  const neg = value < 0 ? MINUS : '';
  if (abs >= 1e8) {
    const n = abs / 1e8;
    return `${neg}${n.toLocaleString('ko-KR', { maximumFractionDigits: n >= 10 ? 0 : 1 })}억`;
  }
  if (abs >= 1e4) return `${neg}${Math.round(abs / 1e4).toLocaleString('ko-KR')}만`;
  return `${neg}${abs.toLocaleString('ko-KR')}`;
}

/** 비율: 소수 1자리 + %. 차이는 %p */
export function formatPercent(value: number, digits = 1, point = false): string {
  if (!Number.isFinite(value)) return '–';
  const s = Math.abs(value).toLocaleString('ko-KR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `${value < 0 ? MINUS : ''}${s}${point ? '%p' : '%'}`;
}

/* ── 업종 확장 서식(content.md §4, 트랙 E PE-04) ─────────────────────── */

/** 수량 + 단위(붙여쓰기): 1,240EA · 3.5kg · 12건 */
export function formatQuantity(value: number, unit = '', digits = 0): string {
  return `${formatAmount(value, { digits })}${unit}`;
}

export type CurrencyCode = 'KRW' | 'USD' | 'EUR' | 'JPY' | 'CNY';
const CURRENCY_DIGITS: Record<CurrencyCode, number> = { KRW: 0, USD: 2, EUR: 2, JPY: 0, CNY: 2 };

/** 통화 금액. 원화는 "12,345원", 외화는 "USD 12,345.00"(무역 서류 관습) */
export function formatCurrency(value: number, currency: CurrencyCode = 'KRW'): string {
  if (currency === 'KRW') return formatAmount(value, { unit: '원' });
  return `${currency} ${formatAmount(value, { digits: CURRENCY_DIGITS[currency] })}`;
}

/** 사업자등록번호 3-2-5. 숫자가 10자리가 아니면 입력 그대로 */
export function formatBizNo(value: string): string {
  const d = value.replace(/\D/g, '');
  return d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}` : value;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;
const pad = (n: number) => String(n).padStart(2, '0');
/** 'YYYY-MM-DD'를 그 날짜의 자정(현지)으로. 시간대 차이로 하루 밀리지 않게 직접 쪼갠다 */
export function parseDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

/** 날짜. iso = 2026-11-07(표 · 입력), md = 11월 7일, mdw = 11월 7일(금)(문장 · 제목) */
export function formatDate(value: string | Date, style: 'iso' | 'md' | 'mdw' = 'iso'): string {
  const d = parseDate(value);
  if (Number.isNaN(d.getTime())) return '–';
  if (style === 'iso') return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const md = `${d.getMonth() + 1}월 ${d.getDate()}일`;
  return style === 'md' ? md : `${md}(${WEEKDAYS[d.getDay()]})`;
}

/** 날짜 · 시각 값 → Date. 'YYYY-MM-DD'만 있으면 그 날 자정(현지), 시각이 있으면 그대로(시간대 포함) */
function toInstant(value: string | Date): Date {
  if (value instanceof Date) return value;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseDate(value) : new Date(value);
}

/**
 * 상대 시각(content.md §4): 1분 안 "방금" · 1시간 안 "N분 전" · 하루 안 "N시간 전" · 7일 안 "N일 전",
 * 그 뒤는 날짜("10월 28일", 해가 다르면 2025-10-28). 앞날(시계 차이)은 "방금"으로 본다.
 * 알림 목록 · 메시지 · 변경 이력의 시각에 쓴다. 표 칸 날짜는 formatDate
 */
export function formatRelativeTime(
  value: string | Date,
  now: string | Date = new Date(),
  locale: 'ko' | 'en' = 'ko',
): string {
  const t = toInstant(value);
  const n = toInstant(now);
  if (Number.isNaN(t.getTime()) || Number.isNaN(n.getTime())) return '–';
  const minutes = Math.floor((n.getTime() - t.getTime()) / 60_000);
  const ko = locale === 'ko';
  if (minutes < 1) return ko ? '방금' : 'Just now';
  if (minutes < 60) return ko ? `${minutes}분 전` : `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return ko ? `${hours}시간 전` : `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days <= 7) return ko ? `${days}일 전` : `${days} d ago`;
  if (t.getFullYear() !== n.getFullYear()) return formatDate(t);
  return ko
    ? formatDate(t, 'md')
    : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(t);
}

/** 알림 목록 날짜 묶음 */
export type RelativeDayGroup = 'today' | 'yesterday' | 'thisWeek' | 'earlier';
export const RELATIVE_DAY_GROUPS: readonly RelativeDayGroup[] = [
  'today',
  'yesterday',
  'thisWeek',
  'earlier',
];

/** 시각이 어느 날짜 묶음인지: 오늘 · 어제 · 이번 주(월요일 시작, 오늘 · 어제 밖) · 이전. 현지 날짜로 센다 */
export function relativeDayGroup(
  value: string | Date,
  now: string | Date = new Date(),
): RelativeDayGroup {
  const t = toInstant(value);
  const n = toInstant(now);
  const days = dueDays(t, n) * -1;
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  // 월요일 = 0. 오늘이 이번 주의 몇째 날인지보다 덜 지났으면 이번 주
  const sinceMonday = (n.getDay() + 6) % 7;
  return days <= sinceMonday ? 'thisWeek' : 'earlier';
}

/** 기간: 2026-11-01~11-30(같은 해면 끝의 연도 생략, 물결 양쪽 공백 없음) */
export function formatPeriod(from: string | Date, to: string | Date): string {
  const a = formatDate(from);
  const b = formatDate(to);
  return a.slice(0, 4) === b.slice(0, 4) ? `${a}~${b.slice(5)}` : `${a}~${b}`;
}

/** 기한까지 남은 날: D-3 · D-day · 3일 경과. today를 넘기지 않으면 오늘 */
export function formatDueDays(due: string | Date, today: string | Date = new Date()): string {
  const days = dueDays(due, today);
  if (days === 0) return 'D-day';
  return days > 0 ? `D-${days}` : `${-days}일 경과`;
}

/** 기한까지 남은 날 수(지났으면 음수) */
export function dueDays(due: string | Date, today: string | Date = new Date()): number {
  const a = parseDate(due);
  const t = parseDate(today);
  const utc = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((utc(a) - utc(t)) / 86_400_000);
}

const DIGIT = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'] as const;
const SMALL = ['', '십', '백', '천'] as const;
const BIG = ['', '만', '억', '조'] as const;
/** 한글 금액(세금계산서 · 영수증 · 지출결의): 일금 팔억칠천사백사십칠만구천오백원정. 위조 방지 관습대로 1도 적는다(일백일십만) */
export function formatKoreanAmount(value: number): string {
  const n = Math.floor(Math.abs(value));
  if (n === 0) return '일금 영원정';
  const groups: string[] = [];
  let rest = n;
  for (let g = 0; rest > 0 && g < BIG.length; g += 1) {
    const chunk = rest % 10_000;
    rest = Math.floor(rest / 10_000);
    if (chunk === 0) continue;
    let s = '';
    const digits = String(chunk).padStart(4, '0').split('').map(Number);
    digits.forEach((d, i) => {
      if (d === 0) return;
      const place = 3 - i;
      s += (DIGIT[d] ?? '') + (SMALL[place] ?? '');
    });
    groups.unshift(s + BIG[g]);
  }
  return `일금 ${value < 0 ? '마이너스 ' : ''}${groups.join('')}원정`;
}

/** 주민등록번호 · 외국인등록번호의 가림 글자 */
export const RRN_MASK_CHAR = '●';

/**
 * 주민등록번호 · 외국인등록번호 6-7(표 · DescriptionList · 급여명세서).
 * masked(기본)면 뒷자리 첫 숫자만 보이고 나머지는 ●(900101-1●●●●●●). 자리 수가 모자라도 가린다.
 * masked가 false면 13자리일 때만 나누고, 아니면 입력 그대로 돌려준다.
 */
export function formatRrn(value: string, options: { masked?: boolean } = {}): string {
  const { masked = true } = options;
  const d = value.replace(/\D/g, '');
  if (!masked) return d.length === 13 ? `${d.slice(0, 6)}-${d.slice(6)}` : value;
  const front = d.slice(0, 6);
  const back = d.slice(6, 13);
  if (back.length === 0) return front;
  return `${front}-${back[0]}${RRN_MASK_CHAR.repeat(back.length - 1)}`;
}

/* ── 증감(Delta · KpiCard, PR-30) ─────────────────────────────────── */

/** 증감 서식: percent = 상대 변화(12.4%), point = 비율끼리의 차이(0.3%p), amount = 금액(원), number = 수량 */
export type DeltaFormat = 'percent' | 'point' | 'amount' | 'number';
/** 증감 방향. 보이는 자릿수로 반올림한 값이 0이면 flat */
export type DeltaDirection = 'up' | 'down' | 'flat';

const DELTA_DIGITS: Record<DeltaFormat, number> = { percent: 1, point: 1, amount: 0, number: 0 };

/** 보이는 자릿수로 반올림. 0에서 먼 쪽으로(toLocaleString과 같다), −0은 0 */
function roundTo(value: number, digits: number): number {
  const f = 10 ** digits;
  const r = (Math.sign(value) * Math.round(Math.abs(value) * f)) / f;
  return r === 0 ? 0 : r;
}

/** 증감 방향. 0.04%처럼 보이는 자릿수에서 0이면 flat(부호 · 화살표 없이 0) */
export function deltaDirection(
  value: number,
  format: DeltaFormat = 'percent',
  digits: number = DELTA_DIGITS[format],
): DeltaDirection {
  if (!Number.isFinite(value)) return 'flat';
  const r = roundTo(value, digits);
  return r > 0 ? 'up' : r < 0 ? 'down' : 'flat';
}

/**
 * 증감 글자. 부호는 항상 붙인다(content.md §4 "전월 대비 +12.4%"). 감소는 U+2212.
 * amount의 단위는 기본 원, number는 unit을 숫자 뒤에 붙인다(+4건).
 */
export function formatDelta(
  value: number,
  format: DeltaFormat = 'percent',
  options: { unit?: string; digits?: number } = {},
): string {
  const digits = options.digits ?? DELTA_DIGITS[format];
  if (!Number.isFinite(value)) return '–';
  const r = roundTo(value, digits);
  switch (format) {
    case 'amount':
      return formatAmount(r, { sign: 'always', digits, unit: options.unit ?? '원' });
    case 'number':
      return `${formatAmount(r, { sign: 'always', digits })}${options.unit ?? ''}`;
    case 'point':
      return `${r > 0 ? '+' : ''}${formatPercent(r, digits, true)}`;
    default:
      return `${r > 0 ? '+' : ''}${formatPercent(r, digits)}`;
  }
}

/* ── 개인정보 가림(MaskedValue · HrRecord, PR-30) ──────────────────── */
// 가림 글자는 formatRrn · maskAccount와 같은 ●. 다른 글자가 필요하면 char로 바꾼다.

/**
 * 전화번호 가림: 가운데 묶음만 가린다(010-●●●●-5678 · 02-●●●-4567).
 * 구분자가 있으면 그 모양을 그대로 두고 끝에서 두 번째 숫자 묶음을 가린다(+82 10-●●●●-5678).
 * 구분자 없는 9~11자리는 한국 번호로 나눠 하이픈을 넣는다. 그 밖에는 끝 네 자리만 보인다.
 */
export function maskPhone(value: string, options: { char?: string } = {}): string {
  const char = options.char ?? RRN_MASK_CHAR;
  const groups = value.match(/\d+/g) ?? [];
  if (groups.length >= 3) {
    const target = groups.length - 2;
    let i = 0;
    return value.replace(/\d+/g, (g) => (i++ === target ? char.repeat(g.length) : g));
  }
  const d = value.replace(/\D/g, '');
  if (groups.length === 1 && d.length >= 9 && d.length <= 11) {
    const head = d.startsWith('02') ? 2 : 3;
    return `${d.slice(0, head)}-${char.repeat(d.length - head - 4)}-${d.slice(-4)}`;
  }
  let seen = 0;
  return value.replace(/\d/g, (x) => (++seen > d.length - 4 ? x : char));
}

/**
 * 이름 가림. 한글 두 글자는 성만(김●), 세 글자는 가운데(김●수), 네 글자 이상은 두 글자 성으로 보고
 * 성과 끝 글자만 보인다(남궁●수). 성 길이를 알면 surnameLength로 정한다.
 * 띄어 쓴 이름 · 로마자 이름은 낱말마다 첫 글자만 보인다(S●●●●●● H●●).
 */
export function maskName(
  value: string,
  options: { char?: string; surnameLength?: 1 | 2 } = {},
): string {
  const char = options.char ?? RRN_MASK_CHAR;
  const name = value.trim();
  if (!/^[가-힣]+$/.test(name)) {
    return name.replace(/\S+/g, (word) => {
      const [first = '', ...rest] = Array.from(word);
      return first + char.repeat(rest.length);
    });
  }
  const chars = Array.from(name);
  const n = chars.length;
  if (n <= 1) return name;
  if (n === 2) return `${chars[0]}${char}`;
  const surname = options.surnameLength ?? (n >= 4 ? 2 : 1);
  const hidden = n - surname - 1;
  if (hidden <= 0) return chars.slice(0, surname).join('') + char.repeat(n - surname);
  return `${chars.slice(0, surname).join('')}${char.repeat(hidden)}${chars[n - 1]}`;
}

/** 동 · 리 · 가(지번 주소)나 로 · 길(도로명 주소). 한글 뒤에 숫자가 붙어도 된다(역삼1동 · 종로1가 · 봉은사로86길) */
const ADDRESS_LEVEL = /[가-힣]\d*(동|리|가|로|길)$/;

/**
 * 주소 가림: 동 · 로 단계까지 보이고 그 뒤(번지 · 건물 번호 · 상세 주소)는 글자마다 가린다. 띄어쓰기는 둔다.
 * 서울특별시 강남구 테헤란로 ●●● ●●. 동 · 로를 찾지 못하면 앞 두 낱말(시도 · 시군구)만 보인다.
 */
export function maskAddress(value: string, options: { char?: string } = {}): string {
  const char = options.char ?? RRN_MASK_CHAR;
  const parts = value.trim().split(/(\s+)/);
  const words = parts.filter((p) => p.trim());
  let keep = words.findIndex((w) => ADDRESS_LEVEL.test(w.replace(/[,()]+$/, '')));
  if (keep === -1) keep = Math.min(1, words.length - 1);
  let index = -1;
  return parts
    .map((p) => {
      if (!p.trim()) return p;
      index += 1;
      return index <= keep ? p : char.repeat(Array.from(p).length);
    })
    .join('');
}
