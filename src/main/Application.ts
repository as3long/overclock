import { EventEmitter } from 'events'
import { app, shell, dialog, ipcMain } from 'electron'
import is from 'electron-is'
import { readFile, unlink } from 'fs'
import { isEmpty } from 'lodash'

import logger from './core/Logger'
import ConfigManager from './core/ConfigManager'
import AutoLaunchManager from './core/AutoLaunchManager'
import UpdateManager from './core/UpdateManager'
import WindowManager from './ui/WindowManager'
import TrayManager from './ui/TrayManager'
import OverClock from './core/OverClock'
import DeviceDetection from './core/DeviceDetection'
import { getSessionPath } from './utils'



export default class Application extends EventEmitter {
  configManager: ConfigManager | undefined
  isReady: boolean = false
  locale: string = ''
  i18n: any
  autoLaunchManager: AutoLaunchManager | undefined
  configListeners: {[key:string]: any} = {}
  trayManager: TrayManager | undefined
  windowManager: WindowManager | undefined
  updateManager: UpdateManager | undefined
  overclock: OverClock | undefined
  deviceDetection: DeviceDetection | undefined
  constructor () {
    super()
    this.init()
  }

  init () {
    this.configManager = this.initConfigManager()

    this.initWindowManager()

    this.initTrayManager()

    this.autoLaunchManager = new AutoLaunchManager()

    this.initUpdaterManager()
    this.initOverClock()
    this.initDeviceDetection()

    this.handleCommands()

    this.handleEvents()

    this.handleIpcMessages()

    this.handleIpcInvokes()


    this.emit('application:initialized')
  }

  initConfigManager () {
    return new ConfigManager()
  }

  offConfigListeners () {
    try {
      Object.keys(this.configListeners).forEach((key) => {
        this.configListeners[key]()
      })
    } catch (e) {
      logger.warn('[OverClock] offConfigListeners===>', e)
    }
    this.configListeners = {}
  }


  initTrayManager () {
    this.trayManager = new TrayManager({
      theme: this.configManager?.getUserConfig('tray-theme'),
    })

    this.trayManager.on('mouse-down', ({ focused }) => {
      this.sendCommandToAll('application:update-tray-focused', { focused })
    })

    this.trayManager.on('mouse-up', ({ focused }) => {
      this.sendCommandToAll('application:update-tray-focused', { focused })
    })
  }

  initWindowManager () {
    this.windowManager = new WindowManager({
      userConfig: this.configManager?.getUserConfig()
    })

    this.windowManager.on('window-resized', (data: {} | undefined) => {
      this.storeWindowState(data)
    })

    this.windowManager.on('window-moved', (data: {} | undefined) => {
      this.storeWindowState(data)
    })

    this.windowManager.on('window-closed', (data: {} | undefined) => {
      this.storeWindowState(data)
    })
  }

  storeWindowState (data = {}) {
    const enabled = this.configManager?.getUserConfig('keep-window-state')
    if (!enabled) {
      return
    }

    const state = this.configManager?.getUserConfig('window-state', {})
    // @ts-ignore
    const { page, bounds } = data
    const newState = {
      ...state,
      [page]: bounds
    }
    this.configManager?.setUserConfig('window-state', newState)
  }

  start (page: any, options = {}) {
    const win = this.showPage(page, options)

    win.once('ready-to-show', () => {
      this.isReady = true
      this.emit('ready')
    })
  }

  showPage (page: any, options = {}) {
    // @ts-ignore
    const { openedAtLogin } = options
    const autoHideWindow = this.configManager?.getUserConfig('auto-hide-window')
    return this.windowManager?.openWindow(page, {
      hidden: openedAtLogin || autoHideWindow
    })
  }

  show (page = 'index') {
    this.windowManager?.showWindow(page)
  }

  hide (page: any) {
    if (page) {
      this.windowManager?.hideWindow(page)
    } else {
      this.windowManager?.hideAllWindow()
    }
  }

  toggle (page = 'index') {
    this.windowManager?.toggleWindow(page)
  }

  closePage (page: any) {
    this.windowManager?.destroyWindow(page)
  }

  async stop () {
    try {
      this.trayManager?.destroy()
    } catch (err: any) {
      logger.warn('[OverClock] stop error: ', err.message)
    }
  }

  async quit () {
    await this.stop()
    app.exit()
  }

  sendCommand (command: string | symbol, ...args: any[]) {
    if (!this.emit(command, ...args)) {
      const window = this.windowManager?.getFocusedWindow()
      if (window) {
        this.windowManager?.sendCommandTo(window, command, ...args)
      }
    }
  }

  sendCommandToAll (command: string | symbol, ...args: any) {
    if (!this.emit(command, ...args)) {
      this.windowManager?.getWindowList().forEach((window: any) => {
        this.windowManager?.sendCommandTo(window, command, ...args)
      })
    }
  }

  sendMessageToAll (channel: any, ...args: any[]) {
    this.windowManager?.getWindowList().forEach((window: any) => {
      this.windowManager?.sendMessageTo(window, channel, ...args)
    })
  }

