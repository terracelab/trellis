// 샘플 고유명사 모으기(PR-11). 블록 코드는 샘플 회사(테라트레이딩)의 이름을 직접 쓰지 않는다.
// 회사 · 창고 · 상품 · 사람 이름은 _data · _platform/mock.ts에만 있고, 블록은 데이터에서 읽는다.
// 다른 회사가 데이터 파일만 바꿔 끼우면 화면 문구가 함께 바뀌어야 하기 때문이다.
//
// 모으는 것
//   사람: "이름 직함"(김테라 팀장) · emp('u02', 'T1403', '김테라', '팀장', …) 꼴의 세 글자 이름
//   이름 칸: 아래 ENTITIES에 적은 export 안의 이름 키 값(거래처 · 품목 · 창고 · 공장 · 상품 · 배송지 …)
// 이름 칸 값은 통째로 찾고, 세 글자 넘는 한글 낱말(흰다리새우 · 냉동센터)과 지명 앞말(평택 · 이천)도 따로 찾는다.
// 일반 업무 말(보세창고 · 포장재 …)은 GENERIC에 두어 걸리지 않게 한다.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const TITLES = [
  '사원',
  '주임',
  '대리',
  '과장',
  '차장',
  '부장',
  '팀장',
  '이사',
  '대표',
  '대표이사',
  '실장',
  '반장',
  '기사',
  '본부장',
  '상무',
  '전무',
  '센터장',
  '공장장',
  '선임',
  '책임',
  '수석',
];

/**
 * export 이름 → 값을 모을 키. 이 export의 본문(다음 export 전까지)에서만 찾는다.
 * 키가 없으면 본문의 문자열 전부. place면 여러 낱말 이름의 두 글자 첫 낱말(평택 · 이천)도 지명으로 찾는다
 */
const ENTITIES = {
  'trade.ts': {
    PARTIES: ['name', 'manager'],
    ITEMS: ['name'],
    WAREHOUSES: { keys: ['name'], place: true },
  },
  'erp.ts': {
    EMPLOYEES: ['name'],
    REPACK_PRODUCTS: ['name'],
    PACK_MATERIALS: ['name'],
    BANK_ACCOUNTS: ['bank'],
  },
  'mes-delivery.ts': {
    PLANT: { keys: ['name'], place: true },
    MES_PEOPLE: ['head', 'line1', 'line2', 'maint', 'qc'],
    PRODUCTS: ['name'],
    MATERIALS: ['name'],
    EQUIPMENT: ['name', 'model'],
    CONSIGNEES: { keys: ['name'], place: true },
    TRUCKS: ['driver', 'plate'],
  },
  'commerce.ts': {
    PRODUCTS: ['name'],
    CARRIERS: [],
  },
  'ecm-crm.ts': {
    STAFF: ['name'],
    SALES_REPS: [],
    CUSTOMERS: ['name'],
  },
  'groupware.ts': {
    ROOMS: ['name'],
  },
  'hr.ts': {
    ONBOARDING: ['name'],
  },
  'profile.ts': {
    PROFILE: ['name', 'shortName', 'mallName'],
  },
  'franchise.ts': {
    FRANCHISE: ['brand'],
    STORES: ['name'],
  },
  'mock.ts': {
    COMPANY: ['name', 'ceo'],
    USERS: ['name'],
  },
};

/** 이름에 들어 있어도 업무 일반 말이라 블록에 써도 되는 낱말 */
const GENERIC = new Set([
  '보세창고',
  '물류센터',
  '포장재',
  '소모품',
  '아이스팩',
  '부자재',
  '완제품',
  '반제품',
  '원재료',
  '파렛트',
  '테이프',
  '스트레치',
  '라벨지',
  '박스테이프',
  '검출기',
  '금속검출기',
  '포장기',
  '진공포장기',
  '라벨러',
  '중량선별기',
  '지게차',
  '냉동창고',
  '냉장창고',
  '상온창고',
  '회의실',
  '대회의실',
  '소회의실',
  '접견실',
  '본사',
  '주식회사',
]);

/** 영문 이름(Pacific Seafoods)에서 걸러 낼 일반 낱말 */
const GENERIC_LATIN = new Set([
  'Company',
  'Limited',
  'Trading',
  'Corporation',
  'International',
  'Global',
  'Group',
  'Foods',
  'Industries',
  'Packaging',
  'Marine',
]);

const HANGUL = /[가-힣]/;
const LATIN_NAME = /^[A-Z][a-z]{4,}$/;
const strings = (src) => [...src.matchAll(/'([^'\\\n]*)'|`([^`\\]*)`/g)].map((m) => m[1] ?? m[2]);

