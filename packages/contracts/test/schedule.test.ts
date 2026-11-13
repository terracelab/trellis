// 일정 · 편집 부품(PG-42 · PG-43)의 순수 함수: 시각 읽기 · 목록, 겹친 일정 칸, 근무 막대 조각, 권한 requires, 결재선
import { describe, expect, it } from 'vitest';
import {
  approvalLineSummary,
  type ApprovalLineApprover,
} from '../src/ApprovalLine/ApprovalLine.contract.js';
import {
  endsWithApproval,
  insertApprover,
  moveApprover,
  type ApprovalLineStep,
} from '../src/ApprovalLineEditor/ApprovalLineEditor.contract.js';
import {
  calendarEventSpan,
  layoutCalendarDay,
} from '../src/MonthCalendar/MonthCalendar.contract.js';
import {
  applyPermission,
  type PermissionAction,
} from '../src/PermissionMatrix/PermissionMatrix.contract.js';
import {
  minutesToTime,
  parseTimeText,
  timeOptions,
  timeToMinutes,
} from '../src/TimeField/TimeField.contract.js';
import { workMinutes, workSegments, workTicks } from '../src/WorkTimeline/WorkTimeline.contract.js';

describe('시각 읽기(TimeField)', () => {
  it('parseTimeText: 숫자 · 콜론 · 시 분 표기', () => {
    expect(parseTimeText('9')).toBe('09:00');
    expect(parseTimeText('930')).toBe('09:30');
    expect(parseTimeText('0930')).toBe('09:30');
    expect(parseTimeText('18:5')).toBe('18:05');
    expect(parseTimeText(' 18:30 ')).toBe('18:30');
    expect(parseTimeText('9시 30분')).toBe('09:30');
    expect(parseTimeText('14시')).toBe('14:00');
    expect(parseTimeText('2400')).toBeNull();
    expect(parseTimeText('12:60')).toBeNull();
    expect(parseTimeText('abc')).toBeNull();
    expect(parseTimeText('')).toBeNull();
  });

  it('timeToMinutes · minutesToTime', () => {
    expect(timeToMinutes('09:30')).toBe(570);
    expect(timeToMinutes('24:00')).toBeNaN();
    expect(minutesToTime(570)).toBe('09:30');
    expect(minutesToTime(-5)).toBe('00:00');
    expect(minutesToTime(99999)).toBe('23:59');
  });

  it('timeOptions: min부터 step 간격, min이 간격 밖이면 다음 간격부터', () => {
    expect(timeOptions(30, '08:00', '10:00')).toEqual([
      '08:00',
      '08:30',
      '09:00',
      '09:30',
      '10:00',
    ]);
    expect(timeOptions(60, '08:10', '11:00')).toEqual(['09:00', '10:00', '11:00']);
    expect(timeOptions(30)).toHaveLength(48);
    expect(timeOptions(30, '12:00', '11:00')).toEqual([]);
  });
});

describe('시간표 칸(MonthCalendar 주 · 일 보기)', () => {
  it('calendarEventSpan: 끝이 없거나 앞이면 30분', () => {
    expect(calendarEventSpan({ start: '09:00', end: '10:30' })).toEqual([540, 630]);
    expect(calendarEventSpan({ start: '09:00' })).toEqual([540, 570]);
    expect(calendarEventSpan({ start: '09:00', end: '08:00' })).toEqual([540, 570]);
  });

  it('layoutCalendarDay: 겹치는 묶음마다 칸 수, 비는 왼쪽 칸에', () => {
    const slots = layoutCalendarDay([
      { id: 'a', start: '13:00', end: '18:00' },
      { id: 'b', start: '14:00', end: '15:00' },
      { id: 'c', start: '16:00', end: '17:00' },
      { id: 'd', start: '09:00', end: '10:00' },
      { id: 'e', start: '14:30', end: '15:30' },
      { id: 'all-day' },
    ]);
    expect(slots.get('d')).toEqual({ col: 0, cols: 1 });
    expect(slots.get('a')).toEqual({ col: 0, cols: 3 });
    expect(slots.get('b')).toEqual({ col: 1, cols: 3 });
    expect(slots.get('e')).toEqual({ col: 2, cols: 3 });
    expect(slots.get('c')).toEqual({ col: 1, cols: 3 });
    expect(slots.has('all-day')).toBe(false);
  });

  it('layoutCalendarDay: 이어 붙은 일정(끝 = 다음 시작)은 겹치지 않는다', () => {
    const slots = layoutCalendarDay([
      { id: 'a', start: '09:00', end: '10:00' },
      { id: 'b', start: '10:00', end: '11:00' },
    ]);
    expect(slots.get('a')).toEqual({ col: 0, cols: 1 });
    expect(slots.get('b')).toEqual({ col: 0, cols: 1 });
  });
});

