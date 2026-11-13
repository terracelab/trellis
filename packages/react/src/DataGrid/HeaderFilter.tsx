// 머리 칸 필터. text = 포함하는 글자, values = 행에 나온 값 고르기. 받은 행 안에서만 거른다(서버 검색은 FilterBar).
import { formatAmount, type DataGridFilterValue } from '@terracelab/trellis-contracts';
import { useId, useMemo, useState } from 'react';
import { Popover as P } from '../_headless/index.js';
import { useMessages } from '../_internal/locale.js';
import { Icon } from '../Icon/Icon.js';
import { isActiveFilter, type ValueChoice } from './model.js';

export interface HeaderFilterProps {
  header: string;
  kind: 'text' | 'values';
  value: DataGridFilterValue | undefined;
  /** values 필터의 고를 거리(필터 전 행 기준) */
  choices: () => ValueChoice[];
  onChange: (value: DataGridFilterValue | undefined) => void;
}

const SEARCH_FROM = 8;

export function HeaderFilter({ header, kind, value, choices, onChange }: HeaderFilterProps) {
  const t = useMessages();
  const [open, setOpen] = useState(false);
  const active = isActiveFilter(value);
  const label = active
    ? t('dataGrid.filterActive', { column: header })
    : t('dataGrid.filter', { column: header });
  return (
    <P.Root open={open} onOpenChange={setOpen}>
      <P.Trigger
        className="tl-data-grid__filter tl-focusable"
        data-active={active || undefined}
        aria-label={label}
        title={label}
      >
        <Icon name="filter" size={16} />
      </P.Trigger>
      <P.Portal>
        <P.Positioner className="tl-data-grid__popover-positioner" sideOffset={4} align="start">
          <P.Popup
            className="tl-data-grid__popover"
            aria-label={t('dataGrid.filter', { column: header })}
          >
            {open &&
              (kind === 'text' ? (
                <TextFilter value={value} onChange={onChange} />
              ) : (
                <ValuesFilter value={value} choices={choices} onChange={onChange} />
              ))}
            {active && (
              <div className="tl-data-grid__popover-foot">
                <button
                  type="button"
                  className="tl-data-grid__popover-link tl-focusable"
                  onClick={() => {
                    onChange(undefined);
                    setOpen(false);
                  }}
                >
                  {t('dataGrid.filterClear')}
                </button>
              </div>
            )}
          </P.Popup>
        </P.Positioner>
      </P.Portal>
    </P.Root>
  );
}

function TextFilter({ value, onChange }: Pick<HeaderFilterProps, 'value' | 'onChange'>) {
  const t = useMessages();
  const id = useId();
  return (
    <div className="tl-data-grid__popover-body">
      <label className="tl-data-grid__popover-label" htmlFor={id}>
        {t('dataGrid.filterContains')}
      </label>
      <input
        id={id}
        type="search"
        className="tl-data-grid__popover-input"
        autoFocus
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.currentTarget.value === '' ? undefined : e.currentTarget.value)}
      />
    </div>
  );
}

function ValuesFilter({
  value,
  choices,
  onChange,
}: Pick<HeaderFilterProps, 'value' | 'choices' | 'onChange'>) {
  const t = useMessages();
  const all = useMemo(choices, [choices]);
  const [query, setQuery] = useState('');
  const searchId = useId();
  const picked = new Set(Array.isArray(value) ? value : all.map((c) => c.value));
  const allPicked = all.every((c) => picked.has(c.value));
  const somePicked = !allPicked && all.some((c) => picked.has(c.value));
  const shown = query
    ? all.filter((c) =>
        c.label.toLocaleLowerCase('ko-KR').includes(query.toLocaleLowerCase('ko-KR')),
      )
    : all;
  const toggle = (v: string) => {
    const next = new Set(picked);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    // 다 고르면 필터가 없는 것과 같다
    onChange(
      all.every((c) => next.has(c.value))
        ? undefined
        : all.map((c) => c.value).filter((x) => next.has(x)),
    );
  };
  return (
    <div className="tl-data-grid__popover-body">
      {all.length > SEARCH_FROM && (
        <>
          <label className="tl-sr-only" htmlFor={searchId}>
            {t('dataGrid.filterSearch')}
          </label>
          <input
            id={searchId}
            type="search"
            className="tl-data-grid__popover-input"
            placeholder={t('dataGrid.filterSearch')}
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
          />
        </>
      )}
      {!query && (
        <label className="tl-data-grid__choice" data-all>
          <input
            type="checkbox"
            className="tl-data-grid__check tl-focusable"
            checked={allPicked}
            ref={(el) => {
              if (el) el.indeterminate = somePicked;
            }}
            onChange={() => onChange(allPicked ? [] : undefined)}
          />
          <span className="tl-data-grid__choice-label">{t('common.all')}</span>
        </label>
      )}
      <div className="tl-data-grid__choices">
        {shown.map((c) => (
          <label key={c.value} className="tl-data-grid__choice">
            <input
              type="checkbox"
              className="tl-data-grid__check tl-focusable"
              checked={picked.has(c.value)}
              onChange={() => toggle(c.value)}
            />
            <span className="tl-data-grid__choice-label">{c.value === '' ? '–' : c.label}</span>
            <span className="tl-data-grid__choice-count">{formatAmount(c.count)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
