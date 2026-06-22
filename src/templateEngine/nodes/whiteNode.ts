class WhiteNode{
    text: string;
    isText: boolean;

    constructor(text = '', isText = false){
        this.text = text;
        this.isText = isText;
    }

    createContinue(): WhiteNode {
        let result = new WhiteNode();
        let names = Object.getOwnPropertyNames(this) as Array<keyof this>;
        for (const name of names) {
            (result as any)[name] = this[name];
        }
        result.text = '';
        return result;
    }
}

export = WhiteNode;
