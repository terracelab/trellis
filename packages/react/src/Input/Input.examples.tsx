import { Input } from './Input.js';

/** 검색 · 단위 · 오류 — 숫자는 오른쪽 정렬 */
export function Kinds() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-8)',
        maxWidth: 'calc(var(--tl-space-64) * 5)',
      }}
    >
      <Input
        type="search"
        icon="search"
        label="검색"
        placeholder="거래처 · 품목 · 문서 번호"
        clearable
        defaultValue="한빛"
      />
      <Input align="right" suffix="EA" label="수량" inputMode="numeric" defaultValue="1,240" />
      <Input invalid label="사업자등록번호" defaultValue="123-45-678" />
      <Input disabled label="문서 번호" defaultValue="자동 채번" />
    </div>
  );
}

/** 코드 입력 — 품목 코드 · 계좌번호처럼 글자 수를 맞춰 보는 값은 고정폭(mono) */
export function Mono() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-8)',
        maxWidth: 'calc(var(--tl-space-64) * 5)',
      }}
    >
      <Input mono label="품목 코드" defaultValue="FD-2611-0042" />
      <Input mono label="계좌번호" inputMode="numeric" defaultValue="110-482-118204" />
    </div>
  );
}
