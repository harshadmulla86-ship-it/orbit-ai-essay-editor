Backend for Orbit AI Essay Editor

Run locally:
1. cd backend
2. python -m venv venv
3. .\venv\Scripts\Activate.ps1
4. pip install -r requirements.txt
5. python app.py

Database: SQLite by default at data/db.sqlite3
To use Postgres, set DATABASE_URL env var (e.g., postgres://user:pass@host:5432/db)
