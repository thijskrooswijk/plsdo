# AGENTS.md

This file provides guidance to AI coding agents working on the `plsdo` CLI codebase.

## Project Overview

`plsdo` is the CLI for adding skills, and other AI related files.

## Commands

| Command                       | Description                                         |
| ----------------------------- | --------------------------------------------------- |
| `plsdo`                       | Show banner with available commands                 |

## Architecture

```
src/
├── cli.ts              # Main entry point, command routing, init
├── copy.ts             # Copy command logic
├── source-parser.ts    # Parsing the source, like url or local path
├── types.ts            # Contains all Typescript types and interfaces
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Test locally
pnpm dev check
pnpm dev update

# Run all tests
pnpm test

# Run specific test file(s)
pnpm test tests/file-name.test.ts

# Type check
pnpm type-check

# Format code
pnpm format
```

## Code Style

This project uses Prettier for code formatting. **Always run `pnpm format` before committing changes** to ensure consistent formatting.

```bash
# Format all files
pnpm format

# Check formatting without fixing
pnpm prettier --check .
```

CI will fail if code is not properly formatted.

## Publishing

```bash
# 1. Bump version in package.json
# 2. Build
pnpm build
# 3. Publish
npm publish
```

## Adding a New Agent

1. Add the agent definition to `src/agents.ts`
2. Run `pnpm run -C scripts validate-agents.ts` to validate
3. Run `pnpm run -C scripts sync-agents.ts` to update README.md