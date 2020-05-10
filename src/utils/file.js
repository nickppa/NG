const fs = require('fs');
const path = require('path');
const util = require('./util');

class File {
    constructor(config) {
        this.config = config;
    }

    getTemplateDir() {
        return this._getPath(this.config.root, path.join(this.config.templateDir));
    }

    getOutputDir() {
        return this._getPath(this.config.root, path.join(this.config.outputDir));
    }

    getModelsDir() {
        return this._getPath(this.config.root, path.join(this.config.modelsDir));
    }

    cleanOutput() {
        File.RemoveDir(this.getOutputDir());
    }

    getTemplatePath(filePath) {
        return this._getPath(this.config.root, path.join(this.config.templateDir, filePath));
    }

    getOutputPath(filePath) {
        return this._getPath(this.config.root, path.join(this.config.outputDir, filePath));
    }

    getModelsPath(filePath) {
        return this._getPath(this.config.root, path.join(this.config.modelsDir, filePath));
    }

    readAllModels() {
        return File.ReadAllFiles(this.getModelsDir());
    }

    getModelFile(filePath) {
        let dirPaths = filePath.split('/').slice(0, -1);
        let fileName = filePath.split('/').slice(-1)[0] || '';
        let fullFileName = fileName;
        fileName = fileName.substring(0, fileName.lastIndexOf('.'));
        return { path: this.getModelsPath(filePath), dirPaths, fileName, fullFileName };
    }

    output({ filePath, data }) {
        return this.writeFileToOutput(filePath, data);
    }

    writeFileToOutput(filePath, text) {
        return new Promise((resolve, reject) => {
            File._EnsureDir(path.join(this.getOutputDir(), filePath)).then(p => {
                if (!p) {
                    resolve();
                    return;
                }
                fs.writeFile(p, text, 'utf8', err => {
                    if (err) {
                        console.error(`An error happened when writting the file: ${p}`, err);
                        resolve();
                        return;
                    }
                    resolve();
                });
            }).catch(err => {
                console.error(`An error happened in the 'writeFile' function: ${filePath}`, err);
                reject(err);
            });
        });
    }

    static ReadFile(filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`An error happened when reading the file: ${filePath}`, err);
                    resolve('');
                    return;
                }
                resolve(data);
            });
        });
    }

    static RemoveDir(dirPath) {
        if (!fs.existsSync(dirPath)) return;

        const files = fs.readdirSync(dirPath);
        if (files && files.length > 0) {
            files.forEach(filename => {
                const subPath = path.join(dirPath, filename);
                if (fs.statSync(subPath).isDirectory()) {
                    File.RemoveDir(subPath);
                } else {
                    fs.unlinkSync(subPath);
                }
            })
        }
        fs.rmdirSync(dirPath);
    }

    static Copy(from, to) {
        fs.createReadStream(from).pipe(fs.createWriteStream(to));
    }

    static async ReadAllFiles(filePath, dirPaths = []) {
        let dir = filePath;
        if (!dir)
            return [];
        let files = await File._ReadDir(dir);
        if (!files)
            return [];
        let result = [];
        for (let file of files) {
            let pathName = path.join(dir, file);
            let stats = await File._GetStat(pathName);
            if (!stats)
                continue;
            if (stats.isDirectory()) {
                let res = await File.ReadAllFiles(pathName, [...dirPaths, file]);
                result.push(...res);
                continue;
            }
            if (stats.isFile()) {
                result.push({ path: pathName, dirPaths, fileName: file.substring(0, file.lastIndexOf('.')), fullFileName: file });
            }
        }
        return result;
    }

    static _GetStat(filePath) {
        return new Promise((resolve, reject) => {
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error(`An error happened when getting the stat: ${pathName}`, err);
                    resolve();
                    return;
                }
                resolve(stats);
            });
        });
    }

    static _ReadDir(dir) {
        return new Promise((resolve, reject) => {
            fs.readdir(dir, (err, files) => {
                if (err) {
                    console.error(`An error happened when reading the dir: ${dir}`, err);
                    resolve();
                    return;
                }
                resolve(files);
            });
        });
    }

    static _EnsureDir(filePath) {
        return new Promise((resolve, reject) => {
            let dir = path.dirname(filePath);
            fs.access(dir, fs.constants.F_OK, (err) => {
                if (err) {
                    fs.mkdir(dir, { recursive: true }, (err) => {
                        if (err) {
                            console.error(`An error happened when creating the directory: ${dir}`, err);
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

    _getPath(root, filePath) {
        return util.getPath(root, filePath);
    }
}

module.exports = File;