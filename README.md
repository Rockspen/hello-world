# Movie Tracker

Simple movie-tracking app with a TypeScript frontend and FastAPI backend. Add movies you want to watch, note which streaming platform they're on, and persist them to `data/movies.json`.

## Backend (FastAPI)

1. Create and activate a virtual environment.
2. Install dependencies:

   ```bash
   pip install -r backend/requirements.txt
   ```

3. Start the API server:

   ```bash
   uvicorn backend.main:app --reload
   ```

The API exposes:

- `GET /movies` — list tracked movies.
- `POST /movies` — add a movie with `{ "title": "Arrival", "platform": "Netflix" }`.
- `DELETE /movies/{title}` — remove a movie by title (case-insensitive).

Movies are stored in `data/movies.json`.

## Frontend (TypeScript)

1. Install dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Build the TypeScript bundle:

   ```bash
   npm run build
   ```

3. Open `frontend/index.html` in your browser. The page expects the API to be running at `http://localhost:8000`.

## Project structure

- `backend/` — FastAPI app and requirements
- `frontend/` — TypeScript source, build output (`dist/`), and static HTML
- `data/movies.json` — persisted movie list
