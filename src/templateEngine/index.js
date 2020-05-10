const Lexer = require('./lexer');
const Parser = require('./parser');
const Cleaner = require('./cleaner');
const CodeGen = require('./codeGen');
const NG = require('./ng');
const path = require('path');
const fs = require('fs');

class TemplateEngine {
    constructor(config) {
        this.config = config;
        this._cache = {};
        this._scopeNgs = {};
    }

    compileFile(filePath) {
        if (this._cache[filePath])
            return this._cache[filePath];
        let text = fs.readFileSync(this._getPath(filePath), { encoding: 'utf8' });
        this._cache[filePath] = this.compile(text, filePath);
        return this._cache[filePath];
    }

    compile(template, filePath = '') {
        let result = this.generateCode(this.clean(this.preCompile(template)));
        try {
            let func = new Function("ng", "global", "model", result.code);
            func.sourcecode = result.code;
            func.rootNode = result.rootNode;
            func.path = filePath;
            return func;
        } catch (err) {
            console.error(`An error happened when compiling the template ${filePath}.`, { err, template });
        }
    }

    run({compiled, model, scope, ng = null}) {
        let myNg = ng;
        if (!myNg) {
            myNg = this.initNg(scope);
        }
        let result = '';
        try{
            result = compiled(myNg, this.config.global, model);
        } catch (err) {
            console.error(`An error happened when running the compiled template ${compiled.path}.`, { err, sourcecode: compiled.sourcecode });
        }
        let pattern = /@\[(?<key> ?[_$a-zA-Z0-9\xA0-\uFFFF]+)\]/g;
        result = result.replace(pattern, (m, key)=>{
            let cache = (key || '').trim();
            let text = this._getCacheText(scope, myNg, cache);
            if (text) {
                let tabs = myNg._getCacheTab(cache);
                let tab = (key[0] === ' ') ? tabs.tabs : tabs.tabsWithChar;
                return text.replace(/\n/g, '\n' + tab);
            } else if(text == '') {
                return '@[__empty__]';
            } else {
                return m;
            }
        });
        let regexEmpty = new RegExp(`[ \\t\\v]*@\\[__empty__\\]\\n`, 'g');
        let regex = new RegExp(`@\\[__empty__\\]`, 'g');
        result = result.replace(regexEmpty, '').replace(regex, '');
        return result;
    }

    _getCacheText(scope, currentNg, cacheKey){
        if (!scope) {
            let cache = currentNg.getCache(cacheKey);
            if(cache == null){
                return null;
            }
            return NG.GetCacheText(cache);
        }
        let scopes = Object.getOwnPropertyNames(this._scopeNgs);
        let allMatchScopes = (scopes.filter(x => x.startsWith(`${scope}.`)) || []).sort((a, b) => a.length - b.length);
        let tempCache = { tags: {}, tab: '' };
        let flag = false;
        let ngs = [];
        for(let key of allMatchScopes){
            ngs.push(this._scopeNgs[key]);
        }
        ngs.push(currentNg);
        for(let ng of ngs){
            let cache = ng.getCache(cacheKey);
            if(cache == null){
                continue;
            }
            let tagKeys = Object.getOwnPropertyNames(cache.tags);
            for(let tagKey of tagKeys){
                tempCache = NG.SetCacheText(tempCache, tagKey, cache.tags[tagKey]);
                flag = true;
            }
        }
        if(flag)
            return NG.GetCacheText(tempCache);
        return null;
    }

    initNg(scope = '') {
        if(!scope)
            return this._buildNewNg(scope);
        if(!this._scopeNgs[scope]) {
            this._scopeNgs[scope] = this._buildNewNg(scope);
        }
        return this._scopeNgs[scope]
    }

    generateCode(nodes) {
        let codeGen = new CodeGen();
        return codeGen.generateCode(nodes);
    }

    preCompile(template) {
        let l = new Lexer();
        l.write(template);
        let tokens = l.read();
        let parser = new Parser();
        return parser.convert(tokens);
    }

    clean(nodes) {
        let cleaner = new Cleaner();
        return cleaner.clean(nodes);
    }

    _getPath(filePath) {
        if (this.config.root) {
            return path.join(this.config.root, filePath);
        }
        return filePath;
    }

    _buildNewNg(scope){
        let result = new NG(scope, this);
        if(this.config.helper){
            for (let item in this.config.helper) {
                if(NG.prototype[item]){
                    continue;
                }
                NG.prototype[item] = this.config.helper[item];
            }
        }
        return result;
    }
}

module.exports = TemplateEngine;