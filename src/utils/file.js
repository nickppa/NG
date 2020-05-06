const fs = require('fs');
const path = require('path');
const util = require('./util');

class File {
    constructor(config) {
        this.config = config;
    }

    getTemplateDir() {
        return this._getPath(path.join(this.config.templateDir));
    }

    getOutputDir() {
        return this._getPath(path.join(this.config.outputDir));
    }

    cleanOutput() {
        this.removeDir(this.getOutputDir());
    }

    getTemplatePath(filePath) {
        return this._getPath(path.join(this.config.templateDir, filePath));
    }

    readAllModels() {
        return this.readAllFiles(this.config.modelsDir);
    }

    getModelFile(filePath) {
        let dirPaths = filePath.split('/').slice(0, -1);
        let fileName = filePath.split('/').slice(-1)[0] || '';
        let fullFileName = fileName;
        fileName = fileName.substring(0, fileName.lastIndexOf('.'));
        return { path: this._getPath(path.join(this.config.modelsDir, filePath)), dirPaths, fileName, fullFileName };
    }

    output({ filePath, data }) {
        return this.writeFile(filePath, data);
    }

    readFile(filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(this._getPath(filePath), 'utf8', (err, data) => {
                if (err) {
                    console.error(`error in read file: ${filePath}`, err);
                    resolve('');
                    return;
                }
                resolve(data);
            });
        });
    }

    writeFile(filePath, text) {
        return new Promise((resolve, reject) => {
            this._ensureDir(path.join(this.getOutputDir(), filePath)).then(p => {
                if (!p) {
                    resolve();
                    return;
                }
                fs.writeFile(p, text, 'utf8', err => {
                    if (err) {
                        console.error(`error in write file: ${p}`, err);
                        resolve();
                        return;
                    }
                    console.log(`output...${p}`);
                    resolve();
                });
            }).catch(err => {
                console.error(`error in writeFile: ${filePath}`, err);
                reject(err);
            });
        });
    }

    removeDir(dirPath) {
        if (!fs.existsSync(dirPath)) return;

        const files = fs.readdirSync(dirPath);
        if (files && files.length > 0) {
            files.forEach(filename => {
                const subPath = path.join(dirPath, filename);
                if (fs.statSync(subPath).isDirectory()) {
                    this.removeDir(subPath);
                } else {
                    fs.unlinkSync(subPath);
                }
            })
        }
        fs.rmdirSync(dirPath);
    }

    async readAllFiles(filePath, dirPaths = []) {
        let dir = this._getPath(filePath);
        if (!dir)
            return [];
        let files = await this._readdir(dir);
        if (!files)
            return [];
        let result = [];
        for (let file of files) {
            let pathName = path.join(dir, file);
            let stats = await this._getStat(pathName);
            if (!stats)
                continue;
            if (stats.isDirectory()) {
                let res = await this.readAllFiles(pathName, [...dirPaths, file]);
                result.push(...res);
                continue;
            }
            if (stats.isFile()) {
                result.push({ path: pathName, dirPaths, fileName: file.substring(0, file.lastIndexOf('.')), fullFileName: file });
            }
        }
        return result;
    }

    _getStat(filePath) {
        return new Promise((resolve, reject) => {
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error(`error in get stat: ${pathName}`, err);
                    resolve();
                    return;
                }
                resolve(stats);
            });
        });
    }

    _readdir(dir) {
        return new Promise((resolve, reject) => {
            fs.readdir(dir, (err, files) => {
                if (err) {
                    console.error(`error in read dir: ${dir}`, err);
                    resolve();
                    return;
                }
                resolve(files);
            });
        });
    }

    _ensureDir(filePath) {
        return new Promise((resolve, reject) => {
            let dir = path.dirname(filePath);
            fs.access(dir, fs.constants.F_OK, (err) => {
                if (err) {
                    fs.mkdir(dir, { recursive: true }, (err) => {
                        if (err) {
                            console.error(`error in create dir: ${dir}`, err);
                            resolve(null);
                            return;
                        }
                        resolve(filePath);
                    });
                } else {
                    resolve(filePath);
                }
            });
        });
    }

    _getPath(filePath) {
        return util.getPath(this.config.root, filePath);
    }
}

module.exports = new File();