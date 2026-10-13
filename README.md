# Findly — Search Hits Highlighter

A small full-stack assignment demonstrating communication between an Angular frontend and a Node.js/Express REST API. Users paste text, enter a search phrase, and see each occurrence highlighted along with its line/column position.

## Requirements

- Node.js 22+ and npm
- Internet access for the **initial** installation of npm dependencies
- Two terminals, or use the root convenience scripts

## Quick start

From the project root:

```bash
npm install
npm run setup
npm start
```

Then open **http://localhost:4200**.

Alternatively, run each service separately:

```bash
cd backend
npm install
npm run dev
```

And in another terminal:

```bash
cd frontend
npm install
npm start
```

The frontend uses port **4200** and the backend uses port **3000**. Ensure both are free. You can test the API at `http://localhost:3000/api/health`.

> The project uses `latest` for Angular packages so a fresh installation picks up the current Angular release. npm will resolve and install the Angular tooling on setup. For a reproducible handoff, commit the generated `package-lock.json` after a successful install.

## How it works

1. Type or paste content into **Your text**.
2. Enter a word or phrase in **Search term**.
3. Optional: turn on **Case-sensitive matching**.
4. Click **Find matches**. The Angular client sends an HTTP POST to the API and renders highlighted occurrences, a total, and one-based line/column positions.

Searches are **literal** (not regular expressions), **case-insensitive by default**, and **non-overlapping**. Empty queries are rejected in the UI; an empty query sent directly to the API returns zero hits. The search result includes zero-based `start` and exclusive `end` character offsets in JavaScript UTF-16 units. Results are capped at 10,000 hits to prevent runaway responses, with a `truncated` flag.

## REST API

`POST http://localhost:3000/api/search`

Request:

```json
{ "input": "Hello world. Hello again.", "query": "hello", "caseSensitive": false }
```

Response:

```json
{
  "totalHits": 2,
  "hits": [
    { "start": 0, "end": 5, "line": 1, "column": 1, "text": "Hello" },
    { "start": 13, "end": 18, "line": 1, "column": 14, "text": "Hello" }
  ],
  "truncated": false
}
```

`GET /api/health` returns `{ "status": "ok" }`.

Bad requests return HTTP 400 and an error message. The API has request-size/length limits, and the allowed frontend origin can be overridden with `CORS_ORIGIN`.

## Tests

```bash
npm test
```

This runs backend unit tests for multiple hits, case sensitivity, literal text, non-overlapping matches, multiline locations, empty queries, and invalid input.

## Build

```bash
npm run build
```

This produces an Angular production build in `frontend/dist/` (the API remains a separate Node.js service).

## Repository structure

```
frontend/   Angular standalone UI and styles
backend/    Express API, search algorithm, unit tests
README.md   setup, run, and API documentation
```

## Ideas for future improvements

- A click-to-jump match navigator for longer documents
- Whole-word and regular-expression search options
- File upload support for plain-text files
- Pagination/virtualization of very large result sets
- Unicode grapheme-aware indexing and locale-aware case folding for complex scripts

## Implementation note

This submission uses Node.js/Express because the assignment permits any backend technology. No database is needed; submitted text is processed in memory and not persisted. The highlight preview renders via Angular's escaped text bindings, not injected HTML.
