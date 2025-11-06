const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
app.use(cors())
app.use(bodyParser.json())

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function mockAnalysis(text) {
  // basic heuristics for demo
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  const clarity = Math.min(95, Math.round((Math.min(wordCount, 500) / 500) * 80 + randomInt(-10, 10)))
  const impact = Math.min(95, Math.round((Math.min(wordCount, 500) / 500) * 60 + randomInt(-5, 20)))
  const toneScore = (text.match(/[.!?]/g) || []).length
  const tone = toneScore > 3 ? 'Confident / Narrative' : 'Reflective / Formal'
  const suggestions = []
  if (wordCount < 150) suggestions.push('Consider expanding with a concrete example.')
  if (!/I|we|my|our/.test(text)) suggestions.push('Add a personal anecdote to increase impact.')
  if (!/experience|learn|challenge/.test(text)) suggestions.push('Mention learning outcomes or challenges you overcame.')
  if (text.split('\n').length < 3) suggestions.push('Add structure: intro, example, reflection.')
  return {
    clarity,
    impact,
    tone,
    suggestions
  }
}

app.post('/api/analyze', (req, res) => {
  const { text } = req.body || {}
  setTimeout(() => {
    res.json(mockAnalysis(text || ''))
  }, 900 + Math.random() * 800)
})

app.post('/api/rephrase', (req, res) => {
  const { text } = req.body || {}
  // Very simple mock rephrase — in real product call LLM
  const reph = (text || '')
    .replace(/\bi\b/g, 'I')
    .replace(/(\.|\!|\?)\s*([a-z])/g, (m, p1, p2) => p1 + ' ' + p2.toUpperCase())
    .split(' ')
    .map((w, i) => (i % 12 === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ')
  setTimeout(() => {
    res.json({ rephrase: reph || text })
  }, 800 + Math.random() * 600)
})

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Mock API server listening at http://localhost:${port}`))
