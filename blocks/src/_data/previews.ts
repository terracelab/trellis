// 문서함 미리 보기 샘플(PG-44). 파일마다 브라우저 캔버스로 그린 그림 · PDF를 blob: 주소로 만든다(외부 요청 없음).
// 실제 서비스는 파일 서버 주소(서명된 URL)와 PDF 쪽 수를 FileViewer에 그대로 넘긴다. 이 파일을 API 호출로 바꿔 끼운다.
// 색은 종이 토큰(--tl-paper-*, 테마와 무관)을, 글꼴은 화면 글꼴을 읽어 그린다
import { formatAmount, formatBizNo } from '@terracelab/trellis-contracts';
import { COMPANY, USERS } from '../_platform/mock.js';
import { extOf, versionsOf, type DocFile } from './ecm-crm.js';
import { partyById } from './trade.js';

/** 휴대폰으로 찍어 올린 증빙(그림 미리 보기 샘플). 거래명세서는 옆으로 누운 채 스캔됐다(회전 확인) */
export const SCANNED_FILES: readonly DocFile[] = [
  {
    id: 'd17',
    name: '법인카드 영수증 2026-11-05.jpg',
    folderId: 'close-11',
    size: 412_300,
    modifiedBy: '박서연',
    modifiedAt: '2026-11-05 19:32',
    version: 1,
    retainUntil: '2031-12-31',
    retention: '회계 증빙 5년',
    share: 'private',
    sharedWith: [],
  },
  {
    id: 'd18',
    name: `${partyById('p05').name} 거래명세서 스캔 1103.jpg`,
    folderId: 'close-11',
    size: 1_284_100,
    modifiedBy: '정우진',
    modifiedAt: '2026-11-03 16:05',
    version: 1,
    retainUntil: '2031-12-31',
    retention: '회계 증빙 5년',
    share: 'dept',
    sharedWith: ['경영지원팀'],
  },
];

export interface DocPreview {
  src: string;
  mimeType: string;
  /** PDF 쪽 수 */
  pageCount?: number;
}

/* ── 그리기 ─────────────────────────────────────────────── */

type Block =
  | { kind: 'title'; text: string; sub?: string }
  | { kind: 'meta'; rows: readonly (readonly [string, string])[] }
  | { kind: 'heading'; text: string }
  | {
      kind: 'table';
      head: readonly string[];
      rows: readonly (readonly string[])[];
      /** 오른쪽 정렬 열(금액) */
      right?: readonly number[];
      total?: readonly string[];
    }
  | { kind: 'note'; text: string }
  | { kind: 'seal'; label: string; name: string };

interface Ink {
  bg: string;
  fg: string;
  muted: string;
  line: string;
  fill: string;
  seal: string;
  family: string;
}

function ink(): Ink {
  const root = getComputedStyle(document.documentElement);
  const v = (name: string) => root.getPropertyValue(name).trim();
  return {
    bg: v('--tl-paper-bg'),
    fg: v('--tl-paper-fg'),
    muted: v('--tl-paper-muted'),
    line: v('--tl-paper-line'),
    fill: v('--tl-paper-fill'),
    seal: v('--tl-color-status-danger-default'),
    family: getComputedStyle(document.body).fontFamily,
  };
}

