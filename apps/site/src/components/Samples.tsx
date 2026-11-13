// 홈의 작은 견본들. 실제 컴포넌트이고 눌러 볼 수 있다(페이지에서 client:visible로 켠다).
import {
  Badge,
  Button,
  Checkbox,
  Input,
  RunSteps,
  SegmentedControl,
  Switch,
  type RunStepWeb,
} from '@terracelab/trellis-react';
import { useState } from 'react';

/** 컴포넌트 칸: 배지 · 선택 · 버튼 · 검색 */
export function ComponentSamples() {
  return (
    <div className="tl-site-samples">
      <div className="tl-site-samples-row">
        <Badge approval="pending" />
        <Badge approval="approved" />
        <Checkbox defaultChecked>메일 발송</Checkbox>
        <Switch defaultChecked>자동 발행</Switch>
      </div>
      <div className="tl-site-samples-row" data-fill>
        <Button size="lg">임시 저장</Button>
        <Button size="lg" variant="primary">
          결재 요청
        </Button>
      </div>
      <Input type="search" icon="search" label="검색" placeholder="거래처 · 품목 · 문서 번호" />
    </div>
  );
}

const STEPS: RunStepWeb[] = [
  {
    id: 'read',
    name: '동봉 문서 읽기',
    description: 'llms.txt · manifest.json',
    state: 'succeeded',
    durationMs: 820,
  },
  {
    id: 'pick',
    name: '블록 고르기',
    description: 'erp/tax/invoice-list',
    state: 'succeeded',
    durationMs: 410,
  },
  {
    id: 'copy',
    name: '블록 복사',
    description: 'pnpm ds:add',
    state: 'succeeded',
    durationMs: 1900,
  },
  {
    id: 'fill',
    name: '칸 채우기',
    description: 'columns · filters',
    state: 'running',
    durationMs: 2600,
  },
];

/** 에이전트 칸: 요청 한 줄과 그 뒤에 실행되는 단계 */
export function AgentSample() {
  return (
    <div className="tl-site-agent">
      <p className="tl-site-agent-ask">세금계산서 목록 화면 만들어 줘</p>
      <RunSteps steps={STEPS} label="에이전트 실행 단계" />
    </div>
  );
}

const ROWS = [
  ['TI-2611-0012', '(주)한빛무역', '12,400,000'],
  ['TI-2611-0013', '대양상사', '3,150,000'],
  ['TI-2611-0014', '누리식품', '874,500'],
] as const;

/** 밀도 견본: 같은 표를 compact · comfortable · touch로 바꿔 본다 */
export function DensitySample() {
  const [density, setDensity] = useState('compact');
  return (
    <div className="tl-site-density">
      <SegmentedControl
        label="밀도"
        size="sm"
        value={density}
        onChange={setDensity}
        options={[
          { value: 'compact', label: 'compact' },
          { value: 'comfortable', label: 'comfortable' },
          { value: 'touch', label: 'touch' },
        ]}
      />
      <table className="tl-site-mini-table" data-density={density}>
        <caption className="tl-site-sr">
          밀도에 따라 줄 높이가 바뀌는 세금계산서 표(단위: 원)
        </caption>
        <thead>
          <tr>
            <th scope="col">문서 번호</th>
            <th scope="col">거래처</th>
            <th scope="col" data-align="right">
              공급가액
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(([no, vendor, amount]) => (
            <tr key={no}>
              <td>{no}</td>
              <td>{vendor}</td>
              <td data-align="right">{amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
