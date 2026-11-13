import {
  formatAmount,
  PayslipContract,
  type PayItem,
  type PayslipProps,
} from '@terracelab/trellis-contracts';
import { useId, type ReactNode } from 'react';
import { cx } from '../_internal/cx.js';
import { Skeleton } from '../Skeleton/Skeleton.js';
import { daysNumber, useWorktimeText } from '../TimeClock/time.js';

export const payTotal = (items: readonly PayItem[]) => items.reduce((s, i) => s + i.amount, 0);

export function Payslip({
  period,
  payDate,
  company,
  employee,
  work,
  earnings,
  deductions,
  note,
  headingLevel = 2,
  loading = false,
  id,
  testID,
  className,
}: Omit<PayslipProps, 'note'> & { note?: ReactNode; className?: string }) {
  const { t } = useWorktimeText();
  const titleId = useId();
  const [year, month] = period.split('-').map(Number);
  const H = `h${headingLevel}` as 'h1' | 'h2' | 'h3';
  const Sub = `h${headingLevel + 1}` as 'h2' | 'h3' | 'h4';
  const totalEarnings = payTotal(earnings);
  const totalDeductions = payTotal(deductions);
  const net = totalEarnings - totalDeductions;
  const hours = (n: number) => t('payslip.hours', { n: daysNumber(n) });

  const fields: [string, string | undefined][] = [
    [t('payslip.name'), employee.name],
    employee.employeeNo
      ? [t('payslip.employeeNo'), employee.employeeNo]
      : [t('payslip.birthDate'), employee.birthDate],
    [t('payslip.department'), employee.department],
    [t('payslip.position'), employee.position],
    // 직급이 직위와 같으면 한 번만(ProfileHeader와 같은 규칙)
    [t('payslip.grade'), employee.grade !== employee.position ? employee.grade : undefined],
  ];
  const workFields: [string, string | undefined][] = work
    ? [
        [
          t('payslip.workDays'),
          work.days != null ? t('worktime.days', { n: work.days }) : undefined,
        ],
        [t('payslip.workHours'), work.hours != null ? hours(work.hours) : undefined],
        [t('payslip.overtimeHours'), hours(work.overtimeHours ?? 0)],
        [t('payslip.nightHours'), hours(work.nightHours ?? 0)],
        [t('payslip.holidayHours'), hours(work.holidayHours ?? 0)],
      ]
    : [];

  const label = (item: PayItem) => item.label ?? (item.code ? t(`worktime.pay.${item.code}`) : '');

  const table = (kind: 'earnings' | 'deductions', items: readonly PayItem[], total: number) => (
    <table className="tl-payslip__table" data-kind={kind}>
      <caption className="tl-payslip__caption">{t(`payslip.${kind}`)}</caption>
      <thead>
        <tr>
          <th scope="col">{t('payslip.item')}</th>
          <th scope="col" data-numeric="">
            {t('payslip.amount')}
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={`${item.code ?? item.label}-${i}`}>
            <th scope="row">
              <span className="tl-payslip__item">
                {label(item)}
                {item.taxFree && <span className="tl-payslip__tag">{t('payslip.taxFree')}</span>}
              </span>
              {item.basis && (
                <span className="tl-payslip__basis">
                  <span className="tl-sr-only">{t('payslip.basis')} </span>
                  {item.basis}
                </span>
              )}
            </th>
            <td data-numeric="">{formatAmount(item.amount)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row">
            {t(kind === 'earnings' ? 'payslip.totalEarnings' : 'payslip.totalDeductions')}
          </th>
          <td data-numeric="">{formatAmount(total)}</td>
        </tr>
      </tfoot>
    </table>
  );

  return (
    <article
      className={cx('tl-payslip', className)}
      id={id}
      data-testid={testID}
      aria-labelledby={titleId}
      aria-busy={loading || undefined}
    >
      <header className="tl-payslip__head">
        {company && <p className="tl-payslip__company">{company}</p>}
        <H className="tl-payslip__title" id={titleId}>
          {t('payslip.title', {
            year: year ?? '',
            month: month ?? '',
            mm: String(month).padStart(2, '0'),
          })}
        </H>
        <p className="tl-payslip__pay-date">
          {t('payslip.payDate')} <span className="tl-payslip__mono">{payDate}</span>
        </p>
      </header>
      {loading ? (
        <div className="tl-payslip__loading">
          <Skeleton lines={2} />
          <Skeleton shape="rect" height="calc(var(--tl-space-64) * 2)" />
          <Skeleton shape="rect" width="40%" height="var(--tl-type-amount-lg-line-height)" />
          <span className="tl-sr-only">{t('common.loading')}</span>
        </div>
      ) : (
        <>
          <dl className="tl-payslip__fields">
            {fields
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="tl-payslip__field">
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
          </dl>
          {work && (
            <section className="tl-payslip__section" aria-labelledby={`${titleId}-work`}>
              <Sub className="tl-payslip__section-title" id={`${titleId}-work`}>
                {t('payslip.work')}
              </Sub>
              <dl className="tl-payslip__fields" data-kind="work">
                {workFields
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="tl-payslip__field">
                      <dt>{k}</dt>
                      <dd className="tl-payslip__mono">{v}</dd>
                    </div>
                  ))}
              </dl>
            </section>
          )}
          <p className="tl-payslip__unit">{t('payslip.unit')}</p>
          <div className="tl-payslip__tables">
            {table('earnings', earnings, totalEarnings)}
            {table('deductions', deductions, totalDeductions)}
          </div>
          <p className="tl-payslip__net">
            <span className="tl-payslip__net-label">{t('payslip.netPay')}</span>
            <span className="tl-payslip__net-value">
              <span className="tl-payslip__net-number">{formatAmount(net)}</span>
              <span className="tl-payslip__net-unit">{t('common.unitWon')}</span>
            </span>
          </p>
          {note != null && <footer className="tl-payslip__note">{note}</footer>}
        </>
      )}
    </article>
  );
}
Payslip.displayName = PayslipContract.name;
