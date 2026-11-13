import {
  formatDate,
  formatPeriod,
  formatRrn,
  HR_RECORD_SECTIONS,
  HrRecordContract,
  maskAccount,
  type HrMaskedField,
  type HrMasterRecord,
  type HrRecordProps,
  type HrRecordSection,
} from '@terracelab/trellis-contracts';
import { useId, type ReactNode } from 'react';
import { Button } from '../Button/Button.js';
import { DescriptionList, type DescriptionItemWeb } from '../DescriptionList/DescriptionList.js';
import { cx } from '../_internal/cx.js';
import { useMessages, type Translate } from '../_internal/locale.js';
import { MaskedValue } from '../MaskedValue/MaskedValue.js';
import { tenureText } from '../ProfileHeader/ProfileHeader.js';

/** 칸별 보기: 사유 → 앱(권한 확인 · 기록) → 원문. 없으면 보기 단추 없이 가린 글자만 */
type RevealField = ((field: HrMaskedField, reason: string) => Promise<string>) | undefined;

/** 계좌 글자: "은행 번호 · 예금주 이름"(예금주가 있으면). 보기 단추는 그 뒤에 붙는다 */
function accountText(
  t: Translate,
  account: { bank: string; holder?: string },
  number: string,
): string {
  return [
    `${account.bank} ${number}`,
    account.holder ? t('hrRecord.accountHolder', { holder: account.holder }) : '',
  ]
    .filter(Boolean)
    .join(' · ');
}

/** 가린 칸 하나. revealed(전체 보기)면 원문 글자, 아니면 MaskedValue */
function maskedCell(
  t: Translate,
  field: HrMaskedField,
  revealed: boolean,
  original: string,
  masked: string,
  revealField: RevealField,
): ReactNode {
  if (revealed) return original;
  const label = t(field === 'rrn' ? 'hrRecord.field.rrn' : 'hrRecord.field.bankAccount');
  return (
    <MaskedValue
      label={label}
      value={masked}
      {...(revealField ? { onReveal: (reason: string) => revealField(field, reason) } : {})}
    />
  );
}

export type HrRecordWebProps = HrRecordProps & { className?: string };

const date = (v?: string) => (v ? formatDate(v) : undefined);
/** 기간: 시작만 있으면 "2024-03-04~"(지금까지) */
const period = (from?: string, to?: string) =>
  from && to ? formatPeriod(from, to) : from ? `${formatDate(from)}~` : undefined;
const dash = (v: ReactNode) => (v == null || v === '' ? '–' : v);

interface Column {
  label: string;
  /** 숫자 · 날짜 칸은 글자 폭이 같게 */
  numeric?: boolean;
}

function RecordTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: readonly Column[];
  rows: readonly (readonly ReactNode[])[];
}) {
  return (
    <table className="tl-hr-record__table">
      <caption className="tl-sr-only">{caption}</caption>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.label} scope="col" data-numeric={c.numeric || undefined}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((cells, r) => (
          <tr key={r}>
            {cells.map((cell, i) => (
              <td key={i} data-numeric={columns[i]?.numeric || undefined}>
                {dash(cell)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** 항목 하나의 내용. 비어 있으면 null(빈 줄을 보인다) */
function sectionBody(
  section: HrRecordSection,
  record: HrMasterRecord,
  t: Translate,
  revealed: boolean,
  today: string | undefined,
  revealField: RevealField,
): ReactNode {
  const caption = t(`hrRecord.section.${section}`);
  const { personal: p, employment: e, pay, military } = record;
  switch (section) {
    case 'personal': {
      const items: DescriptionItemWeb[] = [
        { label: t('hrRecord.field.name'), value: p.name },
        { label: t('hrRecord.field.nameHanja'), value: p.nameHanja },
        { label: t('hrRecord.field.nameEn'), value: p.nameEn },
        {
          label: t('hrRecord.field.rrn'),
          value: p.rrn
            ? maskedCell(
                t,
                'rrn',
                revealed,
                formatRrn(p.rrn, { masked: false }),
                formatRrn(p.rrn),
                revealField,
              )
            : undefined,
        },
        {
          label: t('hrRecord.field.birthDate'),
          value:
            p.birthDate && p.birthCalendar
              ? t('hrRecord.birthValue', {
                  date: formatDate(p.birthDate),
                  calendar: t(`hr.calendar.${p.birthCalendar}`),
                })
              : date(p.birthDate),
        },
        { label: t('hrRecord.field.gender'), value: p.gender && t(`hr.gender.${p.gender}`) },
        { label: t('hrRecord.field.nationality'), value: p.nationality },
        { label: t('hrRecord.field.mobile'), value: p.mobile },
        { label: t('hrRecord.field.email'), value: p.email, span: 2 },
        { label: t('hrRecord.field.address'), value: p.address, span: 2 },
        {
          label: t('hrRecord.field.emergency'),
          value: p.emergencyContact && t('hrRecord.emergencyValue', { ...p.emergencyContact }),
          span: 2,
        },
      ];
      return <DescriptionList items={items} />;
    }
    case 'employment': {
      const end = e.resignDate ?? today;
      const items: DescriptionItemWeb[] = [
        { label: t('hrRecord.field.employeeNo'), value: e.employeeNo, copyable: true },
        { label: t('hrRecord.field.company'), value: e.company },
        { label: t('hrRecord.field.department'), value: e.department },
        { label: t('hrRecord.field.jobFamily'), value: e.jobFamily },
        { label: t('hrRecord.field.grade'), value: e.grade },
        { label: t('hrRecord.field.position'), value: e.position },
        { label: t('hrRecord.field.role'), value: e.role },
        { label: t('hrRecord.field.step'), value: e.step },
        {
          label: t('hrRecord.field.employmentType'),
          value: e.employmentType && t(`hr.employmentType.${e.employmentType}`),
        },
        { label: t('hrRecord.field.workSchedule'), value: e.workSchedule },
        { label: t('hrRecord.field.hireDate'), value: date(e.hireDate) },
        { label: t('hrRecord.field.groupHireDate'), value: date(e.groupHireDate) },
        { label: t('hrRecord.field.probationEnd'), value: date(e.probationEnd) },
        { label: t('hrRecord.field.tenure'), value: tenureText(t, e.hireDate, end) },
        ...(e.resignDate
          ? [{ label: t('hrRecord.field.resignDate'), value: date(e.resignDate) }]
          : []),
      ];
      return <DescriptionList items={items} />;
    }
    case 'pay': {
      if (!pay) return null;
      const account = pay.bankAccount;
      const items: DescriptionItemWeb[] = [
        {
          label: t('hrRecord.field.payType'),
          value: pay.payType && t(`hr.payType.${pay.payType}`),
        },
        {
          label: t('hrRecord.field.bankAccount'),
          value:
            account &&
            maskedCell(
              t,
              'bankAccount',
              revealed,
              accountText(t, account, account.number),
              accountText(t, account, maskAccount(account.number)),
              revealField,
            ),
        },
        { label: t('hrRecord.field.pension'), value: date(pay.insurance?.pension) },
        { label: t('hrRecord.field.health'), value: date(pay.insurance?.health) },
        {
          label: t('hrRecord.field.employmentInsurance'),
          value: date(pay.insurance?.employment),
        },
        { label: t('hrRecord.field.industrial'), value: date(pay.insurance?.industrial) },
      ];
      return <DescriptionList items={items} />;
    }
    case 'military': {
      if (!military) return null;
      const items: DescriptionItemWeb[] = [
        { label: t('hrRecord.field.kind'), value: t(`hr.military.${military.status}`) },
        { label: t('hrRecord.field.branch'), value: military.branch },
        { label: t('hrRecord.field.rank'), value: military.rank },
        { label: t('hrRecord.field.period'), value: period(military.from, military.to) },
        { label: t('hrRecord.field.note'), value: military.note, span: 2 },
      ];
      return <DescriptionList items={items} />;
    }
    case 'education': {
      const list = record.education ?? [];
      if (!list.length) return null;
      return (
        <RecordTable
          caption={caption}
          columns={[
            { label: t('hrRecord.field.period'), numeric: true },
            { label: t('hrRecord.field.school') },
            { label: t('hrRecord.field.major') },
            { label: t('hrRecord.field.degree') },
            { label: t('hrRecord.field.kind') },
          ]}
          rows={list.map((x) => [period(x.from, x.to), x.school, x.major, x.degree, x.state])}
        />
      );
    }
    case 'careers': {
      const list = record.careers ?? [];
      if (!list.length) return null;
      return (
        <RecordTable
          caption={caption}
          columns={[
            { label: t('hrRecord.field.period'), numeric: true },
            { label: t('hrRecord.field.careerCompany') },
            { label: t('hrRecord.field.position') },
            { label: t('hrRecord.field.duty') },
          ]}
          rows={list.map((x) => [period(x.from, x.to), x.company, x.title, x.duty])}
        />
      );
    }
    case 'licenses': {
      const list = record.licenses ?? [];
      if (!list.length) return null;
      return (
        <RecordTable
          caption={caption}
          columns={[
            { label: t('hrRecord.field.acquiredOn'), numeric: true },
            { label: t('hrRecord.field.licenseName') },
            { label: t('hrRecord.field.issuer') },
            { label: t('hrRecord.field.number'), numeric: true },
          ]}
          rows={list.map((x) => [date(x.acquiredOn), x.name, x.issuer, x.number])}
        />
      );
    }
    case 'languages': {
      const list = record.languages ?? [];
      if (!list.length) return null;
      return (
        <RecordTable
          caption={caption}
          columns={[
            { label: t('hrRecord.field.language') },
            { label: t('hrRecord.field.test') },
            { label: t('hrRecord.field.score'), numeric: true },
            { label: t('hrRecord.field.takenOn'), numeric: true },
          ]}
          rows={list.map((x) => [x.language, x.test, x.score, date(x.takenOn)])}
        />
      );
    }
    case 'family': {
      const list = record.family ?? [];
      if (!list.length) return null;
      return (
        <RecordTable
          caption={caption}
          columns={[
            { label: t('hrRecord.field.relation') },
            { label: t('hrRecord.field.name') },
            { label: t('hrRecord.field.birthDate'), numeric: true },
            { label: t('hrRecord.field.dependent') },
          ]}
          rows={list.map((x) => [
            x.relation,
            x.name,
            date(x.birthDate),
            x.dependent ? t('hr.yes') : undefined,
          ])}
        />
      );
    }
    case 'appointments': {
      // 최근 발령이 위
      const list = [...(record.appointments ?? [])].sort((a, b) => b.date.localeCompare(a.date));
      if (!list.length) return null;
      return (
        <RecordTable
          caption={caption}
          columns={[
            { label: t('hrRecord.field.appointmentDate'), numeric: true },
            { label: t('hrRecord.field.kind') },
            { label: t('hrRecord.field.detail') },
            { label: t('hrRecord.field.department') },
            { label: t('hrRecord.field.position') },
          ]}
          rows={list.map((x) => [
            date(x.date),
            t(`hr.appointment.${x.kind}`),
            x.detail,
            x.department,
            x.position,
          ])}
        />
      );
    }
    case 'rewards': {
      const list = [...(record.rewards ?? [])].sort((a, b) => b.date.localeCompare(a.date));
      if (!list.length) return null;
      return (
        <RecordTable
          caption={caption}
          columns={[
            { label: t('hrRecord.field.date'), numeric: true },
            { label: t('hrRecord.field.kind') },
            { label: t('hrRecord.field.detail') },
          ]}
          rows={list.map((x) => [
            date(x.date),
            t(x.kind === 'reward' ? 'hr.reward' : 'hr.penalty'),
            x.detail ? `${x.title} · ${x.detail}` : x.title,
          ])}
        />
      );
    }
  }
}

export function HrRecord({
  record,
  sections = HR_RECORD_SECTIONS,
  revealed = false,
  onRevealChange,
  onRevealField,
  nav = true,
  today,
  headingLevel = 2,
  id,
  testID,
  className,
}: HrRecordWebProps) {
  const t = useMessages();
  const uid = useId();
  // 앱이 원문을 돌려주면 그것을, 아무것도 돌려주지 않으면 record의 값을 보인다(권한 확인 · 기록은 앱)
  const revealField: RevealField = onRevealField
    ? async (field, reason) => {
        const given = await onRevealField(field, reason);
        if (field === 'rrn')
          return formatRrn(given || record.personal.rrn || '', { masked: false });
        const account = record.pay?.bankAccount ?? { bank: '', number: '' };
        return accountText(t, account, given || account.number).trim();
      }
    : undefined;
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  const sectionId = (s: HrRecordSection) => `${uid}-${s}`;

  const jump = (s: HrRecordSection) => {
    const heading = document.getElementById(`${sectionId(s)}-title`);
    if (!heading) return;
    heading.scrollIntoView({ block: 'start' });
    heading.focus({ preventScroll: true });
  };

  return (
    <div
      className={cx('tl-hr-record', className)}
      id={id}
      data-testid={testID}
      role="group"
      aria-label={t('hrRecord.label')}
    >
      {(nav || onRevealChange) && (
        <div className="tl-hr-record__bar">
          {nav && (
            <nav className="tl-hr-record__nav" aria-label={t('hrRecord.nav')}>
              <ul>
                {sections.map((s) => (
                  <li key={s}>
                    <a
                      className="tl-hr-record__nav-link tl-focusable"
                      href={`#${sectionId(s)}`}
                      onClick={(e) => {
                        e.preventDefault();
                        jump(s);
                      }}
                    >
                      {t(`hrRecord.section.${s}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {onRevealChange && (
            <Button
              className="tl-hr-record__reveal"
              size="sm"
              variant="ghost"
              icon={revealed ? 'eye-off' : 'eye'}
              onPress={() => onRevealChange(!revealed)}
            >
              {revealed ? t('hrRecord.conceal') : t('hrRecord.reveal')}
            </Button>
          )}
        </div>
      )}
      {sections.map((s) => {
        const body = sectionBody(s, record, t, revealed, today, revealField);
        const titleId = `${sectionId(s)}-title`;
        return (
          // 이름 없는 section(랜드마크가 아니다). 항목 이동은 제목으로 한다
          <section key={s} id={sectionId(s)} className="tl-hr-record__section">
            <Heading className="tl-hr-record__title" id={titleId} tabIndex={-1}>
              {t(`hrRecord.section.${s}`)}
            </Heading>
            {body ?? <p className="tl-hr-record__empty">{t('hrRecord.empty')}</p>}
          </section>
        );
      })}
    </div>
  );
}
HrRecord.displayName = HrRecordContract.name;
