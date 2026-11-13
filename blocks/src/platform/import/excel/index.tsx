// 플랫폼 기본 · 엑셀 업로드: 파일 업로드 → 검증 → 반영 3단계(Stepper). CSV를 브라우저에서 읽어 행마다 검증하고
// 확인할 항목(IssueList)과 틀린 칸을 표시한 표(DataGrid)를 보인 뒤 통과한 전표만 반영한다. XLSX는 읽지 않고 CSV로 저장하라고 안내한다.
// 샘플(_data/journal-import.ts)은 11월 전표 일괄 등록이고 대차 불일치 · 없는 계정코드 · 없는 날짜 · 거래처가 빠진 채무가 들어 있다
import {
  formatAmount,
  type IssueItem,
  type StepperStep,
  type UploadFile,
} from '@terracelab/trellis-contracts';
import {
  ActionBar,
  Button,
  Card,
  Checkbox,
  DataGrid,
  DataGridLines,
  Field,
  FileUpload,
  Icon,
  IssueList,
  PageHeader,
  Progress,
  SegmentedControl,
  StatusDot,
  Stepper,
  useBreakpoint,
  useToast,
} from '@terracelab/trellis-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { accountByCode, NEXT_VOUCHER_NO } from '../../../_data/erp.js';
import {
  JOURNAL_IMPORT_CSV,
  JOURNAL_IMPORT_FILE,
  JOURNAL_IMPORT_TEMPLATE_ROWS,
} from '../../../_data/journal-import.js';
import { NOW_AT } from '../../../_data/profile.js';
import { useCan, usePlatform, useScreens } from '../../../_platform/index.js';
import { Figure, josa, Page } from '../../../_ui/index.js';
import { parseCsv, readTextFile, saveText, toCsv } from './csv.js';
import {
  checkRows,
  COLUMNS,
  EXAMPLE,
  readTable,
  type CheckedRow,
  type FieldKey,
  type ImportRow,
} from './rules.js';
import './style.css';

// slot: target — 무엇을 받는지: 이름 · 등록 권한 모듈 · 반영 뒤 여는 화면(블록 id) · 양식 파일 이름 · 파일 크기 한도
const TARGET = {
  label: '전표',
  module: 'accounting',
  screen: 'erp/accounting/journal',
  screenLabel: '전표 입력',
  template: '전표 업로드 양식.csv',
  maxSize: 5_242_880,
} as const;
// slot: target end

type Step = 'upload' | 'check' | 'apply';
type Filter = 'all' | 'failed' | 'passed';

/** 반영한 전표 한 건(결과 표) */
interface Posted {
  no: string;
  source: string;
  date: string;
  memo: string;
  lines: number;
  amount: number;
}

/** 다음 전표번호부터 차례로(JV-2611-0093 → 0094 …) */
function voucherNo(i: number): string {
  const m = /^(.*?)(\d+)$/.exec(NEXT_VOUCHER_NO);
  if (!m) return `${NEXT_VOUCHER_NO}-${i + 1}`;
  return `${m[1]}${String(Number(m[2]) + i).padStart(m[2]!.length, '0')}`;
}

