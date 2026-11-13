// 업무 도우미(에이전트 대화) 샘플(PG-34). 네트워크 · 모델 호출 없이 질문에 정해진 답을 낸다.
// 질문 셋: 문서(결산 보고서) · 세금계산서와 전표(전송 실패) · 재고(가리비 관자). 답의 숫자 · 이름은 같은 샘플 데이터에서
// 만든다(회사 데이터를 바꿔 끼우면 답도 따라 바뀐다). 실제 서비스에서는 useAssistantRuns를 에이전트 API 호출로 바꾼다.
import {
  AGENT_RUN_STATES,
  INVOICE_STATES,
  dueDays,
  formatAmount,
  formatDate,
  formatQuantity,
  type AgentRunState,
  type ChangeDiffRow,
  type CitationSource,
  type ComposerCommand,
  type MessageThreadFeedback,
  type ProposalStatus,
} from '@terracelab/trellis-contracts';
import { useEffect, useRef, useState } from 'react';
import { MY_FILES, MY_FOLDERS, staffLabel, versionsOf, type DocFile } from './ecm-crm.js';
import { VOUCHERS } from './erp.js';
import { NOW } from './profile.js';
import {
  INVOICES,
  invoiceSupply,
  invoiceTax,
  itemById,
  partyById,
  STOCK,
  TODAY,
  warehouseById,
} from './trade.js';

export type AssistantTopic = 'docs' | 'ledger' | 'stock' | 'other';

/** 출처. 본문 [n]과 번호가 같다. 앱 안에서 여는 곳(문서 · 화면)과 결과 칸 요약을 함께 둔다 */
export interface AssistantSource extends CitationSource {
  index: number;
  /** 문서함 문서 id(문서 미리 보기로 연다) */
  docId?: string;
  /** 앱 화면(블록 id) */
  screen?: string;
  /** 결과 칸 요약 한 줄 */
  excerpt?: string;
  /** 결과 칸 이름 · 값 */
  facts?: readonly { label: string; value: string }[];
}

export interface AssistantStep {
  id: string;
  name: string;
  description?: string;
  state: AgentRunState;
  durationMs?: number;
  /** 펼친 상세(조회 조건 · 오류) */
  detail?: string;
}

export interface AssistantProposal {
  title: string;
  summary: string;
  changes: readonly ChangeDiffRow[];
  approveLabel?: string;
  status: ProposalStatus;
  reason?: string;
  resolvedBy?: string;
}

/** 질문 하나와 그 답 */
export interface AssistantTurn {
  id: string;
  question: string;
  /** 'YYYY-MM-DD HH:mm' */
  askedAt: string;
  topic: AssistantTopic;
  /** 지금 보이는 답(쓰는 중이면 자라는 중) */
  text: string;
  streaming: boolean;
  failed: boolean;
  steps: readonly AssistantStep[];
  sources: readonly AssistantSource[];
  proposal?: AssistantProposal;
  feedback?: MessageThreadFeedback;
  /** 몇 번째 실행인가(다시 생성하면 늘어난다) */
  attempt: number;
}

export interface AssistantConversation {
  id: string;
  title: string;
  turns: readonly AssistantTurn[];
}

/** 질문에서 정한 실행 계획(단계 · 답 · 출처 · 제안) */
interface Plan {
  topic: AssistantTopic;
  title: string;
  steps: readonly (Omit<AssistantStep, 'state'> & { durationMs: number; fail?: string })[];
  answer: string;
  sources: readonly AssistantSource[];
  proposal?: Omit<AssistantProposal, 'status'>;
  /** 처음 실행은 fail이 있는 단계에서 실패한다. 다시 생성하면 성공한다 */
  failFirst?: boolean;
}

export const ASSISTANT_NAME = '업무 도우미';

/** "/"로 부르는 범위 명령 */
export const ASSISTANT_COMMANDS: readonly ComposerCommand[] = [
  { id: 'docs', name: '문서', description: '문서함에서 찾습니다' },
  { id: 'ledger', name: '전표', description: '전표 · 세금계산서에서 찾습니다' },
  { id: 'stock', name: '재고', description: '창고별 재고 · 로트에서 찾습니다' },
];

/* ── 샘플 대상 ─────────────────────────────────────────── */

