import type { FileViewerPin } from '@terracelab/trellis-contracts';
import { useEffect, useState } from 'react';
import { Button } from '../Button/Button.js';
import { Dialog } from '../Dialog/Dialog.js';
import { FileViewer } from './FileViewer.js';

// 거래명세서 스캔 그림(회색 도형과 숫자만). 외부 요청 없이 data: 주소로 넘긴다
const SCAN = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  [
    '<svg xmlns="http://www.w3.org/2000/svg" width="560" height="760" viewBox="0 0 560 760">',
    '<g fill-opacity="0.82"><rect x="48" y="56" width="220" height="22" rx="3"/></g>',
    '<g fill-opacity="0.35"><rect x="48" y="92" width="150" height="10" rx="2"/>',
    '<rect x="360" y="56" width="152" height="10" rx="2"/><rect x="392" y="74" width="120" height="10" rx="2"/></g>',
    '<g fill="none" stroke-opacity="0.5" stroke="currentColor"><rect x="48" y="136" width="464" height="420"/>',
    '<path d="M48 176H512M48 216H512M48 256H512M48 296H512M48 336H512M48 376H512M48 416H512M48 456H512M48 496H512M300 136V556M392 136V556"/></g>',
    '<g fill-opacity="0.25">',
    [0, 1, 2, 3, 4, 5, 6, 7]
      .map(
        (i) =>
          `<rect x="60" y="${190 + i * 40}" width="${150 + ((i * 37) % 80)}" height="10" rx="2"/>` +
          `<rect x="316" y="${190 + i * 40}" width="60" height="10" rx="2"/>` +
          `<rect x="${440 - ((i * 13) % 30)}" y="${190 + i * 40}" width="${60 + ((i * 13) % 30)}" height="10" rx="2"/>`,
      )
      .join(''),
    '</g><g fill-opacity="0.82"><rect x="300" y="580" width="212" height="18" rx="3"/></g>',
    '<circle cx="452" cy="664" r="34" fill="none" stroke="currentColor" stroke-opacity="0.6" stroke-width="4"/>',
    '</svg>',
  ].join(''),
)}`;

// 쪽 수만큼 서식 쪽을 그린 작은 PDF(글자는 영문 · 숫자). 문서에 넣어 둔 표본이라 바이트를 직접 쓴다
const samplePdf = (pages: number) => {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${Array.from({ length: pages }, (_, i) => `${4 + i * 2} 0 R`).join(' ')}] /Count ${pages} >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  for (let i = 0; i < pages; i += 1) {
    const draw = `BT /F1 18 Tf 56 776 Td (2026-10 Closing report  ${i + 1} / ${pages}) Tj ET 0.8 g 56 720 483 10 re f 56 700 420 10 re f 56 680 450 10 re f 56 640 483 160 re S`;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${5 + i * 2} 0 R >>`,
      `<< /Length ${draw.length} >>\nstream\n${draw}\nendstream`,
    );
  }
  let out = '%PDF-1.4\n';
  const offsets = objects.map((o, i) => {
    const at = out.length;
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
    return at;
  });
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  out += offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
  return `${out}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
};

/** 그림 — 확대 · 축소 · 맞춤 · 회전. 그림 영역에서 + · − · 0 · R 키로도 된다 */
export function Image() {
  return <FileViewer name="거래명세서 스캔 2026-11-05.png" size={184320} src={SCAN} />;
}

/** PDF — 브라우저 내장 PDF 보기에 쪽 · 배율을 넘긴다. 내장 보기가 없는 브라우저는 파일 카드 */
export function Pdf() {
  const [src, setSrc] = useState<string>();
  useEffect(() => {
    const url = URL.createObjectURL(new Blob([samplePdf(3)], { type: 'application/pdf' }));
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, []);
  return (
    <FileViewer
      name="2026년 10월 결산 보고서.pdf"
      size={2516600}
      src={src}
      loading={!src}
      pageCount={3}
    />
  );
}

/** 다른 형식 — 미리 볼 수 없는 형식은 파일 카드와 다운로드 단추 */
export function Other() {
  return (
    <FileViewer name="11월 1주차 자금 일보.xlsx" size={186400} height="sm" onDownload={() => {}} />
  );
}

/** 불러오는 중 · 오류 — 주소를 받는 동안 Skeleton, 실패하면 이유 · 다시 시도 · 다운로드 */
export function LoadingError() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-16)' }}>
      <FileViewer name="평택 냉동센터 검수 사진 01.jpg" size={2411724} height="sm" loading />
      <FileViewer
        name="평택 냉동센터 검수 사진 02.jpg"
        size={2290116}
        height="sm"
        error="사진을 불러오지 못했습니다"
        onRetry={() => {}}
        onDownload={() => {}}
      />
    </div>
  );
}

/** 크게 보기 — 목록 옆 작은 보기에서 Dialog lg로 크게 연다 */
export function Expand() {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-8)',
        maxWidth: 'calc(var(--tl-space-64) * 5)',
      }}
    >
      <FileViewer name="거래명세서 스캔 2026-11-05.png" size={184320} src={SCAN} height="sm" />
      <Button icon="maximize-2" onPress={() => setOpen(true)}>
        크게 보기
      </Button>
      <Dialog open={open} onOpenChange={setOpen} size="lg" title="거래명세서 스캔 2026-11-05.png">
        <FileViewer name="거래명세서 스캔 2026-11-05.png" size={184320} src={SCAN} height="lg" />
      </Dialog>
    </div>
  );
}

// 배너 시안 그림(회색 도형만). 제목 줄 · 사진 자리 · 단추
const PROOF = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  [
    '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="405" viewBox="0 0 720 405">',
    '<rect width="720" height="405" fill-opacity="0.06"/>',
    '<g fill-opacity="0.78"><rect x="48" y="96" width="300" height="30" rx="4"/></g>',
    '<g fill-opacity="0.32"><rect x="48" y="146" width="260" height="12" rx="3"/>',
    '<rect x="48" y="168" width="220" height="12" rx="3"/></g>',
    '<rect x="400" y="64" width="272" height="236" rx="8" fill-opacity="0.18"/>',
    '<path d="M424 268L500 180L556 236L596 200L648 268Z" fill-opacity="0.3"/>',
    '<circle cx="612" cy="116" r="22" fill-opacity="0.3"/>',
    '<rect x="48" y="292" width="148" height="44" rx="22" fill-opacity="0.62"/>',
    '</svg>',
  ].join(''),
)}`;

