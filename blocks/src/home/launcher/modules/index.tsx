// 모듈 런처(NotificationHome): 즐겨찾기 줄 → 묶음(modules.json groups)별 모듈 타일. 이름 · 묶음 · 초성으로 찾는다.
// 타일은 링크라 Tab으로 차례로 닿고 Enter로 연다. 별 단추는 타일마다 하나, / 키는 검색 칸으로 간다.
// 앱에 첫 화면이 없는 모듈은 그리지 않는다(useScreens). 즐겨찾기는 이 화면 동안만 기억한다. 실제 앱은 사용자 설정 API에 저장한다
import {
  ModuleIcon,
  Card,
  EmptyState,
  IconButton,
  Input,
  PageHeader,
  Button,
} from '@terracelab/trellis-react';
import modules from '@terracelab/trellis-tokens/modules';
import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { usePlatform, useScreens } from '../../../_platform/index.js';
import { Page, Stack } from '../../../_ui/index.js';
import './style.css';

type Group = keyof typeof modules.groups;
interface ModuleEntry {
  id: string;
  group: Group;
  label: string;
}

// slot: entries — 모듈을 누르면 여는 첫 화면(블록 id). 앱이 그 화면을 켜지 않았으면 타일이 빠진다
const ENTRY: Readonly<Record<string, string>> = {
  accounting: 'erp/accounting/journal',
  tax: 'erp/tax/invoice-list',
  treasury: 'erp/treasury/daily-cash',
  purchasing: 'erp/purchasing/po-list',
  sales: 'erp/sales/orders',
  production: 'erp/production/work-orders',
  'hr-payroll': 'erp/hr-payroll/employees',
  mail: 'groupware/mail/inbox',
  approval: 'groupware/approval/inbox',
  attendance: 'groupware/attendance/my',
  calendar: 'groupware/calendar/month',
  board: 'groupware/board/notices',
  messenger: 'groupware/messenger/chat',
  'my-docs': 'ecm/my-docs/browser',
  'company-docs': 'ecm/company-docs/regulations',
  'dept-docs': 'ecm/dept-docs/shared',
  'doc-editor': 'ecm/doc-editor/editor',
  customers: 'crm/customers/list',
  opportunities: 'crm/opportunities/pipeline',
  quotes: 'crm/quotes/editor',
  support: 'crm/support/tickets',
  inventory: 'scm/inventory/stock',
  warehouse: 'scm/warehouse/receiving',
  delivery: 'scm/delivery/dispatch',
  trade: 'scm/trade/shipments',
  products: 'commerce/products/list',
  orders: 'commerce/orders/list',
  claims: 'commerce/claims/list',
  settlement: 'commerce/settlement/list',
  promotions: 'commerce/promotions/coupons',
  channels: 'commerce/channels/status',
  'shop-floor': 'mes/shop-floor/board',
  equipment: 'mes/equipment/status',
  quality: 'mes/quality/inspections',
  materials: 'mes/materials/bom',
};
// slot: entries end
// slot: favorites — 처음 즐겨찾기(회사 · 역할마다 다르다)
const DEFAULT_FAVORITES: readonly string[] = [
  'approval',
  'attendance',
  'mail',
  'tax',
  'purchasing',
  'inventory',
];
// slot: favorites end
// slot: groups — 묶음 순서(modules.json groups 키). 없는 묶음은 뒤에 붙는다
const GROUP_ORDER: readonly Group[] = ['groupware', 'erp', 'scm', 'commerce', 'mes', 'crm', 'ecm'];
// slot: groups end

const ALL = modules.modules as readonly ModuleEntry[];
const GROUPS = [
  ...GROUP_ORDER.filter((g) => g in modules.groups),
  ...(Object.keys(modules.groups) as Group[]).filter((g) => !GROUP_ORDER.includes(g)),
];

/** 한글 초성: 회계 → ㅎㄱ. 한글이 아닌 글자는 그대로 */
const INITIALS = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const initials = (s: string) =>
  Array.from(s)
    .map((ch) => {
      const c = ch.charCodeAt(0) - 0xac00;
      return c >= 0 && c <= 11171 ? INITIALS[Math.floor(c / 588)] : ch;
    })
    .join('');
const squash = (s: string) => s.replace(/[\s·]/g, '').toLowerCase();
const matches = (m: ModuleEntry, q: string) => {
  const k = squash(q);
  if (!k) return true;
  const label = squash(m.label);
  return (
    label.includes(k) ||
    initials(label).includes(k) ||
    m.id.includes(k) ||
    squash(modules.groups[m.group].label).includes(k)
  );
};

