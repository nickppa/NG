const NGenerator = require('./ngenerator');
const util = require('./utils/util');

let configPath = '';
const configTag = "--myconfig=";
// print process.argv
process.argv.forEach(function (val, index, array) {
    if(val.indexOf(configTag) >= 0){
        configPath = util.getPath(process.cwd(), val.substring(configTag.length));
    }
});

if(!configPath){
    console.error('it must have --myconfig=xxx argument');
    process.exit();
}

const config = require(configPath);
const nGenerater = new NGenerator();

nGenerater.generate(config);
