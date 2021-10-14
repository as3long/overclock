import { app, dialog } from 'electron'
import * as is from 'electron-is'

import logger from './Logger'

const defaults = {
  showDialog: !is.dev()
}
export default class ExceptionHandler {
  options: object;
  constructor (options: object = {}) {
    this.options = {
      ...defaults,
      ...options
    }

    this.setup()
  }

  setup () {
    if (is.dev()) {
      return
    }
    // const { showDialog } = this.options
    process.on('uncaughtException', (err) => {
      const { message, stack } = err
      logger.error(`[OverClock] Uncaught exception: ${message}`)
      logger.error(stack)

      // if (showDialog && app.isReady()) {
      //   dialog.showErrorBox('Error: ', message)
      // }
    })
  }
}
