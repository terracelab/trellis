import {
  ChangeDiffContract,
  type ChangeDiffProps,
  type ChangeDiffRow,
} from '@terracelab/trellis-contracts';
import { useId, useState } from 'react';
import { cx } from '../_internal/cx.js';
import { useMessages, type Translate } from '../_internal/locale.js';
import { Button } from '../Button/Button.js';
import { Icon } from '../Icon/Icon.js';

export type ChangeDiffWebProps = ChangeDiffProps & { className?: string };

/** 값 하나. 비었으면 "–"(숨은 글자 "없음") */
function Value({ value, t }: { value: string | null | undefined; t: Translate }) {
  if (value == null || value === '')
    return (
      <>
        <span aria-hidden>–</span>
        <span className="tl-sr-only">{t('changeDiff.none')}</span>
      </>
    );
  return <>{value}</>;
}

/** 이전 → 이후. 화살표는 꾸밈이고 숨은 글자 "에서"가 읽힌다 */
function Change({ row, t }: { row: ChangeDiffRow; t: Translate }) {
  return (
    <span className="tl-change-diff__change">
      <del className="tl-change-diff__before">
        <Value value={row.before} t={t} />
      </del>
      <Icon name="arrow-right" className="tl-change-diff__arrow" />
      <span className="tl-sr-only"> {t('changeDiff.arrow')} </span>
      <ins className="tl-change-diff__after">
        <Value value={row.after} t={t} />
      </ins>
    </span>
  );
}

export function ChangeDiff({
  rows,
  layout = 'table',
  maxRows,
  empty,
  caption,
  id,
  testID,
  className,
}: ChangeDiffWebProps) {
  const t = useMessages();
  const listId = useId();
  const [expanded, setExpanded] = useState(false);
  const name = caption ?? t('changeDiff.caption');
  const limit = maxRows !== undefined && maxRows >= 0 ? maxRows : rows.length;
  const rest = Math.max(0, rows.length - limit);
  const visible = expanded ? rows : rows.slice(0, limit);
  const hasTarget = rows.some((r) => r.target);

  const common = {
    id,
    'data-testid': testID,
    'data-layout': layout,
  };

  if (rows.length === 0)
    return (
      <div {...common} className={cx('tl-change-diff', className)} data-empty="">
        <p className="tl-change-diff__empty">{empty ?? t('changeDiff.empty')}</p>
      </div>
    );

  const more = rest > 0 && (
    <Button
      className="tl-change-diff__more"
      size="sm"
      variant="ghost"
      iconEnd={expanded ? 'chevron-up' : 'chevron-down'}
      aria-expanded={expanded}
      aria-controls={listId}
      onPress={() => setExpanded((v) => !v)}
    >
      {expanded ? t('changeDiff.less') : t('changeDiff.more', { count: rest })}
    </Button>
  );

  if (layout === 'list')
    return (
      <div {...common} className={cx('tl-change-diff', className)}>
        <ul className="tl-change-diff__list" id={listId} aria-label={name}>
          {visible.map((row, i) => (
            <li key={`${row.target ?? ''}-${row.field}-${i}`} className="tl-change-diff__item">
              <span className="tl-change-diff__lead">
                {row.target ? `${row.target} · ${row.field}` : row.field}
              </span>
              <Change row={row} t={t} />
            </li>
          ))}
        </ul>
        {more}
      </div>
    );

  return (
    <div {...common} className={cx('tl-change-diff', className)}>
      <table className="tl-change-diff__table" id={listId}>
        <caption className="tl-sr-only">{name}</caption>
        <thead>
          <tr>
            {hasTarget && <th scope="col">{t('changeDiff.target')}</th>}
            <th scope="col">{t('changeDiff.field')}</th>
            <th scope="col">{t('changeDiff.change')}</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((row, i) => (
            <tr key={`${row.target ?? ''}-${row.field}-${i}`}>
              {hasTarget && <td className="tl-change-diff__target">{row.target}</td>}
              <td className="tl-change-diff__field">{row.field}</td>
              <td>
                <Change row={row} t={t} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {more}
    </div>
  );
}
ChangeDiff.displayName = ChangeDiffContract.name;
