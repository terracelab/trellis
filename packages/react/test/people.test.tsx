// HR 사람 컴포넌트(PR-27): PersonLabel · ProfileHeader · OrgChart · HrRecord
import {
  HrRecordContract,
  maskAccount,
  OrgChartContract,
  PersonLabelContract,
  ProfileHeaderContract,
  serviceLength,
  type HrMasterRecord,
  type OrgChartNode,
} from '@terracelab/trellis-contracts';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HrRecord, OrgChart, PersonLabel, ProfileHeader } from '../src/core/index.js';

describe('hr 어휘 계산', () => {
  it('serviceLength: 만 년 · 개월, 날짜가 덜 차면 한 달 빼기, 앞날이면 0', () => {
    expect(serviceLength('2022-03-02', '2026-11-06')).toEqual({ years: 4, months: 8 });
    expect(serviceLength('2022-03-10', '2026-11-06')).toEqual({ years: 4, months: 7 });
    expect(serviceLength('2026-11-02', '2026-11-06')).toEqual({ years: 0, months: 0 });
    expect(serviceLength('2027-01-01', '2026-11-06')).toEqual({ years: 0, months: 0 });
  });

  it('maskAccount: 끝 네 자리만, 하이픈은 그대로', () => {
    expect(maskAccount('482-21-0193-847')).toBe('●●●-●●-●●●3-847');
    expect(maskAccount('1234')).toBe('1234');
  });
});

describe('contract parity', () => {
  it('displayName === contract.name', () => {
    expect(PersonLabel.displayName).toBe(PersonLabelContract.name);
    expect(ProfileHeader.displayName).toBe(ProfileHeaderContract.name);
    expect(OrgChart.displayName).toBe(OrgChartContract.name);
    expect(HrRecord.displayName).toBe(HrRecordContract.name);
  });
});

