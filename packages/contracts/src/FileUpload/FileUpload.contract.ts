import { defineContract, type ContractBase } from '../_base.js';

export interface UploadFile {
  name: string;
  /** 바이트 */
  size: number;
  status?: 'uploading' | 'done' | 'error';
  /** 0~100(uploading일 때) */
  progress?: number;
  /** 무엇이 틀렸고 어떻게 고치는지(status error일 때) */
  error?: string;
}

export interface FileUploadProps extends ContractBase {
  /** 받을 형식(.pdf,.xlsx · image/*). 끌어 놓은 파일도 이 기준으로 거른다 */
  accept?: string;
  multiple?: boolean;
  /** 파일 하나의 최대 크기(바이트). 넘는 파일은 onFilesChange로 보내지 않고 안내한다 */
  maxSize?: number;
  /** 올렸거나 올리는 중인 파일(목록은 앱이 관리한다) */
  files?: readonly UploadFile[];
  /** 새로 고른 파일(웹 File · 네이티브 문서 선택 결과) */
  onFilesChange?: (files: unknown[]) => void;
  onRemove?: (name: string) => void;
  disabled?: boolean;
  /** 형식 · 크기 안내(PDF · XLSX, 10MB 이하) */
  hint?: string;
}

export const FileUploadContract = defineContract<FileUploadProps>({
  name: 'FileUpload',
  props: {
    id: { type: 'string', description: '숨은 input id(Field 안이면 자동)' },
    testID: { type: 'string', description: '테스트 식별자' },
    accept: { type: 'string', description: '받을 형식' },
    multiple: { type: 'boolean', default: false, description: '여러 파일' },
    maxSize: { type: 'number', description: '파일 하나의 최대 바이트' },
    files: { type: 'UploadFile[]', default: [], description: '파일 목록(앱이 관리)' },
    onFilesChange: { type: '(files: File[]) => void', description: '새로 고른 파일' },
    onRemove: { type: '(name: string) => void', description: '목록에서 삭제를 누를 때' },
    disabled: { type: 'boolean', default: false, description: '비활성' },
    hint: { type: 'string', description: '형식 · 크기 안내' },
  },
  states: ['default', 'hover', 'active', 'focus', 'disabled', 'error'],
  a11y: { keyboard: ['Tab', 'Enter', 'Space'], labelling: 'label-prop' },
  slots: ['zone', 'list'],
  platforms: { web: true, native: true },
});
