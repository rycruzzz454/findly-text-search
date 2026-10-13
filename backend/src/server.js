import express from 'express';
import { searchText } from './search.js';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:4200');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.post('/api/search', (req, res) => {
  const { input, query, caseSensitive = false } = req.body ?? {};
  if (typeof input !== 'string' || typeof query !== 'string' || typeof caseSensitive !== 'boolean') {
    return res.status(400).json({ error: 'Provide input and query as strings and caseSensitive as a boolean.' });
  }
  if (input.length > 500000 || query.length > 50000) {
    return res.status(413).json({ error: 'Input or query is too long.' });
  }
  try { return res.json(searchText(input, query, { caseSensitive })); }
  catch { return res.status(500).json({ error: 'Search could not be completed.' }); }
});
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request is too large.' });
  if (err instanceof SyntaxError && err.status === 400) return res.status(400).json({ error: 'Invalid JSON.' });
  return res.status(500).json({ error: 'Unexpected server error.' });
});
const port = Number(process.env.PORT || 3000);
if (process.env.NODE_ENV !== 'test') app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
export default app;
