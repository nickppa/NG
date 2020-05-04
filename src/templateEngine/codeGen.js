class CodeGen {
    constructor() {
    }

    buildNodeTree(nodes){
        let tempNode = null;
        let rootNode = null;
        let stack = [];
        for(let node of nodes){
            if(!tempNode && !node.isClosed){
                tempNode = node;
                rootNode = node;
                continue;
            }
            if(tempNode && tempNode === node)
                continue;
            if(tempNode){
                tempNode.nodes.push(node);
                if(node.constructor.name === 'BlockDefineNode'){
                    stack.push(tempNode);
                    node.nodes.push(node.codesNode);
                    tempNode = node.codesNode;
                    if(node.codesNode.isClosed){
                        if(stack.length){
                            tempNode = stack.pop();
                        }
                    }
                }
                else if(node.constructor.name === 'TextNode' || node.constructor.name === 'CodesNode'){
                    if(!node.isFromContinue && !node.isClosed) {
                        stack.push(tempNode);
                        tempNode = node;
                    } else if(node.isClosed && node.isFromContinue){
                        if(stack.length){
                            tempNode = stack.pop();
                        }
                    }
                }
            }
        }
        return rootNode;
    }

    generateCode(nodes) {
        if (!nodes || !nodes.length) return `return '';`;
        let result = 'ng.__res = "";';
        let rootNode = this.buildNodeTree(nodes);
        result += rootNode.generateCode();
        result += "return ng.__res;";
        return {code: result, rootNode};
    }
}

module.exports = CodeGen;