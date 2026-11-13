import {
  APPROVAL_EDIT_ROLES,
  ApprovalLineEditorContract,
  endsWithApproval,
  insertApprover,
  moveApprover,
  type ApprovalEditRole,
  type ApprovalLineEditorProps,
  type ApprovalLineStep,
  type ApprovalPerson,
} from '@terracelab/trellis-contracts';
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { CodeSearch } from '../CodeSearch/CodeSearch.js';
import { Field } from '../Field/Field.js';
import { Icon } from '../Icon/Icon.js';
import { IconButton } from '../IconButton/IconButton.js';
import { PersonLabel } from '../PersonLabel/PersonLabel.js';
import { Select } from '../Select/Select.js';
import { TagInput } from '../TagInput/TagInput.js';

export type ApprovalLineEditorWebProps = ApprovalLineEditorProps & { className?: string };

type Part = 'role' | 'up' | 'down' | 'remove';

const fullName = (p: ApprovalPerson) => (p.title ? `${p.name} ${p.title}` : p.name);

/**
 * 결재선 편집(R-T25): 기안자(0번 고정) 아래로 결재자 줄(순서 · 역할 검토 · 합의 · 승인 · 순서 바꾸기 · 빼기),
 * 결재자 추가(이름 · 사번 찾기, 승인 칸 앞에 검토로), 참조자 칩(TagInput 사람 모드).
 * 줄 안 단추에서 Alt + ↑ · ↓로 순서를 바꾸고, 바뀐 순서는 화면 읽기 알림 줄이 읽는다
 */
