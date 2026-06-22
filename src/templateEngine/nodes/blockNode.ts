import type { NodeLike } from '../types';

class BlockNode{
    text: string;

    constructor(text = ''){
        this.text = text;
    }

    createContinue(): BlockNode {
        let result = new BlockNode();
        let names = Object.getOwnPropertyNames(this) as Array<keyof this>;
        for (const name of names) {
            (result as any)[name] = this[name];
        }
        result.text = '';
        return result;
    }
}

export = BlockNode;
