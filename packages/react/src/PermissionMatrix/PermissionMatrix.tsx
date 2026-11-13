import {
  applyPermission,
  PermissionMatrixContract,
  type PermissionMatrixProps,
  type PermissionValue,
} from '@terracelab/trellis-contracts';
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { Icon } from '../Icon/Icon.js';
import { ModuleIcon } from '../ModuleIcon/ModuleIcon.js';
import { RadioGroup } from '../RadioGroup/RadioGroup.js';

export type PermissionMatrixWebProps = PermissionMatrixProps & { className?: string };

const EMPTY: PermissionValue = {};

/**
 * 권한 표: 줄 = 대상(모듈 · 화면), 열 = 동작, 칸 = 체크. 범위(scopes)가 있으면 표 위에 데이터 범위 고르기.
 * 격자(role=grid) 하나가 탭 정류장 하나다. 화살표 · Home · End로 칸을 옮기고 Space로 켜고 끈다(requires를 따른다)
 */
export function PermissionMatrix({
  label,
  resources,
  actions,
  value,
  defaultValue,
  onChange,
  resourceHeader,
  scopes,
  scope,
  defaultScope = null,
  onScopeChange,
  readOnly = false,
  disabled = false,
  id,
  testID,
  className,
}: PermissionMatrixWebProps) {
  const t = useMessages();
  const [inner, setInner] = useState<PermissionValue>(defaultValue ?? EMPTY);
  const current = value ?? inner;
  const [innerScope, setInnerScope] = useState<string | null>(defaultScope);
  const shownScope = scope !== undefined ? scope : innerScope;
  const [pos, setPos] = useState<[number, number]>([0, 0]);
  const grid = useRef<HTMLDivElement>(null);
  const moved = useRef(false);
  const rows = resources.length;
  const cols = actions.length;
  const at: [number, number] = [
    Math.max(0, Math.min(pos[0], rows - 1)),
    Math.max(0, Math.min(pos[1], cols - 1)),
  ];
  const cellKey = `${at[0]}:${at[1]}`;

  // 키보드로 옮겼을 때만 새 칸에 초점(렌더 · 누름으로는 초점을 뺏지 않는다)
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    grid.current?.querySelector<HTMLElement>(`[data-cell="${cellKey}"]`)?.focus();
  }, [cellKey]);

  const granted = (r: string, a: string) => current[r]?.includes(a) ?? false;
  const toggle = (ri: number, ci: number) => {
    const r = resources[ri];
    const a = actions[ci];
    if (!r || !a || readOnly || disabled || r.disabled) return;
    const on = !granted(r.id, a.id);
    const next = applyPermission(current, actions, r.id, a.id, on);
    if (value === undefined) setInner(next);
    onChange?.(next, { resource: r.id, action: a.id, granted: on });
  };
  const onKey = (e: KeyboardEvent<HTMLElement>, ri: number, ci: number) => {
    const ctrl = e.ctrlKey || e.metaKey;
    const moves: Record<string, () => [number, number]> = {
      ArrowLeft: () => [ri, Math.max(0, ci - 1)],
      ArrowRight: () => [ri, Math.min(cols - 1, ci + 1)],
      ArrowUp: () => [Math.max(0, ri - 1), ci],
      ArrowDown: () => [Math.min(rows - 1, ri + 1), ci],
      Home: () => (ctrl ? [0, 0] : [ri, 0]),
      End: () => (ctrl ? [rows - 1, cols - 1] : [ri, cols - 1]),
    };
    const move = moves[e.key];
    if (move) {
      e.preventDefault();
      moved.current = true;
      setPos(move());
      return;
    }
    if (readOnly) return;
    if (e.key === ' ' || e.key === 'Enter') {
      // 버튼 기본 동작(누름)과 겹치지 않게 키에서 바로 바꾼다
      e.preventDefault();
      toggle(ri, ci);
    }
  };
  const scopeName = scopes?.find((s) => s.value === shownScope)?.label;

  return (
    <div
      className={cx('tl-permission-matrix', className)}
      id={id}
      data-testid={testID}
      data-readonly={readOnly || undefined}
      data-state={disabled ? 'disabled' : undefined}
    >
      {scopes && scopes.length > 0 && (
        <div className="tl-permission-matrix__scope">
          {readOnly ? (
            <p className="tl-permission-matrix__scope-text">
              <span className="tl-permission-matrix__scope-label">
                {t('permissionMatrix.scope')}
              </span>{' '}
              <span className="tl-permission-matrix__scope-value">{scopeName ?? '–'}</span>
            </p>
          ) : (
            <>
              <span className="tl-permission-matrix__scope-label" aria-hidden="true">
                {t('permissionMatrix.scope')}
              </span>
              <RadioGroup
                label={t('permissionMatrix.scope')}
                orientation="horizontal"
                value={shownScope}
                disabled={disabled}
                onChange={(v) => {
                  if (scope === undefined) setInnerScope(v);
                  onScopeChange?.(v);
                }}
                options={scopes.map((s) => ({ value: s.value, label: s.label }))}
              />
            </>
          )}
        </div>
      )}
      <div className="tl-permission-matrix__scroll">
        <div
          ref={grid}
          className="tl-permission-matrix__grid"
          role="grid"
          aria-label={label}
          aria-readonly={readOnly || undefined}
          aria-disabled={disabled || undefined}
          style={{ '--tl-permission-matrix-cols': cols } as CSSProperties}
        >
          <div className="tl-permission-matrix__row tl-permission-matrix__head" role="row">
            <span role="columnheader" className="tl-permission-matrix__resource">
              {resourceHeader ?? t('permissionMatrix.resource')}
            </span>
            {actions.map((a) => (
              <span key={a.id} role="columnheader" className="tl-permission-matrix__action">
                {a.label}
              </span>
            ))}
          </div>
          {resources.map((r, ri) => {
            const none = actions.every((a) => !granted(r.id, a.id));
            const locked = disabled || Boolean(r.disabled);
            return (
              <div
                key={r.id}
                className="tl-permission-matrix__row"
                role="row"
                data-disabled={r.disabled || undefined}
              >
                <span role="rowheader" className="tl-permission-matrix__resource">
                  {r.module ? (
                    <ModuleIcon module={r.module} size={32} decorative />
                  ) : (
                    r.icon && (
                      <span className="tl-permission-matrix__icon">
                        <Icon name={r.icon} />
                      </span>
                    )
                  )}
                  <span className="tl-permission-matrix__text">
                    <span className="tl-permission-matrix__label">{r.label}</span>
                    {(r.description || none) && (
                      <span className="tl-permission-matrix__description">
                        {r.description ?? t('permissionMatrix.none')}
                      </span>
                    )}
                  </span>
                </span>
                {actions.map((a, ci) => {
                  const on = granted(r.id, a.id);
                  const stop = ri === at[0] && ci === at[1];
                  const name = t('permissionMatrix.cell', { resource: r.label, action: a.label });
                  if (readOnly)
                    return (
                      <span
                        key={a.id}
                        role="gridcell"
                        className="tl-permission-matrix__cell tl-focusable"
                        data-cell={`${ri}:${ci}`}
                        data-on={on || undefined}
                        tabIndex={stop ? 0 : -1}
                        onFocus={() => setPos([ri, ci])}
                        onKeyDown={(e) => onKey(e, ri, ci)}
                      >
                        {on ? (
                          <Icon name="check" className="tl-permission-matrix__mark" />
                        ) : (
                          <span className="tl-permission-matrix__dash" aria-hidden="true">
                            –
                          </span>
                        )}
                        <span className="tl-sr-only">
                          {on ? t('permissionMatrix.granted') : t('permissionMatrix.denied')}
                        </span>
                      </span>
                    );
                  return (
                    <span key={a.id} role="gridcell" className="tl-permission-matrix__cell">
                      <button
                        type="button"
                        role="checkbox"
                        className="tl-permission-matrix__box tl-focusable"
                        data-cell={`${ri}:${ci}`}
                        aria-checked={on}
                        aria-label={name}
                        aria-disabled={locked || undefined}
                        data-checked={on || undefined}
                        data-disabled={locked || undefined}
                        tabIndex={stop ? 0 : -1}
                        onFocus={() => setPos([ri, ci])}
                        onKeyDown={(e) => onKey(e, ri, ci)}
                        onClick={() => toggle(ri, ci)}
                      >
                        {on && <Icon name="check" size={16} />}
                      </button>
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
PermissionMatrix.displayName = PermissionMatrixContract.name;
