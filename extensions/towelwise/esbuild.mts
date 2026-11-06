// Towelwise: bundles the extension-era features for the app build. Without this file the build copies only what is
// already on disk, and out/ is never compiled there. The build then rewrites "main" from out/ to dist/.
import * as path from 'node:path';
import { run } from '../esbuild-extension-common.mts';

const srcDir = path.join(import.meta.dirname, 'src');
const outDir = path.join(import.meta.dirname, 'dist');

run({
	platform: 'node',
	entryPoints: {
		'extension': path.join(srcDir, 'extension.ts'),
	},
	srcDir,
	outdir: outDir,
}, process.argv);
