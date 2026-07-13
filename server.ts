import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // =========================================================================
  // COLE AQUI A URL GERADA PELA IMPLANTAÇÃO DO SEU GOOGLE APPS SCRIPT (WEB APP)
  // Exemplo: 'https://script.google.com/macros/s/SUA_CHAVE_AQUI/exec'
  // =========================================================================
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzVXfEUl56QDP940MR_XPtUEISoN9Qq2D2KzWIYOQCxo4VXCvAQa5690PBfJVknORsIgg/exec';

  // Memory cache to prevent slow repeated Google Sheets API queries
  const cache = new Map<string, { data: any; timestamp: number }>();
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache TTL

  // API Proxy endpoints
  app.get("/api/diary", async (req, res) => {
    try {
      const forceRefresh = req.query.refresh === 'true' || req.query.nocache === 'true';
      
      // Remove refresh and nocache from the query parameters to keep the cache key clean
      const cleanParams = new URLSearchParams(req.query as any);
      cleanParams.delete('refresh');
      cleanParams.delete('nocache');
      const cacheKey = cleanParams.toString() || "all";

      const now = Date.now();
      if (!forceRefresh && cache.has(cacheKey)) {
        const cached = cache.get(cacheKey)!;
        if (now - cached.timestamp < CACHE_DURATION) {
          console.log(`[Cache Hit] Serving from cache for key: ${cacheKey}`);
          return res.json(cached.data);
        }
      }

      const targetUrl = cleanParams.toString() ? `${APPS_SCRIPT_URL}?${cleanParams.toString()}` : APPS_SCRIPT_URL;
      console.log(`[Proxy GET] Fetching diary data from Apps Script (Force Refresh: ${forceRefresh}): ${targetUrl}`);
      
      const response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error(`Apps Script responded with status ${response.status}`);
      }
      const data = await response.json();
      
      // Save to cache
      cache.set(cacheKey, { data, timestamp: now });
      
      res.json(data);
    } catch (error: any) {
      console.error("[Proxy GET Error]", error);
      res.status(500).json({ status: "error", message: error.message || String(error) });
    }
  });

  app.post("/api/diary", async (req, res) => {
    try {
      console.log(`[Proxy POST] Submitting to Apps Script:`, req.body);
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });
      if (!response.ok) {
        throw new Error(`Apps Script responded with status ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("[Proxy POST Error]", error);
      res.status(500).json({ status: "error", message: error.message || String(error) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
