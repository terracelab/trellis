// 좁은 화면의 DataGrid: 행마다 카드(D-61). 열 역할은 column.mobile이 정하고, 없으면 표가 정한다.
import type { DataGridColumn } from '@terracelab/trellis-contracts';
import { isNumericColumn } from './model.js';

export interface CardRoles<C> {
  title: C | undefined;
  trailing: C | undefined;
  status: C[];
  meta: C[];
}

/**
 * title = mobile 'title' 또는 첫 글자 열, trailing = 'trailing' 또는 첫 금액 열(없으면 첫 숫자 열),
 * status = 'status' 열들, meta = 'meta' 열 + 남은 열(표시 안 한 열은 세 개까지)
 */
export function cardRoles<C extends Pick<DataGridColumn, 'key' | 'format' | 'mobile'>>(
  columns: readonly C[],
): CardRoles<C> {
  const marked = (role: NonNullable<C['mobile']>) => columns.filter((c) => c.mobile === role);
  const free = columns.filter((c) => !c.mobile);
  const title = marked('title')[0] ?? free.find((c) => !isNumericColumn(c)) ?? columns[0];
  const trailing =
    marked('trailing')[0] ??
    free.find((c) => c !== title && (c.format === 'amount' || c.format === 'currency')) ??
    free.find((c) => c !== title && isNumericColumn(c));
  const status = marked('status');
  const meta: C[] = [];
  let spare = 3;
  for (const c of columns) {
    if (c === title || c === trailing || c.mobile === 'hidden' || c.mobile === 'status') continue;
    if (c.mobile === 'meta') meta.push(c);
    else if (c.mobile === 'title' || c.mobile === 'trailing') continue;
    else if (spare > 0) {
      meta.push(c);
      spare -= 1;
    }
  }
  return { title, trailing, status, meta };
}

export const isNumeric = isNumericColumn;
