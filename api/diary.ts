import type { VercelRequest, VercelResponse } from '@vercel/node';

// URL do Apps Script do Google Sheets
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzvUAoQISzqv0KCj5lTdW9Hz3BBsa3r4xBF4nayAqjO9mtxdZMZYNx-4-P4IVylxc6A/exec';

// Cache em memória (efêmero por instância de Serverless Function)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos de cache

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Cabeçalhos de CORS para evitar problemas de domínios cruzados
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, query, body } = req;

  if (method === 'GET') {
    try {
      const forceRefresh = query.refresh === 'true' || query.nocache === 'true';

      const cleanParams = new URLSearchParams();
      for (const [key, val] of Object.entries(query)) {
        if (key !== 'refresh' && key !== 'nocache' && val !== undefined) {
          if (Array.isArray(val)) {
            val.forEach(v => cleanParams.append(key, v));
          } else {
            cleanParams.append(key, val);
          }
        }
      }

      const cacheKey = cleanParams.toString() || "all";
      const now = Date.now();

      if (!forceRefresh && cache.has(cacheKey)) {
        const cached = cache.get(cacheKey)!;
        if (now - cached.timestamp < CACHE_DURATION) {
          console.log(`[Vercel Serverless Cache Hit] key: ${cacheKey}`);
          return res.status(200).json(cached.data);
        }
      }

      const targetUrl = cleanParams.toString() ? `${APPS_SCRIPT_URL}?${cleanParams.toString()}` : APPS_SCRIPT_URL;
      console.log(`[Vercel Serverless GET] Fetching from Apps Script: ${targetUrl}`);

      const response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error(`Apps Script respondeu com status ${response.status}`);
      }
      const data = await response.json();

      // Atualiza o cache em memória
      cache.set(cacheKey, { data, timestamp: now });

      return res.status(200).json(data);
    } catch (error: any) {
      console.error("[Vercel Serverless GET Error]", error);
      return res.status(500).json({ status: "error", message: error.message || String(error) });
    }
  }

  if (method === 'POST') {
    try {
      console.log(`[Vercel Serverless POST] Submitting payload`);
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: typeof body === 'string' ? body : JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(`Apps Script respondeu com status ${response.status}`);
      }
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error: any) {
      console.error("[Vercel Serverless POST Error]", error);
      return res.status(500).json({ status: "error", message: error.message || String(error) });
    }
  }

  return res.status(405).json({ message: "Método não permitido" });
}
