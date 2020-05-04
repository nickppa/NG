const tks = require('./tokens');
const CodesNode = require('./nodes/codesNode');
const TextNode = require('./nodes/textNode');
const NewLineNode = require('./nodes/newLineNode');
const WhiteNode = require('./nodes/whiteNode');
const BlockNode = require('./nodes/blockNode');
const BlockDefineNode = require('./nodes/blockDefineNode');

class Parser {
    convert(tokens){
        this.node = new TextNode('', '', true);
        this.nodes = [this.node];
        this.tokens = [];
        this.tokens.unshift.apply(this.tokens, tokens.reverse());
        this.stack = [];
        while(this._read()){}
        return this._clean(this.nodes);
    }

    _clean(nodes){
        let result = [];
        for(var node of nodes){
            if(node.isFromContinue && !node.text && !node.isClosed) continue;
            result.push(node);
        }
        return result;
    }

    _read(){
        if(!this.tokens || !this.tokens.length)
            return false;
        
        let cur = this.tokens.length >= 1 ? this.tokens[this.tokens.length - 1] : null;
        let next = this.tokens.length >= 2 ? this.tokens[this.tokens.length - 2] : null;
        if(!cur)
            return false;

        let res = this['_next' + this.node.constructor.name](this.tokens, cur, next);
        if(res){
            this.node = res;
            this.nodes.push(this.node);
        }
        return true;
    }

    _nextCodesNode(tokens, cur, next){
        if(cur.type === tks.AT_AT){
            this.node.text += "@";
            tokens.pop();
            return;
        }
        if(cur.type === tks.AT_SKIP){
            tokens.pop();
            return;
        }
        if(!this.node.outputText && cur.type === tks.NEWLINE){
            let node = new NewLineNode(false);
            tokens.pop();
            this.stack.push(this.node);
            return node;
        }
        if(!this.node.outputText && cur.type === tks.AT_BLOCK_DEFINE){
            let node = this._createNewBlockDefineNode(cur);
            tokens.pop();
            this.stack.push(this.node);
            return node;
        }
        if(!this.node.outputText && cur.type === tks.AT_EXPRESSION){
            let node = this._createNewCodeNode(cur);
            tokens.pop();
            this.stack.push(this.node);
            return node;
        }
        if(!this.node.outputText && (cur.type === tks.AT_TEXT_BLOCK_OPEN || cur.type === tks.AT_TEXT)){
            let node = this._createNewTextNode(cur);
            tokens.pop();
            this.stack.push(this.node);
            return node;
        }
        if(!this.node.outputText && cur.type === tks.AT_BLOCK){
            let node = new BlockNode(cur.val);
            tokens.pop();
            return node;
        }
        if(!cur._considerEscaped && 
                (cur.type === tks.DOUBLE_QUOTE 
                || cur.type === tks.SINGLE_QUOTE
                || cur.type === tks.ES6_QUOTE)){
            if(!this.node.isInString){
                this.node.stringChar = cur.type;
                this.node.isInString = true;
            } else if(this.node.stringChar === cur.type) {
                this.node.isInString = false;
            }
            this.node.text += cur.val;
            tokens.pop();
            return;
        }
        if(!this.node.isInString){
            if(cur.type === this.node.leftBlock){
                this.node.leftCount++;
                this.node.text += cur.val;
                tokens.pop();
                return;
            }
            if(cur.type === this.node.rightBlock){
                this.node.rightCount++;
                if(this.node.leftCount === this.node.rightCount){
                    tokens.pop();
                    this.node.isClosed = true;
                    return this._createFromStack();
                }
                this.node.text += cur.val;
                tokens.pop();
                return;
            }
        } else {
            if(cur.type === tks.BACKSLASH && !cur._considerEscaped){
                next._considerEscaped = true;
            }
        }
        this.node.text += cur.val;
        tokens.pop();
        return;
    }

