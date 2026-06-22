import type { Token } from './types';

type TokenScanner = (this: any) => Token | undefined;
type TokenTest = RegExp | TokenScanner;
type TokensExport = {
  tests: Array<string | TokenTest>;
  [key: string]: any;
};

const tokenDefs: string[] = [
  'AT_AT',
  'AT_SKIP',
  'AT_BLOCK_DEFINE',
  'AT_BLOCK',
  'AT_TEXT_BLOCK_OPEN',
  'AT_TEXT_BLOCK_CLOSE',
  'AT_TEXT',
  'AT_EXPRESSION',
  'AT_EXPRESSION_BLOCK',
  'AT',
  'PAREN_OPEN',
  'PAREN_CLOSE',
  'BRACE_OPEN',
  'BRACE_CLOSE',
  'HTML_TAG_VOID_CLOSE',
  'HTML_TAG_CLOSE',
  'LT_SIGN',
  'GT_SIGN',
  'PERIOD',
  'NEWLINE',
  'WHITESPACE',
  'IDENTIFIER',
  'DOUBLE_FORWARD_SLASH',
  'FORWARD_SLASH',
  'BACKSLASH',
  'DOUBLE_QUOTE',
  'SINGLE_QUOTE',
  'ES6_QUOTE',
  'NUMERAL',
  'CONTENT'
];

const tokensExport: TokensExport = {
  tests: []
};

const tests: Array<string | TokenTest> = [
  'AT_AT', /^(@@)/,
  'AT_SKIP', /^(@!)/,
  'AT_BLOCK_DEFINE', /^(@\[[_$a-zA-Z0-9\xA0-\uFFFF]+(,(\s)?[_$a-zA-Z0-9\xA0-\uFFFF]+)?\]\{)/,
  'AT_BLOCK', /^(@\[ ?[_$a-zA-Z0-9\xA0-\uFFFF]+\])/,
  'AT_TEXT_BLOCK_OPEN', /^(@\:\{)/,
  'AT_TEXT_BLOCK_CLOSE', /^(@\:\})/,
  'AT_TEXT', /^(@\:)/,
  'AT_EXPRESSION', /^(@\()/,
  'AT_EXPRESSION_BLOCK', /^(@\{)/,
  'AT', /^(@)/,
  'PAREN_OPEN', /^(\()/,
  'PAREN_CLOSE', /^(\))/,
  'BRACE_OPEN', /^(\{)/,
  'BRACE_CLOSE', /^(\})/,
  'HTML_TAG_VOID_CLOSE', /^(\/>)/,
  'HTML_TAG_CLOSE', /^(<\/)/,
  'LT_SIGN', /^(<)/,
  'GT_SIGN', /^(>)/,
  'PERIOD', /^(\.)/,
  'NEWLINE', function (this: any) {
    const token = this.scan(/^(\n)/, tokensExport.NEWLINE);
    if (token) {
      this.lineno++;
      this.charno = 0;
    }
    return token;
  },
  'WHITESPACE', /^([^\S\n]+)/,
  'IDENTIFIER', /^([_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*)/,
  'DOUBLE_FORWARD_SLASH', /^(\/\/)/,
  'FORWARD_SLASH', /^(\/)/,
  'BACKSLASH', /^(\\)/,
  'DOUBLE_QUOTE', /^(\")/,
  'SINGLE_QUOTE', /^(\')/,
  'ES6_QUOTE', /^(`)/,
  'NUMERAL', /^([0-9])/,
  'CONTENT', /^([^\s])/
];

tokensExport.tests = tests;
for (const name of tokenDefs) {
  tokensExport[name] = name;
}

export = tokensExport;
