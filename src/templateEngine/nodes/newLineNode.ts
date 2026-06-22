class NewLineNode{
    text: string;
    isText: boolean;

    constructor(isText = false){
        this.text = '\n';
        this.isText = isText;
    }

    createContinue(): NewLineNode {
        let result = new NewLineNode();
        let names = Object.getOwnPropertyNames(this) as Array<keyof this>;
        for (const name of names) {
            (result as any)[name] = this[name];
        }
        result.text = '';
        return result;
    }
}

export = NewLineNode;
