// 달력 격자(D-11: react-day-picker + 자체 스타일). 값은 'YYYY-MM-DD' 문자열로만 주고받는다.
import { formatDate, weekdayName } from '@terracelab/trellis-contracts';
import { useEffect, useRef, useState } from 'react';
import {
  DayPicker,
  type ChevronProps,
  type ClassNames,
  type DayButtonProps,
  type Matcher,
} from 'react-day-picker';
import { enUS, ko } from 'react-day-picker/locale';
import { Icon } from '../Icon/Icon.js';
import { isoToDate } from './date-text.js';
import { useLocale, useMessages } from './locale.js';

const CLASS: Partial<ClassNames> = {
  root: 'tl-calendar',
  months: 'tl-calendar__months',
  month: 'tl-calendar__month',
  month_caption: 'tl-calendar__caption',
  caption_label: 'tl-calendar__caption-label',
  nav: 'tl-calendar__nav',
  button_previous: 'tl-calendar__nav-button tl-focusable',
  button_next: 'tl-calendar__nav-button tl-focusable',
  chevron: 'tl-calendar__chevron',
  month_grid: 'tl-calendar__grid',
  weekdays: 'tl-calendar__weekdays',
  weekday: 'tl-calendar__weekday',
  weeks: 'tl-calendar__weeks',
  week: 'tl-calendar__week',
  day: 'tl-calendar__day',
  day_button: 'tl-calendar__day-button tl-focusable',
  selected: 'tl-calendar__day--selected',
  today: 'tl-calendar__day--today',
  outside: 'tl-calendar__day--outside',
  disabled: 'tl-calendar__day--disabled',
  hidden: 'tl-calendar__day--hidden',
  focused: 'tl-calendar__day--focused',
  range_start: 'tl-calendar__day--range-start',
  range_middle: 'tl-calendar__day--range-middle',
  range_end: 'tl-calendar__day--range-end',
};

function Chevron({ orientation }: ChevronProps) {
  return <Icon name={orientation === 'left' ? 'chevron-left' : 'chevron-right'} />;
}

/**
 * 날 버튼. 이름을 aria-label("2026년 11월 1일")로 덮으면 보이는 글자 "1"이 이름에 없어
 * 음성 입력("1 누르기")이 안 된다(WCAG 2.5.3). 보이는 숫자 뒤에 숨은 글자를 붙여 "1일 일요일, 선택됨"으로 읽힌다.
 * 연 · 월은 격자 이름("2026년 11월")이 알려 준다.
 */
function DayButton({ day, modifiers, children, ...props }: DayButtonProps) {
  const t = useMessages();
  const locale = useLocale();
  // react-day-picker가 주는 aria-label은 버리고 보이는 숫자 + 숨은 글자로 이름을 만든다
  const rest = { ...props, 'aria-label': undefined };
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);
  const extra = [
    t('calendar.daySuffix', { weekday: weekdayName(locale, day.date.getDay(), 'long') }),
    modifiers.today ? t('calendar.today') : null,
    modifiers.selected ? t('calendar.selected') : null,
  ]
    .filter(Boolean)
    .join(', ');
  return (
    <button ref={ref} {...rest}>
      {children}
      <span className="tl-sr-only">{extra}</span>
    </button>
  );
}

interface Common {
  /** 고를 수 있는 첫날 */
  min?: string;
  /** 고를 수 있는 마지막 날 */
  max?: string;
  /** 오늘로 볼 날(데모 · 테스트). 없으면 기기 날짜 */
  today?: string;
  /** 열리자마자 고른 날(없으면 오늘)에 포커스 */
  autoFocus?: boolean;
  onSelect: (iso: string) => void;
}

export type CalendarProps = Common &
  (
    | { mode: 'single'; value: string | null }
    | { mode: 'range'; value: { from: string | null; to: string | null } }
  );

export function Calendar(props: CalendarProps) {
  const locale = useLocale();
  const { min, max, today, autoFocus, onSelect } = props;
  const anchor = props.mode === 'single' ? props.value : (props.value.from ?? props.value.to);
  const todayDate = today ? isoToDate(today) : undefined;
  // 보이는 달: 값이 바뀌면(글자로 친 날짜 포함) 그 달로 간다
  const [month, setMonth] = useState(() =>
    anchor ? isoToDate(anchor) : (todayDate ?? new Date()),
  );
  const [seen, setSeen] = useState(anchor);
  if (anchor !== seen) {
    setSeen(anchor);
    if (anchor) setMonth(isoToDate(anchor));
  }
  const disabled: Matcher[] = [];
  if (min) disabled.push({ before: isoToDate(min) });
  if (max) disabled.push({ after: isoToDate(max) });
  const common = {
    locale: locale === 'en' ? enUS : ko,
    classNames: CLASS,
    components: { Chevron, DayButton },
    showOutsideDays: true,
    fixedWeeks: true,
    month,
    onMonthChange: setMonth,
    today: todayDate,
    disabled,
    autoFocus,
  };
  if (props.mode === 'single') {
    return (
      <DayPicker
        {...common}
        mode="single"
        required
        selected={props.value ? isoToDate(props.value) : undefined}
        onSelect={(_, day) => onSelect(formatDate(day))}
      />
    );
  }
  const { from, to } = props.value;
  return (
    <DayPicker
      {...common}
      mode="range"
      selected={from ? { from: isoToDate(from), to: to ? isoToDate(to) : undefined } : undefined}
      onSelect={(_, day) => onSelect(formatDate(day))}
    />
  );
}
