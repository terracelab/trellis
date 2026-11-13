// 화면 블록 목록: 모든 블록을 모듈 · 패턴으로 정렬해 보여 준다. 개발자 · 에이전트가 고르는 곳
import { Badge, Card, Input, PageHeader, Tabs } from '@terracelab/trellis-react';
import modules from '@terracelab/trellis-tokens/modules';
import { useMemo, useState } from 'react';
import { href } from '../router.js';
import { BLOCKS } from '../registry.js';

const PATTERN_LABEL: Record<string, string> = {
  NotificationHome: '알림 홈',
  Dashboard: '대시보드',
  ListDetail: '목록 · 상세',
  FormRegister: '폼 · 등록',
  ApprovalFlow: '결재',
  ConversationalWork: '대화형',
  LedgerEntry: '전표 입력',
  TaxFiling: '신고서',
  OrderDetail: '주문 상세',
  WarehouseScan: '스캔 작업',
  FloorBoard: '현장 보드',
  InventoryMatrix: '재고 매트릭스',
  Settings: '설정',
  Auth: '로그인',
  ErrorPage: '오류 화면',
};

const labelOf = (module: string) =>
  module === 'platform'
    ? '플랫폼 기본'
    : module === 'home'
      ? '홈'
      : (modules.modules.find((m) => m.id === module)?.label ?? module);

export function Catalog() {
  const [group, setGroup] = useState('all');
  const [q, setQ] = useState('');
  const groupOf = (module: string) =>
    module === 'platform' || module === 'home'
      ? module
      : (modules.modules.find((m) => m.id === module)?.group ?? 'etc');
  const tabs = useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of BLOCKS) counts.set(groupOf(b.module), (counts.get(groupOf(b.module)) ?? 0) + 1);
    const label = (g: string) =>
      g === 'platform'
        ? '플랫폼 기본'
        : g === 'home'
          ? '홈'
          : ((modules.groups as Record<string, { label: string }>)[g]?.label ?? g);
    return [
      { value: 'all', label: '전체', count: BLOCKS.length },
      ...[...counts].map(([g, n]) => ({ value: g, label: label(g), count: n })),
    ];
  }, []);
  const shown = BLOCKS.filter(
    (b) =>
      (group === 'all' || groupOf(b.module) === group) &&
      (!q || `${b.title} ${b.intent} ${labelOf(b.module)}`.includes(q)),
  );
  return (
    <div className="tl-block-page">
      <PageHeader
        title="화면 블록"
        description="미리 디자인된 화면입니다. 고객사 업무 규칙에 맞게 복사해 고쳐 씁니다"
        tabs={<Tabs label="모듈 묶음" items={tabs} value={group} onChange={setGroup} />}
      />
      <div className="tl-demo-catalog-tools">
        <Input
          type="search"
          icon="search"
          placeholder="세금계산서 · 입고 · 권한"
          value={q}
          onChange={setQ}
          clearable
        />
      </div>
      <div className="tl-demo-catalog">
        {shown.map((b) => (
          <a key={b.id} className="tl-demo-catalog__item tl-focusable" href={href(b.id)}>
            <Card
              title={b.title}
              subtitle={`${labelOf(b.module)} · ${b.id}`}
              action={<Badge tone="neutral">{PATTERN_LABEL[b.pattern] ?? b.pattern}</Badge>}
              footer={`${b.components.slice(0, 5).join(' · ')}${b.components.length > 5 ? ` 외 ${b.components.length - 5}` : ''}`}
            >
              <p className="tl-demo-catalog__intent">{b.intent}</p>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
