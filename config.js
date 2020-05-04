const util = require('./src/utils/util');

const root = '';
const templateDir = 'templates';
const global = {
    appName: 'HelloWord'
};

module.exports = {
    debug: true,
    root,
    outputDir: "output",
    deleteOutput: true,
    modelsDir: "models",
    templateDir,
    helper: {
        test: (text) => {
            return 'test' + text;
        }
    },
    customModelProp: function (model) {
        model._props = { ...(model._props || {}), modelName: model._dirPaths.slice(-1)[0] || '' };
    },
    customFieldProp: function (field) {
    },
    global,
    mapping: function (model) {
        if (model._props && model._props.type === 'edit') {
            return [{
                scope: `root.${model._props.modelName}`,
                seq: 0,
                model,
                template: 'frontend/react-antd/create/index',
                output: 'frontend/src/pages/' + util.toSnakeCase([...model._dirPaths], '/', true) + "/" + util.toSnakeCase(model._props.name, '-') + '.js'
            }];
        }
        if (model._props && model._props.type === 'model') {
            return [{
                scope: `root.${model._props.modelName}`,
                seq: 1,
                model,
                template: 'frontend/react-antd/service/index',
                output: 'frontend/src/service/' + util.toSnakeCase(model._props.modelName, '-') + '.js'
            }];
        }
        return [];
    }
};