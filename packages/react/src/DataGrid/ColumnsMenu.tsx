// 열 설정: 보이기 · 숨기기, 순서(위로 · 아래로), 처음 상태로. 끌어 옮기기 대신 단추라 키보드 · 터치가 같다.
import type { DataGridColumnState } from '@terracelab/trellis-contracts';
import { useLayoutEffect, useRef, useState } from 'react';
import { Popover as P } from '../_headless/index.js';
import { useMessages } from '../_internal/locale.js';
import { Icon } from '../Icon/Icon.js';

export interface ColumnsMenuProps {
  columns: readonly { key: string; header: string; hideable?: boolean }[];
  state: DataGridColumnState;
  onChange: (state: DataGridColumnState) => void;
  onReset: () => void;
}

export function ColumnsMenu({ columns, state, onChange, onReset }: ColumnsMenuProps) {
  const t = useMessages();
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  // 옮긴 뒤에도 같은 열의 같은 단추에 포커스를 둔다(끝에 닿아 꺼지면 반대 단추)
  const refocus = useRef<{ key: string; dir: 'up' | 'down' } | null>(null);
  const byKey = new Map(columns.map((c) => [c.key, c]));
  const hidden = new Set(state.hidden);
  const shownCount = state.order.length - hidden.size;

  useLayoutEffect(() => {
    const want = refocus.current;
    if (!want || !listRef.current) return;
    refocus.current = null;
    const buttons = [...listRef.current.querySelectorAll<HTMLButtonElement>('[data-move]')];
    const pick = (dir: string) =>
      buttons.find((b) => b.dataset.key === want.key && b.dataset.move === dir && !b.disabled);
    (pick(want.dir) ?? pick(want.dir === 'up' ? 'down' : 'up'))?.focus();
  });

  const move = (key: string, dir: 'up' | 'down') => {
    const order = [...state.order];
    const i = order.indexOf(key);
    const j = dir === 'up' ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j]!, order[i]!];
    refocus.current = { key, dir };
    onChange({ order, hidden: state.hidden });
  };
  const toggle = (key: string) =>
    onChange({
      order: state.order,
      hidden: hidden.has(key) ? state.hidden.filter((k) => k !== key) : [...state.hidden, key],
    });

  return (
    <P.Root open={open} onOpenChange={setOpen}>
      <P.Trigger
        className="tl-data-grid__settings tl-focusable"
        aria-label={t('dataGrid.columns')}
        title={t('dataGrid.columns')}
      >
        <Icon name="columns-3" size={16} />
      </P.Trigger>
      <P.Portal>
        <P.Positioner className="tl-data-grid__popover-positioner" sideOffset={4} align="end">
          <P.Popup className="tl-data-grid__popover" aria-label={t('dataGrid.columns')}>
            <P.Title className="tl-data-grid__popover-title">{t('dataGrid.columns')}</P.Title>
            <ul ref={listRef} className="tl-data-grid__column-list">
              {state.order.map((key, i) => {
                const col = byKey.get(key);
                if (!col) return null;
                const visible = !hidden.has(key);
                // 마지막 남은 열과 숨길 수 없는 열은 끌 수 없다
                const locked = col.hideable === false || (visible && shownCount <= 1);
                return (
                  <li key={key} className="tl-data-grid__column-item">
                    <label className="tl-data-grid__choice">
                      <input
                        type="checkbox"
                        className="tl-data-grid__check tl-focusable"
                        checked={visible}
                        disabled={locked}
                        onChange={() => toggle(key)}
                      />
                      <span className="tl-data-grid__choice-label">{col.header}</span>
                    </label>
                    <span className="tl-data-grid__column-move">
                      <button
                        type="button"
                        className="tl-data-grid__move tl-focusable"
                        data-move="up"
                        data-key={key}
                        aria-label={t('dataGrid.moveUp', { column: col.header })}
                        disabled={i === 0}
                        onClick={() => move(key, 'up')}
                      >
                        <Icon name="chevron-up" size={16} />
                      </button>
                      <button
                        type="button"
                        className="tl-data-grid__move tl-focusable"
                        data-move="down"
                        data-key={key}
                        aria-label={t('dataGrid.moveDown', { column: col.header })}
                        disabled={i === state.order.length - 1}
                        onClick={() => move(key, 'down')}
                      >
                        <Icon name="chevron-down" size={16} />
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="tl-data-grid__popover-foot">
              <button
                type="button"
                className="tl-data-grid__popover-link tl-focusable"
                onClick={onReset}
              >
                {t('dataGrid.resetColumns')}
              </button>
            </div>
          </P.Popup>
        </P.Positioner>
      </P.Portal>
    </P.Root>
  );
}
