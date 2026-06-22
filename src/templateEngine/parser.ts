const tks = require('./tokens');
const CodesNode = require('./nodes/codesNode');
const TextNode = require('./nodes/textNode');
const NewLineNode = require('./nodes/newLineNode');
const WhiteNode = require('./nodes/whiteNode');
const BlockNode = require('./nodes/blockNode');
const BlockDefineNode = require('./nodes/blockDefineNode');
import type { NodeLike, Token } from './types';

type ParserNode = NodeLike;
type ParserTransitionResult = ParserNode | null | void;

class Parser {
    node: ParserNode;
    nodes: ParserNode[];
    tokens: Token[];
    stack: ParserNode[];
    previousNonWhitespace: Token | null;

    constructor() {
        this.node = new TextNode('', '', true);
        this.nodes = [this.node];
        this.tokens = [];
        this.stack = [];
        this.previousNonWhitespace = null;
    }

    convert(tokens: Token[]): ParserNode[] {
        this.node = new TextNode('', '', true);
        this.nodes = [this.node];
        this.tokens = [];
        this.tokens.unshift.apply(this.tokens, tokens.reverse());
        this.stack = [];
        this.previousNonWhitespace = null;
        while(this._read()){}
        return this._clean(this.nodes);
    }

    _clean(nodes: ParserNode[]): ParserNode[] {
        let result: ParserNode[] = [];
        for (const node of nodes) {
            if(node.isFromContinue && !node.text && !node.isClosed) continue;
            result.push(node);
        }
        return result;
    }

    _read(): boolean {
        if(!this.tokens || !this.tokens.length)
            return false;
        
        let cur = this.tokens.length >= 1 ? this.tokens[this.tokens.length - 1] : null;
        let next = this.tokens.length >= 2 ? this.tokens[this.tokens.length - 2] : null;
        if(!cur)
            return false;

        const handler = (this as any)['_next' + this.node.constructor.name] as ((tokens: Token[], cur: Token, next: Token | null) => ParserTransitionResult);
        let res = handler.call(this, this.tokens, cur, next);
        if(res != null){
            this.node = res;
            this.nodes.push(this.node);
        }
        
        if(this.node.constructor.name === 'CodesNode') {
            if (cur.type !== tks.WHITESPACE) {
                this.previousNonWhitespace = cur;
            }
        
            if (cur.type === tks.NEWLINE) {
                this.previousNonWhitespace = null;
            }
        }

        return true;
    }

    _nextCodesNode(tokens: Token[], cur: Token, next: Token | null): ParserTransitionResult {
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
        if(!cur._considerEscaped && !this.node.isInRegex && 
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
            if(!this.node.isInRegex && cur.type === this.node.leftBlock){
                this.node.leftCount++;
                this.node.text += cur.val;
                tokens.pop();
                return;
            }
            if(!this.node.isInRegex && cur.type === this.node.rightBlock){
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
            if(this.node.isInRegex && !cur._considerEscaped && cur.type === tks.FORWARD_SLASH){
                this.node.text += cur.val;
                this.node.isInRegex = false;
                tokens.pop();
                return;
            }
            if(!this.node.isInRegex
                && cur.type === tks.FORWARD_SLASH
                && this.previousNonWhitespace
                && this.previousNonWhitespace.type !== tks.IDENTIFIER
                && this.previousNonWhitespace.type !== tks.NUMERAL
                && this.previousNonWhitespace.type !== tks.PAREN_CLOSE){
                this.node.text += cur.val;
                this.node.isInRegex = true;
                tokens.pop();
                return;
            }
        } else {
            if(cur.type === tks.BACKSLASH && !cur._considerEscaped){
                if (next) {
                    next._considerEscaped = true;
                }
            }
        }
        this.node.text += cur.val;
        tokens.pop();
        return;
    }

    _nextTextNode(tokens: Token[], cur: Token): ParserTransitionResult {
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

    _nextNewLineNode(tokens: Token[], cur: Token): ParserTransitionResult {
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

    _nextWhiteNode(tokens: Token[], cur: Token): ParserTransitionResult {
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

    _nextBlockNode(tokens: Token[], cur: Token): ParserTransitionResult {
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

    _createFromStack(): ParserNode | null {
        if(!this.stack || !this.stack.length)
            return null;
        let preNode = this.stack.pop();
        if (!preNode) {
            return null;
        }
        if(preNode.createContinue)
            return preNode.createContinue();
        return null;
    }

    _createNewBlockDefineNode(cur: Token): ParserNode {
        let codesNode = this._createNewCodeNode({type: tks.AT_EXPRESSION_BLOCK});
        this.nodes.push(new BlockDefineNode(cur.val, codesNode));
        return codesNode;
    }

    _createNewCodeNode(cur: { type: string }): ParserNode {
        return new CodesNode('', cur.type === tks.AT_EXPRESSION ? tks.PAREN_OPEN : tks.BRACE_OPEN);
    }

    _createNewTextNode(cur: Token): ParserNode {
        return new TextNode('', cur.type === tks.AT_TEXT_BLOCK_OPEN ? tks.AT_TEXT_BLOCK_OPEN : '', cur.type === tks.AT_TEXT_BLOCK_OPEN);
    }
}

export = Parser;

