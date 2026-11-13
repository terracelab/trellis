import { defineContract, type ContractBase } from '../_base.js';

export interface DrawerProps extends ContractBase {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  /** 오른쪽 패널(목록 · 상세의 상세) · 아래 시트(모바일) */
  side?: 'right' | 'bottom';
  width?: 'md' | 'lg' | 'xl';
  /** 아래 시트(side bottom) 높이. auto = 내용만큼(화면 85%까지) · full = 화면 92% 고정 */
  height?: 'auto' | 'full';
  trigger?: unknown;
  /** 제목 오른쪽 동작(수정 · 더 보기) */
  actions?: unknown;
  /** 아래 고정 동작 */
  footer?: unknown;
  /** 이전 건으로(목록 · 상세). 주면 머리에 이전 단추가 생기고 ← 키가 잇는다 */
  onPrev?: () => void;
  /** 다음 건으로. 주면 머리에 다음 단추가 생기고 → 키가 잇는다 */
  onNext?: () => void;
  /** 이전 단추의 접근성 이름. 기본은 사전의 "이전 건" */
  prevLabel?: string;
  /** 다음 단추의 접근성 이름. 기본은 사전의 "다음 건" */
  nextLabel?: string;
  children?: unknown;
}

export const DrawerContract = defineContract<DrawerProps>({
  name: 'Drawer',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    open: { type: 'boolean', description: '열림(제어)' },
    defaultOpen: { type: 'boolean', default: false, description: '처음 열림' },
    onOpenChange: { type: '(open: boolean) => void', description: '열림이 바뀔 때' },
    title: { type: 'string', required: true, description: '제목(문서 번호 · 이름)' },
    description: { type: 'string', description: '보조 설명' },
    side: {
      type: "'right' | 'bottom'",
      default: 'right',
      values: ['right', 'bottom'],
      description: '나오는 쪽',
    },
    width: {
      type: "'md' | 'lg' | 'xl'",
      default: 'lg',
      values: ['md', 'lg', 'xl'],
      description: '오른쪽 패널 폭(480 · 640 · 880)',
    },
    height: {
      type: "'auto' | 'full'",
      default: 'auto',
      values: ['auto', 'full'],
      description: '아래 시트 높이(auto 내용만큼 · full 화면 92%)',
    },
    trigger: { type: 'ReactElement', description: '여는 버튼' },
    actions: { type: 'ReactNode', description: '제목 오른쪽 동작' },
    footer: { type: 'ReactNode', description: '아래 고정 동작' },
    onPrev: {
      type: '() => void',
      description: '이전 건으로. 머리에 이전 단추, ← 키(입력 칸 밖에서만)',
    },
    onNext: {
      type: '() => void',
      description: '다음 건으로. 머리에 다음 단추, → 키(입력 칸 밖에서만)',
    },
    prevLabel: { type: 'string', description: '이전 단추 이름(기본 "이전 건")' },
    nextLabel: { type: 'string', description: '다음 단추 이름(기본 "다음 건")' },
    children: { type: 'ReactNode', description: '내용' },
  },
  states: ['default'],
  a11y: {
    role: 'dialog',
    keyboard: ['Escape(닫기)', 'Tab(안에서 순환)', 'ArrowLeft(이전 건)', 'ArrowRight(다음 건)'],
    labelling: 'label-prop',
  },
  slots: ['actions', 'footer'],
  platforms: { web: true, native: true },
});
