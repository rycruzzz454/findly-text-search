
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict, StrictBool, StrictStr

from search import search_text

app = FastAPI(title="Findly Search API")


# Search request validation
class SearchRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    input: StrictStr
    query: StrictStr
    caseSensitive: StrictBool = False


# Health check endpoint
@app.get("/api/health")
def health():
    return {"status": "ok"}


# Search endpoint
@app.post("/api/search")
def search(payload: SearchRequest):
    if len(payload.input) > 500000 or len(payload.query) > 50000:
        return JSONResponse(
            status_code=413,
            content={"error": "Input or query is too long."}
        )

    return search_text(
        payload.input,
        payload.query,
        payload.caseSensitive
    )


# Locate the Angular production build
FRONTEND_DIR = (
    Path(__file__).resolve().parent.parent
    / "frontend"
    / "dist"
    / "vound-search-ui"
    / "browser"
)


# Serve Angular static assets
if FRONTEND_DIR.is_dir():
    app.mount(
        "/",
        StaticFiles(directory=str(FRONTEND_DIR), html=True),
        name="frontend"
    )


# Handle Angular routes and page refreshes
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    if request.url.path.startswith("/api/"):
        return JSONResponse(
            status_code=404,
            content={"error": "API endpoint not found."}
        )

    index_file = FRONTEND_DIR / "index.html"

    if index_file.is_file():
        return FileResponse(index_file)

    return JSONResponse(
        status_code=404,
        content={"error": "Page not found."}
    )
