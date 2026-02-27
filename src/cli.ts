#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCopy, parseCopyOptions } from './copy.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

function getVersion() {
  try {
    const pkgPath = join(__dirname, '..', 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    return pkg.version;
  } catch {
    return '0.0.0';
  }
}

const VERSION = getVersion();

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const LOGO_LINES = [
  '██████╗ ██╗     ███████╗ █████╗ ███████╗███████╗    ██████╗  ██████╗',
  '██╔══██╗██║     ██╔════╝██╔══██╗██╔════╝██╔════╝    ██╔══██╗██╔═══██╗',
  '██████╔╝██║     █████╗  ███████║███████╗█████╗      ██║  ██║██║   ██║',
  '██╔═══╝ ██║     ██╔══╝  ██╔══██║╚════██║██╔══╝      ██║  ██║██║   ██║',
  '██║     ███████╗███████╗██║  ██║███████║███████╗    ██████╔╝╚██████╔╝',
  '╚═╝     ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝    ╚═════╝  ╚═════╝ ',
];

const GRAYS = [
  '\x1b[38;5;250m',
  '\x1b[38;5;248m',
  '\x1b[38;5;245m',
  '\x1b[38;5;243m',
  '\x1b[38;5;240m',
  '\x1b[38;5;238m',
];

function showLogo() {
  console.log();
  LOGO_LINES.forEach((line, i) => {
    console.log(`${GRAYS[i]}${line}${RESET}`);
  });
}

function showHelp() {
  console.log(`
${BOLD}Usage:${RESET} plsdo <command> [options]

${BOLD}Manage files:${RESET}
  copy <source> <destination>       Copy a file
  remove <path>                     Remove a file

${BOLD}Add Options:${RESET}
  -g, --global           Copy file globally (user-level) instead of directory-level

${BOLD}Options:${RESET}
  --help, -h        Show this help message
  --version, -v     Show version number
`);
}

async function main() {
  const args = process.argv.slice(2);

  const command = args[0];
  let restArgs = args.slice(1);

  console.log(restArgs);

  switch (command) {
    case 'cp':
    case 'copy':
      showLogo();
      const { source, options } = parseCopyOptions(restArgs);
      await runCopy(source, options);
      break;
    case '--help':
    case '-h':
      showHelp();
      break;
    case '--version':
    case '-v':
      console.log(VERSION);
      break;

    default:
      console.log(`Unknown command: ${command}`);
      console.log(`Run ${BOLD}plsdo --help${RESET} for usage.`);
  }
}

main();
