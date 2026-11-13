import type { IconName } from '@terracelab/trellis-icons';
import { defineContract, type ContractBase } from '../_base.js';
import type { CurrencyCode, DeltaFormat } from '../_shared/format.js';
import type { DeltaPolarity } from '../Delta/Delta.contract.js';

/** 비교 증감. 카드 안에서 Delta 컴포넌트로 그린다. 색은 방향만 말한다(content.md §4) */
export interface KpiDelta {
  /** 증감 값(+ 증가 · − 감소). percent면 12.4 = 12.4%, point면 0.3 = 0.3%p(비율끼리의 차이: 불량률 · 점유율) */
  value: number;
  /** 비교 대상(전월 대비 · 전일 대비 · 전년 동기 대비) */
  label: string;
  format?: DeltaFormat;
  /** finance = 증가 finance.income(빨강) · 감소 finance.expense(파랑). up-good · up-bad = 상태 아이콘 + 중립 글자 */
  polarity?: DeltaPolarity;
}

export interface KpiCardProps extends ContractBase {
  /** 지표 이름(명사): 당월 매출 · 결재 대기 · 미수금 */
  label: string;
  value: number | string;
  /** 숫자 뒤 단위(건 · EA · 원). amount · compactWon은 기본 원 */
  unit?: string;
  format?: 'number' | 'amount' | 'percent' | 'currency' | 'compactWon';
  /** format = currency일 때 통화 */
  currency?: CurrencyCode;
  delta?: KpiDelta;
  /** 기준 · 기간(11월 1일~8일 누계) */
  caption?: string;
  /** 라벨 앞 작은 아이콘 */
  icon?: IconName;
  /** sm = 서랍 머리 · 상세 위 작은 지표(amount 글자), lg = 홈 첫 줄(display 글자) */
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  /** 값을 불러오지 못했다. true면 "불러오지 못함", 글자면 그 문구를 값 자리에 보인다 */
  error?: boolean | string;
  /** error일 때 값 자리의 다시 시도 단추 */
  onRetry?: () => void;
  /** 볼 권한이 없는 지표. 값 대신 가림 글자, 아래에 이유 한 줄(true면 "볼 권한이 없습니다") */
  masked?: boolean | string;
  /** 있으면 카드 전체가 버튼(상세로 이동). error일 때는 다시 시도 단추만 누른다 */
  onPress?: () => void;
}

export const KpiCardContract = defineContract<KpiCardProps>({
  name: 'KpiCard',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    label: { type: 'string', required: true, description: '지표 이름' },
    value: { type: 'number | string', required: true, description: '값' },
    unit: { type: 'string', description: '단위(amount · compactWon 기본 원)' },
    format: {
      type: "'number' | 'amount' | 'percent' | 'currency' | 'compactWon'",
      default: 'number',
      values: ['number', 'amount', 'percent', 'currency', 'compactWon'],
      description: '숫자 서식(contracts format 함수)',
    },
    currency: {
      type: "'KRW' | 'USD' | 'EUR' | 'JPY' | 'CNY'",
      default: 'KRW',
      description: 'format = currency의 통화',
    },
    delta: {
      type: "{ value: number; label: string; format?: 'percent' | 'point' | 'amount' | 'number'; polarity?: 'finance' | 'up-good' | 'up-bad' }",
      description: '비교 증감(Delta, 기본 percent · finance)',
    },
    caption: { type: 'string', description: '기준 · 기간' },
    icon: { type: 'IconName', description: '라벨 앞 아이콘' },
    size: {
      type: "'sm' | 'md' | 'lg'",
      default: 'md',
      values: ['sm', 'md', 'lg'],
      description: '값 글자 크기(amount · amount-lg · display)',
    },
    loading: { type: 'boolean', default: false, description: '불러오는 중(스켈레톤)' },
    error: {
      type: 'boolean | string',
      default: false,
      description: '불러오지 못함(글자면 그 문구)',
    },
    onRetry: { type: '() => void', description: '다시 시도(error일 때)' },
    masked: {
      type: 'boolean | string',
      default: false,
      description: '가린 값 + 이유 한 줄(글자면 그 이유)',
    },
    onPress: { type: '() => void', description: '눌렀을 때(카드 전체가 버튼)' },
  },
  states: ['default', 'hover', 'active', 'focus', 'loading', 'error'],
  a11y: { role: 'group', keyboard: ['Enter', 'Space'], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
