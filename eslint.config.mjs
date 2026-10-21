import { configWithoutCloudSupport } from '@n8n/node-cli/eslint';

/**
 * @n8n/node-cli applies the n8n-nodes-base rule sets only to ./nodes and ./credentials,
 * while this package keeps its sources under src/. Reuse those blocks from the node-cli
 * config as they are, with the same rules and exceptions, and only point them at src/.
 */
const SRC_PATHS = {
	'./nodes/**/*.ts': 'src/nodes/**/*.ts',
	'./credentials/**/*.ts': 'src/credentials/**/*.ts',
};

const srcBlocks = configWithoutCloudSupport
	.filter((block) => block.files?.some((pattern) => pattern in SRC_PATHS))
	.map((block) => ({
		...block,
		files: block.files.map((pattern) => SRC_PATHS[pattern] ?? pattern),
	}));

if (srcBlocks.length !== Object.keys(SRC_PATHS).length) {
	throw new Error(
		'@n8n/node-cli eslint config changed: n8n-nodes-base blocks for nodes/credentials not found',
	);
}

export default [...configWithoutCloudSupport, ...srcBlocks];
