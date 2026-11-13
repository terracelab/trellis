// 업무 홈: 실제 비율의 테라스원 홈 창(첫 화면의 순간), 모듈 격자판, 모바일 홈.
// 레퍼런스 제품의 자산은 쓰지 않는다. 구조만 참고한다(D-34). 모든 숫자는 data.ts 하나에서 온다.
import modules from '@terracelab/trellis-tokens/modules';
import {
  APPROVALS,
  APPROVAL_LABEL,
  APPROVAL_PENDING,
  ATTENDANCE,
  CASH,
  EVENTS,
  NOTICES,
  PHONE_TILES,
  TODAY,
  UNREAD,
  USER,
  signed,
  won,
  type ApprovalKey,
} from '../data';
import { moduleTileByModule } from '@terracelab/trellis-icons/module-tiles';
import { icons } from '../generated/icons';
import { avatar, card, cardHead, count, money, section, svg, tile, v } from '../lib';

type Group = keyof typeof modules.groups;
const GROUPS = Object.keys(modules.groups) as Group[];
const byGroup = (g: Group) => modules.modules.filter((m) => m.group === g);
const mod = (id: string) => modules.modules.find((m) => m.id === id)!;

export function approvalBadge(key: ApprovalKey): string {
  return `<span class="tl-preview-badge" data-kind="approval" data-tone="${key}"><span class="tl-preview-dot"></span>${APPROVAL_LABEL[key]}</span>`;
}

/** 모듈 앱 아이콘: 일러스트 타일이 있으면 그것, 없으면 생성형 폴백(모듈 색 그라데이션 + 흰 라인). D-36 */
export function moduleIcon(id: string, size: 32 | 40 | 48 = 40): string {
  const m = mod(id);
  const dim = v(`size-module-icon-${size}`);
  const tileId = moduleTileByModule[id];
  if (tileId) return tile(tileId, dim);
  return `<span class="tl-preview-module-icon" data-fallback style="width: ${dim}; height: ${dim}; background: linear-gradient(${v(`color-module-${m.group}-gradient-from`)}, ${v(`color-module-${m.group}-gradient-to`)})">${svg(icons[m.icon]!, 'tl-preview-module-glyph')}</span>`;
}

export const TILED_MODULES = modules.modules.filter((m) => moduleTileByModule[m.id]).length;

const primaryButton = (label: string, icon?: string) =>
  `<button type="button" class="tl-preview-button" data-variant="primary" data-size="md">${icon ? svg(icons[icon]!) : ''}<span>${label}</span></button>`;
const secondaryButton = (label: string) =>
  `<button type="button" class="tl-preview-button" data-variant="secondary" data-size="md"><span>${label}</span></button>`;

/* ── 조각: 홈 창과 밀도 비교가 같이 쓴다 ───────────────────── */

export function statCards(): string {
  const stat = (label: string, value: string, compare: string) =>
    `<article class="tl-preview-card tl-preview-stat"><span class="tl-preview-stat-label">${label}</span><strong class="tl-preview-stat-value">${value}</strong><span class="tl-preview-stat-compare">${compare}</span></article>`;
  return `<div class="tl-preview-stats">
  ${stat('당일 시재', money(CASH.today), `<span class="tl-preview-income">${signed(CASH.delta)}원</span> vs 전일`)}
  ${stat('결재 대기', `${APPROVAL_PENDING.total}<span class="tl-preview-unit">건</span>`, `<span class="tl-preview-danger">${APPROVAL_PENDING.overdue}건</span>이 ${APPROVAL_PENDING.overdueDays}일 경과`)}
  ${stat('미확인 알림', `${UNREAD.total}<span class="tl-preview-unit">건</span>`, `메일 ${UNREAD.mail}통 포함`)}
</div>`;
}

/** 부드러운 선(Catmull-Rom → 베지어) */
function smoothPath(points: [number, number][]): string {
  if (points.length < 2) return '';
  let d = `M${points[0]![0]},${points[0]![1]}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(i - 1, 0)]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[Math.min(i + 2, points.length - 1)]!;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1.map((n) => n.toFixed(1)).join(',')} ${c2.map((n) => n.toFixed(1)).join(',')} ${p2[0]},${p2[1]}`;
  }
  return d;
}

