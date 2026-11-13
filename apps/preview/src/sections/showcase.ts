// 쇼케이스 판 5개(PG-04, D-111): 히어로(모듈 지도) · 기기 콜라주 · 알림 카드 월 · 회사 색 · 업무 영역.
// 앞 세 판의 구성은 2026-11-07 Figma 쇼케이스 그대로이고, 안의 화면은 지금 컴포넌트로 다시 조립한다.
// 화면 조각은 자리(data-sc)만 두고 showcase-screens.tsx의 mountShowcase가 React로 붙인다.
// apps/one이 heroPanel · collagePanel · cardsPanel을 문구 옵션과 함께 가져다 쓴다(D-45).
import figmaVariables from '@terracelab/trellis-tokens/figma';
import modules from '@terracelab/trellis-tokens/modules';
import { FACTS } from '../generated/facts';
import { icons } from '../generated/icons';
import { svg } from '../lib';
import { GROUP_FONT, LABEL_FONT, layoutMolecule, type Molecule } from '../molecule';
import { moduleIcon } from './home';

/* ── 1. 히어로 · 모듈 지도 ─────────────────────────────────── */
let cached: Molecule | null = null;
/** 묶음 7개 · 모듈 35개의 지도 좌표(scripts/export-showcase.mjs와 같은 계산) */
export function molecule(): Molecule {
  cached ??= layoutMolecule(modules);
  return cached;
}

export function moleculeMap(): string {
  const m = molecule();
  const byId = new Map(m.nodes.map((n) => [n.id, n]));
  const groups = Object.keys(modules.groups);
  const parts = m.rings.map((ring) => {
    const lines = m.edges
      .filter((e) => e.group === ring.group && e.kind === 'branch')
      .map((e) => {
        const a = byId.get(e.from)!;
        const b = byId.get(e.to)!;
        return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke-width="1.5"></line>`;
      })
      .join('');
    const inner = ring.inner
      .map(
        (l) =>
          `<line x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}" stroke-width="1.5"></line>`,
      )
      .join('');
    const labels = m.labels
      .filter((l) => l.group === ring.group)
      .map(
        (l) =>
          `<text x="${l.x}" y="${l.y}" text-anchor="${l.anchor}" dominant-baseline="${l.baseline}" font-size="${LABEL_FONT}" font-weight="500">${l.text}</text>`,
      )
      .join('');
    const poly = ring.vertices.map((v) => `${v.x},${v.y}`).join(' ');
    return `<g class="tl-preview-molecule-suite" style="color: var(--tl-color-module-${ring.group}-default)">
  <polygon points="${poly}" stroke-width="2.25"></polygon>${inner}${lines}${labels}
  <text class="tl-preview-molecule-name" x="${ring.center.x}" y="${ring.center.y}" text-anchor="middle" dominant-baseline="middle" font-size="${GROUP_FONT}" font-weight="700">${ring.label}</text>
</g>`;
  });
  const { x, y, width, height } = m.viewBox;
  const names = groups.map((g) => modules.groups[g as keyof typeof modules.groups].label);
  return `<svg class="tl-preview-molecule" viewBox="${x} ${y} ${width} ${height}" role="img" aria-label="모듈 지도. ${names.join(' · ')} ${groups.length}묶음과 모듈 ${modules.modules.length}개가 육각 고리로 이어진 그림">${parts.join('')}</svg>`;
}

const hexPattern = () => {
  const r = 34;
  const w = Math.sqrt(3) * r;
  const h = 3 * r;
  const hex = (cx: number, cy: number) =>
    [
      [cx, cy - r],
      [cx + w / 2, cy - r / 2],
      [cx + w / 2, cy + r / 2],
      [cx, cy + r],
      [cx - w / 2, cy + r / 2],
      [cx - w / 2, cy - r / 2],
    ]
      .map(([px, py]) => `${px!.toFixed(2)},${py!.toFixed(2)}`)
      .join(' ');
  return `<svg class="tl-preview-hero-bg" aria-hidden="true" focusable="false">
  <defs><pattern id="tl-preview-hexes" width="${w.toFixed(2)}" height="${h}" patternUnits="userSpaceOnUse">
    <polygon points="${hex(w / 2, r)}"></polygon><polygon points="${hex(0, 2.5 * r)}"></polygon><polygon points="${hex(w, 2.5 * r)}"></polygon>
  </pattern></defs>
  <rect width="100%" height="100%" fill="url(#tl-preview-hexes)"></rect>
</svg>`;
};

