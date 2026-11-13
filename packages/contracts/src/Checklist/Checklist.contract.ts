import type { IconName } from '@terracelab/trellis-icons';
import { defineContract, type ContractBase } from '../_base.js';
import type { VocabEntry } from '../_shared/vocab.js';

/**
 * 점검 항목 상태(PG-37). 결산 마감 · 온보딩처럼 차례로 끝내는 일에 쓴다.
 * blocked = 앞선 일이 끝나야 할 수 있다(급여 확정 뒤 급여 전표). 라벨은 업무 화면 관습대로 "보류"
 */
export const CHECKLIST_STATES = {
  done: { label: '완료', tone: 'success' },
  doing: { label: '진행', tone: 'info' },
  pending: { label: '대기', tone: 'neutral' },
  blocked: { label: '보류', tone: 'warning' },
} as const satisfies Record<string, VocabEntry>;
export type ChecklistState = keyof typeof CHECKLIST_STATES;

/** 항목 하나에 붙는 행동 단추(대사하기 · 전표 입력 · 실사표 열기) */
export interface ChecklistAction {
  /** 단추 글자(동사 어간 · 명사, 2~6자) */
  label: string;
  icon?: IconName;
  onPress: () => void;
}

export interface ChecklistItem {
  id: string;
  /** 할 일(명사구): 은행 잔액 대사 · 급여 전표 */
  title: string;
  /** 보조 한 줄(범위 · 진행 상황 · 보류 이유) */
  description?: string;
  state: ChecklistState;
  /** 기한(ISO 날짜). 끝나지 않았는데 지나면 "N일 경과"로 보인다 */
  due?: string;
  /** 담당자 이름(팀 · 직함을 붙여도 된다) */
  owner?: string;
  /** 줄 끝 보조 글자(16건 · 3,960,000원 · 완료 11-06 15:40) */
  meta?: string;
  /** 행동 단추 하나 */
  action?: ChecklistAction;
  /** 체크 단추를 막는다(권한 없음). 행동 단추는 그대로 */
  disabled?: boolean;
}

export interface ChecklistProps extends ContractBase {
  items: readonly ChecklistItem[];
  /** 목록 이름(접근성). 보이는 제목은 감싸는 Card가 맡는다 */
  label: string;
  /**
   * 있으면 항목 앞 표시가 체크 단추가 된다(완료 ↔ 대기). 보류 항목 · disabled 항목은 누를 수 없다.
   * 없으면 상태는 보기만 한다(다른 화면에서 끝나면 상태가 바뀌는 목록)
   */
  onChange?: (id: string, done: boolean) => void;
  /** 위 진행 요약(완료 n / 전체 + 막대 + 남은 상태 수). 기본 true */
  showProgress?: boolean;
  /** 기한 계산 기준일(ISO). 없으면 오늘. 스토리 · 테스트 · 데모는 고정한다 */
  today?: string;
  /** 불러오는 중: 같은 모양의 Skeleton 줄 */
  loading?: boolean;
  /** 항목이 없을 때 글자(무엇이 없는지 + 다음 행동) */
  emptyText?: string;
}

/** 진행 요약: 상태별 수와 끝나지 않았는데 기한이 지난 수 */
export interface ChecklistProgress {
  total: number;
  done: number;
  doing: number;
  pending: number;
  blocked: number;
  overdue: number;
}

const isoDay = (d: string | Date) =>
  typeof d === 'string'
    ? d.slice(0, 10)
    : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** 항목 → 진행 요약(웹 · 네이티브 공용). today가 없으면 오늘 */
export function checklistProgress(
  items: readonly Pick<ChecklistItem, 'state' | 'due'>[],
  today: string | Date = new Date(),
): ChecklistProgress {
  const day = isoDay(today);
  const out: ChecklistProgress = {
    total: items.length,
    done: 0,
    doing: 0,
    pending: 0,
    blocked: 0,
    overdue: 0,
  };
  for (const i of items) {
    out[i.state] += 1;
    if (i.state !== 'done' && i.due && i.due.slice(0, 10) < day) out.overdue += 1;
  }
  return out;
}

export const ChecklistContract = defineContract<ChecklistProps>({
  name: 'Checklist',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    items: {
      type: 'ChecklistItem[]',
      required: true,
      description:
        '항목(id · title · description · state · due · owner · meta · action · disabled)',
    },
    label: { type: 'string', required: true, description: '목록 이름(접근성)' },
    onChange: {
      type: '(id: string, done: boolean) => void',
      description: '체크 단추를 누를 때(있으면 완료 ↔ 대기를 바꿀 수 있다)',
    },
    showProgress: { type: 'boolean', default: true, description: '진행 요약(완료 수 · 막대)' },
    today: { type: 'string', description: '기한 계산 기준일(ISO, 기본 오늘)' },
    loading: { type: 'boolean', default: false, description: '불러오는 중(Skeleton 줄)' },
    emptyText: { type: 'string', description: '항목이 없을 때 글자' },
  },
  states: ['default', 'hover', 'focus', 'disabled', 'loading'],
  a11y: { keyboard: ['Tab', 'Space(체크)', 'Enter(행동 단추)'], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
