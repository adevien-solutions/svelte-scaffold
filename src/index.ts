#! /usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { getSettings } from './utils.js';
import { Generator } from './generator.js';

const program = new Command();
const versionNumber = readFileSync('version.txt', 'utf8');

program
	.version(versionNumber)
	.usage('npx @adevien/svelte-scaffold [options]')
	.description(
		chalk.bold(
			`Monorepo scaffolding for ${chalk.hex('#ff3e00')('Svelte')} and ${chalk.hex('#2f73bf')(
				'TypeScript'
			)} projects`
		)
	)
	.argument('<directory>', 'root of the monorepo')
	.option('--force', 'overwrite existing files', false)
	.parse(process.argv);

const settings = await getSettings(program.opts());
await new Generator(program.args[0], settings).init();