export default function ExcelImport() {
  const toast = useToast();
  const screens = useScreens();
  const { session } = usePlatform();
  const canCreate = useCan(TARGET.module, 'create');
  // 휴대폰은 단계 이름만(설명까지 넣으면 이름이 잘린다)
  const phone = useBreakpoint() === 'base';
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<UploadFile | null>(null);
  const [rows, setRows] = useState<ImportRow[] | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [validOnly, setValidOnly] = useState(true);
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const rowsRef = useRef<HTMLElement>(null);

  const result = useMemo(() => (rows ? checkRows(rows) : null), [rows]);
  const checked = result?.rows ?? [];
  const passed = checked.filter((r) => r.ok);
  const failed = checked.filter((r) => !r.ok);
  const errorCount = result?.issues.filter((i) => i.level === 'error').length ?? 0;
  const warningCount = result?.issues.filter((i) => i.level === 'warning').length ?? 0;
  const voucherCount = new Set(checked.map((r) => r.voucher || `#${r.key}`)).size;
  const failedVouchers = result ? [...result.vouchers.values()].filter((ok) => !ok).length : 0;

  // 반영할 전표: 통과한 전표번호마다 한 건(파일 순서)
  const posting = useMemo<Posted[]>(() => {
    const groups = new Map<string, CheckedRow[]>();
    for (const r of passed) groups.set(r.voucher, [...(groups.get(r.voucher) ?? []), r]);
    return [...groups.values()].map((lines, i) => ({
      no: voucherNo(i),
      source: lines[0]!.voucher,
      date: lines[0]!.date,
      memo: lines[0]!.memo,
      lines: lines.length,
      amount: lines.reduce((a, r) => a + r.debit, 0),
    }));
  }, [passed]);
  const postedRows = posting.reduce((a, p) => a + p.lines, 0);
  const debitTotal = posting.reduce((a, p) => a + p.amount, 0);
  const creditTotal = passed.reduce((a, r) => a + r.credit, 0);
  const canApply = canCreate && posting.length > 0 && (failed.length === 0 || validOnly);

  // 반영 진행: 전표 한 건씩(서버에서는 묶음 요청 한 번과 진행 알림)
  useEffect(() => {
    if (step !== 'apply' || done) return;
    if (progress >= posting.length) {
      setDone(true);
      toast.show({
        title: `${TARGET.label} ${posting.length}건을 반영했습니다`,
        description: `${postedRows}행 · ${formatAmount(debitTotal, { unit: '원' })}`,
        tone: 'success',
      });
      return;
    }
    const id = window.setTimeout(() => setProgress((p) => p + 1), 180);
    return () => window.clearTimeout(id);
  }, [step, done, progress, posting.length, postedRows, debitTotal, toast]);

  const reset = () => {
    setStep('upload');
    setFile(null);
    setRows(null);
    setFilter('all');
    setValidOnly(true);
    setFocusKey(null);
    setProgress(0);
    setDone(false);
  };

  const pick = async (picked: File) => {
    setRows(null);
    const base = { name: picked.name, size: picked.size };
    if (!/\.csv$/i.test(picked.name)) {
      // XLSX는 읽지 않는다(표 계산 라이브러리 없음). 저장 형식을 바꾸라고 안내한다
      setFile({
        ...base,
        status: 'error',
        error: '이 화면은 CSV만 읽습니다. 엑셀에서 CSV UTF-8 형식으로 저장해 다시 고르세요',
      });
      return;
    }
    setFile({ ...base, status: 'uploading', progress: 60 });
    const table = readTable(parseCsv(await readTextFile(picked)));
    if ('error' in table) {
      setFile({ ...base, status: 'error', error: table.error });
      return;
    }
    setRows(table.rows);
    setFile({ ...base, status: 'done' });
  };

  const downloadTemplate = () =>
    saveText(TARGET.template, toCsv([COLUMNS.map((c) => c.name), ...JOURNAL_IMPORT_TEMPLATE_ROWS]));
  const downloadFailed = () => {
    if (!result) return;
    const why = (r: CheckedRow) =>
      result.issues
        .filter((i) => i.rowKey === r.key || i.id === `voucher-${r.voucher}`)
        .map((i) => i.title)
        .join(' · ') || '같은 전표의 다른 줄에 오류가 있습니다';
    saveText(
      `${(file?.name ?? TARGET.template).replace(/\.csv$/i, '')} 실패 행.csv`,
      toCsv([
        ['줄', ...COLUMNS.map((c) => c.name), '오류'],
        ...failed.map((r) => [
          String(r.line),
          r.voucher,
          r.date,
          r.code,
          r.account,
          r.party,
          r.debitText,
          r.creditText,
          r.memo,
          why(r),
        ]),
      ]),
    );
  };

  const goToIssue = (id: string) => {
    const issue = result?.issues.find((i) => i.id === id);
    if (!issue) return;
    const row = checked.find((r) => r.key === issue.rowKey);
    if (row && ((filter === 'passed' && !row.ok) || (filter === 'failed' && row.ok)))
      setFilter('all');
    setFocusKey(issue.rowKey);
    // 아래 고정 동작 줄에 가리지 않게 그 행을 스크롤 영역 가운데로(표는 가장 가까운 자리까지만 스크롤한다)
    requestAnimationFrame(() => centerRow(issue.rowKey));
  };
  /** 행을 감싼 스크롤 영역(내용 영역)에서 그 행을 가운데로. 넘침을 숨긴 틀은 건드리지 않는다 */
  const centerRow = (key: string) => {
    const row = rowsRef.current?.querySelector<HTMLElement>(`[data-key="${key}"]`);
    let box = row?.parentElement ?? null;
    while (
      box &&
      !(
        /(auto|scroll)/.test(getComputedStyle(box).overflowY) && box.scrollHeight > box.clientHeight
      )
    )
      box = box.parentElement;
    if (!row || !box) return;
    const r = row.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    box.scrollTo({ top: box.scrollTop + (r.top - b.top) - (b.height - r.height) / 2 });
  };

  /** 틀린 · 경고 칸: 아이콘(이름 있음) + 값. 바탕을 칠하지 않는다 */
  const mark = (r: CheckedRow, key: FieldKey, content: ReactNode): ReactNode => {
    const bad = r.invalid.includes(key);
    const warn = !bad && r.warned.includes(key);
    if (!bad && !warn) return content;
    return (
      <span className="tl-block-import-cell" data-level={bad ? 'error' : 'warning'}>
        <Icon
          name={bad ? 'circle-alert' : 'triangle-alert'}
          size={16}
          label={bad ? '오류' : '경고'}
          className="tl-block-import-cell__icon"
        />
        {content === '' || content == null ? (
          <span className="tl-block-import-cell__empty">비어 있음</span>
        ) : (
          content
        )}
      </span>
    );
  };
  // 빈 금액 칸: 표는 비워 두고(장부 관습), 휴대폰 카드는 "–"로 라벨만 남지 않게
  const amount = (text: string, n: number) =>
    text === '' || n === 0 ? (phone && text === '' ? '–' : text) : formatAmount(n);

  const shownRows = filter === 'failed' ? failed : filter === 'passed' ? passed : checked;
  const issues: IssueItem[] = (result?.issues ?? []).map((i) => ({
    id: i.id,
    level: i.level,
    tag: i.tag,
    title: i.title,
    message: i.message,
  }));

  const steps: StepperStep[] = [
    {
      id: 'upload',
      label: '파일 업로드',
      description: file?.status === 'done' ? file.name : 'CSV 파일 고르기',
      state: step === 'upload' ? 'current' : 'done',
    },
    {
      id: 'check',
      label: '검증',
      description:
        result && step !== 'upload'
          ? `통과 ${passed.length}행 · 실패 ${failed.length}행`
          : '행마다 확인',
      state: step === 'check' ? 'current' : step === 'apply' ? 'done' : 'todo',
    },
    {
      id: 'apply',
      label: '반영',
      description: done
        ? `${TARGET.label} ${posting.length}건 반영`
        : `통과한 ${TARGET.label}만 등록`,
      state: step === 'apply' ? (done ? 'done' : 'current') : 'todo',
    },
  ];

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: '관리' }, { label: '엑셀 업로드' }]}
          title="엑셀 업로드"
          description={`${josa(TARGET.label, '을/를')} CSV 파일로 한 번에 등록합니다. 행마다 검증하고 통과한 ${TARGET.label}만 반영합니다`}
        />
      }
    >
      <Card>
        <Stepper
          steps={phone ? steps.map((s) => ({ ...s, description: undefined })) : steps}
          label="업로드 단계"
        />
      </Card>

      {step === 'upload' && (
        <>
          <div className="tl-block-import-upload">
            <Card title="파일" subtitle="같은 전표번호의 줄이 전표 하나입니다">
              <div className="tl-block-import-stack">
                <Field label="CSV 파일">
                  <FileUpload
                    accept=".csv,.xlsx,.xls"
                    maxSize={TARGET.maxSize}
                    hint="CSV 5MB 이하. 엑셀 파일은 CSV UTF-8로 저장해 업로드하세요"
                    files={file ? [file] : []}
                    onFilesChange={(fs) => fs[0] && void pick(fs[0])}
                    onRemove={() => {
                      setFile(null);
                      setRows(null);
                    }}
                  />
                </Field>
                <div className="tl-block-import-row">
                  <Button
                    icon="file-spreadsheet"
                    onPress={() =>
                      void pick(
                        new File([JOURNAL_IMPORT_CSV], JOURNAL_IMPORT_FILE, { type: 'text/csv' }),
                      )
                    }
                  >
                    샘플 파일 불러오기
                  </Button>
                  <Button icon="download" onPress={downloadTemplate}>
                    양식 다운로드
                  </Button>
                </div>
              </div>
            </Card>
            <Card
              title="양식 열"
              subtitle="첫 줄은 열 이름입니다. 순서는 바뀌어도 됩니다"
              padding="none"
            >
              <DataGrid
                caption="양식 열"
                rowKey="key"
                rows={COLUMNS.map((c, i) => ({ ...c, example: EXAMPLE[i] ?? '' }))}
                columns={[
                  {
                    key: 'name',
                    header: '열',
                    width: 'sm',
                    mobile: 'title',
                    render: (c) => (
                      <DataGridLines primary={c.name} secondary={c.required ? '필수' : '선택'} />
                    ),
                  },
                  { key: 'rule', header: '규칙', wrap: true, mobile: 'meta' },
                  {
                    key: 'example',
                    header: '예',
                    width: 'lg',
                    wrap: true,
                    mobile: 'meta',
                    render: (c) => <span className="tl-block-import-example">{c.example}</span>,
                  },
                ]}
              />
            </Card>
          </div>
          <ActionBar
            sticky
            summary={
              rows
                ? `${rows.length}행 · ${TARGET.label} ${new Set(rows.map((r) => r.voucher)).size}건을 읽었습니다`
                : '파일을 고르면 행 수를 셉니다'
            }
          >
            <Button
              variant="primary"
              iconEnd="arrow-right"
              disabled={!rows}
              onPress={() => setStep('check')}
            >
              검증
            </Button>
          </ActionBar>
        </>
      )}

      {step === 'check' && result && (
        <>
          <div className="tl-block-import-summary" aria-label="검증 결과">
            <span className="tl-block-import-summary__file">
              <Icon name="file-spreadsheet" className="tl-block-import-summary__icon" />
              {file?.name}
            </span>
            <span className="tl-block-import-summary__counts">
              <span>
                {checked.length}행 · {TARGET.label} {voucherCount}건
              </span>
              <StatusDot tone="success">통과 {passed.length}행</StatusDot>
              <StatusDot tone="danger">
                실패 {failed.length}행 · {TARGET.label} {failedVouchers}건
              </StatusDot>
              {warningCount > 0 && <StatusDot tone="warning">경고 {warningCount}건</StatusDot>}
            </span>
          </div>
          <div className="tl-block-import-check">
            <IssueList
              title={`확인할 항목 ${errorCount + warningCount}건`}
              items={issues}
              onSelect={goToIssue}
              empty="모든 행이 통과했습니다"
              maxHeight="calc(var(--tl-space-64) * 4.5)"
            />
            <section className="tl-block-import-rows" aria-label="업로드한 행" ref={rowsRef}>
              <SegmentedControl
                size="sm"
                label="행 보기"
                value={filter}
                onChange={(v) => setFilter(v as Filter)}
                options={[
                  { value: 'all', label: `전체 ${checked.length}` },
                  { value: 'failed', label: `실패 ${failed.length}` },
                  { value: 'passed', label: `통과 ${passed.length}` },
                ]}
              />
              <DataGrid
                caption="업로드한 행"
                rowKey="key"
                rows={shownRows}
                activeRowKey={focusKey}
                scrollToKey={focusKey}
                flashKey={focusKey}
                empty={
                  filter === 'failed'
                    ? '실패한 행이 없습니다'
                    : '통과한 행이 없습니다. 파일을 고쳐 다시 업로드하세요'
                }
                columns={[
                  { key: 'line', header: '줄', width: 'xs', align: 'right', mobile: 'hidden' },
                  {
                    key: 'ok',
                    header: '상태',
                    width: 'sm',
                    mobile: 'status',
                    render: (r) => (
                      <StatusDot tone={r.ok ? 'success' : 'danger'}>
                        {r.ok ? '통과' : '실패'}
                      </StatusDot>
                    ),
                  },
                  {
                    key: 'voucher',
                    header: '전표',
                    width: 'xs',
                    mobile: 'hidden',
                    render: (r) => mark(r, 'voucher', r.voucher),
                  },
                  {
                    key: 'date',
                    header: '일자',
                    width: 'md',
                    mobile: 'meta',
                    render: (r) => mark(r, 'date', r.date),
                  },
                  {
                    key: 'code',
                    header: '계정',
                    width: 'lg',
                    mobile: 'title',
                    render: (r) => (
                      <DataGridLines
                        primary={mark(r, 'code', r.code)}
                        secondary={accountByCode(r.code)?.name ?? (r.account || '–')}
                      />
                    ),
                  },
                  {
                    key: 'party',
                    header: '거래처',
                    width: 'md',
                    mobile: 'hidden',
                    render: (r) => mark(r, 'party', r.party),
                  },
                  {
                    key: 'debit',
                    header: '차변',
                    width: 'md',
                    format: 'amount',
                    mobile: 'meta',
                    render: (r) => mark(r, 'debit', amount(r.debitText, r.debit)),
                  },
                  {
                    key: 'credit',
                    header: '대변',
                    width: 'md',
                    format: 'amount',
                    mobile: 'meta',
                    render: (r) => mark(r, 'credit', amount(r.creditText, r.credit)),
                  },
                  { key: 'memo', header: '적요', wrap: true, mobile: 'hidden' },
                ]}
              />
            </section>
          </div>
          <ActionBar
            sticky
            align="between"
            summary={
              <span className="tl-block-import-apply">
                {failed.length > 0 && (
                  <Checkbox checked={validOnly} onChange={setValidOnly}>
                    실패한 {josa(TARGET.label, '은/는')} 빼고 반영
                  </Checkbox>
                )}
                <span className="tl-block-import-apply__count">
                  반영할 {TARGET.label} {canApply ? posting.length : 0}건 ·{' '}
                  {canApply ? postedRows : 0}행
                </span>
              </span>
            }
          >
            <Button icon="upload" onPress={reset}>
              다시 업로드
            </Button>
            <Button
              variant="primary"
              icon="check"
              disabled={!canApply}
              disabledReason={
                !canCreate
                  ? `${TARGET.label} 등록 권한이 없습니다`
                  : posting.length === 0
                    ? `통과한 ${josa(TARGET.label, '이/가')} 없습니다. 파일을 고쳐 다시 업로드하세요`
                    : `실패한 행을 고쳐 다시 업로드하거나 실패한 ${josa(TARGET.label, '은/는')} 빼고 반영을 고르세요`
              }
              onPress={() => {
                setStep('apply');
                setProgress(0);
                setDone(false);
              }}
            >
              반영
            </Button>
          </ActionBar>
        </>
      )}

      {step === 'apply' && (
        <>
          {!done ? (
            <Card
              title={`${TARGET.label} 반영 중`}
              subtitle="반영이 끝날 때까지 이 화면을 닫지 마세요"
            >
              <div className="tl-block-import-stack">
                <Progress
                  label={`${TARGET.label} 반영`}
                  value={progress}
                  max={posting.length}
                  unit="건"
                  showValue
                />
                <p className="tl-block-import-muted">
                  {posting[Math.min(progress, posting.length - 1)]?.no} ·{' '}
                  {posting[Math.min(progress, posting.length - 1)]?.memo}
                </p>
              </div>
            </Card>
          ) : (
            <Card title="반영 결과" subtitle={`${NOW_AT} · ${session.user.name}`}>
              <div className="tl-block-import-stack">
                <p className="tl-block-import-done">
                  <Icon name="circle-check" size={20} className="tl-block-import-done__icon" />
                  {TARGET.label} {posting.length}건 · {postedRows}행을 반영했습니다
                </p>
                <div className="tl-block-import-figures">
                  <Figure label={`반영한 ${TARGET.label}`} value={posting.length} unit="건" />
                  <Figure label="차변 합계" value={formatAmount(debitTotal)} unit="원" />
                  <Figure label="대변 합계" value={formatAmount(creditTotal)} unit="원" />
                  <Figure label="제외한 행" value={failed.length} unit="행" />
                </div>
                <DataGrid
                  caption={`반영한 ${TARGET.label}`}
                  rowKey="no"
                  rows={posting}
                  summary
                  columns={[
                    { key: 'no', header: '전표번호', width: 'md', mobile: 'title', total: 'count' },
                    {
                      key: 'source',
                      header: '파일 번호',
                      width: 'sm',
                      align: 'right',
                      mobile: 'hidden',
                    },
                    { key: 'date', header: '일자', width: 'sm', format: 'date', mobile: 'meta' },
                    { key: 'memo', header: '적요', wrap: true, mobile: 'meta' },
                    {
                      key: 'lines',
                      header: '줄',
                      width: 'xs',
                      format: 'number',
                      mobile: 'hidden',
                      total: 'sum',
                    },
                    {
                      key: 'amount',
                      header: '금액',
                      width: 'md',
                      format: 'amount',
                      mobile: 'trailing',
                      total: 'sum',
                    },
                  ]}
                />
              </div>
            </Card>
          )}
          {done && (
            <ActionBar sticky>
              {failed.length > 0 && (
                <Button icon="download" onPress={downloadFailed}>
                  실패 행 다운로드
                </Button>
              )}
              <Button icon="upload" onPress={reset}>
                새 파일 업로드
              </Button>
              {screens.has(TARGET.screen) && (
                <Button
                  variant="primary"
                  iconEnd="arrow-right"
                  onPress={() => screens.go(TARGET.screen)}
                >
                  {TARGET.screenLabel}에서 보기
                </Button>
              )}
            </ActionBar>
          )}
        </>
      )}
    </Page>
  );
}
