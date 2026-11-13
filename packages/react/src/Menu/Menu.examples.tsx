import { Button } from '../Button/Button.js';
import { IconButton } from '../IconButton/IconButton.js';
import { Menu } from './Menu.js';

const ROW_ACTIONS = [
  { id: 'edit', label: '수정', icon: 'pencil' },
  { id: 'copy', label: '복사해서 등록', icon: 'copy', shortcut: 'Ctrl+D' },
  { id: 'print', label: '발주서 인쇄', icon: 'printer', shortcut: 'Ctrl+P' },
  { type: 'separator' },
  { id: 'delete', label: '삭제', icon: 'trash-2', danger: true },
] as const;

const EXPORT_ITEMS = [
  { type: 'label', label: '파일' },
  { id: 'xlsx', label: '엑셀(.xlsx)', icon: 'file-spreadsheet' },
  { id: 'pdf', label: 'PDF', icon: 'file-text' },
  { type: 'separator' },
  { type: 'label', label: '보내기' },
  { id: 'mail', label: '거래처 메일로 보내기', icon: 'mail' },
  {
    id: 'erp',
    label: 'ERP 전송',
    icon: 'send',
    disabled: true,
    disabledReason: 'ERP 연동을 먼저 설정하세요',
  },
] as const;

/** 행 끝 더 보기 — 표 행의 보조 동작을 모은다. 삭제는 아이콘만 위험 색이다 */
export function RowActions() {
  return (
    <Menu
      trigger={<IconButton icon="ellipsis" label="발주 PO-2611-0042 동작" />}
      items={ROW_ACTIONS}
    />
  );
}

/** 묶음 — 이름으로 묶고 구분선으로 나눈다. 쓸 수 없는 항목은 비활성이고 이유를 툴팁으로 알린다 */
export function Groups() {
  return (
    <Menu
      align="start"
      trigger={<Button iconEnd="chevron-down">내보내기</Button>}
      items={EXPORT_ITEMS}
    />
  );
}
