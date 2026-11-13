// 밀도 비교: 같은 홈 조각을 compact·comfortable로 나란히(D3 판단용)
import { section, value } from '../lib';
import { approvalList, noticeCards, statCards } from './home';

function frame(density: 'compact' | 'comfortable'): string {
  const spec = [
    ['행', value('density-row-height', density)],
    ['컨트롤 md', value('density-control-height-md', density)],
    ['카드 패딩', value('density-card-padding', density)],
    [
      '본문',
      `${value('density-body-font-size', density)}/${value('density-body-line-height', density)}`,
    ],
  ]
    .map(([k, val]) => `<span>${k} <strong>${val}</strong></span>`)
    .join('');
  return `<div class="tl-preview-density" data-density="${density}">
  <div class="tl-preview-density-head"><h3 class="tl-preview-card-title">${density}</h3><div class="tl-preview-density-spec">${spec}</div></div>
  <div class="tl-preview-density-body">${statCards()}${noticeCards(3)}${approvalList()}</div>
</div>`;
}

export function patternSection(): string {
  return section(
    'pattern',
    '밀도 비교',
    '같은 알림 카드 홈 조각을 compact(기본)와 comfortable로 나란히 놓았다. 상단 토글과 무관하게 각각 고정',
    `<div class="tl-preview-density-row">${frame('compact')}${frame('comfortable')}</div>`,
  );
}
