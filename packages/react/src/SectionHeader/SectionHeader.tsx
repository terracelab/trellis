import {
  formatAmount,
  SectionHeaderContract,
  type SectionHeaderProps,
} from '@terracelab/trellis-contracts';
import { useContext, useId, type ReactNode } from 'react';
import { HeadingLevel } from '../Card/Card.js';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';

export type SectionHeaderWebProps = Omit<
  SectionHeaderProps,
  'title' | 'description' | 'action' | 'children'
> & {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
};

/**
 * 카드 밖 구역 제목(PR-38): 카드 묶음 · 표 위에 제목 + 건수 + 설명 + 동작 하나.
 * children을 주면 그 묶음을 감싸고, 안 카드 제목은 한 단계 아래가 된다
 */
export function SectionHeader({
  title,
  count,
  countLabel,
  description,
  action,
  headingLevel,
  children,
  id,
  testID,
  className,
}: SectionHeaderWebProps) {
  const t = useMessages();
  const titleId = useId();
  const inherited = useContext(HeadingLevel);
  const level = Math.min(6, Math.max(2, headingLevel ?? inherited));
  const Heading = `h${level}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const countText =
    countLabel ?? (count != null ? t('sectionHeader.count', { count: formatAmount(count) }) : null);
  const head = (
    <div className="tl-section-header__head">
      <div className="tl-section-header__titles">
        <Heading className="tl-section-header__title" id={titleId}>
          {title}
          {countText != null && (
            <>
              {' '}
              <span className="tl-section-header__count">{countText}</span>
            </>
          )}
        </Heading>
        {description != null && <p className="tl-section-header__description">{description}</p>}
      </div>
      {action != null && <div className="tl-section-header__action">{action}</div>}
    </div>
  );
  if (children == null)
    return (
      <div className={cx('tl-section-header', className)} id={id} data-testid={testID}>
        {head}
      </div>
    );
  return (
    <div className={cx('tl-section-header', className)} id={id} data-testid={testID} data-wraps="">
      {head}
      <div className="tl-section-header__body">
        <HeadingLevel.Provider value={Math.min(6, level + 1)}>{children}</HeadingLevel.Provider>
      </div>
    </div>
  );
}
SectionHeader.displayName = SectionHeaderContract.name;