const stem = (name: string) => name.replace(/\.[a-z0-9]+$/i, '');
/** 결산 보고서(확정본이 있는 문서)와 같이 보는 대사표 */
const REPORT = MY_FILES.find((f) => f.versions?.length && f.attachments?.length) ?? MY_FILES[0]!;
const RECON =
  MY_FILES.find((f) => f.id !== REPORT.id && f.folderId === REPORT.folderId) ?? MY_FILES[1]!;
const FAILED = INVOICES.filter((i) => i.state === 'failed');
/** 유통기한이 30일 안에 오는 로트가 있는 재고 */
const STOCK_ROW =
  STOCK.find((s) => s.lots.some((l) => l.qty > 0 && l.expiry && dueDays(l.expiry, TODAY) <= 30)) ??
  STOCK.find((s) => s.lots.length > 0) ??
  STOCK[0]!;

const folderName = (id: string) => MY_FOLDERS.find((f) => f.id === id)?.name ?? '';
const won = (n: number) => formatAmount(n);

/* ── 계획: 문서 ───────────────────────────────────────── */

function docSource(f: DocFile, index: number, location: string): AssistantSource {
  const v = versionsOf(f)[0]!;
  return {
    index,
    title: f.name,
    location,
    docId: f.id,
    screen: 'ecm/my-docs/browser',
    excerpt: `${folderName(f.folderId)} · ${f.version}판 · ${staffLabel(v.by)} · ${v.at}`,
    facts: [
      { label: '폴더', value: folderName(f.folderId) },
      { label: '판', value: `${f.version}판 · ${v.note}` },
      { label: '수정', value: `${staffLabel(f.modifiedBy)} · ${f.modifiedAt}` },
      { label: '보존 기한', value: `${f.retainUntil} · ${f.retention}` },
    ],
  };
}

function reportPlan(): Plan {
  const v = versionsOf(REPORT)[0]!;
  const sheet =
    REPORT.attachments?.find((a) => a.name.includes('미수금')) ?? REPORT.attachments?.[0];
  const reconV = versionsOf(RECON)[0]!;
  return {
    topic: 'docs',
    title: `${stem(REPORT.name)} 확정본`,
    steps: [
      {
        id: 'find',
        name: '문서 찾기',
        description: `내 문서 · ${stem(REPORT.name)}`,
        durationMs: 820,
      },
      { id: 'versions', name: '판 이력 읽기', description: `${REPORT.version}판`, durationMs: 640 },
      {
        id: 'related',
        name: '관련 문서 찾기',
        description: folderName(REPORT.folderId),
        durationMs: 910,
      },
      { id: 'write', name: '답변 작성', durationMs: 1_480 },
    ],
    answer: [
      `${stem(REPORT.name)}는 ${v.version}판이 확정본입니다[1]. ${formatDate(v.at.slice(0, 10), 'md')} ${v.at.slice(11)}에 올린 판이고 올린 사람은 ${staffLabel(v.by)}입니다. 판 메모는 "${v.note}"입니다.`,
      '',
      sheet
        ? `${sheet.name.includes('미수금') ? '거래처별 미수금 명세는' : '첨부 파일은'} 이 보고서의 첨부 파일 "${sheet.name}"입니다[1]. 거래처 잔액을 맞춰 보려면 ${stem(RECON.name)}(${RECON.version}판, ${staffLabel(reconV.by)})를 함께 보세요[2].`
        : `같은 폴더의 ${stem(RECON.name)}를 함께 보세요[2].`,
    ].join('\n'),
    sources: [
      docSource(REPORT, 1, `${REPORT.version}판`),
      docSource(RECON, 2, `${RECON.version}판`),
    ],
  };
}

