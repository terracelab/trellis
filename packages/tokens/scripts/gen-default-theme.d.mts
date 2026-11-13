export const FILES: Record<'primitive' | 'light' | 'dark' | 'hcLight' | 'hcDark', string>;
/** 파일 경로 → 생성할 내용 */
export function generate(): Record<string, string>;
