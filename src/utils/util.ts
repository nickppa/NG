const path = require('path');
const fs = require('fs');

const regUpper = /[A-Z]/;
const regEmpty = /[ _\-\.\/]/;

interface ReadFileInfo {
    path: string;
    dirPaths: string[];
    fileName: string;
    fullFileName: string;
}

class Util {
    constructor(){
    }

    getPath(root: string, filePath: string): string {
        if(!filePath)
            return filePath;
        if (path.isAbsolute(filePath))
            return filePath;
        return path.join(root, filePath);
    }

    toCamelCase(text: string | string[], ignoreArrayInside = false): string {
        let texts = this._getTexts(text, ignoreArrayInside);
        let result = '';
        for (const t of texts) {
            if (result) {
                result += this._upperFirst(t);
            } else {
                result += t;
            }
        }
        return result;
    }

    toPascalCase(text: string | string[], separator = '', ignoreArrayInside = false): string {
        let texts = this._getTexts(text, ignoreArrayInside);
        return texts.map(t => this._upperFirst(t)).join(separator);
    }

    toSnakeCase(text: string | string[], separator = '-', ignoreArrayInside = false): string {
        let texts = this._getTexts(text, ignoreArrayInside);
        return texts.join(separator);
    }

    _getTexts(text: string | string[], ignoreArrayInside = false): string[] {
        if (Array.isArray(text)) {
            if (ignoreArrayInside)
                return text.filter(x => !!x).map(x => x.toLowerCase());
            let result: string[] = [];
            text.filter(x => !!x).forEach(x => {
                result.push(...this._splitText(x));
            });
            return result;
        }
        return this._splitText(text);
    }

    _upperFirst(text: string): string {
        if (!text) return text;
        return text[0].toUpperCase() + text.substring(1);
    }

    _splitText(text: string): string[] {
        if (!text) return [];
        let result: string[] = [];
        if (regEmpty.test(text) || regUpper.test(text)) {
            let temp = '';
            let lastIsUpper = false;
            for (let char of text) {
                if (char >= 'A' && char <= 'Z') {
                    if (!lastIsUpper && temp) {
                        result.push(temp);
                        temp = '';
                    }
                    temp += char.toLowerCase();
                    lastIsUpper = true;
                } else if (char === ' ' || char === '-' || char === '_' || char === '.' || char === '/') {
                    result.push(temp);
                    temp = '';
                    lastIsUpper = false;
                } else {
                    temp += char;
                    lastIsUpper = false;
                }
            }
            if(temp){
                result.push(temp);
            }
            return result.filter(x => x);
        }
        return [text];
    }

    getMappings({root, baseTemplateDir, templateDir, outputDir, ...props}: {
        root?: string;
        baseTemplateDir: string;
        templateDir: string;
        outputDir: string;
        [key: string]: any;
    }): Array<{ template: string; output: string; [key: string]: any }> {
        let myRoot = !root ? process.cwd() : root;
        let files = this.readAllFiles(this.getPath(myRoot, path.join(baseTemplateDir, templateDir)));
        return files.map(f => ({
                template: path.join(templateDir, ...f.dirPaths, f.fullFileName),
                output: path.join(outputDir, ...f.dirPaths, f.fullFileName),
                ...props
            }));
    }

    readAllTemplates({root, baseTemplateDir, templateDir}: {
        root?: string;
        baseTemplateDir: string;
        templateDir: string;
    }): ReadFileInfo[] {
        let myRoot = !root ? process.cwd() : root;
        return this.readAllFiles(this.getPath(myRoot, path.join(baseTemplateDir, templateDir)));
    }
    
    readAllFiles(filePath: string, dirPaths: string[] = []): ReadFileInfo[] {
        let dir = filePath;
        if (!dir)
            return [];
        let files = fs.readdirSync(dir);
        if (!files)
            return [];
        let result: ReadFileInfo[] = [];
        for (const file of files) {
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

export = new Util();
