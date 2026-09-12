import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const TARGET_ORIGIN = 'https://pi.pwmarco.info';

// Parse raw body for server function forwarding if needed
app.use(express.raw({ type: '*/*', limit: '10mb' }));

// Helper to replace branding and Telegram links
function transformContent(content: string): string {
  if (!content) return content;
  return content
    // Replace Telegram links and handles
    .replace(/https?:\/\/t\.me\/official_marco_22\/?/gi, 'https://t.me/+lxSx0imjBEo2ZTll')
    .replace(/http:\/\/t\.me\/official_marco_22\/?/gi, 'https://t.me/+lxSx0imjBEo2ZTll')
    .replace(/t\.me\/official_marco_22/gi, 't.me/+lxSx0imjBEo2ZTll')
    .replace(/@official_marco_22/gi, 'Telegram Community')
    .replace(/official_marco_22/gi, '+lxSx0imjBEo2ZTll')
    // Replace MARCO branding with Pw
    .replace(/MARCO-PIPRO/g, 'PW-PIPRO')
    .replace(/MARCO PIPRO/g, 'PW PIPRO')
    .replace(/Marco-PiPro/gi, 'PW-PIPRO')
    .replace(/MARCO/g, 'Pw')
    .replace(/Marco/g, 'Pw')
    .replace(/pwmarco\.info/gi, 'pw.live');
}

// Injected bridge script for seamless iframe operation, path sync, and live DOM sanitization
const INJECTED_HEAD_SCRIPT = `
<script id="__pw_bridge_init__">
  (function() {
    try {
      if (window.location.pathname.startsWith('/frame')) {
        var realPath = window.location.pathname.replace(/^\\/frame/, '') || '/';
        window.__PW_REAL_PATH__ = realPath;
        window.history.replaceState(null, '', realPath + window.location.search + window.location.hash);
      }
    } catch(e) {
      console.warn('Path sync init error:', e);
    }
  })();
</script>
`;

