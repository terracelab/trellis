// trellis/no-raw-color — 색은 --tl-color-* 변수(semantic)로만 쓴다.
import {
  declarations,
  kebab,
  matchLoc,
  ownerName,
  styleContext,
  stringVisitors,
} from '../utils/text.js';

/** hex 색. `&#123;`(HTML 엔티티) · `url(#id)`(SVG 참조) · `##`는 제외 */
const HEX =
  /(?<![&\w#])(?<!url\(\s*['"]?)#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g;
/** 색 함수 */
const FUNC = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/gi;

/** 값이 #으로 시작해도 색이 아닌 자리(앵커 · id 참조) */
const ANCHOR_NAMES = new Set(['href', 'to', 'id', 'htmlFor', 'hash', 'xlinkHref', 'xlink:href']);

/** 색을 받는 CSS 속성(kebab) */
const COLOR_PROP =
  /^(color|background(-color|-image)?|border(-(top|right|bottom|left|block|inline)(-(start|end))?)?(-color)?|outline(-color)?|fill|stroke|stop-color|flood-color|lighting-color|caret-color|accent-color|text-decoration(-color)?|column-rule(-color)?|box-shadow|text-shadow|text-emphasis-color|scrollbar-color)$/;

/** CSS 색 이름(transparent · currentColor 제외) */
export const NAMED_COLORS = new Set(
  (
    'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown ' +
    'burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan ' +
    'darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid ' +
    'darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet ' +
    'deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ' +
    'ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki ' +
    'lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow ' +
    'lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray ' +
    'lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine ' +
    'mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen ' +
    'mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace ' +
    'olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred ' +
    'papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue ' +
    'saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey ' +
    'snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow ' +
    'yellowgreen'
  ).split(' '),
);

/** var(…) · url(…) 안은 이름이 아니다. 같은 길이의 공백으로 바꿔 위치를 지킨다 */
function stripRefs(value) {
  let out = value;
  let prev;
  do {
    prev = out;
    out = out.replace(/(var|url|env)\([^()]*\)/gi, (m) => ' '.repeat(m.length));
  } while (out !== prev);
  return out;
}

function namedColorIn(value) {
  for (const m of stripRefs(value).matchAll(/[a-zA-Z]+/g)) {
    if (NAMED_COLORS.has(m[0].toLowerCase())) return { word: m[0], index: m.index };
  }
  return null;
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        '컴포넌트 · 블록 · 앱 코드의 hex · rgb() · hsl() · 색 이름 리터럴을 막는다. 색은 semantic --tl-color-* 변수로 쓴다',
    },
    schema: [],
    messages: {
      raw: '토큰 밖 색 "{{value}}". semantic 색 변수(var(--tl-color-…) 또는 tokens.color.…)를 쓴다',
      named: '토큰 밖 색 이름 "{{value}}". semantic 색 변수(var(--tl-color-…))를 쓴다',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    return stringVisitors((node, read) => {
      const { text } = read;
      const owner = ownerName(node);
      if (!ANCHOR_NAMES.has(owner ?? '')) {
        for (const m of text.matchAll(HEX))
          context.report({
            node,
            loc: matchLoc(sourceCode, read, m.index, m[0].length),
            messageId: 'raw',
            data: { value: m[0] },
          });
      }
      for (const m of text.matchAll(FUNC))
        context.report({
          node,
          loc: matchLoc(sourceCode, read, m.index, m[0].length),
          messageId: 'raw',
          data: { value: m[0] },
        });

      // 색 이름: 색 속성 자리에서만(객체 키 · JSX 속성 · style 대입) 또는 텍스트 속 CSS 선언
      const style = styleContext(sourceCode, node);
      const prop = style?.prop ?? owner;
      if (prop && COLOR_PROP.test(kebab(prop))) {
        const hit = namedColorIn(text);
        if (hit) {
          context.report({
            node,
            loc: matchLoc(sourceCode, read, hit.index, hit.word.length),
            messageId: 'named',
            data: { value: hit.word },
          });
          return;
        }
      }
      for (const d of declarations(text)) {
        if (!COLOR_PROP.test(d.prop)) continue;
        const hit = namedColorIn(text.slice(d.from, d.to));
        if (hit)
          context.report({
            node,
            loc: matchLoc(sourceCode, read, d.from + hit.index, hit.word.length),
            messageId: 'named',
            data: { value: hit.word },
          });
      }
    });
  },
};
