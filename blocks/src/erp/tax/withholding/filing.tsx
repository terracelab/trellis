// 신고 화면(TaxFiling)이 함께 쓰는 조각: 신고서 값 표(칸 · 값 · 근거 · 확인, 값 칸 복사)와 제출 상자.
// 화면 블록이 아니다(block.json 없음). erp/tax/corporate도 이 파일을 읽는다.
// 제출 · 납부는 국세청 · 지방세 사이트에서 하고, 이 화면은 접수증을 받아 완료 표시만 한다.
import { formatAmount, formatDate, type ChecklistItem } from '@terracelab/trellis-contracts';
import {
  Attachment,
  Button,
  Card,
  Checkbox,
  Checklist,
  Citation,
  DataGrid,
  Dialog,
  DialogClose,
  FileUpload,
} from '@terracelab/trellis-react';
import type { FiledReturn, FormValue } from '../../../_data/tax-filing.js';
import { useCan, useOpenLink } from '../../../_platform/index.js';
import { Muted, Stack } from '../../../_ui/index.js';
import './style.css';

/** 값 칸 글자. 금액은 천 단위(단위 원은 화면 머리에 한 번), 인원 · 세율은 단위를 붙인다 */
export const valueText = (v: FormValue) =>
  typeof v.value === 'string'
    ? v.value
    : v.kind === 'count'
      ? `${formatAmount(v.value)}명`
      : v.kind === 'rate'
        ? `${v.value}%`
        : formatAmount(v.value);

/** 복사할 글자: 숫자는 구분 기호 없이 숫자만(국세청 사이트 입력 칸) */
export const copyText = (v: FormValue) => (typeof v.value === 'number' ? String(v.value) : v.value);

/** 받은 파일(File)을 목록 한 줄로 */
export const toUpload = (files: readonly unknown[]) =>
  files.map((f) => {
    const file = f as { name: string; size: number };
    return { name: file.name, size: file.size };
  });

interface ValueProps {
  values: readonly FormValue[];
  checked: (key: string) => boolean;
  onCheck: (keys: readonly string[], on: boolean) => void;
  /** 확인 표시를 할 수 있다(권한 · 앞 단계). 막힌 이유는 카드 설명에 둔다 */
  editable: boolean;
}

/** 모두 확인(카드 머리 action 자리) */
export function ValueCheckAll({ values, checked, onCheck, editable }: ValueProps) {
  const done = values.filter((v) => checked(v.key)).length;
  const all = values.length > 0 && done === values.length;
  return (
    <Checkbox
      checked={all}
      indeterminate={!all && done > 0}
      disabled={!editable}
      onChange={(on) =>
        onCheck(
          values.map((v) => v.key),
          on,
        )
      }
    >
      {`넣고 확인 ${done}/${values.length}칸`}
    </Checkbox>
  );
}

/**
 * 신고서 값 표: 칸 · 값(복사 단추) · 근거(누르면 그 숫자가 나온 화면) · 확인 표시.
 * 확인 표시는 "국세청 사이트에 넣었다"는 뜻이고, 모두 확인해야 제출 단계가 열린다
 */
export function ValueGrid({
  caption,
  values,
  checked,
  onCheck,
  editable,
}: ValueProps & { caption: string }) {
  const openLink = useOpenLink();
  return (
    <DataGrid
      caption={caption}
      className="tl-block-flat-grid"
      rows={values}
      rowKey="key"
      columns={[
        { key: 'line', header: '칸', mobile: 'title', wrap: true },
        {
          key: 'value',
          header: '값',
          width: 'lg',
          align: 'right',
          mobile: 'trailing',
          copyable: true,
          copyText: copyText,
          render: (v: FormValue) => valueText(v),
        },
        {
          key: 'from',
          header: '근거',
          width: 'xl',
          mobile: 'meta',
          wrap: true,
          render: (v: FormValue) => {
            const open = openLink(v.link);
            return (
              <span>
                {v.from}
                {open && (
                  <>
                    {' '}
                    <Citation
                      layout="inline"
                      sources={[{ index: 1, title: v.from }]}
                      onOpen={() => open()}
                    />
                  </>
                )}
              </span>
            );
          },
        },
        {
          key: 'checked',
          header: '확인',
          width: 'xs',
          align: 'center',
          mobile: 'status',
          render: (v: FormValue) => (
            <Checkbox
              checked={checked(v.key)}
              disabled={!editable}
              onChange={(on) => onCheck([v.key], on)}
              aria-label={`${v.line} 확인`}
            />
          ),
        },
      ]}
    />
  );
}

/**
 * 제출 상자: 할 일 안내(Checklist) → 접수증 첨부 → 완료 표시(확인 대화상자).
 * 접수증이 없으면 완료 표시를 할 수 없다. 완료 표시는 세무 승인 권한
 */
export function FilingBox({
  title,
  guide,
  ready,
  blockedReason,
  filed,
  files,
  onFiles,
  onRemove,
  onMark,
  confirmTitle,
  confirmBody,
  hint = '접수증 · 납부확인서(PDF · 사진)',
  split = false,
}: {
  title: string;
  guide: readonly { id: string; title: string; description?: string }[];
  /** 앞 단계가 끝났다 */
  ready: boolean;
  blockedReason: string;
  filed?: FiledReturn | undefined;
  files: readonly { name: string; size: number }[];
  onFiles: (files: readonly { name: string; size: number }[]) => void;
  onRemove: (name: string) => void;
  onMark: () => void;
  confirmTitle: string;
  confirmBody: string;
  hint?: string;
  /** 넓은 화면에서 할 일과 접수증 칸을 나란히(카드가 화면 폭 전체일 때) */
  split?: boolean;
}) {
  const canMark = useCan('tax', 'approve');
  const items: ChecklistItem[] = guide.map((g) => ({
    ...g,
    state: filed ? 'done' : 'pending',
  }));
  const reason = filed
    ? null
    : !ready
      ? blockedReason
      : !canMark
        ? '완료 표시는 세무 승인 권한이 있어야 합니다'
        : !files.length
          ? '접수증을 첨부하면 완료 표시를 할 수 있습니다'
          : null;
  return (
    <Card
      title={title}
      subtitle={
        filed
          ? `${formatDate(filed.filedAt)} 완료 표시${filed.by ? ` · ${filed.by} 제출` : ''}`
          : '제출 · 납부한 뒤 접수증을 첨부합니다'
      }
    >
      <div className="tl-block-tax-filing" data-split={split || undefined}>
        <Checklist label={`${title} · 할 일`} items={items} showProgress={false} />
        {filed ? (
          <Attachment files={filed.files.map((name) => ({ name, size: 184_320 }))} />
        ) : (
          <Stack>
            <FileUpload
              multiple
              accept="image/*,.pdf"
              hint={hint}
              disabled={!ready || !canMark}
              files={files.map((f) => ({ ...f, status: 'done' as const }))}
              onFilesChange={(fs) => onFiles(toUpload(fs))}
              onRemove={onRemove}
            />
            <div className="tl-block-row">
              <Dialog
                title={confirmTitle}
                description={confirmBody}
                trigger={
                  <Button variant="primary" icon="circle-check" disabled={!!reason}>
                    완료 표시
                  </Button>
                }
                footer={
                  <>
                    <DialogClose render={<Button>취소</Button>} />
                    <DialogClose
                      render={
                        <Button variant="primary" onPress={onMark}>
                          완료 표시
                        </Button>
                      }
                    />
                  </>
                }
              />
              {reason && <Muted>{reason}</Muted>}
            </div>
          </Stack>
        )}
      </div>
    </Card>
  );
}
