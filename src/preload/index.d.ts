import { ElectronAPI } from '@electron-toolkit/preload'
import type { Quiz } from '../main/ai'

interface Session {
  id: string
  date: string
  documentName: string
  score: number
  total: number
  answers: number[]
  quiz: Quiz
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      pickDocument: () => Promise<string | null>
      generateQuiz: (filePath: string, questionCount: number) => Promise<Quiz>
      saveSession: (session: Session) => Promise<boolean>
      getSessions: () => Promise<Session[]>
      getApiKey: () => Promise<string>
      setApiKey: (key: string) => Promise<boolean>
    }
  }
}
