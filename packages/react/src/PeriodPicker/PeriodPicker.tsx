import {
  DEFAULT_PERIOD_PRESETS,
  dueDays,
  formatDate,
  formatPeriod,
  PERIOD_COMPARE_MODES,
  PeriodPickerContract,
  resolvePeriodCompare,
  resolvePeriodPreset,
  type PeriodCompare,
  type PeriodCompareMode,
  type PeriodPickerProps,
  type PeriodValue,
} from '@terracelab/trellis-contracts';
import { useId, useState } from 'react';
import { Popover as P } from '../_headless/index.js';
import { Calendar } from '../_internal/calendar.js';
import { cx } from '../_internal/cx.js';
import { useDateText } from '../_internal/date-text.js';
import { useFieldControl } from '../_internal/field.js';
import { Sheet, useSheetMode } from '../_internal/sheet.js';
import { Button } from '../Button/Button.js';
import { Icon } from '../Icon/Icon.js';
import { useMessages } from '../_internal/locale.js';

interface Draft {
  from: string | null;
  to: string | null;
}

/** 달력에서 날을 누를 때: 처음 · 기간이 다 찼으면 새 시작, 시작만 있으면 끝(앞날이면 둘을 바꾼다) */
function nextDraft(d: Draft, iso: string): Draft {
  if (!d.from || d.to) return { from: iso, to: null };
  return iso < d.from ? { from: iso, to: d.from } : { from: d.from, to: iso };
}

/** 고른 방식 → 비교 기간. 직접 선택이 덜 찼거나 거꾸로면 undefined(적용할 수 없다) */
function compareFor(
  range: PeriodValue,
  mode: PeriodCompareMode | null,
  custom: Draft,
): PeriodCompare | null | undefined {
  if (mode === null) return null;
  if (mode !== 'custom') return { mode, ...resolvePeriodCompare(range, mode) };
  if (!custom.from || !custom.to || custom.from > custom.to) return undefined;
  return { mode, from: custom.from, to: custom.to };
}

const sameCompare = (a: PeriodCompare | null, b: PeriodCompare | null) =>
  a === b || (a !== null && b !== null && a.mode === b.mode && a.from === b.from && a.to === b.to);

