const Lexer = require('./lexer');
const Parser = require('./parser');
const Cleaner = require('./cleaner');
const CodeGen = require('./codeGen');
const path = require('path');
const fs = require('fs');

class TemplateEngine {
    constructor(config) {
        this.config = config;
        this._cache = {};
        this.helper = {};
        this.scopeNgs = {};
    }

    compileFile(filePath) {
        if (this._cache[filePath])
            return this._cache[filePath];
        let text = fs.readFileSync(this._getPath(filePath), { encoding: 'utf8' });
        this._cache[filePath] = this.compile(text);
        return this._cache[filePath];
    }

    compile(template) {
        let result = this.generateCode(this.clean(this.preCompile(template)));
        let func = new Function("ng", "global", "model", result.code);
        func.sourcecode = result.code;
        func.rootNode = result.rootNode;
        return func;
    }

    run({compiled, model, scope, ng = null}) {
        let myNg = ng;
        if (!myNg) {
            myNg = this.initNg(scope);
        }
        let result = compiled(myNg, this.config.global, model);
        let pattern = /@\[(?<key>[_$a-zA-Z0-9\xA0-\uFFFF]+)\]/g;
        result = result.replace(pattern, (m, cache)=>{
            let text = this._getCacheText(scope, myNg, cache);
            if (text) {
                let tabs = myNg._getCacheTab(cache);
                let tab = (text[0] === '\n') ? tabs.tabs : tabs.tabsWithChar;
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
            return getCacheText(cache);
        }
        let scopes = Object.getOwnPropertyNames(this.scopeNgs);
        let allMatchScopes = (scopes.filter(x => x.startsWith(`${scope}.`)) || []).sort((a, b) => a.length - b.length);
        let tempCache = { tags: {}, tab: '' };
        let flag = false;
        let ngs = [];
        for(let key of allMatchScopes){
            ngs.push(this.scopeNgs[key]);
        }
        ngs.push(currentNg);
        for(let ng of ngs){
            let cache = ng.getCache(cacheKey);
            if(cache == null){
                continue;
            }
            let tagKeys = Object.getOwnPropertyNames(cache.tags);
            for(let tagKey of tagKeys){
                tempCache = setCacheText(tempCache, tagKey, cache.tags[tagKey]);
                flag = true;
            }
        }
        if(flag)
            return getCacheText(tempCache);
        return null;
    }

    initNg(scope = '') {
        if(!scope)
            return this._buildNewNg(scope);
        if(!this.scopeNgs[scope]) {
            this.scopeNgs[scope] = this._buildNewNg(scope);
        }
        return this.scopeNgs[scope]
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
        let result = new NG(scope);
        for (let item in this.helper) {
            if(NG.prototype[item]){
                continue;
            }
            NG.prototype[item] = this.helper[item];
        }
        return result;
    }
}

const templateEngine = new TemplateEngine();

class NG {
    constructor(scope) {
        this._cache = {};
        this._currentTab = '';
        this._scope = scope;
    }

    include(filePath, model) {
        let func = templateEngine.compileFile(filePath);
        // let currentTab = this._currentTab;
        let res = this.__res;
        // this._currentTab = '';
        let result = templateEngine.run({compiled: func, model, scope: this._scope, ng: this}) || '';
        this.__res = res;
        let tabs = this._getTabFromText(res);
        let tab = (result && result[0] === '\n') ? tabs.tabs : tabs.tabsWithChar;
        return result.replace(/\n/g, '\n' + tab);
    }

    _getTabFromText(text) {
        if(!text) return { tabs: '', tabsWithChar: '' };
        let tabs = '';
        let tabsWithChar = '';
        for(let i = text.length - 1; i >= 0; i--){
            if(text[i] === '\n') break;
            if(/[^\S]/.test(text[i])) {
                tabs = text[i] + tabs;
                tabsWithChar = text[i] + tabsWithChar;
            } else{
                tabsWithChar = ' ' + tabsWithChar;
            }
        }
        return {tabs, tabsWithChar};
    }

    _setCurrentTab(tab) {
        this._currentTab = tab || '';
    }

    _setCacheTab(cacheKey) {
        let tab = this._getTabFromText(this.__res);
        if (!this._cache[cacheKey]) {
            this._cache[cacheKey] = {
                tags: {},
                tab: tab
            };
        } else {
            this._cache[cacheKey].tab = tab;
        }
    }

    _getCacheTab(cacheKey) {
        if (!this._cache[cacheKey]) return { tabs: '', tabsWithChar: '' };
        return this._cache[cacheKey].tab;
    }

    getCache(cacheKey) {
        return this._cache[cacheKey];
    }

    _setCacheText(cacheKey, tag, text) {
        this._cache[cacheKey] = setCacheText(this._cache[cacheKey], tag, text);
    }
}

function setCacheText(cache, tag, text){
    let tempTag = tag || '';
    if (!cache) {
        cache = {
            tags: { [tempTag]: text || '' },
            tab: { tabs: '', tabsWithChar: '' }
        };
    } else {
        if (cache.tags[tempTag] && !tempTag){
            cache.tags[tempTag] += text || '';
        } else if(!cache.tags[tempTag]) {
            cache.tags[tempTag] = text || '';
        }
    }
    return cache;
}

function getCacheText(cache){
    let tagKeys = Object.getOwnPropertyNames(cache.tags);
    let text = '';
    for(let key of tagKeys){
        text += cache.tags[key] || '';
    }
    return text;
}

module.exports = templateEngine;