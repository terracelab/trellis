// 날짜 도우미(PR-11). 블록은 '2026-11-01' · '11월' 같은 날짜를 코드에 쓰지 않고 TODAY에서 계산한다.
// 샘플 데이터를 바꿔 끼우면(다른 TODAY) 기본 기간 · 달 이름이 함께 바뀐다. 날짜는 ISO(YYYY-MM-DD), 시간대 없이 UTC로 계산한다.

const DAY = 86_400_000;
const iso = (d: Date) => d.toISOString().slice(0, 10);
const ymd = (date: string) =>
  [Number(date.slice(0, 4)), Number(date.slice(5, 7)), Number(date.slice(8, 10))] as const;

/** n일 뒤(음수면 앞) */
export const addDays = (date: string, n: number) => iso(new Date(Date.parse(date) + n * DAY));

/** n달 뒤 그 달 1일(음수면 앞) */
export const monthStart = (date: string, n = 0) => {
  const [y, m] = ymd(date);
  return iso(new Date(Date.UTC(y, m - 1 + n, 1)));
};

/** n달 뒤 그 달 말일 */
export const monthEnd = (date: string, n = 0) => {
  const [y, m] = ymd(date);
  return iso(new Date(Date.UTC(y, m + n, 0)));
};

/** 달 이름(11월). n달 뒤 */
export const monthLabel = (date: string, n = 0) => `${Number(monthStart(date, n).slice(5, 7))}월`;

/** 문서 번호의 연월(2611) */
export const yymm = (date: string) => `${date.slice(2, 4)}${date.slice(5, 7)}`;

/** 그 주 월요일 */
export const weekStart = (date: string) => {
  const day = new Date(Date.parse(date)).getUTCDay();
  return addDays(date, -((day + 6) % 7));
};
