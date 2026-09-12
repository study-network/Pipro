import { app } from '../server/app';

export default function handler(req: any, res: any) {
  // On Vercel, check if original request URL was stored in headers during rewrite
  const matchedPath = req.headers['x-matched-path'] as string | undefined;
  const forwardedUri = req.headers['x-forwarded-uri'] as string | undefined;

  if (matchedPath && !matchedPath.startsWith('/api')) {
    req.url = matchedPath;
  } else if (forwardedUri && !forwardedUri.startsWith('/api')) {
    req.url = forwardedUri;
  }

  return app(req, res);
}
