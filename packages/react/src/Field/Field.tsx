import { FieldContract, type FieldProps } from '@terracelab/trellis-contracts';
import { useCallback, useId, useState, type ReactNode } from 'react';
import { cx } from '../_internal/cx.js';
import { FieldContext } from '../_internal/field.js';
import { Icon } from '../Icon/Icon.js';
import { useMessages } from '../_internal/locale.js';

export function Field({
  label,
  required = false,
  help,
  error,
  layout = 'vertical',
  disabled = false,
  span = 1,
  children,
  id,
  testID,
  className,
}: Omit<FieldProps, 'children'> & { children?: ReactNode; className?: string }) {
  const t = useMessages();
  const auto = useId();
  const controlId = id ?? `${auto}-control`;
  const noteId = `${auto}-note`;
  const labelId = `${auto}-label`;
  // 입력 부품이 스스로 찾은 오류(useFieldMessage). error prop이 있으면 그것이 이긴다
  const [reported, setReported] = useState<Readonly<Record<string, string>>>({});
  const report = useCallback((key: string, message: string | null) => {
    setReported((prev) => {
      if ((prev[key] ?? null) === message) return prev;
      const next = { ...prev };
      if (message === null) delete next[key];
      else next[key] = message;
      return next;
    });
  }, []);
  const own = error ? undefined : Object.values(reported)[0];
  const shown = error || own;
  const invalid = Boolean(shown);
  const note = invalid ? shown : help;
  return (
    <div
      className={cx('tl-field', className)}
      data-testid={testID}
      data-layout={layout}
      data-span={span}
      data-state={invalid ? 'error' : disabled ? 'disabled' : undefined}
    >
      <label className="tl-field__label" htmlFor={controlId} id={labelId}>
        {label}
        {required && (
          <>
            <span className="tl-field__required" aria-hidden />
            <span className="tl-sr-only">{t('common.required')}</span>
          </>
        )}
      </label>
      <div className="tl-field__control">
        <FieldContext.Provider
          value={{
            id: controlId,
            labelId,
            labelText: label,
            describedBy: note ? noteId : undefined,
            invalid,
            required,
            disabled,
            report,
          }}
        >
          {children}
        </FieldContext.Provider>
        {note && (
          <p
            className="tl-field__note"
            id={noteId}
            data-kind={invalid ? 'error' : 'help'}
            // 입력하는 도중에 생긴 오류는 바로 읽어 준다(error prop 오류는 포커스할 때 설명으로 읽는다)
            role={own ? 'alert' : undefined}
          >
            {invalid && <Icon name="circle-alert" className="tl-field__note-icon" />}
            {note}
          </p>
        )}
      </div>
    </div>
  );
}
Field.displayName = FieldContract.name;