/** 문서 이름을 묻는 질문: 이름이 맞는 문서(없으면 보고 있는 문서)의 정보를 답한다 */
function lookupPlan(question: string, context: readonly DocFile[]): Plan | null {
  const words = question
    .replace(/[?.,]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2);
  const hits = MY_FILES.filter((f) => {
    const name = stem(f.name);
    return words.filter((w) => name.includes(w)).length >= 2;
  });
  const asksContext = /선택|보고 있는|이 문서/.test(question);
  const docs = hits.length ? hits.slice(0, 3) : asksContext ? context.slice(0, 3) : [];
  if (!docs.length) return null;
  const rows = docs.map(
    (f, i) =>
      `| ${stem(f.name)}[${i + 1}] | ${folderName(f.folderId)} | ${f.version}판 | ${staffLabel(f.modifiedBy)} | ${f.retainUntil} |`,
  );
  return {
    topic: 'docs',
    title: stem(docs[0]!.name),
    steps: [
      { id: 'find', name: '문서 찾기', description: `${docs.length}건`, durationMs: 760 },
      { id: 'write', name: '답변 작성', durationMs: 1_120 },
    ],
    answer: [
      `찾은 문서는 ${docs.length}건입니다.`,
      '',
      '| 문서 | 폴더 | 판 | 수정한 사람 | 보존 기한 |',
      '|---|---|---|---|---|',
      ...rows,
      '',
      '문서 이름을 누르면 미리 보기가 열립니다.',
    ].join('\n'),
    sources: docs.map((f, i) => docSource(f, i + 1, `${f.version}판`)),
  };
}

/* ── 계획: 세금계산서 · 전표 ──────────────────────────── */

function ledgerPlan(): Plan {
  const inv = FAILED[0];
  if (!inv)
    return {
      topic: 'ledger',
      title: '세금계산서 전송 실패',
      steps: [
        { id: 'invoices', name: '세금계산서 조회', description: '전송 실패', durationMs: 900 },
      ],
      answer: '이번 달 국세청 전송에 실패한 세금계산서는 없습니다.',
      sources: [],
    };
  const party = partyById(inv.partyId);
  const voucher = VOUCHERS.find((v) => v.docNo === inv.id);
  const rows = FAILED.map(
    (i) =>
      `| ${i.id} | ${partyById(i.partyId).name} | ${i.date} | ${won(invoiceSupply(i))} | ${won(invoiceTax(i))} |`,
  );
  const sources: AssistantSource[] = [
    {
      index: 1,
      title: `세금계산서 ${inv.id}`,
      location: '국세청 전송 결과',
      screen: 'erp/tax/invoice-list',
      excerpt: inv.error ?? INVOICE_STATES.failed.label,
      facts: [
        { label: '거래처', value: party.name },
        { label: '작성일', value: inv.date },
        { label: '공급가액', value: `${won(invoiceSupply(inv))}원` },
        { label: '상태', value: INVOICE_STATES[inv.state].label },
      ],
    },
    {
      index: 2,
      title: `거래처 ${party.name}`,
      location: '사업자 상태',
      screen: 'erp/accounting/vendor-ledger',
      excerpt: `거래처 정보의 사업자 상태: ${party.bizStatus === 'active' ? '정상' : '휴업 · 폐업'}`,
      facts: [
        { label: '거래처 코드', value: party.code },
        { label: '담당자', value: party.manager },
        { label: '결제 조건', value: party.terms },
      ],
    },
  ];
  if (voucher)
    sources.push({
      index: 3,
      title: `전표 ${voucher.id}`,
      location: voucher.date,
      screen: 'erp/accounting/journal',
      excerpt: voucher.memo,
      facts: [
        { label: '구분', value: `${voucher.kind} · ${voucher.evidence}` },
        { label: '작성', value: voucher.writer },
        { label: '연결 문서', value: voucher.docNo ?? '–' },
      ],
    });
  return {
    topic: 'ledger',
    title: '세금계산서 전송 실패 · 관련 전표',
    steps: [
      {
        id: 'invoices',
        name: '세금계산서 조회',
        description: '11월 · 전송 실패',
        durationMs: 1_240,
      },
      { id: 'party', name: '거래처 사업자 상태 확인', description: party.name, durationMs: 980 },
      { id: 'voucher', name: '관련 전표 찾기', description: inv.id, durationMs: 760 },
      { id: 'propose', name: '변경 제안 작성', durationMs: 1_150 },
    ],
    answer: [
      `이번 달 국세청 전송에 실패한 세금계산서는 ${FAILED.length}건입니다[1].`,
      '',
      '| 세금계산서 | 거래처 | 작성일 | 공급가액(원) | 세액(원) |',
      '|---|---|---|---:|---:|',
      ...rows,
      '',
      `실패 사유는 "${inv.error ?? INVOICE_STATES.failed.label}"입니다[1]. 거래처 정보의 사업자 상태는 아직 정상이라 다음 발행에서도 같은 오류가 납니다[2].${voucher ? ` 매출 전표 ${voucher.id}에 같은 금액이 잡혀 있습니다[3].` : ''}`,
      '',
      '거래처 사업자 상태와 세금계산서 상태를 바꾸는 제안을 만들었습니다. 승인해야 바뀝니다.',
    ].join('\n'),
    sources,
    proposal: {
      title: `${party.name} 사업자 상태 · ${inv.id} 상태 변경`,
      summary: `국세청 전송 결과에 맞춰 거래처 ${party.name}의 사업자 상태를 휴업으로 바꾸고 세금계산서 ${inv.id}를 발행 취소합니다. 전표${voucher ? ` ${voucher.id}` : ''}는 바꾸지 않습니다.`,
      changes: [
        { target: party.name, field: '사업자 상태', before: '정상', after: '휴업' },
        {
          target: inv.id,
          field: '상태',
          before: INVOICE_STATES[inv.state].label,
          after: INVOICE_STATES.cancelled.label,
        },
      ],
      approveLabel: '변경 적용',
    },
  };
}

