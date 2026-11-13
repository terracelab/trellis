import { useState } from 'react';
import { Button } from '../Button/Button.js';
import { Card } from '../Card/Card.js';
import { Input } from '../Input/Input.js';
import { MultiSelect } from '../MultiSelect/MultiSelect.js';
import { Select } from '../Select/Select.js';
import { FilterBar } from './FilterBar.js';

const STATUS_OPTIONS = [
  { value: 'all', label: '전체 상태' },
  { value: 'scheduled', label: '입고 예정' },
  { value: 'inspecting', label: '검수 중' },
  { value: 'received', label: '입고 완료' },
];

const WAREHOUSE_OPTIONS = [
  { value: 'all', label: '전체 창고' },
  { value: 'icheon', label: '이천 1센터' },
  { value: 'busan', label: '부산 신항 보세창고' },
];

/** 입고 목록 위 — Card 첫 줄에 붙여 표와 한 덩어리로. 검색 · 필터 · 초기화 · 건수 · 동작 */
export function ReceivingList() {
  return (
    <Card padding="none">
      <FilterBar
        search={
          <Input
            type="search"
            icon="search"
            placeholder="거래처 · 품목 · 입고 번호"
            aria-label="입고 검색"
          />
        }
        onReset={() => {}}
        resultCount={128}
        actions={
          <Button icon="download" variant="ghost">
            엑셀 다운로드
          </Button>
        }
      >
        <Select options={STATUS_OPTIONS} defaultValue="all" width="auto" label="입고 상태" />
        <Select options={WAREHOUSE_OPTIONS} defaultValue="all" width="auto" label="창고" />
      </FilterBar>
      <div style={{ padding: 'var(--tl-density-card-padding)' }}>DataGrid가 여기에 온다</div>
    </Card>
  );
}

const CHANNEL_OPTIONS = [
  { value: 'all', label: '전체 채널' },
  { value: 'web', label: '웹 주문' },
  { value: 'phone', label: '전화 주문' },
];

/** 조회 화면 — 라벨 열 + 입력 칸 격자, 조건을 고른 뒤 검색(layout="grid"). 접으면 적용한 조건을 칩으로 요약한다 */
export function LookupGrid() {
  return (
    <FilterBar
      layout="grid"
      collapsible
      search={
        <Input
          type="search"
          icon="search"
          placeholder="주문 번호 · 거래처 · 전화 뒷자리"
          aria-label="검색어"
        />
      }
      onReset={() => {}}
      onSearch={() => {}}
      resultCount={2954}
      actions={
        <Button icon="download" variant="ghost">
          엑셀 다운로드
        </Button>
      }
    >
      <Select options={STATUS_OPTIONS} defaultValue="all" label="입고 상태" />
      <Select options={WAREHOUSE_OPTIONS} defaultValue="all" label="창고" />
      <Select options={CHANNEL_OPTIONS} defaultValue="all" label="채널" />
      <Select options={STATUS_OPTIONS.slice(0, 2)} defaultValue="all" label="담당" />
    </FilterBar>
  );
}

/** 칩 해제 — 기본값이 아닌 칩에 해제 단추가 서고, 누르면 그 컨트롤이 기본값으로 돌아간다 */
export function AppliedFilters() {
  const [status, setStatus] = useState<string | null>('inspecting');
  const [channels, setChannels] = useState<string[]>(['web', 'phone']);
  const [warehouse, setWarehouse] = useState<string | null>('all');
  const active = [status !== 'all', channels.length > 0, warehouse !== 'all'].filter(
    Boolean,
  ).length;
  return (
    <FilterBar
      search={
        <Input
          type="search"
          icon="search"
          placeholder="주문 번호 · 거래처"
          aria-label="주문 검색"
        />
      }
      activeCount={active}
      resultCount={42}
      onReset={() => {
        setStatus('all');
        setChannels([]);
        setWarehouse('all');
      }}
    >
      <Select
        options={STATUS_OPTIONS}
        value={status}
        onChange={setStatus}
        width="auto"
        label="입고 상태"
      />
      <MultiSelect
        options={CHANNEL_OPTIONS.slice(1)}
        value={channels}
        onChange={setChannels}
        width="auto"
        label="채널"
      />
      <Select
        options={WAREHOUSE_OPTIONS}
        value={warehouse}
        onChange={setWarehouse}
        width="auto"
        label="창고"
      />
    </FilterBar>
  );
}
