import type { NodeLike } from '../types';

let KKK = 1;
class BlockDefineNode{
    text: string;
    nodes: NodeLike[];
    codesNode: NodeLike;

    constructor(text = '', codesNode: NodeLike = { text: '', constructor: { name: 'CodesNode' } } as NodeLike){
        this.text = text;

        this.nodes = [];
        this.codesNode = codesNode;
    }

    createContinue(): BlockDefineNode {
        let result = new BlockDefineNode();
        let names = Object.getOwnPropertyNames(this) as Array<keyof this>;
        for (const name of names) {
            (result as any)[name] = this[name];
        }
        result.text = '';
        result.nodes = [];
        return result;
    }

    generateCode(): string {
        KKK++;
        let key = '', tag = '';
        let define = this.text.substring(this.text.indexOf('[') + 1, this.text.indexOf(']'));
        const arr = define.split(',');
        if(arr.length > 0) key = arr[0].trim();
        if(arr.length > 1) tag = arr[1].trim();
        let result = 'let __res' + KKK + ' = ng.__res;ng._setCacheText("' + key + '", "' + tag + '", (function(ng, model){ng.__res = "";';
        for (const node of this.nodes) {
            result += (node.generateCode && node.generateCode()) || '';
        }
        return result + 'return ng.__res;})(ng, model));ng.__res = __res' + KKK + ';';
    }
}

export = BlockDefineNode;
