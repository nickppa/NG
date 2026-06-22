import type { NodeLike } from './types';

class Cleaner {
    cleanedNodes: NodeLike[];
    nodes: NodeLike[];

    constructor(){
        this.cleanedNodes = [];
        this.nodes = [];
    }

    clean(nodes: NodeLike[]): NodeLike[] {
        this.cleanedNodes = [];
        this.nodes = [];
        this.nodes.unshift.apply(this.nodes, nodes.reverse());
        while(this.read()){}
        return this.cleanedNodes;
    }

    read(): boolean | undefined {
        let cur = this.nodes.length >= 1 ? this.nodes[this.nodes.length - 1] : null;
        let next = this.nodes.length >= 2 ? this.nodes[this.nodes.length - 2] : null;

        if(!cur) return;
        if(!next){
            const popped = this.nodes.pop();
            if (popped) {
                this.cleanedNodes.push(popped);
            }
            return;
        }
        if(cur.constructor.name === 'WhiteNode' && next.constructor.name === 'TextNode'){
            this.nodes.pop();
            next.text = cur.text + next.text;
            return true;
        }
        // if(cur.constructor.name === 'NewLineNode' && next.constructor.name === 'CodesNode' && !next.outputText){
        //     this.nodes.pop();
        //     return true;
        // }
        if((cur.constructor.name === 'NewLineNode' || cur.constructor.name === 'WhiteNode') && next.constructor.name === 'BlockDefineNode'){
            this.nodes.pop();
            return true;
        }
        const popped = this.nodes.pop();
        if (popped) {
            this.cleanedNodes.push(popped);
        }
        return true;
    }
}

export = Cleaner;
