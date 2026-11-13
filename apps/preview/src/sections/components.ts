// P0 컴포넌트 경량 갤러리. 코드 패키지 구현이 아니라 치수·토큰 확인용(tl-preview-* 클래스)이다.
import { APPROVALS, APPROVAL_LABEL, type ApprovalKey, won } from '../data';
import { card, cardHead, count, section } from '../lib';
import { approvalBadge, moduleIcon } from './home';

export const STATES = [
  'default',
  'hover',
  'active',
  'focus',
  'disabled',
  'loading',
  'error',
] as const;
type State = (typeof STATES)[number];
const STATE_KO: Record<State, string> = {
  default: '기본',
  hover: 'hover',
  active: 'active',
  focus: 'focus',
  disabled: '비활성',
  loading: '로딩',
  error: '오류',
};

const spinner = `<svg class="tl-preview-spinner" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="42 100" stroke-linecap="round"></circle></svg>`;

function button(variant: string, state: State, label = '저장', size = 'md'): string {
  const pending =
    variant === 'primary' && ['default', 'focus', 'loading', 'error'].includes(state) ? '' : '';
  const attrs = [
    `class="tl-preview-button"`,
    `data-variant="${variant}"`,
    `data-size="${size}"`,
    state !== 'default' ? `data-force-state="${state}"` : '',
    state === 'disabled' || state === 'loading' ? 'disabled' : '',
    state === 'loading' ? 'aria-busy="true"' : '',
    state === 'error' ? 'aria-invalid="true"' : '',
  ].filter(Boolean);
  return `<button type="button" ${attrs.join(' ')}${pending}>${state === 'loading' ? spinner : ''}<span>${label}</span></button>`;
}

function buttons(): string {
  const variants: [string, string][] = [
    ['primary', '주요'],
    ['secondary', '보조'],
    ['ghost', '고스트'],
    ['danger', '위험'],
  ];
  const head = `<tr><th scope="col">variant</th>${STATES.map((s) => `<th scope="col">${STATE_KO[s]}</th>`).join('')}</tr>`;
  const rows = variants
    .map(
      ([vName, ko]) =>
        `<tr><th scope="row">${vName} <span class="tl-preview-meta">${ko}</span></th>${STATES.map((s) => `<td>${button(vName, s)}</td>`).join('')}</tr>`,
    )
    .join('');
  const sizes = ['sm', 'md', 'lg']
    .map((s) => button('primary', 'default', `크기 ${s}`, s))
    .join('');
  return card(
    '',
    `${cardHead('Button', 'variant 4 × 상태 7')}
<div class="tl-preview-scroll" tabindex="0" role="region" aria-label="버튼 상태 표"><table class="tl-preview-matrix"><thead>${head}</thead><tbody>${rows}</tbody></table></div>
<div class="tl-preview-row">${sizes}</div>`,
  );
}

function badges(): string {
  const status: [string, string][] = [
    ['info', '안내'],
    ['success', '완료'],
    ['warning', '주의'],
    ['danger', '오류'],
  ];
  const statusHtml = status
    .map(([k, ko]) => {
      return `<span class="tl-preview-badge" data-kind="status" data-tone="${k}">${ko}</span>`;
    })
    .join('');
  const approvals = (Object.keys(APPROVAL_LABEL) as ApprovalKey[]).map(approvalBadge).join('');
  const field = (label: string, body: string) =>
    `<div class="tl-preview-badge-field"><span class="tl-preview-meta">${label}</span><div class="tl-preview-row">${body}</div></div>`;
  return card(
    '',
    `${cardHead('Badge', '상태 4 · 결재 5 · 카운트')}
<div class="tl-preview-badge-fields">
  ${field('상태', statusHtml)}
  ${field('결재 5상태', approvals)}
  ${field('카운트 · 지연', `${count(3)}${count(12)}${count(128)}${count(3, 'danger')}`)}
</div>`,
  );
}

function inputs(): string {
  const cells = STATES.map((s) => {
    const id = `tl-preview-input-${s}`;
    const attrs = [
      s !== 'default' ? `data-force-state="${s}"` : '',
      s === 'disabled' ? 'disabled' : '',
      s === 'error' ? `aria-invalid="true" aria-describedby="${id}-msg"` : '',
      s === 'loading' ? 'aria-busy="true"' : '',
    ]
      .filter(Boolean)
      .join(' ');
    const val = s === 'active' || s === 'error' ? ' value="한빛상사"' : '';
    return `<div class="tl-preview-field">
  <label class="tl-preview-label" for="${id}">거래처명 <span class="tl-preview-meta">${STATE_KO[s]}</span></label>
  <div class="tl-preview-input-wrap"><input class="tl-preview-input" id="${id}" type="text" placeholder="거래처 검색"${val} ${attrs} />${s === 'loading' ? spinner : ''}</div>
  ${s === 'error' ? `<p class="tl-preview-error" id="${id}-msg">사업자등록번호가 확인되지 않았습니다</p>` : ''}
</div>`;
  }).join('');
  return card(
    '',
    `${cardHead('Input', '상태 7')}<div class="tl-preview-field-grid">${cells}</div>`,
  );
}

