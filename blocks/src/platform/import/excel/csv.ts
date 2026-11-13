// CSV 읽기 · 쓰기(엑셀 업로드 블록). 표 계산 라이브러리 없이 브라우저에서 처리한다.
// 엑셀이 저장하는 CSV(따옴표 칸 · 칸 안 쉼표 · 칸 안 줄바꿈 · CRLF · UTF-8 BOM)와 한글 엑셀의 CP949(EUC-KR) 저장을 읽는다

/** CSV 글자 → 행 × 칸. 따옴표 칸 안의 쉼표 · 줄바꿈 · ""(따옴표 하나)를 지킨다. 빈 줄은 뺀다 */
export function parseCsv(text: string): string[][] {
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i]!;
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"' && field === '') quoted = true;
    else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += ch;
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

/** 행 × 칸 → CSV 글자(CRLF). 엑셀이 한글을 깨뜨리지 않게 앞에 BOM을 붙인다 */
export function toCsv(rows: readonly (readonly string[])[]): string {
  const cell = (v: string) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return `\uFEFF${rows.map((r) => r.map(cell).join(',')).join('\r\n')}\r\n`;
}

/** 파일 → 글자. UTF-8로 읽다가 깨지면 CP949(EUC-KR)로 다시 읽는다 */
export async function readTextFile(file: Blob): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder('euc-kr').decode(bytes);
  }
}

/** 글자를 파일로 받는다(양식 · 실패 행). 외부 요청 없이 blob 주소로 */
export function saveText(name: string, text: string, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