/** 문단 안 가운뎃점은 앞 낱말에 붙여 줄 머리에 오지 않게 한다 */
const nb = (html: string) => html.replace(/ · /g, '&nbsp;· ');

/** 문단의 숫자. 컴포넌트 · 화면 블록은 빌드 때 저장소에서 센다(scripts/gen-facts.mjs) */
export const SHOWCASE_FACTS = {
  components: FACTS.components,
  blocks: FACTS.blocks,
  modules: modules.modules.length,
  groups: Object.keys(modules.groups).length,
};
const counts = `컴포넌트 ${SHOWCASE_FACTS.components}종 · 화면 블록 ${SHOWCASE_FACTS.blocks}개 · 모듈 ${SHOWCASE_FACTS.modules}개가 같은 토큰을 씁니다.`;
const recolor = '회사 색 하나를 넣으면 사이드바 · 주 버튼 · 선택 표시가 그 색으로 바뀝니다.';

/** 히어로 제목 안 두 개(사람 확인 대기). 강조 구절은 한 군데, 색은 color.brand.default 하나 */
export const HERO_HEADLINES = {
  company: {
    title:
      '<span class="tl-preview-hero-accent">회사 색 하나</span>로<br>업무 화면 전체를<br>맞춥니다',
    lead: `Trellis는 테라스랩의 디자인 시스템입니다. ${counts} ${recolor}`,
    link: { href: '#showcase-company', label: '회사 색 8가지 보기' },
  },
  system: {
    title:
      '<span class="tl-preview-hero-accent">Trellis</span>는<br>테라스랩의<br>디자인 시스템입니다',
    lead: `${counts} ${recolor}`,
    link: { href: '#tokens', label: '토큰 규격 보기' },
  },
} as const;
export type HeroHeadline = keyof typeof HERO_HEADLINES;

/** 쇼케이스 패널 문구. 기본값은 미리보기 문구이고, 사이트(apps/one · apps/docs)는 자기 문구를 넘긴다(D-45) */
export interface HeroCopy {
  /** 제목 안. 기본 system(안 2, Patrick 선택 2026-11-10). title · lead · link를 넘기면 그것이 이긴다 */
  headline?: HeroHeadline;
  /** HTML. 강조 구절은 <span class="tl-preview-hero-accent"> */
  title?: string;
  lead?: string;
  link?: { href: string; label: string };
  headingId?: string;
  level?: 'h1' | 'h2';
}

export function heroPanel(copy: HeroCopy = {}): string {
  const preset = HERO_HEADLINES[copy.headline ?? 'system'];
  const {
    title = preset.title,
    lead = preset.lead,
    link = preset.link,
    headingId = 'showcase-h',
    level = 'h2',
  } = copy;
  return `<div class="tl-preview-hero">
  ${hexPattern()}
  <div class="tl-preview-hero-copy">
    <${level} class="tl-preview-hero-title" id="${headingId}">${title}</${level}>
    <p class="tl-preview-hero-lead">${nb(lead)}</p>
    <a class="tl-preview-hero-link" href="${link.href}">${link.label} ${svg(icons['chevron-right']!)}</a>
  </div>
  <div class="tl-preview-hero-figure">${moleculeMap()}</div>
</div>`;
}

/* ── 기기 틀: 고정 비율로 자르는 창 ───────────────────────── */
/** desktop 1440×900 · laptop 1024×768 · phone 390×844 · piece = 카드 한 장(폭 고정, 아래를 자른다) */
export type DeviceKind = 'desktop' | 'laptop' | 'phone' | 'piece';
export interface DeviceOptions {
  /** 판 안 위치 이름(CSS가 자리를 잡는다) */
  slot?: string;
  /** 회사 색 프리셋 자리(SC-04) */
  company?: string;
  /** 아래 작은 설명 */
  caption?: string;
}
/** 그림 속 화면은 누르지 않는다(inert). 화면 읽기 프로그램은 틀의 이름 하나만 읽는다 */
export function device(sc: string, kind: DeviceKind, label: string, o: DeviceOptions = {}): string {
  const attrs = [
    `class="tl-sc-device"`,
    `data-device="${kind}"`,
    o.slot ? `data-slot="${o.slot}"` : '',
    o.company ? `data-company="${o.company}"` : '',
  ]
    .filter(Boolean)
    .join(' ');
  const frame = `<div class="tl-sc-frame" role="img" aria-label="${label}"><div class="tl-sc-viewport" aria-hidden="true" inert><div class="tl-sc-screen" data-sc="${sc}"></div></div></div>`;
  return o.caption
    ? `<figure ${attrs}>${frame}<figcaption class="tl-sc-caption">${o.caption}</figcaption></figure>`
    : `<div ${attrs}>${frame}</div>`;
}

