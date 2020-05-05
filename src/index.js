const Generator = require('./utils/generator');
const util = require('./utils/util');
const file = require('./utils/file');
const modelLoader = require('./utils/modelLoader');

let configPath = '';
const configTag = "--myconfig=";
// print process.argv
process.argv.forEach(function (val, index, array) {
    if(val.indexOf(configTag) >= 0){
        configPath = util.getPath(process.cwd(), val.substring(configTag.length));
    }
});

if(!configPath){
    console.error('must have --myconfig=xxx argument');
    process.exit();
}

const config = require(configPath);
if(!config.root)
    config.root = process.cwd();
const mapping = config.mapping;
file.config = config;
modelLoader.config = config;

if(config.deleteOutput) {
    file.cleanOutput();
}

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
    helper: {
        ...baseHelper, ...(config.helper || {})
    },
    global: config.global
});

async function main(){
    const files = await file.readAllModels();
    let allMappings = [];
    console.log(`begin load models`);
    for(let f of files){
        let model = modelLoader.getModel(f)
        let mappings = mapping(model);
        allMappings.push(...mappings);
    }
    console.log(`end load models`);
    allMappings = allMappings.sort((a, b) => {
        let seq = compare(a.seq, b.seq);
        if(seq === 0)
            return compare(a.scope, b.scope);
        else
            return seq;
    });
    console.log(`begin generate`);
    for(let m of allMappings){
        console.log(`--processing template ${m.template}`);
        const text = generator.render({filePath: m.template, model: m.model, scope: m.scope});
        await file.output({filePath: m.output, data: text});
        console.log(`output to ${m.output}`);
    }
    console.log(`end generate`);
}

function compare(a, b){
    if(!a && !b) return 0;
    if(!a) return -1;
    if(!b) return 1;
    if(a == b) return 0;
    return a > b ? 1 : -1;
}

main();