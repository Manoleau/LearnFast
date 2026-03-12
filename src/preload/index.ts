import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  pickDocument: (): Promise<string | null> =>
    ipcRenderer.invoke('pick-document'),

  generateQuiz: (filePath: string, questionCount: number) =>
    ipcRenderer.invoke('generate-quiz', filePath, questionCount),

  saveSession: (session: unknown) =>
    ipcRenderer.invoke('save-session', session),

  getSessions: () =>
    ipcRenderer.invoke('get-sessions'),

  getApiKey: (): Promise<string> =>
    ipcRenderer.invoke('get-api-key'),

  setApiKey: (key: string): Promise<boolean> =>
    ipcRenderer.invoke('set-api-key', key)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
