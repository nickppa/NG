const NGenerator = require('./ngenerator');
const util = require('./utils/util');
import type { GenerateConfig } from './types/config';

let configPath = '';
const configTag = "--myconfig=";
// print process.argv
process.argv.forEach(function (val: string) {
    if(val.indexOf(configTag) >= 0){
        configPath = util.getPath(process.cwd(), val.substring(configTag.length));
    }
});

if(!configPath){
    console.error('it must have --myconfig=xxx argument');
    process.exit();
}

const config = require(configPath) as GenerateConfig;
const nGenerater = new NGenerator();

nGenerater.generate(config);

export {};

