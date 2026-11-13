import { defineContract, type ContractBase } from '../_base.js';

/** 보는 방법: image = 그림(확대 · 맞춤 · 회전), pdf = 브라우저 내장 PDF 보기(쪽 넘기기), other = 파일 카드(다운로드) */
export const FILE_VIEWER_KINDS = ['image', 'pdf', 'other'] as const;
export type FileViewerKind = (typeof FILE_VIEWER_KINDS)[number];

const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'bmp', 'svg']);

/** 파일 이름 · MIME으로 보는 방법을 정한다. MIME이 있으면 먼저 본다(image/* · application/pdf) */
export function fileViewerKind(name: string, mimeType?: string): FileViewerKind {
  const mime = mimeType?.toLowerCase() ?? '';
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf') return 'pdf';
  const dot = name.lastIndexOf('.');
  const ext = dot < 0 ? '' : name.slice(dot + 1).toLowerCase();
  if (ext === 'pdf') return 'pdf';
  return IMAGE_EXT.has(ext) ? 'image' : 'other';
}

/** 확대 단계(배율). 맞춤 배율에서 확대하면 그보다 큰 첫 단계로 간다 */
export const FILE_VIEWER_ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4] as const;

/** 지금 배율에서 한 단계 확대(1) · 축소(-1). 끝 단계면 그대로 */
export function nextZoom(scale: number, direction: 1 | -1): number {
  const steps = FILE_VIEWER_ZOOM_STEPS;
  if (direction > 0) return steps.find((s) => s > scale + 0.001) ?? steps[steps.length - 1]!;
  return [...steps].reverse().find((s) => s < scale - 0.001) ?? steps[0]!;
}

/** 쪽 번호를 1 ~ pageCount 안으로. pageCount를 모르면 1 이상만 */
export function clampPage(page: number, pageCount?: number): number {
  const p = Math.max(1, Math.round(Number.isFinite(page) ? page : 1));
  return pageCount && pageCount > 0 ? Math.min(p, pageCount) : p;
}

/**
 * 브라우저 내장 PDF 보기에 넘기는 주소. 쪽 · 배율은 주소 뒤 조각(#page=3&zoom=125)으로 넘기고,
 * 내장 도구 줄은 감춘다(FileViewer 도구 줄이 쪽 · 배율을 맡는다). zoom이 없으면 폭에 맞춤
 */
export function fileViewerPdfSrc(src: string, { page, zoom }: { page: number; zoom?: number }) {
  const base = src.split('#')[0]!;
  const view = zoom ? `zoom=${Math.round(zoom * 100)}` : 'view=FitH';
  return `${base}#page=${clampPage(page)}&${view}&toolbar=0&navpanes=0`;
}

export interface FileViewerProps extends ContractBase {
  /** 파일 이름(확장자 포함). 보는 방법 · 아이콘 · 다운로드 이름 · 접근성 이름 */
  name: string;
  /** 파일 주소(서버 주소 · blob: · data:). 없으면 파일 카드 */
  src?: string;
  /** 바이트(도구 줄의 형식 · 크기 한 줄) */
  size?: number;
  /** MIME(image/png · application/pdf). 없으면 확장자로 정한다 */
  mimeType?: string;
  /** 보는 방법. 없으면 MIME · 확장자로 정한다(fileViewerKind) */
  kind?: FileViewerKind;
  /** 그림 대체 글자. 없으면 파일 이름 */
  alt?: string;
  /** PDF 전체 쪽 수(서버가 아는 값). 있으면 "3 / 12"를 보이고 마지막 쪽에서 다음 쪽 단추가 꺼진다 */
  pageCount?: number;
  /** 지금 쪽(제어, 1부터) */
  page?: number;
  /** 처음 쪽(비제어) */
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** 보기 높이: sm 240 · md 400 · lg 560 · fill = 부모 남은 높이 */
  height?: 'sm' | 'md' | 'lg' | 'fill';
  /** 파일 주소를 받는 중(Skeleton) */
  loading?: boolean;
  /** 불러오지 못한 이유 한 문장. 있으면 오류 블록. 그림이 깨져도 기본 문구로 같은 블록이 선다 */
  error?: string;
  /** 오류 블록의 다시 시도. 없으면 그림을 다시 불러온다 */
  onRetry?: () => void;
  /** 다운로드를 누를 때. 없으면 src를 파일 이름으로 받는다 */
  onDownload?: () => void;
  /** 다운로드 단추(기본 true) */
  downloadable?: boolean;
}

export const FileViewerContract = defineContract<FileViewerProps>({
  name: 'FileViewer',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    name: { type: 'string', required: true, description: '파일 이름(확장자 포함)' },
    src: { type: 'string', description: '파일 주소(없으면 파일 카드)' },
    size: { type: 'number', description: '바이트' },
    mimeType: { type: 'string', description: 'MIME(없으면 확장자로)' },
    kind: {
      type: "'image' | 'pdf' | 'other'",
      values: FILE_VIEWER_KINDS,
      description: '보는 방법(없으면 MIME · 확장자로)',
    },
    alt: { type: 'string', description: '그림 대체 글자(없으면 파일 이름)' },
    pageCount: { type: 'number', description: 'PDF 전체 쪽 수' },
    page: { type: 'number', description: '지금 쪽(제어, 1부터)' },
    defaultPage: { type: 'number', default: 1, description: '처음 쪽' },
    onPageChange: { type: '(page: number) => void', description: '쪽이 바뀔 때' },
    height: {
      type: "'sm' | 'md' | 'lg' | 'fill'",
      default: 'md',
      values: ['sm', 'md', 'lg', 'fill'],
      description: '보기 높이(sm 240 · md 400 · lg 560 · fill)',
    },
    loading: { type: 'boolean', default: false, description: '주소를 받는 중(Skeleton)' },
    error: { type: 'string', description: '불러오지 못한 이유(오류 블록)' },
    onRetry: { type: '() => void', description: '오류 블록의 다시 시도' },
    onDownload: { type: '() => void', description: '다운로드(없으면 src를 받는다)' },
    downloadable: { type: 'boolean', default: true, description: '다운로드 단추' },
  },
  states: ['default', 'focus', 'loading', 'error'],
  a11y: {
    role: 'group',
    keyboard: [
      'Tab',
      '←/→ · Home/End(도구 사이)',
      'Enter/Space',
      '+ · − · 0 · R(그림 영역)',
      'PageUp/PageDown(쪽)',
    ],
    labelling: 'label-prop',
  },
  slots: ['toolbar', 'stage'],
  platforms: { web: true, native: true },
});