describe('근무 막대(WorkTimeline)', () => {
  const schedule = { start: '09:00', end: '18:00', breakMinutes: 60 };

  it('workSegments: 정규 · 연장 · 근무 중', () => {
    expect(workSegments({ clockIn: '08:52', clockOut: '18:40' }, schedule)).toEqual([
      { kind: 'regular', from: '08:52', to: '18:00' },
      { kind: 'overtime', from: '18:00', to: '18:40' },
    ]);
    expect(workSegments({ clockIn: '09:10', clockOut: '17:30' }, schedule)).toEqual([
      { kind: 'regular', from: '09:10', to: '17:30' },
    ]);
    expect(workSegments({ clockIn: '08:55' }, schedule, '15:20')).toEqual([
      { kind: 'live', from: '08:55', to: '15:20' },
    ]);
    expect(workSegments({ clockIn: '19:00', clockOut: '22:00' }, schedule)).toEqual([
      { kind: 'overtime', from: '19:00', to: '22:00' },
    ]);
    expect(workSegments({}, schedule)).toEqual([]);
    expect(workSegments({ clockIn: '08:55' }, schedule)).toEqual([]);
  });

  it('workMinutes: minutes 우선, 없으면 4시간 넘으면 휴게를 뺀다', () => {
    expect(workMinutes({ clockIn: '09:00', clockOut: '18:00', minutes: 470 }, schedule)).toBe(470);
    expect(workMinutes({ clockIn: '09:00', clockOut: '18:00' }, schedule)).toBe(480);
    expect(workMinutes({ clockIn: '09:00', clockOut: '12:00' }, schedule)).toBe(180);
    expect(workMinutes({ clockIn: '09:00' }, schedule, '11:00')).toBe(120);
    expect(workMinutes({}, schedule)).toBe(0);
  });

  it('workTicks: 양 끝 + 3시간마다', () => {
    expect(workTicks('07:00', '23:00')).toEqual([
      '07:00',
      '09:00',
      '12:00',
      '15:00',
      '18:00',
      '21:00',
      '23:00',
    ]);
    expect(workTicks('06:00', '24:00')).toEqual([
      '06:00',
      '09:00',
      '12:00',
      '15:00',
      '18:00',
      '21:00',
      '24:00',
    ]);
  });
});

describe('권한 requires(PermissionMatrix)', () => {
  const actions: PermissionAction[] = [
    { id: 'read', label: '조회' },
    { id: 'update', label: '수정', requires: ['read'] },
    { id: 'approve', label: '승인', requires: ['update'] },
  ];

  it('켜면 requires를 이어서 켜고, 열 순서로 둔다', () => {
    expect(applyPermission({}, actions, 'sales', 'approve', true)).toEqual({
      sales: ['read', 'update', 'approve'],
    });
  });

  it('끄면 그 동작을 requires로 둔 동작도 끈다(다른 대상은 그대로)', () => {
    const value = { sales: ['read', 'update', 'approve'], hr: ['read'] };
    expect(applyPermission(value, actions, 'sales', 'read', false)).toEqual({
      sales: [],
      hr: ['read'],
    });
    expect(applyPermission(value, actions, 'sales', 'approve', false)).toEqual({
      sales: ['read', 'update'],
      hr: ['read'],
    });
    // 원래 값은 바뀌지 않는다
    expect(value.sales).toEqual(['read', 'update', 'approve']);
  });
});

describe('결재선', () => {
  const line: ApprovalLineApprover[] = [
    { id: 'a', name: '김하늘', title: '대리', state: 'draft' },
    { id: 'b', name: '정민호', title: '팀장', state: 'approved' },
    { id: 'c', name: '박서연', title: '선임', role: '합의', state: 'pending' },
    { id: 'd', name: '한결', title: '대표', state: 'waiting' },
  ];

  it('approvalLineSummary: 진행 칸 → 반려 · 회수 → 마지막 처리 칸', () => {
    expect(approvalLineSummary(line)).toEqual({
      index: 3,
      total: 4,
      role: '합의',
      state: 'pending',
    });
    expect(
      approvalLineSummary([
        line[0]!,
        { ...line[1]!, state: 'rejected' },
        { ...line[2]!, state: 'waiting' },
      ]),
    ).toEqual({ index: 2, total: 3, role: '검토', state: 'rejected' });
    expect(approvalLineSummary([line[0]!, line[1]!])).toEqual({
      index: 2,
      total: 2,
      role: '승인',
      state: 'approved',
    });
    expect(approvalLineSummary([])).toBeNull();
  });

  it('insertApprover: 마지막 승인 칸 앞에 검토로, 이미 있으면 그대로', () => {
    const steps: ApprovalLineStep[] = [
      { person: 'e1', role: '검토' },
      { person: 'e3', role: '승인' },
    ];
    expect(insertApprover(steps, 'e2')).toEqual([
      { person: 'e1', role: '검토' },
      { person: 'e2', role: '검토' },
      { person: 'e3', role: '승인' },
    ]);
    expect(insertApprover([{ person: 'e1', role: '합의' }], 'e2')).toEqual([
      { person: 'e1', role: '합의' },
      { person: 'e2', role: '검토' },
    ]);
    expect(insertApprover(steps, 'e1')).toEqual(steps);
  });

  it('moveApprover · endsWithApproval', () => {
    const steps: ApprovalLineStep[] = [
      { person: 'e1', role: '검토' },
      { person: 'e2', role: '합의' },
      { person: 'e3', role: '승인' },
    ];
    expect(moveApprover(steps, 0, 1).map((s) => s.person)).toEqual(['e2', 'e1', 'e3']);
    expect(moveApprover(steps, 0, -1)).toEqual(steps);
    expect(moveApprover(steps, 2, 1)).toEqual(steps);
    expect(endsWithApproval(steps)).toBe(true);
    expect(endsWithApproval(moveApprover(steps, 2, -1))).toBe(false);
    expect(endsWithApproval([])).toBe(false);
  });
});