export function PeriodPicker({
  value,
  defaultValue,
  onChange,
  presets = DEFAULT_PERIOD_PRESETS,
  today,
  max,
  maxDays,
  placeholder: placeholderProp,
  label,
  size = 'md',
  disabled,
  compare,
  defaultCompare,
  onCompareChange,
  compareModes = PERIOD_COMPARE_MODES,
  id,
  testID,
  className,
}: PeriodPickerProps & { className?: string }) {
  const t = useMessages();
  const placeholder = placeholderProp ?? t('periodPicker.placeholder');
  const field = useFieldControl({ id, disabled });
  const sheet = useSheetMode();
  const base = useId();
  const [inner, setInner] = useState<PeriodValue | null>(defaultValue ?? null);
  const current = value === undefined ? inner : value;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>({ from: null, to: null });
  // 비교 기간: compare · defaultCompare를 주면(null 포함) 켜진다. 없으면 지금과 같다
  const compareOn = compare !== undefined || defaultCompare !== undefined;
  const [innerCompare, setInnerCompare] = useState<PeriodCompare | null>(defaultCompare ?? null);
  const currentCompare = compare === undefined ? innerCompare : compare;
  const [draftMode, setDraftMode] = useState<PeriodCompareMode | null>(null);
  const [draftCmp, setDraftCmp] = useState<Draft>({ from: null, to: null });
  const day = today ?? formatDate(new Date());
  const items = presets.map((key) => {
    const range = resolvePeriodPreset(key, day);
    // max가 있으면 프리셋 끝을 그날로 줄인다(당월 = 1일~max). 시작부터 max 뒤면 고를 수 없다
    return {
      key,
      label: t(`period.${key}`),
      range: max && range.to > max ? { from: range.from, to: max } : range,
      unavailable: Boolean(max && range.from > max),
    };
  });
  const reversed = Boolean(draft.from && draft.to && draft.from > draft.to);
  const cmpReversed = Boolean(
    compareOn &&
    draftMode === 'custom' &&
    draftCmp.from &&
    draftCmp.to &&
    draftCmp.from > draftCmp.to,
  );
  const compareReady =
    !compareOn || draftMode !== 'custom' || Boolean(draftCmp.from && draftCmp.to && !cmpReversed);
  const ready = Boolean(draft.from && draft.to) && !reversed && compareReady;
  // 시작일 · 종료일을 모두 센다(11-01~11-30 = 30일)
  const days = ready && draft.from && draft.to ? dueDays(draft.to, draft.from) + 1 : null;
  const overMax = days != null && maxDays != null && days > maxDays;
  const fromText = useDateText({
    current: draft.from,
    commit: (from) => setDraft((d) => ({ ...d, from })),
    max,
  });
  const toText = useDateText({
    current: draft.to,
    commit: (to) => setDraft((d) => ({ ...d, to })),
    max,
  });
  const cmpFromText = useDateText({
    current: draftCmp.from,
    commit: (from) => setDraftCmp((d) => ({ ...d, from })),
  });
  const cmpToText = useDateText({
    current: draftCmp.to,
    commit: (to) => setDraftCmp((d) => ({ ...d, to })),
  });
  // max 뒤 날짜를 쳤으면 값에 넣지 않고 안내한다(DateField와 같은 문구)
  const afterMax = Boolean(max && (fromText.outOfRange === 'max' || toText.outOfRange === 'max'));
  const daysText = days != null ? t('periodPicker.days', { n: days }) : null;

  const toggle = (next: boolean) => {
    if (next) {
      setDraft({ from: current?.from ?? null, to: current?.to ?? null });
      setDraftMode(currentCompare?.mode ?? null);
      setDraftCmp(
        currentCompare?.mode === 'custom'
          ? { from: currentCompare.from, to: currentCompare.to }
          : { from: null, to: null },
      );
    }
    setOpen(next);
  };
  const commit = (next: PeriodValue) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
    // 기간이 바뀌면 직전 · 전년 동기도 새 기간으로 다시 계산한다. 직접 고른 비교가 덜 찼으면 그대로 둔다
    if (compareOn) {
      const nextCompare = compareFor(next, draftMode, draftCmp);
      if (nextCompare !== undefined && !sameCompare(nextCompare, currentCompare)) {
        if (compare === undefined) setInnerCompare(nextCompare);
        onCompareChange?.(nextCompare);
      }
    }
    setOpen(false);
  };
  const apply = () => {
    if (draft.from && draft.to && ready) commit({ from: draft.from, to: draft.to });
  };
  const draftRange =
    draft.from && draft.to && !reversed ? { from: draft.from, to: draft.to } : null;
  const previewCompare =
    draftRange && draftMode && draftMode !== 'custom'
      ? resolvePeriodCompare(draftRange, draftMode)
      : null;

  const presetList = (
    <div className="tl-period-picker__presets" role="group" aria-label={t('periodPicker.presets')}>
      {items.map((it) => {
        const active = current?.from === it.range.from && current?.to === it.range.to;
        return (
          <button
            key={it.key}
            type="button"
            className="tl-period-picker__preset tl-focusable"
            aria-pressed={active}
            disabled={it.unavailable}
            onClick={() => commit(it.range)}
          >
            <span className="tl-period-picker__preset-label">{it.label}</span>
            <span className="tl-period-picker__preset-range">
              {formatPeriod(it.range.from, it.range.to)}
            </span>
          </button>
        );
      })}
    </div>
  );

  const custom = (
    <div className="tl-period-picker__custom">
      <div className="tl-period-picker__dates">
        <span className="tl-date-field" data-size="sm" data-state={reversed ? 'error' : undefined}>
          <input
            value={fromText.value}
            onChange={fromText.onChange}
            onBlur={fromText.onBlur}
            className="tl-date-field__control"
            id={`${base}-from`}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={10}
            placeholder={t('periodPicker.from')}
            aria-label={t('periodPicker.from')}
            aria-invalid={reversed || fromText.outOfRange === 'max' || undefined}
            aria-describedby={fromText.outOfRange === 'max' ? `${base}-max` : undefined}
          />
        </span>
        <span className="tl-period-picker__tilde" aria-hidden="true">
          ~
        </span>
        <span className="tl-date-field" data-size="sm" data-state={reversed ? 'error' : undefined}>
          <input
            value={toText.value}
            onChange={toText.onChange}
            onBlur={toText.onBlur}
            className="tl-date-field__control"
            id={`${base}-to`}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={10}
            placeholder={t('periodPicker.to')}
            aria-label={t('periodPicker.to')}
            aria-invalid={reversed || toText.outOfRange === 'max' || undefined}
            aria-describedby={
              [reversed ? `${base}-error` : '', toText.outOfRange === 'max' ? `${base}-max` : '']
                .filter(Boolean)
                .join(' ') || undefined
            }
          />
        </span>
      </div>
      <Calendar
        mode="range"
        value={draft}
        today={today}
        max={max}
        onSelect={(iso) => setDraft((d) => nextDraft(d, iso))}
      />
      {reversed && (
        <p className="tl-period-picker__error" id={`${base}-error`} role="alert">
          <Icon name="circle-alert" className="tl-period-picker__error-icon" />
          {t('periodPicker.reversed')}
        </p>
      )}
      {afterMax && max && (
        <p className="tl-period-picker__error" id={`${base}-max`} role="alert">
          <Icon name="circle-alert" className="tl-period-picker__error-icon" />
          {t('dateField.beforeMax', { date: formatDate(max) })}
        </p>
      )}
      {/* 권장 일수를 넘어도 적용은 된다. 오래 걸릴 수 있다는 안내만 */}
      {overMax && (
        <p className="tl-period-picker__warning" role="status">
          <Icon name="triangle-alert" className="tl-period-picker__warning-icon" />
          {t('periodPicker.overMaxDays', { max: maxDays })}
        </p>
      )}
      {compareOn && (
        <div
          className="tl-period-picker__compare"
          role="group"
          aria-label={t('periodPicker.compare')}
        >
          <div className="tl-period-picker__compare-head">
            <span className="tl-period-picker__compare-label" aria-hidden="true">
              {t('periodPicker.compare')}
            </span>
            {previewCompare && (
              <span className="tl-period-picker__compare-range">
                {formatPeriod(previewCompare.from, previewCompare.to)}
              </span>
            )}
          </div>
          <div className="tl-period-picker__compare-modes">
            {[null, ...compareModes].map((mode) => (
              <button
                key={mode ?? 'none'}
                type="button"
                className="tl-period-picker__compare-mode tl-focusable"
                aria-pressed={draftMode === mode}
                onClick={() => setDraftMode(mode)}
              >
                {mode ? t(`periodCompare.${mode}`) : t('periodPicker.compareNone')}
              </button>
            ))}
          </div>
          {draftMode === 'custom' && (
            <div className="tl-period-picker__dates">
              <span
                className="tl-date-field"
                data-size="sm"
                data-state={cmpReversed ? 'error' : undefined}
              >
                <input
                  value={cmpFromText.value}
                  onChange={cmpFromText.onChange}
                  onBlur={cmpFromText.onBlur}
                  className="tl-date-field__control"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={10}
                  placeholder={t('periodPicker.compareFrom')}
                  aria-label={t('periodPicker.compareFrom')}
                  aria-invalid={cmpReversed || undefined}
                />
              </span>
              <span className="tl-period-picker__tilde" aria-hidden="true">
                ~
              </span>
              <span
                className="tl-date-field"
                data-size="sm"
                data-state={cmpReversed ? 'error' : undefined}
              >
                <input
                  value={cmpToText.value}
                  onChange={cmpToText.onChange}
                  onBlur={cmpToText.onBlur}
                  className="tl-date-field__control"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={10}
                  placeholder={t('periodPicker.compareTo')}
                  aria-label={t('periodPicker.compareTo')}
                  aria-invalid={cmpReversed || undefined}
                  aria-describedby={cmpReversed ? `${base}-cmp-error` : undefined}
                />
              </span>
            </div>
          )}
          {cmpReversed && (
            <p className="tl-period-picker__error" id={`${base}-cmp-error`} role="alert">
              <Icon name="circle-alert" className="tl-period-picker__error-icon" />
              {t('periodPicker.reversed')}
            </p>
          )}
        </div>
      )}
      {!sheet && (
        <div className="tl-period-picker__actions">
          {daysText && <span className="tl-period-picker__days">{daysText}</span>}
          <Button variant="primary" size="sm" disabled={!ready} onPress={apply}>
            {t('common.apply')}
          </Button>
        </div>
      )}
    </div>
  );

  const compareText =
    compareOn && currentCompare
      ? t('periodPicker.compareValue', {
          range: formatPeriod(currentCompare.from, currentCompare.to),
        })
      : '';
  const triggerProps = {
    className: cx('tl-period-picker', 'tl-focusable', className),
    id: field.id,
    'data-testid': testID,
    'data-size': size,
    'data-state': field.invalid ? 'error' : field.disabled ? 'disabled' : undefined,
    disabled: field.disabled,
    'aria-invalid': field.invalid || undefined,
    'aria-describedby': field.describedBy,
    // Field 밖이면 이름 + 지금 기간(+ 비교 기간)을 함께 읽는다(버튼은 aria-label이 내용을 덮는다)
    'aria-label':
      label && !field.labelId
        ? [label, current ? formatPeriod(current.from, current.to) : placeholder, compareText]
            .filter(Boolean)
            .join(' ')
        : undefined,
  };
  const triggerBody = (
    <>
      <Icon name="calendar" className="tl-period-picker__icon" />
      <span className="tl-period-picker__value" data-placeholder={!current || undefined}>
        {current ? formatPeriod(current.from, current.to) : placeholder}
        {compareText && <span className="tl-period-picker__compare-value"> {compareText}</span>}
      </span>
      <Icon name="chevron-down" className="tl-period-picker__chevron" />
    </>
  );

  if (sheet) {
    return (
      <>
        <button
          {...triggerProps}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          data-popup-open={open || undefined}
          onClick={() => toggle(true)}
        >
          {triggerBody}
        </button>
        <Sheet
          open={open}
          onOpenChange={toggle}
          title={t('periodPicker.title')}
          className="tl-period-picker__sheet"
          footer={
            <>
              {daysText && <span className="tl-period-picker__days">{daysText}</span>}
              <Button variant="primary" disabled={!ready} onPress={apply}>
                {ready && draft.from && draft.to
                  ? t('periodPicker.applyRange', { range: formatPeriod(draft.from, draft.to) })
                  : t('common.apply')}
              </Button>
            </>
          }
        >
          {presetList}
          {custom}
        </Sheet>
      </>
    );
  }

  return (
    <P.Root open={open} onOpenChange={toggle}>
      <P.Trigger {...triggerProps}>{triggerBody}</P.Trigger>
      <P.Portal>
        <P.Positioner className="tl-period-picker__positioner" sideOffset={4} align="start">
          <P.Popup className="tl-period-picker__popup" aria-label={t('periodPicker.title')}>
            {presetList}
            {custom}
          </P.Popup>
        </P.Positioner>
      </P.Portal>
    </P.Root>
  );
}
PeriodPicker.displayName = PeriodPickerContract.name;
