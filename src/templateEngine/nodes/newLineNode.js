class NewLineNode{
    constructor(isText){
        this.text = '\n';
        this.isText = isText;
    }

    createContinue(){
        let result = new NewLineNode();
        let names = Object.getOwnPropertyNames(this);
        for(let name of names){
            result[name] = this[name];
        }
        result.text = '';
        return result;
    }
}

module.exports = NewLineNode;