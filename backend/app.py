# backend/app.py
import os
import json
import sqlite3
from datetime import datetime
from flask import Flask, request, jsonify, g
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATABASE = os.path.join(os.getcwd(), "essays.db")

# --------------------
# DB helpers
# --------------------
def get_db():
    db = getattr(g, "_database", None)
    if db is None:
        os.makedirs(os.path.dirname(DATABASE) or ".", exist_ok=True)
        db = g._database = sqlite3.connect(DATABASE, check_same_thread=False)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, "_database", None)
    if db is not None:
        db.close()

def init_db():
    db = get_db()
    cur = db.cursor()
    cur.execute("""
      CREATE TABLE IF NOT EXISTS essays (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        result TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    """)
    db.commit()

# --------------------
# Analysis helpers (heuristic)
# --------------------
POSITIVE_WORDS = {"good","great","excellent","well","outstanding","strong","positive","benefit","success"}
NEGATIVE_WORDS = {"bad","poor","weak","lack","problem","issue","negative","difficult","fail"}

def flesch_kincaid_readability(text):
    # Very lightweight approximate Flesch score (not perfect but okay for demo)
    sentences = max(1, text.count(".") + text.count("!") + text.count("?"))
    words = text.split()
    syllables = 0
    for w in words:
        # rough syllable estimate: count vowels groups
        syllables += max(1, sum(1 for _ in "".join(ch for ch in w.lower() if ch.isalpha()) if False))  # fallback 1
        # simpler heuristic:
        vw = sum(1 for ch in w.lower() if ch in "aeiou")
        syllables += max(1, vw//1)
    # avoid extremes
    words_count = max(1, len(words))
    syllables = max(1, syllables)
    fk = 206.835 - 1.015 * (words_count / sentences) - 84.6 * (syllables / words_count)
    return round(max(0, min(120, fk)), 1)

def analyze_essay_advanced(text: str):
    # Basic metrics
    words = len(text.split())
    sentences = max(1, text.count(".") + text.count("!") + text.count("?"))
    avg_words_per_sentence = round(words / sentences, 1)
    # Grammar heuristic (short: penalize fragments, short sentences, extreme long sentences)
    grammar_issues = 0
    # penalty if avg_words_per_sentence < 8 or > 30
    if avg_words_per_sentence < 8:
        grammar_issues += 1
    if avg_words_per_sentence > 30:
        grammar_issues += 1
    # punctuation checks
    if text.strip() and text.strip()[-1] not in ".!?":
        grammar_issues += 1
    # clarity score: based on word count and avg words per sentence
    clarity_score = int(max(0, min(100, 60 + (words - 200) / 8 - (abs(avg_words_per_sentence - 16) * 1.2))))
    # tone/sentiment estimate
    lw = [w.strip(".,!?;:()[]\"'").lower() for w in text.split()]
    pos = sum(1 for w in lw if w in POSITIVE_WORDS)
    neg = sum(1 for w in lw if w in NEGATIVE_WORDS)
    tone = "Neutral"
    if pos - neg >= 2:
        tone = "Positive"
    elif neg - pos >= 2:
        tone = "Negative"
    # readability (Flesch)
    readability = flesch_kincaid_readability(text)
    # suggestions
    suggestions = []
    if words < 200:
        suggestions.append("Essay is short — expand your arguments and add examples.")
    if avg_words_per_sentence > 25:
        suggestions.append("Some sentences are very long. Try splitting them for clarity.")
    if "very " in text.lower():
        suggestions.append("Avoid weak intensifiers like 'very'; use stronger, specific words.")
    if readability < 50:
        suggestions.append("Consider simpler sentence structure for readability (aim for Flesch > 50).")
    # final assembled result
    result = {
        "word_count": words,
        "sentence_count": sentences,
        "avg_words_per_sentence": avg_words_per_sentence,
        "grammar_issues": grammar_issues,
        "clarity_score": max(0, min(100, clarity_score)),
        "tone": tone,
        "readability": readability,
        "suggestions": suggestions
    }
    return result

# --------------------
# Routes
# --------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message":"Welcome to Orbit AI Essay Editor Backend 🚀","status":"running","endpoints":["/analyze","/history","/stats"]})

@app.route("/analyze", methods=["POST"])
def analyze():
    payload = request.get_json() or {}
    text = payload.get("text") or payload.get("essay") or ""
    if not isinstance(text, str) or text.strip() == "":
        return jsonify({"error":"No text provided"}), 400
    try:
        result = analyze_essay_advanced(text)
        return jsonify({"ok": True, "result": result}), 200
    except Exception as e:
        return jsonify({"error":"internal error","details": str(e)}), 500

@app.route("/save", methods=["POST"])
def save():
    payload = request.get_json() or {}
    text = payload.get("text") or payload.get("essay") or ""
    result = payload.get("result") or {}
    if not text:
        return jsonify({"error":"text required"}), 400
    db = get_db()
    cur = db.cursor()
    cur.execute("INSERT INTO essays (text, result) VALUES (?,?)", (text, json.dumps(result)))
    db.commit()
    eid = cur.lastrowid
    return jsonify({"ok": True, "id": eid}), 201

@app.route("/history", methods=["GET"])
def history():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id, text, result, created_at FROM essays ORDER BY id DESC LIMIT 50")
    rows = cur.fetchall()
    out = []
    for r in rows:
        parsed = json.loads(r["result"]) if r["result"] else None
        out.append({
            "id": r["id"],
            "text": (r["text"][:800] + "...") if len(r["text"])>800 else r["text"],
            "result": parsed,
            "created_at": r["created_at"]
        })
    return jsonify({"ok": True, "history": out}), 200

@app.route("/stats", methods=["GET"])
def stats():
    # analytics: average clarity, average readability, total essays
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT result FROM essays")
    rows = cur.fetchall()
    clarity_sum = 0
    readability_sum = 0
    count = 0
    for r in rows:
        if not r["result"]:
            continue
        obj = json.loads(r["result"])
        clarity_sum += obj.get("clarity_score", 0)
        readability_sum += obj.get("readability", 0)
        count += 1
    avg_clarity = round(clarity_sum / count, 1) if count else None
    avg_readability = round(readability_sum / count, 1) if count else None
    return jsonify({"ok": True, "total": count, "avg_clarity": avg_clarity, "avg_readability": avg_readability}), 200

# --------------------
# Main
# --------------------
if __name__ == "__main__":
    with app.app_context():
        init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
