# Please Do

A small CLI for copying directories, skills, agents and plyabooks from a Git repository into a local project.

It reads a `plsdo.json` file, clones the configured source repository to a temporary directory, copies the selected folders into the destination, and then deletes the temporary checkout.

## Install

```bash
npm install -D plsdo
# or
npx plsdo --help
```

## Commands

```bash
plsdo copy
plsdo cp
plsdo --help
plsdo --version
```

The CLI currently supports the `copy` flow via the `plsdo.json` config file.

## Configuration

Create a `plsdo.json` file in the project where you want the files copied:

```json
{
  "config": [
    {
      "source": "git@github.com:owner/repository.git",
      "destination": "./agents/skills",
      "path": "./skills",
      "copy": ["engineering", "productivity"]
    }
  ]
}
```

Each entry in `config` has the following fields:

- `source`: Git URL to clone. This can be a `git@...` SSH URL or a repository URL ending in `.git`.
- `destination`: Local directory to copy into. The directory is created automatically if it does not exist.
- `path`: Base path inside the cloned repository to look for directories. Example: `./skills`.
- `copy`: Array of relative folder names to copy. These are resolved from `path`.

## Copy behavior

When you run:

```bash
npx plsdo cp
```

`plsdo` will:

1. Read `plsdo.json` from the current working directory.
2. Validate the config schema.
3. Clone each configured repository into a temporary directory.
4. Resolve the source folders under `path`.
5. Copy each selected directory into the destination.
6. Remove the temporary clone.

## Directory matching

The `copy` array expects relative folder paths:

```json
{
  "config": [
    {
      "source": "git@github.com:owner/repository.git",
      "destination": "./.github/instructions",
      "path": ".",
      "copy": ["docs/agent-rules", "skills/*"]
    }
  ]
}
```

Notes:

- Paths must be relative, not absolute.
- `skills/*` is treated as a recursive copy of that folder tree.
- The source path is validated to stay within the repository root.

## Example

```json
{
  "config": [
    {
      "source": "https://github.com/acme/platform.git",
      "destination": "./.copilot",
      "path": "./templates",
      "copy": ["instructions", "playbooks"]
    }
  ]
}
```

Run:

```bash
npx plsdo cp
```

This will copy the `instructions` and `playbooks` directories from `templates` in the cloned repo into `./.copilot`.
