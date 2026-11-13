import { ModuleIcon } from './ModuleIcon.js';

/** 일러스트 타일 — 타일이 있는 모듈은 일러스트를 그린다 */
export function Tiles() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-12)' }}>
      <ModuleIcon module="accounting" />
      <ModuleIcon module="approval" />
      <ModuleIcon module="purchasing" />
      <ModuleIcon module="mail" />
    </div>
  );
}

/** 생성형 폴백 — 타일이 없는 모듈은 그룹 색 그라데이션과 라인 아이콘 */
export function Fallback() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-12)' }}>
      <ModuleIcon module="tax" />
      <ModuleIcon module="inventory" />
      <ModuleIcon module="orders" />
      <ModuleIcon module="equipment" />
    </div>
  );
}

/** 크기 — 즐겨찾기 32 · 알림 카드 40 · 런처 48 */
export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-12)', alignItems: 'end' }}>
      <ModuleIcon module="warehouse" size={32} />
      <ModuleIcon module="warehouse" size={40} />
      <ModuleIcon module="warehouse" size={48} />
    </div>
  );
}
