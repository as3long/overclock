/**
 * Renderer and Main bridge
 */
import fs from 'fs'
// import { EventEmitter } from 'events'
import { contextBridge, ipcRenderer } from 'electron'
import { getCurrentWindow } from '@electron/remote'
import is from 'electron-is'

contextBridge.exposeInMainWorld('fs', fs)
contextBridge.exposeInMainWorld('electron', {
    ipcRenderer,
    is,
    getCurrentWindow,
    'myapi': {
        on(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void): Electron.IpcRenderer {
            return ipcRenderer.on(channel, listener)
        },
        once(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void): Electron.IpcRenderer {
            return ipcRenderer.once(channel, listener)
        },
        removeAllListeners(channel: string): Electron.IpcRenderer {
            return ipcRenderer.removeAllListeners(channel)
        }
    },
    'currentWindow': {
        minimize() {
            getCurrentWindow().minimize()
        },
        unmaximize() {
            getCurrentWindow().unmaximize()
        },
        maximize() {
            getCurrentWindow().maximize()
        },
        isMaximized(): boolean {
            return getCurrentWindow().isMaximized()
        },
        close() {
            getCurrentWindow().close()
        }
    }
})
