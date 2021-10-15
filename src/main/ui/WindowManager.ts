import { join } from 'path'
import { EventEmitter } from 'events'
import { app, shell, screen, BrowserWindow } from 'electron'
import { enable, } from '@electron/remote/main'
import is from 'electron-is'
import pageConfig from '../configs/page'
import logger from '../core/Logger'
import { debounce, DebouncedFunc } from 'lodash'
import { __static } from '../configs/path'

const defaultBrowserOptions = {
  titleBarStyle: 'hiddenInset',
  show: false,
  width: 1024,
  height: 768,
  vibrancy: 'ultra-dark',
  visualEffectState: 'active',
  backgroundColor: '#FFF',
  webPreferences: {
    nodeIntegration: true,
  }
}

export default class WindowManager extends EventEmitter {
  userConfig: any
  windows: {}
  willQuit: boolean
  constructor (options = {}) {
    super()
    // @ts-ignore
    this.userConfig = options.userConfig || {}

    this.windows = {}

    this.willQuit = false

    this.handleBeforeQuit()

    this.handleAllWindowClosed()
  }

  setWillQuit (flag: boolean) {
    this.willQuit = flag
  }

  getPageOptions (page: string | number) {
    // @ts-ignore
    const result = pageConfig[page] || {}
    const hideAppMenu = this.userConfig['hide-app-menu']
    if (hideAppMenu) {
      result.attrs.frame = false
    }

    // Optimized for small screen users
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    const widthScale = width >= 1280 ? 1 : 0.875
    const heightScale = height >= 800 ? 1 : 0.875
    result.attrs.width *= widthScale
    result.attrs.height *= heightScale
    result.attrs.icon = join(__static, './overclock-32.png')

    logger.debug('getPageOptions', result)
    return result
  }

  getPageBounds (page: string) {
    const enabled = this.userConfig['keep-window-state']
    const windowStateMap = this.userConfig['window-state'] || {}
    let result = null
    if (enabled) {
      result = windowStateMap[page]
    }

    return result
  }

  openWindow (page: string, options = {}) {
    logger.debug('openWindow', page);
    const pageOptions = this.getPageOptions(page)
    // @ts-ignore
    const { hidden } = options
    const autoHideWindow = this.userConfig['auto-hide-window']
    // @ts-ignore
    let window:BrowserWindow = this.windows[page] || null
    if (window) {
      window.show()
      window.focus()
      return window
    }

    const preload = join(__dirname, '../preload/index.js')
    console.log('preload', preload)

    window = new BrowserWindow({
      ...defaultBrowserOptions,
      ...pageOptions.attrs,
      webPreferences: {
        nativeWindowOpen: true,
        enableRemoteModule: true,
        contextIsolation: true,
        nodeIntegration: true,
        nodeIntegrationInWorker: true,
        // webSecurity: false,
        preload,
      }
    })

    // 打开开发者工具
    // window.webContents.openDevTools()

    enable(window.webContents);

    const bounds = this.getPageBounds(page)
    if (bounds) {
      window.setBounds(bounds)
    }

    window.webContents.on('new-window', (e: { preventDefault: () => void }, url: string) => {
      e.preventDefault()
      shell.openExternal(url)
    })

    if (pageOptions.url) {
      window.loadURL(pageOptions.url)
    }

    window.once('ready-to-show', () => {
      if (!hidden) {
        window.show()
      }
    })

    window.on('enter-full-screen', () => {
      this.emit('enter-full-screen', window)
    })

    window.on('leave-full-screen', () => {
      this.emit('leave-full-screen', window)
    })

    this.handleWindowState(page, window)

    this.handleWindowClose(pageOptions, page, window)

    this.bindAfterClosed(page, window)

    this.addWindow(page, window)
    if (autoHideWindow) {
      this.handleWindowBlur()
    }
    return window
  }

  getWindow (page: string): BrowserWindow {
    // @ts-ignore
    return this.windows[page]
  }

  getWindows () {
    return this.windows || {}
  }

  getWindowList () {
    return Object.values(this.getWindows())
  }

  addWindow (page: string | number, window: any) {
    // @ts-ignore
    this.windows[page] = window
  }

  destroyWindow (page: string) {
    const win = this.getWindow(page)
    this.removeWindow(page)
    // @ts-ignore
    win.removeListener('closed')
    // @ts-ignore
    win.removeListener('move')
    // @ts-ignore
    win.removeListener('resize')
    win.destroy()
  }

  removeWindow (page: string) {
    // @ts-ignore
    this.windows[page] = null
  }

  bindAfterClosed (page: string, window: BrowserWindow) {
    window.on('closed', () => {
      this.removeWindow(page)
    })
  }

  handleWindowState (page: string | number, window: BrowserWindow) {
    window.on('resize', debounce(() => {
      const bounds = window.getBounds()
      this.emit('window-resized', { page, bounds })
    }, 500))

    window.on('move', debounce(() => {
      const bounds = window.getBounds()
      this.emit('window-moved', { page, bounds })
    }, 500))
  }

  handleWindowClose (pageOptions: { bindCloseToHide: any }, page: string | number, window: BrowserWindow) {
    window.on('close', (event) => {
      if (pageOptions.bindCloseToHide && !this.willQuit) {
        event.preventDefault()

        // @see https://github.com/electron/electron/issues/20263
        if (window.isFullScreen()) {
          window.once('leave-full-screen', () => window.hide())

          window.setFullScreen(false)
        } else {
          window.hide()
        }
      }
      const bounds = window.getBounds()
      this.emit('window-closed', { page, bounds })
    })
  }

  showWindow (page: string) {
    const window = this.getWindow(page)
    if (!window || (window.isVisible() && !window.isMinimized())) {
      return
    }

    window.show()
  }

  hideWindow (page: string) {
    const window = this.getWindow(page)
    if (!window || !window.isVisible()) {
      return
    }
    window.hide()
  }

  hideAllWindow () {
    this.getWindowList().forEach((window: any) => {
      window.hide()
    })
  }

  toggleWindow (page: string) {
    const window = this.getWindow(page)
    if (!window) {
      return
    }

    if (!window.isVisible() || window.isFullScreen()) {
      window.show()
    } else {
      window.hide()
    }
  }

  getFocusedWindow () {
    return BrowserWindow.getFocusedWindow()
  }

  handleBeforeQuit () {
    app.on('before-quit', () => {
      this.setWillQuit(true)
    })
  }

  onWindowBlur (_event: any, window: BrowserWindow) {
    window.hide()
  }

  handleWindowBlur () {
    app.on('browser-window-blur', this.onWindowBlur)
  }

  unbindWindowBlur () {
    app.removeListener('browser-window-blur', this.onWindowBlur)
  }

  handleAllWindowClosed () {
    app.on('window-all-closed', (event: Event) => {
      event.preventDefault()
    })
  }

  sendCommandTo (window: Electron.BrowserWindow, command: string | symbol, ...args: { focused?: any; theme?: any; configName?: any }[]) {
    if (!window) {
      return
    }
    logger.info('[OverClock] send command to:', command, ...args)
    window.webContents.send('command', command, ...args)
  }

  sendMessageTo (window: { webContents: { send: (arg0: any, arg1: any) => void } }, channel: any, ...args: any[]) {
    if (!window) {
      return
    }
    // @ts-ignore
    window.webContents.send(channel, ...args)
  }
}
