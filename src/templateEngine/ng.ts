import type { CacheEntry, TabInfo } from './types';

class NG {
    _cache: Record<string, CacheEntry>;
    _currentTab: string;
    _scope: any;
    templateEngine: any;
    __res: string;

    constructor(scope: any, templateEngine: any) {
        this._cache = {};
        this._currentTab = '';
        this._scope = scope;
        this.templateEngine = templateEngine;
        this.__res = '';
    }

    include(filePath: string, model: any): string {
        let func = this.templateEngine.compileFile(filePath.trim());
        let res = this.__res;
        if(func === null) return '';
        let result = this.templateEngine.run({compiled: func, model, scope: this._scope, ng: this}) || '';
        this.__res = res;
        let tabs = this._getTabFromText(res);
        let tab = (filePath && filePath[0] === ' ') ? tabs.tabs : tabs.tabsWithChar;
        return result.replace(/\n/g, '\n' + tab);
    }

    _getTabFromText(text: string): TabInfo {
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

    _setCurrentTab(tab: string) {
        this._currentTab = tab || '';
    }

    _setCacheTab(cacheKey: string) {
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

    _getCacheTab(cacheKey: string): TabInfo {
        if (!this._cache[cacheKey]) return { tabs: '', tabsWithChar: '' };
        return this._cache[cacheKey].tab;
    }

    getCache(cacheKey: string): CacheEntry | undefined {
        return this._cache[cacheKey];
    }

    _setCacheText(cacheKey: string, tag: string, text: string) {
        this._cache[cacheKey] = NG.SetCacheText(this._cache[cacheKey], tag, text);
    }

    static SetCacheText(cache: CacheEntry | undefined, tag: string, text: string): CacheEntry {
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

    static GetCacheText(cache: CacheEntry): string {
        let tagKeys = Object.getOwnPropertyNames(cache.tags);
        let text = '';
        for(let key of tagKeys){
            text += cache.tags[key] || '';
        }
        return text;
    }
}

export = NG;
