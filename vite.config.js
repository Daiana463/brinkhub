import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

function findHtmlEntries(rootDir) {
  const skip = new Set(['node_modules', 'dist', 'public', '.git', '.vite']);
  const entries = {};

  function walk(dir, base = '') {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!skip.has(entry.name)) walk(path.join(dir, entry.name), base ? `${base}/${entry.name}` : entry.name);
        continue;
      }
      if (entry.isFile() && entry.name.endsWith('.html')) {
        const key = base ? `${base}/${entry.name}` : entry.name;
        entries[key] = path.resolve(dir, entry.name);
      }
    }
  }

  walk(rootDir);
  return entries;
}

export default defineConfig({
  root: '.',
  server: { port: 5173 },
  build: {
    rollupOptions: {
      input: findHtmlEntries('.'),
    },
  },
});