    _nextTextNode(tokens, cur){
        if(cur.type === tks.AT_AT){
            this.node.text += "@";
            tokens.pop();
            return;
        }
        if(cur.type === tks.AT_SKIP){
            tokens.pop();
            return;
        }
        if(cur.type === tks.AT_BLOCK_DEFINE){
            let node = this._createNewBlockDefineNode(cur);
            tokens.pop();
            if(this.node.isBlock)
                this.stack.push(this.node);
            return node;
        }
        if(cur.type === tks.AT_EXPRESSION){
            let node = this._createNewCodeNode(cur);
            tokens.pop();
            if(!this.node.isBlock){
                this.node.isClosed = false;
            }
            this.stack.push(this.node);
            return node;
        }
        if(cur.type === tks.AT_EXPRESSION_BLOCK){
            let node = this._createNewCodeNode(cur);
            tokens.pop();
            if(this.node.isBlock)
                this.stack.push(this.node);
            return node;
        }
        if(cur.type === this.node.rightBlock){
            tokens.pop();
            this.node.isClosed = true;
            return this._createFromStack();
        }
        if(cur.type === tks.NEWLINE){
            let node = new NewLineNode(true);
            tokens.pop();
            if(this.node.isBlock){
                this.stack.push(this.node);
            } else {
                this.node.isClosed = true;
            }
            return node;
        }
        if(cur.type === tks.AT_BLOCK){
            let node = new BlockNode(cur.val);
            tokens.pop();
            if(!this.node.isBlock){
                this.node.isClosed = false;
            }
            this.stack.push(this.node);
            return node;
        }
        this.node.text += cur.val;
        tokens.pop();
        return;
    }

    _nextNewLineNode(tokens, cur){
        if(cur.type === tks.NEWLINE){
            this.node.text += cur.val;
            tokens.pop();
            return;
        }
        if(cur.type === tks.WHITESPACE){
            let node = new WhiteNode(cur.val, this.node.isText);
            tokens.pop();
            return node;
        }
        if(cur.type === tks.AT_BLOCK){
            let node = new BlockNode(cur.val);
            tokens.pop();
            return node;
        }
        // no tokens pop, will process in the preNode
        return this._createFromStack();
    }

    _nextWhiteNode(tokens, cur){
        if(cur.type === tks.WHITESPACE){
            this.node.text += cur.val;
            tokens.pop();
            return;
        }
        if(cur.type === tks.NEWLINE){
            let node = new NewLineNode(this.node.isText);
            tokens.pop();
            return node;
        }
        if(cur.type === tks.AT_BLOCK){
            let node = new BlockNode(cur.val);
            tokens.pop();
            return node;
        }
        // no tokens pop, will process in the preNode
        return this._createFromStack();
    }

    _nextBlockNode(tokens, cur){
        if(cur.type === tks.NEWLINE){
            let node = new NewLineNode(this.node.isText);
            tokens.pop();
            return node;
        }
        if(cur.type === tks.WHITESPACE){
            let node = new WhiteNode(cur.val, this.node.isText);
            tokens.pop();
            return node;
        }
        if(cur.type === tks.AT_BLOCK){
            let node = new BlockNode(cur.val);
            tokens.pop();
            return node;
        }
        // no tokens pop, will process in the preNode
        return this._createFromStack();
    }

    _createFromStack(){
        if(!this.stack || !this.stack.length)
            return null;
        let preNode = this.stack.pop();
        if(preNode.createContinue)
            return preNode.createContinue();
        return null;
    }

    _createNewBlockDefineNode(cur) {
        let codesNode = this._createNewCodeNode({type: tks.AT_EXPRESSION_BLOCK});
        this.nodes.push(new BlockDefineNode(cur.val, codesNode));
        return codesNode;
    }

    _createNewCodeNode(cur) {
        return new CodesNode('', cur.type === tks.AT_EXPRESSION ? tks.PAREN_OPEN : tks.BRACE_OPEN);
    }

    _createNewTextNode(cur) {
        return new TextNode('', cur.type === tks.AT_TEXT_BLOCK_OPEN ? tks.AT_TEXT_BLOCK_OPEN : '', cur.type === tks.AT_TEXT_BLOCK_OPEN);
    }
}

module.exports = Parser;
