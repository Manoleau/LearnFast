import { useState } from 'react'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import Results from './pages/Results'
import Settings from './pages/Settings'
import type { Quiz as QuizType } from '../../main/ai'

export type Page = 'home' | 'quiz' | 'results' | 'settings'

export interface SessionResult {
  quiz: QuizType
  answers: number[]
  documentName: string
}

export default function App(): JSX.Element {
  const [page, setPage] = useState<Page>('home')
  const [quiz, setQuiz] = useState<QuizType | null>(null)
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null)

  function startQuiz(q: QuizType, docName: string): void {
    setQuiz(q)
    setPage('quiz')
    setSessionResult(null)
    // store docName on quiz for later
    ;(q as QuizType & { _docName: string })._docName = docName
  }

  function finishQuiz(answers: number[]): void {
    if (!quiz) return
    const docName = (quiz as QuizType & { _docName: string })._docName ?? 'Document'
    const result: SessionResult = { quiz, answers, documentName: docName }
    setSessionResult(result)
    setPage('results')
  }

  function goHome(): void {
    setPage('home')
    setQuiz(null)
    setSessionResult(null)
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      {page === 'home' && (
        <Home onStartQuiz={startQuiz} onOpenSettings={() => setPage('settings')} />
      )}
      {page === 'quiz' && quiz && (
        <Quiz quiz={quiz} onFinish={finishQuiz} onAbort={goHome} />
      )}
      {page === 'results' && sessionResult && (
        <Results result={sessionResult} onHome={goHome} onRetry={() => {
          if (quiz) { setPage('quiz') }
        }} />
      )}
      {page === 'settings' && (
        <Settings onBack={goHome} />
      )}
    </div>
  )
}
