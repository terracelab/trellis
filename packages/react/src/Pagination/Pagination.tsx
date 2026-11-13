import {
  formatAmount,
  PaginationContract,
  type PaginationProps,
} from '@terracelab/trellis-contracts';
import { useId } from 'react';
import { cx } from '../_internal/cx.js';
import { IconButton } from '../IconButton/IconButton.js';
import { Select } from '../Select/Select.js';
import { useMessages } from '../_internal/locale.js';

const MAX_SLOTS = 7;

/** 번호 칸 최대 7개(생략 포함): 1 2 3 4 5 … 62 · 1 … 4 5 6 … 62 · 1 … 58 59 60 61 62 */
export function paginationItems(page: number, count: number): (number | 'gap')[] {
  if (count <= MAX_SLOTS) return Array.from({ length: count }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, 'gap', count];
  if (page >= count - 3) return [1, 'gap', count - 4, count - 3, count - 2, count - 1, count];
  return [1, 'gap', page - 1, page, page + 1, 'gap', count];
}

export function Pagination({
  page,
  pageCount,
  total,
  pageSize = 20,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
  showTotal = true,
  disabled = false,
  id,
  testID,
  className,
}: PaginationProps & { className?: string }) {
  const t = useMessages();
  const sizeId = useId();
  const count = Math.max(1, pageCount ?? Math.ceil((total ?? 0) / Math.max(1, pageSize)));
  const current = Math.min(Math.max(1, Math.floor(page)), count);
  const go = (next: number) => {
    if (disabled || next === current || next < 1 || next > count) return;
    onPageChange(next);
  };
  const atStart = disabled || current === 1;
  const atEnd = disabled || current === count;

  return (
    <nav
      className={cx('tl-pagination', className)}
      id={id}
      data-testid={testID}
      data-state={disabled ? 'disabled' : undefined}
      aria-label={t('pagination.label')}
    >
      <div className="tl-pagination__total">
        {showTotal && total != null && (
          <>
            {t('pagination.total')}{' '}
            <span className="tl-pagination__count">
              {t('common.items', { count: formatAmount(total) })}
            </span>
          </>
        )}
      </div>
      <div className="tl-pagination__pages">
        <IconButton
          icon="chevrons-left"
          label={t('pagination.first')}
          disabled={atStart}
          onPress={() => go(1)}
        />
        <IconButton
          icon="chevron-left"
          label={t('pagination.prev')}
          disabled={atStart}
          onPress={() => go(current - 1)}
        />
        <ul className="tl-pagination__list">
          {paginationItems(current, count).map((item, i) =>
            item === 'gap' ? (
              <li key={`gap-${i}`} className="tl-pagination__ellipsis" aria-hidden>
                …
              </li>
            ) : (
              <li key={item}>
                <button
                  type="button"
                  className="tl-pagination__page tl-focusable"
                  aria-current={item === current ? 'page' : undefined}
                  disabled={disabled}
                  onClick={() => go(item)}
                >
                  {formatAmount(item)}
                </button>
              </li>
            ),
          )}
        </ul>
        {/* 휴대폰: 번호 대신 "3 / 12"(CSS가 바꾼다) */}
        <span className="tl-pagination__of" aria-hidden>
          {formatAmount(current)} / {formatAmount(count)}
        </span>
        <IconButton
          icon="chevron-right"
          label={t('pagination.next')}
          disabled={atEnd}
          onPress={() => go(current + 1)}
        />
        <IconButton
          icon="chevrons-right"
          label={t('pagination.last')}
          disabled={atEnd}
          onPress={() => go(count)}
        />
      </div>
      <div className="tl-pagination__size">
        {pageSizeOptions && pageSizeOptions.length > 0 && (
          <>
            <label className="tl-sr-only" htmlFor={sizeId}>
              {t('pagination.pageSize')}
            </label>
            <Select
              id={sizeId}
              size="sm"
              width="auto"
              disabled={disabled}
              value={String(pageSize)}
              options={pageSizeOptions.map((n) => ({
                value: String(n),
                label: t('pagination.perPage', { count: formatAmount(n) }),
              }))}
              onChange={(v) => {
                if (v != null) onPageSizeChange?.(Number(v));
              }}
            />
          </>
        )}
      </div>
    </nav>
  );
}
Pagination.displayName = PaginationContract.name;
