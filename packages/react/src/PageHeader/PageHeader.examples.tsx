import { Badge } from '../Badge/Badge.js';
import { Button } from '../Button/Button.js';
import { PageHeader } from './PageHeader.js';
import { Tabs } from '../Tabs/Tabs.js';

/** 목록 화면 — 위치 · 이름 · 동작 */
export function List() {
  return (
    <PageHeader
      breadcrumbs={[{ label: '세무' }, { label: '세금계산서' }]}
      title="매출 세금계산서"
      description="발행 · 국세청 전송 · 취소를 한 곳에서 처리합니다"
      actions={
        <>
          <Button icon="download">엑셀 다운로드</Button>
          <Button variant="primary" icon="plus">
            발행
          </Button>
        </>
      }
    />
  );
}

/** 상세 화면 — 뒤로 · 상태 */
export function Detail() {
  return (
    <PageHeader
      onBack={() => undefined}
      title="PO-2611-0042"
      meta={<Badge tone="info">입고 예정</Badge>}
      description="대양상사 · USD 48,200.00 · 2026-11-06 발주"
      actions={<Button variant="primary">입고 처리</Button>}
    />
  );
}

/** 제목 줄 탭 — 지금 화면은 h1, 같은 묶음 다른 화면은 한 단계 작게 나란히(사이 구분선, 가리키면 밑줄, D-141). meta는 설명 줄로 내려가고, 휴대폰은 한 줄 가로 스크롤(PR-27 · PR-38) */
export function Siblings() {
  return (
    <PageHeader
      title="연차 · 근태"
      siblings={[
        { label: '직원 · 외주', href: '#people' },
        { label: '급여', href: '#payroll' },
        { label: '연차 · 근태', href: '#leave', current: true },
        { label: '문서함', href: '#docs' },
      ]}
      onSiblingPress={() => undefined}
      description="11월 6일(금) 기준 · 테라스랩"
      meta={<Badge tone="warning">승인 대기 2건</Badge>}
      actions={<Button icon="upload">연차 사용 내역 올리기</Button>}
      tabs={
        <Tabs
          items={[
            { value: 'own', label: '휴가 보유 현황' },
            { value: 'used', label: '휴가 사용 내역' },
            { value: 'month', label: '월별 연차 사용' },
            { value: 'promo', label: '연차 촉진' },
          ]}
          value="month"
        />
      }
    />
  );
}