/** 종이 한 장. u = 쪽 폭의 1/100(글자 · 여백을 폭에 비례해 그린다) */
function drawPage(width: number, height: number, blocks: readonly Block[], foot: string) {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const g = c.getContext('2d')!;
  const k = ink();
  const u = width / 100;
  const font = (size: number, weight = 400) => {
    g.font = `${weight} ${Math.round(size * u)}px ${k.family}`;
  };
  g.fillStyle = k.bg;
  g.fillRect(0, 0, width, height);
  const left = 8 * u;
  const right = width - 8 * u;
  let y = 9 * u;
  g.textBaseline = 'alphabetic';
  for (const b of blocks) {
    if (b.kind === 'title') {
      g.fillStyle = k.fg;
      font(4.4, 700);
      g.textAlign = 'center';
      g.fillText(b.text, width / 2, y + 3.6 * u);
      y += 6 * u;
      if (b.sub) {
        font(2.1);
        g.fillStyle = k.muted;
        g.fillText(b.sub, width / 2, y + 1.6 * u);
        y += 3.4 * u;
      }
      g.textAlign = 'left';
      g.strokeStyle = k.fg;
      g.lineWidth = 0.3 * u;
      g.beginPath();
      g.moveTo(left, y + u);
      g.lineTo(right, y + u);
      g.stroke();
      y += 4 * u;
    } else if (b.kind === 'meta') {
      font(1.9);
      const col = (right - left) / 2;
      b.rows.forEach(([label, value], i) => {
        const x = left + (i % 2) * col;
        const yy = y + Math.floor(i / 2) * 3.4 * u + 2 * u;
        g.fillStyle = k.muted;
        g.fillText(label, x, yy);
        g.fillStyle = k.fg;
        g.fillText(value, x + 14 * u, yy);
      });
      y += Math.ceil(b.rows.length / 2) * 3.4 * u + 2.4 * u;
    } else if (b.kind === 'heading') {
      g.fillStyle = k.fg;
      font(2.5, 700);
      g.fillText(b.text, left, y + 2.4 * u);
      y += 4.6 * u;
    } else if (b.kind === 'table') {
      const cols = b.head.length;
      const widths = b.head.map((_, i) => (i === 0 ? 0.34 : 0.66 / (cols - 1)));
      const xs = widths.map(
        (_, i) => left + widths.slice(0, i).reduce((a, w) => a + w, 0) * (right - left),
      );
      const rowH = 3.6 * u;
      const cell = (text: string, i: number, yy: number) => {
        const r = b.right?.includes(i);
        g.textAlign = r ? 'right' : 'left';
        const x = r ? xs[i]! + widths[i]! * (right - left) - 1.2 * u : xs[i]! + 1.2 * u;
        g.fillText(text, x, yy);
      };
      g.fillStyle = k.fill;
      g.fillRect(left, y, right - left, rowH);
      g.fillStyle = k.fg;
      font(1.8, 600);
      b.head.forEach((h, i) => cell(h, i, y + 2.45 * u));
      y += rowH;
      font(1.8);
      const all = b.total ? [...b.rows, b.total] : b.rows;
      all.forEach((row, ri) => {
        const isTotal = b.total && ri === all.length - 1;
        if (isTotal) font(1.8, 700);
        g.fillStyle = k.fg;
        row.forEach((t, i) => cell(t, i, y + 2.45 * u));
        y += rowH;
        g.strokeStyle = isTotal ? k.fg : k.line;
        g.lineWidth = (isTotal ? 0.25 : 0.1) * u;
        g.beginPath();
        g.moveTo(left, y);
        g.lineTo(right, y);
        g.stroke();
      });
      g.textAlign = 'left';
      y += 3 * u;
    } else if (b.kind === 'note') {
      g.fillStyle = k.muted;
      font(1.8);
      g.fillText(b.text, left, y + 1.8 * u);
      y += 4 * u;
    } else if (b.kind === 'seal') {
      const cx = right - 7 * u;
      const cy = y + 6 * u;
      g.fillStyle = k.fg;
      font(1.9);
      g.textAlign = 'right';
      g.fillText(`${b.label}  ${b.name}`, cx - 8 * u, cy + 0.7 * u);
      g.strokeStyle = k.seal;
      g.fillStyle = k.seal;
      g.lineWidth = 0.45 * u;
      g.beginPath();
      g.arc(cx, cy, 5 * u, 0, Math.PI * 2);
      g.stroke();
      font(2, 700);
      g.textAlign = 'center';
      g.fillText(b.name.slice(0, 3), cx, cy + 0.8 * u);
      g.textAlign = 'left';
      y += 13 * u;
    }
  }
  g.fillStyle = k.muted;
  font(1.6);
  g.textAlign = 'center';
  g.fillText(foot, width / 2, height - 4 * u);
  return c;
}

const toJpeg = (c: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) =>
    c.toBlob((b) => (b ? resolve(b) : reject(new Error('canvas'))), 'image/jpeg', 0.9),
  );

/** 옆으로 누운 스캔: 그린 쪽을 왼쪽으로 90도 돌려 담는다(오른쪽으로 한 번 돌리면 바로 선다) */
function sideways(src: HTMLCanvasElement) {
  const c = document.createElement('canvas');
  c.width = src.height;
  c.height = src.width;
  const g = c.getContext('2d')!;
  g.translate(0, c.height);
  g.rotate(-Math.PI / 2);
  g.drawImage(src, 0, 0);
  return c;
}

