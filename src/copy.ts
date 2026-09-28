import * as p from '@clack/prompts';
import pc from 'picocolors';
import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { z } from 'zod';
import { parseSource } from './source-parser.ts';

const configSchema = z.object({
  config: z
    .array(
      z.object({
        source: z.string().trim().min(1),
        destination: z.string().trim().min(1),
        path: z.string().trim().min(1),
        copy: z.array(z.string().trim().min(1)).min(1),
      })
    )
    .min(1),
});

export async function runCopy(): Promise<void> {
  const configPath = resolve(process.cwd(), 'plsdo.json');
  let configFile: z.infer<typeof configSchema>;

  try {
    configFile = configSchema.parse(JSON.parse(readFileSync(configPath, 'utf8')));
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      console.log();
      console.log(
        pc.bgRed(pc.white(pc.bold(' ERROR '))) + ' ' + pc.red(`Config file 'plsdo.json' not found`)
      );
      console.log();
      process.exit(1);
    }
    if (error instanceof z.ZodError) {
      const property = error.issues[0]?.path.at(-1) ?? 'config';
      console.log();
      console.log(
        pc.bgRed(pc.white(pc.bold(' ERROR '))) + ' ' + pc.red(`Missing required property: ${String(property)}`)
      );
      console.log();
      process.exit(1);
    }
    throw error;
  }

  const { config } = configFile;

  console.log();
  p.intro(pc.bgGreen(pc.black(' copy ')));

  for (const c of config) {
    const { source, destination, path, copy } = c;

    try {
      const spinner = p.spinner();
      spinner.start('Parsing source...');

      const parsed = parseSource(source);

      spinner.stop(`Source: ${pc.dim(parsed.type === 'local' ? parsed.localPath! : parsed.source)}`);

      if (parsed.type === 'git') {
        await handleGit(parsed.source, destination, copy, path, spinner);
        continue;
      }

      if (parsed.type === 'unknown') {
        p.log.error(
          `Unrecognized source type for "${source}". Please provide a valid local path or URL.`
        );
      }
    } catch (error) {
      p.log.error(error instanceof Error ? error.message : 'Unknown error occurred');
      p.outro(pc.red('Installation failed'));
      process.exit(1);
    }
  }

  p.outro(
    pc.green('Done!') + pc.dim('  Review copied files before use; they run with full agent permissions.')
  );
}

async function handleGit(
  source: string,
  destination: string,
  directories: string[],
  path: string,
  spinner: any
) {
  const paths = await copyDirectoriesFromGit(source, destination, directories, path, spinner);

  p.log.step(`Summary:`);
  const copied = paths.map((path, idx) => `${pc.green('✓')} ${directories[idx]} ${pc.dim('->')} ${path} ${pc.dim('(copied)')}`);
  p.log.message(copied.join('\n'));
  p.log.success(pc.green(`Successfully copied ${directories.length} directories\n\n`));
}

export async function copyDirectoriesFromGit(
  source: string,
  destination: string,
  dirs: string[],
  path: string,
  spinner: any
) {
  p.log.step(`Selected directories to copy:`);
  const selected = dirs.map((dir) => pc.dim(`- ${dir}`)).join('\n');
  p.log.message(selected);

  spinner.start('Cloning repository...');
  const tmpDir = mkdtempSync(join(tmpdir(), 'plsdo-'));

  try {
    if (!destination) {
      throw new Error('A destination is required to copy directories from a Git repository.');
    }
    if (!Array.isArray(dirs) || dirs.length === 0) {
      throw new Error('No directories were specified to copy from the Git repository.');
    }

    execFileSync('git', ['clone', source, tmpDir], { stdio: 'ignore' });
    mkdirSync(resolve(destination), { recursive: true });

    const paths: string[] = [];
    for (const dir of dirs) {
      if (isAbsolute(dir) || !dir || dir === '.' || dir === '..') {
        throw new Error(`Expected a relative folder path: ${dir}`);
      }

      const recursive = dir.includes('/*');
      const directory = dir.replace(/\/\*$/, ''); // Remove trailing /* if present

      const sourcePath = resolve(tmpDir, path, directory);
      const relativeSourcePath = relative(tmpDir, sourcePath);
      if (
        relativeSourcePath === '..' ||
        relativeSourcePath.startsWith(`..${sep}`) ||
        isAbsolute(relativeSourcePath)
      ) {
        throw new Error(`Source path must stay within the repository: ${join(path, directory)}`);
      }
      if (!existsSync(sourcePath)) {
        throw new Error(`Directory "${join(path, directory)}" was not found in the cloned repository.`);
      }
      if (!statSync(sourcePath).isDirectory()) {
        throw new Error(`Path is not a directory in the repository: ${join(path, directory)}`);
      }

      const dest = recursive ? resolve(destination) : resolve(destination, directory);
      cpSync(sourcePath, dest, { recursive: true });
      paths.push(dest);
    }

    spinner.stop(`Destination: ${pc.dim(destination)}`);
    return paths;
  } catch (error) {
    spinner.stop(pc.red('Failed to copy directories from Git repository'));
    throw error;
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
    p.log.info(pc.dim(`Tmp directory deleted: ${tmpDir}`));
  }
}
