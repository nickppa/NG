const fs = require('fs');
const path = require('path');
const util = require('./util');
import type { Stats } from 'fs';

interface FileConfig {
    root: string;
    outputDir: string;
    modelsDir: string;
    templateDir: string;
}

interface FileNodeInfo {
    path: string;
    dirPaths: string[];
    fileName: string;
    fullFileName: string;
}

interface OutputArgs {
    filePath: string;
    data: string;
}

class File {
    config: FileConfig;

    constructor(config: FileConfig) {
        this.config = config;
    }

    getTemplateDir(): string {
        return this._getPath(this.config.root, path.join(this.config.templateDir));
    }

    getOutputDir(): string {
        return this._getPath(this.config.root, path.join(this.config.outputDir));
    }

    getModelsDir(): string {
        return this._getPath(this.config.root, path.join(this.config.modelsDir));
    }

    cleanOutput(): void {
        File.RemoveDir(this.getOutputDir());
    }

    getTemplatePath(filePath: string): string {
        return this._getPath(this.config.root, path.join(this.config.templateDir, filePath));
    }

    getOutputPath(filePath: string): string {
        return this._getPath(this.config.root, path.join(this.config.outputDir, filePath));
    }

    getModelsPath(filePath: string): string {
        return this._getPath(this.config.root, path.join(this.config.modelsDir, filePath));
    }

    readAllModels(): Promise<FileNodeInfo[]> {
        return File.ReadAllFiles(this.getModelsDir());
    }

    getModelFile(filePath: string): FileNodeInfo {
        let dirPaths = filePath.split('/').slice(0, -1);
        let fileName = filePath.split('/').slice(-1)[0] || '';
        let fullFileName = fileName;
        fileName = fileName.substring(0, fileName.lastIndexOf('.'));
        return { path: this.getModelsPath(filePath), dirPaths, fileName, fullFileName };
    }

    output({ filePath, data }: OutputArgs): Promise<void> {
        return this.writeFileToOutput(filePath, data);
    }

    writeFileToOutput(filePath: string, text: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            File._EnsureDir(path.join(this.getOutputDir(), filePath)).then(p => {
                if (!p) {
                    resolve();
                    return;
                }
                fs.writeFile(p, text, 'utf8', (err: NodeJS.ErrnoException | null) => {
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

    static ReadFile(filePath: string): Promise<string> {
        return new Promise<string>((resolve) => {
            fs.readFile(filePath, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
                if (err) {
                    console.error(`An error happened when reading the file: ${filePath}`, err);
                    resolve('');
                    return;
                }
                resolve(data);
            });
        });
    }

    static RemoveDir(dirPath: string): void {
        if (!fs.existsSync(dirPath)) return;

        const files = fs.readdirSync(dirPath);
        if (files && files.length > 0) {
            files.forEach((filename: string) => {
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

    static Copy(from: string, to: string): void {
        fs.createReadStream(from).pipe(fs.createWriteStream(to));
    }

    static async ReadAllFiles(filePath: string, dirPaths: string[] = []): Promise<FileNodeInfo[]> {
        let dir = filePath;
        if (!dir)
            return [];
        let files = await File._ReadDir(dir);
        if (!files)
            return [];
        let result: FileNodeInfo[] = [];
        for (const file of files) {
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

    static _GetStat(filePath: string): Promise<Stats | undefined> {
        return new Promise<Stats | undefined>((resolve) => {
            fs.stat(filePath, (err: NodeJS.ErrnoException | null, stats: Stats) => {
                if (err) {
                    console.error(`An error happened when getting the stat: ${filePath}`, err);
                    resolve(undefined);
                    return;
                }
                resolve(stats);
            });
        });
    }

    static _ReadDir(dir: string): Promise<string[] | undefined> {
        return new Promise<string[] | undefined>((resolve) => {
            fs.readdir(dir, (err: NodeJS.ErrnoException | null, files: string[]) => {
                if (err) {
                    console.error(`An error happened when reading the dir: ${dir}`, err);
                    resolve(undefined);
                    return;
                }
                resolve(files);
            });
        });
    }

    static _EnsureDir(filePath: string): Promise<string | null> {
        return new Promise<string | null>((resolve) => {
            let dir = path.dirname(filePath);
            fs.access(dir, fs.constants.F_OK, (err: NodeJS.ErrnoException | null) => {
                if (err) {
                    fs.mkdir(dir, { recursive: true }, (err: NodeJS.ErrnoException | null) => {
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

    _getPath(root: string, filePath: string): string {
        return util.getPath(root, filePath);
    }
}

export = File;
