const chalk = require('chalk');

interface ModelFileInfo {
    path: string;
    dirPaths: string[];
    fileName: string;
    fullFileName: string;
}

interface FileLike {
    getModelFile(filePath: string): ModelFileInfo;
}

interface LoaderConfig {
    customModelProp?: (model: Record<string, any>) => void;
    customFieldProp?: (field: Record<string, any>) => void;
}

class ModelLoader {
    _modelCache: Record<string, Record<string, any>>;
    config: LoaderConfig;
    file: FileLike;

    constructor(config: LoaderConfig, file: FileLike) {
        this._modelCache = {};
        this.config = config;
        this.file = file;
    }

    getModel(f: ModelFileInfo): Record<string, any> | null {
        if (this._modelCache[f.path])
            return this._modelCache[f.path];
        let model: Record<string, any> | null = null;
        try{
            model = require(f.path);
        } catch (err) {
            console.log(chalk.red(`An error happened when loading the model ${f.path}.`));
            console.log(chalk.red(chalk.bold(err)));
        }
        if(model === null) return null;
        this._modelCache[f.path] = model;
        model._path = f.path;
        model._fileName = f.fileName;
        model._fullFileName = f.fullFileName;
        model._dirPaths = f.dirPaths;
        this._processObject(model);
        this.config.customModelProp && this.config.customModelProp(model);
        return model;
    }

    _processObject(obj: any): any {
        if(!obj) return obj;
        if(Array.isArray(obj)) {
            for(let i = 0; i < obj.length; i++) {
                obj[i] = this._processObject(obj[i]);
            }
            return obj;
        } else if (Object.prototype.toString.call(obj) !== '[object Object]') {
            return obj;
        }
        for (let key in obj) {
            if(Array.isArray(obj[key])) {
                for(let i = 0; i < obj[key].length; i++) {
                    obj[key][i] = this._processObject(obj[key][i]);
                }
                continue;
            }
            if(Object.prototype.toString.call(obj[key]) !== '[object Object]')
                continue;
            if (obj[key]._ref && typeof obj[key]._ref === 'string') {
                obj[key]._ref = this.getModel(this.file.getModelFile(obj[key]._ref)) ?? obj[key]._ref;
            }
            this.config.customFieldProp && this.config.customFieldProp(obj[key]);
            obj[key] = this._processObject(obj[key]);
        }
        return obj;
    }
}

export = ModelLoader;
