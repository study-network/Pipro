import type { IncomingMessage, ServerResponse } from 'http';

export const TARGET_ORIGIN = 'https://pi.pwmarco.info';

// Helper to replace branding and Telegram links
export function transformContent(content: string): string {
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

// Helper to read raw request body
function getRequestBody(req: IncomingMessage): Promise<Buffer | null> {
  return new Promise((resolve) => {
    // If body was already parsed by express
    if ((req as any).body) {
      const b = (req as any).body;
      if (Buffer.isBuffer(b)) return resolve(b);
      if (typeof b === 'string') return resolve(Buffer.from(b));
      if (typeof b === 'object') return resolve(Buffer.from(JSON.stringify(b)));
    }

    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => {
      resolve(chunks.length > 0 ? Buffer.concat(chunks) : null);
    });
    req.on('error', () => resolve(null));
  });
}

// Helper to send response safely in both Node http and Vercel res
function sendResponse(res: any, statusCode: number, headers: Record<string, string>, body: string | Buffer) {
  try {
    if (typeof res.status === 'function') {
      res.status(statusCode);
    } else {
      res.statusCode = statusCode;
    }

    for (const [key, value] of Object.entries(headers)) {
      if (typeof res.setHeader === 'function') {
        res.setHeader(key, value);
      }
    }

    if (typeof res.send === 'function') {
      return res.send(body);
    } else {
      return res.end(body);
    }
  } catch (err: any) {
    console.error('sendResponse error:', err.message);
  }
}