const SEARCH_ID = 'tl-block-launcher-search';

export default function ModuleLauncher() {
  const screens = useScreens();
  const { notifications } = usePlatform();
  const [q, setQ] = useState('');
  const [favorites, setFavorites] = useState<readonly string[]>(DEFAULT_FAVORITES);

  /** 앱에 첫 화면이 있는 모듈만 */
  const available = useMemo(
    () => ALL.filter((m) => ENTRY[m.id] && screens.has(ENTRY[m.id]!)),
    [screens],
  );
  const unread = (id: string) => notifications.filter((n) => n.module === id && !n.read).length;
  const shown = available.filter((m) => matches(m, q));
  const favs = favorites
    .map((id) => available.find((m) => m.id === id))
    .filter((m): m is ModuleEntry => !!m);
  const toggle = (id: string) =>
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  const open = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    screens.go(ENTRY[id]!);
  };

  // / 키: 글자를 쓰는 중이 아니면 검색 칸으로
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      document.getElementById(SEARCH_ID)?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const tile = (m: ModuleEntry) => {
    const n = unread(m.id);
    const fav = favorites.includes(m.id);
    return (
      <li key={m.id} className="tl-block-launch-tile" data-fav={fav || undefined}>
        <a
          href={screens.href(ENTRY[m.id]!)}
          className="tl-block-launch-tile__link tl-focusable"
          onClick={open(m.id)}
        >
          <ModuleIcon module={m.id} size={40} decorative />
          <span className="tl-block-launch-tile__text">
            <span className="tl-block-launch-tile__name">{m.label}</span>
            {n > 0 && <span className="tl-block-launch-tile__meta">새 알림 {n}</span>}
          </span>
        </a>
        <IconButton
          icon="star"
          size="sm"
          variant="ghost"
          pressed={fav}
          label={`${m.label} 즐겨찾기`}
          className="tl-block-launch-tile__star"
          onPress={() => toggle(m.id)}
        />
      </li>
    );
  };

  return (
    <Page
      header={
        <PageHeader
          title="전체 메뉴"
          description={`모듈 ${available.length}개 · ${GROUPS.filter((g) => available.some((m) => m.group === g)).length}묶음 · 별을 누르면 즐겨찾기에 올라갑니다`}
        />
      }
    >
      <div className="tl-block-launch-search">
        {/* 검색 칸 자체 지우기 단추(브라우저)와 Esc를 쓴다. clearable을 함께 주면 Chromium에서 지우기 단추가 둘이 된다 */}
        <Input
          id={SEARCH_ID}
          type="search"
          icon="search"
          label="모듈 검색"
          placeholder="모듈 이름 · 묶음 · 초성"
          value={q}
          onChange={setQ}
        />
        <span className="tl-block-launch-search__hint" aria-live="polite">
          {q ? `${shown.length}개 찾음` : '/ 키로 검색 칸에 갑니다'}
        </span>
      </div>

      {!q && (
        <Card title="즐겨찾기" subtitle={`${favs.length}개 · 타일의 별로 넣고 뺍니다`}>
          {favs.length ? (
            <ul className="tl-block-launch-favs">
              {favs.map((m) => (
                <li key={m.id}>
                  <a
                    href={screens.href(ENTRY[m.id]!)}
                    className="tl-block-launch-fav tl-focusable"
                    onClick={open(m.id)}
                  >
                    <ModuleIcon module={m.id} size={48} decorative />
                    <span className="tl-block-launch-fav__name">{m.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              size="sm"
              icon="star"
              title="즐겨찾기한 모듈이 없습니다"
              description="아래 모듈 타일의 별을 누르면 여기에 모입니다"
            />
          )}
        </Card>
      )}

      {shown.length ? (
        <Stack gap="lg">
          {GROUPS.map((g) => {
            const list = shown.filter((m) => m.group === g);
            if (!list.length) return null;
            return (
              <Card key={g} title={modules.groups[g].label} subtitle={`${list.length}개`} landmark>
                <ul className="tl-block-launch-grid">{list.map(tile)}</ul>
              </Card>
            );
          })}
        </Stack>
      ) : (
        <Card>
          <EmptyState
            icon="search"
            title={`'${q}'에 맞는 모듈이 없습니다`}
            description="이름 일부나 초성(ㅎㄱ)으로 찾아 보세요"
            action={<Button onPress={() => setQ('')}>검색어 지우기</Button>}
          />
        </Card>
      )}
    </Page>
  );
}
