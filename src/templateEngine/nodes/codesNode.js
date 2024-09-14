var tks = require('../tokens');

class CodesNode{
    constructor(text = '', leftBlock = ''){
        this.text = text;

        this.leftBlock = leftBlock;
        this.rightBlock = leftBlock === tks.BRACE_OPEN ? tks.BRACE_CLOSE : (leftBlock === tks.PAREN_OPEN ? tks.PAREN_CLOSE : '');
        this.leftCount = leftBlock ? 1 : 0;
        this.rightCount = 0;

        this.isInString = false;
        this.isInRegex = false;
        this.outputText = leftBlock === tks.PAREN_OPEN;
        this.codeBlock = leftBlock !== tks.PAREN_OPEN;
        this.stringChar = '';

        this.isClosed = false;
        this.isFromContinue = false;

        this.nodes = [];
    }

    createContinue(){
        let result = new CodesNode();
        let names = Object.getOwnPropertyNames(this);
        for(let name of names){
            result[name] = this[name];
        }
        result.text = '';
        result.nodes = [];
        result.isFromContinue = true;
        return result;
    }

    generateCode(){
        let result = !this.text ? '' : (this.outputText ? ('ng.__res += (' + (this.text || '') + ') || "";') : (this.text || ''));
        for(let i = 0, length = this.nodes.length; i < length; i++){
            let node = this.nodes[i];
            if(node.constructor.name === 'TextNode' || node.constructor.name === 'CodesNode' || node.constructor.name === 'BlockDefineNode'){
                result += node.generateCode();
            } else {
                // if(this.nodes[i-1] && this.nodes[i-1].constructor.name === 'NewLineNode' && node.constructor.name === 'WhiteNode' && this.nodes[i+1] && this.nodes[i+1].constructor.name === 'CodesNode' && this.nodes[i+1].outputText){
                //     result += `ng._setCurrentTab(${JSON.stringify(node.text)});`;
                // } else 
                if(!!node.text) result += node.text;
            }
        }
        return result;
    }
}

module.exports = CodesNode;