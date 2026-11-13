// 문구 도우미. 데이터에서 온 이름(창고 · 거래처 · 사람)에 조사를 붙일 때 쓴다(PR-11).
// 이름이 회사마다 바뀌므로 '평택 냉동센터로' 같은 조사를 코드에 고정하지 않는다.

type Pair = '은/는' | '이/가' | '을/를' | '과/와' | '으로/로';

/** 끝 글자 받침: 0 없음, 그 밖은 종성 번호(ㄹ = 8). 숫자는 읽는 소리(일 · 삼 · 칠 …), 영문은 대강 */
function finalConsonant(word: string): number {
  const s = word.replace(/[\s)\]}>"'’”.,·]+$/u, '');
  const ch = s.at(-1);
  if (!ch) return 0;
  const code = ch.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28;
  // 영 일 이 삼 사 오 육 칠 팔 구
  const digits = [21, 8, 0, 16, 0, 0, 1, 8, 8, 0];
  if (/[0-9]/.test(ch)) return digits[Number(ch)]!;
  if (/[lr]/i.test(ch)) return 8;
  if (/[mnk]/i.test(ch)) return 4;
  return 0;
}

/**
 * 이름 뒤에 맞는 조사를 붙인다
 * @example josa('이천 1센터', '은/는') → '이천 1센터는' · josa('평택 냉동센터', '으로/로') → '평택 냉동센터로'
 */
export function josa(word: string, pair: Pair): string {
  const [withFinal, without] = pair.split('/') as [string, string];
  const f = finalConsonant(word);
  if (pair === '으로/로') return word + (f === 0 || f === 8 ? without : withFinal);
  return word + (f === 0 ? without : withFinal);
}
