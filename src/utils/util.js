const path = require('path');
const fs = require('fs');

const regUpper = /[A-Z]/;
const regEmpty = /[ _\-\.]/;
class Util {
    constructor(){
    }

    getPath(root, filePath){
        if(!filePath)
            return filePath;
        if (path.isAbsolute(filePath))
            return filePath;
        return path.join(root, filePath);
    }

    toCamelCase(text, ignoreArrayInside = false) {
        let texts = this._getTexts(text, ignoreArrayInside);
        let result = '';
        for (var t of texts) {
            if (result) {
                result += this._upperFirst(t);
            } else {
                result += t;
            }
        }
        return result;
    }

    toPascalCase(text, ignoreArrayInside = false){
        let texts = this._getTexts(text, ignoreArrayInside);
        let result = '';
        for (var t of texts) {
            result += this._upperFirst(t);
        }
        return result;
    }

    toSnakeCase(text, separator = '-', ignoreArrayInside = false){
        let texts = this._getTexts(text, ignoreArrayInside);
        return texts.join(separator);
    }

    _getTexts(text, ignoreArrayInside = false) {
        if (Array.isArray(text)) {
            if (ignoreArrayInside)
                return text.filter(x => !!x).map(x => x.toLowerCase());
            let result = [];
            text.filter(x => !!x).forEach(x => {
                result.push(...this._splitText(x));
            });
            return result;
        }
        return this._splitText(text);
    }

    _upperFirst(text){
        if (!text) return text;
        return text[0].toUpperCase() + text.substring(1);
    }

    _splitText(text) {
        if (!text) return [];
        let result = [];
        if (regEmpty.test(text) || regUpper.test(text)) {
            let temp = '';
            for (let char of text) {
                if (char >= 'A' && char <= 'Z') {
                    if (temp) {
                        result.push(temp);
                        temp = '';
                    }
                    temp += char.toLowerCase();
                } else if (char === ' ' || char === '-' || char === '_' || char === '.') {
                    result.push(temp);
                    temp = '';
                } else {
                    temp += char;
                }
            }
            if(temp){
                result.push(temp);
            }
            return result.filter(x => x);
        }
        return [text];
    }

    getMappings({root, baseTemplateDir, templateDir, outputDir, ...props}) {
        let myRoot = !root ? process.cwd() : root;
        let files = this.readAllFiles(this.getPath(myRoot, path.join(baseTemplateDir, templateDir)));
        return files.map(f => ({
                template: path.join(templateDir, ...f.dirPaths, f.fullFileName),
                output: path.join(outputDir, ...f.dirPaths, f.fullFileName),
                ...props
            }));
    }

    readAllTemplates({root, baseTemplateDir, templateDir}) {
        let myRoot = !root ? process.cwd() : root;
        return this.readAllFiles(this.getPath(myRoot, path.join(baseTemplateDir, templateDir)));
    }
    
    readAllFiles(filePath, dirPaths = []) {
        let dir = filePath;
        if (!dir)
            return [];
        let files = fs.readdirSync(dir);
        if (!files)
            return [];
        let result = [];
        for (let file of files) {
            let pathName = path.join(dir, file);
            let stats = fs.statSync(pathName);
            if (!stats)
                continue;
            if (stats.isDirectory()) {
                let res = this.readAllFiles(pathName, [...dirPaths, file]);
                result.push(...res);
                continue;
            }
            if (stats.isFile()) {
                result.push({ path: pathName, dirPaths, fileName: file.substring(0, file.lastIndexOf('.')), fullFileName: file });
            }
        }
        return result;
    }
}

module.exports = new Util();