/* ── 계획: 재고 ───────────────────────────────────────── */

function stockPlan(): Plan {
  const s = STOCK_ROW;
  const item = itemById(s.itemId);
  const wh = warehouseById(s.warehouseId);
  const avail = s.qty - s.reserved;
  const gap = item.safetyStock - avail;
  const lots = s.lots.filter((l) => l.qty > 0);
  const soonest = [...lots].sort((a, b) => (a.expiry ?? '').localeCompare(b.expiry ?? ''))[0];
  const q = (n: number) => formatQuantity(n, item.unit);
  return {
    topic: 'stock',
    title: `${wh.name} ${item.name} 재고`,
    failFirst: true,
    steps: [
      { id: 'item', name: '품목 찾기', description: item.name, durationMs: 540 },
      {
        id: 'stock',
        name: '재고 조회',
        description: wh.name,
        durationMs: 1_320,
        fail: '재고 마감 배치가 실행 중이라 조회하지 못했습니다. 잠시 뒤 다시 생성하세요',
      },
      {
        id: 'lots',
        name: '로트 · 유통기한 확인',
        description: `${lots.length}개 로트`,
        durationMs: 870,
      },
      { id: 'write', name: '답변 작성', durationMs: 1_210 },
    ],
    answer: [
      `${wh.name}의 ${item.name} 재고는 ${q(s.qty)}이고, 출고 예약 ${q(s.reserved)}을 빼면 가용재고는 ${q(avail)}입니다[1].${gap > 0 ? ` 안전재고 ${q(item.safetyStock)}보다 ${q(gap)} 적습니다.` : ''}`,
      '',
      `| 로트 | 수량(${item.unit}) | 유통기한 | 입고일 |`,
      '|---|---:|---|---|',
      ...lots.map(
        (l) => `| ${l.lot} | ${formatAmount(l.qty)} | ${l.expiry ?? '–'} | ${l.receivedAt} |`,
      ),
      '',
      soonest?.expiry
        ? `유통기한이 가장 먼저 오는 로트는 ${soonest.lot}(${soonest.expiry}, ${dueDays(soonest.expiry, TODAY)}일 남음)입니다. 이 로트부터 출고하도록 피킹 순서를 확인하세요[2].`
        : '',
    ]
      .join('\n')
      .trim(),
    sources: [
      {
        index: 1,
        title: `재고 현황 · ${item.name}`,
        location: wh.name,
        screen: 'scm/inventory/stock',
        excerpt: `재고 ${q(s.qty)} · 예약 ${q(s.reserved)} · 가용 ${q(avail)}`,
        facts: [
          { label: '품목 코드', value: item.code },
          { label: '안전재고', value: q(item.safetyStock) },
          { label: '창고', value: `${wh.name} · ${wh.kind}` },
        ],
      },
      ...(soonest
        ? [
            {
              index: 2,
              title: `로트 ${soonest.lot}`,
              location: `유통기한 ${soonest.expiry ?? '–'}`,
              screen: 'scm/inventory/lots',
              excerpt: `${q(soonest.qty)} · 입고 ${soonest.receivedAt}`,
              facts: [
                { label: '수량', value: q(soonest.qty) },
                { label: '입고일', value: soonest.receivedAt },
              ],
            },
          ]
        : []),
    ],
  };
}

