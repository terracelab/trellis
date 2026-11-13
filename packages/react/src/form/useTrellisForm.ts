// react-hook-form 어댑터(PR-09). Trellis 입력은 모두 value · onChange(value)라 bind() 하나로 잇는다.
// zod는 의존성이 아니다: safeParseAsync가 있는 스키마면 무엇이든 schema로 받는다(zod 3 · 4).
import { useCallback, useId, useRef, type BaseSyntheticEvent } from 'react';
import {
  get,
  useForm,
  type FieldErrors,
  type FieldPath,
  type FieldPathValue,
  type FieldValues,
  type Resolver,
  type SubmitErrorHandler,
  type SubmitHandler,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';
import type { DateFieldOutOfRange, ErrorSummaryItem } from '@terracelab/trellis-contracts';
import { focusField } from '../ErrorSummary/ErrorSummary.js';

/** safeParseAsync가 있는 스키마(zod 3 · 4, 같은 모양의 다른 검증기) */
export interface SchemaLike<T> {
  safeParseAsync(data: unknown): Promise<
    | { success: true; data: T }
    | {
        success: false;
        error: { issues: readonly { path: readonly PropertyKey[]; message: string }[] };
      }
  >;
}

function setPath(target: Record<string, unknown>, path: string[], value: unknown) {
  let node = target;
  path.forEach((key, i) => {
    if (i === path.length - 1) node[key] = value;
    else {
      node[key] ??= /^\d+$/.test(path[i + 1] ?? '') ? [] : {};
      node = node[key] as Record<string, unknown>;
    }
  });
}

/** 스키마 → react-hook-form resolver. 칸마다 첫 오류만 남긴다 */
export function schemaResolver<T extends FieldValues>(schema: SchemaLike<T>): Resolver<T> {
  return async (values) => {
    const result = await schema.safeParseAsync(values);
    if (result.success) return { values: result.data, errors: {} };
    const errors: Record<string, unknown> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.map(String);
      if (path.length === 0 || get(errors, path.join('.'))) continue;
      setPath(errors, path, { type: 'schema', message: issue.message });
    }
    return { values: {}, errors: errors as FieldErrors<T> };
  };
}

/** 오류 객체를 칸 이름 · 문장 목록으로 편다(중첩 · 배열 칸 포함) */
function flattenErrors(
  errors: unknown,
  prefix = '',
  out: { name: string; message: string }[] = [],
) {
  if (!errors || typeof errors !== 'object') return out;
  const e = errors as Record<string, unknown>;
  if (typeof e['message'] === 'string' && prefix) {
    out.push({ name: prefix, message: e['message'] });
    return out;
  }
  for (const [k, v] of Object.entries(e)) {
    if (k === 'ref' || k === 'type' || k === 'types' || k === 'root') continue;
    flattenErrors(v, prefix ? `${prefix}.${k}` : k, out);
  }
  return out;
}

export interface TrellisFormOptions<T extends FieldValues> extends UseFormProps<T> {
  /** 검증 스키마(zod 등). resolver를 직접 주면 그쪽이 이긴다 */
  schema?: SchemaLike<T>;
}

export interface TrellisFieldProps {
  /** Field의 id = 입력 요소 id. ErrorSummary 링크가 여기로 온다 */
  id: string;
  label: string;
  error?: string;
}

export interface TrellisFormReturn<T extends FieldValues> extends UseFormReturn<T> {
  /** <Field {...form.field('party', '거래처')}>: label · id · error를 한 번에 */
  field: (name: FieldPath<T>, label: string) => TrellisFieldProps;
  /** Trellis 입력에 값 잇기: <Select {...form.bind('currency')} /> */
  bind: <N extends FieldPath<T>>(
    name: N,
  ) => { name: N; value: FieldPathValue<T, N>; onChange: (value: FieldPathValue<T, N>) => void };
  /** Checkbox · Switch: checked로 잇는다 */
  bindChecked: <N extends FieldPath<T>>(
    name: N,
  ) => { name: N; checked: boolean; onChange: (checked: boolean) => void };
  /**
   * DateField: bind에 onOutOfRangeChange를 더한다. min · max 밖 날을 치면 값은 그대로지만
   * 그 칸에 오류(type 'range')를 넣고, 걷힐 때까지 제출을 막는다
   */
  bindDate: <N extends FieldPath<T>>(
    name: N,
  ) => {
    name: N;
    value: FieldPathValue<T, N>;
    onChange: (value: FieldPathValue<T, N>) => void;
    onOutOfRangeChange: (error: DateFieldOutOfRange | null) => void;
  };
  /** <form onSubmit={form.submit(save)}>. 틀리면 ErrorSummary(없으면 첫 칸)로 포커스 */
  submit: (
    onValid: SubmitHandler<T>,
    onInvalid?: SubmitErrorHandler<T>,
  ) => (e?: BaseSyntheticEvent) => Promise<void>;
  /** <ErrorSummary {...form.summary} />: 제출한 뒤의 오류 목록(칸 순서) + 포커스 키 */
  summary: { errors: ErrorSummaryItem[]; focusKey: number };
  /** 칸 이름 → 입력 id */
  fieldId: (name: FieldPath<T>) => string;
}

/**
 * 칸 이름 → 문장을 react-hook-form 오류 객체 모양으로 얹는다. 같은 칸에 스키마 오류가 있어도 이것이 이긴다
 * (사용자가 날짜를 쳤는데 "납기를 입력하세요"가 보이면 무엇을 고칠지 모른다)
 */
