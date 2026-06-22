import type { GeneratedCodeResult, NodeLike } from './types';

class CodeGen {
    constructor() {
    }

    buildNodeTree(nodes: NodeLike[]): NodeLike {
        let tempNode: NodeLike | null = null;
        let rootNode: NodeLike | null = null;
        let stack: NodeLike[] = [];
        for (const node of nodes) {
            if(!tempNode && !node.isClosed){
                tempNode = node;
                rootNode = node;
                continue;
            }
            if(tempNode && tempNode === node)
                continue;
            if(tempNode){
                tempNode.nodes = tempNode.nodes || [];
                tempNode.nodes.push(node);
                if(node.constructor.name === 'BlockDefineNode'){
                    stack.push(tempNode);
                    node.nodes?.push(node.codesNode as NodeLike);
                    tempNode = node.codesNode as NodeLike;
                    if((node.codesNode as NodeLike).isClosed){
                        if(stack.length){
                            tempNode = stack.pop() || null;
                        }
                    }
                }
                else if(node.constructor.name === 'TextNode' || node.constructor.name === 'CodesNode'){
                    if(!node.isFromContinue && !node.isClosed) {
                        stack.push(tempNode);
                        tempNode = node;
                    } else if(node.isClosed && node.isFromContinue){
                        if(stack.length){
                            tempNode = stack.pop() || null;
                        }
                    }
                }
            }
        }
        if (!rootNode) {
            return { text: '', constructor: { name: 'TextNode' }, nodes: [], isClosed: true, generateCode: () => '' };
        }
        return rootNode;
    }

    generateCode(nodes: NodeLike[]): GeneratedCodeResult | string {
        if (!nodes || !nodes.length) return `return '';`;
        let result = 'ng.__res = "";';
        let rootNode = this.buildNodeTree(nodes);
        result += (rootNode.generateCode && rootNode.generateCode()) || '';
        result += "return ng.__res;";
        return {code: result, rootNode};
    }
}

export = CodeGen;
