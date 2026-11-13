// 상대 시각 · 알림 날짜 묶음(PR-32, content.md §4)
import { describe, expect, it } from 'vitest';
import { formatRelativeTime, relativeDayGroup } from '../src/_shared/format.js';

// 2026-11-06은 금요일. 시각은 현지 시각(시간대와 관계없이 같은 결과)
const NOW = '2026-11-06T09:00:00';

describe('formatRelativeTime', () => {
  it('1분 안 방금 · 분 · 시간 · 7일까지 일, 그 뒤는 날짜', () => {
    expect(formatRelativeTime('2026-11-06T08:59:30', NOW)).toBe('방금');
    expect(formatRelativeTime('2026-11-06T08:56:00', NOW)).toBe('4분 전');
    expect(formatRelativeTime('2026-11-06T06:10:00', NOW)).toBe('2시간 전');
    expect(formatRelativeTime('2026-11-03T09:00:00', NOW)).toBe('3일 전');
    expect(formatRelativeTime('2026-10-30T09:00:00', NOW)).toBe('7일 전');
    expect(formatRelativeTime('2026-10-28T15:30:00', NOW)).toBe('10월 28일');
    expect(formatRelativeTime('2025-12-30T10:00:00', NOW)).toBe('2025-12-30');
  });

  it('앞날(시계 차이)은 방금, 읽을 수 없으면 –, 영문', () => {
    expect(formatRelativeTime('2026-11-06T09:05:00', NOW)).toBe('방금');
    expect(formatRelativeTime('어제', NOW)).toBe('–');
    expect(formatRelativeTime('2026-11-06T08:56:00', NOW, 'en')).toBe('4 min ago');
    expect(formatRelativeTime('2026-11-06T06:10:00', NOW, 'en')).toBe('2 h ago');
    expect(formatRelativeTime('2026-10-28T15:30:00', NOW, 'en')).toBe('Oct 28');
  });

  it('UTC(Z) 시각도 같은 순간으로 센다', () => {
    const utc = new Date(new Date(NOW).getTime() - 4 * 60_000).toISOString();
    expect(utc.endsWith('Z')).toBe(true);
    expect(formatRelativeTime(utc, NOW)).toBe('4분 전');
  });
});

describe('relativeDayGroup', () => {
  it('오늘 · 어제 · 이번 주(월요일 시작) · 이전', () => {
    expect(relativeDayGroup('2026-11-06T00:10:00', NOW)).toBe('today');
    expect(relativeDayGroup('2026-11-05T23:50:00', NOW)).toBe('yesterday');
    expect(relativeDayGroup('2026-11-02T10:00:00', NOW)).toBe('thisWeek'); // 월요일
    expect(relativeDayGroup('2026-11-01T10:00:00', NOW)).toBe('earlier'); // 지난 일요일
    expect(relativeDayGroup('2026-10-28', NOW)).toBe('earlier');
  });

  it('월요일의 어제(일요일)는 어제, 그 앞은 이전', () => {
    const monday = '2026-11-09T09:00:00';
    expect(relativeDayGroup('2026-11-08T09:00:00', monday)).toBe('yesterday');
    expect(relativeDayGroup('2026-11-07T09:00:00', monday)).toBe('earlier');
  });
});
