var tks = require('../tokens');

class TextNode{
    constructor(text = '', leftBlock = '', isBlock = false){
        this.text = text;

        this.leftBlock = leftBlock;
        this.rightBlock = leftBlock === tks.AT_TEXT_BLOCK_OPEN ? tks.AT_TEXT_BLOCK_CLOSE : '';

        this.isBlock = isBlock;

        this.isClosed = !isBlock;
        this.isFromContinue = false;

        this.nodes = [];
    }

    createContinue(){
        let result = new TextNode();
        let names = Object.getOwnPropertyNames(this);
        for(let name of names){
            result[name] = this[name];
        }
        result.text = '';
        result.nodes = [];
        result.isFromContinue = true;
        return result;
    }

    generateCode() {
        let result = !this.text ? '' : `ng.__res += ${JSON.stringify(this.text)};`;
        let lastNode = null;
        for (let node of this.nodes) {
            if (node.constructor.name === 'TextNode' || node.constructor.name === 'CodesNode' || node.constructor.name === 'BlockDefineNode') {
                result += node.generateCode();
            } else if (lastNode && lastNode.constructor.name === 'NewLineNode' && node.constructor.name === 'WhiteNode') {
                // result += `ng._setCurrentTab(${JSON.stringify(node.text)});`;
                if (!!node.text){
                    result += `ng.__res += ${JSON.stringify(node.text)};`;
                }
            } else {
                if (node.constructor.name === 'BlockNode'){
                    let cacheKey = node.text.substring(node.text.indexOf('[') + 1, node.text.indexOf(']'));
                    result += `ng._setCacheTab('${cacheKey}');`;
                }
                if (!!node.text) result += `ng.__res += ${JSON.stringify(node.text)};`;
            }
            lastNode = node;
        }
        return result;
    }
}

module.exports = TextNode;