function addErrors(target: Record<string, unknown>, extra: Map<string, string>, type: string) {
  for (const [name, message] of extra) setPath(target, name.split('.'), { type, message });
  return target;
}

export function useTrellisForm<T extends FieldValues>({
  schema,
  ...options
}: TrellisFormOptions<T> = {}): TrellisFormReturn<T> {
  // DateField가 알린 범위 밖 입력(칸 이름 → 문장). 값은 그대로라 스키마는 이것을 모른다
  const ranges = useRef(new Map<string, string>());
  const base = options.resolver ?? (schema ? schemaResolver(schema) : undefined);
  // 검사할 때마다 범위 밖 오류를 얹어, 다시 검사해도 걷히지 않고 제출이 막힌다
  const resolver: Resolver<T> | undefined = base
    ? async (values, context, opts) => {
        const result = await base(values, context, opts);
        if (ranges.current.size === 0) return result;
        const errors = addErrors({ ...result.errors }, ranges.current, 'range');
        return { values: {}, errors: errors as FieldErrors<T> };
      }
    : undefined;
  const form = useForm<T>({
    ...options,
    resolver,
    // 포커스는 submit이 정한다(요약 → 없으면 첫 칸)
    shouldFocusError: false,
  });
  const prefix = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  // 화면에 그린 칸 순서 · 이름. 요약 순서와 항목 이름이 된다
  const labels = useRef(new Map<string, string>());
  const fieldId = useCallback(
    (name: string) => `tl-form-${prefix}-${name.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
    [prefix],
  );
  const { errors, isSubmitted, submitCount } = form.formState;

  const field = (name: FieldPath<T>, label: string): TrellisFieldProps => {
    labels.current.set(name, label);
    const message = (get(errors, name) as { message?: unknown } | undefined)?.message;
    return {
      id: fieldId(name),
      label,
      error: typeof message === 'string' && message ? message : undefined,
    };
  };
  const set = (name: FieldPath<T>, value: unknown) =>
    form.setValue(name, value as FieldPathValue<T, typeof name>, {
      shouldDirty: true,
      shouldTouch: true,
      // 제출 전에는 고치는 중에 오류를 띄우지 않는다. 한 번 제출한 뒤에는 고치는 대로 다시 검사
      shouldValidate: isSubmitted,
    });
  const bind = <N extends FieldPath<T>>(name: N) => ({
    name,
    value: form.watch(name),
    onChange: (value: FieldPathValue<T, N>) => set(name, value),
  });
  const bindChecked = <N extends FieldPath<T>>(name: N) => ({
    name,
    checked: Boolean(form.watch(name)),
    onChange: (checked: boolean) => set(name, checked),
  });
  const bindDate = <N extends FieldPath<T>>(name: N) => ({
    ...bind(name),
    onOutOfRangeChange: (error: DateFieldOutOfRange | null) => {
      if (error) {
        ranges.current.set(name, error.text);
        // 제출 전에는 DateField가 칸 안내를 스스로 보인다(치는 도중이라 role="alert").
        // 제출한 뒤에는 다른 칸처럼 칸 오류와 요약에 바로 넣는다
        if (isSubmitted) form.setError(name, { type: 'range', message: error.text });
        return;
      }
      if (!ranges.current.delete(name)) return;
      if (form.getFieldState(name).error?.type === 'range') form.clearErrors(name);
      // 한 번 제출한 뒤에는 남은 검사(필수 등)를 바로 다시 본다
      if (isSubmitted) void form.trigger(name);
    },
  });

  const order = [...labels.current.keys()];
  const flat = flattenErrors(errors);
  flat.sort((a, b) => {
    const ia = order.indexOf(a.name);
    const ib = order.indexOf(b.name);
    return (ia < 0 ? Infinity : ia) - (ib < 0 ? Infinity : ib);
  });
  const summary = {
    errors: isSubmitted
      ? flat.map((e) => ({
          id: fieldId(e.name),
          label: labels.current.get(e.name) ?? e.name,
          message: e.message,
        }))
      : [],
    focusKey: submitCount,
  };

  const submit: TrellisFormReturn<T>['submit'] = (onValid, onInvalid) => {
    const invalid: SubmitErrorHandler<T> = (errs, event) => {
      // ErrorSummary가 있으면 그쪽이 포커스를 가져간다. 다음 프레임에 아직 폼 밖이면 첫 칸으로
      requestAnimationFrame(() => {
        if (document.activeElement?.closest('.tl-error-summary')) return;
        const first = flattenErrors(errs).sort(
          (a, b) =>
            (order.indexOf(a.name) + 1 || Infinity) - (order.indexOf(b.name) + 1 || Infinity),
        )[0];
        if (first) focusField(fieldId(first.name));
      });
      return onInvalid?.(errs, event);
    };
    const handler = form.handleSubmit((data, event) => {
      // 스키마 없이 rules로 검사하는 폼: 범위 밖 입력이 남아 있으면 여기서 막는다
      if (ranges.current.size > 0) {
        for (const [name, message] of ranges.current)
          form.setError(name as FieldPath<T>, { type: 'range', message });
        return invalid(addErrors({}, ranges.current, 'range') as FieldErrors<T>, event);
      }
      return onValid(data, event);
    }, invalid);
    return async (e) => {
      await handler(e);
    };
  };

  return Object.assign(form, { field, bind, bindChecked, bindDate, submit, summary, fieldId });
}
