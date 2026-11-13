import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// 2026-11-10부터 모듈 35개 전부 타일이 있다. 타일이 아직 없는 새 모듈(D-36 폴백)을 흉내 내려고 표에서 inventory를 뺀다
vi.mock('@terracelab/trellis-icons/module-tiles', async (importOriginal) => {
  const original = await importOriginal<typeof import('@terracelab/trellis-icons/module-tiles')>();
  const table: Record<string, string | undefined> = { ...original.moduleTileByModule };
  delete table.inventory;
  return { ...original, moduleTileByModule: table };
});

const { ModuleIcon } = await import('../src/ModuleIcon/ModuleIcon.js');

describe('ModuleIcon 폴백', () => {
  it('타일이 없는 모듈은 그룹 색 그라데이션과 선 아이콘으로 그린다', () => {
    render(<ModuleIcon module="inventory" size={48} />);
    const el = screen.getByRole('img', { name: '재고' });
    expect(el).toHaveAttribute('data-kind', 'fallback');
    expect(el.getAttribute('style')).toContain('var(--tl-color-module-scm-gradient-from)');
    expect(el.querySelector('svg.tl-module-icon__glyph')).not.toBeNull();
  });
});
