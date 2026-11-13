import {
  FileUploadContract,
  formatPercent,
  formatQuantity,
  type FileUploadProps,
  type UploadFile,
} from '@terracelab/trellis-contracts';
import type { IconName } from '@terracelab/trellis-icons';
import { useId, useRef, useState, type CSSProperties } from 'react';
import { cx } from '../_internal/cx.js';
import { useFieldControl } from '../_internal/field.js';
import { Icon } from '../Icon/Icon.js';
import { IconButton } from '../IconButton/IconButton.js';
import { useMessages } from '../_internal/locale.js';

export type FileUploadWebProps = Omit<FileUploadProps, 'onFilesChange'> & {
  onFilesChange?: (files: File[]) => void;
  className?: string;
};

const KB = 1024;
const MB = KB * 1024;

/** 파일 크기: 1MB 미만은 KB, 그 위는 MB(소수 1자리) */
function formatFileSize(bytes: number): string {
  if (bytes >= MB) return formatQuantity(bytes / MB, 'MB', Number.isInteger(bytes / MB) ? 0 : 1);
  return formatQuantity(bytes / KB, 'KB', 1);
}

const extension = (name: string) => name.split('.').pop()?.toLowerCase() ?? '';

function fileIcon(name: string): IconName {
  const ext = extension(name);
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'file-spreadsheet';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'heic', 'bmp'].includes(ext)) return 'image';
  if (['pdf', 'hwp', 'hwpx', 'doc', 'docx', 'txt'].includes(ext)) return 'file-text';
  return 'file';
}

/** accept(".pdf,.xlsx,image/*")에 맞는지. 끌어 놓은 파일은 브라우저가 거르지 않는다 */
function accepts(file: File, accept?: string): boolean {
  if (!accept) return true;
  const ext = `.${extension(file.name)}`;
  const type = file.type.toLowerCase();
  return accept
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) =>
      rule.startsWith('.')
        ? ext === rule
        : rule.endsWith('/*')
          ? type.startsWith(rule.slice(0, -1))
          : type === rule,
    );
}

export function FileUpload({
  accept,
  multiple = false,
  maxSize,
  files = [],
  onFilesChange,
  onRemove,
  disabled,
  hint,
  id,
  testID,
  className,
}: FileUploadWebProps) {
  const t = useMessages();
  const field = useFieldControl({ id, disabled });
  const base = useId();
  const titleId = `${base}-title`;
  const hintId = `${base}-hint`;
  const depth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);

  const take = (list: FileList | null) => {
    if (!list || field.disabled) return;
    const picked = multiple ? Array.from(list) : Array.from(list).slice(0, 1);
    const ok: File[] = [];
    const notes: string[] = [];
    for (const f of picked) {
      if (!accepts(f, accept)) notes.push(t('fileUpload.badType', { name: f.name }));
      else if (maxSize != null && f.size > maxSize)
        notes.push(t('fileUpload.tooLarge', { name: f.name, size: formatFileSize(maxSize) }));
      else ok.push(f);
    }
    setRejected(notes);
    if (ok.length) onFilesChange?.(ok);
  };

  const describedBy = [hint ? hintId : undefined, field.describedBy].filter(Boolean).join(' ');
  const labelledBy = [field.labelId, titleId].filter(Boolean).join(' ');

  return (
    <div
      className={cx('tl-file-upload', className)}
      data-testid={testID}
      data-state={
        field.invalid || rejected.length ? 'error' : field.disabled ? 'disabled' : undefined
      }
    >
      <label
        className="tl-file-upload__zone"
        data-dragging={dragging || undefined}
        data-disabled={field.disabled || undefined}
        onDragEnter={(e) => {
          e.preventDefault();
          if (field.disabled) return;
          depth.current += 1;
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = field.disabled ? 'none' : 'copy';
        }}
        onDragLeave={() => {
          depth.current = Math.max(0, depth.current - 1);
          if (depth.current === 0) setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          depth.current = 0;
          setDragging(false);
          take(e.dataTransfer.files);
        }}
      >
        <input
          type="file"
          className="tl-file-upload__input tl-sr-only"
          id={field.id}
          accept={accept}
          multiple={multiple}
          disabled={field.disabled}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy || undefined}
          aria-invalid={field.invalid || undefined}
          onChange={(e) => {
            take(e.target.files);
            // 같은 파일을 다시 골라도 change가 나게 비운다
            e.target.value = '';
          }}
        />
        <Icon name="upload" size={20} className="tl-file-upload__icon" />
        <span className="tl-file-upload__title" id={titleId}>
          {t('fileUpload.drop')}
        </span>
        {hint && (
          <span className="tl-file-upload__hint" id={hintId}>
            {hint}
          </span>
        )}
      </label>
      {rejected.length > 0 && (
        <ul className="tl-file-upload__notice" role="alert">
          {rejected.map((n) => (
            <li key={n} className="tl-file-upload__notice-item">
              <Icon name="circle-alert" className="tl-file-upload__notice-icon" />
              {n}
            </li>
          ))}
        </ul>
      )}
      {files.length > 0 && (
        <ul className="tl-file-upload__list" aria-label={t('common.attachments')}>
          {files.map((f) => (
            <FileRow key={f.name} file={f} onRemove={onRemove} disabled={field.disabled} />
          ))}
        </ul>
      )}
    </div>
  );
}
FileUpload.displayName = FileUploadContract.name;

function FileRow({
  file,
  onRemove,
  disabled,
}: {
  file: UploadFile;
  onRemove?: ((name: string) => void) | undefined;
  disabled: boolean;
}) {
  const t = useMessages();
  const status = file.status ?? 'done';
  const progress = Math.min(100, Math.max(0, file.progress ?? 0));
  return (
    <li className="tl-file-upload__file" data-status={status}>
      <Icon
        name={status === 'error' ? 'circle-alert' : fileIcon(file.name)}
        className="tl-file-upload__file-icon"
      />
      <div className="tl-file-upload__file-body">
        <div className="tl-file-upload__file-head">
          <span className="tl-file-upload__name" title={file.name}>
            {file.name}
          </span>
          <span className="tl-file-upload__meta">
            {formatFileSize(file.size)}
            {status === 'uploading' && ` · ${formatPercent(progress, 0)}`}
            {status === 'done' && t('fileUpload.done')}
          </span>
        </div>
        {status === 'uploading' && (
          <div
            className="tl-file-upload__progress"
            role="progressbar"
            aria-label={t('fileUpload.uploading', { name: file.name })}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            style={{ '--tl-file-upload-progress': `${progress}%` } as CSSProperties}
          >
            <span className="tl-file-upload__progress-bar" />
          </div>
        )}
        {status === 'error' && file.error && (
          <span className="tl-file-upload__error">{file.error}</span>
        )}
      </div>
      {onRemove && (
        <IconButton
          icon="x"
          label={t('common.delete', { name: file.name })}
          size="sm"
          disabled={disabled}
          onPress={() => onRemove(file.name)}
        />
      )}
    </li>
  );
}
