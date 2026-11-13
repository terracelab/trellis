// ===== Trellis screen kit v2 (Trellis · Screens, PG-03) =====
// 쓰는 법: 이 파일을 root shared plugin data('trellis','kit')에 한 번 저장하고,
// 호출마다 SKILL.md 6절의 실행기로 batch 함수만 보낸다.
// 변수 · 스타일은 Foundations 라이브러리, 세트 · 아이콘 · 타일은 Components 라이브러리에서 key로 가져온다.
// key 목록은 파일 문서에 있다: 'keys'(Foundations, 3절) · 'components'(Components, 6절).
// 라이브러리에서 가져오지 못한 세트(게시 전)는 '컴포넌트 사본' 페이지의 같은 이름 세트를 쓰고 KIT_WARN에 적는다.
figma.skipInvisibleInstanceChildren = false; // 숨긴 인스턴스 안쪽 노드도 찾는다
const _K = JSON.parse(figma.root.getSharedPluginData('trellis', 'keys') || 'null');
const _CK = JSON.parse(figma.root.getSharedPluginData('trellis', 'components') || 'null');
if (!_K || !_CK) throw new Error('key 목록 없음: figma-sync 3절 "key 목록 넣기"와 6절 "Components key 목록"을 먼저 돌린다');
const KIT_WARN = [];
await Promise.all([['Pretendard', 'Regular'], ['Pretendard', 'Medium'], ['Pretendard', 'SemiBold'], ['Pretendard', 'Bold'], ['Roboto Mono', 'Regular'], ['Inter', 'Regular']].map(([family, style]) => figma.loadFontAsync({ family, style })));
const _VE = Object.entries(_K.variables);
const _VV = await Promise.all(_VE.map(([, k]) => figma.variables.importVariableByKeyAsync(k)));
const _BYID = new Map(_VV.map((v) => [v.id, v])), VM = new Map();
_VE.forEach(([n], i) => { if (!n.startsWith('Company/')) VM.set(n.slice(n.indexOf('/') + 1), _VV[i]); });
const V = (n) => { const v = VM.get(n); if (!v) throw new Error('var ' + n); return v; };
const _SE = await figma.variables.getVariableCollectionByIdAsync(V('color/bg/canvas').variableCollectionId);
const _CO = await figma.variables.getVariableCollectionByIdAsync(_VV[_VE.findIndex(([n]) => n.startsWith('Company/'))].variableCollectionId);
const TS = Object.fromEntries(await Promise.all(Object.entries(_K.textStyles).map(async ([n, k]) => [n, await figma.importStyleByKeyAsync(k)])));
const ES = Object.fromEntries(await Promise.all(Object.entries(_K.effectStyles).map(async ([n, k]) => [n, await figma.importStyleByKeyAsync(k)])));
const WN = { 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold' };
const STW = { display: 600, h1: 600, h2: 600, h3: 600, h4: 600, body: 400, label: 500, caption: 400, micro: 400, mono: 400, amount: 600, amountLg: 600 };
const RAD = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];
const sv = (x) => V(typeof x === 'string' && x.includes('/') ? x : 'space/' + x);
// 칠의 색 = 변수가 그 노드에서 풀리는 색(node가 없으면 기본 모드). 검정으로 저장된 덮어쓰기 칠을 막는다
const _RES = (v) => { let x = v; for (let g = 0; x && g < 8; g++) { const val = Object.values(x.valuesByMode)[0]; if (val && val.type === 'VARIABLE_ALIAS') x = _BYID.get(val.id); else return val; } return null; };
const P = (c, op, node) => { const v = V('color/' + c); let r = null; try { r = node ? v.resolveForConsumer(node).value : _RES(v); } catch (e) { r = _RES(v); }
  const p = figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: r && 'r' in r ? { r: r.r, g: r.g, b: r.b } : { r: 0, g: 0, b: 0 } }, 'color', v);
  return op == null ? p : Object.assign({}, p, { opacity: op }); };
