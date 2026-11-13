import {
  EMPLOYMENT_STATUS_TONES,
  formatDate,
  PRESENCE_TONES,
  ProfileHeaderContract,
  serviceLength,
  type ProfileFact,
  type ProfileHeaderProps,
} from '@terracelab/trellis-contracts';
import type { ReactNode } from 'react';
import { Avatar } from '../Avatar/Avatar.js';
import { Badge } from '../Badge/Badge.js';
import { cx } from '../_internal/cx.js';
import { useMessages, type Translate } from '../_internal/locale.js';
import { StatusDot } from '../StatusDot/StatusDot.js';

export type ProfileHeaderWebProps = Omit<ProfileHeaderProps, 'facts' | 'actions'> & {
  facts?: readonly (Omit<ProfileFact, 'value'> & { value: ReactNode })[];
  actions?: ReactNode;
  className?: string;
};

/** 근속 글자: 3년 11개월 · 3년 · 5개월 */
export function tenureText(
  t: Translate,
  hireDate: string,
  today: string | Date = new Date(),
): string {
  const { years, months } = serviceLength(hireDate, today);
  if (years > 0 && months > 0) return t('hr.tenure.ym', { years, months });
  if (years > 0) return t('hr.tenure.y', { years });
  return t('hr.tenure.m', { months });
}

export function ProfileHeader({
  name,
  nameEn,
  nameHanja,
  src,
  department,
  role,
  position,
  grade,
  status,
  presence,
  employeeNo,
  hireDate,
  employmentType,
  today,
  facts = [],
  actions,
  headingLevel = 2,
  id,
  testID,
  className,
}: ProfileHeaderWebProps) {
  const t = useMessages();
  const Heading = `h${headingLevel}` as 'h1' | 'h2' | 'h3';
  // 소속 · 직책 · 직위 · 직급(직위와 같으면 한 번)
  const meta = [department, role, position, grade && grade !== position ? grade : undefined]
    .filter(Boolean)
    .join(' · ');
  const otherNames = [nameHanja, nameEn].filter(Boolean).join(' · ');
  const rows: { label: string; value: ReactNode }[] = [
    ...(employeeNo ? [{ label: t('profileHeader.employeeNo'), value: employeeNo }] : []),
    ...(hireDate
      ? [
          { label: t('profileHeader.hireDate'), value: formatDate(hireDate) },
          { label: t('profileHeader.tenure'), value: tenureText(t, hireDate, today) },
        ]
      : []),
    ...(employmentType
      ? [
          {
            label: t('profileHeader.employmentType'),
            value: t(`hr.employmentType.${employmentType}`),
          },
        ]
      : []),
    ...facts,
  ];

  return (
    <div className={cx('tl-profile-header', className)} id={id} data-testid={testID}>
      <Avatar className="tl-profile-header__avatar" name={name} src={src} size={48} decorative />
      <div className="tl-profile-header__body">
        <div className="tl-profile-header__title">
          <Heading className="tl-profile-header__name">{name}</Heading>
          {otherNames && <span className="tl-profile-header__alt">{otherNames}</span>}
          {status && (
            <Badge tone={EMPLOYMENT_STATUS_TONES[status]} size="sm">
              {t(`hr.status.${status}`)}
            </Badge>
          )}
          {presence && (
            <StatusDot tone={PRESENCE_TONES[presence]} size="sm">
              {t(`hr.presence.${presence}`)}
            </StatusDot>
          )}
        </div>
        {meta && <p className="tl-profile-header__meta">{meta}</p>}
        {rows.length > 0 && (
          <dl className="tl-profile-header__facts">
            {rows.map((row, i) => (
              <div key={`${row.label}-${i}`} className="tl-profile-header__fact">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      {actions != null && <div className="tl-profile-header__actions">{actions}</div>}
    </div>
  );
}
ProfileHeader.displayName = ProfileHeaderContract.name;
