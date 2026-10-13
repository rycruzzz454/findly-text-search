
# Stage 1: Build the Angular frontend
FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./

RUN npm ci

COPY frontend/ ./

RUN npm run build


# Stage 2: Run the Python FastAPI backend
FROM python:3.14-slim

WORKDIR /app

COPY python-backend/requirements.txt ./requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

COPY python-backend/ ./python-backend/

COPY --from=frontend-build \
    /app/frontend/dist/vound-search-ui \
    ./frontend/dist/vound-search-ui

ENV PORT=10000

EXPOSE 10000

CMD ["sh", "-c", "uvicorn main:app --app-dir python-backend --host 0.0.0.0 --port ${PORT}"]