export function cashChart(): string {
  const W = 800;
  const H = 260;
  const left = 56;
  const right = 16;
  const top = 16;
  const bottom = 36;
  const ticks = [780_000_000, 830_000_000, 880_000_000];
  const [min, max] = [ticks[0]!, ticks.at(-1)!];
  const n = CASH.series.length;
  const x = (i: number) => left + ((W - left - right) * i) / (n - 1);
  const y = (val: number) => top + (H - top - bottom) * (1 - (val - min) / (max - min));
  const pts = CASH.series.map(
    (val, i) => [Math.round(x(i) * 10) / 10, Math.round(y(val) * 10) / 10] as [number, number],
  );
  const line = smoothPath(pts);
  const area = `${line} L${pts.at(-1)![0]},${H - bottom} L${pts[0]![0]},${H - bottom} Z`;
  const grid = ticks
    .map(
      (
        t,
      ) => `<line class="tl-preview-chart-grid" x1="${left}" x2="${W - right}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}"></line>
<text class="tl-preview-chart-label" x="${left - 8}" y="${(y(t) + 4).toFixed(1)}" text-anchor="end">${(t / 100_000_000).toFixed(1)}억</text>`,
    )
    .join('');
  const xLabels = [
    [0, '10/9'],
    [7, '10/16'],
    [14, '10/23'],
    [21, '10/30'],
    [29, '11/7'],
  ] as const;
  const xs = xLabels
    .map(
      ([i, label]) =>
        `<text class="tl-preview-chart-label" x="${x(i).toFixed(1)}" y="${H - 12}" text-anchor="${i === 0 ? 'start' : i === 29 ? 'end' : 'middle'}">${label}</text>`,
    )
    .join('');
  const [ex, ey] = pts.at(-1)!;
  return card(
    'tl-preview-chart-card',
    `${cardHead('시재 추이', '최근 30일', `<span class="tl-preview-card-figure">${money(CASH.today)}</span>`)}
<svg class="tl-preview-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="최근 30일 시재 추이. ${won(CASH.series[0]!)}원에서 ${won(CASH.today)}원으로">
  ${grid}
  <path class="tl-preview-chart-area" d="${area}"></path>
  <path class="tl-preview-chart-line" d="${line}"></path>
  <circle class="tl-preview-chart-end" cx="${ex}" cy="${ey}" r="4"></circle>
  ${xs}
</svg>`,
  );
}

export function approvalList(limit = APPROVALS.length): string {
  const rows = APPROVALS.slice(0, limit)
    .map(
      (a) => `<li class="tl-preview-item">
  <div class="tl-preview-item-main"><span class="tl-preview-item-title">${a.title}</span><span class="tl-preview-item-sub">${a.who}${a.days > 0 ? ` · ${a.days}일 전` : ' · 오늘'}</span></div>
  ${a.amount ? `<span class="tl-preview-item-amount">${won(a.amount)}</span>` : '<span class="tl-preview-item-amount"></span>'}
  ${approvalBadge(a.state)}
</li>`,
    )
    .join('');
  return card(
    'tl-preview-list-card',
    `${cardHead('결재 대기', `${APPROVAL_PENDING.total}건`, `<a class="tl-preview-link" href="#components">전체${svg(icons['chevron-right']!)}</a>`)}
<ul class="tl-preview-rows">${rows}</ul>`,
  );
}

export function noticeCards(limit = NOTICES.length): string {
  return `<div class="tl-preview-notices">${NOTICES.slice(0, limit)
    .map(
      (n) => `<article class="tl-preview-card tl-preview-notice">${moduleIcon(n.module, 40)}
  <div class="tl-preview-notice-body"><strong class="tl-preview-notice-title">${n.title}</strong><span class="tl-preview-notice-line">${n.line}</span></div>
  ${n.count ? count(n.count, n.overdue ? 'danger' : 'neutral') : ''}
</article>`,
    )
    .join('')}</div>`;
}

