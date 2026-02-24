import { isAbsolute, resolve } from 'path';
import type { ParsedSource } from './types.ts';

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
      url: resolvedPath, // Store resolved path in url for consistency
      localPath: resolvedPath,
    };
  }
  // Direct URL (e.g. http://, https://)
  if (isUrl(input)) {
    return {
      type: 'url',
      url: input,
    };
  }

  // Unkwown type
  return {
    type: 'unknown',
    url: input,
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
  if (!input.startsWith('http://') && !input.startsWith('https://')) {
    return false;
  }

  // Must end with skill.md (case insensitive)
  if (!input.toLowerCase().endsWith('/skill.md')) {
    return false;
  }
  // Exclude GitHub and GitLab repository URLs - they have their own handling
  // (but allow raw.githubusercontent.com if someone wants to use it directly)
  if (input.includes('github.com/') && !input.includes('raw.githubusercontent.com')) {
    // Check if it's a blob/raw URL to SKILL.md (these should be handled by providers)
    // vs a tree/repo URL (these should be cloned)
    if (!input.includes('/blob/') && !input.includes('/raw/')) {
      return false;
    }
  }
  if (input.includes('gitlab.com/') && !input.includes('/-/raw/')) {
    return false;
  }

  return true;
}
