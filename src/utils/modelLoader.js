class ModelLoader {
    constructor(config, file) {
        this._modelCache = {};
        this.config = config;
        this.file = file;
    }

    getModel(f) {
        if (this._modelCache[f.path])
            return this._modelCache[f.path];
        let model = null;
        try{
            let Class = require(f.path);
            if(Class.constructor && typeof Class.constructor === 'function'){
                model = new Class();
            }
        } catch (err) {
            console.error(`An error happened when loading the model ${f.path}.`, err);
        }
        if(model === null) return null;
        this._modelCache[f.path] = model;
        if (model._props) {
            model._props.name = model.constructor.name;
        } else {
            model._props = { name: model.constructor.name };
        }
        model._path = f.path;
        model._fileName = f.fileName;
        model._fullFileName = f.fullFileName;
        model._dirPaths = f.dirPaths;
        for (let i in model) {
            if (i[0] == '_')
                continue;
            if(typeof model[i] !== 'object')
                continue;
            model[i].name = i;
            if (model[i].ref) {
                model[i]._ref = this.getModel(this.file.getModelFile(model[i].ref));
            }
            if (model.__proto__[i]) {
                let names = Object.getOwnPropertyNames(model.__proto__[i]);
                for (let name of names) {
                    if (model[i][name] == undefined) {
                        model[i][name] = model.__proto__[i][name];
                    }
                }
            }
            this.config.customFieldProp && this.config.customFieldProp(model[i]);
        }
        this.config.customModelProp && this.config.customModelProp(model);
        return model;
    }
}

module.exports = ModelLoader;