const INJECTED_BODY_SCRIPT = `
<script id="__pw_bridge_runtime__">
  (function() {
    var _M1 = decodeURIComponent('%4D%41%52%43%4F');
    var _M2 = 'PW';
    var _TG_OLD = decodeURIComponent('%6F%66%66%69%63%69%61%6C%5F%6D%61%72%63%6F%5F%32%32');
    var _TG_NEW = 'https://t.me/+lxSx0imjBEo2ZTll';
    var _rePattern = new RegExp(_M1, 'gi');
    var _rePiPro = new RegExp(_M1 + '-PIPRO', 'gi');
    var _reTgOld = new RegExp('https?:\\/\\/t\\.me\\/' + _TG_OLD + '\\/?', 'gi');

    // 1. Sanitize document title
    function updateTitle() {
      if (document.title && (_rePattern.test(document.title) || document.title.indexOf(_TG_OLD) !== -1)) {
        document.title = document.title
          .replace(_rePiPro, _M2 + '-PIPRO')
          .replace(_rePattern, _M2);
      }
    }

    // 2. Sanitize DOM nodes
    function sanitizeNode(node) {
      if (!node) return;
      if (node.nodeType === Node.TEXT_NODE) {
        var val = node.nodeValue;
        if (val && (_rePattern.test(val) || val.indexOf(_TG_OLD) !== -1)) {
          node.nodeValue = val
            .replace(_reTgOld, _TG_NEW)
            .replace(new RegExp('@' + _TG_OLD, 'gi'), 'Telegram Community')
            .replace(_rePiPro, _M2 + '-PIPRO')
            .replace(_rePattern, _M2);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.hasAttribute('href')) {
          var href = node.getAttribute('href');
          if (href && href.indexOf(_TG_OLD) !== -1) {
            node.setAttribute('href', _TG_NEW);
          }
        }
        if (node.hasAttribute('aria-label')) {
          var label = node.getAttribute('aria-label');
          if (label && _rePattern.test(label)) {
            node.setAttribute('aria-label', label.replace(_rePiPro, _M2 + '-PIPRO').replace(_rePattern, _M2));
          }
        }
        if (node.hasAttribute('title')) {
          var title = node.getAttribute('title');
          if (title && _rePattern.test(title)) {
            node.setAttribute('title', title.replace(_rePiPro, _M2 + '-PIPRO').replace(_rePattern, _M2));
          }
        }
        for (var i = 0; i < node.childNodes.length; i++) {
          sanitizeNode(node.childNodes[i]);
        }
      }
    }

    // 3. Setup continuous observer
    try {
      var observer = new MutationObserver(function(mutations) {
        updateTitle();
        for (var i = 0; i < mutations.length; i++) {
          var m = mutations[i];
          if (m.type === 'childList') {
            for (var j = 0; j < m.addedNodes.length; j++) {
              sanitizeNode(m.addedNodes[j]);
            }
          } else if (m.type === 'characterData') {
            sanitizeNode(m.target);
          }
        }
      });
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        characterData: true
      });
    } catch(e) {}

    // 4. Initial cleanup
    updateTitle();
    if (document.body) sanitizeNode(document.body);
    document.addEventListener('DOMContentLoaded', function() {
      updateTitle();
      if (document.body) sanitizeNode(document.body);
    });

    // 5. Notify parent window on navigation
    function notifyParent() {
      try {
        var current = window.location.pathname.replace(/^\\/frame/, '') || '/';
        var search = window.location.search || '';
        var hash = window.location.hash || '';
        var fullPath = current + search + hash;
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'IFRAME_PATH_CHANGE',
            path: fullPath,
            title: document.title || 'PW Pi Pro'
          }, '*');
        }
      } catch(e) {}
    }

    // Hook history methods
    var origPush = history.pushState;
    history.pushState = function() {
      origPush.apply(this, arguments);
      notifyParent();
      setTimeout(function() {
        updateTitle();
        if (document.body) sanitizeNode(document.body);
      }, 50);
    };

    var origReplace = history.replaceState;
    history.replaceState = function() {
      origReplace.apply(this, arguments);
      notifyParent();
      setTimeout(function() {
        updateTitle();
        if (document.body) sanitizeNode(document.body);
      }, 50);
    };

    window.addEventListener('popstate', notifyParent);
    window.addEventListener('load', notifyParent);

    document.addEventListener('click', function(e) {
      var a = e.target && e.target.closest ? e.target.closest('a') : null;
      if (a) {
        var href = a.getAttribute('href');
        if (href && (href.startsWith('/') || href.startsWith('#'))) {
          setTimeout(notifyParent, 40);
        }
      }
    }, true);

    window.addEventListener('message', function(e) {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'PARENT_NAVIGATE') {
        var p = e.data.path;
        if (p) {
          window.location.href = '/frame' + (p.startsWith('/') ? p : '/' + p);
        }
      } else if (e.data.type === 'PARENT_BACK') {
        window.history.back();
      } else if (e.data.type === 'PARENT_FORWARD') {
        window.history.forward();
      } else if (e.data.type === 'PARENT_RELOAD') {
        window.location.reload();
      }
    });
  })();
</script>
`;

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', target: TARGET_ORIGIN });
});

