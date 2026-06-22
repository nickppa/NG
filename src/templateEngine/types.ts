export interface Token {
  type: string;
  line: number;
  chr: number;
  val: string;
  _considerEscaped?: boolean;
  toString?: () => string;
}

export interface TabInfo {
  tabs: string;
  tabsWithChar: string;
}

export interface CacheEntry {
  tags: Record<string, string>;
  tab: TabInfo;
}

export interface NodeLike {
  text: string;
  isClosed?: boolean;
  isFromContinue?: boolean;
  nodes?: NodeLike[];
  constructor: { name: string };
  generateCode?: () => string;
  createContinue?: () => NodeLike;
  [key: string]: any;
}

export interface GeneratedCodeResult {
  code: string;
  rootNode: NodeLike;
}

export interface TemplateCompiledFn {
  (ng: any, global: Record<string, any> | undefined, model: any): string;
  sourcecode?: string;
  rootNode?: NodeLike;
  path?: string;
}