/** export const NAME … 의 본문(다음 최상위 export 전까지) */
function region(src, name) {
  const start = src.search(new RegExp(`^export const ${name}\\b`, 'm'));
  if (start < 0) return '';
  const rest = src.slice(start + 1);
  const next = rest.search(/^export /m);
  return next < 0 ? rest : rest.slice(0, next);
}

function valuesOf(body, keys) {
  if (!keys.length) return strings(body);
  const out = [];
  for (const key of keys)
    for (const m of body.matchAll(new RegExp(`\\b${key}:\\s*'([^'\\n]+)'`, 'g'))) out.push(m[1]);
  return out;
}

function personNames(src) {
  const t = TITLES.join('|');
  const out = new Set();
  // "김테라 팀장" · emp(…, '김테라', '팀장', …)
  for (const m of src.matchAll(
    new RegExp(`(?<![가-힣])([가-힣]{3})(?: |',\\s*')(?:${t})(?![가-힣])`, 'g'),
  ))
    if (!/(팀|부|실|과|소|장)$/.test(m[1])) out.add(m[1]);
  return out;
}

/**
 * 샘플 데이터의 고유명사. 키 = 찾을 말, 값 = 어디서 왔는지
 * @param {string} src blocks/src 경로
 */
export function sampleNouns(src) {
  const files = [
    ...readdirSync(join(src, '_data'))
      .filter((f) => f.endsWith('.ts'))
      .map((f) => [f, join(src, '_data', f)]),
    ['mock.ts', join(src, '_platform', 'mock.ts')],
  ];
  const nouns = new Map();
  const add = (word, from) => {
    const w = word.trim();
    if (w.length < 2 || !HANGUL.test(w) || GENERIC.has(w) || TITLES.includes(w)) return;
    if (!nouns.has(w)) nouns.set(w, from);
  };
  /** 영문 이름의 고유 낱말(대문자로 시작하는 다섯 글자 이상) */
  const addLatin = (word, from) => {
    if (LATIN_NAME.test(word) && !GENERIC_LATIN.has(word) && !nouns.has(word))
      nouns.set(word, from);
  };
  for (const [name, path] of files) {
    const code = readFileSync(path, 'utf8');
    for (const p of personNames(code)) add(p, `${name} 사람`);
    for (const [exp, spec] of Object.entries(ENTITIES[name] ?? {})) {
      const { keys, place = false } = Array.isArray(spec) ? { keys: spec } : spec;
      for (const raw of valuesOf(region(code, exp), keys)) {
        const value = raw.replace(new RegExp(` (?:${TITLES.join('|')})$`), '');
        const from = `${name} ${exp}`;
        if (!HANGUL.test(value)) {
          for (const w of value.split(/[\s,.()&/-]+/)) addLatin(w, from);
          continue;
        }
        // 통째로(평택 냉동센터 · 대양상사 · 김테라)
        add(value.replace(/\s+/g, ' '), from);
        const words = value.split(/[\s·,()/\-~+]+/).filter(Boolean);
        // 지명 앞말: 여러 낱말 이름의 첫 두 글자 한글 낱말(평택 · 이천 · 부산)
        if (place && words.length > 1 && /^[가-힣]{2}$/.test(words[0]))
          add(words[0], `${from} 지명`);
        // 세 글자 넘는 한글 낱말(흰다리새우 · 냉동센터 · 올리브오일)
        for (const w of words) {
          const hangul = w.replace(/[^가-힣]/g, '');
          if (hangul.length >= 4 && hangul === w) add(w, from);
        }
      }
    }
  }
  return nouns;
}

/** 블록 코드에서 문자열 · JSX 글자만 남기고 주석을 뺀 뒤 공백을 하나로 */
export function visibleText(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:'"`])\/\/.*$/gm, '$1')
    .replace(/\s+/g, ' ');
}

/**
 * 찾은 말: 앞이 한글이 아니고, 두 글자 말은 뒤도 한글이 아니거나 조사일 때만.
 * 영문 낱말은 앞뒤가 영문자가 아닐 때만
 */
export function findNouns(text, nouns) {
  const hits = [];
  for (const [word, from] of nouns) {
    const esc = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let re;
    if (!HANGUL.test(word)) re = new RegExp(`(?<![A-Za-z])${esc}(?![A-Za-z])`);
    else {
      const tail =
        word.length <= 2
          ? '(?![가-힣])|(?=(?:에서|으로|로|에|의|과|와|은|는|을|를)(?![가-힣]))'
          : '';
      re = new RegExp(`(?<![가-힣])${esc}${tail ? `(?:${tail})` : ''}`);
    }
    if (re.test(text)) hits.push(`${word}(${from})`);
  }
  return hits;
}