// Proxy for /assets/*
app.get('/assets/*', async (req, res, next) => {
  // In production, check if this is a local Vite asset in dist/assets
  if (process.env.NODE_ENV === 'production') {
    const localAssetPath = path.join(process.cwd(), 'dist', req.path);
    if (fs.existsSync(localAssetPath)) {
      return next();
    }
  }

  try {
    const upstreamUrl = `${TARGET_ORIGIN}${req.originalUrl}`;
    const upstreamRes = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': req.headers['accept'] || '*/*',
        'Referer': TARGET_ORIGIN
      }
    });

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).send(upstreamRes.statusText);
    }

    const contentType = upstreamRes.headers.get('content-type') || 'application/javascript';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    if (contentType.includes('javascript') || contentType.includes('text') || contentType.includes('json')) {
      const text = await upstreamRes.text();
      const transformed = transformContent(text);
      return res.send(transformed);
    }

    const buffer = Buffer.from(await upstreamRes.arrayBuffer());
    return res.send(buffer);
  } catch (err: any) {
    console.error(`Error proxying asset ${req.originalUrl}:`, err.message);
    return res.status(502).send('Asset Proxy Error');
  }
});

// Proxy for /_serverFn/* (TanStack server function calls)
app.all('/_serverFn/*', async (req, res) => {
  try {
    const upstreamUrl = `${TARGET_ORIGIN}${req.originalUrl}`;
    const headers: Record<string, string> = {
      'User-Agent': (req.headers['user-agent'] as string) || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Referer': TARGET_ORIGIN
    };

    if (req.headers['content-type']) {
      headers['content-type'] = req.headers['content-type'] as string;
    }
    if (req.headers['accept']) {
      headers['accept'] = req.headers['accept'] as string;
    }
    if (req.headers['cookie']) {
      headers['cookie'] = req.headers['cookie'] as string;
    }

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = req.body;
    }

    const upstreamRes = await fetch(upstreamUrl, fetchOptions);

    res.status(upstreamRes.status);
    const contentType = upstreamRes.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    if (contentType && (contentType.includes('text') || contentType.includes('json') || contentType.includes('application/x-tss-framed'))) {
      const text = await upstreamRes.text();
      const transformed = transformContent(text);
      return res.send(transformed);
    }

    const buffer = Buffer.from(await upstreamRes.arrayBuffer());
    return res.send(buffer);
  } catch (err: any) {
    console.error(`Error proxying server function ${req.originalUrl}:`, err.message);
    return res.status(502).send('Server Function Proxy Error');
  }
});

// Proxy for favicon.svg
app.get('/favicon.svg', async (_req, res) => {
  try {
    const upstreamRes = await fetch(`${TARGET_ORIGIN}/favicon.svg`);
    const svg = await upstreamRes.text();
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(svg);
  } catch {
    return res.status(404).send('Not found');
  }
});

// Frame route handler (/frame or /frame/*)
app.get(['/frame', '/frame/*'], async (req, res) => {
  try {
    // Extract target path
    let targetSubpath = req.path.replace(/^\/frame/, '') || '/';
    if (!targetSubpath.startsWith('/')) {
      targetSubpath = '/' + targetSubpath;
    }

    const queryString = req.originalUrl.includes('?') ? req.originalUrl.slice(req.originalUrl.indexOf('?')) : '';
    const upstreamUrl = `${TARGET_ORIGIN}${targetSubpath}${queryString}`;

    const upstreamRes = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': (req.headers['user-agent'] as string) || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': (req.headers['accept'] as string) || 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': (req.headers['accept-language'] as string) || 'en-US,en;q=0.9',
        'Referer': TARGET_ORIGIN
      },
      redirect: 'manual'
    });

    // Handle redirects
    if (upstreamRes.status >= 300 && upstreamRes.status < 400) {
      const loc = upstreamRes.headers.get('location');
      if (loc) {
        const redirected = loc.startsWith('http') ? new URL(loc).pathname + new URL(loc).search : loc;
        return res.redirect(`/frame${redirected.startsWith('/') ? '' : '/'}${redirected}`);
      }
    }

    const contentType = upstreamRes.headers.get('content-type') || 'text/html; charset=utf-8';
    res.status(upstreamRes.status);
    res.setHeader('Content-Type', contentType);
    // Crucial: remove frame restrictions so iframe renders smoothly
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');

    if (contentType.includes('html')) {
      let html = await upstreamRes.text();

      // Transform all branding and telegram occurrences
      html = transformContent(html);

      // Inject bridge scripts
      if (html.includes('<head>')) {
        html = html.replace('<head>', '<head>' + INJECTED_HEAD_SCRIPT);
      } else {
        html = INJECTED_HEAD_SCRIPT + html;
      }

      if (html.includes('</body>')) {
        html = html.replace('</body>', INJECTED_BODY_SCRIPT + '</body>');
      } else {
        html = html + INJECTED_BODY_SCRIPT;
      }

      return res.send(html);
    }

    const buffer = Buffer.from(await upstreamRes.arrayBuffer());
    return res.send(buffer);
  } catch (err: any) {
    console.error(`Error handling /frame request for ${req.originalUrl}:`, err.message);
    return res.status(502).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PW Pi Pro - Connecting...</title>
          <style>
            body { font-family: system-ui, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { text-align: center; max-width: 440px; padding: 32px; background: #18181b; border-radius: 16px; border: 1px solid #27272a; }
            h2 { margin-top: 0; color: #facc15; }
            button { background: #facc15; color: #000; border: none; padding: 10px 20px; font-weight: bold; border-radius: 8px; cursor: pointer; margin-top: 16px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Connection Temporary Error</h2>
            <p>Could not fetch from source. Please check your internet connection or retry.</p>
            <button onclick="window.location.reload()">Retry Now</button>
          </div>
        </body>
      </html>
    `);
  }
});

// Setup Vite middleware for React app
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
