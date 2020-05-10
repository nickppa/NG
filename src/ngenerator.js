const Generator = require('./utils/generator');
const util = require('./utils/util');
const File = require('./utils/file');
const ModelLoader = require('./utils/modelLoader');

class NGenerator{
    constructor(){
    }

    async generate(config){
        // init config
        if(!config.root)
            config.root = process.cwd();
        const mapping = config.mapping;
        const file = new File(config);
        const modelLoader = new ModelLoader(config, file);

        const baseHelper = {
            toCamelCase: (...args) => {
                return util.toCamelCase(...args);
            },
            toPascalCase: (...args) => {
                return util.toPascalCase(...args);
            },
            toSnakeCase: (...args) => {
                return util.toSnakeCase(...args);
            }
        };

        const generator = new Generator({
            templateDir: file.getTemplateDir(),
            helper: {
                ...baseHelper, ...(config.helper || {})
            },
            global: config.global
        });

        // generate
        if(config.deleteOutput) {
            file.cleanOutput();
        }

        return await this._innerGenerate({file, modelLoader, mapping, generator});
    }

    async _innerGenerate({file, modelLoader, mapping, generator}){
        const files = await file.readAllModels();
        let allMappings = [];
        console.log(`begin load models`);
        for(let f of files){
            let model = modelLoader.getModel(f);
            if(model === null) continue;
            let mappings = await mapping(model);
            allMappings.push(...mappings);
        }
        console.log(`end load models`);
        allMappings = allMappings.sort((a, b) => {
            let seq = NGenerator.Compare(a.seq, b.seq);
            if(seq === 0)
                return NGenerator.Compare(a.scope, b.scope);
            else
                return seq;
        });
        console.log(`begin generate`);
        for(let m of allMappings){
            // console.log(`--processing template ${m.template}`);
            if(m.noRender){
                File.Copy(file.getTemplatePath(m.template), file.getOutputPath(m.output));
                console.log(`copied to ${m.output}`);
                continue;
            }
            const text = generator.render({filePath: m.template, model: m.model, scope: m.scope});
            await file.output({filePath: m.output, data: text});
            console.log(`output to ${m.output}`);
        }
        console.log(`end generate`);
    }

    static Compare(a, b){
        if(!a && !b) return 0;
        if(!a) return -1;
        if(!b) return 1;
        if(a == b) return 0;
        return a > b ? 1 : -1;
    }
}

module.exports = NGenerator;