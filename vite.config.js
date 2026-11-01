import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// Build setup added to the export, which shipped `src/` only (apps/kb/ in the `support` repo).
export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter({ pages: 'build', assets: 'build', strict: true }),
      extensions: ['.svelte', '.svx'],
      preprocess: [
        mdsvex({
          extensions: ['.svx'],
          layout: { runbook: fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url)) },
        }),
      ],
    }),
  ],
});
