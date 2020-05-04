class BlockNode{
    constructor(text){
        this.text = text;
    }

    createContinue(){
        let result = new BlockNode();
        let names = Object.getOwnPropertyNames(this);
        for(let name of names){
            result[name] = this[name];
        }
        result.text = '';
        return result;
    }
}

module.exports = BlockNode;