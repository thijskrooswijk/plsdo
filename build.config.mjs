import { defineBuildConfig } from 'obuild/config';
import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

// https://github.com/unjs/obuild
export default defineBuildConfig({
  entries: [{ type: 'bundle', input: './src/cli.ts' }],
  hooks: {
    end({ pkgDir, pkg }) {
      const distSchemasDir = resolve(pkgDir, 'schemas', pkg.version);
      mkdirSync(distSchemasDir, { recursive: true });
      copyFileSync(resolve(pkgDir, 'schemas', 'latest', 'schema.json'), resolve(distSchemasDir, 'schema.json'));
    },
  },
});
