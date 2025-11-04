# Simple script to create sqlite file (optional)
import sqlite3, json, os
os.makedirs('data', exist_ok=True)
conn = sqlite3.connect('data/db.sqlite3')
c = conn.cursor()
c.execute('''
CREATE TABLE IF NOT EXISTS essays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  result TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
''')
conn.commit()
conn.close()
print("DB created / ensured.")
