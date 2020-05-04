const file = require('./file');
const path = require('path');
const templateEngine = require('../templateEngine');

class Generator{
    constructor(config){
        templateEngine.config = { root: file.getTemplateDir(), global: config.global };
        templateEngine.helper = config.helper;
    }

    render({filePath, model, scope}){
        let tpl = templateEngine.compileFile(filePath);
        return templateEngine.run({compiled: tpl, model, scope});
    }
}

module.exports = Generator;