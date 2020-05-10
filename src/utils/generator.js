const TemplateEngine = require('../templateEngine');

class Generator{
    constructor(config){
        this.templateEngine = new TemplateEngine({ 
            root: config.templateDir, 
            global: config.global,
            helper: config.helper
        });
    }

    render({filePath, model, scope}){
        let tpl = this.templateEngine.compileFile(filePath);
        return this.templateEngine.run({compiled: tpl, model, scope});
    }
}

module.exports = Generator;