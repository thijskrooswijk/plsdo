import * as p from '@clack/prompts';
import fm from 'front-matter';
import pc from 'picocolors';
import { resolve } from 'node:path';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { parseSource } from './source-parser.ts';
import { type CopyOptions } from './types.ts';

export async function runCopy(args: string[], options: CopyOptions = {}): Promise<void> {
  const source = args[0];

  if (!source) {
    console.log();
    console.log(
      pc.bgRed(pc.white(pc.bold(' ERROR '))) + ' ' + pc.red('Missing required argument: source')
    );
    console.log();
    console.log(pc.dim('  Usage:'));
    console.log(`    ${pc.cyan('npx plsdo cp')} ${pc.yellow('<source>')} ${pc.dim('[options]')}`);
    console.log();
    console.log(pc.dim('  Example:'));
    console.log(
      `    ${pc.cyan('npx plsdo cp')} ${pc.yellow('https://example.com/skill.md')} ${pc.dim('--skill')}`
    );
    console.log();
    process.exit(1);
  }

  console.log();
  p.intro(pc.bgGreen(pc.black(' copy ')));

  let tempDir: string | null = null;

  try {
    const spinner = p.spinner();

    spinner.start('Parsing source...');
    const parsed = parseSource(source);

    spinner.stop(`Source: ${parsed.type === 'local' ? parsed.localPath! : parsed.url}`);

    if (parsed.type === 'url') {
      await handleUrl(parsed.url, options, spinner);
      return;
    }

    if (parsed.type === 'unknown') {
      p.log.error(
        `Unrecognized source type for "${source}". Please provide a valid local path or URL.`
      );
      return;
    }
  } catch (error) {
    p.log.error(error instanceof Error ? error.message : 'Unknown error occurred');
    p.outro(pc.red('Installation failed'));
    process.exit(1);
  }
}

// Parse command line options from args array
export function parseCopyOptions(args: string[]): { source: string[]; options: CopyOptions } {
  const options: CopyOptions = {};
  const source: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '-d' || arg === '--destination') {
      options.destination = options.destination || './.claude/skills/';
      i++;
      let nextArg = args[i];
      while (i < args.length && nextArg && !nextArg.startsWith('-')) {
        options.destination = nextArg;
        i++;
        nextArg = args[i];
      }
      i--;
    } else if (arg === '-f' || arg === '--files') {
      options.files = options.files || [];
      i++;
      let nextArg = args[i];
      while (i < args.length && nextArg && !nextArg.startsWith('-')) {
        options.files.push(nextArg);
        i++;
        nextArg = args[i];
      }
      i--; // Back up one since the loop will increment
    } else if (arg && !arg.startsWith('-')) {
      source.push(arg);
    }
  }

  return { source, options };
}

async function handleUrl(url: string, options: CopyOptions, spinner: any) {
  spinner.start(`Fetching file from ${url}...`);

  const { destination } = options;
  if (!destination) {
    spinner.stop(
      pc.red(`Operation is missing ${pc.gray('--destination')} or ${pc.gray('-d')} flag`)
    );
    p.outro(pc.red('Cancelling fetch operation'));
    process.exit(1);
  }

  const destinationPath = await copyFileFromUrl(url, destination);
  p.log.info(`File downloaded to: ${destinationPath}`);

  const fileContent = existsSync(destinationPath)
    ? readFileSync(destinationPath, { encoding: 'utf8' })
    : '';
  const { attributes } = fm<{ name?: string; description?: string }>(fileContent);

  const remoteFile = {
    name: attributes?.name || 'No name provided',
    description: attributes?.description || 'No description provided',
    sourceIdentifier: url,
  };

  spinner.stop(`Found file`);

  // p.log.info(`Name: ${pc.cyan(remoteFile.name)}`);
  p.log.step(pc.bold('File Details'));
  p.log.message(`  ${pc.cyan('Name:')} ${remoteFile.name}`);
  p.log.message(`  ${pc.cyan('Description:')} ${remoteFile.description}`);

  p.outro(
    pc.green('Done!') + pc.dim('  Review file before use; they run with full agent permissions.')
  );
}

export async function copyFileFromUrl(url: string, path: string): Promise<string> {
  const spinner = p.spinner();
  spinner.start(`Downloading file...`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    mkdirSync(path, { recursive: true });

    const pathname = new URL(url).pathname;
    const filename = pathname.split('/').pop() || 'file';
    const destinationPath = resolve(path, filename);

    const buffer = await response.arrayBuffer();
    writeFileSync(destinationPath, Buffer.from(buffer));

    spinner.stop(`File location: ${pc.green(destinationPath)}`);

    return destinationPath;
  } catch (error) {
    spinner.stop(pc.red('Failed to download file'));
    throw error;
  }
}
