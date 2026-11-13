// 토큰·타이포·아이콘 섹션(검토용 명세 페이지)
import { moduleTileManifest } from '@terracelab/trellis-icons/module-tiles';
import modules from '@terracelab/trellis-tokens/modules';
import { icons, SAMPLE_ICONS } from '../generated/icons';
import { card, cardHead, contrast, esc, flat, section, svg, tile, v, value } from '../lib';
import { TILED_MODULES, moduleIcon } from './home';

const HUES = ['brand', 'neutral', 'red', 'green', 'amber', 'violet', 'teal'];
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

function swatches(): string {
  const head = `<div class="tl-preview-swatch-row tl-preview-swatch-head"><span></span>${STEPS.map((s) => `<span class="tl-preview-meta">${s}</span>`).join('')}</div>`;
  const rows = HUES.map((hue) => {
    const chips = STEPS.map((step) => {
      const hex = value(`color-${hue}-${step}`, 'value');
      return `<div class="tl-preview-swatch"><span class="tl-preview-swatch-chip" style="background: ${v(`color-${hue}-${step}`)}"></span><span class="tl-preview-swatch-hex">${hex.slice(1)}</span></div>`;
    }).join('');
    return `<div class="tl-preview-swatch-row"><span class="tl-preview-swatch-name">${hue}</span>${chips}</div>`;
  }).join('');
  return card(
    'tl-preview-swatch-card',
    `${cardHead('Primitive 색', '7 hue × 11단계 · 500이 기준값')}<div class="tl-preview-scroll" tabindex="0" role="region" aria-label="색 스케일">${head}${rows}</div>`,
  );
}

function semanticTable(): string {
  const names = Object.keys(flat).filter(
    (k) => k.startsWith('--tl-color-') && flat[k]!.light !== undefined,
  );
  const sL = value('color-bg-surface', 'light');
  const sD = value('color-bg-surface', 'dark');
  const groups = new Map<string, string[]>();
  for (const key of names) {
    const group = key.split('-')[4]!;
    groups.set(group, [...(groups.get(group) ?? []), key]);
  }
  const body = [...groups]
    .map(([group, keys]) => {
      const rows = keys
        .map((key) => {
          const l = String(flat[key]!.light);
          const d = String(flat[key]!.dark);
          return `<tr>
  <td><span class="tl-preview-chip" style="background: var(${key})"></span></td>
  <td class="tl-preview-token">${esc(key.slice('--tl-color-'.length))}</td>
  <td class="tl-preview-hex">${l}</td><td class="tl-preview-num">${contrast(l, sL).toFixed(2)}</td>
  <td class="tl-preview-hex">${d}</td><td class="tl-preview-num">${contrast(d, sD).toFixed(2)}</td>
</tr>`;
        })
        .join('');
      return `<tbody><tr class="tl-preview-table-group"><th scope="rowgroup" colspan="6">${group}</th></tr>${rows}</tbody>`;
    })
    .join('');
  return card(
    'tl-preview-table-card',
    `${cardHead('Semantic 색', `${names.length}종 · 대비는 같은 모드의 bg.surface 위`)}
<div class="tl-preview-scroll" tabindex="0" role="region" aria-label="semantic 색 표">
<table class="tl-preview-table"><thead><tr><th scope="col"><span class="tl-preview-sr">색</span></th><th scope="col">토큰</th><th scope="col">Light</th><th scope="col" class="tl-preview-num">대비</th><th scope="col">Dark</th><th scope="col" class="tl-preview-num">대비</th></tr></thead>${body}</table></div>`,
  );
}

function shapes(): string {
  const space = Object.keys(flat)
    .filter((k) => k.startsWith('--tl-space-'))
    .map((k) => {
      const n = k.slice('--tl-space-'.length);
      return `<div class="tl-preview-space-row"><span class="tl-preview-token">space.${n}</span><span class="tl-preview-space-bar" style="width: var(${k})"></span><span class="tl-preview-meta">${value(`space-${n}`, 'value')}</span></div>`;
    })
    .join('');
  const radius = ['xs', 'sm', 'md', 'lg', 'xl', 'full']
    .map(
      (r) =>
        `<div class="tl-preview-radius" style="border-radius: ${v(`radius-${r}`)}"><span>${r}</span><span class="tl-preview-meta">${value(`radius-${r}`, 'value')}</span></div>`,
    )
    .join('');
  const shadow = ['sm', 'md', 'lg']
    .map(
      (s) =>
        `<div class="tl-preview-shadow" style="box-shadow: ${v(`shadow-${s}`)}"><strong>shadow.${s}</strong><span class="tl-preview-meta">${{ sm: '카드', md: '드롭다운', lg: '모달' }[s]}</span></div>`,
    )
    .join('');
  return `<div class="tl-preview-grid-2">
${card('', `${cardHead('간격', '4px 그리드')}<div class="tl-preview-space">${space}</div>`)}
${card('', `${cardHead('radius · 그림자', '다크는 그림자 대신 border.strong')}<div class="tl-preview-row">${radius}</div><div class="tl-preview-shadow-row">${shadow}</div>`)}
</div>`;
}

export function tokensSection(): string {
  return section(
    'tokens',
    '토큰',
    'primitive 색, semantic 색 61종, 간격·radius·그림자. 값은 가안이고 G2에서 확정한다',
    swatches() + semanticTable() + shapes(),
  );
}

