import { Field } from '../Field/Field.js';
import { FileUpload } from './FileUpload.js';

/** 증빙 첨부 — 올리는 중 · 완료 · 오류를 한 목록에 */
export function Basic() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 7)' }}>
      <Field label="증빙 첨부" help="세금계산서 · 거래명세서를 함께 올립니다">
        <FileUpload
          accept=".pdf,.xlsx,.jpg,.png"
          multiple
          maxSize={10485760}
          hint="PDF · XLSX · JPG, 10MB 이하"
          files={[
            { name: '한빛무역_세금계산서_2611.pdf', size: 248320, status: 'done' },
            { name: '대양상사_거래명세서.xlsx', size: 1572864, status: 'uploading', progress: 64 },
            {
              name: '누리식품_납품사진.heic',
              size: 3355443,
              status: 'error',
              error: 'HEIC는 받지 않습니다. JPG로 바꿔 올리세요',
            },
          ]}
          onRemove={() => undefined}
        />
      </Field>
    </div>
  );
}

/** 비활성 — 마감된 전표는 첨부를 바꿀 수 없다 */
export function Disabled() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 7)' }}>
      <FileUpload
        disabled
        hint="PDF, 5MB 이하"
        files={[{ name: '10월_결산_보고서.pdf', size: 524288, status: 'done' }]}
      />
    </div>
  );
}
