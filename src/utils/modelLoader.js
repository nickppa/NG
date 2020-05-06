const file = require('./file');

class ModelLoader {
    constructor(config) {
        this._modelCache = {};
        this.config = config;
    }

    getModelFile(filePath) {
        return this.getModel(file.getModelFile(filePath))
    }

    getModel(f) {
        if (this._modelCache[f.path])
            return this._modelCache[f.path];
        let Class = require(f.path);
        let model = new Class();
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
                model[i]._ref = this.getModelFile(model[i].ref);
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

module.exports = new ModelLoader();