import { defineContract, type ContractBase } from '../_base.js';
import { formatAmount } from '../_shared/format.js';

export type AttachmentFileType = 'pdf' | 'xlsx' | 'image' | 'zip' | 'other';

export interface AttachmentFile {
  name: string;
  /** 바이트 */
  size: number;
  /** 없으면 확장자로 정한다 */
  type?: AttachmentFileType;
  /** 받을 주소. 없으면 다운로드 버튼을 숨긴다 */
  href?: string;
  /**
   * 그림 파일의 작은 미리 보기 주소(PG-36). 있으면 MessageThread가 칩 대신 그림으로 보이고
   * 누르면 크게 본다(원본은 href, 없으면 thumb). Attachment 목록 · 칩은 쓰지 않는다
   */
  thumb?: string;
}

export interface AttachmentProps extends ContractBase {
  files: readonly AttachmentFile[];
  /** 있으면 파일마다 삭제 버튼 */
  onRemove?: (name: string) => void;
  /** list = 본문 아래 목록, chips = 입력창 · 대화 안의 칩 */
  layout?: 'list' | 'chips';
  downloadable?: boolean;
}

const EXT: Record<string, AttachmentFileType> = {
  pdf: 'pdf',
  xlsx: 'xlsx',
  xls: 'xlsx',
  csv: 'xlsx',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  webp: 'image',
  svg: 'image',
  zip: 'zip',
  '7z': 'zip',
  rar: 'zip',
};

/** 파일 이름의 확장자로 종류를 정한다(모르면 other) */
export function inferAttachmentType(name: string): AttachmentFileType {
  const dot = name.lastIndexOf('.');
  if (dot < 0) return 'other';
  return EXT[name.slice(dot + 1).toLowerCase()] ?? 'other';
}

/** 파일 크기: 812B · 182KB · 2.4MB · 1.2GB(1,024 단위) */
export function formatAttachmentSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '–';
  if (bytes < 1024) return `${formatAmount(bytes)}B`;
  if (bytes < 1024 ** 2) return `${formatAmount(Math.round(bytes / 1024))}KB`;
  if (bytes < 1024 ** 3) return `${formatAmount(bytes / 1024 ** 2, { digits: 1 })}MB`;
  return `${formatAmount(bytes / 1024 ** 3, { digits: 1 })}GB`;
}

export const AttachmentContract = defineContract<AttachmentProps>({
  name: 'Attachment',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    files: {
      type: 'AttachmentFile[]',
      required: true,
      description: '파일(이름 · 바이트 · 종류 · 주소)',
    },
    onRemove: { type: '(name: string) => void', description: '삭제(있으면 버튼 표시)' },
    layout: {
      type: "'list' | 'chips'",
      default: 'list',
      values: ['list', 'chips'],
      description: '목록 · 칩',
    },
    downloadable: {
      type: 'boolean',
      default: true,
      description: '주소가 있으면 다운로드 버튼',
    },
  },
  states: ['default'],
  a11y: { role: 'list', keyboard: ['Tab', 'Enter', 'Space'], labelling: 'aria-label' },
  platforms: { web: true, native: true },
});
