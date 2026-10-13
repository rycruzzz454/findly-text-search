
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { searchText } from './search.js';

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

// CORS for local Angular development
app.use((req, res, next) => {
  res.setHeader(
    'Access-Control-Allow-Origin',
    process.env.CORS_ORIGIN || 'http://localhost:4200'
  );
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Text search endpoint
app.post('/api/search', (req, res) => {
  const { input, query, caseSensitive = false } = req.body ?? {};

  if (
    typeof input !== 'string' ||
    typeof query !== 'string' ||
    typeof caseSensitive !== 'boolean'
  ) {
    return res.status(400).json({
      error: 'Provide input and query as strings and caseSensitive as a boolean.'
    });
  }

  if (input.length > 500000 || query.length > 50000) {
    return res.status(413).json({
      error: 'Input or query is too long.'
    });
  }

  try {
    return res.json(searchText(input, query, { caseSensitive }));
  } catch {
    return res.status(500).json({
      error: 'Search could not be completed.'
    });
  }
});

// Locate the Angular production build
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDist = path.resolve(
  __dirname,
  '../../frontend/dist/vound-search-ui/browser'
);

// Serve Angular and its compiled assets
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));

  // Serve Angular for non-API routes
  app.get('/{*path}', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }

    return res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Unknown API routes
app.use('/api', (_req, res) => {
  return res.status(404).json({
    error: 'API endpoint not found.'
  });
});

// Error handling
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Request is too large.'
    });
  }

  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({
      error: 'Invalid JSON.'
    });
  }

  return res.status(500).json({
    error: 'Unexpected server error.'
  });
});

// Render provides the PORT environment variable
const port = Number(process.env.PORT || 3000);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Findly server listening on port ${port}`);
  });
}

export default app;
