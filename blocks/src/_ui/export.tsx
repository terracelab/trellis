// 표 내보내기 단추(PG-39): 지금 보이는 목록을 CSV로 내려받는다. 글자는 contracts toCsv(UTF-8 BOM이라 스프레드시트
// 앱에서 한글이 깨지지 않고, 금액은 서식 없는 숫자라 그대로 더할 수 있다). 권한은 플랫폼 export 동작으로 막는다.
// 라벨은 블록이 children으로 넘긴다(화면 글자는 블록에 남긴다).
import { formatDate, type CsvColumn } from '@terracelab/trellis-contracts';
import { Button, downloadCsv } from '@terracelab/trellis-react';
import type { ReactNode } from 'react';
import { useCan } from '../_platform/index.js';

export type { CsvColumn };

/**
 * <ExportButton module="sales" name="매출 분석" rows={rows} columns={CSV}>엑셀 다운로드</ExportButton>
 * 파일 이름은 "이름_오늘.csv". 볼 수 있는 행(필터 · 범위 뒤)을 넘긴다
 */
export function ExportButton<T>({
  module,
  name,
  rows,
  columns,
  children,
  size,
}: {
  /** 권한을 보는 모듈(block.json module) */
  module: string;
  /** 파일 이름 앞부분(화면 제목) */
  name: string;
  rows: readonly T[];
  columns: readonly CsvColumn<T>[];
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  const allowed = useCan(module, 'export');
  const reason = !allowed
    ? '다운로드 권한이 없습니다'
    : rows.length === 0
      ? '내려받을 행이 없습니다'
      : undefined;
  return (
    <Button
      icon="download"
      {...(size ? { size } : {})}
      disabled={Boolean(reason)}
      {...(reason ? { disabledReason: reason } : {})}
      onPress={() => downloadCsv({ name, date: formatDate(new Date()), rows, columns })}
    >
      {children}
    </Button>
  );
}
