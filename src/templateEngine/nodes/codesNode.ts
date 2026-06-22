import type { NodeLike } from '../types';
const tks = require('../tokens') as Record<string, string>;

class CodesNode{
    text: string;
    leftBlock: string;
    rightBlock: string;
    leftCount: number;
    rightCount: number;
    isInString: boolean;
    isInRegex: boolean;
    outputText: boolean;
    codeBlock: boolean;
    stringChar: string;
    isClosed: boolean;
    isFromContinue: boolean;
    nodes: NodeLike[];

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

    createContinue(): CodesNode {
        let result = new CodesNode();
        let names = Object.getOwnPropertyNames(this) as Array<keyof this>;
        for (const name of names) {
            (result as any)[name] = this[name];
        }
        result.text = '';
        result.nodes = [];
        result.isFromContinue = true;
        return result;
    }

    generateCode(): string {
        let result = !this.text ? '' : (this.outputText ? ('ng.__res += (' + (this.text || '') + ') || "";') : (this.text || ''));
        for(let i = 0, length = this.nodes.length; i < length; i++){
            let node = this.nodes[i];
            if(node.constructor.name === 'TextNode' || node.constructor.name === 'CodesNode' || node.constructor.name === 'BlockDefineNode'){
                result += (node.generateCode && node.generateCode()) || '';
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

export = CodesNode;
