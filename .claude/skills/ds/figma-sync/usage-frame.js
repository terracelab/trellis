// Trellis Usage frame (figma-sync 3절, PG-12). usage.mjs --emit이 키트 v2 · DATA와 함께 use_figma로 보낸다.
// 페이지마다 같은 이름의 `Usage · <Name>`만 지우고 다시 만든다. 글은 DATA(spec.md · contract)에서만 온다.
// 해부 견본 · 번호 표시 · 쓰는 곳 · 쓰지 않는 곳 · 키 · 화면 예(세트 인스턴스 조립)를 세로로 쌓는다.
// eslint-disable-next-line no-unused-vars
async function buildUsage(DATA) {
  figma.skipInvisibleInstanceChildren = false;
  const W = 1280;
  const INNER = W - 80;
  const COL = (INNER - 40) / 2;
  const pages = new Map();
  const pageOf = async (n) => {
    if (!pages.has(n)) {
      const p = figma.root.children.find((x) => x.name === n);
      if (!p) throw new Error('page ' + n);
      await p.loadAsync();
      pages.set(n, p);
    }
    return pages.get(n);
  };
  const mains = new Map();
  async function main(name) {
    if (!mains.has(name)) {
      const page = await pageOf(name.split(' / ')[0]);
      const n = page.children.find(
        (x) => (x.type === 'COMPONENT_SET' || x.type === 'COMPONENT') && x.name === name,
      );
      if (!n) throw new Error('set ' + name);
      mains.set(name, n);
    }
    return mains.get(name);
  }
  // 변형: 이름 그대로 또는 { 축: 값 } 일부(첫 번째로 맞는 것)
  function variant(m, v) {
    if (m.type !== 'COMPONENT_SET') return m;
    if (!v) return m.defaultVariant || m.children[0];
    const c =
      typeof v === 'string'
        ? m.children.find((x) => x.name === v)
        : m.children.find((x) => Object.entries(v).every(([k, a]) => x.variantProperties[k] === a));
    if (!c) throw new Error('variant ' + m.name + ' ' + JSON.stringify(v));
    return c;
  }
  function setP(inst, m, props) {
    const defs = m.componentPropertyDefinitions;
    const out = {};
    for (const [k, v] of Object.entries(props || {})) {
      const key = Object.keys(defs).find((x) => x.startsWith(k + '#'));
      const t = key && defs[key].type;
      // 견본 설정(on)은 이름만 맞춘다: 불리언 속성에는 불리언, 글자 속성에는 글자만 넣는다
      if (
        !t ||
        (t === 'BOOLEAN' && typeof v !== 'boolean') ||
        (t === 'TEXT' && typeof v !== 'string')
      )
        continue;
      out[key] = v;
    }
    if (Object.keys(out).length) inst.setProperties(out);
  }
  async function make(name, v, props) {
    const m = await main(name);
    const i = variant(m, v).createInstance();
    setP(i, m, props);
    return i;
  }
  const setNameOf = (i) => {
    const mc = i.mainComponent;
    return mc ? (mc.parent && mc.parent.type === 'COMPONENT_SET' ? mc.parent.name : mc.name) : '';
  };
  async function nested(inst, setName, props) {
    const n = inst.findOne((x) => x.type === 'INSTANCE' && setNameOf(x) === setName);
    if (n) setP(n, await main(setName), props);
    return n;
  }
  async function icon(name) {
    const p = await pageOf('Icons');
    const c = p.findOne((x) => x.type === 'COMPONENT' && x.name === 'icon/' + name);
    if (!c) throw new Error('icon ' + name);
    return c;
  }
  // INSTANCE_SWAP 아이콘을 바꾸면 선 색이 본체 색으로 돌아가므로 바꾸기 전 칠을 다시 쓴다(3절 함정)
  async function swapIcon(inst, setName, prop, name) {
    const old = inst.findOne((x) => 'strokes' in x && x.strokes.length);
    const paints = old ? old.strokes : null;
    setP(inst, await main(setName), { [prop]: (await icon(name)).id });
    if (paints)
      for (const v of inst.findAll(
        (x) => 'strokes' in x && x.strokes.length && x.type === 'VECTOR',
      ))
        v.strokes = paints;
  }
  const visibleIn = (n, root) => {
    for (let x = n; x && x !== root; x = x.parent) if (x.visible === false) return false;
    return true;
  };
  function findPart(inst, name, alias) {
    const t = (alias && alias[name]) || name;
    if (t === '@root' || name === 'root') return inst;
    const want = t.toLowerCase();
    return inst.findAll((x) => x.name.toLowerCase() === want && visibleIn(x, inst))[0] || null;
  }
  function marker(n) {
    const f = figma.createFrame();
    f.name = 'marker ' + n;
    f.fills = [];
    f.resize(20, 20);
    f.clipsContent = false;
    const e = figma.createEllipse();
    e.resize(20, 20);
    st(e, { f: 'fg/strong' });
    f.appendChild(e);
    const t = TX(String(n), { s: 'caption', w: 600, c: 'fg/inverse', al: 'CENTER' });
    f.appendChild(t);
    t.textAutoResize = 'HEIGHT';
    t.resize(20, t.height);
    t.y = (20 - t.height) / 2;
    return f;
  }
  function frameV(o) {
    const f = AL('V', Object.assign({ ai: 'MIN' }, o));
    return f;
  }
  function fixedW(f, w) {
    if (f.layoutMode === 'VERTICAL') f.counterAxisSizingMode = 'FIXED';
    else f.primaryAxisSizingMode = 'FIXED';
    f.resize(w, f.height);
    if (f.layoutMode === 'VERTICAL') f.primaryAxisSizingMode = 'AUTO';
    else f.counterAxisSizingMode = 'AUTO';
    return f;
  }
  function heading(text) {
    return TX(text, { s: 'h3', c: 'fg/strong' });
  }
  function bulletList(title, items) {
    const col = fixedW(frameV({ g: 12, n: title }), COL);
    add(col, TX(title, { s: 'h4', c: 'fg/primary' }));
    for (const it of items) {
      const row = AL('H', { g: 10, ai: 'MIN' });
      const holder = figma.createFrame();
      holder.fills = [];
      holder.resize(6, 21);
      const dot = figma.createEllipse();
      dot.resize(6, 6);
      st(dot, { f: 'fg/tertiary' });
      holder.appendChild(dot);
      dot.y = 7.5;
      add(row, holder);
      add(row, TX(it, { s: 'body', c: 'fg/primary', wd: COL - 16 }));
      add(col, row);
    }
    return col;
  }
  async function specimen(d) {
    const inst = await make(d.name, d.v, d.on);
    const box = figma.createFrame();
    box.name = 'specimen';
    st(box, { f: 'bg/canvas', r: 'md' });
    box.clipsContent = false;
    box.appendChild(inst);
    // 견본은 1배로 둔다. rescale · scaleFactor는 안쪽 글자 크기를 숫자로 바꿔 글자 스타일 · 변수 바인딩이 풀린다
    const PAD = 48;
    const LANE = 40;
    box.resize(Math.max(inst.width + PAD * 2 + LANE, 240), inst.height + PAD * 2);
    inst.x = PAD;
    inst.y = PAD;
    const placed = [];
    let hits = 0;
    const b0 = box.absoluteBoundingBox;
    const free = (x, y) => !placed.some((p) => Math.abs(p[0] - x) < 22 && Math.abs(p[1] - y) < 22);
    const parts = d.anatomy.map((a) => {
      const t = findPart(inst, a.n, d.alias);
      return t && t.absoluteBoundingBox ? { t, bb: t.absoluteBoundingBox } : null;
    });
    const tops = parts.filter((p) => p && p.t !== inst).map((p) => p.bb.y - b0.y);
    const firstRow = tops.length ? Math.min(...tops) : 0;
    // 번호 자리: 전체는 왼쪽 위 바깥, 맨 위 줄 부품은 견본 위 같은 가로 자리, 아래 줄 부품은 오른쪽 바깥 같은 높이.
    // 글자 위에 번호가 겹치지 않게 견본 밖에 둔다. 겹치면 위 줄은 오른쪽, 오른쪽 줄은 아래로 민다
    parts.forEach((p, i) => {
      if (!p) return;
      const rx = p.bb.x - b0.x;
      const ry = p.bb.y - b0.y;
      let x;
      let y;
      if (p.t === inst) {
        x = inst.x - 26;
        y = inst.y - 26;
      } else if (ry - firstRow < 12) {
        x = Math.max(2, rx + p.bb.width / 2 - 10);
        y = inst.y - 26;
        while (!free(x, y)) x += 24;
      } else {
        x = inst.x + inst.width + 12;
        y = ry + Math.min(p.bb.height, 40) / 2 - 10;
        while (!free(x, y)) y += 24;
      }
      placed.push([x, y]);
      const m = marker(i + 1);
      box.appendChild(m);
      m.x = x;
      m.y = y;
      hits++;
    });
    const bottom = Math.max(box.height, ...placed.map((q) => q[1] + 22 + 12));
    const right = Math.max(box.width, ...placed.map((q) => q[0] + 22 + 12));
    if (bottom > box.height || right > box.width) box.resize(right, bottom);
    return { box, hits };
  }
  function partsList(d) {
    const col = frameV({ g: 12, n: 'parts' });
    d.anatomy.forEach((a, i) => {
      const row = AL('H', { g: 12, ai: 'MIN' });
      add(row, marker(i + 1));
      const txt = frameV({ g: 2 });
      add(txt, TX(a.n, { s: 'label', c: 'fg/primary' }));
      if (a.d) add(txt, TX(a.d, { s: 'caption', c: 'fg/secondary', wd: 440 }));
      add(row, txt);
      add(col, row);
    });
    return col;
  }
  function keycap(k) {
    const c = AL('H', { p: [2, 8], f: 'bg/surface', s: 'border/default', r: 'sm', n: 'key' });
    add(c, TX(k, { s: 'label', c: 'fg/primary' }));
    return c;
  }
  function keyRows(keys) {
    const col = frameV({ g: 10, n: 'keys' });
    const anyAction = keys.some((k) => k.a);
    if (!anyAction) {
      const row = AL('H', { g: 8 });
      for (const k of keys) add(row, keycap(k.k));
      add(col, row);
      add(col, TX('contract a11y.keyboard', { s: 'caption', c: 'fg/tertiary' }));
      return col;
    }
    for (const k of keys) {
      const row = AL('H', { g: 16, ai: 'MIN' });
      const caps = fixedW(AL('H', { g: 4 }), 280);
      for (const part of k.k.split(' · ')) add(caps, keycap(part));
      add(row, caps);
      add(row, TX(k.a || ' ', { s: 'body', c: 'fg/secondary', wd: INNER - 296 }));
      add(col, row);
    }
    return col;
  }
  function spacer() {
    const s = figma.createFrame();
    s.fills = [];
    s.resize(1, 1);
    return s;
  }
  const KPI = (label, value, unit, delta = true) =>
    make('KpiCard', 'size=md, state=default', { label, 'value text': value, unit, delta });
  const RECIPES = {
    async Button(c) {
      add(c, await make('ActionBar', 'align=end, sticky=false', { summary: true }));
      return 'ActionBar 안의 Button입니다. 주 동작(primary)은 하나이고 맨 오른쪽에 둡니다. 취소는 그 왼쪽입니다.';
    },
    async IconButton(c) {
      const bar = AL('H', {
        g: 8,
        p: [8, 16],
        f: 'bg/surface',
        s: 'border/divider',
        r: 'md',
        n: 'global bar',
      });
      add(bar, await make('Input', 'size=sm, align=left, state=default', { icon: true }));
      const sp = spacer();
      add(bar, sp);
      for (const [ic, cnt] of [
        ['bell', true],
        ['circle-help', false],
        ['settings', false],
      ]) {
        const b = await make(
          'IconButton',
          'variant=ghost, size=md, countTone=neutral, state=default',
          { count: cnt },
        );
        await swapIcon(b, 'IconButton', 'icon', ic);
        add(bar, b);
      }
      add(bar, await make('PersonLabel', 'presence=working, size=md, state=default'));
      fixedW(bar, 960);
      sp.layoutGrow = 1;
      add(c, bar);
      return '글로벌 바 오른쪽의 알림 · 도움말 · 설정 IconButton입니다. 툴팁 글자는 이름과 같습니다.';
    },
    async Badge(c) {
      add(c, await make('DataGrid', 'height=auto, mobile=cards, dividers=rows, state=default'));
      return 'DataGrid 행의 상태 칸입니다. 셀 안에서는 점이 있는 subtle Badge가 바탕 없이 점과 글자로 줄어듭니다.';
    },
    async Avatar(c) {
      const people = [
        ['김지원', '재무팀 · 팀장', 'working', '지원'],
        ['박도윤', '경영지원본부 · 본부장', 'remote', '도윤'],
        ['한서연', '인사팀 · 팀장', 'leave', '서연'],
      ];
      for (const [name, role, presence, ini] of people) {
        const p = await make('PersonLabel', `presence=${presence}, size=md, state=default`, {
          name,
          role,
        });
        const t = p.findOne((x) => x.type === 'TEXT' && x.name === 'initials');
        if (t) t.characters = ini;
        add(c, p);
      }
      return 'PersonLabel 안의 Avatar입니다. 옆에 이름 글자가 있어 아바타는 꾸밈으로 숨깁니다.';
    },
    async ModuleIcon(c) {
      const row = AL('H', { g: 16, ai: 'MIN' });
      add(row, await make('NotificationCard', 'tone=neutral, state=default'));
      add(
        row,
        await make('NotificationCard', 'tone=danger, state=default', {
          title: '3일 넘은 결재',
          description: '지출결의 2건이 3일째 승인을 기다립니다',
          time: '1시간 전',
        }),
      );
      add(c, row);
      return 'NotificationCard 안의 ModuleIcon 40입니다. 카운트는 타일 안이 아니라 카드 오른쪽 위에 둡니다.';
    },
    async Card(c) {
      const row = AL('H', { g: 16, ai: 'MIN' });
      add(row, await make('Card', 'padding=default'));
      const kpis = frameV({ g: 16 });
      add(kpis, await KPI('당일 시재', '874,479,500', '원'));
      add(kpis, await KPI('결재 대기', '12', '건', false));
      add(row, kpis);
      add(c, row);
      return 'Card는 목록 · 표 · 요약을 묶습니다. 숫자 하나는 KpiCard로 보입니다.';
    },
    async NotificationCard(c) {
      const row = AL('H', { g: 16, ai: 'MIN' });
      add(row, await make('NotificationCard', 'tone=neutral, state=default'));
      add(
        row,
        await make('NotificationCard', 'tone=danger, state=default', {
          title: '3일 넘은 결재',
          description: '지출결의 2건이 3일째 승인을 기다립니다',
          time: '1시간 전',
        }),
      );
      add(
        row,
        await make('NotificationCard', 'tone=neutral, state=default', {
          title: '읽지 않은 메일',
          description: '거래처 메일 5통',
          time: '방금',
          unread: true,
        }),
      );
      add(c, row);
      return '홈의 처리할 일 카드입니다. 모듈 하나에 숫자 하나를 보입니다.';
    },
    async Input(c) {
      add(c, await make('FormSection', 'columns=2'));
      return 'FormSection 안의 Field와 Input입니다. 라벨 · 설명 · 오류는 Field가 Input에 잇습니다.';
    },
    async Checkbox(c) {
      add(
        c,
        await make('Popover', { side: 'bottom', align: 'start', width: 'sm', state: 'default' }),
      );
      return '열 필터 Popover 안의 Checkbox 목록입니다. 목록에서 여러 항목을 고릅니다.';
    },
    async RadioGroup(c) {
      const rg = variant(await main('RadioGroup'), 'orientation=horizontal, state=default');
      add(
        c,
        await make('Field', 'layout=vertical, state=default', {
          label: '정산 주기',
          help: false,
          required: false,
          control: rg.id,
        }),
      );
      return 'Field 안의 RadioGroup입니다. Field 라벨이 그룹 이름이 됩니다.';
    },
    async Switch(c) {
      const panel = fixedW(
        frameV({ g: 16, p: 16, f: 'bg/surface', s: 'border/divider', r: 'lg', n: 'settings' }),
        480,
      );
      add(
        panel,
        await make('Switch', 'size=md, state=default', {
          label: '전자결재 알림',
          checked: true,
          description: true,
        }),
      );
      add(
        panel,
        await make('Switch', 'size=md, state=default', { label: '메일 알림', checked: false }),
      );
      add(
        panel,
        await make('Switch', 'size=md, state=default', {
          label: '세금계산서 자동 발행',
          checked: true,
        }),
      );
      add(c, panel);
      return '설정 화면의 Switch입니다. 누르는 즉시 적용되고 저장 단추를 두지 않습니다.';
    },
    async Select(c) {
      const sel = variant(await main('Select'), { size: 'md', state: 'default' });
      const row = AL('H', { g: 24, ai: 'MIN' });
      for (const [label, value, req] of [
        ['과세 구분', '과세', true],
        ['출고 창고', '본사 물류센터', false],
      ]) {
        const f = await make('Field', 'layout=vertical, state=default', {
          label,
          help: false,
          required: req,
          control: sel.id,
        });
        await nested(f, 'Select', { value });
        add(row, f);
      }
      add(c, row);
      return 'Field 안의 Select입니다. 정해진 선택지 중 하나를 고릅니다.';
    },
    async Tabs(c) {
      add(c, await make('PageHeader', null, { tabs: true }));
      return 'PageHeader 아래의 Tabs입니다. 한 화면 안의 보기를 바꿉니다.';
    },
    async Dialog(c) {
      const dim = frameV({ p: 48, f: 'bg/overlay', r: 'md', n: 'backdrop' });
      add(dim, await make('Dialog', 'size=sm, tone=danger'));
      add(c, dim);
      return '되돌리기 어려운 동작을 확인하는 Dialog입니다. 확인 단추는 결과를 말하는 라벨입니다.';
    },
    async Drawer(c) {
      const row = AL('H', { g: 0, ai: 'MIN' });
      add(row, await make('DataGrid', 'height=auto, mobile=cards, dividers=rows, state=default'));
      add(row, await make('Drawer', 'side=right, width=md, height=auto'));
      add(c, row);
      return '목록 · 상세 패턴입니다. 목록을 떠나지 않고 한 건을 Drawer로 엽니다.';
    },
    async Toast(c) {
      const col = frameV({ g: 12, ai: 'MAX' });
      add(col, await make('Toast', 'tone=success'));
      add(col, await make('ActionBar', 'align=end, sticky=true'));
      add(c, col);
      return 'sticky ActionBar 위에 뜬 Toast입니다. 방금 한 동작의 결과를 잠깐 알립니다.';
    },
    async AppShell(c) {
      add(c, await make('AppShell / Phone'));
      return '휴대폰 폭의 AppShell입니다. 머리줄 오른쪽 아바타 단추와 아래 탭바가 붙습니다.';
    },
    async DataGrid(c) {
      add(c, await make('FilterBar', 'layout=inline, columns=2'));
      add(c, await make('DataGrid', 'height=auto, mobile=cards, dividers=rows, state=default'));
      add(c, await make('Pagination', 'state=default'));
      return '목록 화면은 FilterBar · DataGrid · Pagination 순서로 붙입니다.';
    },
    async PageHeader(c) {
      add(c, await make('PageHeader'));
      const row = AL('H', { g: 16, ai: 'MIN' });
      add(row, await KPI('당일 시재', '874,479,500', '원'));
      add(row, await KPI('당월 매출', '1,284,500,000', '원'));
      add(row, await KPI('결재 대기', '12', '건', false));
      add(c, row);
      return '모든 업무 화면은 PageHeader 하나로 시작합니다.';
    },
    async FilterBar(c) {
      add(c, await make('FilterBar', 'layout=inline, columns=2'));
      add(c, await make('DataGrid', 'height=auto, mobile=cards, dividers=rows, state=default'));
      return 'DataGrid 바로 위의 FilterBar입니다. 위 덩어리보다 표에 더 가깝게 붙입니다.';
    },
    async ActionBar(c) {
      add(c, await make('FormSection', 'columns=2'));
      add(c, await make('ActionBar', 'align=end, sticky=false', { summary: true }));
      return '폼 아래의 ActionBar입니다. 저장은 오른쪽 끝이고 취소는 그 왼쪽입니다.';
    },
    async Pagination(c) {
      add(c, await make('DataGrid', 'height=auto, mobile=cards, dividers=rows, state=default'));
      add(c, await make('Pagination', 'state=default'));
      return 'DataGrid 아래의 Pagination입니다.';
    },
    async KpiCard(c) {
      const row = AL('H', { g: 16, ai: 'MIN' });
      add(row, await KPI('당일 시재', '874,479,500', '원'));
      add(row, await KPI('당월 매출', '1,284,500,000', '원'));
      add(row, await make('KpiCard', 'size=md, state=error', { label: '미수금' }));
      add(c, row);
      return '대시보드 첫 줄의 KpiCard입니다. 불러오지 못한 카드는 값 대신 다시 시도를 보입니다.';
    },
    async SideNav(c) {
      const row = AL('H', { g: 24, ai: 'MIN' });
      add(
        row,
        await make('SideNav', 'collapsed=false, state=default', { header: true, footer: true }),
      );
      add(row, await make('SideNav', 'collapsed=true, state=default'));
      add(c, row);
      return 'AppShell의 sidebar 칸에 두는 SideNav입니다. 펼친 폭은 240이고 접은 폭은 64입니다.';
    },
    async LineItemsEditor(c) {
      add(c, await make('FormSection', 'columns=2'));
      add(c, await make('LineItemsEditor', 'state=default'));
      add(c, await make('ActionBar', 'align=end, sticky=false'));
      return '세금계산서 품목 입력입니다. 줄 추가 · 삭제 · 합계는 LineItemsEditor가 맡습니다.';
    },
  };

  const results = [];
  for (const d of DATA) {
    const page = await pageOf(d.page);
    for (const old of page.children.filter((n) => n.name === 'Usage · ' + d.name)) old.remove();
    const right = Math.max(...page.children.map((n) => n.x + n.width));
    const fr = fixedW(
      frameV({
        g: 40,
        p: 40,
        f: 'bg/surface',
        s: 'border/divider',
        r: 'lg',
        n: 'Usage · ' + d.name,
      }),
      W,
    );
    page.appendChild(fr);
    fr.x = Math.round(right + 160);
    fr.y = 0;
    const head = frameV({ g: 4 });
    add(head, TX(d.name + ' 쓰임', { s: 'h2', c: 'fg/strong' }));
    add(
      head,
      TX(
        `규격 packages/contracts/src/${d.name}/spec.md의 해부 · 용도 · 금지 사항과 contract a11y.keyboard에서 옮겼습니다.`,
        { s: 'caption', c: 'fg/tertiary' },
      ),
    );
    add(fr, head);
    // (a) 해부
    const a = frameV({ g: 16, n: 'anatomy' });
    add(a, heading('해부'));
    const sp = await specimen(d);
    // 넓은 견본(PageHeader · DataGrid 등)은 견본 아래에 번호 목록을 둔다
    const wide = sp.box.width > INNER - 480;
    const row = AL(wide ? 'V' : 'H', { g: wide ? 24 : 40, ai: 'MIN' });
    add(row, sp.box);
    add(row, partsList(d));
    add(a, row);
    add(fr, a);
    // (b) 쓰는 곳 · 쓰지 않는 곳
    const b = frameV({ g: 16, n: 'when' });
    add(b, heading('쓰는 곳 · 쓰지 않는 곳'));
    const cols = AL('H', { g: 40, ai: 'MIN' });
    add(cols, bulletList('쓰는 곳', d.use));
    add(cols, bulletList('쓰지 않는 곳', d.dont));
    add(b, cols);
    add(fr, b);
    // (c) 키보드
    if (d.keys.length) {
      const k = frameV({ g: 16, n: 'keyboard' });
      add(k, heading('키보드'));
      add(k, keyRows(d.keys));
      add(fr, k);
    }
    // (d) 화면 예
    const e = frameV({ g: 16, n: 'example' });
    add(e, heading('화면 예'));
    const stage = fixedW(frameV({ g: 16, p: 32, f: 'bg/canvas', r: 'md', n: 'stage' }), INNER);
    const content = frameV({ g: 16, n: 'composition' });
    add(stage, content);
    const recipe = RECIPES[d.name];
    const caption = recipe ? await recipe(content) : '';
    add(e, TX(caption, { s: 'body', c: 'fg/secondary', wd: INNER }));
    add(e, stage);
    add(fr, e);
    // 줄이지 않고 프레임을 넓힌다(1배 인스턴스라 글자 스타일 · 변수 바인딩이 그대로다)
    const need = Math.ceil(Math.max(INNER, content.width + 64, sp.box.width));
    if (need > INNER) {
      fixedW(stage, need);
      fixedW(fr, need + 80);
    }
    results.push({
      name: d.name,
      id: fr.id,
      w: Math.round(fr.width),
      h: Math.round(fr.height),
      markers: sp.hits + '/' + d.anatomy.length,
      instances: content.findAll((n) => n.type === 'INSTANCE').length,
    });
  }
  return results;
}