export default async function handler(req: any, res: any) {
  try {
    const originalUrl = req.url || '/';
    let urlObj: URL;
    try {
      urlObj = new URL(originalUrl, 'http://localhost');
    } catch {
      urlObj = new URL('/', 'http://localhost');
    }

    // Determine target route
    // 1. From __route query param (injected by vercel.json rewrite)
    // 2. From x-matched-path or x-forwarded-uri header
    // 3. Fallback to req.url
    let route = urlObj.searchParams.get('__route') ||
      (req.headers['x-matched-path'] as string) ||
      (req.headers['x-forwarded-uri'] as string) ||
      urlObj.pathname;

    // Remove __route from query string for forwarding
    urlObj.searchParams.delete('__route');
    const forwardedQuery = urlObj.searchParams.toString() ? `?${urlObj.searchParams.toString()}` : '';

    // Route: Health check
    if (route === '/api/health' || route === '/health') {
      return sendResponse(
        res,
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({ status: 'ok', target: TARGET_ORIGIN })
      );
    }

    // Route: Favicon
    if (route === '/favicon.svg' || route === '/api/favicon.svg') {
      try {
        const svgRes = await fetch(`${TARGET_ORIGIN}/favicon.svg`);
        const svg = await svgRes.text();
        return sendResponse(res, 200, { 'Content-Type': 'image/svg+xml' }, svg);
      } catch {
        return sendResponse(res, 404, { 'Content-Type': 'text/plain' }, 'Not found');
      }
    }

    // Route: /assets/*
    if (route.startsWith('/assets/') || route.startsWith('/api/assets/')) {
      const assetSubpath = route.replace(/^\/api/, '');
      const upstreamUrl = `${TARGET_ORIGIN}${assetSubpath}${forwardedQuery}`;

      try {
        const upstreamRes = await fetch(upstreamUrl, {
          headers: {
            'User-Agent': (req.headers['user-agent'] as string) || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': (req.headers['accept'] as string) || '*/*',
            'Referer': TARGET_ORIGIN
          }
        });

        if (!upstreamRes.ok) {
          return sendResponse(res, upstreamRes.status, { 'Content-Type': 'text/plain' }, upstreamRes.statusText);
        }

        const contentType = upstreamRes.headers.get('content-type') || 'application/javascript';
        if (contentType.includes('javascript') || contentType.includes('text') || contentType.includes('json')) {
          const text = await upstreamRes.text();
          const transformed = transformContent(text);
          return sendResponse(
            res,
            upstreamRes.status,
            { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=3600' },
            transformed
          );
        }

        const buffer = Buffer.from(await upstreamRes.arrayBuffer());
        return sendResponse(
          res,
          upstreamRes.status,
          { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=86400' },
          buffer
        );
      } catch (err: any) {
        console.error(`Error proxying asset ${route}:`, err.message);
        return sendResponse(res, 502, { 'Content-Type': 'text/plain' }, 'Asset Proxy Error');
      }
    }

    // Route: /_serverFn/*
    if (route.startsWith('/_serverFn/') || route.startsWith('/api/_serverFn/')) {
      const fnSubpath = route.replace(/^\/api/, '');
      const upstreamUrl = `${TARGET_ORIGIN}${fnSubpath}${forwardedQuery}`;

      const headers: Record<string, string> = {
        'User-Agent': (req.headers['user-agent'] as string) || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': TARGET_ORIGIN
      };
      if (req.headers['content-type']) headers['content-type'] = req.headers['content-type'] as string;
      if (req.headers['accept']) headers['accept'] = req.headers['accept'] as string;
      if (req.headers['cookie']) headers['cookie'] = req.headers['cookie'] as string;

      const bodyBuffer = await getRequestBody(req);
      const fetchOptions: RequestInit = {
        method: req.method || 'GET',
        headers
      };
      if (req.method !== 'GET' && req.method !== 'HEAD' && bodyBuffer) {
        fetchOptions.body = bodyBuffer;
      }

      try {
        const upstreamRes = await fetch(upstreamUrl, fetchOptions);
        const contentType = upstreamRes.headers.get('content-type') || 'application/json';

        if (contentType.includes('text') || contentType.includes('json') || contentType.includes('application/x-tss-framed')) {
          const text = await upstreamRes.text();
          const transformed = transformContent(text);
          return sendResponse(res, upstreamRes.status, { 'Content-Type': contentType }, transformed);
        }

        const buffer = Buffer.from(await upstreamRes.arrayBuffer());
        return sendResponse(res, upstreamRes.status, { 'Content-Type': contentType }, buffer);
      } catch (err: any) {
        console.error(`Error proxying server function ${route}:`, err.message);
        return sendResponse(res, 502, { 'Content-Type': 'text/plain' }, 'Server Function Proxy Error');
      }
    }

    // Route: /frame, /frame/*, or fallback proxy
    let targetPath = route
      .replace(/^\/api\/frame/, '')
      .replace(/^\/frame/, '') || '/';
    if (!targetPath.startsWith('/')) {
      targetPath = '/' + targetPath;
    }

    const upstreamUrl = `${TARGET_ORIGIN}${targetPath}${forwardedQuery}`;

    try {
      const upstreamRes = await fetch(upstreamUrl, {
        headers: {
          'User-Agent': (req.headers['user-agent'] as string) || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': (req.headers['accept'] as string) || 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': (req.headers['accept-language'] as string) || 'en-US,en;q=0.9',
          'Referer': TARGET_ORIGIN
        },
        redirect: 'manual'
      });

      // Handle HTTP redirects
      if (upstreamRes.status >= 300 && upstreamRes.status < 400) {
        const loc = upstreamRes.headers.get('location');
        if (loc) {
          const redirected = loc.startsWith('http') ? new URL(loc).pathname + new URL(loc).search : loc;
          const destination = `/frame${redirected.startsWith('/') ? '' : '/'}${redirected}`;
          if (typeof res.redirect === 'function') {
            return res.redirect(destination);
          } else {
            return sendResponse(res, 302, { 'Location': destination }, '');
          }
        }
      }

      const contentType = upstreamRes.headers.get('content-type') || 'text/html; charset=utf-8';

      if (contentType.includes('html')) {
        let html = await upstreamRes.text();
        html = transformContent(html);

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

        return sendResponse(
          res,
          upstreamRes.status,
          {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          },
          html
        );
      }

      const buffer = Buffer.from(await upstreamRes.arrayBuffer());
      return sendResponse(res, upstreamRes.status, { 'Content-Type': contentType }, buffer);
    } catch (fetchErr: any) {
      console.error('Fetch upstream error:', fetchErr.message);
      return sendResponse(
        res,
        502,
        { 'Content-Type': 'text/html; charset=utf-8' },
        `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>PW Pi Pro - Connecting</title>
            <style>
              body { font-family: system-ui, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .card { text-align: center; max-width: 440px; padding: 32px; background: #18181b; border-radius: 16px; border: 1px solid #27272a; }
              h2 { margin-top: 0; color: #facc15; }
              button { background: #facc15; color: #000; border: none; padding: 10px 20px; font-weight: bold; border-radius: 8px; cursor: pointer; margin-top: 16px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>Connecting to Server</h2>
              <p>Establishing connection with the upstream stream. Please click below to reload.</p>
              <button onclick="window.location.reload()">Retry Now</button>
            </div>
          </body>
        </html>`
      );
    }
  } catch (outerErr: any) {
    console.error('Unhandled serverless handler error:', outerErr);
    return sendResponse(
      res,
      500,
      { 'Content-Type': 'application/json' },
      JSON.stringify({ error: 'Internal Server Error', message: outerErr?.message || 'Unknown error' })
    );
  }
}
