// 선택지 앞 표시(Select · MultiSelect의 팝업 · 시트 · 닫힌 칸). 색은 토큰 이름에서만 온다.
// 모양은 Select.css(.tl-select__mark) — MultiSelect도 Select의 CSS를 함께 쓴다.
import {
  APPROVAL_STATES,
  CHART_COLORS,
  type ApprovalState,
  type ChartColor,
  type SelectLeading,
  type SelectMarkTone,
} from '@terracelab/trellis-contracts';
import type { CSSProperties } from 'react';
import { chartColor } from './chart/colors.js';
import { approvalVars, toneVars } from './tone.js';
import { Icon } from '../Icon/Icon.js';

const isChart = (tone: SelectMarkTone): tone is ChartColor =>
  (CHART_COLORS as readonly string[]).includes(tone);
const isApproval = (tone: SelectMarkTone): tone is ApprovalState =>
  (APPROVAL_STATES as readonly string[]).includes(tone);

/** 점 색 토큰: 차트 슬롯은 범례와 같은 색, 결재 상태는 결재 배지 점, info · neutral은 상태 점과 같은 색 */
export function markColor(tone: SelectMarkTone): string {
  if (isChart(tone)) return chartColor(tone);
  if (isApproval(tone)) return approvalVars(tone).solid;
  return toneVars(tone).solid;
}

/** 꾸밈 표시라 읽지 않는다(이름 글자가 뜻을 말한다) */
export function OptionMark({ leading }: { leading?: SelectLeading }) {
  if (!leading) return null;
  if (leading.kind === 'dot')
    return (
      <span
        className="tl-select__mark"
        data-kind="dot"
        data-tone={leading.tone}
        aria-hidden="true"
        style={{ '--tl-select-mark-color': markColor(leading.tone) } as CSSProperties}
      />
    );
  return (
    <span className="tl-select__mark" data-kind="icon" aria-hidden="true">
      <Icon name={leading.icon} />
    </span>
  );
}
