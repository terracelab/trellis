import { defineContract, type ContractBase } from '../_base.js';
import type { LeaveBasis, LeaveKind } from '../_shared/worktime.js';

/** 휴가 종류 한 줄 */
export interface LeaveTypeBalance {
  kind: LeaveKind;
  /** 회사가 정한 이름(리프레시 휴가). 없으면 종류 이름 */
  label?: string;
  /** 발생 일수. 없으면 사용만 보인다(병가 · 경조 휴가처럼 쓸 때 생기는 휴가) */
  granted?: number;
  used: number;
}

export interface LeaveBalanceProps extends ContractBase {
  /** 발생 일수(연차) */
  granted: number;
  /** 사용 일수 */
  used: number;
  /** 결재가 끝난 앞으로의 사용 일수. 남은 연차에서 미리 뺀다 */
  planned?: number;
  /** 부여 기준 */
  basis?: LeaveBasis;
  /** 사용 기간 */
  period?: { from: string; to: string };
  /** 남은 연차가 소멸하는 날 */
  expiresOn?: string;
  /** 종류별 줄(보상 휴가 · 경조 휴가 · 병가) */
  types?: readonly LeaveTypeBalance[];
  /** 연차 사용 촉진(근로기준법 제61조): 1차 = 사용 시기 지정 요청, 2차 = 회사가 사용일 지정 */
  promotion?: { stage: 1 | 2; dueOn: string };
  /** 아래 동작(휴가 신청). 웹: ReactNode */
  action?: unknown;
  /** 카드 제목. 기본 사전 leaveBalance.title */
  title?: string;
  loading?: boolean;
}

export const LeaveBalanceContract = defineContract<LeaveBalanceProps>({
  name: 'LeaveBalance',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    granted: { type: 'number', required: true, description: '발생 일수' },
    used: { type: 'number', required: true, description: '사용 일수' },
    planned: { type: 'number', default: 0, description: '사용 예정 일수(남은 연차에서 뺀다)' },
    basis: {
      type: "'fiscal' | 'hire'",
      values: ['fiscal', 'hire'],
      description: '부여 기준(회계연도 · 입사일)',
    },
    period: { type: '{ from: string; to: string }', description: '사용 기간' },
    expiresOn: { type: 'string', description: '소멸일' },
    types: { type: 'LeaveTypeBalance[]', description: '종류별 줄' },
    promotion: { type: '{ stage: 1 | 2; dueOn: string }', description: '연차 사용 촉진 안내' },
    action: { type: 'ReactNode', description: '아래 동작(휴가 신청)' },
    title: { type: 'string', description: '카드 제목' },
    loading: { type: 'boolean', default: false, description: '불러오는 중(스켈레톤)' },
  },
  states: ['default', 'loading'],
  a11y: { keyboard: [], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
