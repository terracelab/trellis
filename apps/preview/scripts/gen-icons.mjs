// modules.json의 아이콘과 샘플 아이콘의 Lucide 노드를 src/generated/icons.ts로 뽑는다.
// Lucide에 없는 이름이 있으면 실패한다(components.md §7: 없는 이름이면 빌드 실패).
import { mkdirSync, writeFileSync } from 'node:fs';
import { icons } from 'lucide';
import modules from '@terracelab/trellis-tokens/modules' with { type: 'json' };

export const SAMPLE_ICONS = [
  'search',
  'bell',
  'settings',
  'plus',
  'download',
  'upload',
  'check',
  'x',
  'chevron-right',
  'calendar',
  'user',
  'ellipsis',
];

/** 쇼케이스 패턴(하단 탭바·증감 표시 등)에 쓰는 아이콘 */
export const PATTERN_ICONS = [
  'house',
  'layout-grid',
  'arrow-up-right',
  'arrow-down-right',
  'chevron-left',
  'chevron-down',
  'menu',
  // 사이드바 보강(프로필·빠른 실행·즐겨찾기·공지·푸터)
  'star',
  'send',
  'file-plus',
  'calendar-plus',
  'megaphone',
  'circle-help',
  'panel-left-close',
  // 차트 섹션(증감·상태)
  'triangle-alert',
  'circle-alert',
  'table-2',
  // 업무 영역 판: 모듈이 없는 영역(에이전트 대화)의 타일
  'bot',
];

const pascal = (name) =>
  name
    .split('-')
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join('');

const wanted = [
  ...new Set([...modules.modules.map((m) => m.icon), ...SAMPLE_ICONS, ...PATTERN_ICONS]),
];
const custom = wanted.filter((n) => n.startsWith('custom:'));
if (custom.length) throw new Error(`자체 아이콘은 아직 지원하지 않는다: ${custom.join(', ')}`);
const missing = wanted.filter((n) => !icons[pascal(n)]);
if (missing.length) {
  console.error(`Lucide에 없는 아이콘 이름: ${missing.join(', ')}`);
  process.exit(1);
}

const entries = wanted.map((n) => `  ${JSON.stringify(n)}: ${JSON.stringify(icons[pascal(n)])},`);
const out = `// 생성물 — scripts/gen-icons.mjs. 수정 금지
export type IconNode = readonly (readonly [string, Readonly<Record<string, string>>])[];

export const SAMPLE_ICONS = ${JSON.stringify(SAMPLE_ICONS)} as const;

export const icons: Readonly<Record<string, IconNode>> = {
${entries.join('\n')}
};
`;
mkdirSync(new URL('../src/generated/', import.meta.url), { recursive: true });
writeFileSync(new URL('../src/generated/icons.ts', import.meta.url), out);
console.log(
  `icons.ts: Lucide ${wanted.length}개 (모듈 ${modules.modules.length}개 + 샘플 ${SAMPLE_ICONS.length}개 + 패턴 ${PATTERN_ICONS.length}개, 이름 모두 유효)`,
);