function cards(): string {
  const a = APPROVALS[2]!;
  const demoCard = `<article class="tl-preview-card tl-preview-demo-card">
  <div class="tl-preview-card-head"><h4 class="tl-preview-card-title">${a.title}</h4>${approvalBadge(a.state)}</div>
  <p class="tl-preview-body-text">영업팀 12건 · 합계 <span class="tl-preview-money">${won(a.amount!)}<span class="tl-preview-unit">원</span></span></p>
  <span class="tl-preview-meta">기안 2026-11-05 · 결재선 3단계 중 2단계</span>
</article>`;
  const notices = [
    [
      'approval',
      '구매 요청서 결재 요청',
      '사무용품 · 김도윤 대리 · 3분 전',
      approvalBadge('pending'),
    ],
    ['mail', '새 메일 12통', '한빛상사 세금계산서 외 · 10분 전', count(12)],
    ['accounting', '전표 승인 완료', '11월 매입 전표 24건 · 1시간 전', approvalBadge('approved')],
  ]
    .map(
      ([
        id,
        title,
        line,
        side,
      ]) => `<article class="tl-preview-card tl-preview-notice">${moduleIcon(id!, 40)}
  <div class="tl-preview-notice-body"><strong class="tl-preview-notice-title">${title}</strong><span class="tl-preview-notice-line">${line}</span></div>${side}</article>`,
    )
    .join('');
  return `<div class="tl-preview-grid-2">
${card('', `${cardHead('Card', '캔버스 위')}<div class="tl-preview-well">${demoCard}</div>`)}
${card('', `${cardHead('NotificationCard', '아이콘 40 · 제목 · 한 줄 · 배지')}<div class="tl-preview-well tl-preview-stack">${notices}</div>`)}
</div>`;
}

function tabs(): string {
  const labels = ['전체', '결재 대기', '진행 중', '완료', '반려', '보관', '임시'];
  const items = STATES.map(
    (s, i) =>
      `<button type="button" role="tab" class="tl-preview-tab" aria-selected="${i === 0}" ${s !== 'default' ? `data-force-state="${s}"` : ''} ${s === 'disabled' ? 'disabled' : ''} ${s === 'loading' ? 'aria-busy="true"' : ''} ${s === 'error' ? 'data-error="true"' : ''}>${labels[i]}${s === 'loading' ? spinner : ''}${i === 1 ? `<span class="tl-preview-nav-count">8</span>` : ''}</button>`,
  ).join('');
  return card(
    '',
    `${cardHead('Tabs', '탭마다 다른 상태')}
<div class="tl-preview-scroll" tabindex="0" role="region" aria-label="탭 예시"><div class="tl-preview-tabs" role="tablist" aria-label="결재 문서함">${items}</div></div>`,
  );
}

const CLIENTS = [
  '한빛상사',
  '다온물산',
  '새봄유통',
  '누리식품',
  '가람테크',
  '온새미로',
  '바른회계',
  '하늘물류',
  '미르전자',
  '소담푸드',
];
const MEMOS = [
  '11월 매입',
  '운반비',
  '사무용품',
  '식자재 납품',
  '유지보수',
  '광고비',
  '임대료',
  '용역비',
  '소모품',
  '접대비',
];
const KEYS = Object.keys(APPROVAL_LABEL) as ApprovalKey[];

function dataGrid(): string {
  const rows = Array.from({ length: 20 }, (_, i) => {
    const income = i % 3 === 0;
    const amount = (((i * 7919) % 90) + 10) * 13_700;
    return `<tr>
  <td class="tl-preview-num">2026-11-${String(20 - i).padStart(2, '0')}</td>
  <td>${CLIENTS[i % 10]}</td><td>${MEMOS[(i * 3) % 10]}</td>
  <td class="tl-preview-num tl-preview-income">${income ? won(amount) : ''}</td>
  <td class="tl-preview-num tl-preview-expense">${income ? '' : won(amount)}</td>
  <td>${approvalBadge(KEYS[i % 5]!)}</td>
</tr>`;
  }).join('');
  return card(
    '',
    `${cardHead('DataGrid', '정적 20행 · 수입 빨강 · 지출 파랑 · 금액 우측 정렬')}
<div class="tl-preview-scroll tl-preview-grid-scroll" tabindex="0" role="region" aria-label="거래 내역 표">
<table class="tl-preview-grid"><thead><tr><th scope="col">일자</th><th scope="col">거래처</th><th scope="col">적요</th><th scope="col" class="tl-preview-num">수입 (원)</th><th scope="col" class="tl-preview-num">지출 (원)</th><th scope="col">결재</th></tr></thead>
<tbody>${rows}</tbody></table></div>`,
  );
}

export function componentsSection(): string {
  return section(
    'components',
    '컴포넌트',
    'Button · Badge · Input · Card · NotificationCard · Tabs · DataGrid. 치수와 토큰 확인용 마크업이며 실제 구현은 Phase 1에서 한다. hover·active·focus는 강제 표시',
    buttons() + badges() + inputs() + cards() + tabs() + dataGrid(),
  );
}
