// UI 아이콘 데이터 생성: Lucide에서 쓰는 것만 골라 src/generated/ui-icons.ts로 쓴다(P1-02, D-52).
// 아이콘을 쓰는 곳은 이 데이터 하나다. React는 trellis-react의 <Icon>, 네이티브는 react-native-svg로 그린다.
// 이름이 Lucide에 없으면 실패한다. 모듈 아이콘(modules.json의 icon)은 자동으로 포함한다.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { icons } from 'lucide';

const PKG = fileURLToPath(new URL('..', import.meta.url));
const require = createRequire(import.meta.url);
const modules = JSON.parse(
  readFileSync(require.resolve('@terracelab/trellis-tokens/modules'), 'utf8'),
);

export const UI_ICONS = [
  // 탐색 · 동작
  'search',
  'x',
  'check',
  'plus',
  'minus',
  'chevron-down',
  'chevron-up',
  'chevron-left',
  'chevron-right',
  'chevrons-left',
  'chevrons-right',
  'arrow-up',
  'arrow-down',
  'arrow-left',
  'arrow-right',
  'arrow-up-down',
  'ellipsis',
  'ellipsis-vertical',
  'menu',
  'mouse-pointer-2',
  'filter',
  'sliders-horizontal',
  'palette',
  'settings',
  'refresh-cw',
  'rotate-ccw',
  'external-link',
  'link',
  'copy',
  'pencil',
  'trash-2',
  'save',
  'send',
  'download',
  'upload',
  'printer',
  'paperclip',
  'grip-vertical',
  'maximize-2',
  'panel-left-close',
  'panel-left-open',
  'layout-grid',
  'layout-dashboard',
  'list',
  'columns-3',
  'table',
  'house',
  'star',
  'pin',
  'bookmark',
  'flag',
  'history',
  'undo-2',
  // 답변 평가(MessageThread 답변 동작 줄, PG-31)
  'thumbs-up',
  'thumbs-down',
  // 대화 · 옆 칸(MessageThread 반응 · 답글, 메신저 고정 공지, AppShell 옆 칸, 업무 도우미, PG-33 · PG-34 · PG-36)
  'smile-plus',
  'reply',
  'heart',
  'party-popper',
  'pin-off',
  'panel-right-open',
  'bot',
  // 상태 · 알림
  'bell',
  'bell-off',
  'info',
  'circle-alert',
  'triangle-alert',
  'circle-check',
  'circle-x',
  'circle-help',
  'circle-dot',
  'circle-pause',
  'loader-circle',
  'ban',
  'clock',
  'timer',
  'activity',
  'zap',
  'eye',
  'eye-off',
  // 사람 · 권한
  'user',
  'users',
  'user-plus',
  'user-cog',
  'log-in',
  'log-out',
  'lock',
  'lock-open',
  'key-round',
  'shield',
  'shield-check',
  'building-2',
  'map-pin',
  'globe',
  'mail',
  'phone',
  'smartphone',
  'monitor',
  'message-circle',
  'megaphone',
  'headset',
  'contact',
  'at-sign',
  // 문서 · 날짜
  'calendar',
  'calendar-days',
  'calendar-plus',
  'file',
  'file-text',
  'file-plus',
  'file-check',
  'file-spreadsheet',
  'file-pen',
  'folder',
  'inbox',
  'archive',
  'image',
  'stamp',
  'pen-line',
  'clipboard-check',
  'clipboard-list',
  'list-checks',
  // 파일 보기 · 오류 화면 · 엑셀 업로드(PG-44)
  'zoom-in',
  'zoom-out',
  'rotate-cw',
  'scan',
  'file-up',
  'map-pin-off',
  'timer-off',
  // 돈 · 세무
  'receipt',
  'credit-card',
  'wallet',
  'banknote',
  'calculator',
  'landmark',
  'coins',
  'percent',
  'scale',
  'sigma',
  'trending-up',
  'trending-down',
  'chart-bar',
  'chart-line',
  'chart-pie',
  // 물류 · 무역 · 커머스
  'package',
  'package-check',
  'package-open',
  'boxes',
  'warehouse',
  'truck',
  'ship',
  'plane',
  'container',
  'scan-barcode',
  'qr-code',
  'tag',
  'shopping-cart',
  'shopping-bag',
  'store',
  'ticket-percent',
  // 제조 · 시스템
  'factory',
  'gauge',
  'cog',
  'wrench',
  'badge-check',
  'layers',
  'server',
  'database',
  'workflow',
  'play',
  'pause',
  'square',
  'sun',
  'moon',
];

const pascal = (s) =>
  s
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('');

const names = [...new Set([...UI_ICONS, ...modules.modules.map((m) => m.icon)])].sort();
const missing = names.filter((n) => !icons[pascal(n)]);
if (missing.length) {
  console.error(`Lucide에 없는 아이콘: ${missing.join(', ')}`);
  process.exit(1);
}
const body = names
  .map((n) => `  ${JSON.stringify(n)}: ${JSON.stringify(icons[pascal(n)])},`)
  .join('\n');
const out = join(PKG, 'src/generated/ui-icons.ts');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(
  out,
  `// 생성물 — scripts/gen-ui-icons.mjs(Lucide ${require('lucide/package.json').version}, ISC). 수정 금지\n` +
    `/** [태그, 속성] 목록. viewBox 0 0 24 24, stroke 기반 */\n` +
    `export type IconNode = readonly (readonly [string, Readonly<Record<string, string | number>>])[];\n\n` +
    `export const ICON_NAMES = ${JSON.stringify(names)} as const;\n` +
    `export type IconName = (typeof ICON_NAMES)[number];\n\n` +
    `export const uiIcons: Readonly<Record<IconName, IconNode>> = {\n${body}\n};\n`,
);
console.log(`ui-icons: ${names.length}개 → src/generated/ui-icons.ts`);
