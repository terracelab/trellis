import { defineContract, type ContractBase } from '../_base.js';
import type { ChartColor } from '../charts/_shared.js';

/** 화면 위 한 점(px, 화면 왼쪽 위 기준. getBoundingClientRect와 같은 좌표) */
export interface AgentReplayPoint {
  x: number;
  y: number;
}

/** 화면 위 사각형(px, getBoundingClientRect와 같은 좌표) */
export interface AgentReplayRect extends AgentReplayPoint {
  width: number;
  height: number;
}

/** 누름 물결 하나. id가 바뀌면 새 물결이다 */
export interface AgentReplayRipple extends AgentReplayPoint {
  id: string;
}

/** 재생 상태. running = 화면을 옮기며 하는 중, done = 끝남(요약 · 결과 보기), stopped = 사람이 멈춤 */
export type AgentReplayStatus = 'running' | 'done' | 'stopped';

export interface AgentReplayProps extends ContractBase {
  status: AgentReplayStatus;
  /** 누가 하는지(에이전트 · 담당 축 이름). 띠 맨 앞 */
  label: string;
  /** label 앞 점 색(차트 슬롯 이름. 범주 식별색이 생기면 그 슬롯을 받는다) */
  labelColor?: ChartColor;
  /** 지금 하는 일 한 줄("거래처 칸에 한빛상사를 넣는 중") */
  caption: string;
  /** 지금 화면까지의 길(메뉴 이름들). 넓은 화면에서만 띠에 보인다 */
  trail?: readonly string[];
  /** 지금 단계(1부터) */
  index?: number;
  /** 전체 단계 수 */
  total?: number;
  /** 남은 시간 · 남은 일 글자("약 20초 남음") */
  remaining?: string;
  /** 커서 자리. 없으면 커서를 그리지 않는다 */
  pointer?: AgentReplayPoint | null;
  /** 지금 다루는 칸의 테두리 자리 */
  ring?: AgentReplayRect | null;
  /** 누름 물결 */
  ripples?: readonly AgentReplayRipple[];
  /** 건너뛰기(재생을 끝까지 바로). 없으면 단추가 없다 */
  onSkip?: () => void;
  /** 멈추기(running) · 닫기(done · stopped) */
  onStop?: () => void;
  /** 끝났을 때 한 줄 요약("세금계산서 1건을 발행했습니다") */
  summary?: string;
  /** 끝났을 때 결과 보기. 없으면 단추가 없다 */
  onOpenResult?: () => void;
}

export const AgentReplayContract = defineContract<AgentReplayProps>({
  name: 'AgentReplay',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    status: {
      type: "'running' | 'done' | 'stopped'",
      required: true,
      values: ['running', 'done', 'stopped'],
      description: '재생 상태',
    },
    label: { type: 'string', required: true, description: '누가 하는지(띠 맨 앞)' },
    labelColor: { type: 'ChartColor', description: 'label 앞 점 색(차트 슬롯)' },
    caption: { type: 'string', required: true, description: '지금 하는 일 한 줄' },
    trail: { type: 'string[]', description: '지금 화면까지의 길(넓은 화면만)' },
    index: { type: 'number', description: '지금 단계(1부터)' },
    total: { type: 'number', description: '전체 단계 수' },
    remaining: { type: 'string', description: '남은 시간 · 남은 일 글자' },
    pointer: { type: 'AgentReplayPoint | null', description: '커서 자리(px, 화면 기준)' },
    ring: { type: 'AgentReplayRect | null', description: '지금 다루는 칸의 테두리 자리' },
    ripples: { type: 'AgentReplayRipple[]', description: '누름 물결' },
    onSkip: { type: '() => void', description: '건너뛰기(끝까지 바로)' },
    onStop: { type: '() => void', description: '멈추기 · 닫기' },
    summary: { type: 'string', description: '끝났을 때 한 줄 요약' },
    onOpenResult: { type: '() => void', description: '결과 보기' },
  },
  states: ['default', 'focus'],
  a11y: {
    role: 'status',
    keyboard: ['Tab(띠의 단추)', 'Enter · Space(건너뛰기 · 멈추기 · 결과 보기)'],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: false },
});
