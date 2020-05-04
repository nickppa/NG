require('chai').should();
const util = require('../src/utils/util');

describe('util test', function(){
    it('should split to right strings 1', function(){
        util._splitText('').should.empty;
    });

    it('should split to right strings 2', function(){
        util._splitText('aa').should.deep.eq(['aa']);
    });

    it('should split to right strings 3', function(){
        util._splitText('AaBb').should.deep.eq(['aa', 'bb']);
    });

    it('should split to right strings 4', function(){
        util._splitText('aaBb').should.deep.eq(['aa', 'bb']);
    });

    it('should split to right strings 5', function(){
        util._splitText('aa.Bb').should.deep.eq(['aa', 'bb']);
    });

    it('should split to right strings 6', function(){
        util._splitText('aa--Bb').should.deep.eq(['aa', 'bb']);
    });

    it('should split to right strings 7', function(){
        util._splitText('aa--BbCd').should.deep.eq(['aa', 'bb', 'cd']);
    });

    it('should convert to CamelCase', function(){
        util.toCamelCase('aa--BbCd').should.eq('aaBbCd');
    });

    it('should convert to PascalCase', function(){
        util.toPascalCase('aa--BbCd').should.eq('AaBbCd');
    });

    it('should convert to SnakeCase', function(){
        util.toSnakeCase('aa--BbCd').should.eq('aa-bb-cd');
    });

    it('should convert to SnakeCase', function(){
        util.toSnakeCase('aa--BbCd', '_').should.eq('aa_bb_cd');
    });
});