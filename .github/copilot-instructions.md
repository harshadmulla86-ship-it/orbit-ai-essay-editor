<!--
Guidance for AI coding agents working on the Orbit AI Essay Editor repo.
Keep this file concise (20–50 lines): focus on architecture, dev workflows, key patterns,
and explicit integration points found in the codebase so an AI can be productive quickly.
-->

# Copilot / Agent Instructions — Orbit AI Essay Editor

- Big picture
  - This repository is a simple two-tier app: a Flask backend (backend/) and a React + Vite frontend (frontend/).
  - Backend: `backend/app.py` exposes small JSON endpoints: `/analyze`, `/save`, `/history`, `/health`.
    - Data is stored in a local SQLite DB file at `backend/essays.db` (created by `init_db()` in `app.py`).
    - Scoring is a deterministic heuristic implemented directly in `app.py` (no external ML models).
  - Frontend: `frontend/` is a Vite + React app. API calls are in `frontend/src/api.js` and the UI lives in `frontend/src/components/`.

- Developer workflows (how to run / test locally)
  - Backend (Windows PowerShell):
    - cd backend
    - python -m venv venv; .\venv\Scripts\Activate.ps1
    - pip install -r requirements.txt
    - python app.py (listens on port 5000)
  - Frontend:
    - cd frontend
    - npm install
    - npm run dev (uses Vite; set VITE_API_BASE to point to backend if not running on localhost:5000)
  - Deployment hooks: both `backend/Dockerfile` and `frontend/Dockerfile` exist; backend also has a `Procfile` for simple deploy flows.

- Project-specific patterns & gotchas
  - Lightweight API contract: `analyze` returns { ok, result: { score, word_count, feedback } } (see `backend/app.py`). Some frontend components (e.g., `ResultPanel.jsx`) expect richer keys (clarity_score, suggestions, readability). When editing API shapes, update `frontend/src/api.js` and any components consuming the response.
  - DB schema is created on start by `init_db()` — migrations are manual. If you change schema, either update `init_db()` or ship a migration script and inform maintainers.
  - Save flows store UTC ISO timestamps via `datetime.utcnow().isoformat()` in `app.py`.

- Integration points and files to check when changing behavior
  - backend/app.py — routes and DB usage
  - backend/README-backend.md — backend run notes and DB location
  - frontend/src/api.js — central place for API base URL and fetch wrappers
  - frontend/src/components/* — Editor, EditorPanel, ResultPanel show how data flows from user input → analyze → save/export
  - seed_data.py and backend/saved_essays/ — useful for populating or inspecting example data

- Examples of concise edits an agent might make
  - If adding a new analysis field (e.g., `readability`): update `analyze()` in `backend/app.py` to include it, update `save()` payload handling if persisted, update `frontend/src/api.js` return shape (no change needed if passthrough), and update `ResultPanel.jsx` to render the new field.
  - If changing port or host for the backend, set `VITE_API_BASE` in the frontend environment (Vite uses `import.meta.env.VITE_API_BASE`) and update any Docker/Procfile values.

- When uncertain, consult these files first
  - `backend/app.py`, `backend/README-backend.md`, `frontend/src/api.js`, `frontend/src/components/Editor.jsx`, `frontend/src/components/EditorPanel.jsx`, and `frontend/src/components/ResultPanel.jsx`.

Please ask if you want a more detailed API contract or an automated test scaffold added.
