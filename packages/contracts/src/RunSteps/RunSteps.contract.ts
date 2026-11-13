import { defineContract, type ContractBase } from '../_base.js';
import type { AgentRunState } from '../_shared/vocab.js';

/** 실행 단계 하나(도구 실행 · 조회 · 계산) */
export interface RunStep {
  id: string;
  /** 무엇을 했는지(명사구: 전표 조회 · 규정 문서 찾기) */
  name: string;
  /** AGENT_RUN_STATES(D-116) */
  state: AgentRunState;
  /** 걸린 시간(밀리초). 실행 중이면 지금까지 */
  durationMs?: number;
  /** 이름 옆 보조 글자(조회 조건 · 대상 건수) */
  description?: string;
  /** 펼친 상세(도구 입력 · 결과 요약 · 오류). 웹은 ReactNode. 있으면 줄을 눌러 펼친다 */
  detail?: unknown;
}

export interface RunStepsProps extends ContractBase {
  steps: readonly RunStep[];
  /** 목록 이름. 기본 "실행 단계" */
  label?: string;
  /** 처음 펼친 단계 id. 없으면 실패 · 확인 대기 단계를 펼친다 */
  defaultExpanded?: readonly string[];
  /** 요약 한 줄(상태 · 단계 수 · 걸린 시간)로 접어 둔다(답변 위). 누르면 목록이 펼쳐진다 */
  collapsible?: boolean;
  /** collapsible일 때 처음 펼침. 없으면 실행 중 · 확인 대기 · 실패가 있을 때만 펼친다 */
  defaultOpen?: boolean;
}

/**
 * 단계들의 전체 상태(요약 줄 · 답변 상태). 실패 → 중단 → 확인 대기 → 실행 중 → 대기 → 완료 순으로 앞선 것이 이긴다.
 * 끝난 단계와 대기 단계가 섞여 있으면 실행 중이다. 단계가 없으면 완료
 */
export function runStepsState(steps: readonly Pick<RunStep, 'state'>[]): AgentRunState {
  const has = (s: AgentRunState) => steps.some((step) => step.state === s);
  if (has('failed')) return 'failed';
  if (has('canceled')) return 'canceled';
  if (has('waiting')) return 'waiting';
  if (has('running')) return 'running';
  if (has('queued')) return has('succeeded') ? 'running' : 'queued';
  return 'succeeded';
}

export const RunStepsContract = defineContract<RunStepsProps>({
  name: 'RunSteps',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    steps: {
      type: '{ id; name; state: AgentRunState; durationMs?; description?; detail?: ReactNode }[]',
      required: true,
      description: '실행 단계(위에서 아래로 실행 순서)',
    },
    label: { type: 'string', description: '목록 이름(기본 실행 단계)' },
    defaultExpanded: {
      type: 'string[]',
      description: '처음 펼친 단계 id(없으면 실패 · 확인 대기)',
    },
    collapsible: { type: 'boolean', default: false, description: '요약 한 줄로 접어 둔다' },
    defaultOpen: { type: 'boolean', description: 'collapsible일 때 처음 펼침' },
  },
  states: ['default', 'hover', 'focus'],
  a11y: {
    role: 'list',
    keyboard: ['Tab', 'Enter · Space(단계 펼치기 · 요약 펼치기)'],
    labelling: 'label-prop',
  },
  slots: ['detail'],
  platforms: { web: true, native: true },
});
