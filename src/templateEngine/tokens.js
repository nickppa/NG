// Vash tokens, but have been modified:
// https://github.com/kirbysayshi/vash/blob/master/lib/tokens.js
// remove complex tokens

var TESTS = [
    'AT_AT', (/^(@@)/)
    , 'AT_SKIP', (/^(@!)/)
    , 'AT_BLOCK_DEFINE', (/^(@\[[_$a-zA-Z0-9\xA0-\uFFFF]+(,(\s)?[_$a-zA-Z0-9\xA0-\uFFFF]+)?\]\{)/)
    , 'AT_BLOCK', (/^(@\[ ?[_$a-zA-Z0-9\xA0-\uFFFF]+\])/)
    , 'AT_TEXT_BLOCK_OPEN', (/^(@\:\{)/)
    , 'AT_TEXT_BLOCK_CLOSE', (/^(@\:\})/)
    , 'AT_TEXT', (/^(@\:)/)
    , 'AT_EXPRESSION', (/^(@\()/)
    , 'AT_EXPRESSION_BLOCK', (/^(@\{)/)
    , 'AT', (/^(@)/)
  
    , 'PAREN_OPEN', (/^(\()/)
    , 'PAREN_CLOSE', (/^(\))/)
  
    , 'BRACE_OPEN', (/^(\{)/)
    , 'BRACE_CLOSE', (/^(\})/)
  
    , 'HTML_TAG_VOID_CLOSE', (/^(\/>)/)
    , 'HTML_TAG_CLOSE', (/^(<\/)/)
    , 'LT_SIGN', (/^(<)/)
    , 'GT_SIGN', (/^(>)/)
  
    , 'PERIOD', (/^(\.)/)
    , 'NEWLINE', function(){
      var token = this.scan(/^(\n)/, exports.NEWLINE);
      if(token){
        this.lineno++;
        this.charno = 0;
      }
      return token;
    }
    , 'WHITESPACE', (/^([^\S\n]+)/) // http://stackoverflow.com/a/3469155
    , 'IDENTIFIER', (/^([_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*)/)
  
    , 'BACKSLASH', (/^(\\)/)
    , 'DOUBLE_QUOTE', (/^(\")/)
    , 'SINGLE_QUOTE', (/^(\')/)
    , 'ES6_QUOTE', (/^(`)/)
  
    , 'NUMERAL', (/^([0-9])/)
    , 'CONTENT', (/^([^\s])/)
  ];
  
  exports.tests = TESTS;
  
  // Export all the tokens as constants.
  for(var i = 0; i < TESTS.length; i += 2) {
    exports[TESTS[i]] = TESTS[i];
  }