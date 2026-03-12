import { useEffect } from 'react'
import type { SessionResult } from '../App'

interface Props {
  result: SessionResult
  onHome: () => void
  onRetry: () => void
}

export default function Results({ result, onHome, onRetry }: Props): JSX.Element {
  const { quiz, answers, documentName } = result
  const total = quiz.questions.length
  const score = answers.filter((a, i) => a === quiz.questions[i].correct).length
  const pct = Math.round((score / total) * 100)

  useEffect(() => {
    const session = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      documentName,
      score,
      total,
      answers,
      quiz
    }
    window.api.saveSession(session).catch(console.error)
  }, [])

  const grade = pct >= 80 ? { label: 'Excellent !', color: 'text-emerald-400' }
    : pct >= 60 ? { label: 'Bien !', color: 'text-blue-400' }
    : pct >= 40 ? { label: 'Peut mieux faire', color: 'text-yellow-400' }
    : { label: 'À revoir…', color: 'text-red-400' }

  return (
    <div className="flex flex-col h-full">
      <div className="h-8 w-full" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />

      <div className="flex-1 overflow-y-auto flex flex-col items-center px-6 py-8 gap-8">
        {/* Score circle */}
        <div className="flex flex-col items-center gap-2 mt-4">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke="url(#grad)" strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - pct / 100)}`}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">{pct}%</span>
            </div>
          </div>
          <p className={`text-xl font-semibold ${grade.color}`}>{grade.label}</p>
          <p className="text-white/40 text-sm">{score} / {total} bonnes réponses</p>
          <p className="text-white/20 text-xs">{documentName}</p>
        </div>

        {/* Answer review */}
        <div className="w-full max-w-2xl flex flex-col gap-3">
          <h2 className="text-white/50 text-xs font-semibold uppercase tracking-wider">Correction</h2>
          {quiz.questions.map((q, i) => {
            const correct = answers[i] === q.correct
            return (
              <div
                key={q.id}
                className={`rounded-xl border p-4 flex flex-col gap-2
                  ${correct ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}
              >
                <div className="flex items-start gap-2">
                  <span className={`text-xs font-bold mt-0.5 shrink-0 ${correct ? 'text-emerald-400' : 'text-red-400'}`}>
                    {correct ? '✓' : '✗'}
                  </span>
                  <p className="text-white/80 text-sm leading-relaxed">{q.question}</p>
                </div>
                {!correct && (
                  <div className="ml-4 flex flex-col gap-1">
                    <p className="text-red-400/70 text-xs">
                      Ta réponse : {q.options[answers[i]]}
                    </p>
                    <p className="text-emerald-400/70 text-xs">
                      Bonne réponse : {q.options[q.correct]}
                    </p>
                  </div>
                )}
                <p className="ml-4 text-white/30 text-xs italic">{q.explanation}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-6 flex gap-3 max-w-2xl w-full mx-auto">
        <button
          onClick={onHome}
          className="flex-1 py-3 rounded-xl font-semibold text-sm border border-white/10 hover:bg-white/5 transition-all"
        >
          Accueil
        </button>
        <button
          onClick={onRetry}
          className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all
            bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
        >
          Recommencer
        </button>
      </div>
    </div>
  )
}
