// Vercel serverless entry point - diagnostic
import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();

app.get('/health', (_req, res) => {
  const cwd = process.cwd();

  // Check if build-ran file exists anywhere
  const scanForFile = (dir: string, filename: string, maxDepth = 4): string | null => {
    if (maxDepth <= 0) return null;
    try {
      for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        const stat = fs.statSync(full);
        if (entry === filename) return full;
        if (stat.isDirectory()) {
          const found = scanForFile(full, filename, maxDepth - 1);
          if (found) return found;
        }
      }
    } catch {}
    return null;
  };

  const buildRanPath = scanForFile(cwd, 'BUILD_RAN');
  const prismaIntPath = scanForFile(cwd, 'index.js');
  const prismaClientDir = scanForFile(cwd, 'prisma-client');

  type Check = { path?: string; files?: string[]; exists?: boolean };
  const checks: Record<string, Check> = {};

  const checkDir = (p: string): Check => {
    try {
      const full = path.join(cwd, p);
      const files = fs.readdirSync(full);
      return { path: full, files: files.slice(0, 20) };
    } catch {
      return { exists: false };
    }
  };

  checks.buildRan = buildRanPath ? { path: buildRanPath } : { exists: false };
  checks.prismaIndexFound = prismaIntPath ? { path: prismaIntPath } : { exists: false };
  checks.cwdContents = checkDir('');

  // Try reading node_modules/.prisma/client/default.js
  const tryPaths = [
    'node_modules/.prisma/client',
    'apps/api/node_modules/.prisma/client',
    'api/prisma-client',
    'apps/api/api/prisma-client',
  ];
  for (const p of tryPaths) {
    const full = path.join(cwd, p);
    try {
      const files = fs.readdirSync(full);
      checks[p] = { path: full, files };
      // Read default.js if it exists
      if (files.includes('default.js')) {
        const djs = fs.readFileSync(path.join(full, 'default.js'), 'utf8');
        checks[p].defaultJsSnippet = djs.substring(0, 200);
      }
    } catch { /* not found */ }
  }

  res.json(checks);
});

export default app;
