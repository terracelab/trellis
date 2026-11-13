import { defineContract, type ContractBase } from '../_base.js';

export interface MaskedValueProps extends ContractBase {
  /** 가린 글자(formatRrn · maskAccount · maskPhone · maskName · maskAddress의 결과) */
  value: string;
  /** 무엇의 값인지(주민등록번호 · 계좌번호). 단추 · 대화상자 이름에 쓴다 */
  label: string;
  /**
   * 사유를 받아 원문을 돌려준다. 권한 확인 · 열람 기록은 앱이 여기서 한다.
   * 없으면 보기 단추가 없다(가린 글자만)
   */
  onReveal?: (reason: string) => Promise<string>;
  /** 원문을 보이는 시간(초). 끝나면 다시 가린다. 기본 60 */
  revealSeconds?: number;
  /** 원문이 보이는 동안 복사 단추 */
  copyable?: boolean;
  /** false면 보기 단추 대신 자물쇠 + lockedReason */
  canReveal?: boolean;
  /** canReveal = false일 때 이유. 기본 "볼 권한이 없습니다" */
  lockedReason?: string;
}

export const MaskedValueContract = defineContract<MaskedValueProps>({
  name: 'MaskedValue',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    value: { type: 'string', required: true, description: '가린 글자' },
    label: { type: 'string', required: true, description: '값 이름(단추 · 대화상자 이름)' },
    onReveal: {
      type: '(reason: string) => Promise<string>',
      description: '사유 → 원문(권한 확인 · 기록은 앱)',
    },
    revealSeconds: { type: 'number', default: 60, description: '원문을 보이는 시간(초)' },
    copyable: { type: 'boolean', default: false, description: '원문 복사 단추' },
    canReveal: { type: 'boolean', default: true, description: 'false면 자물쇠 + 이유' },
    lockedReason: { type: 'string', description: '볼 수 없는 이유' },
  },
  states: ['default', 'focus', 'disabled'],
  a11y: { keyboard: ['Tab', 'Enter', 'Space'], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
