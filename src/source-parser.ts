import { isAbsolute, resolve } from 'node:path';
import { type ParsedSource } from './types.ts';

const SOURCE_ALIASES: Record<string, string> = {};

export function parseSource(input: string): ParsedSource {
  // Resolve source aliases before parsing
  const alias = SOURCE_ALIASES[input];
  if (alias) {
    input = alias;
  }

  // Local path: absolute, relative, or current directory
  if (isLocalPath(input)) {
    const resolvedPath = resolve(input);
    // Return local type even if path doesn't exist - we'll handle validation in main flow
    return {
      type: 'local',
      source: resolvedPath, // Store resolved path in source for consistency
      localPath: resolvedPath,
    };
  }
  // Git repository
  if (isRepo(input)) {
    return {
      type: 'git',
      source: input,
    };
  }
  // Direct URL (e.g. http://, https://)
  if (isUrl(input)) {
    return {
      type: 'url',
      source: input,
    };
  }

  // Unkwown type
  return {
    type: 'unknown',
    source: input,
  };
}

function isLocalPath(input: string): boolean {
  return (
    isAbsolute(input) ||
    input.startsWith('./') ||
    input.startsWith('../') ||
    input === '.' ||
    input === '..' ||
    // Windows absolute paths like C:\ or D:\
    /^[a-zA-Z]:[/\\]/.test(input)
  );
}

function isUrl(input: string): boolean {
  return input.startsWith('http://') || input.startsWith('https://')
}

function isRepo(input: string): boolean {
  return input.startsWith('git@') || input.startsWith('ssh://') || input.endsWith('.git');
}
