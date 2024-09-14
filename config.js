const util = require('./src/utils/util');

const root = '';
const templateDir = 'templates';
const global = {
    appName: 'HelloWord'
};

module.exports = {
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
        model._modelName = model._dirPaths.slice(-1)[0] || '';
    },
    customFieldProp: function (field) {
    },
    global,
    mapping: async function (model) {
        if (model.type === 'edit') {
            return [{
                scope: `root.${model._modelName}`,
                seq: 0,
                model,
                template: 'frontend/react-antd/create/index',
                output: 'frontend/src/pages/' + util.toSnakeCase([...model._dirPaths], '/', true) + "/" + util.toSnakeCase(model.name, '-') + '.js'
            }];
        }
        if (model.type === 'model') {
            return [{
                scope: `root.${model._modelName}`,
                seq: 1,
                model,
                template: 'frontend/react-antd/service/index',
                output: 'frontend/src/service/' + util.toSnakeCase(model._modelName, '-') + '.js'
            }];
        }
        return [];
    }
};