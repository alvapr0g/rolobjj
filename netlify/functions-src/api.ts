import { handleApi } from '../../server/api';

type NetlifyEvent = {
  httpMethod: string;
  path: string;
  rawUrl?: string;
  headers: Record<string, string | undefined>;
};

// Función de Netlify (formato clásico, empaquetada en CommonJS por `npm run build:fn`)
// que sirve /api/* con la misma lógica que el servidor Express.
export const handler = async (event: NetlifyEvent) => {
  let path = event.path;
  try {
    if (event.rawUrl) path = new URL(event.rawUrl).pathname;
  } catch {
    /* usa event.path */
  }
  // Por si la ruta llega como /.netlify/functions/api/...
  path = path.replace(/^\/\.netlify\/functions\/api/, '/api');
  if (!path.startsWith('/api')) path = '/api' + (path.startsWith('/') ? '' : '/') + path;

  const r = await handleApi({
    method: event.httpMethod,
    path,
    authorization: event.headers.authorization ?? event.headers.Authorization ?? null,
  });
  return {
    statusCode: r.status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    body: JSON.stringify(r.body),
  };
};
