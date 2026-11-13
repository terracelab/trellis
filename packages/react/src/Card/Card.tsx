import { CardContract, type CardProps, type StatusTone } from '@terracelab/trellis-contracts';
import type { IconName } from '@terracelab/trellis-icons';
import {
  Children,
  createContext,
  useContext,
  useId,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { cx } from '../_internal/cx.js';
import { toneVars } from '../_internal/tone.js';
import { Icon } from '../Icon/Icon.js';

export type CardWebProps = Omit<
  CardProps,
  'title' | 'subtitle' | 'action' | 'footer' | 'children'
> & {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
};

/** 카드 제목 단계. 화면 바로 아래 카드는 h2(PageHeader h1 다음), 카드 안 카드는 한 단계 아래. 카드 모양 부품(ProposalCard)이 같이 쓴다 */
export const HeadingLevel = createContext(2);

/** 제목 앞 상태 아이콘(Banner와 같은 모양). 색만으로 말하지 않게 모양이 톤마다 다르다 */
const TONE_ICON: Record<StatusTone, IconName> = {
  info: 'info',
  success: 'circle-check',
  warning: 'triangle-alert',
  danger: 'circle-alert',
  neutral: 'info',
};

export function Card({
  title,
  subtitle,
  action,
  footer,
  padding = 'default',
  emphasis = 'default',
  tone,
  headingLevel,
  landmark = false,
  children,
  id,
  testID,
  className,
}: CardWebProps) {
  const titleId = useId();
  const inherited = useContext(HeadingLevel);
  const level = Math.min(6, Math.max(2, headingLevel ?? inherited));
  const Heading = `h${level}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const hasHead = title != null || action != null;
  // 본문이 비면 그리지 않는다: footer가 제목 바로 아래에 붙고, 격자에서 늘어난 높이는 카드 아래 빈자리가 된다(PR-38)
  const hasBody = Children.toArray(children).length > 0;
  // 기본은 랜드마크가 아니다. 법인마다 같은 제목 카드가 같은 이름 region이 되지 않게, landmark일 때만 section
  const Root = landmark ? 'section' : 'div';
  return (
    <Root
      className={cx('tl-card', className)}
      id={id}
      data-testid={testID}
      data-padding={padding}
      data-emphasis={emphasis === 'default' ? undefined : emphasis}
      data-tone={tone}
      aria-labelledby={landmark && title != null ? titleId : undefined}
      style={tone ? ({ '--tl-card-tone': toneVars(tone).solid } as CSSProperties) : undefined}
    >
      {hasHead && (
        <div className="tl-card__head">
          {tone && title != null && <Icon name={TONE_ICON[tone]} className="tl-card__tone" />}
          <div className="tl-card__titles">
            {title != null && (
              <Heading className="tl-card__title" id={titleId}>
                {title}
              </Heading>
            )}
            {subtitle != null && <p className="tl-card__subtitle">{subtitle}</p>}
          </div>
          {action != null && <div className="tl-card__action">{action}</div>}
        </div>
      )}
      {hasBody && (
        <div className="tl-card__body">
          <HeadingLevel.Provider value={Math.min(6, level + 1)}>{children}</HeadingLevel.Provider>
        </div>
      )}
      {footer != null && <div className="tl-card__footer">{footer}</div>}
    </Root>
  );
}
Card.displayName = CardContract.name;
