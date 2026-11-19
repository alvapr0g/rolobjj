import { handleApi } from '../../server/api';

// Función de Netlify que sirve /api/* con la misma lógica que el servidor Express.
export default async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const r = await handleApi({
    method: req.method,
    path: url.pathname,
    authorization: req.headers.get('authorization'),
  });
  return Response.json(r.body, { status: r.status });
};

export const config = { path: '/api/*' };
