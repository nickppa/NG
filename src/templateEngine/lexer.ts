import tokens = require('./tokens');
import type { Token } from './types';

class VLexer {
  input: string;
  originalInput: string;
  lineno: number;
  charno: number;

  constructor() {
    this.input = '';
    this.originalInput = '';
    this.lineno = 1;
    this.charno = 0;
  }

  write(input: string): boolean {
    let normalized = input.replace(/\r\n|\r/g, '\n');

    if (this.originalInput.length === 0) {
      normalized = normalized.replace(/^\uFEFF/, '');
    }

    this.input += normalized;
    this.originalInput += normalized;
    return true;
  }

  read(): Token[] {
    const out: Token[] = [];
    while (this.input.length) {
      const result = this.advance();
      if (result) {
        out.push(result);
      }
    }
    return out;
  }

  scan(regexp: RegExp, type: string): Token | undefined {
    const captures = regexp.exec(this.input);
    if (!captures) {
      return undefined;
    }

    this.input = this.input.substr(captures[1].length);

    const token: Token = {
      type,
      line: this.lineno,
      chr: this.charno,
      val: captures[1] || '',
      toString: function () {
        return '[' + this.type
          + ' (' + this.line + ',' + this.chr + '): '
          + this.val.replace(/(\n)/, '\\n') + ']';
      }
    };

    this.charno += captures[0].length;
    return token;
  }

  advance(): Token | undefined {
    for (let i = 0; i < tokens.tests.length; i += 2) {
      const tokenName = tokens.tests[i] as string;
      const test = tokens.tests[i + 1] as any;
      (test as any).displayName = tokenName;

      if (typeof test === 'function') {
        const result = test.call(this) as Token | undefined;
        if (result) {
          return result;
        }
      }

      if (typeof test.exec === 'function') {
        const result = this.scan(test as RegExp, tokenName);
        if (result) {
          return result;
        }
      }
    }

    return undefined;
  }
}

export = VLexer;