// 알파가 있는 변수에 새로 묶으면 불투명도가 변수 알파로 바뀐다 → 지정한 불투명도를 한 번 더 쓴다
function setPaints(n, k, list) { n[k] = list; if (list.some((p) => p.opacity != null && p.opacity !== 1)) n[k] = n[k].map((p, i) => Object.assign({}, p, { opacity: list[i].opacity == null ? p.opacity : list[i].opacity })); }
function st(n, o) {
  if (o.f !== undefined) setPaints(n, 'fills', o.f ? (Array.isArray(o.f) ? o.f.map((x) => (typeof x === 'string' ? P(x, null, n) : x)) : [P(o.f, null, n)]) : []);
  if (o.s !== undefined) { setPaints(n, 'strokes', o.s ? [P(o.s, null, n)] : []); if (o.s) { n.setBoundVariable('strokeWeight', V('border/width/' + (o.sw || 1))); n.strokeAlign = o.sa || 'INSIDE'; } }
  if (o.r) for (const k of RAD) n.setBoundVariable(k, V('radius/' + o.r));
  if (o.w != null) { if (typeof o.w === 'string') n.setBoundVariable('width', V(o.w)); else n.resize(o.w, n.height); }
  if (o.h != null) { if (typeof o.h === 'string') n.setBoundVariable('height', V(o.h)); else n.resize(n.width, o.h); }
  if (o.e) n.effectStyleId = ES[o.e].id; if (o.n) n.name = o.n; if (o.vis === false) n.visible = false; return n;
}
function add(p, k) { if (!k) return; const [n, o] = Array.isArray(k) ? k : [k, {}]; p.appendChild(n);
  if (o.abs) { n.layoutPositioning = 'ABSOLUTE'; n.x = o.abs[0]; n.y = o.abs[1]; }
  if (o.fx) n.layoutSizingHorizontal = o.fx; if (o.fy) n.layoutSizingVertical = o.fy; if (o.grow) n.layoutGrow = 1; return n; }
function AL(dir, o = {}, kids = []) {
  const f = figma.createFrame(); const V2 = dir === 'V';
  f.layoutMode = V2 ? 'VERTICAL' : 'HORIZONTAL'; f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO'; f.fills = []; f.clipsContent = !!o.clip;
  if (o.g != null) f.setBoundVariable('itemSpacing', sv(o.g));
  if (o.p != null) { const a = Array.isArray(o.p) ? (o.p.length === 2 ? [o.p[0], o.p[1], o.p[0], o.p[1]] : o.p) : [o.p, o.p, o.p, o.p];
    [['paddingTop', a[0]], ['paddingRight', a[1]], ['paddingBottom', a[2]], ['paddingLeft', a[3]]].forEach(([k, x]) => { if (x != null && x !== 0) f.setBoundVariable(k, sv(x)); }); }
  f.counterAxisAlignItems = o.ai || 'CENTER'; if (o.jc) f.primaryAxisAlignItems = o.jc;
  if (o.w != null) { if (V2) f.counterAxisSizingMode = 'FIXED'; else f.primaryAxisSizingMode = 'FIXED'; }
  if (o.h != null) { if (V2) f.primaryAxisSizingMode = 'FIXED'; else f.counterAxisSizingMode = 'FIXED'; }
  if (o.wrap) { f.layoutWrap = 'WRAP'; f.setBoundVariable('counterAxisSpacing', sv(o.wrap)); }
  st(f, o); for (const k of kids) add(f, k); return f;
}
const DB = { fs: 'density/body/fontSize', lh: 'density/body/lineHeight' };
function TX(chars, o = {}) { const t = figma.createText(); const s = o.s || 'body', w = o.w || STW[s];
  if (w === STW[s] && !o.fs && !o.lh) t.textStyleId = TS[s].id;
  else { t.fontName = { family: 'Pretendard', style: WN[w] }; t.setBoundVariable('fontSize', V(o.fs || 'type/' + s + '/fontSize')); t.setBoundVariable('lineHeight', V(o.lh || 'type/' + s + '/lineHeight')); t.setBoundVariable('fontWeight', V('font/weight/' + w)); }
  t.characters = chars; t.fills = [P(o.c || 'fg/primary', null, t)]; if (o.n) t.name = o.n; if (o.al) t.textAlignHorizontal = o.al;
  if (o.wd) { t.resize(o.wd, t.height); t.textAutoResize = 'HEIGHT'; } return t; }
const B1 = (t, o = {}) => TX(t, { s: 'body', ...DB, ...o });
// 아이콘 · 타일: Components 라이브러리의 icon/<name> · tile/<id>를 한꺼번에 가져온다(병렬). ICONS[name] = 컴포넌트 id
const ICONS = {}, TILES = {}, _IC = {};
await Promise.all(Object.entries(_CK.components).filter(([n]) => n.startsWith('icon/') || n.startsWith('tile/')).map(async ([n, k]) => { const c = await figma.importComponentByKeyAsync(k); _IC[c.id] = c; if (n.startsWith('icon/')) ICONS[n.slice(5)] = c.id; else TILES[n.slice(5)] = c.id; }));
async function IC(name, size = 16, color = 'fg/primary', n) { const id = ICONS[name]; if (!id) throw new Error('icon ' + name);
  const i = _IC[id].createInstance(); if (size !== 24) i.rescale(size / 24);
  for (const v of i.findAll((x) => 'strokes' in x && x.strokes.length)) v.strokes = [P(color, null, v)]; i.name = n || 'icon'; return i; }