export function attendanceCard(): string {
  const total = ATTENDANCE.reduce((s, a) => s + a.count, 0);
  const max = Math.max(...ATTENDANCE.map((a) => a.count));
  const rows = ATTENDANCE.map(
    (a) => `<li class="tl-preview-bar-row" data-tone="${a.tone}">
  <span class="tl-preview-bar-label">${a.label}</span>
  <span class="tl-preview-bar-track"><span class="tl-preview-bar-fill" style="width: ${Math.round((a.count / max) * 100)}%"></span></span>
  <span class="tl-preview-bar-value">${a.count}<span class="tl-preview-unit">명</span></span>
</li>`,
  ).join('');
  return card(
    '',
    `${cardHead('이번 주 근태', `${USER.team} ${total}명`)}<ul class="tl-preview-bars">${rows}</ul>`,
  );
}

export function eventsCard(): string {
  const rows = EVENTS.map(
    ([t, title, where]) =>
      `<li class="tl-preview-event"><span class="tl-preview-event-time">${t}</span><span class="tl-preview-event-main"><strong>${title}</strong><span>${where}</span></span></li>`,
  ).join('');
  return card(
    '',
    `${cardHead('오늘 일정', `${EVENTS.length}건`)}<ul class="tl-preview-events">${rows}</ul>`,
  );
}

/* ── 홈 창 ────────────────────────────────────────────────── */

const SIDE_COUNTS: Record<string, number> = {
  mail: UNREAD.mail,
  approval: APPROVAL_PENDING.total,
  purchasing: 4,
  sales: 2,
  messenger: 3,
  board: 8,
  support: 5,
};
/** 지연이 있는 모듈만 danger 카운트(D-35) */
const SIDE_OVERDUE = new Set(['approval']);
const FAVORITES = ['approval', 'mail', 'treasury', 'attendance'];
const COLLAPSED: Group[] = ['ecm', 'crm'];
const WORKDAY = { clockIn: '09:02', worked: '7h 12m', ratio: 0.9 };

/**
 * 사이드바(240): 프로필 → 빠른 실행 3 → 홈 → 즐겨찾기(타일 20) → 모듈 그룹 4(접힘 가능) → 공지 → 푸터(근무시간·설정·접기).
 * 크롬은 여전히 조용하다: 색은 타일 4개와 danger 카운트 하나뿐이다.
 */
