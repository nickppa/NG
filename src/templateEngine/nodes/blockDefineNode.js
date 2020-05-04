let KKK = 1;
class BlockDefineNode{
    constructor(text, codesNode){
        this.text = text;

        this.nodes = [];
        this.codesNode = codesNode;
    }

    createContinue(){
        let result = new BlockDefineNode();
        let names = Object.getOwnPropertyNames(this);
        for(let name of names){
            result[name] = this[name];
        }
        result.text = '';
        result.nodes = [];
        return result;
    }

    generateCode(){
        KKK++;
        let key = '', tag = '';
        let define = this.text.substring(this.text.indexOf('[') + 1, this.text.indexOf(']'));
        var arr = define.split(',');
        if(arr.length > 0) key = arr[0];
        if(arr.length > 1) tag = arr[1];
        let result = 'let __res' + KKK + ' = ng.__res;ng._setCacheText("' + key + '", "' + tag + '", (function(ng, model){ng.__res = "";';
        for(let node of this.nodes){
            result += (node.generateCode && node.generateCode()) || '';
        }
        return result + 'return ng.__res;})(ng, model));ng.__res = __res' + KKK + ';';
    }
}

module.exports = BlockDefineNode;