/* ── 2. 기기 콜라주 ───────────────────────────────────────── */
export interface CollageCopy {
  wordmark?: string;
  badge?: string;
  /** HTML */
  title?: string;
  lead?: string;
}

export function collagePanel(copy: CollageCopy = {}): string {
  const {
    wordmark = 'Trellis',
    badge = '0.1 · 미리보기',
    title = '어느 기기에서도<br>같은 화면',
    lead = '1440 · 1024 · 390 화면이 같은 컴포넌트를 씁니다. 다크 테마와 밀도 3단계도 같은 토큰에서 나옵니다.',
  } = copy;
  return `<div class="tl-sc-collage" aria-label="여러 기기의 화면">
  ${device('payslip', 'piece', '임금명세서 한 귀퉁이. 2026년 10월분', { slot: 'payslip' })}
  ${device('role-home', 'desktop', '1440 역할별 홈. 인사 담당 보기', { slot: 'role-home' })}
  ${device('calendar', 'piece', '11월 일정 달력', { slot: 'calendar' })}
  ${device('people', 'laptop', '1024 인사 기록. 구성원 14명', { slot: 'people' })}
  ${device('launcher', 'phone', '다크 테마 모듈 런처', { slot: 'launcher' })}
  ${device('phone-home', 'phone', '390 휴대폰 홈. 출퇴근 카드', { slot: 'phone-home' })}
  ${device('approval', 'piece', '결재선. 기안 · 검토 · 승인', { slot: 'approval' })}
  <div class="tl-sc-collage__copy">
    <span class="tl-preview-wordmark">${wordmark} <small>${badge}</small></span>
    <h3 class="tl-preview-collage-title">${title}</h3>
    <p class="tl-preview-collage-lead">${nb(lead)}</p>
  </div>
</div>`;
}

/* ── 3. 알림 카드 월 ───────────────────────────────────────── */
export interface WallCopy {
  /** HTML */
  title?: string;
  /** HTML */
  lead?: string;
}

const wallSlot = (slot: string, sc: string) =>
  `<div class="tl-preview-wall-slot" data-slot="${slot}"><div class="tl-sc-screen" data-sc="${sc}"></div></div>`;

export function cardsPanel(copy: WallCopy = {}): string {
  const {
    title = '상태가 먼저<br>보이는 업무 홈',
    lead = '카운트 배지와 결재 단계는 모든 모듈에서 같은 모양입니다. 수입은 빨강 · 지출은 파랑입니다. 알림 카드 하나에는 <strong>모듈 타일 · 상태 한 줄 · 숫자 하나</strong>만 둡니다.',
  } = copy;
  return `<div class="tl-preview-wall">
  <div class="tl-preview-wall-copy">
    <h3 class="tl-preview-wall-title">${title}</h3>
    <p class="tl-preview-wall-lead">${nb(lead)}</p>
  </div>
  ${wallSlot('a', 'notice-a')}
  ${wallSlot('b', 'notice-b')}
  ${wallSlot('c', 'notice-c')}
  ${wallSlot('d', 'notice-d')}
  ${wallSlot('e', 'attendance')}
  ${wallSlot('f', 'cash')}
  ${wallSlot('g', 'notice-g')}
  ${wallSlot('h', 'notice-h')}
  ${wallSlot('i', 'notice-i')}
  ${wallSlot('j', 'notice-j')}
</div>`;
}

/* ── 4. 회사 색 ───────────────────────────────────────────── */
interface FigmaCollection {
  name: string;
  modes: string[];
  variables: { name: string; values: Record<string, unknown> }[];
}
const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/**
 * 회사 색 프리셋 = Figma Company 컬렉션의 모드(FIGMA_COMPANY_PRESETS). 값은 테마 엔진이 계산해
 * variables.json에 넣은 것을 그대로 읽는다. Figma 회사 색 판이 같은 모드를 바꿔 끼운다(D-111)
 */
