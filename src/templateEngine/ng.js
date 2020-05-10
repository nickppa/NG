class NG {
    constructor(scope, templateEngine) {
        this._cache = {};
        this._currentTab = '';
        this._scope = scope;
        this.templateEngine = templateEngine;
    }

    include(filePath, model) {
        let func = this.templateEngine.compileFile(filePath.trim());
        let res = this.__res;
        if(func === null) return '';
        let result = this.templateEngine.run({compiled: func, model, scope: this._scope, ng: this}) || '';
        this.__res = res;
        let tabs = this._getTabFromText(res);
        let tab = (filePath && filePath[0] === ' ') ? tabs.tabs : tabs.tabsWithChar;
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
                tabs = '';
                tabsWithChar = ' ' + tabsWithChar;
            }
        }
        return {tabs, tabsWithChar};
    }

    _setCurrentTab(tab) {
        this._currentTab = tab || '';
    }

    _setCacheTab(cacheKey) {
        let cache = cacheKey.trim();
        let tab = this._getTabFromText(this.__res);
        if (!this._cache[cache]) {
            this._cache[cache] = {
                tags: {},
                tab: tab
            };
        } else {
            this._cache[cache].tab = tab;
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
        this._cache[cacheKey] = NG.SetCacheText(this._cache[cacheKey], tag, text);
    }

    static SetCacheText(cache, tag, text){
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

    static GetCacheText(cache){
        let tagKeys = Object.getOwnPropertyNames(cache.tags);
        let text = '';
        for(let key of tagKeys){
            text += cache.tags[key] || '';
        }
        return text;
    }
}

module.exports = NG;