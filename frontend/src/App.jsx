import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import EssayEditor from './components/EssayEditor'
import FeedbackPanel from './components/FeedbackPanel'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function App() {
  const [essay, setEssay] = useState(localStorage.getItem('essayContent') || '')
  const [analysis, setAnalysis] = useState(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [dark, setDark] = useState(localStorage.getItem('dark') === '1')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('dark', dark ? '1' : '0')
  }, [dark])

  useEffect(() => {
    // initial analysis if there is content
    if (essay && essay.replace(/<(.|\n)*?>/g, '').trim().length > 0) {
      analyze(essay)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function analyze(htmlContent) {
    setLoadingAnalysis(true)
    try {
      const plain = htmlContent.replace(/<(.|\n)*?>/g, '').trim()
      const res = await axios.post('/api/analyze', { text: plain })
      setAnalysis(res.data)
    } catch (err) {
      console.error(err)
      toast.error('Failed to analyze essay (mock server).')
    } finally {
      setLoadingAnalysis(false)
    }
  }

  function handleEssayChange(html) {
    setEssay(html)
    localStorage.setItem('essayContent', html)
  }

  async function handleQuickAnalyze() {
    if (!essay || essay.replace(/<(.|\n)*?>/g, '').trim().length === 0) {
      toast('Write something to analyze.', { icon: '✍️' })
      return
    }
    await analyze(essay)
    toast.success('Analysis complete')
  }

  async function handleRephrase(paragraphText) {
    // call rephrase endpoint
    const t = toast.loading('Rephrasing...')
    try {
      const res = await axios.post('/api/rephrase', { text: paragraphText })
      toast.success('Rephrased', { id: t })
      return res.data.rephrase
    } catch (err) {
      toast.error('Rephrase failed', { id: t })
      return paragraphText
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header dark={dark} setDark={setDark} />
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EssayEditor
              essay={essay}
              onChange={handleEssayChange}
              onAnalyze={handleQuickAnalyze}
              onRephrase={handleRephrase}
            />
          </div>

          <div>
            <FeedbackPanel
              analysis={analysis}
              loading={loadingAnalysis}
              onRequestAnalyze={handleQuickAnalyze}
            />
            <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-xl shadow">
              <h3 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">Tips for Demo</h3>
              <ol className="list-decimal list-inside text-sm text-slate-600 dark:text-slate-300">
                <li>Start with a short personal essay paragraph.</li>
                <li>Click Analyze to show scores and suggestions.</li>
                <li>Use Rephrase on a paragraph to demo AI power.</li>
                <li>Toggle Dark Mode to show UI polish.</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-slate-600 dark:text-slate-300">
        Orbit AI — AI Essay Editor (Enhanced) • Demo
      </footer>
    </div>
  )
}
