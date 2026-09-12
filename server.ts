import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import handler from './api/index';

const app = express();
const PORT = 3000;

// Forward proxy routes to Vercel-compatible handler
app.all(
  ['/frame', '/frame/*', '/assets/*', '/_serverFn/*', '/api/*', '/api', '/favicon.svg'],
  (req, res) => {
    handler(req, res);
  }
);

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PW Pi Pro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