// 아이콘을 바꿔 끼운 뒤(INSTANCE_SWAP · swapComponent) 선 색은 새 본체 색으로 돌아간다 → 바꾼 뒤 다시 칠한다
function ICCOLOR(i, color) { for (const v of i.findAll((x) => 'strokes' in x && x.strokes.length)) v.strokes = [P(color, null, v)]; }
function rect(o = {}) { const r = figma.createRectangle(); r.resize(o.wn || 8, o.hn || 8); st(r, o); return r; }
const dot = (col, sz = 'space/6') => { const d = figma.createEllipse(); d.resize(6, 6); d.fills = [P(col, null, d)]; d.setBoundVariable('width', V(sz)); d.setBoundVariable('height', V(sz)); return d; };
const side = (f, which, col = 'border/divider', w = '1') => { f.strokes = [P(col, null, f)]; for (const k of ['Top', 'Right', 'Bottom', 'Left']) { if (k === which) f.setBoundVariable('stroke' + k + 'Weight', V('border/width/' + w)); else f['stroke' + k + 'Weight'] = 0; } };
const spacer = () => { const s0 = figma.createFrame(); s0.name = 'spacer'; s0.fills = []; s0.resize(1, 1); return s0; };
// 세트: 키트 이름 → Components 세트 이름. Phone은 낱개 컴포넌트
const SETS = { Button: 'Button', IconButton: 'IconButton', Badge: 'Badge', Avatar: 'Avatar', ModuleIcon: 'ModuleIcon', Checkbox: 'Checkbox', Input: 'Input', Select: 'Select', Tabs: 'Tabs', PersonLabel: 'PersonLabel', NotificationCard: 'NotificationCard', SelectableCard: 'SelectableCard', ApprovalLine: 'ApprovalLine', SideNav: 'SideNav / Item', AppShell: 'AppShell', Phone: 'AppShell / Phone', TimeClock: 'TimeClock', LeaveBalance: 'LeaveBalance', WorkHoursMeter: 'WorkHoursMeter', Payslip: 'Payslip', OrgChart: 'OrgChart', HrRecord: 'HrRecord', ProfileHeader: 'ProfileHeader' };
const S = {};
const _copyPage = figma.root.children.find((p) => p.name === '컴포넌트 사본');
await Promise.all(Object.entries(SETS).map(async ([k, name]) => {
  try { S[k] = _CK.sets[name] ? await figma.importComponentSetByKeyAsync(_CK.sets[name]) : await figma.importComponentByKeyAsync(_CK.components[name]); }
  catch (e) { if (_copyPage) { await _copyPage.loadAsync(); S[k] = _copyPage.children.find((n) => n.name === name && (n.type === 'COMPONENT_SET' || n.type === 'COMPONENT')) || null; } if (S[k]) KIT_WARN.push(name + ': 라이브러리에 없음, 지역 사본 사용'); else KIT_WARN.push(name + ': 라이브러리에도 사본에도 없음'); }
}));
const pkey = (set, pre) => Object.keys(set.componentPropertyDefinitions).find((k) => k.startsWith(pre + '#'));
// 변형 이름이 없으면 축 값이 가장 많이 맞는 변형을 고른다(라이브러리에서 값 하나짜리 축이 빠진 경우)
const _pv = (name) => Object.fromEntries(name.split(', ').map((kv) => kv.split('=')));
const VARIANT = (s, vn) => { let v = s.children.find((c) => c.name === vn); if (v) return v; const want = _pv(vn); let best = null, sc = -1e9; for (const c of s.children) { const have = _pv(c.name); let x = 0; for (const [a, b] of Object.entries(have)) if (a in want) x += want[a] === b ? 2 : -1; if (x > sc) { sc = x; best = c; } } if (best) KIT_WARN.push(s.name + ': ' + vn + ' → ' + best.name); return best; };
let NI = 0; const inst = (k, vn) => { const s = S[k]; if (!s) throw new Error('set ' + k); const v = s.type === 'COMPONENT_SET' ? VARIANT(s, vn) : s; if (!v) throw new Error('variant ' + k + ' ' + vn); NI++; return v.createInstance(); };
const txt = (node, layer, t) => { const n = node.findOne((x) => x.type === 'TEXT' && x.name === layer); if (n) n.characters = t; else KIT_WARN.push('글자 레이어 없음: ' + layer + ' in ' + node.name); return n; };
const REPL = (node, pairs) => { const ts = node.findAll((x) => x.type === 'TEXT'); const used = new Set(); for (const [a, b] of pairs) { const t = ts.find((x) => !used.has(x.id) && x.characters === a); if (t) { t.characters = b; used.add(t.id); } } };
const HIDE = (node, names) => { for (const nm of names) for (const n of node.findAll((x) => x.name === nm)) n.visible = false; };
const BT = (v, label, o = {}) => { const i = inst('Button', `variant=${v}, size=${o.size || 'md'}, state=${o.state || 'default'}`); const pr = { [pkey(S.Button, 'label')]: label }; if (o.icon) { pr[pkey(S.Button, 'icon')] = true; pr[pkey(S.Button, 'icon name')] = ICONS[o.icon]; } if (o.iconEnd) { pr[pkey(S.Button, 'iconEnd')] = true; pr[pkey(S.Button, 'iconEnd name')] = ICONS[o.iconEnd]; } i.setProperties(pr); return i; };
const IB = (icon, o = {}) => { const i = inst('IconButton', `variant=${o.v || 'ghost'}, size=${o.size || 'md'}, countTone=${o.tone || 'danger'}, state=default`); const pr = { [pkey(S.IconButton, 'icon')]: ICONS[icon], [pkey(S.IconButton, 'count')]: !!o.count }; if (o.count) pr[pkey(S.IconButton, 'count label')] = String(o.count); i.setProperties(pr); return i; };
const BD = (label, o = {}) => { const i = inst('Badge', `tone=${o.tone || 'neutral'}, approval=${o.ap || 'none'}, variant=${o.v || 'subtle'}, size=${o.size || 'sm'}, state=default`); if (label) txt(i, 'label', label); return i; };
const tint = (i, tone) => { if (!tone || tone === 1) return; const fr = i.findOne((n) => n.name === 'frame'); if (!fr) return; fr.fills = [P(`avatar/${tone}/bg`, null, fr)]; const t = fr.findOne((n) => n.type === 'TEXT'); if (t) t.fills = [P(`avatar/${tone}/fg`, null, t)]; };
const AV = (ini, z = '24', tone) => { const i = inst('Avatar', `size=${z}, status=none, shape=square, state=default`); txt(i, 'initials', ini); tint(i, tone); return i; };
const PL = (name, role, pres, o = {}) => { const i = inst('PersonLabel', `presence=${pres || 'working'}, size=${o.size || 'sm'}, state=default`); const pr = { [pkey(S.PersonLabel, 'name')]: name, [pkey(S.PersonLabel, 'role')]: role }; if (!pres) pr[pkey(S.PersonLabel, 'presence')] = false; i.setProperties(pr); const a = i.findOne((n) => n.type === 'INSTANCE'); if (a) { txt(a, 'initials', o.ini || name.slice(1, 3)); tint(a, o.tone); } return i; };
const INP = (ph, w = 320, o = {}) => { const i = inst('Input', 'size=md, align=left, state=default'); i.setProperties({ [pkey(S.Input, 'icon')]: o.icon !== false }); const t = txt(i, 'value', ph); if (t && !o.value) t.fills = [P('fg/tertiary', null, t)]; i.resize(w, i.height); return i; };
const SEL = (v, w = 240) => { const i = inst('Select', 'size=md, width=full, state=default'); i.setProperties({ [pkey(S.Select, 'value')]: v }); i.resize(w, i.height); return i; };
const MI = (tile, z = '48') => { const i = inst('ModuleIcon', `size=${z}, state=default`); i.setProperties({ [pkey(S.ModuleIcon, 'tile')]: TILES[tile] }); return i; };
const NAVI = (kind, label, icon, o = {}) => { const i = inst('SideNav', `kind=${kind}, state=${o.sel ? 'selected' : 'default'}`); txt(i, 'label', label); if (icon && kind === 'item') i.setProperties({ [pkey(S.SideNav, 'icon')]: ICONS[icon] }); if (o.dot) { const d = i.findOne((n) => n.name === 'dot'); if (d) d.fills = [P(o.dot, null, d)]; } if (o.noDot) { const d = i.findOne((n) => n.name === 'dot'); if (d) d.visible = false; } return i; };
const SEG = (items, act) => { const s0 = AL('H', { n: 'segmented', g: 2, p: 2, r: 'md', f: 'bg/sunken' }); items.forEach((t, i) => { const it = AL('H', { h: 'density/control/height/sm', p: [0, 12], r: 'sm', f: i === act ? 'bg/surface' : null, e: i === act ? 'shadow/sm' : undefined }); add(it, TX(t, { s: 'label', w: i === act ? 600 : 500, c: i === act ? 'fg/primary' : 'fg/secondary' })); add(s0, it); }); return s0; };
const DT = (col, label, o = {}) => { const r = AL('H', { g: 6 }); add(r, dot(col, o.sz)); add(r, o.s ? TX(label, { s: o.s, w: o.w, c: o.c }) : B1(label, { w: o.w, c: o.c })); return r; };
const PB = (ratio, w, col = 'chart/series/1') => { const tr = AL('H', { n: 'progress', w, h: 'space/6', r: 'full', f: 'chart/track', clip: true }); if (ratio > 0) { const f = rect({ f: col, r: 'full', wn: Math.max(2, Math.round(w * ratio)), hn: 6 }); f.setBoundVariable('height', V('space/6')); add(tr, f); } return tr; };
const CARD = (o = {}) => { const c = AL('V', { n: o.n || 'card', g: o.g == null ? 12 : o.g, p: o.p == null ? 'density/card/padding' : o.p, f: 'bg/surface', s: 'border/divider', r: 'lg', ai: 'MIN', w: o.w, clip: o.clip }); if (o.title) { const hd = AL('H', { n: 'card head', g: 12, ai: 'MIN', p: o.hp }); const t = AL('V', { g: 4, ai: 'MIN' }); add(t, TX(o.title, { s: 'h3', c: 'fg/strong', n: 'card title' })); if (o.sub) add(t, TX(o.sub, { s: 'caption', c: 'fg/tertiary' })); add(hd, [t, { grow: true }]); if (o.action) add(hd, o.action); add(c, [hd, { fx: 'FILL' }]); } return c; };
const KPI = async (label, val, unit, sub, o = {}) => { const c = AL('V', { n: 'kpi', g: 4, p: 16, f: 'bg/surface', s: 'border/divider', r: 'lg', ai: 'MIN' }); const tr = AL('H', { g: 6 }); if (o.icon) add(tr, await IC(o.icon, 16, 'fg/secondary')); add(tr, [TX(label, { s: 'label', c: 'fg/secondary' }), { grow: true }]); if (o.more) add(tr, await IC('chevron-right', 16, 'fg/tertiary')); add(c, [tr, { fx: 'FILL' }]); const vr = AL('H', { g: 4, ai: 'BASELINE' }); add(vr, TX(val, { s: 'amountLg', c: 'fg/strong' })); add(vr, TX(unit, { s: 'caption', c: 'fg/secondary' })); add(c, vr); add(c, TX(sub, { s: 'caption', c: 'fg/tertiary' })); return c; };
const PH = (o) => { const h = AL('H', { n: 'page header', g: 16, ai: 'MIN' }); const l = AL('V', { g: 6, ai: 'MIN' }); if (o.crumbs) add(l, TX(o.crumbs, { s: 'caption', c: 'fg/secondary' })); const tr = AL('H', { g: o.titles ? 24 : 12 }); if (o.back) add(tr, o.back); if (o.titles) for (const [t, a] of o.titles) add(tr, TX(t, { s: 'h1', c: a ? 'fg/strong' : 'fg/tertiary' })); else add(tr, TX(o.title, { s: o.big ? 'display' : 'h1', c: 'fg/strong' })); for (const b of (o.badges || [])) add(tr, b); add(l, tr); if (o.sub) add(l, B1(o.sub, { c: 'fg/secondary' })); add(h, [l, { grow: true }]); if (o.right) add(h, o.right); else if (o.actions) { const a = AL('H', { g: 8 }); for (const b of o.actions) add(a, b); add(h, a); } return h; };
const TBL = (cols, rows, o = {}) => { const t = AL('V', { n: 'table', ai: 'MIN', f: 'bg/surface', s: o.box === false ? undefined : 'border/divider', r: o.box === false ? undefined : 'lg', clip: true }); const hr = AL('H', { n: 'thead', f: o.headFill === false ? null : 'bg/sunken' }); side(hr, 'Bottom'); for (const [h, w, al] of cols) { const ce = AL('H', { w, h: 'density/row/height', p: [0, 12], jc: al === 'R' ? 'MAX' : 'MIN' }); add(ce, h ? TX(h, { s: 'label', w: 600 }) : null); add(hr, ce); } add(t, hr);
  rows.forEach((r, ri) => { const tr = AL('H', { n: 'row', f: o.selRow === ri ? 'bg/sunken' : undefined }); if (ri < rows.length - 1) side(tr, 'Bottom'); r.forEach((v, ci) => { const [, w, al] = cols[ci]; const ce = AL(Array.isArray(v) && v.vert ? 'V' : 'H', { w, h: o.tall ? 'density/row/heightTall' : 'density/row/height', p: [0, 12], g: 6, jc: al === 'R' ? 'MAX' : (Array.isArray(v) && v.vert ? 'CENTER' : 'MIN'), ai: Array.isArray(v) && v.vert ? 'MIN' : 'CENTER' }); if (v == null) {} else if (typeof v === 'string') add(ce, B1(v)); else if (Array.isArray(v)) for (const x of v) add(ce, x); else add(ce, v); add(tr, ce); }); add(t, tr); }); return t; };
