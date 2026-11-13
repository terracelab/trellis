import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fontsCss } from '../sd/formats/css.mjs';
import { PKG } from './helpers';

const FONTS = join(PKG, 'fonts');

describe('fonts', () => {
  it('CHECKSUMS와 파일 해시가 같다', () => {
    const lines = readFileSync(join(FONTS, 'CHECKSUMS'), 'utf8').trim().split('\n');
    expect(lines.map((l) => l.split(/\s+/)[1])).toEqual([
      'PretendardVariable.woff2',
      'LICENSE-OFL.txt',
    ]);
    for (const line of lines) {
      const [hash, file] = line.split(/\s+/);
      const actual = createHash('sha256')
        .update(readFileSync(join(FONTS, file!)))
        .digest('hex');
      expect(actual, file).toBe(hash);
    }
  });

  it('woff2는 1.5~2.5MB이고 OFL 라이선스가 함께 있다', () => {
    const size = statSync(join(FONTS, 'PretendardVariable.woff2')).size;
    expect(size).toBeGreaterThan(1.5e6);
    expect(size).toBeLessThan(2.5e6);
    expect(readFileSync(join(FONTS, 'LICENSE-OFL.txt'), 'utf8')).toContain(
      'SIL Open Font License, Version 1.1',
    );
  });

  it('fonts.css의 url()이 dist/css 기준으로 실제 파일을 가리킨다', () => {
    const css = fontsCss({
      native: { primitive: [{ path: ['font', 'family', 'sans'], $value: 'Pretendard Variable' }] },
    });
    const url = /url\("([^"]+)"\)/.exec(css)?.[1];
    expect(url).toBeDefined();
    expect(existsSync(resolve(join(PKG, 'dist/css'), url!))).toBe(true);
    expect(css).toContain('font-display: swap');
    expect(css).toContain('font-weight: 100 900');
    expect(dirname(url!)).toBe('../../fonts');
  });
});
