// backend/server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import chalk from "chalk";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Health
app.get("/", (req, res) => {
  res.send("🚀 Orbit AI Backend running. Endpoints: /api/analyze, /api/rephrase, /api/grammar, /api/summarize, /api/transform");
});

// ANALYZE (mock realistic)
app.post("/api/analyze", (req, res) => {
  const text = (req.body.text || "").trim();
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const sentences = text ? text.split(/[.!?]+/).filter(Boolean).length : 1;
  const syllables = (text.match(/[aeiouy]{1,2}/gi) || []).length;

  const readability = Math.max(
    0,
    Math.min(100, 206.835 - 1.015 * (words / sentences || 1) - 84.6 * (syllables / Math.max(words,1)))
  );

  const clarity = Math.min(100, Math.round(60 + Math.random() * 40 - Math.max(0, 100 - words) * 0.02));
  const impact = Math.min(100, Math.round(55 + Math.random() * 45 - Math.max(0, 120 - words) * 0.015));
  const tone = words > 200 ? "Persuasive / Confident" : words > 100 ? "Formal / Reflective" : "Concise / Neutral";

  res.json({
    clarity: Math.round(clarity),
    impact: Math.round(impact),
    readability: Math.round(readability),
    tone,
    suggestions: [
      "Add specific examples to strengthen your argument.",
      "Vary sentence structure for improved readability.",
      "Conclude with a clear and impactful statement.",
      "Use transition words to connect ideas smoothly."
    ]
  });
});

// REPHRASE (3 styles)
app.post("/api/rephrase", (req, res) => {
  const text = (req.body.text || "").toString();

  const Formal = text
    .replace(/\b(can't|dont|don't|won't|cant)\b/gi, "cannot")
    .replace(/\bi\b/g, "I");

  const Creative = text.replace(/\b(\w{6,})\b/g, (m) => m.toUpperCase());

  const Concise = text.split(/\s+/).slice(0, Math.ceil(text.split(/\s+/).length * 0.7)).join(" ");

  res.json({ rephrased: { Formal, Creative, Concise } });
});

// GRAMMAR (improved simple corrections)
app.post("/api/grammar", (req, res) => {
  try {
    const raw = (req.body.text || "").toString();

    let corrected = raw
      .replace(/\bi\b/g, "I")
      .replace(/\bim\b/gi, "I'm")
      .replace(/\bid\b/gi, "I'd")
      .replace(/\bive\b/gi, "I've")
      .replace(/\bdont\b/gi, "don't")
      .replace(/\bdidnt\b/gi, "didn't")
      .replace(/\bwasnt\b/gi, "wasn't")
      .replace(/\bcant\b/gi, "can't")
      .replace(/\bwont\b/gi, "won't")
      .replace(/\bi am\b/gi, "I am")
      .replace(/\s{2,}/g, " ")
      .trim();

    // Capitalize sentence starts
    corrected = corrected.replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());

    return res.json({
      corrected,
      message: "Grammar corrections applied (basic)."
    });
  } catch (err) {
    console.error("grammar err", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// SUMMARIZE (simple mock)
app.post("/api/summarize", (req, res) => {
  const text = (req.body.text || "").toString();
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const summary = sentences.slice(0, Math.min(3, sentences.length)).join(". ").trim();
  res.json({ summary: summary || text.slice(0, 200) });
});

// TRANSFORM (tone change mock)
app.post("/api/transform", (req, res) => {
  const { text = "", tone = "formal" } = req.body;
  let transformed = text.toString();

  if (tone === "formal") {
    transformed = transformed.replace(/\b(can't|don't|won't)\b/gi, "cannot").replace(/\bi\b/g, "I");
  } else if (tone === "casual") {
    transformed = transformed.replace(/\bdo not\b/gi, "don't").replace(/\bI am\b/gi, "I'm");
  } else if (tone === "concise") {
    transformed = transformed.split(" ").slice(0, Math.ceil(transformed.split(" ").length * 0.7)).join(" ");
  }

  res.json({ transformed });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(chalk.greenBright.bold(`✅ Orbit AI Backend running at http://localhost:${PORT}`));
});