const vcell = (...a) => { a.vert = true; return a; };
const FLD = (parent, label, req, ctrl, help, o = {}) => { const f = AL('V', { n: 'field', g: 4, ai: 'MIN' }); add(parent, o.w ? [f, {}] : [f, { fx: 'FILL' }]); if (o.w) { f.resize(o.w, f.height); f.counterAxisSizingMode = 'FIXED'; } if (label) { const lr = AL('H', { g: 4 }); add(lr, TX(label, { s: 'label' })); if (req) add(lr, dot('status/danger/default', 'space/4')); add(f, lr); } add(f, [ctrl, { fx: 'FILL' }]); if (help) add(f, TX(help, { s: 'caption', c: 'fg/tertiary' })); return f; };
const DATE = async (v) => { const f = AL('H', { n: 'date field', h: 'density/control/height/md', p: [0, 8], g: 8, r: 'md', s: 'border/strong', f: 'bg/surface' }); add(f, [TX(v, { s: 'body', fs: 'density/input/fontSize', lh: 'density/body/lineHeight' }), { grow: true }]); add(f, await IC('calendar', 16, 'fg/tertiary')); return f; };
const RO = (v) => { const f = AL('H', { n: 'read only', h: 'density/control/height/md', p: [0, 8], r: 'md', f: 'bg/sunken' }); add(f, TX(v, { s: 'body', fs: 'density/input/fontSize', lh: 'density/body/lineHeight' })); return f; };
const TA = (ph, h, counter, o = {}) => { const f = AL('V', { n: 'textarea', h, p: [6, 8], r: 'md', s: 'border/strong', f: 'bg/surface', jc: 'SPACE_BETWEEN', ai: 'MIN' }); add(f, TX(ph, { s: 'body', fs: 'density/input/fontSize', lh: 'density/body/lineHeight', c: o.value ? 'fg/primary' : 'fg/tertiary' })); if (counter) add(f, [AL('H', { jc: 'MAX' }, [TX(counter, { s: 'caption', c: 'fg/tertiary' })]), { fx: 'FILL' }]); return f; };
const LISTROW = async (icon, title, desc, right, o = {}) => { const r = AL('H', { n: 'list row', g: 12, p: [12, 16] }); side(r, 'Top'); if (icon) { const b = AL('H', { n: 'icon box', w: 32, h: 32, r: 'md', s: 'border/divider', f: 'bg/surface', jc: 'CENTER' }); add(b, await IC(icon, 16, 'fg/secondary')); add(r, b); } const v = AL('V', { g: 2, ai: 'MIN' }); add(v, TX(title, { s: 'label', w: 600 })); if (desc) add(v, TX(desc, { s: 'caption', c: 'fg/secondary' })); add(r, [v, { grow: true }]); if (right) add(r, right); return r; };
const BAR = (left, btns, w) => { const b = AL('H', { n: 'action bar', g: 8, p: [12, 16], f: 'bg/surface', w }); side(b, 'Top'); add(b, [B1(left, { c: 'fg/secondary' }), { grow: true }]); for (const x of btns) add(b, x); return b; };
async function SCREEN(name, o = {}) { const W = o.w || 1440, H = o.h || 900; const root = figma.createFrame(); root.name = name; root.resize(W, H); root.fills = [P('bg/canvas', null, root)]; root.clipsContent = true;
  const sh = inst('AppShell', 'fill=viewport, state=default'); root.appendChild(sh); sh.x = 0; sh.y = 0; sh.resize(W, H);
  const pr = {}; if (o.brand) pr[pkey(S.AppShell, 'brand')] = o.brand; if (o.badge === false) pr[pkey(S.AppShell, 'brand badge')] = false; if (o.footer) pr[pkey(S.AppShell, 'footer')] = o.footer; if (o.user) pr[pkey(S.AppShell, 'userName')] = o.user; sh.setProperties(pr);
  if (o.search) txt(sh, 'search placeholder', o.search);
  let nv = null; if (o.nav) { { const nn = sh.findOne((n) => n.name === 'nav'); for (const c of nn.children) c.visible = false; } nv = AL('V', { n: 'side nav', g: 2, p: [8, 8], ai: 'MIN' }); for (const it of o.nav) { if (it === 'gap') { add(nv, AL('V', { n: 'gap', h: 'space/8' })); continue; } add(nv, NAVI(...it)); } root.appendChild(nv); nv.x = 0; nv.y = 48; }
  const ct = AL('V', { n: 'content', g: 16, p: 24, ai: 'MIN', f: 'bg/canvas', clip: true }); root.appendChild(ct); ct.x = 240; ct.y = 49; ct.resize(W - 240, H - 49); ct.counterAxisSizingMode = 'FIXED'; ct.primaryAxisSizingMode = o.fit ? 'AUTO' : 'FIXED'; // resize() set both axes to FIXED
  return { root, sh, ct, W, H };
}
function FIT(sc, min = 900) { sc.ct.primaryAxisSizingMode = 'AUTO'; const h = Math.max(min, Math.ceil(sc.ct.height) + 49); sc.root.resize(sc.W, h); sc.sh.resize(sc.W, h); sc.ct.primaryAxisSizingMode = 'FIXED'; sc.ct.resize(sc.W - 240, h - 49); }
// 모드는 라이브러리 컬렉션(Semantic · Company)의 같은 이름 모드로 건다
const MODE = (node, sem, co) => { node.setExplicitVariableModeForCollection(_SE, _SE.modes.find((m) => m.name === sem).modeId); node.setExplicitVariableModeForCollection(_CO, _CO.modes.find((m) => m.name === co).modeId); };
const PLACE = async (root, pageId, x, y) => { const pg = await figma.getNodeByIdAsync(pageId); await pg.loadAsync(); for (const n of pg.children.filter((n) => n.name === root.name)) n.remove(); pg.appendChild(root); root.x = x; root.y = y; };
const TRIAL_NAV = (sel) => [['item', '홈', 'layout-grid', { sel: sel === '홈' }], ['section', '인사', null, { dot: 'module/erp/default' }], ['item', '구성원', 'users', { sel: sel === '구성원' }], ['item', '인사기록카드', 'contact', { sel: sel === '인사기록카드' }], ['item', '조직도', 'workflow', { sel: sel === '조직도' }], ['section', '근태 · 휴가', null, { dot: 'module/groupware/default' }], ['item', '출퇴근', 'clock', { sel: sel === '출퇴근' }], ['item', '팀 근태 · 휴가 달력', 'calendar-days', { sel: sel === '팀 근태 · 휴가 달력' }], ['item', '휴가 신청', 'calendar-plus', { sel: sel === '휴가 신청' }], ['item', '결재함', 'stamp', { sel: sel === '결재함' }], ['section', '급여', null, { dot: 'module/erp/default' }], ['item', '급여 명세서', 'receipt', { sel: sel === '급여 명세서' }], ['section', '관리', null, { noDot: true }], ['item', '화면 설정', 'settings', { sel: false }]];
const TRIAL = (sel, user) => ({ brand: '테라스원 인사', badge: false, footer: '테라그린 주식회사', search: '검색', user, nav: TRIAL_NAV(sel), fit: true });