  initUpdaterManager () {
    if (is.mas()) {
      return
    }

    const enabled = this.configManager?.getUserConfig('auto-check-update')
    const lastTime = this.configManager?.getUserConfig('last-check-update-time')
    this.handleUpdaterEvents()
  }

  handleUpdaterEvents () {
    this.updateManager?.on('checking', () => {
      this.trayManager?.updateMenuItemEnabledState('app.check-for-updates', false)
      this.configManager?.setUserConfig('last-check-update-time', Date.now())
    })

    this.updateManager?.on('update-not-available', () => {
      this.trayManager?.updateMenuItemEnabledState('app.check-for-updates', true)
    })

    this.updateManager?.on('will-updated', async () => {
      this.windowManager?.setWillQuit(true)
      await this.stop()
    })

    this.updateManager?.on('update-error', () => {
      this.trayManager?.updateMenuItemEnabledState('app.check-for-updates', true)
    })
  }

  async relaunch () {
    await this.stop()
    app.relaunch()
    app.exit()
  }

  async resetSession () {

    app.clearRecentDocuments()

    const sessionPath = this.configManager?.getUserConfig('session-path') || getSessionPath()
    setTimeout(() => {
      unlink(sessionPath, function (err) {
        logger.info('[OverClock] Removed the download seesion file:', err)
      })
    }, 3000)
  }

  savePreference (config = {}) {
    logger.info('[OverClock] save preference:', config)
    // @ts-ignore
    const { system, user } = config
    if (!isEmpty(system)) {
      console.info('[OverClock] main save system config: ', system)
      this.configManager?.setSystemConfig(system)
    }

    if (!isEmpty(user)) {
      console.info('[OverClock] main save user config: ', user)
      this.configManager?.setUserConfig(user)
    }
  }

  initOverClock() {
    this.overclock = new OverClock()
  }

  initDeviceDetection() {
    this.deviceDetection = new DeviceDetection()
  }

  handleCommands () {

    this.on('application:relaunch', () => {
      this.relaunch()
    })

    this.on('application:quit', () => {
      this.quit()
    })

    this.on('application:open-at-login', async (openAtLogin) => {
      if (openAtLogin) {
        this.autoLaunchManager?.enable()
      } else {
        this.autoLaunchManager?.disable()
      }

      const isEnable = await this.autoLaunchManager?.isEnabled()
      this.sendCommandToAll('application:ret-get-open-at-login', isEnable)
    })

    this.on('application:get-open-at-login', async () => {
      const isEnable = await this.autoLaunchManager?.isEnabled()
      this.sendCommandToAll('application:ret-get-open-at-login', isEnable)
    })

    this.on('application:show', ({ page }) => {
      this.show(page)
    })

    this.on('application:hide', ({ page }) => {
      this.hide(page)
    })

    this.on('application:reset-session', () => this.resetSession())

    this.on('application:reset', () => {
      this.offConfigListeners()
      this.configManager?.reset()
      this.relaunch()
    })

    this.on('application:check-for-updates', () => {
      this.updateManager?.check()
    })

    this.on('application:auto-hide-window', (hide) => {
      if (hide) {
        this.windowManager?.handleWindowBlur()
      } else {
        this.windowManager?.unbindWindowBlur()
      }
    })

    this.on('application:open-external', (url) => {
      this.openExternal(url)
    })

    this.on('deviceDetection:get-devices', async () => {
      const devices = await this.deviceDetection.getCUDA();
      const memObj = await this.overclock.getMemInfo(devices.CudaDevices)
      devices.CudaDevices.forEach((o, idx) => {
        devices.CudaDevices[idx].memMaker = memObj[o.pciBusID].memMaker
        devices.CudaDevices[idx].memType = memObj[o.pciBusID].memType
      })
      this.sendCommandToAll('deviceDetection:update-devices', devices.CudaDevices)
    })

    this.on('overclock:set', params => {
      logger.log('overclock:set', params)
      this.overclock.set(params)
    })
  }

  openExternal (url: string) {
    if (!url) {
      return
    }

    shell.openExternal(url)
  }

  handleConfigChange (configName: any) {
    this.sendCommandToAll('application:update-preference-config', { configName })
  }

  handleEvents () {
    this.once('application:initialized', () => {
      // this.adjustMenu()
    })

    // this.configManager.userConfig.onDidAnyChange(() => this.handleConfigChange('user'))
    // this.configManager.systemConfig.onDidAnyChange(() => this.handleConfigChange('system'))
  }

  handleIpcMessages () {
    ipcMain.on('command', (event, command, ...args) => {
      logger.log('[OverClock] ipc receive command', command, ...args)
      this.emit(command, ...args)
    })

    ipcMain.on('event', (event, eventName, ...args) => {
      logger.log('[OverClock] ipc receive event', eventName, ...args)
      this.emit(eventName, ...args)
    })
  }

  handleIpcInvokes () {
    ipcMain.handle('get-app-config', async () => {
      const systemConfig = this.configManager?.getSystemConfig()
      const userConfig = this.configManager?.getUserConfig()

      const result = {
        ...systemConfig,
        ...userConfig
      }
      return result
    })
  }
}
