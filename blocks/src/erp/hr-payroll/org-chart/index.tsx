// 조직도(ListDetail): 회사 → 팀 트리(조직장 · 인원) → 고른 조직의 구성원(직급 · 오늘 근무 상태).
// 넓은 화면(1600 이상)은 구성원을 트리 옆에, 그보다 좁으면 트리 아래에 둔다(트리가 가로로 잘리지 않게).
// 조직도는 누구나 보고, 인사기록카드 링크는 데이터 범위(Role.scope) 안의 사람에게만 단다.
import { formatDate } from '@terracelab/trellis-contracts';
import {
  Button,
  Card,
  DescriptionList,
  OrgChart,
  PageHeader,
  PersonLabel,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import { membersOf, metaOf, ORG_CHART, ORG_ROOT_ID, orgName, PRESENCE } from '../../../_data/hr.js';
import { TODAY } from '../../../_data/index.js';
import { useScope, useScreens } from '../../../_platform/index.js';
import { Page, useSiblings, type SiblingScreen } from '../../../_ui/index.js';
import './style.css';

const ID = 'erp/hr-payroll/org-chart';
const MASTER = 'erp/hr-payroll/hr-master';
const teams = ORG_CHART[0]?.children ?? [];

// slot: siblings — 제목 줄 탭(같은 묶음 화면). 라벨은 그 화면의 PageHeader title과 같게. 앱에 없는 화면은 빠진다
const SIBLINGS: readonly SiblingScreen[] = [
  { id: 'erp/hr-payroll/employees', label: '인사 기록' },
  { id: MASTER, label: '인사 마스터' },
  { id: ID, label: '조직도' },
];
// slot: siblings end

export default function OrgChartScreen() {
  const screens = useScreens();
  const { canSee } = useScope();
  const titleTabs = useSiblings(ID, SIBLINGS);
  const [selected, setSelected] = useState<string>(teams[0]?.id ?? ORG_ROOT_ID);
  const members = membersOf(selected);
  const onLeave = members.filter((e) => e.status === 'leave').length;
  const away = members.filter((e) => PRESENCE[e.id] && PRESENCE[e.id] !== 'working').length;
  const head = members[0];
  const total = ORG_CHART[0]?.headcount ?? 0;

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: '인사·급여' }, { label: '조직도' }]}
          title="조직도"
          {...titleTabs}
          description={`${orgName(ORG_ROOT_ID)} · ${teams.length}개 팀 · ${total}명 · ${formatDate(TODAY, 'md')} 기준`}
          actions={<Button icon="printer">조직도 인쇄</Button>}
        />
      }
    >
      <div className="tl-block-org">
        {/* slot: tree — 조직 트리(회사 → 본부 · 팀). 서비스는 조직 API로 바꾼다 */}
        <Card padding="none">
          <div className="tl-block-org__tree">
            <OrgChart nodes={ORG_CHART} selected={selected} onSelect={setSelected} label="조직도" />
          </div>
        </Card>
        {/* slot: tree end */}
        {/* slot: members — 고른 조직의 구성원 카드(조직장 · 자리 비움 · 사람 목록과 카드 링크) */}
        <Card
          title={`${orgName(selected)} 구성원`}
          subtitle={`${members.length}명${onLeave ? ` · 휴직 ${onLeave}명` : ''}`}
        >
          <div className="tl-block-org__side">
            <DescriptionList
              columns={2}
              layout="vertical"
              items={[
                { label: '조직장', value: head ? `${head.name} ${head.title}` : '–' },
                { label: '오늘 자리 비움', value: `${away}명` },
              ]}
            />
            <ul className="tl-block-org__members">
              {members.map((e) => (
                <li key={e.id}>
                  <PersonLabel
                    name={e.name}
                    meta={e.status === 'leave' ? `${metaOf(e)} · 휴직` : metaOf(e)}
                    {...(PRESENCE[e.id] ? { presence: PRESENCE[e.id] } : {})}
                    {...(screens.has(MASTER) && canSee({ name: e.name, department: e.department })
                      ? { href: screens.href(MASTER, { id: e.id }) }
                      : {})}
                  />
                </li>
              ))}
            </ul>
          </div>
        </Card>
        {/* slot: members end */}
      </div>
    </Page>
  );
}
