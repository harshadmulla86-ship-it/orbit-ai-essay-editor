import React, { useRef, useState, useEffect } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { jsPDF } from 'jspdf'
import toast from 'react-hot-toast'

export default function EssayEditor({ essay, onChange, onAnalyze, onRephrase }) {
  const quillRef = useRef(null)
  const [value, setValue] = useState(essay || '')
  const [saving, setSaving] = useState(false)
  const [wordCount, setWordCount] = useState(0)

  useEffect(() => {
    setValue(essay)
    computeWordCount(essay)
  }, [essay])

  useEffect(() => {
    const id = setInterval(() => {
      if (value !== undefined) {
        setSaving(true)
        localStorage.setItem('essayContent', value)
        setTimeout(() => setSaving(false), 450)
      }
    }, 5000)
    return () => clearInterval(id)
  }, [value])

  function computeWordCount(html) {
    const text = html ? html.replace(/<(.|\n)*?>/g, '') : ''
    const words = text.trim().split(/\s+/).filter(Boolean)
    setWordCount(words.length)
  }

  function handleChange(val) {
    setValue(val)
    computeWordCount(val)
    onChange(val)
  }

  async function exportPdf() {
    const doc = new jsPDF({
      unit: 'pt',
      format: 'a4'
    })
    const text = value.replace(/<(.|\n)*?>/g, '')
    const split = doc.splitTextToSize(text, 540)
    doc.text(split, 40, 60)
    doc.save('essay.pdf')
    toast.success('PDF downloaded')
  }

  async function rephraseSelection() {
    try {
      const editor = quillRef.current?.getEditor()
      if (!editor) return
      const selection = editor.getSelection()
      if (!selection || selection.length === 0) {
        toast('Select a paragraph to rephrase', { icon: '✍️' })
        return
      }
      const selectedText = editor.getText(selection.index, selection.length)
      const rephrased = await onRephrase(selectedText)
      if (rephrased) {
        // replace selection with rephrased plain text (keeps minimal formatting)
        editor.deleteText(selection.index, selection.length)
        editor.insertText(selection.index, rephrased)
        const html = editor.root.innerHTML
        handleChange(html)
      }
    } catch (err) {
      console.error(err)
      toast.error('Rephrase failed')
    }
  }

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'clean']
    ]
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Essay Editor</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300">Write your college essay here. Autosave every 5s.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-600 dark:text-slate-300 mr-2">{wordCount} words</div>
          <button onClick={onAnalyze} className="px-3 py-1 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700">Analyze</button>
          <button onClick={exportPdf} className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-700 text-sm">Export PDF</button>
        </div>
      </div>

      <div className="mb-3">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={handleChange}
          modules={modules}
          placeholder="Start writing your essay..."
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500 dark:text-slate-300">
          {saving ? 'Saving...' : 'All changes saved locally.'}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={rephraseSelection} className="text-sm px-3 py-1 rounded border hover:bg-slate-50 dark:hover:bg-slate-700">Rephrase selection</button>
        </div>
      </div>
    </div>
  )
}