export function ApprovalLineEditor({
  people,
  drafter,
  value,
  defaultValue,
  onChange,
  cc,
  defaultCc,
  onCcChange,
  showCc = true,
  error,
  max,
  disabled = false,
  id,
  testID,
  className,
}: ApprovalLineEditorWebProps) {
  const t = useMessages();
  const hintId = useId();
  const listRef = useRef<HTMLOListElement>(null);
  const [inner, setInner] = useState<ApprovalLineStep[]>(() => [...(defaultValue ?? [])]);
  const line = value ?? inner;
  const [innerCc, setInnerCc] = useState<string[]>(() => [...(defaultCc ?? [])]);
  const ccList = cc ?? innerCc;
  const [announce, setAnnounce] = useState('');
  /** 순서를 바꾼 뒤 초점을 둘 자리(사람 id + 부품) */
  const refocus = useRef<{ person: string; part: Part } | null>(null);
  const byId = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);
  const nameOf = (pid: string) => byId.get(pid)?.name ?? pid;

  useEffect(() => {
    const target = refocus.current;
    if (!target) return;
    refocus.current = null;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-person="${target.person}"] [data-part="${target.part}"]`)
      ?.focus();
  });

  const change = (next: ApprovalLineStep[]) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };
  const changeCc = (next: string[]) => {
    if (cc === undefined) setInnerCc(next);
    onCcChange?.(next);
  };

  const move = (i: number, d: -1 | 1, part: Part) => {
    const step = line[i];
    const to = i + d;
    if (!step || disabled || to < 0 || to >= line.length) return;
    change(moveApprover(line, i, d));
    setAnnounce(t('approvalLineEditor.moved', { name: nameOf(step.person), index: to + 1 }));
    // 끝에 닿아 잠기는 단추 대신 반대 단추로
    const next: Part =
      part === 'up' && to === 0 ? 'down' : part === 'down' && to === line.length - 1 ? 'up' : part;
    refocus.current = { person: step.person, part: next };
  };
  const remove = (i: number) => {
    const step = line[i];
    if (!step || disabled) return;
    change(line.filter((_, j) => j !== i));
    setAnnounce(t('approvalLineEditor.removed', { name: nameOf(step.person) }));
    const neighbour = line[i + 1] ?? line[i - 1];
    if (neighbour) refocus.current = { person: neighbour.person, part: 'remove' };
  };
  const add = (pid: string | null) => {
    if (!pid || disabled || line.some((s) => s.person === pid)) return;
    change(insertApprover(line, pid));
    setAnnounce(t('approvalLineEditor.added', { name: nameOf(pid) }));
  };
  const setRole = (i: number, role: ApprovalEditRole) =>
    change(line.map((s, j) => (j === i ? { ...s, role } : s)));

  const onRowKey = (e: KeyboardEvent<HTMLLIElement>, i: number) => {
    if (e.defaultPrevented || !e.altKey) return;
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    const part = (e.target as HTMLElement).closest<HTMLElement>('[data-part]')?.dataset['part'];
    if (part !== 'up' && part !== 'down' && part !== 'remove') return;
    e.preventDefault();
    move(i, e.key === 'ArrowUp' ? -1 : 1, part);
  };

  const used = new Set([...(drafter ? [drafter.id] : []), ...line.map((s) => s.person), ...ccList]);
  const candidates = people.filter((p) => !used.has(p.id));
  const full = max != null && line.length >= max;
  const lastIsApprove = endsWithApproval(line);
  const roleOptions = APPROVAL_EDIT_ROLES.map((r) => ({ value: r, label: r }));

  return (
    <div
      className={cx('tl-approval-line-editor', className)}
      id={id}
      data-testid={testID}
      data-state={error ? 'error' : disabled ? 'disabled' : undefined}
    >
      <ol
        ref={listRef}
        className="tl-approval-line-editor__list"
        aria-label={t('approvalLineEditor.label')}
        aria-describedby={hintId}
      >
        {drafter && (
          <li className="tl-approval-line-editor__row" data-drafter="">
            <span className="tl-approval-line-editor__no" aria-hidden="true">
              0
            </span>
            <span className="tl-approval-line-editor__who">
              <PersonLabel
                name={fullName(drafter)}
                {...(drafter.meta ? { meta: drafter.meta } : {})}
                {...(drafter.src ? { src: drafter.src } : {})}
              />
            </span>
            <span className="tl-approval-line-editor__role">
              <span className="tl-approval-line-editor__fixed">
                {t('approvalLineEditor.drafter')}
              </span>
            </span>
            <span className="tl-approval-line-editor__tools" />
          </li>
        )}
        {line.length === 0 && (
          <li className="tl-approval-line-editor__empty">{t('approvalLineEditor.empty')}</li>
        )}
        {line.map((s, i) => {
          const p = byId.get(s.person);
          const name = p?.name ?? s.person;
          return (
            <li
              key={s.person}
              className="tl-approval-line-editor__row"
              data-person={s.person}
              onKeyDown={(e) => onRowKey(e, i)}
            >
              <span className="tl-approval-line-editor__no" aria-hidden="true">
                {i + 1}
              </span>
              <span className="tl-approval-line-editor__who">
                <PersonLabel
                  name={p ? fullName(p) : s.person}
                  {...(p?.meta ? { meta: p.meta } : {})}
                  {...(p?.src ? { src: p.src } : {})}
                />
              </span>
              <span className="tl-approval-line-editor__role" data-part="role">
                <Select
                  size="sm"
                  label={t('approvalLineEditor.role', { name })}
                  value={s.role}
                  disabled={disabled}
                  onChange={(v) => v && setRole(i, v as ApprovalEditRole)}
                  options={roleOptions}
                />
              </span>
              <span className="tl-approval-line-editor__tools">
                <IconButton
                  icon="arrow-up"
                  size="sm"
                  data-part="up"
                  label={t('approvalLineEditor.up', { name })}
                  disabled={disabled || i === 0}
                  onPress={() => move(i, -1, 'up')}
                />
                <IconButton
                  icon="arrow-down"
                  size="sm"
                  data-part="down"
                  label={t('approvalLineEditor.down', { name })}
                  disabled={disabled || i === line.length - 1}
                  onPress={() => move(i, 1, 'down')}
                />
                <IconButton
                  icon="x"
                  size="sm"
                  data-part="remove"
                  label={t('approvalLineEditor.remove', { name })}
                  disabled={disabled}
                  onPress={() => remove(i)}
                />
              </span>
            </li>
          );
        })}
      </ol>
      <span id={hintId} className="tl-sr-only">
        {t('approvalLineEditor.moveHint')}
      </span>
      {line.length > 0 && !lastIsApprove && (
        <p className="tl-approval-line-editor__warn" role="status">
          <Icon name="triangle-alert" className="tl-approval-line-editor__warn-icon" />
          {t('approvalLineEditor.lastNotApprove')}
        </p>
      )}
      <div className="tl-approval-line-editor__add">
        <Field
          label={t('approvalLineEditor.add')}
          help={
            full
              ? t('approvalLineEditor.full', { count: max ?? 0 })
              : t('approvalLineEditor.addHelp')
          }
          error={error ?? null}
        >
          <CodeSearch
            value={null}
            onChange={add}
            showCode={false}
            disabled={disabled || full}
            placeholder={
              candidates[0]
                ? [candidates[0].name, candidates[0].code].filter(Boolean).join(' · ')
                : ''
            }
            emptyText={t('approvalLineEditor.searchEmpty')}
            options={candidates.map((p) => {
              const description = [p.meta, p.code].filter(Boolean).join(' · ');
              return { value: p.id, label: fullName(p), ...(description ? { description } : {}) };
            })}
          />
        </Field>
      </div>
      {showCc && (
        <div className="tl-approval-line-editor__cc">
          <Field label={t('approvalLineEditor.cc')} help={t('approvalLineEditor.ccHelp')}>
            <TagInput
              mode="person"
              value={ccList}
              onChange={changeCc}
              disabled={disabled}
              suggestions={people
                .filter((p) => p.id !== drafter?.id && !line.some((s) => s.person === p.id))
                .map((p) => {
                  const meta = [p.title, p.meta, p.code].filter(Boolean).join(' · ');
                  return {
                    value: p.id,
                    label: p.name,
                    ...(meta ? { meta } : {}),
                    ...(p.src ? { src: p.src } : {}),
                  };
                })}
            />
          </Field>
        </div>
      )}
      <span className="tl-sr-only" aria-live="polite">
        {announce}
      </span>
    </div>
  );
}
ApprovalLineEditor.displayName = ApprovalLineEditorContract.name;
