// 은행 대사(LedgerEntry): 통장 거래와 장부 전표를 두 목록에서 맞춘다. 맞춘 금액 · 남은 거래 · 조정 항목 · 남은 차이.
// 넓은 화면은 두 목록 나란히, 휴대폰은 SegmentedControl로 한 목록씩. 고른 거래의 합과 차이는 아래 ActionBar
import { formatAmount, formatDate, formatPeriod } from '@terracelab/trellis-contracts';
import {
  ActionBar,
  Badge,
  Button,
  Card,
  DataGrid,
  DataGridLines,
  EmptyState,
  PageHeader,
  SegmentedControl,
  useBreakpoint,
  useToast,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  autoMatch,
  BOOK,
  RECON_ACCOUNT,
  RECON_OPENING,
  RECON_PERIOD,
  STATEMENT,
  STATEMENT_BALANCE,
  type BookEntry,
  type StatementLine,
} from '../../../_data/closing.js';
import { sum, TODAY } from '../../../_data/index.js';
import { useCan } from '../../../_platform/index.js';
import { Col, Figure, Grid, Page } from '../../../_ui/index.js';
import './style.css';

/** 맞춘 묶음: 통장 거래 여럿 ↔ 장부 전표 여럿(합이 같다) */
interface Match {
  id: string;
  statementIds: readonly string[];
  bookIds: readonly string[];
  how: 'auto' | 'manual' | 'voucher' | 'fixed';
}

// slot: methods — 맞춘 방법 글자(맞춘 거래 표의 방법 열)
const HOW: Record<Match['how'], string> = {
  auto: '자동',
  manual: '직접',
  voucher: '전표 입력',
  fixed: '전표 금액 수정',
};
// slot: methods end

// slot: vouchers — 장부에 없는 통장 거래로 만드는 전표 번호 앞머리(입금 · 출금)
const VOUCHER_PREFIX = { in: 'RV', out: 'PV' } as const;
// slot: vouchers end

/** 은행 거래내역을 불러온 시각 */
const LOADED_AT = '15:30';
const won = (v: number) => `${formatAmount(v, { sign: 'auto' })}원`;
const signed = (v: number) => `${formatAmount(v, { sign: 'always' })}원`;
const mmdd = (iso: string) => iso.slice(5);

/** 같은 앞머리(PV-2611-) 전표 번호 중 가장 큰 번호 + 1 */
function nextVoucher(prefix: string, entries: readonly BookEntry[]): string {
  const head = `${prefix}-${TODAY.slice(2, 4)}${TODAY.slice(5, 7)}-`;
  const max = Math.max(
    0,
    ...entries
      .filter((e) => e.voucherId.startsWith(head))
      .map((e) => Number(e.voucherId.slice(-4))),
  );
  return `${head}${String(max + 1).padStart(4, '0')}`;
}

const initialMatches = (): Match[] =>
  autoMatch(STATEMENT, BOOK).map((p, i) => ({
    id: `m${i + 1}`,
    statementIds: [p.statementId],
    bookIds: [p.bookId],
    how: 'auto',
  }));

