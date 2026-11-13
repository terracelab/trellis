import { defineContract, type ContractBase } from '../_base.js';
import type { StatusTone } from '../_shared/vocab.js';

/** 칸(단계) */
export interface KanbanColumn {
  id: string;
  /** 단계 이름(명사) */
  title: string;
  /** 머리 상태 점 색 */
  tone?: StatusTone;
  /** 머리 오른쪽 작은 글자(확률 30%) */
  trailing?: string;
  /** 합계 아래 보조 줄(가중 금액 · 처리 기준) */
  caption?: string;
  /** 이 칸으로는 옮길 수 없다(옮기기 메뉴에서 비활성, 끌어 놓기 안 됨) */
  locked?: boolean;
}

/** 카드 하나. 기본 카드(KanbanCard)는 이 값으로 그린다 */
export interface KanbanCardItem {
  id: string;
  /** 지금 칸(KanbanColumn.id) */
  column: string;
  /** 첫 줄(거래처 · 건 이름) */
  title: string;
  /** 둘째 줄 보조 글자 */
  description?: string;
  /** 금액 줄 오른쪽 작은 글자(확률 · 번호) */
  trailing?: string;
  /** 금액(원). 칸 합계에도 들어간다 */
  amount?: number;
  /** 담당자 이름. 아래 왼쪽에 아바타와 이름 */
  owner?: string;
  /** 아래 왼쪽 보조 글자(담당 뒤) */
  meta?: string;
  /** 기한(ISO). 아래 오른쪽 DueBadge */
  due?: string;
  /** 처리를 끝냈다. 기한 대신 완료 라벨 */
  done?: boolean;
  /** done일 때 라벨(수주 · 입고 완료) */
  doneLabel?: string;
  /** 기한 대신 보일 상태(실주 사유 · 보류) */
  status?: { label: string; tone: StatusTone };
  /** 옮길 수 없는 카드 */
  locked?: boolean;
}

export interface KanbanBoardProps extends ContractBase {
  columns: readonly KanbanColumn[];
  /** 카드. 칸 안 순서는 이 배열 순서 */
  cards: readonly KanbanCardItem[];
  /** 보드 이름(접근성) */
  label: string;
  /** 카드를 옮길 때. index는 옮긴 뒤 그 칸 안의 순서(0부터). 없으면 옮기기 메뉴와 끌기가 없다 */
  onMove?: (cardId: string, toColumn: string, index: number) => void;
  onCardPress?: (card: KanbanCardItem) => void;
  /** 지금 열린 카드 */
  activeCardId?: string | null;
  /** 칸 머리에 금액 합계(카드 amount의 합) */
  summary?: boolean;
  /** 마우스로 끌어 옮기기(onMove가 있을 때) */
  draggable?: boolean;
  /** 기한 계산 기준일(ISO). 없으면 오늘 */
  today?: string;
  /** 기한이 이 일수 안이면 주의 색 */
  warnDays?: number;
  /** 웹: (card) => ReactNode. 카드 안 내용. 틀 · 옮기기 메뉴는 보드가 그린다 */
  renderCard?: unknown;
}

export const KanbanBoardContract = defineContract<KanbanBoardProps>({
  name: 'KanbanBoard',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    columns: { type: 'KanbanColumn[]', required: true, description: '칸(단계)' },
    cards: {
      type: 'KanbanCardItem[]',
      required: true,
      description: '카드(칸 안 순서 = 배열 순서)',
    },
    label: { type: 'string', required: true, description: '보드 이름(접근성)' },
    onMove: {
      type: '(cardId: string, toColumn: string, index: number) => void',
      description: '카드를 옮길 때(없으면 옮기기 없음)',
    },
    onCardPress: { type: '(card: KanbanCardItem) => void', description: '카드를 누를 때' },
    activeCardId: { type: 'string | null', description: '열린 카드' },
    summary: { type: 'boolean', default: true, description: '칸 머리 금액 합계' },
    draggable: { type: 'boolean', default: true, description: '마우스로 끌어 옮기기' },
    today: { type: 'string', description: '기한 기준일(ISO, 기본 오늘)' },
    warnDays: { type: 'number', default: 3, description: '기한 주의 일수' },
    renderCard: { type: '(card) => ReactNode', description: '카드 안 내용(기본 KanbanCard)' },
  },
  states: ['default', 'hover', 'focus'],
  a11y: {
    role: 'region',
    keyboard: ['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Space'],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
