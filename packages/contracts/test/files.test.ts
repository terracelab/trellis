// 파일 보기 · 오류 화면(PG-44)의 순수 함수와 어휘: 보는 방법 · 확대 단계 · 쪽 · PDF 주소 · EmptyState 종류
import { describe, expect, it } from 'vitest';
import {
  EMPTY_STATE_ICONS,
  EMPTY_STATE_KINDS,
  EmptyStateContract,
} from '../src/EmptyState/EmptyState.contract.js';
import {
  clampPage,
  FILE_VIEWER_KINDS,
  FILE_VIEWER_ZOOM_STEPS,
  FileViewerContract,
  fileViewerKind,
  fileViewerPdfSrc,
  nextZoom,
} from '../src/FileViewer/FileViewer.contract.js';
import { MESSAGES } from '../src/_shared/messages.js';

describe('FileViewer 보는 방법', () => {
  it('fileViewerKind: MIME이 먼저, 없으면 확장자(대소문자 무관)', () => {
    expect(fileViewerKind('검수 사진.JPG')).toBe('image');
    expect(fileViewerKind('scan.webp')).toBe('image');
    expect(fileViewerKind('도면.svg')).toBe('image');
    expect(fileViewerKind('10월 결산 보고서.pdf')).toBe('pdf');
    expect(fileViewerKind('자금 일보.xlsx')).toBe('other');
    expect(fileViewerKind('이름없음')).toBe('other');
    expect(fileViewerKind('download', 'application/pdf')).toBe('pdf');
    expect(fileViewerKind('download', 'image/png')).toBe('image');
    expect(fileViewerKind('scan.pdf', 'image/jpeg')).toBe('image');
  });

  it('contract kind 값 = FILE_VIEWER_KINDS', () => {
    expect(FileViewerContract.props.kind.values).toEqual(FILE_VIEWER_KINDS);
    expect(FileViewerContract.props.height.values).toEqual(['sm', 'md', 'lg', 'fill']);
    expect(FileViewerContract.states).toEqual(['default', 'focus', 'loading', 'error']);
  });
});

describe('FileViewer 확대 · 쪽', () => {
  it('nextZoom: 다음 단계로, 끝에서는 그대로. 맞춤 배율(단계 사이)에서는 가까운 큰 · 작은 단계', () => {
    expect(nextZoom(1, 1)).toBe(1.25);
    expect(nextZoom(1, -1)).toBe(0.75);
    expect(nextZoom(0.62, 1)).toBe(0.75);
    expect(nextZoom(0.62, -1)).toBe(0.5);
    expect(nextZoom(4, 1)).toBe(4);
    expect(nextZoom(0.25, -1)).toBe(0.25);
    expect(nextZoom(0.1, -1)).toBe(0.25);
    expect(FILE_VIEWER_ZOOM_STEPS[0]).toBe(0.25);
  });

  it('clampPage: 1 ~ pageCount, 모르면 1 이상', () => {
    expect(clampPage(0, 12)).toBe(1);
    expect(clampPage(13, 12)).toBe(12);
    expect(clampPage(3.4, 12)).toBe(3);
    expect(clampPage(40)).toBe(40);
    expect(clampPage(Number.NaN, 3)).toBe(1);
  });

  it('fileViewerPdfSrc: 원래 조각을 떼고 쪽 · 배율 · 내장 도구 줄 감춤을 붙인다', () => {
    expect(fileViewerPdfSrc('/files/a.pdf', { page: 3 })).toBe(
      '/files/a.pdf#page=3&view=FitH&toolbar=0&navpanes=0',
    );
    expect(fileViewerPdfSrc('blob:x#page=9', { page: 2, zoom: 1.25 })).toBe(
      'blob:x#page=2&zoom=125&toolbar=0&navpanes=0',
    );
  });
});

describe('EmptyState 종류(PG-44)', () => {
  it('notFound · expired가 더해지고 원래 다섯은 그대로', () => {
    expect(EMPTY_STATE_KINDS).toEqual([
      'empty',
      'noResult',
      'error',
      'forbidden',
      'offline',
      'notFound',
      'expired',
    ]);
    expect(EmptyStateContract.props.kind.values).toEqual(EMPTY_STATE_KINDS);
    expect(EMPTY_STATE_ICONS).toMatchObject({
      empty: 'inbox',
      noResult: 'search',
      error: 'circle-alert',
      forbidden: 'lock',
      offline: 'globe',
      notFound: 'map-pin-off',
      expired: 'timer-off',
    });
  });

  it('종류마다 ko · en 기본 제목 · 설명이 있다', () => {
    for (const locale of ['ko', 'en'] as const)
      for (const kind of EMPTY_STATE_KINDS) {
        const m = MESSAGES[locale] as Record<string, string>;
        expect(m[`emptyState.${kind}.title`], `${locale} ${kind}`).toBeTruthy();
        expect(m[`emptyState.${kind}.description`], `${locale} ${kind}`).toBeTruthy();
      }
  });
});
