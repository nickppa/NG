export interface ModelLike {
    type?: string;
    name?: string;
    _modelName?: string;
    _dirPaths: string[];
    [key: string]: any;
}

export interface MappingItem {
    scope?: string;
    seq?: number;
    model?: ModelLike;
    template: string;
    output: string;
    noRender?: boolean;
}

export interface GenerateConfig {
    root?: string;
    outputDir: string;
    deleteOutput?: boolean;
    modelsDir: string;
    templateDir: string;
    helper?: Record<string, (...args: any[]) => any>;
    customModelProp?: (model: ModelLike) => void;
    customFieldProp?: (field: Record<string, any>) => void;
    global?: Record<string, any>;
    mapping: (model: ModelLike) => Promise<MappingItem[]> | MappingItem[];
}

export type NGConfig = GenerateConfig;
