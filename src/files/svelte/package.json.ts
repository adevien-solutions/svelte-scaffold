import { readFileSync } from 'fs';
import { Archetype, Settings } from '../../types.js';
import { getPackageVersion, replaceInFile } from '../../utils.js';

export async function getPackageJsonContent(settings: Settings, type: Archetype): Promise<string> {
	const { client } = settings;
	const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
	packageJson.name = `@${client}/${type}`;
	packageJson.devDependencies[`@${client}/${Archetype.config}`] = 'workspace:*';
	if (settings.archetypes.includes(Archetype.lib)) {
		packageJson.devDependencies[`@${client}/${Archetype.lib}`] = 'workspace:*';
	}
	if (settings.designSystem === 'skeleton') {
		const name = '@skeletonlabs/skeleton';
		packageJson.devDependencies[name] = await getPackageVersion(name);
	}
	if (settings.svelteDeploy && settings.svelteDeploy !== 'auto') {
		const adapter = settings.svelteDeploy === 'docker' ? 'node' : settings.svelteDeploy;
		const name: Parameters<typeof getPackageVersion>[0] = `@sveltejs/adapter-${adapter}`;
		packageJson.devDependencies[name] = await getPackageVersion(name);
		const autoAdapter = '@sveltejs/adapter-auto';
		delete packageJson.devDependencies[autoAdapter];
		replaceInFile('svelte.config.js', autoAdapter, name);
	}

	return JSON.stringify(packageJson, null, 2) + '\n';
}