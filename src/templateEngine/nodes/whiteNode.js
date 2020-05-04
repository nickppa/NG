class WhiteNode{
    constructor(text, isText){
        this.text = text;
        this.isText = isText;
    }

    createContinue(){
        let result = new WhiteNode();
        let names = Object.getOwnPropertyNames(this);
        for(let name of names){
            result[name] = this[name];
        }
        result.text = '';
        return result;
    }
}

module.exports = WhiteNode;