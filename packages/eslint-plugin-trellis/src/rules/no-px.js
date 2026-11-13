// trellis/no-px — 치수는 --tl-space-* · --tl-size-* · --tl-density-* 변수로만 쓴다. CSS 파일은 stylelint가 본다.
import {
  HOLE,
  declarations,
  isStyleObject,
  keyName,
  matchLoc,
  styleContext,
  stringVisitors,
} from '../utils/text.js';

/** 0이 아닌 px 리터럴 */
const PX = /(?<![\w.])-?(\d*\.?\d+)px(?![\w-])/g;

/** 미디어 쿼리 문자열(matchMedia · @media). CSS 변수를 못 쓰는 자리라 breakpoint 값을 끼운다 */
const MEDIA = /@media\b|\(\s*(?:(?:min|max)-)?(?:width|height)\s*(?:[<>]=?|:)/;

/** React가 px을 붙이지 않는 숫자 속성(react-dom isUnitlessNumber) */
const UNITLESS = new Set([
  'animationIterationCount',
  'aspectRatio',
  'borderImageOutset',
  'borderImageSlice',
  'borderImageWidth',
  'boxFlex',
  'boxFlexGroup',
  'boxOrdinalGroup',
  'columnCount',
  'columns',
  'flex',
  'flexGrow',
  'flexPositive',
  'flexShrink',
  'flexNegative',
  'flexOrder',
  'fontWeight',
  'gridArea',
  'gridRow',
  'gridRowEnd',
  'gridRowSpan',
  'gridRowStart',
  'gridColumn',
  'gridColumnEnd',
  'gridColumnSpan',
  'gridColumnStart',
  'lineClamp',
  'lineHeight',
  'opacity',
  'order',
  'orphans',
  'scale',
  'tabSize',
  'widows',
  'zIndex',
  'zoom',
  'fillOpacity',
  'floodOpacity',
  'stopOpacity',
  'strokeDasharray',
  'strokeDashoffset',
  'strokeMiterlimit',
  'strokeOpacity',
  'strokeWidth',
  'shadowOpacity',
  'elevation',
]);

/** 텍스트 전체가 CSS 값 하나인가('16px' · '0 4px' · 'calc(100% - 8px)' · 'w-[16px]'). 문장 · URL · 선언은 아니다 */
function isCssValue(text) {
  const t = text.trim();
  return t.length > 0 && /^[\x20-\x7e\0]*$/.test(t) && !/[:;{}<>=&?!'"`]/.test(t) && !/^\(/.test(t);
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        '스타일 값 · 스타일 템플릿의 0 아닌 px 리터럴과 style 객체의 치수 숫자를 막는다. 치수는 --tl-* 변수로 쓴다',
    },
    schema: [],
    messages: {
      px: '토큰 밖 치수 "{{value}}". --tl-space-* · --tl-size-* · --tl-density-* 같은 변수를 쓴다',
      media:
        '미디어 쿼리의 raw px "{{value}}". primitives.breakpoint.*(@terracelab/trellis-tokens)를 끼워 쓴다',
      number:
        'style의 {{prop}}: {{value}}는 px로 그려진다. --tl-space-* 같은 변수(문자열)나 tokens 값을 쓴다',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    return {
      ...stringVisitors((node, read) => {
        const { text } = read;
        if (!text.includes('px')) return;
        const hits = [...text.matchAll(PX)].filter((m) => Number(m[1]) !== 0);
        if (hits.length === 0) return;
        const strong = styleContext(sourceCode, node) !== null;
        const value = isCssValue(text.split(HOLE).join('0'));
        const decls = declarations(text);
        const media = MEDIA.test(text);
        for (const m of hits) {
          const inDecl = decls.some((d) => m.index >= d.from && m.index < d.to);
          if (!media && !strong && !value && !inDecl) continue;
          context.report({
            node,
            loc: matchLoc(sourceCode, read, m.index, m[0].length),
            messageId: media ? 'media' : 'px',
            data: { value: m[0] },
          });
        }
      }),
      Property(node) {
        if (node.parent?.type !== 'ObjectExpression') return;
        const prop = keyName(node.key, node.computed);
        if (!prop || prop.startsWith('--') || UNITLESS.has(prop)) return;
        let v = node.value;
        let sign = '';
        if (v.type === 'UnaryExpression' && (v.operator === '-' || v.operator === '+')) {
          sign = v.operator === '-' ? '-' : '';
          v = v.argument;
        }
        if (v.type !== 'Literal' || typeof v.value !== 'number' || v.value === 0) return;
        if (!isStyleObject(sourceCode, node.parent)) return;
        context.report({
          node: node.value,
          messageId: 'number',
          data: { prop, value: `${sign}${v.raw}` },
        });
      },
    };
  },
};
