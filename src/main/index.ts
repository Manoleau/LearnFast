import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { readFileSync } from 'fs'
import { generateQuiz } from './ai'
import Store from 'electron-store'

const store = new Store()

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0f0f13',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.learnfast')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC: pick document file
  ipcMain.handle('pick-document', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Choisir un document',
      filters: [
        { name: 'Documents', extensions: ['pdf', 'png', 'jpg', 'jpeg', 'webp'] }
      ],
      properties: ['openFile']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  // IPC: generate quiz from file path
  ipcMain.handle('generate-quiz', async (_event, filePath: string, questionCount: number) => {
    const fileBuffer = readFileSync(filePath)
    const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
    return generateQuiz(fileBuffer, ext, questionCount)
  })

  // IPC: store quiz session results
  ipcMain.handle('save-session', (_event, session: unknown) => {
    const sessions = (store.get('sessions', []) as unknown[])
    sessions.push(session)
    store.set('sessions', sessions)
    return true
  })

  // IPC: get all stored sessions
  ipcMain.handle('get-sessions', () => {
    return store.get('sessions', [])
  })

  // IPC: get/set API key
  ipcMain.handle('get-api-key', () => store.get('apiKey', ''))
  ipcMain.handle('set-api-key', (_event, key: string) => {
    store.set('apiKey', key)
    return true
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
