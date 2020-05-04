require('chai').should();
const templateEngine = require('../src/templateEngine');
const file = require('../src/utils/file');
const path = require('path');
file.config = { root: 'tests' };

templateEngine.config = {root: path.join(process.cwd(), 'tests')};

describe("templateEngine", function () {
    describe("preCompile", function () {
        it('should work', function () {
            'aa'.should.equal('aa');
        });

        it('should work weel', async function () {
            let text = await file.readFile('test1');
            let tokens = templateEngine.preCompile(text);
            tokens.length.should.equal(3);
            tokens[0].text.should.equal('aaa');
            tokens[1].text.should.equal('model');
            tokens[2].text.should.equal('sss');
        });

        it('should also work weel', function () {
            let tokens = templateEngine.preCompile('aaa@(model)sss');
            tokens.length.should.equal(3);
            tokens[0].text.should.equal('aaa');
            tokens[1].text.should.equal('model');
            tokens[2].text.should.equal('sss');
        });

        it('should work weel will have () in text and code', function () {
            let tokens = templateEngine.preCompile('aa()a@(mod()el)ss()s');
            tokens.length.should.equal(3);
            tokens[0].text.should.equal('aa()a');
            tokens[1].text.should.equal('mod()el');
            tokens[2].text.should.equal('ss()s');
        });

        it('should work weel will have white space in text and code', function () {
            let tokens = templateEngine.preCompile('aa a@(model)sss');
            tokens.length.should.equal(3);
            tokens[0].text.should.equal('aa a');
            tokens[1].text.should.equal('model');
            tokens[2].text.should.equal('sss');
        });

        it('should work weel will have white space in text and code', function () {
            let tokens = templateEngine.preCompile('aa  \t a@(model)sss');
            tokens.length.should.equal(3);
            tokens[0].text.should.equal('aa  \t a');
            tokens[1].text.should.equal('model');
            tokens[2].text.should.equal('sss');
        });

        it('should work weel will have white space in text and code', function () {
            let tokens = templateEngine.preCompile('aa \r\n \t a@(model)sss');
            tokens.length.should.equal(6);
            tokens[0].text.should.equal('aa ');
            tokens[1].text.should.equal('\n');
            tokens[2].text.should.equal(' \t ');
            tokens[3].text.should.equal('a');
            tokens[4].text.should.equal('model');
            tokens[5].text.should.equal('sss');
        });

        it('should work weel will have () in code', function () {
            let tokens = templateEngine.preCompile('aaa@(mod()el)sss');
            tokens.length.should.equal(3);
            tokens[0].text.should.equal('aaa');
            tokens[1].text.should.equal('mod()el');
            tokens[2].text.should.equal('sss');
        });

        it('should work weel will have "" in code', function () {
            let tokens = templateEngine.preCompile('aaa@(mod"("el)sss');
            tokens.length.should.equal(3);
            tokens[0].text.should.equal('aaa');
            tokens[1].text.should.equal('mod"("el');
            tokens[2].text.should.equal('sss');
        });

        it('should work weel will have complex "" in code', function () {
            let tokens = templateEngine.preCompile('aaa@(mod"(\'"el)sss');
            tokens.length.should.equal(3);
            tokens[0].text.should.equal('aaa');
            tokens[1].text.should.equal('mod"(\'"el');
            tokens[2].text.should.equal('sss');
        });

        it('should work weel will have complex "" in code', function () {
            let tokens = templateEngine.preCompile('aaa@(mod"(\'`"el)sss');
            tokens.length.should.equal(3);
            tokens[0].text.should.equal('aaa');
            tokens[1].text.should.equal('mod"(\'`"el');
            tokens[2].text.should.equal('sss');
        });

        it('should work weel will have complex "" in code', function () {
            let tokens = templateEngine.preCompile('aaa@(mod"(\'`" + aaa + ""el)sss');
            tokens.length.should.equal(3);
            tokens[0].text.should.equal('aaa');
            tokens[1].text.should.equal('mod"(\'`" + aaa + ""el');
            tokens[2].text.should.equal('sss');
        });

        it('should work weel will have very complex "" in code', function () {
            let tokens = templateEngine.preCompile('aaa@(mod"(\n     \'`" + aaa + ""el)sss');
            tokens[0].text.should.equal('aaa');
            tokens[1].text.should.equal('mod"(\n     \'`" + aaa + ""el');
            tokens[2].text.should.equal('sss');
        });

        it('should work weel will have complex "" in code2', function () {
            let tokens = templateEngine.preCompile('aaa@(mod"(\\""el)sss');
            tokens.length.should.equal(3);
            tokens[0].text.should.equal('aaa');
            tokens[1].text.should.equal('mod"(\\""el');
            tokens[2].text.should.equal('sss');
        });

        it('should work weel will have complex "" in code2', function () {
            let tokens = templateEngine.preCompile('aaa@(mod"(\\\\"el)sss');
            tokens.length.should.equal(3);
            tokens[0].text.should.equal('aaa');
            tokens[1].text.should.equal('mod"(\\\\"el');
            tokens[2].text.should.equal('sss');
        });

        it('should work weel will have @@', function () {
            let tokens = templateEngine.preCompile('a@@aa@(mod@@"(\\\\"el)sss');
            tokens.length.should.equal(3);
            tokens[0].text.should.equal('a@aa');
            tokens[1].text.should.equal('mod@"(\\\\"el');
            tokens[2].text.should.equal('sss');
        });

        it('should work weel will have text in code', function () {
            let tokens = templateEngine.preCompile('aaa@(mo@:del)sss');
            tokens[0].text.should.equal('aaa');
            tokens[1].text.should.equal('mo@:del');
            tokens[2].text.should.equal('sss');
        });

        it('should work weel will have text in code2', function () {
            let tokens = templateEngine.preCompile('aaa@(mo\r\n@:del\r\n)sss');
            tokens[0].text.should.equal('aaa');
            tokens[1].text.should.equal('mo\n@:del\n');
            tokens[2].text.should.equal('sss');
        });

        it('should work weel will have text in code3', function () {
            let tokens = templateEngine.preCompile('aaa@{mo\r\n@:{del\r\nssasd@:}sss}sss');
            tokens[0].text.should.equal('aaa');
            tokens[1].text.should.equal('mo');
            tokens[2].text.should.equal('\n');
            tokens[3].text.should.equal('del');
            tokens[4].text.should.equal('\n');
            tokens[5].text.should.equal('ssasd');
            tokens[6].text.should.equal('sss');
            tokens[7].text.should.equal('sss');
        });

        it('should work weel will have text in code4', function () {
            let tokens = templateEngine.preCompile('aaa@{mo\r\n     \t@:{del\r\nssasd\r\n@:}sss}sss');
            tokens[0].text.should.equal('aaa');
            tokens[1].text.should.equal('mo');
            tokens[2].text.should.equal('\n');
            tokens[3].text.should.equal('     \t');
            tokens[4].text.should.equal('del');
            tokens[5].text.should.equal('\n');
            tokens[6].text.should.equal('ssasd');
            tokens[7].text.should.equal('\n');
            tokens[8].text.should.equal('');
            tokens[9].text.should.equal('sss');
            tokens[10].text.should.equal('sss');
        });

        it('should work weel will have text in code5', function () {
            let tokens = templateEngine.preCompile('aaa@{mo@:del\r\nssasdsss}sss');
            tokens[0].text.should.equal('aaa');
            tokens[1].text.should.equal('mo');
            tokens[2].text.should.equal('del');
            tokens[3].text.should.equal('\n');
            tokens[4].text.should.equal('ssasdsss');
            tokens[5].text.should.equal('sss');
        });

        it('should work weel will have text in code6', function () {
            let tokens = templateEngine.preCompile('aaa@{mo\r\n@:del\r\nssasdsss}sss');
            tokens[0].text.should.equal('aaa');
            tokens[1].text.should.equal('mo');
            tokens[2].text.should.equal('\n');
            tokens[3].text.should.equal('del');
            tokens[4].text.should.equal('\n');
            tokens[5].text.should.equal('ssasdsss');
            tokens[6].text.should.equal('sss');
        });

        it('should work weel will have code in text', function () {
            let tokens = templateEngine.preCompile('aaa@{mo\r\n@:{del@(sss)@:}eee}sss');
            tokens[0].text.should.equal('aaa');
            tokens[1].text.should.equal('mo');
            tokens[2].text.should.equal('\n');
            tokens[3].text.should.equal('del');
            tokens[4].text.should.equal('sss');
            tokens[5].text.should.equal('');
            tokens[6].text.should.equal('eee');
            tokens[7].text.should.equal('sss');
        });

        it('should work weel will have code in text', function () {
            let tokens = templateEngine.preCompile('aaa@{mo\r\n@:{del@(sss)123@:}eee}sss');
            tokens[0].text.should.equal('aaa');
            tokens[1].text.should.equal('mo');
            tokens[2].text.should.equal('\n');
            tokens[3].text.should.equal('del');
            tokens[4].text.should.equal('sss');
            tokens[5].text.should.equal('123');
            tokens[6].text.should.equal('eee');
            tokens[7].text.should.equal('sss');
        });
    });

    describe("clean", function(){
        it('should merge \\n together', function () {
            let tokens = templateEngine.preCompile('aa \r\n \t a@(model)sss');
            tokens.length.should.equal(6);
            tokens[0].text.should.equal('aa ');
            tokens[1].text.should.equal('\n');
            tokens[2].text.should.equal(' \t ');
            tokens[3].text.should.equal('a');
            tokens[4].text.should.equal('model');
            tokens[5].text.should.equal('sss');

            let nodes = templateEngine.clean(tokens);
            nodes[0].text.should.equal('aa ');
            nodes[1].text.should.equal('\n');
            nodes[2].text.should.equal(' \t a');
            nodes[3].text.should.equal('model');
            nodes[4].text.should.equal('sss');
        });

        it('should merge \\n together2', function () {
            let tokens = templateEngine.preCompile('aaa@{mo\r\n@:{del   \t   \r\n   \t   ssasd@:}sss}sss');
            tokens[0].text.should.equal('aaa');
            tokens[1].text.should.equal('mo');
            tokens[2].text.should.equal('\n');
            tokens[3].text.should.equal('del   \t   ');
            tokens[4].text.should.equal('\n');
            tokens[5].text.should.equal('   \t   ');
            tokens[6].text.should.equal('ssasd');
            tokens[7].text.should.equal('sss');
            tokens[8].text.should.equal('sss');

            let nodes = templateEngine.clean(tokens);
            nodes[0].text.should.equal('aaa');
            nodes[1].text.should.equal('mo');
            nodes[2].text.should.equal('\n');
            nodes[3].text.should.equal('del   \t   ');
            nodes[4].text.should.equal('\n');
            nodes[5].text.should.equal('   \t   ssasd');
            nodes[6].text.should.equal('sss');
            nodes[7].text.should.equal('sss');
        });
    });
})