function otherPlan(): Plan {
  return {
    topic: 'other',
    title: '질문',
    steps: [{ id: 'understand', name: '질문 범위 찾기', durationMs: 700 }],
    answer:
      '이 질문에 맞는 자료를 찾지 못했습니다. 문서 이름 · 세금계산서 번호 · 품목 이름을 넣어 다시 질문하세요. "/"를 치면 찾을 범위를 고를 수 있습니다.',
    sources: [],
  };
}

/** 질문 → 계획. 범위 명령이 있으면 그 범위, 없으면 낱말로 고른다. 같은 질문은 늘 같은 답이다 */
function planFor(question: string, command?: string, context: readonly DocFile[] = []): Plan {
  if (command === 'ledger' || /세금계산서|전표|국세청|분개|계산서/.test(question))
    return ledgerPlan();
  if (command === 'stock' || /재고|로트|유통기한|안전재고|창고/.test(question)) return stockPlan();
  if (/결산 보고서|확정본|미수금 명세/.test(question)) return reportPlan();
  const lookup = lookupPlan(question, context);
  if (lookup) return lookup;
  if (command === 'docs') return reportPlan();
  return otherPlan();
}

/* ── 질문과 답(처음 보이는 대화) ─────────────────────── */

export const ASSISTANT_QUESTIONS = {
  docs: `${stem(REPORT.name)} 확정본은 누가 올렸어? 미수금 명세는 어디 있어?`,
  ledger: '이번 달 세금계산서 국세청 전송 실패 건이랑 관련 전표 알려 줘',
  stock: `${warehouseById(STOCK_ROW.warehouseId).name} ${itemById(STOCK_ROW.itemId).name} 재고 얼마나 남았어?`,
} as const;

/** 빈 대화의 추천 질문(문서 · 전표 · 재고) */
export const ASSISTANT_SUGGESTIONS: readonly string[] = [
  ASSISTANT_QUESTIONS.docs,
  ASSISTANT_QUESTIONS.ledger,
  ASSISTANT_QUESTIONS.stock,
];

/** 문서함 옆 칸의 추천 질문 */
export const DOC_SUGGESTIONS: readonly string[] = [
  ASSISTANT_QUESTIONS.docs,
  `${stem(MY_FILES.find((f) => f.folderId === 'vat')?.name ?? '부가세 신고 서류')}는 어디 있어?`,
  '선택한 문서 정리해 줘',
];

/** 계획의 단계 → 화면 단계. 걸린 시간은 끝난 단계에만(대기 · 실행 중은 비운다) */
const stepsOf = (plan: Plan, state: AgentRunState): AssistantStep[] =>
  plan.steps.map((s) => ({
    id: s.id,
    name: s.name,
    ...(s.description ? { description: s.description } : {}),
    ...(state === 'queued' || state === 'running' ? {} : { durationMs: s.durationMs }),
    state,
  }));

/** 다 끝난 답(처음 보이는 대화). failed면 실패 단계에서 멈춘 모양 */
function finished(
  id: string,
  question: string,
  askedAt: string,
  plan: Plan,
  opts: { failed?: boolean; feedback?: MessageThreadFeedback } = {},
): AssistantTurn {
  const failIndex = plan.steps.findIndex((s) => s.fail);
  const steps = opts.failed
    ? stepsOf(plan, 'succeeded').map((s, i): AssistantStep => ({
        ...s,
        state: i < failIndex ? 'succeeded' : i === failIndex ? 'failed' : 'canceled',
        ...(i === failIndex && plan.steps[i]?.fail ? { detail: plan.steps[i]!.fail! } : {}),
        ...(i > failIndex ? { durationMs: 0 } : {}),
      }))
    : stepsOf(plan, 'succeeded').map((s, i, all) =>
        plan.proposal && i === all.length - 1 ? { ...s, state: 'waiting' as const } : s,
      );
  return {
    id,
    question,
    askedAt,
    topic: plan.topic,
    text: opts.failed ? '' : plan.answer,
    streaming: false,
    failed: Boolean(opts.failed),
    steps,
    sources: opts.failed ? [] : plan.sources,
    ...(plan.proposal && !opts.failed ? { proposal: { ...plan.proposal, status: 'waiting' } } : {}),
    ...(opts.feedback ? { feedback: opts.feedback } : {}),
    attempt: 1,
  };
}

