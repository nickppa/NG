const path = require('path');

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
}

module.exports = new Util();