import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// API Endpoints
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AuraDev Web Systems Backend',
    supabaseConnected: Boolean(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL),
  });
});

// Safe public config endpoint (Never exposes secret service_role key!)
app.get('/api/config', (_req: Request, res: Response) => {
  res.json({
    supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || null,
    hasAnonKey: Boolean(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
    rlsEnforced: true,
  });
});

// Mount Vite middleware in development or serve dist in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AuraDev Server] Active on port ${PORT} (dev mode: ${isDev})`);
  });
}

startServer().catch((err) => {
  console.error('[AuraDev Server] Initialization failure:', err);
  process.exit(1);
});
