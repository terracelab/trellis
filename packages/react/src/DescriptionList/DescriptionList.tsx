import {
  DescriptionListContract,
  type DescriptionItem,
  type DescriptionListProps,
} from '@terracelab/trellis-contracts';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from '../_internal/cx.js';
import { IconButton } from '../IconButton/IconButton.js';
import { useMessages } from '../_internal/locale.js';

export type DescriptionItemWeb = Omit<DescriptionItem, 'value'> & { value: ReactNode };

/** 복사 버튼이 체크로 바뀌어 있는 시간(ms) */
const COPIED_MS = 2000;

function copySource(item: DescriptionItemWeb): string {
  if (item.copyText != null) return item.copyText;
  return typeof item.value === 'string' || typeof item.value === 'number' ? String(item.value) : '';
}

export function DescriptionList({
  items,
  columns = 2,
  layout = 'horizontal',
  id,
  testID,
  className,
}: Omit<DescriptionListProps, 'items'> & {
  items: readonly DescriptionItemWeb[];
  className?: string;
}) {
  const t = useMessages();
  const [copied, setCopied] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async (index: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return; // 권한이 없으면 표시를 바꾸지 않는다
    }
    setCopied(index);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), COPIED_MS);
  };

  return (
    <dl
      className={cx('tl-description-list', className)}
      id={id}
      data-testid={testID}
      data-columns={columns}
      data-layout={layout}
    >
      {items.map((item, i) => {
        const span = Math.min(item.span ?? 1, columns);
        const empty = item.value == null || item.value === '';
        const text = item.copyable ? copySource(item) : '';
        return (
          <div key={`${item.label}-${i}`} className="tl-description-list__item" data-span={span}>
            <dt className="tl-description-list__label">{item.label}</dt>
            <dd className="tl-description-list__value">
              <span className="tl-description-list__text">{empty ? '–' : item.value}</span>
              {item.copyable && text && (
                <>
                  <IconButton
                    className="tl-description-list__copy"
                    icon={copied === i ? 'check' : 'copy'}
                    label={t('common.copy', { label: item.label })}
                    size="sm"
                    onPress={() => void copy(i, text)}
                  />
                  {/* 라이브 영역은 처음부터 있어야 바뀐 글자가 읽힌다 */}
                  <span className="tl-sr-only" role="status">
                    {copied === i ? t('common.copied') : ''}
                  </span>
                </>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
DescriptionList.displayName = DescriptionListContract.name;
