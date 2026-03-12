import { useState, useEffect } from 'react'

interface Props {
  onBack: () => void
}

export default function Settings({ onBack }: Props): JSX.Element {
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    window.api.getApiKey().then((key) => {
      if (key) setApiKey(key)
    })
  }, [])

  async function handleSave(): Promise<void> {
    await window.api.setApiKey(apiKey.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center gap-3 px-6 pt-6 pb-4"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <button
          onClick={onBack}
          className="text-white/30 hover:text-white/60 transition-colors text-sm"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          ← Retour
        </button>
        <h1 className="text-white/80 font-semibold">Paramètres</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6">
        <div className="w-full max-w-md flex flex-col gap-4">
          <div>
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">
              Clé API Groq
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white
                placeholder:text-white/20 focus:outline-none focus:border-violet-500 transition-colors"
            />
            <p className="mt-2 text-white/20 text-xs">
              Obtiens ta clé gratuite sur{' '}
              <span className="text-violet-400/70">console.groq.com</span>
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all
              bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500
              disabled:opacity-20 disabled:cursor-not-allowed"
          >
            {saved ? '✓ Sauvegardé' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  )
}