function sidebar(): string {
  const row = (m: (typeof modules.modules)[number]) => {
    const n = SIDE_COUNTS[m.id];
    const danger = n !== undefined && SIDE_OVERDUE.has(m.id);
    return `<a class="tl-preview-nav" href="#home"><span class="tl-preview-nav-icon">${svg(icons[m.icon]!)}</span><span class="tl-preview-nav-label">${m.label}</span>${
      n
        ? `<span class="tl-preview-nav-count"${danger ? ' data-tone="danger"' : ''}>${n}</span>`
        : ''
    }</a>`;
  };
  const groups = GROUPS.map((g) => {
    const open = !COLLAPSED.includes(g);
    const items = byGroup(g);
    const pending = items.reduce((sum, m) => sum + (SIDE_COUNTS[m.id] ?? 0), 0);
    return `<div class="tl-preview-nav-group" data-open="${open}">
  <button type="button" class="tl-preview-nav-group-head" aria-expanded="${open}" aria-controls="side-group-${g}"><span class="tl-preview-nav-group-dot" style="background: ${v(`color-module-${g}-default`)}"></span><span class="tl-preview-nav-group-label">${modules.groups[g].label}</span><span class="tl-preview-nav-group-meta">${open ? `${items.length}` : `${items.length} · 대기 ${pending}`}</span>${svg(icons['chevron-down']!, 'tl-preview-icon tl-preview-nav-chevron')}</button>
  <div class="tl-preview-nav-group-body" id="side-group-${g}"${open ? '' : ' hidden'}>${items.map(row).join('')}</div>
</div>`;
  }).join('');
  const favorites = FAVORITES.map((id) => {
    const m = mod(id);
    const n = SIDE_COUNTS[id];
    return `<a class="tl-preview-fav" href="#home"><span class="tl-preview-fav-tile">${moduleIcon(id, 32)}</span><span class="tl-preview-fav-label">${m.label}</span>${n ? `<span class="tl-preview-fav-count"${SIDE_OVERDUE.has(id) ? ' data-tone="danger"' : ''}>${n}</span>` : ''}</a>`;
  }).join('');
  const quick = (icon: string, label: string) =>
    `<button type="button" class="tl-preview-quick">${svg(icons[icon]!)}<span>${label}</span></button>`;
  return `<nav class="tl-preview-win-side" aria-label="모듈">
  <div class="tl-preview-side-profile">
    ${avatar(USER.initials, 40)}
    <div class="tl-preview-side-who"><strong>${USER.name} ${USER.title}</strong><span class="tl-preview-side-status"><span class="tl-preview-side-dot"></span>근무 중 · ${WORKDAY.clockIn} 출근</span></div>
    ${svg(icons['chevron-down']!, 'tl-preview-icon tl-preview-side-profile-chevron')}
  </div>
  <div class="tl-preview-side-quick" role="group" aria-label="빠른 실행">${quick('file-plus', '새 기안')}${quick('send', '메일 쓰기')}${quick('calendar-plus', '일정 추가')}</div>
  <div class="tl-preview-nav-group"><a class="tl-preview-nav" href="#home" aria-current="page"><span class="tl-preview-nav-icon">${svg(icons['house']!)}</span><span class="tl-preview-nav-label">홈</span></a></div>
  <div class="tl-preview-nav-group tl-preview-side-favs">
    <div class="tl-preview-nav-group-head" aria-hidden="true">${svg(icons['star']!, 'tl-preview-icon tl-preview-nav-star')}<span class="tl-preview-nav-group-label">즐겨찾기</span></div>
    <div class="tl-preview-fav-grid">${favorites}</div>
  </div>
  ${groups}
  <a class="tl-preview-side-notice" href="#home">${svg(icons['megaphone']!)}<span class="tl-preview-side-notice-body"><strong>11월 급여 명세서 발행</strong><span>인사·급여 · 오늘 09:00</span></span>${svg(icons['chevron-right']!)}</a>
  <footer class="tl-preview-side-foot">
    <div class="tl-preview-side-work" role="img" aria-label="오늘 근무 ${WORKDAY.worked}, 기준 8시간의 ${Math.round(WORKDAY.ratio * 100)}%">
      <span class="tl-preview-side-work-label">${svg(icons['clock']!)}오늘 근무 <strong>${WORKDAY.worked}</strong><span class="tl-preview-meta">/ 8h</span></span>
      <span class="tl-preview-side-work-track"><span class="tl-preview-side-work-fill" style="width: ${Math.round(WORKDAY.ratio * 100)}%"></span></span>
    </div>
    <div class="tl-preview-side-tools">
      <button type="button" class="tl-preview-side-tool" aria-label="설정">${svg(icons['settings']!)}</button>
      <button type="button" class="tl-preview-side-tool" aria-label="도움말">${svg(icons['circle-help']!)}</button>
      <button type="button" class="tl-preview-side-tool tl-preview-side-collapse" aria-label="사이드바 접기">${svg(icons['panel-left-close']!)}</button>
    </div>
  </footer>
</nav>`;
}

function tabbar(): string {
  const tabs: [string, string, boolean][] = [
    ['house', '홈', true],
    ['mail', '메일', false],
    ['pen-line', '결재', false],
    ['calendar', '일정', false],
    ['layout-grid', '전체', false],
  ];
  return `<nav class="tl-preview-tabbar" aria-label="하단 탭">${tabs
    .map(
      ([icon, label, on]) =>
        `<span class="tl-preview-tabbar-item"${on ? ' aria-current="page"' : ''}>${svg(icons[icon]!)}${label}</span>`,
    )
    .join('')}</nav>`;
}