/** 전체 화면 대화의 처음 목록: 제안 확인 대기(오늘) · 문서(오늘) · 실패한 재고 조회(어제) */
export const ASSISTANT_CONVERSATIONS: readonly AssistantConversation[] = [
  {
    id: 'cv-ledger',
    title: ledgerPlan().title,
    turns: [finished('t-ledger', ASSISTANT_QUESTIONS.ledger, `${TODAY} 13:40`, ledgerPlan())],
  },
  {
    id: 'cv-docs',
    title: reportPlan().title,
    turns: [
      finished('t-docs', ASSISTANT_QUESTIONS.docs, `${TODAY} 11:15`, reportPlan(), {
        feedback: 'good',
      }),
    ],
  },
  {
    id: 'cv-stock',
    title: stockPlan().title,
    turns: [
      finished('t-stock', ASSISTANT_QUESTIONS.stock, `${TODAY} 09:05`, stockPlan(), {
        failed: true,
      }),
    ],
  },
];

/** 문서함 옆 칸의 처음 대화 */
export const DOC_CONVERSATION: AssistantConversation = {
  id: 'cv-doc-aside',
  title: reportPlan().title,
  turns: [finished('t-doc-aside', ASSISTANT_QUESTIONS.docs, `${TODAY} 13:55`, reportPlan())],
};

/** 실행 상태 라벨(목록 보조 줄) */
export const runLabel = (s: AgentRunState) => AGENT_RUN_STATES[s].label;

/* ── 실행 흉내(단계 진행 · 글 이어 쓰기) ──────────────── */

/** 단계 하나가 도는 시간 · 글 한 번에 붙는 글자 수와 간격 */
const STEP_MS = 420;
const CHUNK = 7;
const TICK_MS = 32;

/**
 * 대화 목록과 실행. ask는 질문(own)과 쓰는 중 답을 더하고 단계 → 글 순서로 채운다.
 * regenerate는 같은 질문으로 다시(재고 조회처럼 처음에 실패한 것은 두 번째에 성공), resolve는 제안 처리.
 */
