import { ModuleIconContract, type ModuleIconProps } from '@terracelab/trellis-contracts';
import type { IconName } from '@terracelab/trellis-icons';
import { moduleTileByModule, moduleTiles } from '@terracelab/trellis-icons/module-tiles';
import registry from '@terracelab/trellis-tokens/modules' with { type: 'json' };
import { useId, useMemo, type CSSProperties } from 'react';
import { cx, warnDev } from '../_internal/cx.js';
import { Icon } from '../Icon/Icon.js';

interface ModuleEntry {
  id: string;
  group: string;
  label: string;
  icon: string;
}

const MODULES = new Map<string, ModuleEntry>(
  (registry.modules as ModuleEntry[]).map((m) => [m.id, m]),
);

/** modules.json의 모듈 하나(없으면 undefined) */
export function moduleInfo(module: string): ModuleEntry | undefined {
  return MODULES.get(module);
}

/** 타일 SVG를 인라인으로 넣을 수 있게 다듬는다: 안쪽 라벨 제거(바깥 라벨 하나만), id 접두를 인스턴스마다 다르게 */
function inlineTile(svg: string, tileId: string, uid: string): string {
  const prefix = `tl-tile-${tileId}-`;
  return svg
    .replace(/<title[^>]*>[\s\S]*?<\/title>\s*/, '')
    .replace(/\srole="img"/, '')
    .replace(/\saria-labelledby="[^"]*"/, ' aria-hidden="true" focusable="false"')
    .split(prefix)
    .join(`${prefix}${uid}-`);
}

export function ModuleIcon({
  module,
  size = 40,
  label,
  decorative = false,
  id,
  testID,
  className,
}: ModuleIconProps & { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const info = MODULES.get(module);
  const tileId = moduleTileByModule[module];
  const markup = useMemo(
    () => (tileId ? inlineTile(moduleTiles[tileId], tileId, uid) : null),
    [tileId, uid],
  );
  if (!info) warnDev(`ModuleIcon: modules.json에 없는 모듈 id "${module}"`);
  const name = label ?? info?.label ?? module;
  const a11y = decorative
    ? { 'aria-hidden': true as const }
    : { role: 'img' as const, 'aria-label': name };
  const common = {
    id,
    'data-testid': testID,
    'data-size': size,
    'data-module': module,
    ...a11y,
  };

  if (markup) {
    return (
      <span
        {...common}
        className={cx('tl-module-icon', className)}
        data-kind="tile"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    );
  }
  const style = info
    ? ({
        '--tl-module-icon-from': `var(--tl-color-module-${info.group}-gradient-from)`,
        '--tl-module-icon-to': `var(--tl-color-module-${info.group}-gradient-to)`,
      } as CSSProperties)
    : undefined;
  return (
    <span
      {...common}
      className={cx('tl-module-icon', className)}
      data-kind={info ? 'fallback' : 'unknown'}
      style={style}
    >
      <Icon
        name={(info?.icon ?? 'layout-grid') as IconName}
        size={24}
        className="tl-module-icon__glyph"
      />
    </span>
  );
}
ModuleIcon.displayName = ModuleIconContract.name;
