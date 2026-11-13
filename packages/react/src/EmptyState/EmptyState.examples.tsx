import { Button } from '../Button/Button.js';
import { EmptyState } from './EmptyState.js';

/** 빈 목록 — 무엇이 없는지와 다음 행동 */
export function Default() {
  return (
    <EmptyState
      icon="file-text"
      title="이번 달 전표가 없습니다"
      description="전표 입력에서 추가하세요"
      action={
        <Button variant="primary" icon="plus">
          전표 입력
        </Button>
      }
    />
  );
}

/** 검색 결과 없음 — 표 · 작은 카드 안은 sm */
export function Search() {
  return (
    <EmptyState
      size="sm"
      icon="search"
      title="조건에 맞는 거래처가 없습니다"
      description="검색어나 거래 상태 필터를 바꿔 보세요"
    />
  );
}

/** 일곱 종류 — 종류마다 기본 아이콘 · 제목 · 설명이 있다 */
export function Kinds() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(calc(var(--tl-space-64) * 3), 1fr))',
        gap: 'var(--tl-space-16)',
      }}
    >
      <EmptyState size="sm" kind="empty" />
      <EmptyState size="sm" kind="noResult" />
      <EmptyState size="sm" kind="error" />
      <EmptyState size="sm" kind="forbidden" />
      <EmptyState size="sm" kind="offline" />
      <EmptyState size="sm" kind="notFound" />
      <EmptyState size="sm" kind="expired" />
    </div>
  );
}

/** 불러오기 실패 — 다시 시도 단추와 요청 ID 한 줄. role="alert"로 읽힌다 */
export function ErrorWithRequest() {
  return (
    <EmptyState
      kind="error"
      title="거래처 목록을 불러오지 못했습니다"
      description="잠시 뒤 다시 시도하세요"
      requestId="req-8f2a41c9"
      action={
        <Button variant="secondary" icon="refresh-cw">
          다시 시도
        </Button>
      }
    />
  );
}

/** 전체 화면 오류 — 주소 없음 · 권한 없음 · 로그인 만료 화면 블록은 headingLevel 1과 동작 둘까지로 영역 가운데에 세운다 */
export function FullPage() {
  return (
    <EmptyState
      kind="forbidden"
      headingLevel={1}
      title="이 화면을 볼 권한이 없습니다"
      description="권한이 필요하면 관리자에게 요청하세요. 요청 ID를 함께 알려 주세요"
      requestId="req-2611-4f0c"
      action={
        <>
          <Button variant="primary" icon="arrow-left">
            이전 화면
          </Button>
          <Button icon="house">홈으로</Button>
        </>
      }
    />
  );
}
