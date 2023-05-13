import path from 'path';
import { argv } from 'process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { Archetype, Settings } from '../types.js';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { Announcer } from '../announcer.js';
import { replaceInFile } from '../utils.js';

export async function createCmsProject(dir: string, settings: Settings): Promise<void> {
	const { client } = settings;
	const root = dir;
	dir = path.join(dir, 'projects');
	existsSync(dir) || mkdirSync(dir, { recursive: true });
	process.chdir(dir);

	if (settings.cms === 'payload') {
		const db = `mongodb://127.0.0.1/${client}-${Archetype.cms}`;
		execSync(
			`npx create-payload-app --name ${Archetype.cms} --template blank --db ${db} --no-deps`,
			{ stdio: 'ignore' }
		);
		Announcer.addDelayedMessage(
			`\n\tPayload will try to connect to a local MongoDB instance at ${chalk.green(db)}`
		);
		Announcer.addDelayedMessage(
			`\tYou can change this at ${chalk.green(path.join(dir, Archetype.cms, '.env'))}`
		);
		const packageJson = JSON.parse(readFileSync(`${Archetype.cms}/package.json`, 'utf-8'));
		packageJson.name = `@${client}/${Archetype.cms}`;
		packageJson.version = '0.0.1';
		packageJson.scripts['preview'] = packageJson.scripts.serve;
		delete packageJson.scripts.serve;
		delete packageJson.description;
		writeFileSync(`${Archetype.cms}/package.json`, JSON.stringify(packageJson, null, 2) + '\n');
		writeFileSync(`${Archetype.cms}/README.md`, `# @${client}/${Archetype.cms}\n`);
		replaceInFile(`${Archetype.cms}/Dockerfile`, '3000', '80', true);
		replaceInFile(`${Archetype.cms}/docker-compose.yml`, '3000', '80', true);
		const env = readFileSync(`${Archetype.cms}/.env`, 'utf-8');
		appendFileSync(`${root}/.env`, `${env}\n`);
		rmSync(`${Archetype.cms}/.env`);
	}

	process.exit();
}

createCmsProject(argv[2], JSON.parse(argv[3]));
