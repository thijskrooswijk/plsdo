#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCopy } from './copy.ts';

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

${BOLD}Commands:${RESET}
  copy, cp          Copy a directory from a source to a destination
  remove, rm        Remove a directory from a destination

${BOLD}Options:${RESET}
  --help, -h        Show this help message
  --version, -v     Show version number
`);
}

async function main() {
  const args = process.argv.slice(2);

  const command = args[0];
  let restArgs = args.slice(1);

  switch (command) {
    case 'cp':
    case 'copy':
      showLogo();
      await runCopy();
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
