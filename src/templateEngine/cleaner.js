class Cleaner {
    constructor(){

    }

    clean(nodes) {
        this.cleanedNodes = [];
        this.nodes = [];
        this.nodes.unshift.apply(this.nodes, nodes.reverse());
        while(this.read()){}
        return this.cleanedNodes;
    }

    read(){
        let cur = this.nodes.length >= 1 ? this.nodes[this.nodes.length - 1] : null;
        let next = this.nodes.length >= 2 ? this.nodes[this.nodes.length - 2] : null;

        if(!cur) return;
        if(!next){
            this.cleanedNodes.push(this.nodes.pop());
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
        this.cleanedNodes.push(this.nodes.pop());
        return true;
    }
}

module.exports = Cleaner;