import * as events  from 'events'
import * as path from 'path'
import { dialog } from 'electron'
import * as is from 'electron-is'
import { autoUpdater } from 'electron-updater'

import logger from './Logger'

if (is.dev()) {
  autoUpdater.updateConfigPath = path.resolve(__dirname, '../../../app-update.yml')
}

export default class UpdateManager extends events.EventEmitter {
  options: {}
  i18n: any
  isChecking: boolean
  updater: any
  autoCheckData: { checkEnable: any; userCheck: boolean }
  constructor (options = {}) {
    super()
    this.options = options

    this.isChecking = false
    this.updater = autoUpdater
    this.updater.autoDownload = false
    this.updater.autoInstallOnAppQuit = false
    this.updater.logger = logger
    this.autoCheckData = {
      // @ts-ignore
      checkEnable: this.options.autoCheck,
      userCheck: false
    }
    this.init()
  }

  init () {
    // Event: error
    // Event: checking-for-update
    // Event: update-available
    // Event: update-not-available
    // Event: download-progress
    // Event: update-downloaded

    this.updater.on('checking-for-update', this.checkingForUpdate.bind(this))
    this.updater.on('update-available', this.updateAvailable.bind(this))
    this.updater.on('update-not-available', this.updateNotAvailable.bind(this))
    this.updater.on('download-progress', this.updateDownloadProgress.bind(this))
    this.updater.on('update-downloaded', this.updateDownloaded.bind(this))
    this.updater.on('update-cancelled', this.updateCancelled.bind(this))
    this.updater.on('error', this.updateError.bind(this))

    if (this.autoCheckData.checkEnable && !this.isChecking) {
      this.autoCheckData.userCheck = false
      this.updater.checkForUpdates()
    }
  }

  check () {
    this.autoCheckData.userCheck = true
    this.updater.checkForUpdates()
  }

  checkingForUpdate () {
    this.isChecking = true
    this.emit('checking')
  }

  updateAvailable (_event: any, info: any) {
    this.emit('update-available', info)
    dialog.showMessageBox({
      type: 'info',
      title: this.i18n.t('app.check-for-updates-title'),
      message: this.i18n.t('app.update-available-message'),
      buttons: [this.i18n.t('app.yes'), this.i18n.t('app.no')],
      cancelId: 1
    }).then(({ response }) => {
      if (response === 0) {
        this.updater.downloadUpdate()
      }
    })
  }

  updateNotAvailable (_event: any, info: any) {
    this.isChecking = false
    this.emit('update-not-available', info)
    if (this.autoCheckData.userCheck) {
      dialog.showMessageBox({
        title: this.i18n.t('app.check-for-updates-title'),
        message: this.i18n.t('app.update-not-available-message')
      })
    }
  }

  /**
   * autoUpdater:download-progress
   * @param {Object} event
   * progress,
   * bytesPerSecond,
   * percent,
   * total,
   * transferred
   */
  updateDownloadProgress (event: any) {
    this.emit('download-progress', event)
  }

  updateDownloaded (_event: any, info: any) {
    this.emit('update-downloaded', info)
    this.updater.logger.log(`Update Downloaded: ${info}`)
    dialog.showMessageBox({
      title: this.i18n.t('app.check-for-updates-title'),
      message: this.i18n.t('app.update-downloaded-message')
    }).then(_ => {
      this.isChecking = false
      this.emit('will-updated')
      setTimeout(() => {
        this.updater.quitAndInstall()
      }, 200)
    })
  }

  updateCancelled () {
    this.isChecking = false
  }

  updateError (_event: any, error: { stack: any } | null) {
    this.isChecking = false
    this.emit('update-error', error)
    const msg = (error == null)
      ? this.i18n.t('app.update-error-message')
      : (error.stack || error).toString()

    this.updater.logger.warn(`[OverClock] update-error: ${msg}`)
    dialog.showErrorBox('Error', msg)
  }
}