/** 쪽마다 JPEG 한 장을 담은 PDF(DCTDecode). A4(595 × 842pt) */
async function pdfOf(pages: readonly HTMLCanvasElement[]): Promise<Blob> {
  const enc = new TextEncoder();
  const parts: Uint8Array<ArrayBuffer>[] = [];
  const offsets: number[] = [];
  let at = 0;
  const put = (x: string | Uint8Array<ArrayBuffer>) => {
    const bytes = typeof x === 'string' ? enc.encode(x) : x;
    parts.push(bytes);
    at += bytes.length;
  };
  const jpegs = await Promise.all(
    pages.map(async (p) => ({
      w: p.width,
      h: p.height,
      bytes: new Uint8Array(await (await toJpeg(p)).arrayBuffer()),
    })),
  );
  const pageId = (i: number) => 3 + i * 3;
  put('%PDF-1.4\n%âãÏÓ\n');
  const obj = (id: number, body: () => void) => {
    offsets[id] = at;
    put(`${id} 0 obj\n`);
    body();
    put('\nendobj\n');
  };
  obj(1, () => put('<< /Type /Catalog /Pages 2 0 R >>'));
  obj(2, () =>
    put(
      `<< /Type /Pages /Kids [${jpegs.map((_, i) => `${pageId(i)} 0 R`).join(' ')}] /Count ${jpegs.length} >>`,
    ),
  );
  jpegs.forEach((j, i) => {
    const id = pageId(i);
    const draw = 'q 595 0 0 842 0 0 cm /Im0 Do Q';
    obj(id, () =>
      put(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 ${id + 2} 0 R >> >> /Contents ${id + 1} 0 R >>`,
      ),
    );
    obj(id + 1, () => put(`<< /Length ${draw.length} >>\nstream\n${draw}\nendstream`));
    obj(id + 2, () => {
      put(
        `<< /Type /XObject /Subtype /Image /Width ${j.w} /Height ${j.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${j.bytes.length} >>\nstream\n`,
      );
      put(j.bytes);
      put('\nendstream');
    });
  });
  const xref = at;
  const count = pageId(jpegs.length);
  put(`xref\n0 ${count}\n0000000000 65535 f \n`);
  for (let id = 1; id < count; id += 1) put(`${String(offsets[id]).padStart(10, '0')} 00000 n \n`);
  put(`trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(parts, { type: 'application/pdf' });
}

/* ── 문서 내용 ─────────────────────────────────────────── */

const won = (n: number) => formatAmount(n);
const stem = (name: string) => name.replace(/\.[^.]+$/, '');
const ceo = USERS.find((u) => u.id === 'u01')!;

/** 10월 결산 보고서(3쪽): 요약 · 손익계산서 · 재무상태표 */
function closingReport(f: DocFile): Block[][] {
  const v = versionsOf(f)[0]!;
  const head: Block = { kind: 'title', text: stem(f.name), sub: COMPANY.name };
  return [
    [
      head,
      {
        kind: 'meta',
        rows: [
          ['결산 기간', '2026-10-01~10-31'],
          ['버전', `v${f.version}`],
          ['작성', v.by],
          ['작성일', v.at.slice(0, 10)],
        ],
      },
      { kind: 'heading', text: '1. 요약' },
      {
        kind: 'table',
        head: ['항목', '10월', '9월', '증감'],
        right: [1, 2, 3],
        rows: [
          ['매출액', won(1_284_600_000), won(1_196_300_000), won(88_300_000)],
          ['매출원가', won(1_003_880_000), won(941_220_000), won(62_660_000)],
          ['매출총이익', won(280_720_000), won(255_080_000), won(25_640_000)],
          ['판매비와관리비', won(186_430_000), won(179_910_000), won(6_520_000)],
        ],
        total: ['영업이익', won(94_290_000), won(75_170_000), won(19_120_000)],
      },
      { kind: 'note', text: '금액 단위 원. 9월은 확정 결산 기준입니다' },
    ],
    [
      head,
      { kind: 'heading', text: '2. 손익계산서' },
      {
        kind: 'table',
        head: ['계정과목', '당월', '누계'],
        right: [1, 2],
        rows: [
          ['상품매출', won(1_284_600_000), won(11_903_400_000)],
          ['상품매출원가', won(1_003_880_000), won(9_288_120_000)],
          ['급여', won(92_400_000), won(915_600_000)],
          ['지급임차료', won(18_000_000), won(180_000_000)],
          ['운반비', won(31_870_000), won(298_440_000)],
          ['지급수수료', won(12_160_000), won(118_930_000)],
          ['기타 판매비와관리비', won(32_000_000), won(301_270_000)],
          ['이자수익', won(3_120_400), won(27_804_100)],
          ['이자비용', won(8_914_000), won(86_209_000)],
        ],
        total: ['법인세차감전이익', won(88_496_400), won(743_635_100)],
      },
    ],
    [
      head,
      { kind: 'heading', text: '3. 재무상태표' },
      {
        kind: 'table',
        head: ['계정과목', '10월 말', '9월 말'],
        right: [1, 2],
        rows: [
          ['보통예금', won(684_210_300), won(611_480_900)],
          ['외상매출금', won(1_418_700_000), won(1_352_100_000)],
          ['상품', won(902_340_000), won(948_770_000)],
          ['외상매입금', won(733_900_000), won(781_260_000)],
          ['미지급금', won(64_380_000), won(58_920_000)],
          ['단기차입금', won(500_000_000), won(500_000_000)],
        ],
        total: ['순자산', won(1_706_970_300), won(1_572_170_900)],
      },
      { kind: 'seal', label: '대표이사', name: ceo.name },
    ],
  ];
}

/** 다른 PDF(1쪽): 제목 · 문서 정보 · 버전 이력 */
function summaryDoc(f: DocFile): Block[][] {
  return [
    [
      { kind: 'title', text: stem(f.name), sub: COMPANY.name },
      {
        kind: 'meta',
        rows: [
          ['작성', f.modifiedBy],
          ['수정일', f.modifiedAt.slice(0, 10)],
          ['버전', `v${f.version}`],
          ['보존 기한', f.retainUntil],
        ],
      },
      { kind: 'heading', text: '버전 이력' },
      {
        kind: 'table',
        head: ['버전', '일시', '작성', '내용'],
        rows: versionsOf(f).map((v) => [`v${v.version}`, v.at, v.by, v.note]),
      },
      { kind: 'note', text: `${f.retention} · 공유 ${f.sharedWith.join(' · ') || '없음'}` },
    ],
  ];
}

/** 카드 영수증(세로 긴 그림) */
function receipt(): HTMLCanvasElement {
  return drawPage(
    560,
    900,
    [
      { kind: 'title', text: '카드 매출 전표', sub: '2026-11-05 19:20' },
      {
        kind: 'meta',
        rows: [
          ['가맹점', '을지로 한식당'],
          ['사업자', formatBizNo('2018812345')],
          ['카드', '법인 ****-4021'],
          ['승인', '30418827'],
        ],
      },
      {
        kind: 'table',
        head: ['품목', '수량', '금액'],
        right: [1, 2],
        rows: [
          ['정식', '4', won(112_000)],
          ['추가 메뉴', '2', won(40_000)],
          ['음료', '4', won(16_000)],
        ],
        total: ['합계', '', won(168_000)],
      },
      { kind: 'note', text: `공급가액 ${won(152_727)} · 부가세 ${won(15_273)}` },
    ],
    COMPANY.name,
  );
}

/** 거래명세서(가로 서식을 옆으로 누운 채 스캔) */
function statement(): HTMLCanvasElement {
  const supplier = partyById('p05');
  return sideways(
    drawPage(
      1100,
      760,
      [
        { kind: 'title', text: '거래명세서', sub: '2026-11-03' },
        {
          kind: 'meta',
          rows: [
            ['공급자', supplier.name],
            ['공급받는자', COMPANY.name],
            ['사업자', formatBizNo(supplier.bizNo ?? '')],
            ['사업자', formatBizNo(COMPANY.bizNo)],
          ],
        },
        {
          kind: 'table',
          head: ['품목', '수량', '단가', '공급가액', '세액'],
          right: [1, 2, 3, 4],
          rows: [
            ['박스 대', '400', won(1_250), won(500_000), won(50_000)],
            ['완충재 롤', '20', won(18_000), won(360_000), won(36_000)],
            ['포장 테이프', '120', won(1_500), won(180_000), won(18_000)],
          ],
          total: ['합계', '', '', won(1_040_000), won(104_000)],
        },
      ],
      `${supplier.name} · 인수자 확인`,
    ),
  );
}

const cache = new Map<string, Promise<DocPreview | null>>();

/** 파일의 미리 보기 주소. 그릴 수 없는 형식(엑셀 · 워드 · 압축)은 null → FileViewer 파일 카드 */
export function docPreview(f: DocFile): Promise<DocPreview | null> {
  const hit = cache.get(f.id);
  if (hit) return hit;
  const ext = extOf(f.name);
  const make = async (): Promise<DocPreview | null> => {
    await document.fonts?.ready;
    if (ext === 'pdf') {
      const docs = f.id === 'd04' ? closingReport(f) : summaryDoc(f);
      const pages = docs.map((blocks, i) =>
        drawPage(900, 1273, blocks, `${COMPANY.name} · ${i + 1} / ${docs.length}`),
      );
      const blob = await pdfOf(pages);
      return {
        src: URL.createObjectURL(blob),
        mimeType: 'application/pdf',
        pageCount: pages.length,
      };
    }
    if (ext === 'jpg' || ext === 'png') {
      const canvas = f.id === 'd18' ? statement() : receipt();
      return { src: URL.createObjectURL(await toJpeg(canvas)), mimeType: 'image/jpeg' };
    }
    return null;
  };
  const p = make().catch(() => null);
  cache.set(f.id, p);
  return p;
}