export function companyPresets(): { id: string; label: string; light: string; dark: string }[] {
  const company = (figmaVariables.collections as unknown as FigmaCollection[]).find(
    (c) => c.name === 'Company',
  );
  if (!company) throw new Error('variables.json에 Company 컬렉션이 없다');
  const block = (engine: string, mode: string) =>
    company.variables
      .filter((v) => v.name.startsWith(`${engine}/`))
      .map(
        (v) =>
          `--tl-${kebab(v.name.slice(engine.length + 1)).replace(/\//g, '-')}: ${String(v.values[mode])};`,
      )
      .join(' ');
  return company.modes.map((label, i) => ({
    id: `c${i}`,
    label,
    light: block('light', label),
    dark: block('dark', label),
  }));
}

export interface CompanyCopy {
  title?: string;
  lead?: string;
}

export function companyPanel(copy: CompanyCopy = {}): string {
  const presets = companyPresets();
  const {
    title = `회사 색 ${presets.length}가지`,
    lead = `인사 기록 화면 한 장을 회사 색 프리셋 ${presets.length}개로 놓았습니다. 사이드바 · 주 버튼 · 선택 표시는 회사 색 하나에서 계산됩니다. 상태 색과 수입 · 지출 색은 바뀌지 않습니다.`,
  } = copy;
  const css = presets
    .map(
      (p) =>
        `[data-company="${p.id}"] { ${p.light} }\n[data-theme="dark"] [data-company="${p.id}"] { ${p.dark} }`,
    )
    .join('\n');
  const frames = presets
    .map((p, i) =>
      device('people', 'laptop', `회사 색 ${p.label}로 본 인사 기록`, {
        slot: `k${i}`,
        company: p.id,
        caption: `<i class="tl-sc-swatch"></i>${p.label}`,
      }),
    )
    .join('');
  return `<div class="tl-sc-company" id="showcase-company">
  <style>${css}</style>
  <div class="tl-sc-panel-copy">
    <h3 class="tl-preview-wall-title">${title}</h3>
    <p class="tl-preview-wall-lead">${nb(lead)}</p>
  </div>
  <div class="tl-sc-company__deck">${frames}</div>
</div>`;
}

/* ── 5. 업무 영역 ─────────────────────────────────────────── */
export interface AreaScreen {
  sc: string;
  kind: DeviceKind;
  label: string;
}
export interface AreaSpec {
  id: string;
  /** 대표 모듈(타일). 모듈이 없는 영역(에이전트 대화)은 비우고 icon을 준다 */
  module?: string;
  /** 모듈이 없을 때 타일 자리에 그리는 아이콘(src/generated/icons.ts에 있는 이름) */
  icon?: string;
  /** 화면 블록 수를 셀 모듈들 */
  modules: readonly string[];
  /** 모듈로 셀 수 없는 화면 블록(블록 id). 저장소에 있는 것만 센다 */
  blocks?: readonly string[];
  title: string;
  /** 첫 문장 앞부분. 뒤에 "화면 블록 N개입니다."가 붙는다 */
  scope: string;
  line: string;
  /** 앞 = 큰 화면, 뒤 = 겹쳐 놓는 작은 조각 */
  screens: readonly [AreaScreen, AreaScreen];
}