// --- 목록 · 표 · 결재 · 달력 도우미
const IV = (k, part) => { const s = S[k]; const ps = part.split(', '); const v = s.children.find((c) => ps.every((p) => c.name.includes(p)) && (!c.name.includes('state=') || c.name.includes('state=default'))) || s.children[0]; NI++; return v.createInstance(); };
const I0 = (k) => { NI++; const s = S[k]; return (s.type === 'COMPONENT_SET' ? (s.children.find((c) => c.name.includes('state=default')) || s.children[0]) : s).createInstance(); };
const CV = (...ns) => ns.find((n) => VM.has('color/' + n)) || 'fg/tertiary';
const PRES = { '근무 중': CV('presence/working', 'status/success/default'), '외근': CV('presence/away', 'presence/outside', 'status/info/default'), '재택': CV('presence/remote', 'status/info/default'), '휴가': CV('presence/leave', 'presence/vacation', 'status/warning/default'), '퇴근': CV('presence/off', 'presence/offline', 'fg/tertiary') };
const STC = { '재직': 'status/success/default', '휴직': 'status/warning/default', '퇴직': 'fg/tertiary' };
const MODE2 = (node, sem, co) => { node.setExplicitVariableModeForCollection(_SE, _SE.modes.find((m) => m.name.startsWith(sem)).modeId); node.setExplicitVariableModeForCollection(_CO, _CO.modes.find((m) => m.name.startsWith(co)).modeId); };
const TABS = (items, sz = 'md') => { const t = IV('Tabs', 'size=' + sz); const pr = {}; items.forEach(([l, c], i) => { pr[pkey(S.Tabs, 'tab ' + (i + 1))] = l; pr[pkey(S.Tabs, 'count ' + (i + 1))] = c != null; }); t.setProperties(pr); items.forEach(([l, c], i) => { if (c != null) txt(t, 'count ' + (i + 1), String(c)); }); return t; };
const NAMECELL = (ini, tone, name, pres) => { const a = [AV(ini, '24', tone), TX(name, { s: 'label', w: 600 })]; if (pres) a.push(DT(PRES[pres] || 'fg/tertiary', pres, { s: 'caption', c: 'fg/secondary' })); return a; };
const SPACER = () => { const f = AL('H', { n: 'spacer' }); f.resize(1, 1); return [f, { grow: true }]; };
const AP = (ap, label) => { const i = IV('Badge', 'approval=' + ap + ', variant=subtle, size=sm'); if (label) txt(i, 'label', label); return i; };
// ApprovalLine: 라이브러리 세트의 글자 레이어는 이름이 글자 내용이다 → 단계(step)의 구조로 찾는다
// step = role(글자) · body(person(이름 · 직위) · badge · 시각 · 의견)
const STEPS = (al) => al.findAll((n) => n.type === 'FRAME' && n.name === 'step');
const _STEPT = (s) => { const role = s.findOne((n) => n.name === 'role'), body = s.findOne((n) => n.name === 'body'), person = body && body.findOne((n) => n.name === 'person'); const bt = body ? body.children.filter((c) => c.type === 'TEXT') : []; return { 'role label': role && role.findOne((n) => n.type === 'TEXT'), name: person && person.children[0], title: person && person.children[1], time: bt[0], comment: bt[1] }; };
const STEP = (s, o) => { const T = _STEPT(s); for (const k of ['role label', 'name', 'title', 'time', 'comment']) { const t = T[k]; if (!t) { if (o[k] != null && o[k] !== false) KIT_WARN.push('ApprovalLine step에 ' + k + ' 없음'); continue; } if (o[k] === false) t.visible = false; else if (o[k] != null) t.characters = o[k]; } };
const ALINE = (orient, keep, edits) => { const al = IV('ApprovalLine', 'orientation=' + orient); const ss = STEPS(al); ss.forEach((s, i) => { if (!keep.includes(i)) s.visible = false; else if (edits[i]) STEP(s, edits[i]); }); return al; };
const META = (pairs, cw = 380, lw = 88) => { const g = AL('H', { n: 'meta', g: 24, wrap: 12, ai: 'MIN' }); for (const [k, v] of pairs) { const r = AL('H', { n: 'meta item', g: 12, ai: 'MIN', w: cw }); add(r, TX(k, { s: 'label', w: 400, c: 'fg/secondary', wd: lw })); const vt = B1(v); add(r, [vt, { grow: true }]); add(g, r); } return g; };
const PARA = (parent, text, o = {}) => { const t = B1(text, o); add(parent, [t, { fx: 'FILL' }]); t.textAutoResize = 'HEIGHT'; return t; };
const SEC = (title, sub, o = {}) => { const s = AL('V', { n: 'section', g: o.g == null ? 12 : o.g, p: o.p == null ? [20, 24] : o.p, ai: 'MIN' }); if (o.line !== false) side(s, 'Top'); if (title) { const h = AL('V', { g: 4, ai: 'MIN' }); add(h, TX(title, { s: 'h3', c: 'fg/strong' })); if (sub) add(h, TX(sub, { s: 'caption', c: 'fg/secondary' })); add(s, h); } return s; };
const TL = async (icon, col, title, meta, comment) => { const r = AL('H', { n: 'history row', g: 12, ai: 'MIN' }); add(r, await IC(icon, 16, col)); const v = AL('V', { g: 2, ai: 'MIN' }); add(v, TX(title, { s: 'label', w: 600 })); add(v, TX(meta, { s: 'caption', c: 'fg/secondary' })); if (comment) add(v, TX(comment, { s: 'caption' })); add(r, [v, { grow: true }]); return r; };
const ROWH = (g = 16) => AL('H', { g, ai: 'MIN' });
const BDX = (label, tone) => { const i = IV('Badge', 'tone=' + tone + ', approval=none, variant=subtle, size=sm'); txt(i, 'label', label); return i; };
const NM = (ini, tone, name, role) => { const a = [AV(ini, '24', tone)]; const v = AL('V', { g: 0, ai: 'MIN' }); add(v, TX(name, { s: 'label', w: 600 })); add(v, TX(role, { s: 'caption', c: 'fg/tertiary' })); a.push(v); return a; };
const MEMBERS = [['세린', 2, '오세린', '팀장 · 인사팀'], ['서진', 3, '한서진', '과장 · 인사팀'], ['도하', 4, '김도하', '사원 · 인사팀'], ['태오', 5, '문태오', '팀장 · 개발팀'], ['지안', 6, '박지안', '차장 · 개발팀'], ['지아', 1, '서지아', '대리 · 개발팀'], ['민재', 2, '강민재', '대리 · 개발팀'], ['하린', 3, '이하린', '사원 · 개발팀'], ['다온', 4, '정다온', '사원 · 개발팀'], ['유진', 5, '최유진', '팀장 · 영업팀'], ['궁선', 6, '남궁선', '과장 · 영업팀'], ['서윤', 1, '배서윤', '대리 · 영업팀'], ['채원', 2, '임채원', '사원 · 영업팀'], ['지후', 3, '홍지후', '팀장 · 재무팀'], ['하은', 4, '송하은', '대리 · 재무팀']];
const CAL = (days, chips, o = {}) => { const w = o.dw || 128; const cols = [['구성원', o.nw || 176]].concat(days.map((d) => [d, w])); const rows = MEMBERS.map((m, ri) => [NM(...m)].concat(days.map((d, ci) => { const c = chips[ri + ',' + ci]; return c ? [BDX(c[0], c[1])] : null; }))); const t = TBL(cols, rows, { tall: true }); const we = o.weekend || []; for (const r of t.children.slice(1)) for (const ci of we) { const ce = r.children[ci + 1]; if (ce) ce.fills = [P('bg/sunken', null, ce)]; } return t; };
const KPI2 = async (icon, label, val, unit, sub) => KPI(label, val, unit, sub, { icon, more: true });
// ===== end screen kit v2 =====
