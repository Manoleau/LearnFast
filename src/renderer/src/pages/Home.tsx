import { useState, useCallback } from 'react'
import type { Quiz } from '../../../main/ai'

interface Props {
  onStartQuiz: (quiz: Quiz, docName: string) => void
  onOpenSettings: () => void
}

export default function Home({ onStartQuiz, onOpenSettings }: Props): JSX.Element {
  const [filePath, setFilePath] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [questionCount, setQuestionCount] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  async function pickFile(): Promise<void> {
    const path = await window.api.pickDocument()
    if (path) {
      setFilePath(path)
      setFileName(path.split(/[\\/]/).pop() ?? path)
      setError(null)
    }
  }

  async function handleGenerate(): Promise<void> {
    if (!filePath) return
    setLoading(true)
    setError(null)
    try {
      const quiz = await window.api.generateQuiz(filePath, questionCount)
      onStartQuiz(quiz, fileName)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('API_KEY_MISSING')) {
        setError('Clé API manquante. Va dans les Paramètres pour l\'ajouter.')
      } else {
        setError('Erreur lors de la génération. Vérifie ta clé API et réessaie.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
    if (!allowed.includes(file.type)) {
      setError('Format non supporté. Utilise PDF, PNG, JPG ou WEBP.')
      return
    }
    // electron drag-drop gives us the path
    const path = (file as File & { path?: string }).path
    if (path) {
      setFilePath(path)
      setFileName(file.name)
      setError(null)
    }
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* Titlebar drag region */}
      <div className="h-8 w-full" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />

      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            LearnFast
          </h1>
          <p className="mt-2 text-white/40 text-sm">Transforme tes cours en quiz en quelques secondes</p>
        </div>

        {/* Drop zone */}
        <div
          className={`w-full max-w-lg border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-all
            ${dragging ? 'border-violet-400 bg-violet-500/10' : 'border-white/10 hover:border-white/30 bg-white/[0.02]'}
            ${filePath ? 'border-violet-500/50 bg-violet-500/5' : ''}`}
          onClick={pickFile}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {filePath ? (
            <>
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-white/80 text-sm font-medium text-center">{fileName}</p>
              <p className="text-white/30 text-xs">Clique pour changer</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-white/40 text-sm">Glisse ton cours ici ou clique pour parcourir</p>
              <p className="text-white/20 text-xs">PDF, PNG, JPG, WEBP</p>
            </>
          )}
        </div>

        {/* Options */}
        <div className="w-full max-w-lg flex items-center gap-4">
          <label className="text-white/50 text-sm whitespace-nowrap">Nombre de questions</label>
          <input
            type="range"
            min={3}
            max={20}
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="flex-1 accent-violet-500"
          />
          <span className="text-violet-400 font-semibold w-6 text-center">{questionCount}</span>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400/80 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 max-w-lg text-center">
            {error}
          </p>
        )}

        {/* CTA */}
        <button
          onClick={handleGenerate}
          disabled={!filePath || loading}
          className="w-full max-w-lg py-3 rounded-xl font-semibold text-sm transition-all
            bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500
            disabled:opacity-30 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyse en cours…
            </>
          ) : (
            'Générer le quiz'
          )}
        </button>
      </div>

      {/* Settings button */}
      <div className="pb-6 flex justify-center">
        <button
          onClick={onOpenSettings}
          className="text-white/20 hover:text-white/50 text-xs flex items-center gap-1.5 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Paramètres
        </button>
      </div>
    </div>
  )
}
