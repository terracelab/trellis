import { defineContract, type ContractBase } from '../_base.js';
import type { HrMasterRecord, HrRecordSection } from '../_shared/hr.js';

/** 칸마다 따로 볼 수 있는 가린 정보 */
export type HrMaskedField = 'rrn' | 'bankAccount';

export interface HrRecordProps extends ContractBase {
  /** 인사기록카드 한 장(인사 마스터) */
  record: HrMasterRecord;
  /** 보일 항목과 순서. 기본은 전부(HR_RECORD_SECTIONS) */
  sections?: readonly HrRecordSection[];
  /** 가린 정보(주민등록번호 뒷자리 · 계좌번호)를 보이는지(제어). 권한 확인은 앱이 한다 */
  revealed?: boolean;
  /** 있으면 "가린 정보 보기" 단추가 생긴다 */
  onRevealChange?: (revealed: boolean) => void;
  /**
   * 있으면 주민등록번호 · 계좌번호 옆에 보기 단추(MaskedValue)가 생긴다. 사유를 받은 뒤 부르고,
   * 앱이 권한 확인 · 열람 기록을 한다. 원문을 돌려주면 그것을, 아니면 record의 값을 잠깐 보인다
   */
  onRevealField?: (field: HrMaskedField, reason: string) => Promise<string | void>;
  /** 위쪽 항목 이동 링크 줄(기본 true) */
  nav?: boolean;
  /** 근속을 셀 오늘(YYYY-MM-DD). 기본은 오늘 */
  today?: string;
  /** 항목 제목 단계(기본 2) */
  headingLevel?: 2 | 3 | 4;
}

export const HrRecordContract = defineContract<HrRecordProps>({
  name: 'HrRecord',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    record: { type: 'HrMasterRecord', required: true, description: '인사기록카드 내용' },
    sections: { type: 'HrRecordSection[]', description: '보일 항목 · 순서(기본 전부)' },
    revealed: {
      type: 'boolean',
      default: false,
      description: '가린 정보 보임(주민등록번호 · 계좌번호)',
    },
    onRevealChange: {
      type: '(revealed: boolean) => void',
      description: '가린 정보 보기 단추를 누를 때(없으면 단추 없음)',
    },
    onRevealField: {
      type: "(field: 'rrn' | 'bankAccount', reason: string) => Promise<string | void>",
      description: '칸별 보기(사유 → 권한 확인 · 기록은 앱, MaskedValue)',
    },
    nav: { type: 'boolean', default: true, description: '항목 이동 링크 줄' },
    today: { type: 'string', description: '근속 기준일(기본 오늘)' },
    headingLevel: {
      type: '2 | 3 | 4',
      default: 2,
      values: ['2', '3', '4'],
      description: '항목 제목 단계',
    },
  },
  states: ['default', 'focus'],
  a11y: { keyboard: ['Tab', 'Enter'], labelling: 'aria-label' },
  platforms: { web: true, native: true },
});
