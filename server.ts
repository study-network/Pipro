import path from 'path';
import http from 'http';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import handler from './api/index';

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Forward proxy routes and application paths to Vercel-compatible handler
const PROXIED_PATHS = [
  '/',
  '/category',
  '/category/*',
  '/series',
  '/series/*',
  '/watch',
  '/watch/*',
  '/teacher',
  '/teacher/*',
  '/search',
  '/search/*',
  '/library',
  '/library/*',
  '/goal',
  '/goal/*',
  '/batch',
  '/batch/*',
  '/courses',
  '/courses/*',
  '/frame',
  '/frame/*',
  '/assets/*',
  '/_serverFn',
  '/_serverFn/*',
  '/api',
  '/api/*',
  '/favicon.svg'
];

app.all(PROXIED_PATHS, (req, res, next) => {
  // Allow explicit access to shell view if requested (?view=shell or /app)
  if (req.query.view === 'shell' || req.path === '/app') {
    return next();
  }
  handler(req, res);
});

// Fallback check for any dynamic subroutes (e.g. /category/..., /series/...)
app.use((req, res, next) => {
  const isAppRoute = /^\/(category|series|watch|teacher|search|library|goal|batch|courses)(\/|$)/.test(req.path);
  if (isAppRoute && req.query.view !== 'shell') {
    return handler(req, res);
  }
  next();
});

async function startServer() {
  const server = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server
        }
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`PW Pi Pro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