describe('PersonLabel', () => {
  it('이름 · 보조 글자 · 근무 상태 글자, 아바타는 꾸밈', () => {
    const { container } = render(
      <PersonLabel name="한서연" meta="인사팀 · 매니저" presence="remote" testID="p" />,
    );
    const root = screen.getByTestId('p');
    expect(root).toHaveClass('tl-person-label');
    expect(root).toHaveAttribute('data-size', 'md');
    expect(root).toHaveTextContent('한서연');
    expect(root).toHaveTextContent('인사팀 · 매니저');
    expect(root).toHaveTextContent('재택');
    expect(container.querySelector('.tl-avatar')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('href = 링크, onPress = 단추, 둘 다 없으면 글자', () => {
    const onPress = vi.fn();
    const { rerender } = render(<PersonLabel name="정민호" meta="책임" href="#e-31" />);
    expect(screen.getByRole('link', { name: /정민호/ })).toHaveAttribute('href', '#e-31');
    rerender(<PersonLabel name="정민호" size="sm" onPress={onPress} />);
    fireEvent.click(screen.getByRole('button', { name: /정민호/ }));
    expect(onPress).toHaveBeenCalledTimes(1);
    rerender(<PersonLabel name="정민호" />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });
});

describe('ProfileHeader', () => {
  it('이름 제목 · 재직 상태 · 소속 줄 · 요약(근속 계산)', () => {
    render(
      <ProfileHeader
        name="한서연"
        nameEn="Seoyeon Han"
        department="인사팀"
        role="파트장"
        position="매니저"
        grade="매니저"
        status="active"
        employeeNo="E-0012"
        hireDate="2022-03-02"
        employmentType="regular"
        today="2026-11-06"
        facts={[{ label: '복직 예정일', value: '2027-02-01' }]}
        headingLevel={1}
      />,
    );
    expect(screen.getByRole('heading', { level: 1, name: '한서연' })).toBeInTheDocument();
    expect(screen.getByText('Seoyeon Han')).toBeInTheDocument();
    expect(screen.getByText('재직')).toBeInTheDocument();
    // 직급이 직위와 같으면 한 번만
    expect(screen.getByText('인사팀 · 파트장 · 매니저')).toBeInTheDocument();
    const term = (label: string) => screen.getByText(label, { selector: 'dt' }).nextSibling;
    expect(term('사번')).toHaveTextContent('E-0012');
    expect(term('입사일')).toHaveTextContent('2022-03-02');
    expect(term('근속')).toHaveTextContent('4년 8개월');
    expect(term('고용 형태')).toHaveTextContent('정규직');
    expect(term('복직 예정일')).toHaveTextContent('2027-02-01');
  });

  it('근속이 1년 안이면 개월만, 딱 떨어지면 년만', () => {
    const { rerender } = render(
      <ProfileHeader name="서다은" hireDate="2026-06-01" today="2026-11-06" />,
    );
    expect(screen.getByText('5개월')).toBeInTheDocument();
    rerender(<ProfileHeader name="서다은" hireDate="2023-11-06" today="2026-11-06" />);
    expect(screen.getByText('3년')).toBeInTheDocument();
  });
});

const ORG: OrgChartNode[] = [
  {
    id: 'root',
    name: '테라트레이딩',
    head: { name: '이도윤', title: '대표' },
    headcount: 42,
    children: [
      {
        id: 'ops',
        name: '경영지원본부',
        headcount: 9,
        children: [
          { id: 'fin', name: '재무팀', headcount: 4 },
          { id: 'hr', name: '인사팀', headcount: 3 },
        ],
      },
      { id: 'sales', name: '영업본부', headcount: 18 },
    ],
  },
];

describe('OrgChart', () => {
  it('ARIA tree: 단계 · 펼침 · 이름은 보이는 글자 전체(조직 · 조직장 · 인원)', () => {
    render(<OrgChart nodes={ORG} />);
    const tree = screen.getByRole('tree', { name: '조직도' });
    const items = within(tree).getAllByRole('treeitem');
    expect(items).toHaveLength(5);
    const root = screen.getByRole('treeitem', { name: /^테라트레이딩/ });
    expect(root).toHaveAttribute('aria-level', '1');
    expect(root).toHaveAttribute('aria-expanded', 'true');
    expect(root).toHaveAccessibleName(/테라트레이딩.*이도윤.*42명/);
    expect(screen.getByRole('treeitem', { name: /^재무팀/ })).toHaveAttribute('aria-level', '3');
    expect(screen.getByRole('treeitem', { name: /^영업본부/ })).not.toHaveAttribute(
      'aria-expanded',
    );
    // Tab 정지는 하나
    expect(items.filter((i) => i.tabIndex === 0)).toHaveLength(1);
  });

  it('키보드: ↓ 다음 · ← 접기 · → 펼치기 · Enter 고르기', () => {
    const onSelect = vi.fn();
    render(<OrgChart nodes={ORG} onSelect={onSelect} />);
    const root = screen.getByRole('treeitem', { name: /^테라트레이딩/ });
    root.focus();
    fireEvent.keyDown(root, { key: 'ArrowDown' });
    const ops = screen.getByRole('treeitem', { name: /^경영지원본부/ });
    expect(ops).toHaveFocus();
    fireEvent.keyDown(ops, { key: 'ArrowLeft' });
    expect(ops).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('treeitem', { name: /^재무팀/ })).toBeNull();
    fireEvent.keyDown(ops, { key: 'ArrowDown' });
    expect(screen.getByRole('treeitem', { name: /^영업본부/ })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('treeitem', { name: /^영업본부/ }), { key: 'Enter' });
    expect(onSelect).toHaveBeenLastCalledWith('sales');
    expect(screen.getByRole('treeitem', { name: /^영업본부/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    fireEvent.keyDown(screen.getByRole('treeitem', { name: /^영업본부/ }), { key: 'ArrowUp' });
    fireEvent.keyDown(ops, { key: 'ArrowRight' });
    expect(screen.getByRole('treeitem', { name: /^재무팀/ })).toBeInTheDocument();
  });

  it('동그라미는 펼침만 바꾸고 고르지 않는다, defaultExpanded로 처음 펼침', () => {
    const onSelect = vi.fn();
    const onExpandedChange = vi.fn();
    const { container } = render(
      <OrgChart
        nodes={ORG}
        defaultExpanded={['root']}
        onSelect={onSelect}
        onExpandedChange={onExpandedChange}
      />,
    );
    expect(screen.queryByRole('treeitem', { name: /^재무팀/ })).toBeNull();
    const ops = screen.getByRole('treeitem', { name: /^경영지원본부/ });
    fireEvent.click(ops.querySelector('.tl-org-chart__toggle')!);
    expect(onExpandedChange).toHaveBeenLastCalledWith(['root', 'ops']);
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole('treeitem', { name: /^재무팀/ })).toBeInTheDocument();
    fireEvent.click(container.querySelector('.tl-org-chart__node')!);
    expect(onSelect).toHaveBeenLastCalledWith('root');
  });
});

const RECORD: HrMasterRecord = {
  personal: {
    name: '한서연',
    rrn: '9204152345678',
    birthDate: '1992-04-15',
    birthCalendar: 'lunar',
    gender: 'female',
    emergencyContact: { name: '한도윤', relation: '부', phone: '010-2231-7780' },
  },
  employment: {
    employeeNo: 'E-0012',
    department: '인사팀',
    employmentType: 'regular',
    hireDate: '2022-03-02',
  },
  pay: { payType: 'annual', bankAccount: { bank: '국민은행', number: '482-21-0193-847' } },
  appointments: [
    { date: '2022-03-02', kind: 'hire', detail: '경력 입사' },
    { date: '2024-01-01', kind: 'promotion', detail: '매니저 승진' },
  ],
};

describe('HrRecord', () => {
  it('가린 정보: 기본은 주민등록번호 뒷자리 · 계좌를 가리고 단추로 연다', () => {
    const onRevealChange = vi.fn();
    const { rerender } = render(
      <HrRecord record={RECORD} today="2026-11-06" onRevealChange={onRevealChange} />,
    );
    expect(screen.getByRole('group', { name: '인사기록카드' })).toBeInTheDocument();
    expect(screen.getByText('920415-2●●●●●●')).toBeInTheDocument();
    expect(screen.getByText('국민은행 ●●●-●●-●●●3-847')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '가린 정보 보기' }));
    expect(onRevealChange).toHaveBeenCalledWith(true);
    rerender(
      <HrRecord record={RECORD} today="2026-11-06" revealed onRevealChange={onRevealChange} />,
    );
    expect(screen.getByText('920415-2345678')).toBeInTheDocument();
    expect(screen.getByText('국민은행 482-21-0193-847')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 가리기' })).toBeInTheDocument();
  });

  it('onRevealChange가 없으면 단추가 없다', () => {
    render(<HrRecord record={RECORD} today="2026-11-06" />);
    expect(screen.queryByRole('button', { name: '가린 정보 보기' })).toBeNull();
  });

  it('값 서식: 음력 생일 · 비상연락처 · 근속 · 빈 항목 · 발령은 최근 것이 위', () => {
    render(<HrRecord record={RECORD} today="2026-11-06" />);
    expect(screen.getByText('1992-04-15(음력)')).toBeInTheDocument();
    expect(screen.getByText('한도윤(부) 010-2231-7780')).toBeInTheDocument();
    expect(screen.getByText('4년 8개월')).toBeInTheDocument();
    const military = screen.getByRole('heading', { name: '병역' }).parentElement!;
    expect(military).toHaveTextContent('등록된 내용이 없습니다');
    const table = screen.getByRole('table', { name: '인사 발령' });
    const rows = within(table).getAllByRole('row');
    expect(rows[1]).toHaveTextContent('2024-01-01승진매니저 승진');
    expect(rows[2]).toHaveTextContent('2022-03-02입사경력 입사');
  });

  it('항목 링크: 누르면 그 제목으로 포커스, sections로 항목 · 순서를 고른다', () => {
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    render(
      <HrRecord record={RECORD} today="2026-11-06" sections={['employment', 'appointments']} />,
    );
    const nav = screen.getByRole('navigation', { name: '인사기록카드 항목' });
    const links = within(nav).getAllByRole('link');
    expect(links.map((l) => l.textContent)).toEqual(['재직 정보', '인사 발령']);
    fireEvent.click(links[1]!);
    expect(screen.getByRole('heading', { name: '인사 발령' })).toHaveFocus();
    expect(scroll).toHaveBeenCalled();
    expect(screen.queryByRole('heading', { name: '인적 사항' })).toBeNull();
  });
});
