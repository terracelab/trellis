import { IconButton } from '../IconButton/IconButton.js';
import { Tooltip, TooltipProvider } from './Tooltip.js';

/** 아이콘 툴바 — 붙어 있는 툴팁은 TooltipProvider로 묶어 옆으로 옮기면 바로 열린다 */
export function IconToolbar() {
  return (
    <TooltipProvider>
      <div style={{ display: 'flex', gap: 'var(--tl-space-4)' }}>
        <Tooltip content="발주서 인쇄">
          <IconButton icon="printer" label="발주서 인쇄" />
        </Tooltip>
        <Tooltip content="엑셀 다운로드">
          <IconButton icon="download" label="엑셀 다운로드" />
        </Tooltip>
        <Tooltip content="열 설정" side="bottom">
          <IconButton icon="columns-3" label="열 설정" />
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
