// 계열이 색 슬롯(series-1~5)보다 많을 때 "기타"로 접는다(PG-40). 색을 새로 만들지 않는다(dataviz: 9번째 색은 없다).
// 앞 다섯 계열은 자기 색을 지키고, 나머지는 행마다 더해 compare(회색) 한 계열이 된다.
// 회색 "기타"는 series-5(amber) 옆에 놓일 때 색각 이상 시뮬레이션 ΔE 15.4 이상이다(series-4 teal 옆은 3.0으로 탈락).
import type { SeriesDef } from './_shared.js';

/** 색 슬롯 수(color.chart.series.1~5) */
export const MAX_CHART_SERIES = 5;
/** 접은 계열의 data 필드 이름 */
export const OTHER_SERIES_KEY = '__other';

export interface FoldedSeries<T> {
  /** 접은 행(원래 필드 + OTHER_SERIES_KEY). 접을 것이 없으면 받은 data 그대로 */
  data: readonly (T & Record<string, unknown>)[];
  /** 그릴 계열(앞 max개 + 기타 하나) */
  series: SeriesDef[];
  /** 기타로 접힌 계열(표 대체에는 이것까지 모두 보인다) */
  folded: SeriesDef[];
}

/**
 * series가 max개를 넘으면 앞 max개를 남기고 나머지를 label 한 계열로 접는다.
 * 어떤 계열을 앞에 둘지(큰 순서 등)는 호출자가 정한다. 색은 항목에 고정한다(순위로 다시 칠하지 않는다).
 */
export function foldSeries<T extends object>(
  data: readonly T[],
  series: readonly SeriesDef[],
  { label, max = MAX_CHART_SERIES }: { label: string; max?: number },
): FoldedSeries<T> {
  if (series.length <= max)
    return { data: data as FoldedSeries<T>['data'], series: [...series], folded: [] };
  const kept = series.slice(0, max);
  const folded = series.slice(max);
  const rows = data.map((row) => {
    const r = row as Record<string, unknown>;
    let sum = 0;
    let any = false;
    for (const s of folded) {
      const v = r[s.key];
      if (typeof v === 'number' && Number.isFinite(v)) {
        sum += v;
        any = true;
      }
    }
    return { ...row, [OTHER_SERIES_KEY]: any ? sum : null } as T & Record<string, unknown>;
  });
  const type = folded[0]?.type;
  return {
    data: rows,
    series: [
      ...kept,
      { key: OTHER_SERIES_KEY, label, color: 'compare', ...(type ? { type } : {}) },
    ],
    folded,
  };
}