export default function Reconcile() {
  const toast = useToast();
  const phone = useBreakpoint() === 'base';
  const canPost = useCan('accounting', 'create');
  const canConfirm = useCan('treasury', 'approve');
  const [entries, setEntries] = useState<BookEntry[]>(() => [...BOOK]);
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  /** 조정 항목: 장부에만 있고 은행에 다음에 반영되는 거래(예약 이체) */
  const [adjusted, setAdjusted] = useState<string[]>([]);
  const [pickS, setPickS] = useState<string[]>([]);
  const [pickB, setPickB] = useState<string[]>([]);
  const [view, setView] = useState('bank');
  const [confirmed, setConfirmed] = useState(false);

  const matchedS = new Set(matches.flatMap((m) => m.statementIds));
  const matchedB = new Set(matches.flatMap((m) => m.bookIds));
  const openS = STATEMENT.filter((s) => !matchedS.has(s.id));
  const openB = entries.filter((b) => !matchedB.has(b.id) && !adjusted.includes(b.id));
  const adjustedRows = entries.filter((b) => adjusted.includes(b.id));
  const bookBalance = RECON_OPENING + sum(entries, (b) => b.amount);
  const adjustedNet = sum(adjustedRows, (b) => b.amount);
  const remaining = STATEMENT_BALANCE + adjustedNet - bookBalance;
  const matchedAmount = sum(
    STATEMENT.filter((s) => matchedS.has(s.id)),
    (s) => s.amount,
  );
  const selS = STATEMENT.filter((s) => pickS.includes(s.id));
  const selB = entries.filter((b) => pickB.includes(b.id));
  const sumS = sum(selS, (s) => s.amount);
  const sumB = sum(selB, (b) => b.amount);
  const diff = sumS - sumB;
  const canMatch = selS.length > 0 && selB.length > 0 && diff === 0;
  const canFix = canPost && selS.length === 1 && selB.length === 1 && diff !== 0;
  const done = openS.length === 0 && openB.length === 0 && remaining === 0;
  const account = `${RECON_ACCOUNT.bank} ${RECON_ACCOUNT.name.split(' · ')[0]}`;

  const addMatch = (statementIds: string[], bookIds: string[], how: Match['how']) => {
    setMatches((list) => [
      ...list,
      { id: `m${Date.now()}-${list.length}`, statementIds, bookIds, how },
    ]);
    setPickS([]);
    setPickB([]);
  };
  const postVoucher = (s: StatementLine) => {
    const voucherId = nextVoucher(VOUCHER_PREFIX[s.amount > 0 ? 'in' : 'out'], entries);
    const entry: BookEntry = {
      id: `n-${s.id}`,
      date: s.date,
      voucherId,
      amount: s.amount,
      counterparty: s.counterparty,
      memo: s.memo,
    };
    setEntries((list) => [...list, entry]);
    addMatch([s.id], [entry.id], 'voucher');
    toast.show({
      title: `전표 ${voucherId}을 입력하고 맞췄습니다`,
      description: `${s.counterparty} · ${won(s.amount)}`,
      tone: 'success',
    });
  };
  const fixAmount = () => {
    const s = selS[0]!;
    const b = selB[0]!;
    setEntries((list) => list.map((e) => (e.id === b.id ? { ...e, amount: s.amount } : e)));
    addMatch([s.id], [b.id], 'fixed');
    toast.show({
      title: `${b.voucherId} 금액을 고치고 맞췄습니다`,
      description: `${won(b.amount)} → ${won(s.amount)}`,
      tone: 'success',
    });
  };
  const rerunAuto = () => {
    const pairs = autoMatch(openS, openB);
    if (!pairs.length) {
      toast.show({
        title: '자동으로 맞출 거래가 없습니다',
        description: '금액이 같은 거래가 없습니다',
      });
      return;
    }
    setMatches((list) => [
      ...list,
      ...pairs.map((p, i) => ({
        id: `a${Date.now()}-${i}`,
        statementIds: [p.statementId],
        bookIds: [p.bookId],
        how: 'auto' as const,
      })),
    ]);
    toast.show({ title: `${pairs.length}건을 자동으로 맞췄습니다`, tone: 'success' });
  };

  const statementGrid = (
    <DataGrid
      caption="통장 거래"
      className="tl-block-flat-grid"
      rows={openS}
      rowKey="id"
      selectable={!confirmed}
      selected={pickS}
      onSelectedChange={setPickS}
      empty="남은 통장 거래가 없습니다"
      columns={[
        {
          key: 'counterparty',
          header: '적요',
          mobile: 'title',
          render: (s) => (
            <DataGridLines primary={s.counterparty} secondary={`${mmdd(s.date)} · ${s.memo}`} />
          ),
        },
        {
          key: 'amount',
          header: '금액',
          width: 'md',
          format: 'amount',
          finance: true,
          total: 'sum',
          mobile: 'trailing',
        },
      ]}
      {...(canPost && !confirmed
        ? {
            rowActions: (s: StatementLine) => (
              <Button size="sm" onPress={() => postVoucher(s)}>
                전표 입력
              </Button>
            ),
          }
        : {})}
    />
  );

  const bookGrid = (
    <DataGrid
      caption="장부 전표"
      className="tl-block-flat-grid"
      rows={openB}
      rowKey="id"
      selectable={!confirmed}
      selected={pickB}
      onSelectedChange={setPickB}
      empty="남은 장부 전표가 없습니다"
      columns={[
        {
          key: 'voucherId',
          header: '전표',
          mobile: 'title',
          render: (b) => (
            <DataGridLines
              primary={<span className="tl-block-code">{b.voucherId}</span>}
              secondary={`${mmdd(b.date)} · ${b.counterparty} · ${b.pendingNote ?? b.memo}`}
            />
          ),
        },
        {
          key: 'amount',
          header: '금액',
          width: 'md',
          format: 'amount',
          finance: true,
          total: 'sum',
          mobile: 'trailing',
        },
      ]}
      {...(!confirmed
        ? {
            rowActions: (b: BookEntry) => (
              <Button
                size="sm"
                onPress={() => {
                  setAdjusted((list) => [...list, b.id]);
                  setPickB((list) => list.filter((id) => id !== b.id));
                }}
              >
                조정 처리
              </Button>
            ),
          }
        : {})}
    />
  );

  const matchedRows = matches.map((m) => {
    const ss = STATEMENT.filter((s) => m.statementIds.includes(s.id));
    const bs = entries.filter((b) => m.bookIds.includes(b.id));
    return {
      id: m.id,
      how: m.how,
      date: ss[0]?.date ?? '',
      statement: ss.map((s) => s.counterparty).join(' · '),
      memo: ss.map((s) => s.memo).join(' · '),
      vouchers: bs.map((b) => b.voucherId).join(' · '),
      amount: sum(ss, (s) => s.amount),
    };
  });

  const matchedGrid = (
    <div className="tl-block-recon-matched">
      <DataGrid
        caption="맞춘 거래"
        className="tl-block-flat-grid"
        rows={matchedRows}
        rowKey="id"
        summary
        columns={[
          { key: 'date', header: '일자', width: 'xs', render: (r) => mmdd(r.date), mobile: 'meta' },
          {
            key: 'statement',
            header: '통장',
            mobile: 'title',
            render: (r) => <DataGridLines primary={r.statement} secondary={r.memo} />,
          },
          {
            key: 'vouchers',
            header: '장부',
            width: 'lg',
            mobile: 'meta',
            render: (r) => <span className="tl-block-code">{r.vouchers}</span>,
          },
          { key: 'how', header: '방법', width: 'sm', render: (r) => HOW[r.how], mobile: 'meta' },
          {
            key: 'amount',
            header: '금액',
            width: 'md',
            format: 'amount',
            finance: true,
            total: 'sum',
            mobile: 'trailing',
          },
        ]}
        {...(!confirmed
          ? {
              rowActions: (r: (typeof matchedRows)[number]) => (
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() => setMatches((list) => list.filter((m) => m.id !== r.id))}
                >
                  풀기
                </Button>
              ),
            }
          : {})}
      />
      {adjustedRows.length > 0 && (
        <div className="tl-block-recon-adjusted" role="group" aria-label="조정 항목">
          <p className="tl-block-recon-adjusted__title">
            조정 항목 {adjustedRows.length}건 · 은행에 다음에 반영됩니다
          </p>
          <ul>
            {adjustedRows.map((b) => (
              <li key={b.id}>
                <span className="tl-block-code">{b.voucherId}</span>
                <span>
                  {b.counterparty} · {b.pendingNote ?? b.memo}
                </span>
                <span className="tl-block-recon-adjusted__amount">{won(b.amount)}</span>
                {!confirmed && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onPress={() => setAdjusted((list) => list.filter((id) => id !== b.id))}
                  >
                    되돌리기
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const selection =
    selS.length || selB.length
      ? `통장 ${selS.length}건 ${won(sumS)} · 장부 ${selB.length}건 ${won(sumB)} · 차이 ${won(diff)}`
      : '통장 거래와 장부 전표를 하나씩 고르면 맞출 수 있습니다';

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: '자금' }, { label: '은행 대사' }]}
          title="은행 대사"
          meta={
            confirmed ? <Badge tone="success">확정</Badge> : <Badge tone="neutral">대사 중</Badge>
          }
          description={`${account} ${RECON_ACCOUNT.no} · ${formatPeriod(RECON_PERIOD.from, RECON_PERIOD.to)} · 은행 거래내역 ${LOADED_AT} 불러옴`}
          actions={
            <>
              <Button icon="refresh-cw" disabled={confirmed} onPress={rerunAuto}>
                자동 맞추기
              </Button>
              <Button
                variant="primary"
                icon="circle-check"
                disabled={!canConfirm || !done || confirmed}
                {...(!done
                  ? { disabledReason: '남은 거래를 맞추거나 조정 처리해야 확정할 수 있습니다' }
                  : !canConfirm
                    ? { disabledReason: '대사를 확정할 권한이 없습니다' }
                    : {})}
                onPress={() => {
                  setConfirmed(true);
                  toast.show({
                    title: `${formatDate(TODAY, 'md')} 은행 대사를 확정했습니다`,
                    description: `${account} · 조정 항목 ${adjustedRows.length}건`,
                    tone: 'success',
                  });
                }}
              >
                대사 확정
              </Button>
            </>
          }
        />
      }
    >
      <Grid>
        <Col span={12}>
          <Card>
            <div className="tl-block-recon-eq" role="group" aria-label="잔액 맞추기">
              <Figure label="통장 잔액" value={formatAmount(STATEMENT_BALANCE)} unit="원" />
              <Figure
                label="조정 항목"
                value={formatAmount(adjustedNet, { sign: 'always' })}
                unit="원"
              />
              <Figure label="장부 잔액" value={formatAmount(bookBalance)} unit="원" />
              <Figure
                label="남은 차이"
                value={formatAmount(remaining, { sign: 'auto' })}
                unit="원"
                {...(remaining !== 0 ? { tone: 'danger' as const } : {})}
              />
            </div>
            <p className="tl-block-recon-status">
              맞춘 거래 {matches.length}건 {signed(matchedAmount)} · 남은 통장 {openS.length}건 ·
              남은 장부 {openB.length}건{done && !confirmed ? ' · 확정할 수 있습니다' : ''}
            </p>
          </Card>
        </Col>

        {phone ? (
          <Col span={12}>
            <SegmentedControl
              label="목록"
              value={view}
              onChange={setView}
              options={[
                { value: 'bank', label: '통장', count: openS.length },
                { value: 'book', label: '장부', count: openB.length },
                { value: 'matched', label: '맞춘 거래', count: matches.length },
              ]}
            />
            <Card padding="none">
              {view === 'bank' ? statementGrid : view === 'book' ? bookGrid : matchedGrid}
            </Card>
          </Col>
        ) : (
          <>
            <Col span={6}>
              <Card
                title="통장 거래"
                subtitle={`남은 ${openS.length}건 · ${signed(sum(openS, (s) => s.amount))}`}
                padding="none"
              >
                {statementGrid}
              </Card>
            </Col>
            <Col span={6}>
              <Card
                title="장부 전표"
                subtitle={`남은 ${openB.length}건 · ${signed(sum(openB, (b) => b.amount))}`}
                padding="none"
              >
                {bookGrid}
              </Card>
            </Col>
            <Col span={12}>
              <Card
                title="맞춘 거래"
                subtitle={`${matches.length}건 · 자동 ${matches.filter((m) => m.how === 'auto').length}건`}
                padding="none"
              >
                {matches.length ? (
                  matchedGrid
                ) : (
                  <EmptyState
                    size="sm"
                    icon="landmark"
                    title="맞춘 거래가 없습니다"
                    description="자동 맞추기를 누르거나 두 목록에서 하나씩 골라 맞춥니다"
                  />
                )}
              </Card>
            </Col>
          </>
        )}
      </Grid>

      {!confirmed && (
        <ActionBar sticky summary={<span className="tl-block-recon-selection">{selection}</span>}>
          <Button icon="pencil" disabled={!canFix} onPress={fixAmount}>
            전표 금액 수정
          </Button>
          <Button
            variant="primary"
            icon="check"
            disabled={!canMatch}
            onPress={() => addMatch(pickS, pickB, 'manual')}
          >
            맞추기
          </Button>
        </ActionBar>
      )}
    </Page>
  );
}
