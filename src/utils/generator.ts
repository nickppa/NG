const TemplateEngine = require('../templateEngine');

interface GeneratorConfig {
    templateDir: string;
    helper?: Record<string, (...args: any[]) => any>;
    global?: Record<string, any>;
}

interface RenderArgs {
    filePath: string;
    model: any;
    scope?: string;
}

class Generator{
    templateEngine: any;

    constructor(config: GeneratorConfig){
        this.templateEngine = new TemplateEngine({ 
            root: config.templateDir, 
            global: config.global,
            helper: config.helper
        });
    }

    render({filePath, model, scope}: RenderArgs): string {
        let tpl = this.templateEngine.compileFile(filePath);
        return this.templateEngine.run({compiled: tpl, model, scope});
    }
}

export = Generator;
