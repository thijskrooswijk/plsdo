export interface CopyOptions {
  destination?: string;
  files?: string[];
}

export interface ParsedSource {
  type: 'local' | 'git' | 'url' | 'unknown';
  source: string;
  localPath?: string;
}
