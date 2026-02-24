export interface CopyOptions {
  destination?: string;
  files?: string[];
}

export interface ParsedSource {
  type: 'local' | 'url' | 'unknown';
  url: string;
  localPath?: string;
}
