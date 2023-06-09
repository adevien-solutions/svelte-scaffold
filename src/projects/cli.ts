import path from 'path';
import { argv } from 'process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { Archetype, Settings, Subfolder } from '../types.js';
import {
	getEslintrcCjsContent,
	getIndexTsContent,
	getPackageJsonContent,
	getTsconfigJsonContent
} from '../files/cli/index.js';

export function createCliProject(dir: string, settings: Settings): void {
	dir = path.join(dir, Subfolder.projects, Archetype.cli);
	existsSync(dir) || mkdirSync(dir, { recursive: true });
	process.chdir(dir);

	writeFileSync('package.json', getPackageJsonContent(settings));
	writeFileSync('tsconfig.json', getTsconfigJsonContent());
	writeFileSync('.eslintrc.cjs', getEslintrcCjsContent());
	writeFileSync('README.md', `# @${settings.client}/${Archetype.cli}\n`);
	mkdirSync('src');
	writeFileSync('src/index.ts', getIndexTsContent(settings));

	process.exit();
}

createCliProject(argv[2], JSON.parse(argv[3]));
