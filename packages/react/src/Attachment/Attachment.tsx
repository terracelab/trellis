import {
  AttachmentContract,
  formatAttachmentSize,
  inferAttachmentType,
  type AttachmentFileType,
  type AttachmentProps,
} from '@terracelab/trellis-contracts';
import type { IconName } from '@terracelab/trellis-icons';
import { cx } from '../_internal/cx.js';
import { Icon } from '../Icon/Icon.js';
import { IconButton } from '../IconButton/IconButton.js';
import { useMessages } from '../_internal/locale.js';

const TYPE_ICON: Record<AttachmentFileType, IconName> = {
  pdf: 'file-text',
  xlsx: 'file-spreadsheet',
  image: 'image',
  zip: 'archive',
  other: 'file',
};

/** 버튼으로 받기를 시작한다(<a download>를 잠깐 만들어 누른다) */
function startDownload(href: string, name: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function Attachment({
  files,
  onRemove,
  layout = 'list',
  downloadable = true,
  id,
  testID,
  className,
}: AttachmentProps & { className?: string }) {
  const t = useMessages();
  const chips = layout === 'chips';
  const buttonSize = chips ? 'sm' : 'md';
  return (
    <ul
      className={cx('tl-attachment', className)}
      id={id}
      data-testid={testID}
      data-layout={layout}
      aria-label={t('common.attachments')}
    >
      {files.map((file, i) => {
        const type = file.type ?? inferAttachmentType(file.name);
        const canDownload = downloadable && file.href != null;
        return (
          <li key={`${i}-${file.name}`} className="tl-attachment__file" data-type={type}>
            <Icon name={TYPE_ICON[type]} size={chips ? 16 : 20} className="tl-attachment__icon" />
            {file.href != null && !downloadable ? (
              <a
                className="tl-attachment__name tl-focusable"
                href={file.href}
                target="_blank"
                rel="noopener noreferrer"
                title={file.name}
              >
                {file.name}
              </a>
            ) : (
              <span className="tl-attachment__name" title={file.name}>
                {file.name}
              </span>
            )}
            <span className="tl-attachment__size">{formatAttachmentSize(file.size)}</span>
            {(canDownload || onRemove) && (
              <span className="tl-attachment__actions">
                {canDownload && (
                  <IconButton
                    icon="download"
                    label={t('common.download', { name: file.name })}
                    size={buttonSize}
                    onPress={() => startDownload(file.href as string, file.name)}
                  />
                )}
                {onRemove && (
                  <IconButton
                    icon="x"
                    label={t('common.delete', { name: file.name })}
                    size={buttonSize}
                    onPress={() => onRemove(file.name)}
                  />
                )}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
Attachment.displayName = AttachmentContract.name;
