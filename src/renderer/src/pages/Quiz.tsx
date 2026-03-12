import { useState } from 'react'
import type { Quiz as QuizType } from '../../../main/ai'

interface Props {
  quiz: QuizType
  onFinish: (answers: number[]) => void
  onAbort: () => void
}

export default function Quiz({ quiz, onFinish, onAbort }: Props): JSX.Element {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [revealed, setRevealed] = useState(false)

  const q = quiz.questions[current]
  const total = quiz.questions.length
  const progress = ((current) / total) * 100

  function handleSelect(idx: number): void {
    if (revealed) return
    setSelected(idx)
  }

  function handleConfirm(): void {
    if (selected === null) return
    if (!revealed) {
      setRevealed(true)
      return
    }
  }

  function handleNext(): void {
    if (selected === null) return
    const newAnswers = [...answers, selected]
    if (current + 1 >= total) {
      onFinish(newAnswers)
    } else {
      setAnswers(newAnswers)
      setCurrent(current + 1)
      setSelected(null)
      setRevealed(false)
    }
  }

  const optionLetters = ['A', 'B', 'C', 'D']

  function optionStyle(idx: number): string {
    const base = 'w-full text-left px-5 py-4 rounded-xl border transition-all flex items-center gap-4 '
    if (!revealed) {
      if (selected === idx) return base + 'border-violet-500 bg-violet-500/15 text-white'
      return base + 'border-white/10 bg-white/[0.02] text-white/70 hover:border-white/30 hover:bg-white/5 cursor-pointer'
    }
    if (idx === q.correct) return base + 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
    if (selected === idx && idx !== q.correct) return base + 'border-red-500 bg-red-500/10 text-red-300'
    return base + 'border-white/5 bg-white/[0.01] text-white/30'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
        <button
          onClick={onAbort}
          className="text-white/30 hover:text-white/60 transition-colors text-sm"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          ← Quitter
        </button>
        <span className="text-white/40 text-sm">
          {current + 1} / {total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mx-6 h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center px-6 py-8 gap-6">
        <div className="w-full max-w-2xl">
          {/* Question */}
          <p className="text-white/90 text-lg font-medium leading-relaxed mb-6">
            {q.question}
          </p>

          {/* Options */}
          <div className="flex flex-col gap-3">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                className={optionStyle(idx)}
                onClick={() => handleSelect(idx)}
                disabled={revealed}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border
                  ${!revealed && selected === idx ? 'border-violet-400 bg-violet-500/30 text-violet-300' : ''}
                  ${revealed && idx === q.correct ? 'border-emerald-500 bg-emerald-500/30 text-emerald-300' : ''}
                  ${revealed && selected === idx && idx !== q.correct ? 'border-red-500 bg-red-500/20 text-red-300' : ''}
                  ${(!revealed && selected !== idx) || (revealed && idx !== q.correct && selected !== idx) ? 'border-white/10 text-white/30' : ''}
                `}>
                  {optionLetters[idx]}
                </span>
                <span className="text-sm">{opt}</span>
              </button>
            ))}
          </div>

          {/* Explanation */}
          {revealed && (
            <div className="mt-5 px-5 py-4 rounded-xl bg-white/[0.03] border border-white/10">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">Explication</p>
              <p className="text-white/70 text-sm leading-relaxed">{q.explanation}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer action */}
      <div className="px-6 pb-6 flex justify-center">
        <div className="w-full max-w-2xl">
          {!revealed ? (
            <button
              onClick={handleConfirm}
              disabled={selected === null}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all
                bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500
                disabled:opacity-20 disabled:cursor-not-allowed"
            >
              Valider
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all
                bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
            >
              {current + 1 >= total ? 'Voir les résultats' : 'Question suivante →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
