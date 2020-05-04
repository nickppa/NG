const path = require('path');

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
}

module.exports = new Util();