export function homeWindow(): string {
  return `<div class="tl-preview-win" role="group" aria-label="테라스원 업무 홈">
  <div class="tl-preview-win-bar">
    <span class="tl-preview-win-brand">테라스원</span>
    <div class="tl-preview-win-search" role="search" aria-label="통합검색">${svg(icons['search']!)}<span>통합검색</span></div>
    <div class="tl-preview-win-bar-side">
      <span class="tl-preview-win-bell" aria-label="알림 ${UNREAD.total}건">${svg(icons['bell']!)}${count(UNREAD.total)}</span>
      ${avatar(USER.initials, 32)}
    </div>
  </div>
  <div class="tl-preview-win-body">
    ${sidebar()}
    <div class="tl-preview-win-main">
      <header class="tl-preview-win-title">
        <div class="tl-preview-win-heading"><h3 class="tl-preview-win-h1">${TODAY.title}</h3><span class="tl-preview-meta">${USER.team} · ${USER.name} ${USER.title}</span></div>
        <div class="tl-preview-win-actions">${secondaryButton('일정 추가')}${primaryButton('새 기안', 'plus')}</div>
      </header>
      ${statCards()}
      <div class="tl-preview-win-grid">${cashChart()}${approvalList()}</div>
      ${noticeCards()}
      <div class="tl-preview-win-grid-2" data-mount="home-sales"></div>
      <div class="tl-preview-win-grid-2">${attendanceCard()}${eventsCard()}</div>
    </div>
  </div>
  ${tabbar()}
</div>`;
}

/* ── 모듈 격자판 ──────────────────────────────────────────── */

export function moduleLattice(): string {
  const cols = GROUPS.map(
    (g) => `<div class="tl-preview-lattice-col">
  <div class="tl-preview-lattice-head"><strong>${modules.groups[g].label}</strong><span class="tl-preview-meta">${byGroup(g).length}개</span></div>
  ${byGroup(g)
    .map(
      (m) =>
        `<div class="tl-preview-lattice-cell">${moduleIcon(m.id, 48)}<span>${m.label}</span></div>`,
    )
    .join('')}
</div>`,
  ).join('');
  return card(
    'tl-preview-lattice-card',
    `${cardHead('모듈 20종', `ERP 6 · 그룹웨어 6 · ECM 4 · CRM 4 · 일러스트 ${TILED_MODULES} · 폴백 ${modules.modules.length - TILED_MODULES}`)}
<div class="tl-preview-lattice" role="img" aria-label="모듈 20종을 네 묶음으로 놓은 격자판">${cols}</div>`,
  );
}

/* ── 모바일 홈 ────────────────────────────────────────────── */

export function phoneHome(): string {
  const tiles = PHONE_TILES.map(
    ([id, n]) =>
      `<div class="tl-preview-phone-tile">${moduleIcon(id, 32)}<span class="tl-preview-phone-tile-label">${mod(id).label}</span><strong class="tl-preview-phone-tile-value">${n}</strong></div>`,
  ).join('');
  const rows = APPROVALS.slice(0, 3)
    .map(
      (a) => `<li class="tl-preview-item">
  <div class="tl-preview-item-main"><span class="tl-preview-item-title">${a.title}</span><span class="tl-preview-item-sub">${a.who}</span></div>
  ${approvalBadge(a.state)}
</li>`,
    )
    .join('');
  return card(
    'tl-preview-phone-panel',
    `${cardHead('모바일 홈', '390')}
<div class="tl-preview-phone" role="group" aria-label="모바일 홈">
  <div class="tl-preview-phone-screen">
    <div class="tl-preview-phone-top">
      <div><strong class="tl-preview-phone-title">${TODAY.title}</strong><span class="tl-preview-meta">${USER.name} ${USER.title}</span></div>
      <span class="tl-preview-win-bell" aria-label="알림 ${UNREAD.total}건">${svg(icons['bell']!)}${count(UNREAD.total)}</span>
    </div>
    <div class="tl-preview-phone-body">
      <div class="tl-preview-phone-tiles">${tiles}</div>
      <section class="tl-preview-card tl-preview-list-card">
        ${cardHead('결재 대기', `${APPROVAL_PENDING.total}건`)}
        <ul class="tl-preview-rows">${rows}</ul>
      </section>
    </div>
    ${tabbar()}
  </div>
</div>`,
  );
}

export function homeSection(): string {
  return section(
    'home',
    '업무 홈',
    '테라스원 홈을 Trellis 토큰과 modules.json만으로 그린 mock. 실제 템플릿은 Phase 2에서 만든다',
    `${homeWindow()}
<div class="tl-preview-home-row">${moduleLattice()}${phoneHome()}</div>`,
  );
}
