import type { NodeLike } from '../types';
const tks = require('../tokens') as Record<string, string>;

class TextNode{
    text: string;
    leftBlock: string;
    rightBlock: string;
    isBlock: boolean;
    isClosed: boolean;
    isFromContinue: boolean;
    nodes: NodeLike[];

    constructor(text = '', leftBlock = '', isBlock = false){
        this.text = text;

        this.leftBlock = leftBlock;
        this.rightBlock = leftBlock === tks.AT_TEXT_BLOCK_OPEN ? tks.AT_TEXT_BLOCK_CLOSE : '';

        this.isBlock = isBlock;

        this.isClosed = !isBlock;
        this.isFromContinue = false;

        this.nodes = [];
    }

    createContinue(): TextNode {
        let result = new TextNode();
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
        let result = !this.text ? '' : `ng.__res += ${JSON.stringify(this.text)};`;
        let lastNode: NodeLike | null = null;
        for (const node of this.nodes) {
            if (node.constructor.name === 'TextNode' || node.constructor.name === 'CodesNode' || node.constructor.name === 'BlockDefineNode') {
                result += (node.generateCode && node.generateCode()) || '';
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

export = TextNode;
