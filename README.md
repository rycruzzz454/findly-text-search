# Findly — Search Hits Highlighter

A full-stack text search application built with **Angular** and **Python (FastAPI)**.

Findly allows users to enter text, search for words or phrases, and highlight every occurrence. It also displays match counts and exact line/column locations.

**Live Demo:** https://findly-text-search.onrender.com

## Technology Stack

- **Frontend:** Angular, TypeScript, HTML, CSS
- **Backend:** Python, FastAPI, Uvicorn
- **Testing:** pytest
- **Deployment:** Render
- **Communication:** REST API (JSON over HTTP)

## Requirements

- Node.js 22+ and npm
- Python 3.11+
- Internet access for the initial dependency installation

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/rycruzzz454/findly-text-search.git
cd findly-text-search
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

### 3. Set up the Python backend

Create a virtual environment from the project root:

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\Activate.ps1
```

Or on macOS/Linux:

```bash
source .venv/bin/activate
```

Install the Python dependencies:

```bash
python -m pip install -r python-backend/requirements.txt
```

### 4. Start the Python backend

From the project root:

```bash
python -m uvicorn main:app --app-dir python-backend --host 127.0.0.1 --port 8000
```

The Python API runs at:

http://127.0.0.1:8000

Health-check endpoint:

http://127.0.0.1:8000/api/health

### 5. Start the Angular frontend

Open a second terminal from the project root:

```bash
npm start --prefix frontend
```

Then open:

http://localhost:4200

The Angular development proxy forwards `/api` requests to the FastAPI backend.

## How It Works

1. Enter or paste text into **Your text**.
2. Enter a word or phrase in **Search term**.
3. Optionally enable **Case-sensitive matching**.
4. Click **Find matches**.
5. Findly highlights the occurrences and displays their line and column positions.

Searches are literal, case-insensitive by default, and non-overlapping.

Results include UTF-16-compatible character offsets for Angular highlighting and are limited to 10,000 matches per request.

## REST API

### POST `/api/search`

Example request:

```json
{
  "input": "Hello world. Hello again.",
  "query": "hello",
  "caseSensitive": false
}
```

Example response:

```json
{
  "totalHits": 2,
  "hits": [
    {
      "start": 0,
      "end": 5,
      "line": 1,
      "column": 1,
      "text": "Hello"
    },
    {
      "start": 13,
      "end": 18,
      "line": 1,
      "column": 14,
      "text": "Hello"
    }
  ],
  "truncated": false
}
```

### GET `/api/health`

Returns:

```json
{
  "status": "ok"
}
```

FastAPI's interactive API documentation is available at `/docs` when running the Python backend.

## Running Tests

From the project root:

```bash
python -m pytest python-backend/test_search.py -v
```

The test suite covers multiple occurrences, case sensitivity, literal matching, non-overlapping results, multiline positions, empty queries, invalid inputs, Unicode offsets, and the maximum match limit.

## Production Build

Build the Angular frontend:

```bash
npm run build --prefix frontend
```

Then start FastAPI:

```bash
python -m uvicorn main:app --app-dir python-backend --host 0.0.0.0 --port 8000
```

FastAPI serves the compiled Angular frontend and REST API from the same application.

## Project Structure

```text
findly-text-search/
├── frontend/
│   ├── src/
│   ├── angular.json
│   ├── proxy.conf.json
│   └── package.json
├── python-backend/
│   ├── main.py
│   ├── search.py
│   ├── test_search.py
│   └── requirements.txt
├── Dockerfile
├── .dockerignore
├── README.md
└── .gitignore
```


## Potential Improvements

- Navigate directly between highlighted matches.
- Add whole-word and regular-expression search options.
- Support uploads of plain-text documents.
- Add pagination or virtualization for very large results.
- Improve international text matching with Unicode-aware search options.

## Implementation Notes

Findly processes search requests in memory without requiring a database or persisting submitted text.

The application separates search logic from API handling, allowing the search algorithm to be tested independently.

The Angular frontend renders highlighted results through escaped text bindings rather than injecting raw HTML.