export function useAssistantRuns(initial: readonly AssistantConversation[], who = '') {
  const [conversations, setConversations] = useState<AssistantConversation[]>(() => [...initial]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const seq = useRef(0);
  useEffect(
    () => () => {
      for (const t of timers.current) clearTimeout(t);
    },
    [],
  );
  const later = (ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  };
  const patch = (convId: string, turnId: string, fn: (t: AssistantTurn) => AssistantTurn) =>
    setConversations((cs) =>
      cs.map((c) =>
        c.id !== convId ? c : { ...c, turns: c.turns.map((t) => (t.id === turnId ? fn(t) : t)) },
      ),
    );

  const run = (convId: string, turnId: string, plan: Plan, attempt: number) => {
    const failAt = plan.failFirst && attempt === 1 ? plan.steps.findIndex((s) => s.fail) : -1;
    plan.steps.forEach((step, i) => {
      // 실패한 단계 뒤는 돌지 않는다(중단)
      if (failAt >= 0 && i > failAt) return;
      later(i * STEP_MS, () =>
        patch(convId, turnId, (t) => ({
          ...t,
          steps: t.steps.map((s, j) => (j === i ? { ...s, state: 'running' } : s)),
        })),
      );
      later((i + 1) * STEP_MS, () =>
        patch(convId, turnId, (t) => {
          if (i === failAt)
            return {
              ...t,
              streaming: false,
              failed: true,
              steps: t.steps.map((s, j) =>
                j === i
                  ? {
                      ...s,
                      state: 'failed',
                      durationMs: step.durationMs,
                      ...(step.fail ? { detail: step.fail } : {}),
                    }
                  : j > i
                    ? { ...s, state: 'canceled' }
                    : s,
              ),
            };
          const last = i === plan.steps.length - 1;
          return {
            ...t,
            steps: t.steps.map((s, j) =>
              j === i
                ? {
                    ...s,
                    state: last && plan.proposal ? 'waiting' : 'succeeded',
                    durationMs: step.durationMs,
                  }
                : s,
            ),
          };
        }),
      );
    });
    if (failAt >= 0) return;
    const start = plan.steps.length * STEP_MS;
    const chunks = Math.ceil(plan.answer.length / CHUNK);
    for (let k = 1; k <= chunks; k += 1)
      later(start + k * TICK_MS, () =>
        patch(convId, turnId, (t) => ({ ...t, text: plan.answer.slice(0, k * CHUNK) })),
      );
    later(start + (chunks + 1) * TICK_MS, () =>
      patch(convId, turnId, (t) => ({
        ...t,
        text: plan.answer,
        streaming: false,
        sources: plan.sources,
        ...(plan.proposal ? { proposal: { ...plan.proposal, status: 'waiting' as const } } : {}),
      })),
    );
  };

  const fresh = (question: string, plan: Plan, attempt: number): AssistantTurn => {
    seq.current += 1;
    return {
      id: `t-${seq.current}-${attempt}`,
      question,
      askedAt: `${TODAY} ${NOW}`,
      topic: plan.topic,
      text: '',
      streaming: true,
      failed: false,
      steps: stepsOf(plan, 'queued'),
      sources: [],
      attempt,
    };
  };

  /** 질문. convId가 없으면 새 대화를 만든다. 만든(또는 쓴) 대화 id를 돌려준다 */
  const ask = (
    convId: string | null,
    question: string,
    command?: string,
    context: readonly DocFile[] = [],
  ): string => {
    const plan = planFor(question, command, context);
    const turn = fresh(question, plan, 1);
    const id = convId ?? `cv-new-${seq.current}`;
    setConversations((cs) => {
      const exists = cs.some((c) => c.id === id);
      if (!exists) return [{ id, title: plan.title, turns: [turn] }, ...cs];
      return cs.map((c) =>
        c.id !== id
          ? c
          : { ...c, title: c.turns.length ? c.title : plan.title, turns: [...c.turns, turn] },
      );
    });
    run(id, turn.id, plan, 1);
    return id;
  };

  /** 같은 질문으로 다시. 답을 바꿔 그린다(실패한 첫 실행은 두 번째에 성공) */
  const regenerate = (convId: string, turnId: string, context: readonly DocFile[] = []) => {
    const conv = conversations.find((c) => c.id === convId);
    const old = conv?.turns.find((t) => t.id === turnId);
    if (!old) return;
    const plan = planFor(old.question, undefined, context);
    const attempt = old.attempt + 1;
    patch(convId, turnId, () => ({
      ...fresh(old.question, plan, attempt),
      id: turnId,
      askedAt: old.askedAt,
    }));
    run(convId, turnId, plan, attempt);
  };

  /** 제안 처리. 실행 단계의 확인 대기를 완료 · 중단으로 바꾼다 */
  const resolve = (convId: string, turnId: string, status: ProposalStatus, reason?: string) =>
    patch(convId, turnId, (t) => ({
      ...t,
      steps: t.steps.map((s) =>
        s.state === 'waiting'
          ? { ...s, state: status === 'approved' ? 'succeeded' : 'canceled' }
          : s,
      ),
      ...(t.proposal
        ? {
            proposal: {
              ...t.proposal,
              status,
              ...(reason ? { reason } : {}),
              resolvedBy: `${who ? `${who} · ` : ''}${TODAY.slice(5)} ${NOW}`,
            },
          }
        : {}),
    }));

  const setFeedback = (convId: string, turnId: string, value: MessageThreadFeedback | null) =>
    patch(convId, turnId, (t) => {
      const next = { ...t };
      if (value) next.feedback = value;
      else delete next.feedback;
      return next;
    });

  const running = conversations.some((c) => c.turns.some((t) => t.streaming));
  const clear = (convId: string) =>
    setConversations((cs) => cs.map((c) => (c.id === convId ? { ...c, turns: [] } : c)));

  return { conversations, ask, regenerate, resolve, setFeedback, clear, running };
}
