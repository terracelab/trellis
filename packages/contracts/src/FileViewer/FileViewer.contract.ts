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

/** 그림 위 위치 코멘트 핀(R-02). x · y는 회전 전 원본 그림 기준 0~1 비율이라 확대 · 회전해도 같은 자리에 선다 */
export interface FileViewerPin {
  id: string;
  /** 그림 왼쪽에서 0~1 */
  x: number;
  /** 그림 위에서 0~1 */
  y: number;
  /** 핀 글자(번호). 없으면 목록 순서 1부터 */
  label?: string;
  /** 코멘트 첫 줄. 핀 단추의 접근성 이름에 붙는다 */
  title?: string;
  /** 해결된 코멘트: 회색 핀 */
  resolved?: boolean;
}

/** 0~1 비율 점을 회전한 그림(오른쪽으로 90도 단위) 위 자리로. 핀을 그릴 때 쓴다 */
export function rotatePinPoint(point: { x: number; y: number }, rotation: number) {
  const r = ((Math.round(rotation / 90) % 4) + 4) % 4;
  if (r === 1) return { x: 1 - point.y, y: point.x };
  if (r === 2) return { x: 1 - point.x, y: 1 - point.y };
  if (r === 3) return { x: point.y, y: 1 - point.x };
  return { x: point.x, y: point.y };
}

/** rotatePinPoint의 반대: 회전한 그림 위에서 누른 자리를 원본 그림 비율로 */
export function unrotatePinPoint(point: { x: number; y: number }, rotation: number) {
  return rotatePinPoint(point, 360 - (((rotation % 360) + 360) % 360));
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
  /** 그림 위 위치 코멘트 핀(그림만). 시안 검수에서 버전마다 받은 코멘트 */
  pins?: readonly FileViewerPin[];
  /** 강조할 핀(옆 목록에서 고른 코멘트) */
  activePin?: string | null;
  /** 핀을 누를 때(옆 목록의 그 코멘트로 간다) */
  onPinPress?: (id: string) => void;
  /** 있으면 도구 줄에 "위치 코멘트" 단추. 켜고 그림을 누르면(방향 키로 옮기고 Enter) 그 자리를 0~1 비율로 받는다 */
  onPinAdd?: (point: { x: number; y: number }) => void;
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
    pins: {
      type: 'FileViewerPin[]',
      description: '그림 위 위치 코멘트 핀(x · y는 원본 그림 0~1, label · title · resolved)',
    },
    activePin: { type: 'string | null', description: '강조할 핀 id' },
    onPinPress: { type: '(id: string) => void', description: '핀을 누를 때' },
    onPinAdd: {
      type: '(point: { x: number; y: number }) => void',
      description: '있으면 "위치 코멘트" 도구. 그림에서 고른 자리(0~1)를 받는다',
    },
  },
  states: ['default', 'focus', 'loading', 'error'],
  a11y: {
    role: 'group',
    keyboard: [
      'Tab',
      '←/→ · Home/End(도구 사이)',
      'Enter/Space',
      '+ · − · 0 · R(그림 영역)',
      '방향 키 · Enter · Esc(위치 코멘트를 켰을 때 자리 옮기기 · 고르기 · 그만두기)',
      'PageUp/PageDown(쪽)',
    ],
    labelling: 'label-prop',
  },
  slots: ['toolbar', 'stage'],
  platforms: { web: true, native: true },
});