/** 업무 영역 판의 줄. 에이전트 대화는 모듈이 아니라 플랫폼 기능이라 타일 대신 아이콘을 쓰고 블록 id로 센다 */
export const AREAS: readonly AreaSpec[] = [
  {
    id: 'hr',
    module: 'hr-payroll',
    modules: ['hr-payroll', 'attendance'],
    title: '인사',
    scope: '인사 기록부터 임금명세서까지',
    line: '임금명세서에는 항목마다 계산 방법을 적습니다.',
    screens: [
      { sc: 'people', kind: 'laptop', label: '1024 인사 기록' },
      { sc: 'payslip', kind: 'piece', label: '임금명세서 2026년 10월분' },
    ],
  },
  {
    id: 'accounting',
    module: 'accounting',
    modules: ['accounting', 'treasury', 'tax'],
    title: '회계',
    scope: '전표 · 자금 일보 · 세금계산서',
    line: '전표는 합계 줄에서 대차 일치를 확인합니다.',
    screens: [
      { sc: 'journal', kind: 'laptop', label: '1024 전표 입력' },
      { sc: 'cash', kind: 'piece', label: '자금 일보 카드' },
    ],
  },
  {
    id: 'inventory',
    module: 'inventory',
    modules: ['inventory', 'warehouse'],
    title: '재고',
    scope: '재고 현황 · 로트 · 입고 검수',
    line: '안전재고 미만과 유통기한 30일 안 품목을 먼저 보입니다.',
    screens: [
      { sc: 'stock', kind: 'laptop', label: '1024 재고 현황' },
      { sc: 'notice-i', kind: 'piece', label: '안전재고 미달 알림 카드' },
    ],
  },
  {
    id: 'messenger',
    module: 'messenger',
    modules: ['messenger'],
    title: '메신저',
    scope: '채널 · 1:1 대화',
    line: '대화 안에서 발주서 같은 업무 문서를 바로 엽니다.',
    screens: [
      { sc: 'chat', kind: 'laptop', label: '1024 메신저' },
      { sc: 'chat-phone', kind: 'phone', label: '390 메신저 대화' },
    ],
  },
  {
    id: 'agent',
    icon: 'bot',
    modules: [],
    blocks: ['platform/assistant/chat', 'ecm/my-docs/ask'],
    title: '에이전트 대화',
    scope: '업무 도우미 · 문서 질의응답',
    line: '답에는 실행 단계와 출처가 붙습니다. 데이터를 바꾸는 답은 승인해야 적용됩니다.',
    screens: [
      { sc: 'agent', kind: 'laptop', label: '1024 업무 도우미' },
      { sc: 'proposal', kind: 'piece', label: '발주 수량 변경 제안 카드' },
    ],
  },
];

/** 모듈 타일이 없는 영역의 타일: 회사 색 바탕 + 흰 아이콘(모듈 타일과 같은 모서리 · 크기) */
function areaTile(a: AreaSpec, size: 48): string {
  if (a.module) return moduleIcon(a.module, size);
  const node = a.icon ? icons[a.icon] : undefined;
  if (!node) throw new Error(`업무 영역 ${a.id}: module도 icon도 없다`);
  return `<span class="tl-preview-module-icon" data-area-icon style="width: var(--tl-size-module-icon-${size}); height: var(--tl-size-module-icon-${size})">${svg(node, 'tl-preview-module-glyph')}</span>`;
}

export interface AreasCopy {
  title?: string;
  lead?: string;
}

export function areasPanel(copy: AreasCopy = {}, areas: readonly AreaSpec[] = AREAS): string {
  const {
    title = '업무 영역별 대표 화면',
    lead = `업무 영역 ${areas.length}곳의 대표 화면을 한 줄에 하나씩 놓았습니다. 화면 블록 수는 빌드 때 저장소에서 셉니다.`,
  } = copy;
  const ids = new Set(FACTS.blockIds);
  const rows = areas
    .map((a, i) => {
      const blocks =
        a.modules.reduce((s, m) => s + (FACTS.blocksByModule[m] ?? 0), 0) +
        (a.blocks ?? []).filter((id) => ids.has(id)).length;
      const [main, side] = a.screens;
      return `<section class="tl-sc-area" data-area="${a.id}" data-flip="${i % 2 === 1}" aria-labelledby="area-${a.id}">
  <div class="tl-sc-area__copy">
    ${areaTile(a, 48)}
    <h4 class="tl-sc-area__title" id="area-${a.id}">${a.title}</h4>
    <p class="tl-sc-area__line">${nb(`${a.scope} 화면 블록 ${blocks}개입니다. ${a.line}`)}</p>
  </div>
  <div class="tl-sc-area__stage">
    ${device(main.sc, main.kind, main.label, { slot: 'main' })}
    ${device(side.sc, side.kind, side.label, { slot: 'side' })}
  </div>
</section>`;
    })
    .join('');
  return `<div class="tl-sc-areas">
  <div class="tl-sc-panel-copy">
    <h3 class="tl-preview-wall-title">${title}</h3>
    <p class="tl-preview-wall-lead">${nb(lead)}</p>
  </div>
  ${rows}
</div>`;
}

export function showcaseSection(): string {
  return `
<section class="tl-preview-page tl-preview-showcase" id="showcase" aria-labelledby="showcase-h">
  ${heroPanel()}
  ${collagePanel()}
  ${cardsPanel()}
  ${companyPanel()}
  ${areasPanel()}
</section>`;
}