const PROOF_PINS: FileViewerPin[] = [
  { id: 'c1', x: 0.27, y: 0.27, title: '제목 글자를 한 단계 키워 주세요' },
  { id: 'c2', x: 0.74, y: 0.45, title: '사진을 오른쪽 끝에 붙여 주세요' },
  { id: 'c3', x: 0.17, y: 0.77, title: '단추 색은 회사 색으로', resolved: true },
];

/** 위치 코멘트 — 시안 검수. 핀을 누르면 그 코멘트를 고르고, "위치 코멘트"를 켠 뒤 그림을 누르면(방향 키로 옮기고 Enter) 새 핀이 선다. 확대 · 회전해도 핀은 같은 자리다(R-02) */
export function Pins() {
  const [pins, setPins] = useState<FileViewerPin[]>(PROOF_PINS);
  const [active, setActive] = useState<string | null>('c1');
  return (
    <FileViewer
      name="11월 배너 시안 v3.png"
      size={248_320}
      src={PROOF}
      height="lg"
      pins={pins}
      activePin={active}
      onPinPress={setActive}
      onPinAdd={(at) => {
        const id = `c${pins.length + 1}`;
        setPins((list) => [...list, { id, ...at, title: '새 코멘트' }]);
        setActive(id);
      }}
    />
  );
}