const TYPE: [string, string, string][] = [
  ['display', 'KPI 큰 숫자, 홈 인사말', '874,479,500원'],
  ['h1', '화면 제목', '11월 6일 금요일'],
  ['h2', '섹션 제목', '이번 달 자금 현황'],
  ['h3', '카드 제목', '결재 대기'],
  [
    'body',
    '본문',
    '한빛상사의 11월 매입 세금계산서 12건이 도착했습니다. 공급가액 합계는 12,480,000원입니다.',
  ],
  ['label', '폼 라벨·탭', '거래처명'],
  ['caption', '보조 설명', '3분 전 · 회계팀 박서연'],
  ['amount', '금액', '1,250,000원'],
  ['amountLg', 'KPI 금액', '128,450,000원'],
];

function typeStyle(name: string): string {
  const k = name.replace(/([A-Z])/g, '-$1').toLowerCase();
  return ['font-size', 'line-height', 'font-weight', 'letter-spacing']
    .map((p) => `${p}: ${v(`type-${k}-${p}`)}`)
    .join('; ');
}

export function typographySection(): string {
  const rows = TYPE.map(([name, use, sample]) => {
    const k = name.replace(/([A-Z])/g, '-$1').toLowerCase();
    const spec = `${value(`type-${k}-font-size`, 'value').replace('px', '')}/${value(`type-${k}-line-height`, 'value').replace('px', '')} · ${value(`type-${k}-font-weight`, 'value')}`;
    const amount = name.startsWith('amount') || name === 'display';
    return `<div class="tl-preview-type-row">
  <div class="tl-preview-type-meta"><span class="tl-preview-token">${name}</span><span class="tl-preview-meta">${esc(spec)}</span><span class="tl-preview-meta">${use}</span></div>
  <div class="tl-preview-type-sample${amount ? ' tl-preview-amount' : ''}" style="${typeStyle(name)}">${sample}</div>
</div>`;
  }).join('');
  const amounts = [1_250_000, 980_500, 11_111_111, 704_320, 45_000_000];
  const col = (cls: string, title: string) =>
    `<div class="tl-preview-tabular-col ${cls}"><span class="tl-preview-meta">${title}</span>${amounts.map((a) => `<span>${a.toLocaleString('ko-KR')}</span>`).join('')}</div>`;
  return section(
    'typography',
    '타이포그래피',
    'Pretendard Variable 9스타일. 숫자는 항상 tabular-nums, 금액은 우측 정렬',
    `${card('', rows)}
${card('', `${cardHead('tabular-nums', '같은 자릿수가 같은 폭')}<div class="tl-preview-tabular">${col('tl-preview-proportional', '비례 숫자 (쓰지 않음)')}${col('', 'tabular-nums (기본)')}</div>`)}`,
  );
}

export function iconsSection(): string {
  const samples = SAMPLE_ICONS.map(
    (name) => `<div class="tl-preview-icon-cell">
  <div class="tl-preview-icon-sizes">${[16, 20, 24].map((s) => `<span style="width: ${v(`size-icon-${s}`)}; height: ${v(`size-icon-${s}`)}">${svg(icons[name]!)}</span>`).join('')}</div>
  <span class="tl-preview-token">${name}</span></div>`,
  ).join('');
  const sheet = Object.entries(modules.groups)
    .map(
      ([gid, g]) =>
        `<div class="tl-preview-sheet-row"><span class="tl-preview-sheet-label">${g.label}</span><div class="tl-preview-sheet-icons">${modules.modules
          .filter((m) => m.group === gid)
          .map(
            (m) =>
              `<span class="tl-preview-sheet-icon" title="${m.label}">${moduleIcon(m.id, 32)}<span class="tl-preview-meta">${m.label}</span></span>`,
          )
          .join('')}</div></div>`,
    )
    .join('');
  const tileSize = `calc(${v('size-module-icon-32')} * 2)`;
  const tiles = moduleTileManifest.tiles
    .map(
      (t) =>
        `<div class="tl-preview-tile-cell">${tile(t.id, tileSize)}<span class="tl-preview-tile-label">${t.label}</span><span class="tl-preview-meta">${t.module ? t.id : '미배정'}</span></div>`,
    )
    .join('');
  const missing = moduleTileManifest.modulesWithoutTile
    .map((id) => modules.modules.find((m) => m.id === id)!.label)
    .join(' · ');
  const sizes = (['accounting', 'approval', 'my-docs', 'customers'] as const)
    .map((id) => ([32, 40, 48] as const).map((s) => moduleIcon(id, s)).join(''))
    .join('');
  return section(
    'icons',
    '아이콘',
    `Lucide 라인 아이콘 16·20·24, stroke 1.5. 모듈 앱 아이콘은 일러스트 타일 ${TILED_MODULES}종(모듈 ${modules.modules.length}종 전부). 생성형 폴백(모듈 색 세로 그라데이션 위 흰 라인, radius 22%)은 타일 없는 새 모듈에만 쓴다`,
    `${card('', `${cardHead('Lucide', '샘플 12종 × 3크기')}<div class="tl-preview-icon-grid">${samples}</div>`)}
${card('', `${cardHead('모듈 타일 일러스트', `${moduleTileManifest.tiles.length}종 · 64 · packages/icons/src/module-tiles`)}<div class="tl-preview-tile-grid">${tiles}</div><p class="tl-preview-meta tl-preview-tile-missing">${moduleTileManifest.modulesWithoutTile.length ? `타일 없는 모듈 ${moduleTileManifest.modulesWithoutTile.length}: ${missing}` : '타일 없는 모듈 0 · 미배정 1(지출결의)'}</p>`)}
${card('', `${cardHead('모듈 앱 아이콘', '20종 · 32')}<div class="tl-preview-sheet">${sheet}</div>${cardHead('크기', '32 · 40 · 48')}<div class="tl-preview-row">${sizes}</div>`)}`,
  );
}
