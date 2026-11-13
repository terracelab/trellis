// trellis/no-font-family — 글꼴은 상속받거나 --tl-font-family-* 변수로만 쓴다.
import {
  declarations,
  kebab,
  matchLoc,
  ownerName,
  styleContext,
  stringVisitors,
} from '../utils/text.js';

/** 글꼴 자리에 써도 되는 값. 식만 끼운 값(`${tokens.font.family.sans}`)은 식이 책임진다 */
const ALLOWED = /^\s*(var\(--tl-[\w-]+\)|inherit|initial|unset|revert|\0)\s*$/;

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'fontFamily · font-family · font 리터럴을 막는다. 글꼴은 상속받거나 var(--tl-font-family-*)로 쓴다',
    },
    schema: [],
    messages: {
      family:
        '글꼴 리터럴 "{{value}}". 상속받거나 var(--tl-font-family-sans) · tokens.font.family.*를 쓴다',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    return stringVisitors((node, read) => {
      const { text } = read;
      // 1) 객체 키 · JSX 속성 · style 대입 자리의 fontFamily / font-family(스타일 객체가 아니어도), font 축약은 스타일 문맥에서만
      const style = styleContext(sourceCode, node);
      const prop = kebab(style?.prop ?? ownerName(node) ?? '');
      if (prop === 'font-family' || (prop === 'font' && style)) {
        if (!ALLOWED.test(text)) {
          context.report({ node, messageId: 'family', data: { value: text.trim() } });
        }
        return;
      }
      // 2) 텍스트 속 CSS 선언 · HTML 속성(style="font-family: …" · font-family="…")
      for (const d of declarations(text)) {
        if (d.prop !== 'font-family' && d.prop !== 'font') continue;
        const value = text.slice(d.from, d.to);
        if (value.trim() === '' || ALLOWED.test(value)) continue;
        context.report({
          node,
          loc: matchLoc(sourceCode, read, d.from, value.length),
          messageId: 'family',
          data: { value: value.trim() },
        });
      }
    });
  },
};
